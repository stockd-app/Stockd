import datetime
import os
import time
import traceback
from dotenv import load_dotenv
from fastapi import (
    APIRouter,
    BackgroundTasks,
    File,
    UploadFile,
    HTTPException,
    Request,
    Depends,
)
from google.oauth2 import id_token
from google.auth.transport import requests as google_requests
from google.auth.exceptions import InvalidValue
from pymysql import IntegrityError
from sqlalchemy.exc import SQLAlchemyError
from app.utils.normalize_food_name import normalize_food_name
from app.utils.resolve_food_images import fetch_food_images
from app.dependencies.limiter import limiter
from app.utils.crypto import hash_email
import httpx
from fastapi import APIRouter, HTTPException
from app.asprise_api import send_receipt_to_asprise
from app.utils.receipt_parser import parse_asprise_response
from app.utils.ai_classifier import classify_receipt_items
from app.utils.openfoodfacts import get_product_image_from_openfoodfacts
from app.dependencies.auth import require_google_token
from app.database.database import SessionLocal
from app.database.models import (
    LikedRecipe, PantryItemsDeleteRequest,
    PantryItemsRequest,
    Recipe,
    RefreshTokenRequest,
    User,
    PantryItem,
    UserAllergensRequest,
)
from app.utils.ai_recommender import get_recipe_recommendations
from app.utils.sanitizer import sanitize_text, sanitize_quantity, sanitize_url, sanitize_google_url

load_dotenv()

GOOGLE_CLIENT_ID = os.getenv("GOOGLE_CLIENT_ID")
GOOGLE_CLIENT_SECRET = os.getenv("GOOGLE_CLIENT_SECRET")
GOOGLE_CLIENT_URI = os.getenv("GOOGLE_TOKEN_URI")
GOOGLE_REVOKE_CLIENT_URI = os.getenv("GOOGLE_REVOKE_TOKEN_URI")

router = APIRouter()
AI_SERVER_URL_RECIPE_RECOMMENDER = os.getenv("RECIPE_RECOMMENDER_MODEL_URL")


@router.post("/upload-receipt", tags=["OCR"])
@limiter.limit("5/minute")
async def upload_receipt(
    request: Request,
    background_tasks: BackgroundTasks,
    file: UploadFile = File(...),
    user=Depends(require_google_token),
):
    """
    Upload an image of a receipt and:
    1. Send it to Asprise OCR API
    2. Classify items using the AI model
    3. Store items in the database
    4. Return the processed items to frontend
    5. Start background task to fetch images from OpenFoodFacts
    """
    db = SessionLocal()
    try:
        print("Recieved receipt image: ", time.strftime("%Y-%m-%d %H:%M:%S"))
        image_bytes = await file.read()

        # Send to Asprise API and parse the response
        asprise_data = send_receipt_to_asprise(
            image_bytes, file.filename or "receipt.jpg"
        )
        print("Received asprise data: ", time.strftime("%Y-%m-%d %H:%M:%S"))
        parsed = parse_asprise_response(asprise_data)
        print("Parsed receipt data: ", time.strftime("%Y-%m-%d %H:%M:%S"))
        if not parsed["items"]:
            return {
                "status": "success",
                "message": "No items detected on receipt",
                "grouped_items": {},
                "total_items": 0,
            }

        print("Sending items to AI classifier: ", time.strftime("%Y-%m-%d %H:%M:%S"))
        # Call AI model to classify items
        ai_data = classify_receipt_items(parsed)

        classified_results = ai_data.get("results", {})
        print("Received classified results: ", time.strftime("%Y-%m-%d %H:%M:%S"))
        processed_items = []
        
        for raw_item_name, item_data in classified_results.items():
            if not item_data.get("is_food", False):
                continue
            # Sanitize inputs
            item_name = sanitize_text(raw_item_name)
            quantity = sanitize_quantity(item_data.get("quantity", 1))
            category = sanitize_text(item_data.get("category", "Uncategorized"))
            storage = sanitize_text(item_data.get("storage", "Pantry"))
            normalized = normalize_food_name(item_name)
            
            # Check if item already exists for this user
            existing_item = (
                db.query(PantryItem)
                .filter(PantryItem.user_id == user.id)
                .filter(PantryItem.normalized_name == normalized)
                .first()
            )

            if existing_item:
                # Update existing item - add to quantity
                existing_item.quantity_value += quantity
                existing_item.category = category
                existing_item.storage = storage
                existing_item.added_on = datetime.datetime.utcnow()
                db.flush()

                processed_items.append(
                    {
                        "id": existing_item.id,
                        "name": existing_item.item_name,
                        "qty": f"x{int(existing_item.quantity_value)}",
                        "image": existing_item.item_image or "",
                        "category": existing_item.category,
                        "storage": existing_item.storage,
                    }
                )
            else:
                # Add new item
                new_item = PantryItem(
                    user_id=user.id,
                    item_name=item_name,
                    normalized_name=normalized,
                    quantity_value=quantity,
                    quantity_unit="pcs",
                    category=category,
                    storage=storage,
                    item_image=None,
                    added_on=datetime.datetime.utcnow(),
                )
                db.add(new_item)
                db.flush()

                processed_items.append(
                    {
                        "id": new_item.id,
                        "name": new_item.item_name,
                        "qty": f"x{int(new_item.quantity_value)}",
                        "image": new_item.item_image or "",
                        "category": new_item.category,
                        "storage": new_item.storage,
                    }
                )
        print("Processed all items: ", time.strftime("%Y-%m-%d %H:%M:%S"))
        db.commit()

        # Group items by storage for frontend
        grouped_items = {}
        for item in processed_items:
            storage = item["storage"]
            if storage not in grouped_items:
                grouped_items[storage] = []
            grouped_items[storage].append(
                {
                    "id": item["id"],
                    "name": item["name"],
                    "qty": item["qty"],
                    "image": item["image"],
                }
            )

        print(
            "Background task to resolve images started: ",
            time.strftime("%Y-%m-%d %H:%M:%S"),
        )
        # Background task to fetch images from OpenFoodFacts
        background_tasks.add_task(fetch_food_images, user.id)
        print("End of /upload-receipt: ", time.strftime("%Y-%m-%d %H:%M:%S"))
        return {
            "status": "success",
        }

    except HTTPException:
        db.rollback()
        raise
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=str(e))
    finally:
        db.close()

@router.post("/auth/refresh")
async def refresh_google_token(request: RefreshTokenRequest):
    """
    Refresh Google OAuth token using a provided refresh token
    """
    try:
        token_url = GOOGLE_CLIENT_URI
        refresh_token = request.refresh_token
        payload = {
            "client_id": GOOGLE_CLIENT_ID,
            "client_secret": GOOGLE_CLIENT_SECRET,
            "refresh_token": refresh_token,
            "grant_type": "refresh_token",
        }

        response = httpx.post(url=token_url, data=payload)
        new_token_data = response.json()

        if "access_token" in new_token_data:
            return new_token_data
        else:
            raise HTTPException(status_code=400, detail="Token refresh failed")
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error refreshing token: {str(e)}")

@router.post("/auth/google", tags=["Google OAuth"])
@limiter.limit("10/minute")
async def verify_google_token(request: Request):
    """
    - Exchanges temporary auth code for Google ID token
    - Verifies ID token authenticity and audience
    - Safely inserts user into DB if new
    - Handles clock-skew errors (Token used too early)
    - Returns detailed, frontend-friendly error responses
    - Possible errors:
    - 400 - Bad Request
    - 401 - Unauthorized
    - 500 - Internal server error
    - 503 - Unable to handle request
    """
    db = SessionLocal()
    try:
        # 1. Validate incoming request
        try:
            data = await request.json()
        except Exception:
            raise HTTPException(
                status_code=400,
                detail={"error_code": "INVALID_JSON", "message": "Invalid JSON body"},
            )

        auth_code = data.get("token")
        if not auth_code:
            raise HTTPException(
                status_code=400,
                detail={
                    "error_code": "MISSING_AUTH_CODE",
                    "message": "Missing Google authorization code",
                },
            )

        # 2. Exchange the authorisation code for Google ID token
        try:
            token_url = GOOGLE_CLIENT_URI
            payload = {
                "client_id": GOOGLE_CLIENT_ID,
                "client_secret": GOOGLE_CLIENT_SECRET,
                "code": auth_code,
                "grant_type": "authorization_code",
                "redirect_uri": "postmessage",
            }

            # Send the temporary auth code to Google token endpoint
            # to check if the auth code is designated for our app +
            # user verification
            token_response = httpx.post(url=token_url, data=payload)
        except Exception as e:
            raise HTTPException(
                status_code=503,
                detail={
                    "error_code": "GOOGLE_TOKEN_ENDPOINT_UNREACHABLE",
                    "message": "Failed to reach Google token endpoint",
                },
            )

        if token_response.status_code != 200:
            raise HTTPException(
                status_code=401,
                detail={
                    "error_code": "GOOGLE_TOKEN_EXCHANGE_FAILED",
                    "message": f"Google token exchange failed: {token_response.text}",
                },
            )

        try:
            token_data = token_response.json()
        except Exception:
            raise HTTPException(
                status_code=500,
                detail={
                    "error_code": "INVALID_GOOGLE_RESPONSE",
                    "message": "Invalid response from Google token endpoint",
                },
            )

        if "id_token" not in token_data:
            raise HTTPException(
                status_code=400,
                detail={
                    "error_code": "NO_ID_TOKEN_FROM_GOOGLE",
                    "message": "Google did not return an ID token during exchange",
                },
            )

        # 3. Verify the ID token
        try:
            idinfo = id_token.verify_oauth2_token(
                token_data["id_token"], google_requests.Request(), GOOGLE_CLIENT_ID
            )
        except InvalidValue as e:
            # Clock-skew safety
            if "Token used too early" in str(e):
                # Wait 2 second and retry — Google's token clock skew safety
                time.sleep(2)
                try:
                    idinfo = id_token.verify_oauth2_token(
                        token_data["id_token"],
                        google_requests.Request(),
                        GOOGLE_CLIENT_ID,
                    )
                except Exception:
                    raise HTTPException(
                        status_code=401,
                        detail={
                            "error_code": "TOKEN_USED_TOO_EARLY",
                            "message": "Google ID token was used too early and is still invalid",
                        },
                    )
            else:
                raise HTTPException(
                    status_code=401,
                    detail={
                        "error_code": "INVALID_GOOGLE_ID_TOKEN",
                        "message": "Invalid Google ID Token",
                    },
                )
        except Exception:
            raise HTTPException(
                status_code=401,
                detail={
                    "error_code": "ID_TOKEN_VERIFICATION_FAILED",
                    "message": "Google ID token verification failed",
                },
            )

        # Extract user info
        user_info = {
            "email": idinfo.get("email"),
            "name": idinfo.get("name"),
            "picture": idinfo.get("picture"),
            "client_id": idinfo.get("sub"),
        }

        user_info["name"] = sanitize_text(user_info.get("name", ""))
        user_info["picture"] = sanitize_google_url(user_info.get("picture", ""))

        if not user_info["email"]:
            raise HTTPException(
                status_code=400,
                detail={
                    "error_code": "EMAIL_NOT_FOUND",
                    "message": "Google account email missing from ID token",
                },
            )

        # 4. Save or update user in DB
        try:
            existing_user = (
                db.query(User)
                .filter(User.email_hash == hash_email(user_info["email"]))
                .first()
            )

            if not existing_user:
                new_user = User(
                    email=user_info["email"],
                    email_hash=hash_email(user_info["email"]),
                    name=user_info["name"],
                    picture=user_info["picture"],
                    client_id=idinfo.get("sub"),
                    role="user",
                )
                db.add(new_user)
                db.commit()
                db.refresh(new_user)

        except SQLAlchemyError as e:
            db.rollback()
            raise HTTPException(
                status_code=500,
                detail={
                    "error_code": "DATABASE_ERROR",
                    "message": f"Database error: {str(e)}",
                },
            )

        # 5. Return success response
        db_user = existing_user if existing_user else new_user
        return {
            "status": "success",
            "user": {
                "id": db_user.id,
                "email": user_info["email"],
                "name": user_info["name"],
                "picture": user_info["picture"],
            },
            "id_token": token_data.get("id_token"),
            "access_token": token_data.get("access_token"),
            "refresh_token": token_data.get("refresh_token"),
        }

    # Top-level exception handling for safe & clear responses
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail={
                "error_code": "OAUTH_EXCHANGE_FAILED",
                "message": f"OAuth exchange failed: {str(e)}",
            },
        )
    finally:
        db.close()


@router.post("/auth/google/logout", tags=["Google OAuth"])
@limiter.limit("10/minute")
async def google_logout(request: Request, user=Depends(require_google_token)):
    """
    Logs out a Google-authenticated user.
    - Validate JSON body
    - Extract access_token
    - Attempt to revoke the access token via Google OAuth API
    - Return frontend-friendly error codes
    - Possible errors:
    - 400 - Bad Request
    - 401 - Unauthorized
    - 500 - Internal server error
    - 503 - Unable to handle request
    """

    # 1. Parse and validate JSON
    try:
        data = await request.json()
    except Exception:
        raise HTTPException(
            status_code=400,
            detail={"error_code": "INVALID_JSON", "message": "Invalid JSON body"},
        )

    access_token = data.get("access_token")

    if not access_token:
        raise HTTPException(
            status_code=400,
            detail={
                "error_code": "MISSING_ACCESS_TOKEN",
                "message": "Missing Google access token for logout",
            },
        )

    # 2. Attempt Google OAuth token revocation
    revoke_url = GOOGLE_REVOKE_CLIENT_URI
    params = {"token": access_token}

    try:
        revoke_response = httpx.post(
            revoke_url,
            params=params,
            headers={"Content-Type": "application/x-www-form-urlencoded"},
            timeout=5,
        )
    except Exception:
        raise HTTPException(
            status_code=503,
            detail={
                "error_code": "GOOGLE_REVOKE_ENDPOINT_UNREACHABLE",
                "message": "Failed to reach Google revoke endpoint",
            },
        )

    # Google returns HTTP 200 on success, anything else is failure
    if revoke_response.status_code != 200:
        raise HTTPException(
            status_code=401,
            detail={
                "error_code": "GOOGLE_TOKEN_REVOKE_FAILED",
                "message": f"Google token revoke failed: {revoke_response.text}",
            },
        )

    # 3. Successfully logged out
    return {"status": "success", "message": "Google user logged out successfully"}


@router.delete("/delete_user/{user_id}", tags=["Users"])
@limiter.limit("10/minute")
async def delete_user(
    request: Request, user_id: int, user=Depends(require_google_token)
):
    """
    Delete a user by ID
    Deletes user from Users table and PantryItems table
    """

    db = SessionLocal()

    try:
        # Look up the user
        delete_user = db.query(User).filter(User.id == user_id).first()

        if not delete_user:
            raise HTTPException(status_code=404, detail="User not found")

        db.delete(delete_user)
        db.commit()

        return {"status": "success", "message": f"User {user_id} deleted successfully"}

    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=f"Failed to delete user: {str(e)}")

    finally:
        db.close()


@router.get("/pantry_items/{user_id}", tags=["Pantry"])
async def get_pantry_items(user_id: int, user=Depends(require_google_token)):
    """
    Get all pantry items for a specific user, grouped by storage location.
    """
    db = SessionLocal()
    try:
        db_user = db.query(User).filter(User.id == user_id).first()
        if not db_user:
            raise HTTPException(status_code=404, detail="User not found")

        items = db.query(PantryItem).filter(PantryItem.user_id == user_id).all()

        # Group items by storage
        grouped_items = {}
        for item in items:
            storage = item.storage or "Pantry"
            if storage not in grouped_items:
                grouped_items[storage] = []

            grouped_items[storage].append(
                {
                    "id": item.id,
                    "name": item.item_name,
                    "qty": f"x{int(item.quantity_value)}",
                    "unit": item.quantity_unit or "pcs",
                    "image": item.item_image or "",
                    "category": item.category or "Uncategorized",
                    "storage": item.storage or "Pantry",
                    "added_on": item.added_on,
                }
            )

        return {
            "status": "success",
            "grouped_items": grouped_items,
            "total_items": len(items),
        }

    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
    finally:
        db.close()


@router.post("/add_update_pantry_items", tags=["Pantry"])
@limiter.limit("10/minute")
async def add_update_pantry_items(
    request: Request,
    request_data: PantryItemsRequest,
    user=Depends(require_google_token),
):
    """
    Add or update pantry items in the database for a specific user.

    Expects JSON like:
    ```
    {
        "user_id": 1,
        "items": [
            {
                "item_name": "Milk",
                "quantity_value": 2,
                "quantity_unit": "L",
                "category": "Dairy",
                "storage": "Fridge"
                "item_image": "http://example.com/milk.jpg"
            },
            ...
        ]
    }
    ```
    If an item with the same `item_name` already exists for the user, it will be updated.
    """
    db = SessionLocal()
    try:
        user = db.query(User).filter(User.id == request_data.user_id).first()
        if not user:
            raise HTTPException(status_code=404, detail="User not found")

        processed_items = []
        for item in request_data.items:
            # Replace blanks or None with default values
            item_name = sanitize_text(item.item_name) if item.item_name else "Unnamed Item"
            quantity_value = (
                sanitize_quantity(item.quantity_value)
            )
            quantity_unit = sanitize_text(item.quantity_unit) if item.quantity_unit else "pcs"
            category = sanitize_text(item.category) if item.category else "Uncategorized"
            storage = sanitize_text(item.storage) if item.storage else "Pantry"
            item_image = sanitize_url(item.item_image)

            # Check if item already exists for this user
            existing_item = None
            if item.id is not None:
                existing_item = (
                    db.query(PantryItem)
                    .filter(PantryItem.id == item.id)
                    .filter(PantryItem.user_id == request_data.user_id)
                    .first()
                )

            if existing_item:
                # Update existing item
                existing_item.item_name = item_name
                existing_item.quantity_value = quantity_value
                existing_item.quantity_unit = quantity_unit
                existing_item.category = category
                existing_item.storage = storage
                existing_item.item_image = item_image
                processed_items.append(existing_item)
            else:
                # Add new item
                new_item = PantryItem(
                    user_id=request_data.user_id,
                    item_name=item_name,
                    quantity_value=quantity_value,
                    quantity_unit=quantity_unit,
                    category=category,
                    storage=storage,
                    item_image=item_image,
                    added_on=datetime.datetime.utcnow(),
                )
                db.add(new_item)
                processed_items.append(new_item)

        db.commit()

        return {
            "status": "success",
            "processed_items": len(processed_items),
            "items": [item.item_name for item in processed_items],
        }

    except IntegrityError as ie:
        db.rollback()
        print("IntegrityError traceback:", traceback.format_exc())
        raise HTTPException(
            status_code=400, detail=f"Database integrity error: {str(ie.orig)}"
        )

    except SQLAlchemyError as e:
        db.rollback()
        print("SQLAlchemyError traceback:", traceback.format_exc())
        raise HTTPException(status_code=500, detail=f"Database error: {str(e)}")

    except Exception as e:
        db.rollback()
        print("Unexpected error traceback:", traceback.format_exc())
        raise HTTPException(status_code=500, detail=f"Unexpected error: {str(e)}")

    finally:
        db.close()
        
@router.delete("/pantry_items/delete", tags=["Pantry"])
@limiter.limit("10/minute")
async def delete_pantry_items(request: Request, request_data: PantryItemsDeleteRequest, user=Depends(require_google_token)):
    """
    Delete multiple pantry items by their IDs.
    Example JSON body:
    {
        "pantry_item_ids": [1, 2, 3]
    }
    """
    db = SessionLocal()
    try:
        if not request_data.pantry_item_ids:
            raise HTTPException(status_code=400, detail="No pantry item IDs provided")

        items_to_delete = (
            db.query(PantryItem)
            .filter(PantryItem.user_id == user.id)
            .filter(PantryItem.id.in_(request_data.pantry_item_ids))
            .all()
        )

        if not items_to_delete:
            raise HTTPException(status_code=404, detail="Pantry items not found")

        deleted_ids = [item.id for item in items_to_delete]

        for item in items_to_delete:
            db.delete(item)
        
        db.commit()

        return {
            "status": "success",
            "deleted_ids": deleted_ids,
            "message": f"Deleted {len(deleted_ids)} pantry items successfully"
        }

    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=f"Failed to delete pantry items: {str(e)}")
    
    finally:
        db.close()


@router.post("/recipes/{recipe_id}/like", tags=["Recipes"])
@limiter.limit("10/minute")
async def toggle_like_recipe(
    request: Request, recipe_id: int, user=Depends(require_google_token)
):
    """
    Like or unlike a recipe for the authenticated user.
    - If the user has not liked the recipe, it will be added
    - If the user has already liked the recipe, it will be removed
    """
    db = SessionLocal()

    try:
        recipe = db.query(Recipe).filter(Recipe.id == recipe_id).first()
        if not recipe:
            raise HTTPException(status_code=404, detail="Recipe not found")

        existing_like = (
            db.query(LikedRecipe)
            .filter(LikedRecipe.user_id == user.id)
            .filter(LikedRecipe.recipe_id == recipe_id)
            .first()
        )

        if existing_like:
            db.delete(existing_like)
            db.commit()
            return {"liked": False, "message": "Recipe unliked"}
        else:
            new_like = LikedRecipe(
                user_id=user.id,
                recipe_id=recipe_id,
                liked_at=datetime.datetime.utcnow(),
            )
            db.add(new_like)
            db.commit()
            return {"liked": True, "message": "Recipe liked"}

    except SQLAlchemyError as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=f"Database error: {str(e)}")

    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=f"Unexpected error: {str(e)}")

    finally:
        db.close()


@router.get("/users/current/liked-recipes", tags=["Recipes"])
@limiter.limit("10/minute")
async def get_liked_recipes(request: Request, user=Depends(require_google_token)):
    """
    Returns a list of recipes liked by the currently authenticated user.
    """
    db = SessionLocal()
    try:
        liked_recipes = (
            db.query(Recipe)
            .join(LikedRecipe, LikedRecipe.recipe_id == Recipe.id)
            .filter(LikedRecipe.user_id == user.id)
            .all()
        )

        result = []
        for recipe in liked_recipes:
            result.append(
                {
                    "id": recipe.id,
                    "recipe_name": recipe.recipe_name,
                    "recipe_image": recipe.recipe_image,
                    "prep_time": recipe.prep_time,
                    "cook_time": recipe.cook_time,
                }
            )

        return {"liked_recipes": result}

    except SQLAlchemyError as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=f"Database error: {str(e)}")

    finally:
        db.close()


@router.get("/recommendations/pantry/{user_id}")
async def get_pantry_recommendations(user_id: int, top_n: int = 10):

    pantry_items = get_user_pantry(user_id)

    async with httpx.AsyncClient() as client:
        ai_data = await client.post(
            f"{AI_SERVER_URL_RECIPE_RECOMMENDER}/recommend",
            json={
                "user_id": user_id,
                "pantry_items": pantry_items,
                "top_n": top_n,
                "mode": "content",
            },
        )

    data = ai_data.json()
    recipes = data.get("recommendations", [])

    db = SessionLocal()
    id_list = [r["RecipeId"] for r in recipes]
    db_recipes = db.query(Recipe).filter(Recipe.id.in_(id_list)).all()
    db.close()

    merged = []
    for r in recipes:
        db_record = next((x for x in db_recipes if x.id == r["RecipeId"]), None)
        merged.append(
            {
                **r,
            }
        )

    return {"status": "success", "content_based": merged}


def get_user_pantry(user_id: int):
    db = SessionLocal()
    try:
        items = db.query(PantryItem).filter(PantryItem.user_id == user_id).all()
        return [item.item_name for item in items]
    finally:
        db.close()


def get_all_user_ids():
    db = SessionLocal()
    try:
        users = db.query(User.id).all()
        return [u.id for u in users]
    finally:
        db.close()

def get_user_liked_recipes(user_id: int):
    db = SessionLocal()
    try:
        rows = db.query(LikedRecipe.recipe_id).filter(
            LikedRecipe.user_id == user_id
        ).all()
        return [r[0] for r in rows]
    finally:
        db.close()

@router.get("/recommendations/collaborative/{user_id}")
async def get_collaborative_recommendations(user_id: int, top_n: int = 5):
    pantry_items = get_user_pantry(user_id)
    all_user_ids = get_all_user_ids()

    user_likes = {
        uid: get_user_liked_recipes(uid)
        for uid in all_user_ids
    }

    payload = {
        "user_id": user_id,
        "pantry_items": pantry_items,
        "all_user_ids": all_user_ids,
        "user_likes": user_likes,
        "top_n": top_n,
        "mode": "collaborative",
    }

    async with httpx.AsyncClient() as client:
        resp = await client.post(f"{AI_SERVER_URL_RECIPE_RECOMMENDER}/recommend", json=payload)
        resp.raise_for_status()

    return resp.json()


@router.get("/recipes/search", tags=["Recipes"])
@limiter.limit("10/minute")
async def search_recipes_route(request: Request, query: str, limit: int = 20):
    """
    Search for recipes by name substring.
    Example:
        GET /recipes/search?query=chicken&limit=10
    """
    if not query or query.strip() == "":
        raise HTTPException(status_code=400, detail="Query string cannot be empty.")
    
    safe_query = sanitize_text(query)

    async with httpx.AsyncClient() as client:
        try:
            ai_response = await client.post(
                f"{AI_SERVER_URL_RECIPE_RECOMMENDER}/search-recipes",
                json={"query": safe_query, "limit": limit}
            )
            ai_response.raise_for_status()
            return ai_response.json()

        except httpx.HTTPStatusError:
            raise HTTPException(
                status_code=ai_response.status_code, detail=ai_response.text
            )

        except Exception as e:
            raise HTTPException(status_code=500, detail=f"Error contacting recipe AI service: {str(e)}")
        
@router.get("/recipes/{recipe_id}", tags=["Recipes"])
async def get_recipe_by_id_route(recipe_id: int):
    """
    Fetch a single recipe by RecipeId via the AI service.
    """
    async with httpx.AsyncClient() as client:
        try:
            resp = await client.post(
                f"{AI_SERVER_URL_RECIPE_RECOMMENDER}/recipe-by-id",
                json={"recipe_id": recipe_id}
            )
            resp.raise_for_status()
            return resp.json()

        except httpx.HTTPStatusError:
            raise HTTPException(
                status_code=resp.status_code,
                detail=resp.text
            )

        except Exception as e:
            raise HTTPException(
                status_code=500,
                detail=f"Error contacting recipe AI service: {str(e)}"
            )

@router.post("/user/post-allergens", tags=["Users"])
@limiter.limit("10/minute")
async def update_user_allergens(
    request: Request, 
    data: UserAllergensRequest,
    user=Depends(require_google_token),
):
    """
    Add or update user's allergens in the database
    Expects JSON like:
    {
        "allergens": ["peanuts", "gluten", "dairy"]
    }
    """
    db = SessionLocal()
    try:
        db_user = db.query(User).filter(User.id == user.id).first()
        if not db_user:
            raise HTTPException(status_code=404, detail="User not found")

        db_user.allergens = data.allergens
        db.commit()

        return {
            "status": "success",
            "allergens": db_user.allergens,
        }

    except HTTPException:
        db.rollback()
        raise
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=str(e))
    finally:
        db.close()

@router.get("/user/get-allergens", tags=["Users"])
async def get_user_allergens(request: Request, user=Depends(require_google_token)):
    """
    Fetch user's allergens from the database
    """
    db = SessionLocal()
    try:
        db_user = db.query(User).filter(User.id == user.id).first()
        if not db_user:
            raise HTTPException(status_code=404, detail="User not found")

        return {
            "status": "success",
            "allergens": db_user.allergens or [],
        }
    finally:
        db.close()

import datetime
import time
import traceback
from google.oauth2 import id_token
from google.auth.transport import requests as google_requests # for token verification
from google.auth.exceptions import InvalidValue
from pymysql import IntegrityError
from app.database.database import SessionLocal
from app.database.models import PantryItemsRequest, User, PantryItem
from fastapi import APIRouter, File, UploadFile, HTTPException, Request # incoming requests from frontend
import requests as httpx # for outgoing API requests (e.g., Google OAuth token exchange)
import os
from sqlalchemy.exc import SQLAlchemyError
from dotenv import load_dotenv
from app.asprise_api import send_receipt_to_asprise
from app.utils.receipt_parser import parse_asprise_response

load_dotenv()

GOOGLE_CLIENT_ID = os.getenv("GOOGLE_CLIENT_ID")
GOOGLE_CLIENT_SECRET = os.getenv("GOOGLE_CLIENT_SECRET")
GOOGLE_CLIENT_URI = os.getenv("GOOGLE_TOKEN_URI")

router = APIRouter()

@router.get("/hello/{name}", tags=["Test"])
async def say_hello(name: str):
    return {"message": f"Hello {name} from Stockd!"}


@router.post("/upload-receipt", tags=["OCR"])
async def upload_receipt(file: UploadFile = File(...)):
    """
    Upload an image of a receipt and send it to Asprise OCR API
    """
    try:
        image_bytes = await file.read()

        # Send to Asprise API
        asprise_data = send_receipt_to_asprise(image_bytes, file.filename)
        parsed = parse_asprise_response(asprise_data)

        return {
            "status": "success",
            "response": parsed
        }

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
    
@router.post("/auth/google", tags=["Google OAuth"])
async def verify_google_token(request: Request):
    """
    - Exchanges temporary auth code for Google ID token
    - Verifies ID token authenticity and audience
    - Safely inserts user into DB if new
    - Handles clock-skew errors (Token used too early)
    - Returns detailed, frontend-friendly error responses
    ==================
    - Possible errors:
    ==================
    - 400 - INVALID_JSON
    - 400 - MISSING_AUTH_CODE
    - 400 - NO_ID_TOKEN_FROM_GOOGLE
    - 400 - EMAIL_NOT_FOUND
    - 401 - GOOGLE_TOKEN_EXCHANGE_FAILED
    - 401 - TOKEN_USED_TOO_EARLY
    - 401 - INVALID_GOOGLE_ID_TOKEN
    - 401 - ID_TOKEN_VERIFICATION_FAILED
    - 500 - INVALID_GOOGLE_RESPONSE
    - 500 - DATABASE_ERROR
    - 500 - OAUTH_EXCHANGE_FAILED
    - 503 - GOOGLE_TOKEN_ENDPOINT_UNREACHABLE

    - Provide & Expose error_code for frontend logic, e.g.:
        switch (errorCode) {
            case "MISSING_AUTH_CODE":
            case "NO_ID_TOKEN_FROM_GOOGLE":
            case "EMAIL_NOT_FOUND":
                display("Google login failed. Please try again.");
                break;

            default:
                display("An unexpected error occurred.");
        }
    """
    db = SessionLocal()
    try:
        # ============================
        # 1. Validate incoming request
        # ============================
        try:
            data = await request.json()
        except Exception:
            raise HTTPException(status_code=400, detail={"error_code": "INVALID_JSON", "message": "Invalid JSON body"
                })

        auth_code = data.get("token")
        if not auth_code:
            raise HTTPException(status_code=400, detail={"error_code": "MISSING_AUTH_CODE", "message": "Missing Google authorization code"})

        # ======================================================
        # 2. Exchange the authorisation code for Google ID token
        # ======================================================
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
            token_response = httpx.post(token_url, data=payload)
        except Exception as e:
            raise HTTPException(status_code=503, detail={"error_code": "GOOGLE_TOKEN_ENDPOINT_UNREACHABLE", "message": "Failed to reach Google token endpoint"})

        if token_response.status_code != 200:
            raise HTTPException(status_code=401, detail={"error_code": "GOOGLE_TOKEN_EXCHANGE_FAILED", "message": f"Google token exchange failed: {token_response.text}"})

        try:
            token_data = token_response.json()
        except Exception:
            raise HTTPException(status_code=500, detail={"error_code": "INVALID_GOOGLE_RESPONSE", "message": "Invalid response from Google token endpoint"})

        if "id_token" not in token_data:
            raise HTTPException(status_code=400, detail={"error_code": "NO_ID_TOKEN_FROM_GOOGLE", "message": "Google did not return an ID token during exchange"})

        # ======================
        # 3. Verify the ID token
        # ======================
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
                        GOOGLE_CLIENT_ID
                    )
                except Exception:
                    raise HTTPException(status_code=401, detail={"error_code": "TOKEN_USED_TOO_EARLY", "message": "Google ID token was used too early and is still invalid"})
            else:
                raise HTTPException(status_code=401, detail={"error_code": "INVALID_GOOGLE_ID_TOKEN", "message": "Invalid Google ID Token"})
        except Exception:
            raise HTTPException(status_code=401, detail={"error_code": "ID_TOKEN_VERIFICATION_FAILED", "message": "Google ID token verification failed"})
    
        # Extract user info
        user_info = {
            "email": idinfo.get("email"),
            "name": idinfo.get("name"),
            "picture": idinfo.get("picture"),
        }

        if not user_info["email"]:
            raise HTTPException(status_code=400, detail={"error_code": "EMAIL_NOT_FOUND", "message": "Google account email missing from ID token"})

        
        # ============================
        # 4. Save or update user in DB
        # ============================
        try:
            existing_user = db.query(User).filter(User.email == user_info["email"]).first()

            if not existing_user:
                new_user = User(
                    email=user_info["email"],
                    name=user_info["name"],
                    picture=user_info["picture"],
                    client_id=idinfo.get("sub"),
                    role="user"
                )
                db.add(new_user)
                db.commit()
                db.refresh(new_user)

        except SQLAlchemyError as e:
            db.rollback()
            raise HTTPException(status_code=500, detail={"error_code": "DATABASE_ERROR", "message": f"Database error: {str(e)}"})

        # ==========================
        # 5. Return success response
        # ==========================
        return {"status": "success", "user": user_info}

    # =======================================================
    # Top-level exception handling for safe & clear responses
    # =======================================================
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail={"error_code": "OAUTH_EXCHANGE_FAILED", "message": f"OAuth exchange failed: {str(e)}"})
    finally:
        db.close()

@router.post("/pantry_items", tags=["Pantry"])
async def add_update_pantry_items(request_data: PantryItemsRequest):
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
            item_name = item.item_name.strip() if item.item_name else "Unnamed Item"
            quantity_value = item.quantity_value if item.quantity_value not in [None, ""] else 0
            quantity_unit = item.quantity_unit.strip() if item.quantity_unit else "pcs"
            category = item.category.strip() if item.category else "Uncategorized"
            storage = item.storage.strip() if item.storage else "Pantry"

            # Check if item already exists for this user
            existing_item = (
                db.query(PantryItem)
                .filter(PantryItem.user_id == request_data.user_id)
                .filter(PantryItem.item_name == item_name)
                .first()
            )

            if existing_item:
                # Update existing item
                existing_item.quantity_value = quantity_value
                existing_item.quantity_unit = quantity_unit
                existing_item.category = category
                existing_item.storage = storage
                existing_item.added_on = datetime.datetime.utcnow()
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
                    added_on=datetime.datetime.utcnow()
                )
                db.add(new_item)
                processed_items.append(new_item)

        db.commit()

        return {
            "status": "success",
            "processed_items": len(processed_items),
            "items": [item.item_name for item in processed_items]
        }

    except IntegrityError as ie:
        db.rollback()
        print("IntegrityError traceback:", traceback.format_exc())
        raise HTTPException(status_code=400, detail=f"Database integrity error: {str(ie.orig)}")
    
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
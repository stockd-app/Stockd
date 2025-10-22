import time
from google.oauth2 import id_token
from google.auth.transport import requests as google_requests # for token verification
from google.auth.exceptions import InvalidValue
from fastapi import APIRouter, File, UploadFile, HTTPException, Request # incoming requests from frontend
import requests as httpx # for outgoing API requests (e.g., Google OAuth token exchange)
import os
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
    1. Get temporary authorization code from frontend and exchange it for ID token.
    2. Verify the ID token and extract user info.
    """
    try:
        data = await request.json()
        auth_code = data.get("token")

        if not auth_code:
            raise HTTPException(status_code=400, detail="Missing token")

        # Exchange the authorization code for tokens
        token_url = GOOGLE_CLIENT_URI
        payload = {
            "client_id": GOOGLE_CLIENT_ID,
            "client_secret": GOOGLE_CLIENT_SECRET,
            "code": auth_code,
            "grant_type": "authorization_code",
            "redirect_uri": "postmessage",  # required for installed apps
        }

        # Send the temporary code to Google token endpoint to check if the code is designated for our app + user verification
        response = httpx.post(token_url, data=payload)
        token_data = response.json()

        if "id_token" not in token_data:
            raise HTTPException(status_code=400, detail="Failed to exchange code for ID token")

        # Verify the ID token
        try:
            idinfo = id_token.verify_oauth2_token(
                token_data["id_token"], google_requests.Request(), GOOGLE_CLIENT_ID
            )
        except InvalidValue as e:
            if "Token used too early" in str(e):
                # Wait a second and retry — Google's token clock skew safety
                time.sleep(2)
                idinfo = id_token.verify_oauth2_token(
                    token_data["id_token"], google_requests.Request(), GOOGLE_CLIENT_ID
                )
            else:
                raise

        user_info = {
            "email": idinfo.get("email"),
            "name": idinfo.get("name"),
            "picture": idinfo.get("picture"),
        }

        return {"status": "success", "user": user_info}

    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"OAuth exchange failed: {str(e)}")


from fastapi import APIRouter, File, UploadFile, HTTPException, Request
from dotenv import load_dotenv
import os
from google.oauth2 import id_token
from google.auth.transport import requests
from app.asprise_api import send_receipt_to_asprise
from app.utils.receipt_parser import parse_asprise_response

load_dotenv()

GOOGLE_CLIENT_ID = os.getenv("GOOGLE_CLIENT_ID")

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
    Verify Google OAuth token sent from frontend
    """
    try:
        data = await request.json()
        token = data.get("token")

        if not token:
            raise HTTPException(status_code=400, detail="Missing token")

        # Verify the token with Google
        idinfo = id_token.verify_oauth2_token(token, requests.Request(), GOOGLE_CLIENT_ID)

        # Extract user info
        user_info = {
            "email": idinfo.get("email"),
            "name": idinfo.get("name"),
            "picture": idinfo.get("picture"),
        }

        return {"status": "success", "user": user_info}

    except ValueError:
        raise HTTPException(status_code=400, detail="Invalid token")
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

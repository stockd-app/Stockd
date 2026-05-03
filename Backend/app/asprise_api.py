import httpx
from dotenv import load_dotenv
import os

load_dotenv()

ASPRISE_API_URL = os.getenv("ASPRISE_API_URL")
ASPRISE_CLIENT_ID = os.getenv("ASPRISE_CLIENT_ID")

async def send_receipt_to_asprise(image_bytes: bytes, filename: str) -> dict:
    """
    Sends the image to Asprise OCR API and returns the JSON response
    """
    # File payload
    files = {
        "file": (filename, image_bytes),
    }

    # Data payload
    data = {
        "client_id": ASPRISE_CLIENT_ID,   # Using "TEST" for testing purposes 
        "recognizer": "auto",           # Using "auto" for automatic recognition
        "ref_no": "receipt-ocr",        # Reference number for tracking
    }

    async with httpx.AsyncClient(timeout=httpx.Timeout(250.0, connect=30.0)) as client:
        response = await client.post(ASPRISE_API_URL, files=files, data=data)

    # Error handling
    response.raise_for_status()

    return response.json()

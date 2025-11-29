import os
import requests
from dotenv import load_dotenv

load_dotenv()

AI_MODEL_URL = os.getenv("AI_MODEL_URL", "http://localhost:9000")


def classify_receipt_items(parsed_data: dict) -> dict:
    """
    Takes parsed receipt data (from Asprise) and sends it to the AI model
    for classification.
    """
    ai_endpoint = f"{AI_MODEL_URL}/classify-items"
    
    ai_payload = {
        "store": parsed_data.get("store", "Unknown"),
        "items": parsed_data.get("items", {})
    }
    
    response = requests.post(
        ai_endpoint,
        json=ai_payload,
        timeout=30
    )
    
    response.raise_for_status()
    return response.json()
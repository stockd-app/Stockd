import os
import httpx

def classify_receipt_items(parsed_data: dict) -> dict:
    """
    Takes parsed receipt data (from Asprise) and sends it to the AI model
    for classification.
    """
    # Get URL from environment at runtime (not import time)
    FOOD_CLASSIFIER_MODEL_URL = os.getenv("FOOD_CLASSIFIER_MODEL_URL", "http://localhost:9002")
    ai_endpoint = f"{FOOD_CLASSIFIER_MODEL_URL}/classify-items"
    
    print(f"Calling AI classifier at: {ai_endpoint}")
    
    ai_payload = {
        "store": parsed_data.get("store", "Unknown"),
        "items": parsed_data.get("items", {})
    }
    
    # Use httpx with proper timeout settings
    with httpx.Client(timeout=httpx.Timeout(250.0, connect=30.0)) as client:
        response = client.post(
            ai_endpoint,
            json=ai_payload
        )
        response.raise_for_status()
        return response.json()
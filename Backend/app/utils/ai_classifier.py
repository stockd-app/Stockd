import os
import httpx

async def classify_receipt_items(parsed_data: dict) -> dict:
    """
    Takes parsed receipt data (from Asprise) and sends it to the AI model
    for classification. Returns empty results on timeout/error.
    """
    # Get URL from environment at runtime (not import time)
    FOOD_CLASSIFIER_MODEL_URL = os.getenv("FOOD_CLASSIFIER_MODEL_URL", "http://localhost:9002")
    ai_endpoint = f"{FOOD_CLASSIFIER_MODEL_URL}/classify-items"
    
    print(f"Calling AI classifier at: {ai_endpoint}")
    
    ai_payload = {
        "store": parsed_data.get("store", "Unknown"),
        "items": parsed_data.get("items", {})
    }
    
    try:
        # timeout: 90 seconds total, 15 seconds to connect
        async with httpx.AsyncClient(timeout=httpx.Timeout(90.0, connect=15.0)) as client:
            response = await client.post(
                ai_endpoint,
                json=ai_payload
            )
            response.raise_for_status()
            result = response.json()
            print(f"AI classifier returned {len(result.get('results', {}))} items")
            return result
    except httpx.TimeoutException as e:
        print(f"[ERROR] AI classifier timeout after 30s: {e}")
        return {"results": {}}
    except httpx.HTTPStatusError as e:
        print(f"[ERROR] AI classifier HTTP error {e.response.status_code}: {e}")
        return {"results": {}}
    except Exception as e:
        print(f"[ERROR] AI classifier failed: {e}")
        return {"results": {}}
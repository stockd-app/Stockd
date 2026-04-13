import os
import httpx

def get_recipe_recommendations(user_id: int, pantry_items: list, top_n=10):
    # Get URL from environment at runtime (not import time)
    RECIPE_RECOMMENDER_MODEL_URL = os.getenv("RECIPE_RECOMMENDER_MODEL_URL")
    
    if not RECIPE_RECOMMENDER_MODEL_URL:
        raise ValueError("RECIPE_RECOMMENDER_MODEL_URL environment variable not set")
    
    endpoint = f"{RECIPE_RECOMMENDER_MODEL_URL}/recommend"
    print(f"Calling recipe recommender at: {endpoint}")
    
    payload = {
        "user_id": user_id,
        "pantry_items": pantry_items,
        "top_n": top_n,
        "mode": "content",
    }

    # Use httpx with proper timeout settings
    with httpx.Client(timeout=httpx.Timeout(180.0, connect=30.0)) as client:
        resp = client.post(
            endpoint,
            json=payload
        )
        resp.raise_for_status()
        return resp.json()

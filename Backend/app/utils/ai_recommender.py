import os
import requests
from dotenv import load_dotenv

load_dotenv()

RECIPE_RECOMMENDER_MODEL_URL = os.getenv("RECIPE_RECOMMENDER_MODEL_URL")

def get_recipe_recommendations(user_id: int, pantry_items: list, top_n=10):
    payload = {
        "user_id": user_id,
        "pantry_items": pantry_items,
        "top_n": top_n,
        "mode": "content",
    }

    resp = requests.post(
        f"{RECIPE_RECOMMENDER_MODEL_URL}/recommend",
        json=payload,
        timeout=120
    )

    resp.raise_for_status()
    return resp.json()

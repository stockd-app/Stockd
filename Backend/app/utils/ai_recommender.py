import os
import requests
from dotenv import load_dotenv

load_dotenv()

AI_SERVER_URL = os.getenv("AI_SERVER_URL", "http://localhost:9000")

def get_recipe_recommendations(user_id: int, pantry_items: list, top_n=10):
    payload = {
        "user_id": user_id,
        "pantry_items": pantry_items,
        "top_n": top_n,
        "mode": "content",
    }

    resp = requests.post(
        f"{AI_SERVER_URL}/recommend",
        json=payload,
        timeout=30
    )

    resp.raise_for_status()
    return resp.json()

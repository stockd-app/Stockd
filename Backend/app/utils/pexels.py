from dotenv import load_dotenv
import requests
from typing import Optional
from app.utils.sanitizer import sanitize_url
import os

load_dotenv()

PEXELS_API_KEY = os.getenv("PEXELS_API_KEY")

def get_product_image_from_pexels(food_name: str) -> Optional[str]:
    """
    Search Pexels API for a product and return its image URL
    """
    try:
        search_url = "https://api.pexels.com/v1/search"
        
        headers = {
            "Authorization": PEXELS_API_KEY
        }
        
        query = f"{food_name} ingredient food"
        
        params = {
            "query": query,
            "per_page": 3 
        }
        
        response = requests.get(search_url, headers=headers, params=params, timeout=30)
        response.raise_for_status()
        data = response.json()
        
        photos = data.get("photos", [])
        
        if photos:
            for photo in photos:
                image_url = photo.get("src", {}).get("medium")
                if image_url:
                    return sanitize_url(image_url)
        
        return None
        
    except Exception as e:
        print(f"Error fetching image for {food_name}: {str(e)}")
        return None
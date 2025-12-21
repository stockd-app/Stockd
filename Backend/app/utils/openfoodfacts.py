import requests
from typing import Optional
from app.utils.sanitizer import sanitize_url

def get_product_image_from_openfoodfacts(product_name: str) -> Optional[str]:
    """
    Search OpenFoodFacts API for a product and return its image URL
    """
    try:
        search_url = "https://world.openfoodfacts.org/cgi/search.pl"
        params = {
            "search_terms": product_name,
            "search_simple": 1,
            "action": "process",
            "json": 1,
            "page_size": 1
        }
        
        response = requests.get(search_url, params=params, timeout=30)
        response.raise_for_status()
        data = response.json()
        
        if data.get("products") and len(data["products"]) > 0:
            product = data["products"][0]
            
            image_url = (
                product.get("image_front_url") or 
                product.get("image_url") or 
                product.get("image_small_url")
            )
            
            return sanitize_url(image_url) if image_url else None
        
        return None
        
    except Exception as e:
        print(f"Error fetching image for {product_name}: {str(e)}")
        return None
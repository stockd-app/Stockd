import requests
from typing import Optional

def get_product_image_from_openfoodfacts(product_name: str) -> Optional[str]:
    """
    Search OpenFoodFacts API for a product and return its image URL.
    
    Args:
        product_name: Name of the food item to search for
        
    Returns:
        Image URL if found, None otherwise
    """
    try:
        # Search for the product
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
        
        # Check if we got any products
        if data.get("products") and len(data["products"]) > 0:
            product = data["products"][0]
            
            # Try to get the image URL (prefer front image)
            image_url = (
                product.get("image_front_url") or 
                product.get("image_url") or 
                product.get("image_small_url")
            )
            
            return image_url
        
        return None
        
    except Exception as e:
        print(f"Error fetching image for {product_name}: {str(e)}")
        return None

# def main():
#     result = get_product_image_from_openfoodfacts("TESCO COOKIES")
#     print(result)

# if __name__ == "__main__":
#     main()
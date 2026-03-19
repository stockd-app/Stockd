from sqlalchemy import or_
from app.database.database import SessionLocal
from app.database.models import FoodImageCache, PantryItem
from app.utils.pexels import get_product_image_from_pexels


def fetch_food_images(item_ids: list[int]):
    """
    Fetch and update food images for pantry items
    - First check the FoodImageCache for existing images
    - If not found, queries Pexels for the image
    """
    db = SessionLocal()
    
    print(f"Fetching images for item IDs: {item_ids}")

    items = (
        db.query(PantryItem)
        .filter(PantryItem.id.in_(item_ids))
        .filter(PantryItem.category != "non-food")
        .filter(
            or_(
                PantryItem.item_image.is_(None),
                PantryItem.item_image == ""
            )
        )
        .filter(PantryItem.normalized_name.isnot(None))
        .all()
    )

    seen = set()
    for item in items:
        if item.normalized_name in seen:
            continue

        seen.add(item.normalized_name)

        cached = (
            db.query(FoodImageCache)
            .filter(FoodImageCache.normalized_name == item.normalized_name)
            .first()
        )

        if cached:
            item.item_image = cached.image_url
            continue

        image = get_product_image_from_pexels(item.normalized_name)

        if image:
            db.add(
                FoodImageCache(normalized_name=item.normalized_name, image_url=image)
            )
            item.item_image = image
            print("Image found for item: ", item.item_name)
        else:
            print(f"No image found for item: '{item.item_name}' (normalized: '{item.normalized_name}')")

    db.commit()
    db.close()

def get_existing_image(db, user_id: int, normalized_name: str):
    """
    Check if there's an existing image for the given normalized name in the user's pantry items.
    This avoids duplicate calls to Pexels. 
    If an image exists, it returns the URL; otherwise, it returns None.
    """
    print(f"Checking for existing image for '{normalized_name}' in user {user_id}'s pantry...")
    existing_with_image = (
        db.query(PantryItem)
        .filter(PantryItem.user_id == user_id)
        .filter(PantryItem.normalized_name == normalized_name)
        .filter(PantryItem.item_image.isnot(None))
        .filter(PantryItem.item_image != "")
        .first()
    )
    return existing_with_image.item_image if existing_with_image else None
from sqlalchemy import or_
from app.database.database import SessionLocal
from app.database.models import FoodImageCache, PantryItem
from app.utils.openfoodfacts import get_product_image_from_openfoodfacts


def fetch_food_images(user_id: int):
    """
    Fetch and update food images for pantry items of the given user
    - First check the FoodImageCache for existing images
    - If not found, queries OpenFoodFacts for the image
    """
    db = SessionLocal()

    items = (
        db.query(PantryItem)
        .filter(PantryItem.user_id == user_id)
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

        image = get_product_image_from_openfoodfacts(item.normalized_name)

        if image:
            db.add(
                FoodImageCache(normalized_name=item.normalized_name, image_url=image)
            )
            item.item_image = image
        else:
            print(f"No image found for item: '{item.item_name}' (normalized: '{item.normalized_name}')")

    db.commit()
    db.close()

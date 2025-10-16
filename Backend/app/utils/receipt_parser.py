def parse_asprise_response(asprise_response: dict) -> dict:
    """
    Takes the Asprise OCR API response and extracts the store name
    and items with their counts
    """
    receipts = asprise_response.get("receipts", [])
    
    # Handle no receipts found
    if not receipts:                     
        return {"merchant_name": None, "items": {}}

    # One receipt per image
    receipt = receipts[0]
    store_name = receipt.get("merchant_name", "Unknown")

    items = receipt.get("items", [])
    item_counts = {}

    for item in items:
        name = item.get("description", "").strip().title()
        if not name:
            continue
        item_counts[name] = item_counts.get(name, 0) + 1

    return {
        "store": store_name,
        "items": item_counts
    }

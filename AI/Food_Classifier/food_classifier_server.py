from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from typing import List, Dict
import uvicorn
from food_classifier_model import FoodLabeler
from sanitizer import sanitize_text, sanitize_quantity
import asyncio
from concurrent.futures import ThreadPoolExecutor
import time

class ReceiptRequest(BaseModel):
    store: str
    items: Dict[str, int]

app = FastAPI(title="AI Classifier")

model = FoodLabeler()

# Thread pool for parallel processing
executor = ThreadPoolExecutor(max_workers=4)

@app.get("/health")
async def health_check():
    """Health check endpoint for Docker and monitoring"""
    return {
        "status": "healthy",
        "service": "food-classifier",
        "model_loaded": model is not None
    }

def classify_single_item(item_name: str, quantity: int):
    """Classify a single item (runs in thread pool)"""
    item_name = sanitize_text(item_name)
    quantity = sanitize_quantity(quantity)
    classification = model.classify(item_name)
    
    return item_name, {
        "item": item_name,
        "quantity": quantity,
        "is_food": classification.get("is_food"),
        "storage": classification.get("storage"),
        "category": classification.get("category")
    }

@app.post("/classify-items")
async def classify_items(req: ReceiptRequest):
    """Classify items from a receipt into food and non-food categories (parallel processing)"""
    try:
        start_time = time.time()
        print(f"[INFO] Classifying {len(req.items)} items in parallel...")
        
        # Create tasks for parallel processing
        loop = asyncio.get_event_loop()
        tasks = [
            loop.run_in_executor(executor, classify_single_item, item_name, quantity)
            for item_name, quantity in req.items.items()
        ]
        
        # Wait for all classifications to complete
        results = await asyncio.gather(*tasks)
        
        # Build response dictionary
        classified_items = {item_name: classification for item_name, classification in results}
        
        elapsed = time.time() - start_time
        print(f"[INFO] Classified {len(classified_items)} items in {elapsed:.2f}s")
        
        return {"status": {"message": "success"}, "results": classified_items}
    
    except Exception as e:
        print(f"[ERROR] Classification failed: {e}")
        raise HTTPException(status_code=500, detail=str(e))


if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=9002)

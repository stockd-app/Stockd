from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from typing import List, Dict
import uvicorn
from food_classifier_model import FoodLabeler
from sanitizer import sanitize_text, sanitize_quantity, sanitize_url

class ReceiptRequest(BaseModel):
    store: str
    items: Dict[str, int]

app = FastAPI(title="AI Classifier")

model = FoodLabeler()

@app.get("/health")
async def health_check():
    """Health check endpoint for Docker and monitoring"""
    return {
        "status": "healthy",
        "service": "food-classifier",
        "model_loaded": model is not None
    }

@app.post("/classify-items")
async def classify_items(req: ReceiptRequest):
    """Classify items from a receipt into food and non-food categories"""
    try:
        classified_items = {}
        
        for item_name, quantity in req.items.items():
            item_name = sanitize_text(item_name)
            quantity = sanitize_quantity(quantity)
            classification = model.classify(item_name)
            
            classified_items[item_name] = {
                "item": item_name,
                "quantity": quantity,
                "is_food": classification.get("is_food"),
                "storage": classification.get("storage"),
                "category": classification.get("category")
            }
        
        return {"status": {"message": "success"}, "results": classified_items}
    
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=9002)

from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from typing import List, Dict
import uvicorn
from models.model1_item_classifier import FoodLabeler

class ReceiptRequest(BaseModel):
    store: str
    items: Dict[str, int]

app = FastAPI(title="AI Classifier")

model = FoodLabeler()

@app.post("/classify-items")
async def classify_items(req: ReceiptRequest):
    try:
        classified_items = {}
        
        for item_name, quantity in req.items.items():
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
    uvicorn.run(app, host="0.0.0.0", port=9000)

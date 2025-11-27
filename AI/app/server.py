from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from typing import List, Dict
import uvicorn
from app.models.model1_item_classifier import FoodLabeler
from app.models.model2_recipe_recommender import recommend_recipes, recommend_from_similar_users

class ReceiptRequest(BaseModel):
    store: str
    items: Dict[str, int]

class RecommendationRequest(BaseModel):
    user_id: int
    pantry_items: List[str]
    all_user_ids: List[int] = []
    top_n: int = 10
    mode: str = "content"

class RecipeRecommendation(BaseModel):
    name: str
    similarity: float


class ContentRecommendationResponse(BaseModel):
    status: str
    type: str
    recommendations: List[RecipeRecommendation]


class CollaborativeRecommendationResponse(BaseModel):
    status: str
    type: str
    recommendations: List[str]

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

@app.post("/recommend")
def recommend_ai(req: RecommendationRequest):
    try:
        if req.mode == "content":
            results = recommend_recipes(
                req.pantry_items,
                top_n=req.top_n,
                user_id=req.user_id
            )

            formatted = [
                RecipeRecommendation(
                    name=row["Name"],
                    similarity=float(row["similarity"])
                )
                for _, row in results.iterrows()
            ]

            return ContentRecommendationResponse(
                status="success",
                type="content",
                recommendations=formatted
            )

        elif req.mode == "collaborative":
            if not req.all_user_ids:
                raise HTTPException(400, "all_user_ids required for collaborative mode.")

            recs = recommend_from_similar_users(
                target_user=req.user_id,
                all_user_ids=req.all_user_ids,
                top_n=req.top_n
            )

            return CollaborativeRecommendationResponse(
                status="success",
                type="collaborative",
                recommendations=recs
            )

        else:
            raise HTTPException(400, "Invalid mode. Use 'content' or 'collaborative'.")

    except Exception as e:
        raise HTTPException(500, str(e))

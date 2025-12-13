from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from typing import List
import uvicorn
# from models.model2_recipe_recommender import recommend_recipes, recommend_from_similar_users, search_recipes
from recipe_recommender_model import recommend_recipes, recommend_from_similar_users, search_recipes

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

class SearchRequest(BaseModel):
    query: str
    limit: int = 20

app = FastAPI(title="Recipe Recommender")

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

@app.post("/search-recipes")
async def search_recipes_endpoint(req: SearchRequest):
    try:
        results = search_recipes(req.query, req.limit)
        return {
            "status": "success",
            "count": len(results),
            "results": results
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=9001)
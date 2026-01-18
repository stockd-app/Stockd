from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from typing import List
import uvicorn
from recipe_recommender_model import recommend_recipes, recommend_from_similar_users, search_recipes, get_recipe_by_id
from datetime import datetime
import pandas as pd
import numpy as np

class RecommendationRequest(BaseModel):
    user_id: int
    pantry_items: List[str]
    all_user_ids: List[int] = []
    user_likes: dict = {}
    top_n: int = 10
    mode: str = "content"

class RecipeRecommendation(BaseModel):
    name: str
    similarity: float

class RecipeObject(BaseModel):
    RecipeId: int
    Name: str
    Allergens: List[str] | None = None
    AuthorId: int | None = None
    AuthorName: str | None = None
    CookTime: str | None = None
    PrepTime: str | None = None
    TotalTime: str | None = None
    DatePublished: datetime | None = None
    Description: str | None = None
    Images: List[str] | None = None
    RecipeCategory: str | None = None
    Keywords: List[str] | None = None
    RecipeIngredientQuantities: List[str] | None = None
    RecipeIngredientParts: List[str] | None = None
    RecipeInstructions: List[str] | None = None 
    AggregatedRating: float | None = None
    ReviewCount: int | None = None
    Calories: float | None = None
    FatContent: float | None = None
    ProteinContent: float | None = None
    similarity: float | None = None

class ContentRecommendationResponse(BaseModel):
    status: str
    type: str
    recommendations: List[RecipeObject]

class CollaborativeRecommendationResponse(BaseModel):
    status: str
    type: str
    recommendations: List[RecipeObject]

class SearchRequest(BaseModel):
    query: str
    limit: int = 20

class RecipeByIdRequest(BaseModel):
    recipe_id: int

app = FastAPI(title="Recipe Recommender")

@app.get("/health")
async def health_check():
    """Health check endpoint for Docker and monitoring"""
    return {
        "status": "healthy",
        "service": "recipe-recommender"
    }

def sanitize_row_for_pydantic(row_dict):
    """
    Ensure all values in row_dict conform to RecipeObject types
    """
    numeric_fields = [
        "AggregatedRating", "Calories", "FatContent",
        "ProteinContent", "ReviewCount"
    ]
    datetime_fields = ["DatePublished"]
    list_fields = [
        "Images", "Keywords", "RecipeIngredientQuantities",
        "RecipeIngredientParts","RecipeInstructions"
        "RecipeIngredientParts", "Allergens"
    ]
    string_fields = [
        "Name", "AuthorName", "CookTime", "PrepTime",
        "TotalTime", "Description", "RecipeCategory"
    ]

    for f in numeric_fields:
        value = row_dict.get(f)
        if value is None or (isinstance(value, float) and np.isnan(value)):
            row_dict[f] = 0.0

    for f in datetime_fields:
        value = row_dict.get(f)
        if value is None or not isinstance(value, datetime):
            row_dict[f] = None

    for f in list_fields:
        value = row_dict.get(f)
        if value is None:
            row_dict[f] = []
        else:
            row_dict[f] = [v if v is not None else "" for v in value]

    for f in string_fields:
        value = row_dict.get(f)
        if value is None:
            row_dict[f] = ""

    sim = row_dict.get("similarity")
    if sim is None or (isinstance(sim, float) and np.isnan(sim)):
        row_dict["similarity"] = 0.0

    return row_dict

@app.post("/recommend")
def recommend_ai(req: RecommendationRequest):
    try:
        if req.mode == "content":
            results = recommend_recipes(
                req.pantry_items,
                top_n=req.top_n,
                user_id=req.user_id
            )

            formatted = []
            for _, row in results.iterrows():
                row_dict = row.to_dict()
                row_dict = sanitize_row_for_pydantic(row_dict)
                formatted.append(RecipeObject(**row_dict))

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
                user_likes=req.user_likes,
                top_n=req.top_n
            )

            print("Raw recommended results:", recs)

            formatted = []
            for row in recs:
                row = sanitize_row_for_pydantic(row)
                formatted.append(RecipeObject(**row))

            return CollaborativeRecommendationResponse(
                status="success",
                type="collaborative",
                recommendations=formatted
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

@app.post("/recipe-by-id")
def recipe_by_id(req: RecipeByIdRequest):
    recipe = get_recipe_by_id(req.recipe_id)

    if recipe is None:
        raise HTTPException(404, "Recipe not found")

    recipe = sanitize_row_for_pydantic(recipe)
    return {
        "status": "success",
        "recipe": RecipeObject(**recipe)
    }

if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=9001)
from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from typing import List
import uvicorn
from AI.Recipe_Recommender.OLDmodel2_recipe_recommender import recommend_recipes, recommend_from_similar_users, search_recipes, find_semantic_subset_recipes
from datetime import datetime
import pandas as pd
import numpy as np

class RecommendationRequest(BaseModel):
    user_id: int
    pantry_items: List[str]
    all_user_ids: List[int] = []
    top_n: int = 10
    mode: str = "content"

class RecipeRecommendation(BaseModel):
    name: str
    similarity: float


class RecipeObject(BaseModel):
    RecipeId: int
    Name: str
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
    recommendations: List[str]

class SearchRequest(BaseModel):
    query: str
    limit: int = 20

app = FastAPI(title="Recipe Recommender")

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
        "RecipeIngredientParts"
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
            # replace any None inside list
            row_dict[f] = [v if v is not None else "" for v in value]

    for f in string_fields:
        value = row_dict.get(f)
        if value is None:
            row_dict[f] = ""

    # similarity is optional float
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

@app.post("/recommend/subset", response_model=ContentRecommendationResponse)
def subset_recommendation(req: RecommendationRequest):
    """
    Recommend recipes where essential ingredients are a subset of the user's pantry.
    """
    try:
        df_results = find_semantic_subset_recipes(
            req.pantry_items,
            match_ratio_threshold=1.0
        )

        formatted = []
        for _, row in df_results.iterrows():
            row_dict = row.to_dict()
            row_dict = sanitize_row_for_pydantic(row_dict)
            formatted.append(RecipeObject(**row_dict))

        return ContentRecommendationResponse(
            status="success",
            type="subset",
            recommendations=formatted
        )

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=9001)
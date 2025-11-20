import os
import joblib
import pandas as pd
import numpy as np
from sentence_transformers import SentenceTransformer
import faiss
import hashlib
from sklearn.metrics.pairwise import cosine_similarity

# build path to data file since relative paths can be unreliable
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
DATA_PATH = os.path.join(BASE_DIR, "../data/recipes.parquet")
MODEL_PATH = os.path.normpath(os.path.join(BASE_DIR, "recipe_assets.pkl"))
INDEX_PATH = os.path.normpath(os.path.join(BASE_DIR, "recipe_index.faiss"))

df = pd.read_parquet(DATA_PATH)
df = df[['Name', 'RecipeIngredientParts']] # keeps these columns and drops everything else. later we should also import images, recipe instructions, preptime, cooktime, recipecategory, recipeingredientquantities, keywords for searching and maybe aggregatedrating 
df = df.sample(5000) # limit to 5000 recipes for faster testing. full 500k dataset will probably take 1-2 hours to compute. only need to compute once before prod

# join each list in recipeingredientparts into a single string
df['ingredients_text'] = df['RecipeIngredientParts'].apply(
    lambda x: " ".join(x).lower() if isinstance(x, list) else str(x).lower()
)

# load cached model if exists and index if available
if os.path.exists(MODEL_PATH) and os.path.exists(INDEX_PATH):
    print("Loading cached model and FAISS index...")
    model, df = joblib.load(MODEL_PATH)
    index = faiss.read_index(INDEX_PATH)
else:
    print("Encoding recipes with MiniLM (first-time setup)...")
    model = SentenceTransformer('all-MiniLM-L6-v2')
    embeddings = model.encode(
        df['ingredients_text'].tolist(),
        show_progress_bar=True,
        batch_size=256,
        normalize_embeddings=True
    )
    
    # build FAISS index
    dim = embeddings.shape[1]
    index = faiss.IndexFlatIP(dim)
    index.add(embeddings.astype('float32'))

    # cache model and index for future runs
    joblib.dump((model, df), MODEL_PATH)
    faiss.write_index(index, INDEX_PATH)

    print("model and FAISS index ready")

pantry_cache = {}

def recommend_recipes(pantry_items, top_n=10, user_id=None):
    """
    Recommend top N recipes based on a user's pantry ingredients.
    """
    pantry_text = " ".join(pantry_items).lower().strip()
    pantry_hash = hashlib.md5(pantry_text.encode()).hexdigest()

    if user_id and user_id in pantry_cache and pantry_cache[user_id][0] == pantry_hash:
        pantry_emb = pantry_cache[user_id][1]
    else:
        pantry_emb = model.encode([pantry_text], normalize_embeddings=True).astype('float32')
        if user_id:
            pantry_cache[user_id] = (pantry_hash, pantry_emb)

    similarities, indices = index.search(pantry_emb, top_n)
    results = df.iloc[indices[0]].copy()
    results['similarity'] = similarities[0]

    return results[['Name', 'similarity']]

# ----------------------------- Collaborative filtering -----------------------------
users = {
    "user_1": {"pantry": ["chicken", "rice", "broccoli"], "liked_recipes": ["Garlic Chicken Stir Fry", "Teriyaki Chicken", "Chicken Fried Rice"]},
    "user_2": {"pantry": ["chicken", "rice", "carrots"], "liked_recipes": ["Garlic Chicken Stir Fry", "Teriyaki Chicken", "Chicken Fried Rice", "Spaghetti Bolognese", "Oreos", "Chocolate Chip Cookies"]},
    "user_3": {"pantry": ["chicken", "noodles", "broccoli"], "liked_recipes": ["Garlic Chicken Stir Fry", "Teriyaki Chicken", "Chicken Fried Rice", "Strawberry Smoothie", "Banana Pancakes", "Cereal"]},
    "user_4": {"pantry": ["salmon", "lemon", "dill"], "liked_recipes": ["Grilled Lemon Salmon", "Salmon Pasta"]},
    "user_5": {"pantry": ["beef", "onion", "garlic"], "liked_recipes": ["Beef Stir Fry", "Beef Tacos"]},
    "user_6": {"pantry": ["pasta", "tomato sauce", "cheese"], "liked_recipes": ["Lasagna"]},
    "user_7": {"pantry": ["potatoes", "cheddar", "bacon"], "liked_recipes": ["Loaded Baked Potato", "Cheesy Potato Bake"]},
    "user_8": {"pantry": ["shrimp", "garlic", "butter"], "liked_recipes": ["Garlic Butter Shrimp", "Shrimp Scampi"]},
    "user_9": {"pantry": ["spinach", "feta", "phyllo"], "liked_recipes": ["Spinach Pie", "Greek Salad"]},
    "user_10": {"pantry": ["chocolate", "flour", "sugar"], "liked_recipes": ["Chocolate Cake", "Brownies"]},
}


interactions = []
for user, data in users.items():
    for recipe in data["liked_recipes"]:
        interactions.append({
            "user_id": user,
            "recipe_name": recipe,
            "rating": 1
        })

df_interactions = pd.DataFrame(interactions)
user_item_matrix = df_interactions.pivot_table(
    index='user_id', columns='recipe_name', values='rating', fill_value=0
)

user_similarity = cosine_similarity(user_item_matrix)
user_similarity_df = pd.DataFrame(
    user_similarity,
    index=user_item_matrix.index,
    columns=user_item_matrix.index
)

def recommend_from_similar_users(target_user, top_n=3):
    similar_users = user_similarity_df[target_user].sort_values(ascending=False).drop(target_user)
    recommended_recipes = set()
    for sim_user in similar_users.index:
        liked = set(df_interactions[df_interactions.user_id == sim_user]['recipe_name'])
        target_liked = set(df_interactions[df_interactions.user_id == target_user]['recipe_name'])
        recommended_recipes.update(liked - target_liked)
        if len(recommended_recipes) >= top_n:
            break
    return list(recommended_recipes)[:top_n]

if __name__ == "__main__":
    test_user = "user_1"
    test_pantry = users[test_user]["pantry"]

    print(f"\nUser pantry: {test_pantry}")
    print("\nContent-based recommendations:")
    print(recommend_recipes(test_pantry, top_n=5))

    print("\nCollaborative filtering recommendations:")
    print(recommend_from_similar_users(test_user, top_n=5))
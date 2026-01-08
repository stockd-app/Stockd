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
DATA_PATH = os.path.join(BASE_DIR, "data/recipes.parquet")
MODEL_PATH = os.path.normpath(os.path.join(BASE_DIR, "recipe_assets.pkl"))
INDEX_PATH = os.path.normpath(os.path.join(BASE_DIR, "recipe_index.faiss"))

df = pd.read_parquet(DATA_PATH)
df = df.copy()

# convert RecipeId to int to match IDs from likedrecipes
df["RecipeId"] = df["RecipeId"].astype(int)

df = df.sample(5000, random_state=42) # limit to 5000 recipes for faster testing. full 500k dataset will probably take 1-2 hours to compute. only need to compute once before prod

# print("Sample RecipeIds in df:", df["RecipeId"].tolist()[:10])

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

    return results

def build_interaction_matrix(all_user_ids, user_likes):
    """
    Create (1) interaction list, (2) user-item matrix, (3) similarity matrix.
    user_likes: dict { user_id: [recipe_ids, ...] }
    """
    interactions = []

    for uid in all_user_ids:
        liked = user_likes.get(uid, [])
        for recipe_id in liked:
            interactions.append({
                "user_id": uid,
                "recipe_id": recipe_id,
                "rating": 1
            })

    df_interactions = pd.DataFrame(interactions)

    if df_interactions.empty:
        raise ValueError("No interactions found. Cannot build collaborative filter.")

    # pivot to user-item matrix
    user_item_matrix = df_interactions.pivot_table(
        index="user_id",
        columns="recipe_id",
        values="rating",
        fill_value=0
    )

    # cosine similarity between users
    similarity_matrix = cosine_similarity(user_item_matrix)

    sim_df = pd.DataFrame(
        similarity_matrix,
        index=user_item_matrix.index,
        columns=user_item_matrix.index
    )

    return df_interactions, user_item_matrix, sim_df

def recommend_from_similar_users(
    target_user: int,
    all_user_ids: list[int],
    user_likes: dict,
    top_n: int = 5
):
    """
    Recommend recipes based on similar users.
    """
    user_likes = {int(k): v for k, v in user_likes.items()}

    # build matrices
    df_interactions, user_item_matrix, sim_df = build_interaction_matrix(
        all_user_ids, user_likes
    )

    print("Sim DF:\n", sim_df)
    print("Target user:", target_user)
    print("Target liked recipes:", set(user_likes.get(target_user, [])))

    if target_user not in sim_df.index:
        raise ValueError(f"Target user {target_user} has no interaction data.")

    # sort similar users
    similar_users = sim_df[target_user].sort_values(ascending=False).drop(target_user)
    print("Similar users sorted by similarity:\n", similar_users)

    target_liked = set(user_likes.get(target_user, []))
    recommended = set()

    for sim_user in similar_users.index:
        sim_user_likes = set(user_likes.get(sim_user, []))
        print(f"Sim user {sim_user} likes: {sim_user_likes}")
        recommended.update(sim_user_likes - target_liked)
        print(f"Recommended so far: {recommended}")
        if len(recommended) >= top_n:
            break

    recommended_ids = list(recommended)[:top_n]

    # look up recipe objects in parquet df
    recommended_ids = [int(rid) for rid in recommended_ids]
    results = df[df["RecipeId"].isin(recommended_ids)].copy()

    print("Recommended IDs (int):", recommended_ids)
    print("Available RecipeIds in df:", df["RecipeId"].tolist()[:20])

    return results.to_dict(orient="records")


def search_recipes(query: str, limit: int = 20):
    """
    Simple substring search for recipes by name.
    Case-insensitive.
    """
    q = query.lower().strip()

    matches = df[df['Name'].str.lower().str.contains(q, na=False)]

    matches = matches.head(limit)

    return matches[['Name']].to_dict(orient="records")

def get_recipe_by_id(recipe_id: int):
    """
    Return a single recipe object by RecipeId.
    """
    recipe_id = int(recipe_id)

    match = df[df["RecipeId"] == recipe_id]

    if match.empty:
        return None

    return match.iloc[0].to_dict()

if __name__ == "__main__":
    # # local tests
    test_user_ids = [1, 2, 3]

    # print("Testing recipe by ID:")
    # recipe = get_recipe_by_id(373686)
    # print(recipe)

    # target_user = 1

    # print("\nTesting collaborative filtering:")
    # print(recommend_from_similar_users(target_user, test_user_ids, top_n=5))

    # test_pantry = ["chicken", "rice", "broccoli"]
    # print("\nTesting content-based (pantry) recommendations:")
    # print(recommend_recipes(test_pantry, top_n=5))
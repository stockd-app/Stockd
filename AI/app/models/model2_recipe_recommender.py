import os
import joblib
import pandas as pd
import numpy as np
from sentence_transformers import SentenceTransformer
import faiss
import hashlib
from sklearn.metrics.pairwise import cosine_similarity

from recipe_subset import canonicalize_recipe_ingredients, build_canonical_from_recipe_df, get_canonical_db

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
DATA_PATH = os.path.join(BASE_DIR, "../data/recipes.parquet")
MODEL_PATH = os.path.normpath(os.path.join(BASE_DIR, "recipe_assets.pkl"))
INDEX_PATH = os.path.normpath(os.path.join(BASE_DIR, "recipe_index.faiss"))

df = pd.read_parquet(DATA_PATH)
df = df.copy()
df = df.sample(5000) # limit to 5000 recipes for faster testing. full 500k dataset will probably take 1-2 hours to compute. only need to compute once before prod

# join each list in recipeingredientparts into a single string
df['ingredients_text'] = df['RecipeIngredientParts'].apply(
    lambda x: " ".join(x).lower() if isinstance(x, list) else str(x).lower()
)

# build canonical DB from recipe dataset (once at startup)
print("Building/loading canonical ingredient database...")
canonical_db = get_canonical_db()
# populate canonical DB from the recipes dataframe
build_canonical_from_recipe_df(df, ing_col='RecipeIngredientParts', min_occurrences=1)

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

FAKE_LIKED_RECIPES = [
    "Garlic Chicken Stir Fry",
    "Teriyaki Chicken",
    "Chicken Fried Rice",
    "Chocolate Chip Cookies",
    "Spaghetti Bolognese",
]

FAKE_USER_LIKES = {
    1: ["Garlic Chicken Stir Fry", "Teriyaki Chicken"],
    2: ["Spaghetti Bolognese", "Chocolate Chip Cookies"],
    3: ["Chicken Fried Rice", "Brownies"],
}

def build_interaction_matrix(user_ids):
    interactions = []
    for uid in user_ids:
        liked_recipes = FAKE_USER_LIKES.get(uid, [])
        for recipe in liked_recipes:
            interactions.append({
                "user_id": uid,
                "recipe_name": recipe,
                "rating": 1
            })
    df_interactions = pd.DataFrame(interactions)
    
    user_item_matrix = df_interactions.pivot_table(
        index="user_id", columns="recipe_name", values="rating", fill_value=0
    )
    
    user_similarity = cosine_similarity(user_item_matrix)
    similarity_df = pd.DataFrame(
        user_similarity,
        index=user_item_matrix.index,
        columns=user_item_matrix.index
    )
    
    return df_interactions, similarity_df

def recommend_from_similar_users(target_user, all_user_ids, top_n=5):
    df_interactions, sim_df = build_interaction_matrix(all_user_ids)

    similar_users = sim_df[target_user].sort_values(ascending=False).drop(target_user)

    recommended = set()
    for sim_user in similar_users.index:
        liked = set(df_interactions[df_interactions.user_id == sim_user]["recipe_name"])
        target_liked = set(df_interactions[df_interactions.user_id == target_user]["recipe_name"])
        recommended.update(liked - target_liked)
        if len(recommended) >= top_n:
            break

    return list(recommended)[:top_n]

def search_recipes(query: str, limit: int = 20):
    """
    Simple substring search for recipes by name.
    Case-insensitive.
    """
    q = query.lower().strip()

    matches = df[df['Name'].str.lower().str.contains(q, na=False)]

    matches = matches.head(limit)

    return matches[['Name']].to_dict(orient="records")

# list of minor/non-essential ingredients to ignore when matching
MINOR_INGREDIENTS = {
    "salt", "pepper", "water", "oil", "olive oil", "vegetable oil",
    "butter", "sugar", "brown sugar", "ground pepper", "garlic powder",
    "onion powder", "chili powder", "paprika", "herbs", "parsley", "cilantro",
    "basil", "oregano", "thyme", "rosemary", "cumin", "coriander"
}

def find_semantic_subset_recipes(
    pantry_items: list,
    match_ratio_threshold: float = 1.0
):
    """
    Return recipes where most essential ingredients are present in the pantry.
    Minor ingredients (spices, herbs, salt, etc.) are ignored.
    """
    if not pantry_items:
        return pd.DataFrame(columns=df.columns)

    # canonicalize pantry items
    pantry_canonical = set(canonicalize_recipe_ingredients(pantry_items, auto_add=False))

    matches = []

    for _, row in df.iterrows():
        ingredients = row.get("RecipeIngredientParts")
        if ingredients is None or len(ingredients) == 0:
            continue

        if isinstance(ingredients, (np.ndarray, pd.Series)):
            ingredients = ingredients.tolist()
        elif isinstance(ingredients, str):
            ingredients = [ingredients]

        # canonicalize recipe ingredients
        recipe_canonical = canonicalize_recipe_ingredients(ingredients, auto_add=False)

        # filter out minor ingredients
        recipe_essentials = [ing for ing in recipe_canonical if ing not in MINOR_INGREDIENTS]
        if not recipe_essentials:
            continue

        # calculate fraction of recipe essentials that are in pantry
        matched_count = sum(1 for ing in recipe_essentials if ing in pantry_canonical)
        match_ratio = matched_count / len(recipe_essentials)

        if match_ratio >= match_ratio_threshold:
            matches.append(row)

    if not matches:
        return pd.DataFrame(columns=df.columns)

    return pd.DataFrame(matches)


if __name__ == "__main__":
    # local tests
    test_user_ids = [1, 2, 3]
    target_user = 1

    # print("\nTesting collaborative filtering:")
    # print(recommend_from_similar_users(target_user, test_user_ids, top_n=5))
    
    test_pantry_exact = [
    "coconut milk", "eggs", "palm sugar",
    "garlic", "sweet potatoes", "sour cream"
]
    
    # print("\nTesting content-based (pantry) recommendations:")
    # print(recommend_recipes(test_pantry, top_n=5))

    print("\nTesting subset recommendations:")
    df_subset = find_semantic_subset_recipes(test_pantry_exact, match_ratio_threshold=1.0)
    print(df_subset[['Name', 'RecipeIngredientParts']])
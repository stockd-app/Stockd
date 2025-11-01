import os
import joblib
import pandas as pd
import numpy as np
from sentence_transformers import SentenceTransformer
import faiss
import hashlib

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

if __name__ == "__main__":
    test_pantry = ["chicken breast", "wholewheat noodles", "oriental vegetables"]
    print("\nUser pantry:", test_pantry)

    recommendations = recommend_recipes(test_pantry, 10)
    print("\nTop Recipe Recommendations:")
    print(recommendations)
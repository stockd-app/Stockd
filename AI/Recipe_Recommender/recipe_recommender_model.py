import os
import joblib
import pandas as pd
import numpy as np
from sentence_transformers import SentenceTransformer
import faiss
import hashlib
from sklearn.metrics.pairwise import cosine_similarity
from typing import List, Set
import csv
from collections import defaultdict
from dotenv import load_dotenv
import re
from math import floor
from collections import Counter
from recipe_subset import canonicalize_recipe_ingredients, build_canonical_from_recipe_df, get_canonical_db, normalize_tokens

def prepare_ingredients_for_allergens(parts):
    """
    Convert RecipeIngredientParts to a clean list of strings
    for allergen detection, without modifying ingredients_text.
    """
    if isinstance(parts, list):
        return parts
    elif isinstance(parts, (np.ndarray, pd.Series)):
        return parts.tolist()
    elif isinstance(parts, str):
        # Convert string like "['milk' 'butter']" -> ['milk', 'butter']
        return re.findall(r"[a-zA-Z0-9]+(?: [a-zA-Z0-9]+)*", parts)
    else:
        return []

# load allergen map once
def load_allergen_map(csv_path):
    """
    Load allergen data from a CSV file and return a mapping of allergens to ingredients.
    Example output:
    {
        "peanut": {"peanut", "peanut butter", "peanut oil"},
        "dairy": {"milk", "cheese", "butter"},
        ...
    }
    """
    allergen_map = defaultdict(set)

    with open(csv_path, newline="", encoding="utf-8") as f:
        reader = csv.DictReader(f)
        for row in reader:
            ingredient = row["ingredient"].strip().lower()
            allergen = row["allergy"].strip().lower()
            if not ingredient or not allergen:
                continue
            allergen_map[allergen].add(ingredient)

    return dict(allergen_map)

def detect_allergens(ingredient_parts: List[str], ingredient_to_allergen: dict[str, str]) -> List[str]:
    """
    Detect allergens for a recipe using substring matching.
    Checks both the main allergen name and all its variants.
    Handles plurals and basic punctuation.
    """
    detected: Set[str] = set()

    for part in ingredient_parts:
        part_clean = re.sub(r"[^\w\s]", "", part.lower().strip())

        # exact match
        if part_clean in ingredient_to_allergen:
            detected.add(ingredient_to_allergen[part_clean])

        # substring match
        for key, allergen in ingredient_to_allergen.items():
            if key in part_clean:
                detected.add(allergen)

        # simple plural handling
        if part_clean.endswith("s"):
            singular = part_clean[:-1]
            if singular in ingredient_to_allergen:
                detected.add(ingredient_to_allergen[singular])

    return sorted(detected)

# build path to data file since relative paths can be unreliable
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
DATA_PATH = os.path.join(BASE_DIR, "data/recipes.parquet")
MODEL_PATH = os.path.normpath(os.path.join(BASE_DIR, "recipe_assets.pkl"))
INDEX_PATH = os.path.normpath(os.path.join(BASE_DIR, "recipe_index.faiss"))

dotenv_path = os.path.join(BASE_DIR, ".env")
load_dotenv(dotenv_path)
ALLERGENS_CSV_PATH = os.getenv("ALLERGENS_CSV_PATH")
if not ALLERGENS_CSV_PATH:
    raise RuntimeError("ALLERGENS_CSV_PATH env variable not set")

# If path is relative, resolve it from project root
if not os.path.isabs(ALLERGENS_CSV_PATH):
    PROJECT_ROOT = os.path.abspath(os.path.join(BASE_DIR, "..", ".."))
    ALLERGENS_CSV_PATH = os.path.join(PROJECT_ROOT, ALLERGENS_CSV_PATH)

if not os.path.exists(ALLERGENS_CSV_PATH):
    raise FileNotFoundError(f"Allergen CSV not found: {ALLERGENS_CSV_PATH}")

df = pd.read_parquet(DATA_PATH)
df = df.copy()
df = df.head(20000)

print(f"Initial dataset size: {len(df)}")

def has_valid_images(images):
    if images is None:
        return False
    if isinstance(images, (list, np.ndarray, pd.Series)):
        return any(isinstance(img, str) and img.strip() != "" for img in images)
    return False

df = df[df["Images"].apply(has_valid_images)]

print(f"Dataset size after removing recipes without images: {len(df)} rows")

# create a clean list of ingredients specifically for allergen detection
df['ingredients_list'] = df['RecipeIngredientParts'].apply(prepare_ingredients_for_allergens)

allergen_map = load_allergen_map(ALLERGENS_CSV_PATH)

ingredient_to_allergen = {}
for allergen, variants in allergen_map.items():
    for variant in variants:
        ingredient_to_allergen[variant.lower()] = allergen
    # Also map the main allergen itself
    ingredient_to_allergen[allergen.lower()] = allergen

df['Allergens'] = df['ingredients_list'].apply(
    lambda parts: detect_allergens(parts, ingredient_to_allergen)
)

# convert RecipeId to int to match IDs from likedrecipes
df["RecipeId"] = df["RecipeId"].astype(int)

df = df.head(20000)
# print("Sample RecipeIds in df:", df["RecipeId"].tolist()[:10])

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
    Search recipes by name (case-insensitive substring match)
    and return full recipe objects.
    """
    if not query:
        return []

    q = query.lower().strip()

    matches = df[
        df["Name"].str.lower().str.contains(q, na=False)
    ].head(limit)
    
    return matches.to_dict(orient="records")


def get_recipe_by_id(recipe_id: int):
    """
    Return a single recipe object by RecipeId.
    """
    recipe_id = int(recipe_id)

    match = df[df["RecipeId"] == recipe_id]

    if match.empty:
        return None

    return match.iloc[0].to_dict()

def recommend_by_liked_categories(
    liked_recipe_ids: list[int],
    total_recommendations: int = 10
):
    """
    Recommend recipes based on category distribution
    of the user's liked recipes.
    """

    if not liked_recipe_ids:
        return []

    liked_recipe_ids = [int(rid) for rid in liked_recipe_ids]

    # get liked recipes from df
    liked_df = df[df["RecipeId"].isin(liked_recipe_ids)]

    print("Liked DF size:", len(liked_df))
    print("Liked DF categories:", liked_df.get("RecipeCategory"))

    if liked_df.empty or "RecipeCategory" not in liked_df.columns:
        return []

    # count category frequencies
    category_counts = Counter(liked_df["RecipeCategory"])

    total_likes = sum(category_counts.values())

    # compute proportions
    category_ratios = {
        cat: count / total_likes
        for cat, count in category_counts.items()
    }

    # initial allocation using floor
    allocation = {
        cat: floor(ratio * total_recommendations)
        for cat, ratio in category_ratios.items()
    }

    # handle leftover slots
    allocated = sum(allocation.values())
    remaining = total_recommendations - allocated

    # assign remaining slots to highest-percentage categories
    for cat, _ in sorted(category_ratios.items(), key=lambda x: x[1], reverse=True):
        if remaining <= 0:
            break
        allocation[cat] += 1
        remaining -= 1

    recommendations = []

    for category, count in allocation.items():
        if count <= 0:
            continue

        candidates = df[
            (df["RecipeCategory"] == category) &
            (~df["RecipeId"].isin(liked_recipe_ids))
        ]

        if candidates.empty:
            continue

        sampled = candidates.sample(
            n=min(count, len(candidates)),
            random_state=42
        )

        recommendations.append(sampled)

    if not recommendations:
        return []

    result_df = pd.concat(recommendations)

    # backfill if we didn't hit total_recommendations
    if len(result_df) < total_recommendations:
        needed = total_recommendations - len(result_df)

        filler = df[
            ~df["RecipeId"].isin(
                set(result_df["RecipeId"]).union(set(liked_recipe_ids))
            )
        ].sample(n=min(needed, len(df)), random_state=42)

        result_df = pd.concat([result_df, filler])

    return result_df.head(total_recommendations).to_dict(orient="records")

# =========================== Searching Recipes By Subset, only what you have in your pantry  =====================================
# list of minor/non-essential ingredients to ignore when matching
MINOR_INGREDIENTS = {
    "salt", "pepper", "water", "oil", "olive oil", "vegetable oil",
    "butter", "sugar", "brown sugar", "ground pepper", "garlic powder",
    "onion powder", "chili powder", "paprika", "herbs", "parsley", "cilantro",
    "basil", "oregano", "thyme", "rosemary", "cumin", "coriander"
}

def is_valid_ingredient(x):
    if x is None:
        return False
    if not isinstance(x, str):
        return False
    x = x.strip().lower()
    return x not in {"", "n/a", "na", "none", "null"}

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

        valid_ingredients = [ing for ing in ingredients if is_valid_ingredient(ing)]
        if len(valid_ingredients) < 2:
            continue

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
    # # local tests
    # test_user_ids = [1, 2, 3]

    # print("Testing recipe by ID:")
    # recipe = get_recipe_by_id(373686)
    # print(recipe)

    # target_user = 1

    # print("\nTesting collaborative filtering:")
    # print(recommend_from_similar_users(target_user, test_user_ids, top_n=5))
    
#     test_pantry_exact = [
#     "tesco coconut milk 500ml",
#     "Tesco organic eggs",
#     "Thai palm sugar",
#     "easy garlic puree",
#     "sweet potatoes bag 1kg",
#     "sour cream sauce",
#     "Dunnes whole milk 1L carton",
#     "Bob’s Red Mill all-purpose flour 2lb bag",
#     "Organic Valley large free-range eggs dozen",
#     "Heinz tomato ketchup 500ml squeeze bottle",
#     "Lakeland unsalted butter sticks 4-pack",
#     "Frozen sweet corn 10oz bag",
#     "Sriracha hot chili sauce 17oz bottle",
#     "Fage Greek yogurt plain 5.3oz cup",
#     "Goya black beans can 15oz",
#     "Spaghetti pasta 16oz box"
# ]

    # test_pantry_exact = [
    #     "eggs",
    #     "chicken breast",
    #     "pasta",
    #     "broccoli",
    #     "cheese"
    # ]
    
    # print("\nTesting content-based (pantry) recommendations:")
    # print(recommend_recipes(test_pantry, top_n=5))
    
    # print("\n=== First 20 recipes with detected allergens ===\n")
    # for i, recipe in df.head(30).iterrows():
    #     print(f"RecipeId: {recipe['RecipeId']}")
    #     print(f"Name: {recipe['Name']}")
    #     print(f"Ingredients: {recipe['RecipeIngredientParts']}")
    #     print(f"Allergens detected: {recipe['Allergens']}")
    #     print("-" * 60)

    # print("\n=== Pantry Normalization Test ===")
    # for raw_item in test_pantry_exact:
    #     normalized = normalize_tokens(raw_item)
    #     canonicalized = canonicalize_recipe_ingredients([raw_item], auto_add=False)[0]
    #     print(f"Raw: '{raw_item}' -> Normalized: '{normalized}' -> Canonical: '{canonicalized}'")

    # print("\nTesting subset recommendations:")
    # df_subset = find_semantic_subset_recipes(test_pantry_exact, match_ratio_threshold=1.0)
    # print(df_subset[['Name', 'RecipeIngredientParts']])

    print("\n=== Testing recommend_by_liked_categories ===")

    # Simulate a user who mostly likes Chicken, some Dessert
    liked_recipe_ids = [
        39, 101, # Chicken Breast (50%)
        38, 128,  # Frozen Desserts (30%)
    ]

    recommendations = recommend_by_liked_categories(liked_recipe_ids)

    print(f"Returned {len(recommendations)} recipes:\n")

    returned_categories = Counter(
        r["RecipeCategory"] for r in recommendations
    )

    print("Category distribution in recommendations:")
    for cat, count in returned_categories.items():
        print(f"{cat}: {count}")

    print("\nSample recipes:")
    for r in recommendations[:10]:
        print(
            f"RecipeId={r['RecipeId']} | "
            f"Category={r['RecipeCategory']} | "
            f"Name={r.get('Name', 'N/A')}"
        )

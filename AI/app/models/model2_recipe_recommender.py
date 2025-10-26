import os
import joblib
import pandas as pd
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity

# build path to data file since relative paths can be unreliable
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
DATA_PATH = os.path.join(BASE_DIR, "../data/recipes.parquet")
DATA_PATH = os.path.normpath(DATA_PATH)
MODEL_PATH = os.path.join(BASE_DIR, "recipe_model.pkl")
MODEL_PATH = os.path.normpath(MODEL_PATH)

df = pd.read_parquet(DATA_PATH)

df = df[['Name', 'RecipeIngredientParts']] # keeps these columns and drops everything else for testing purposes

# join each list in recipeingredientparts into a single string so TF-IDF can process it
df['ingredients_text'] = df['RecipeIngredientParts'].apply(
    lambda x: " ".join(x).lower() if isinstance(x, list) else str(x).lower()
)

# load cached model if exists, otherwise initialize TF-IDF and save
if os.path.exists(MODEL_PATH):
    vectorizer, tfidf_matrix = joblib.load(MODEL_PATH)
else:
    vectorizer = TfidfVectorizer(stop_words='english')
    tfidf_matrix = vectorizer.fit_transform(df['ingredients_text'])
    joblib.dump((vectorizer, tfidf_matrix), MODEL_PATH)

def recommend_recipes(pantry_items, top_n=10):
    """
    Recommend top N recipes based on a user's pantry ingredients.
    """
    pantry_text = " ".join(pantry_items).lower()
    pantry_vec = vectorizer.transform([pantry_text])

    similarities = cosine_similarity(pantry_vec, tfidf_matrix).flatten()
    df['similarity'] = similarities

    top_recipes = df.sort_values(by='similarity', ascending=False).head(top_n)
    return top_recipes[['Name', 'similarity']]

if __name__ == "__main__":
    test_pantry = ["blueberries", "lemon juice", "sugar"]
    print("\nUser pantry:", test_pantry)

    recommendations = recommend_recipes(test_pantry, top_n=10)
    print("\nTop Recipe Recommendations:")
    print(recommendations)
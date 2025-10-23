import os
import pandas as pd
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity

# build path to data file since relative paths can be unreliable
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
DATA_PATH = os.path.join(BASE_DIR, "../data/recipes.parquet")
DATA_PATH = os.path.normpath(DATA_PATH)

df = pd.read_parquet(DATA_PATH)

df = df[['Name', 'RecipeIngredientParts']] # keeps these columns and drops everything else for testing purposes

# join each list in recipeingredientparts into a single string so TF-IDF can process it
df['ingredients_text'] = df['RecipeIngredientParts'].apply(
    lambda x: " ".join(x).lower() if isinstance(x, list) else str(x).lower()
)

# initialize TF-IDF
vectorizer = TfidfVectorizer(stop_words='english')
tfidf_matrix = vectorizer.fit_transform(df['ingredients_text'])

# user's pantry items (later read this in from logged-in user's pantry)
user_pantry = ["blueberries", "lemon juice", "sugar"]

# convert pantry list to string and vectorize
pantry_text = " ".join(user_pantry)
pantry_vec = vectorizer.transform([pantry_text])

# compute cosine similarity
similarities = cosine_similarity(pantry_vec, tfidf_matrix).flatten()
df['similarity'] = similarities

# get top 10 matching recipes
top_recipes = df.sort_values(by='similarity', ascending=False).head(10)

print("\nTop 10 Recipe Recommendations:")
print(top_recipes[['Name', 'similarity']])
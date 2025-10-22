import os
import pandas as pd
# from sklearn.feature_extraction.text import TfidfVectorizer
# from sklearn.metrics.pairwise import cosine_similarity

# building path to data file since relative paths can be unreliable
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
DATA_PATH = os.path.join(BASE_DIR, "../data/recipes.parquet")
DATA_PATH = os.path.normpath(DATA_PATH)

df = pd.read_parquet(DATA_PATH)
print(f"Loading dataset from: {DATA_PATH}")
# print(df.head())

# for col in df.columns:
#     print(col)

df = df[['recipeingredientparts']] # keeps this column and drops everything else for testing purposes
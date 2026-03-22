# AI (Food Classifier and Recipe Recommender)

In this project we are making use of two models:

- **Food Classifier**: which takes list of items from asprice's output and add labels to those items such as food/non-food, storage, what kind of food it is. It uses facebook BART mnli for the functionality.
- **Recipe Recommender**: which is a local recipe-recommendation AI service powered by a Food.com dataset

# Food Classifier — Setup Guide

## Follow the steps below to set up the environment and run the server.

---

## 📥 1. File Structure

Your file structure should look like:
AI/
└─ Food_Classifier/
├─ data_cleaning/
├─ food_classifier_model.py
├─ food_classifier_requirements.txt
└─ food_classifier_server.py

## 📦 2. Install Dependencies

Navigate into the Food_Classifier directory:
pip install -r food_classifier_requirements.txt

## ⚙️ 3. Configure Environment Variables

Inside the `Backend` directory, open your `.env` file (create one if needed) and add:
Local Development:

- FOOD_CLASSIFER_MODEL_URL=http://<your_ip>:9002

Replace `<your_ip>` with your machine’s actual local IP address.

Running in containers:

- FOOD_CLASSIFER_MODEL_URL=http://localhost:9002

---

## 🚀 4. Run the Server

Start the server:
python food_classifier_server.py

> ⏳ **Note:** The first launch performs an initial setup and may take some time.

Now you can navigate to the Swagger docs to test the endpoints. You can find the Swagger doc by going to this URL:
http://<your_ip>:9002/docs for food classifier

# Recipe Recommender — Setup Guide

Follow the steps below to set up the environment and run the server.

---

## 📥 1. Download the Dataset

1. Download the dataset archive from Kaggle:  
   **Food.com Recipes and Reviews**  
   https://www.kaggle.com/datasets/irkaal/foodcom-recipes-and-reviews
2. Extract the zip file named archive.
3. Locate the file **`recipes.parquet`**.
4. Create a `data` directory inside the project at:
   AI/Recipe_Recommender/data

5. Place **`recipes.parquet`** into this newly created `data` folder.
6. There should be a folder called canonical_db inside Recipe_Recommender. Ensure there is nothing in it (delete existing files) as it will be generated at startup. If the change you are testing involves any code change in recipe_recommender_server.py, then you should also delete recipe_assets.pkl and recipe_index.faiss.
7. Download the following dataset from Kaggle:
   **Food.com Recipes with Ingredients and Tags**
   https://www.kaggle.com/datasets/realalexanderwei/food-com-recipes-with-ingredients-and-tags
8. Extract the folder.
9. Rename the recipes_ingredients.csv to units.csv
10. 5. Place **`units.csv`** into the `data` folder.

Your file structure should look like:
AI/
└─ Recipe_Recommender/
├─ canonical_db/
│ └─canonical_emb.npy (after running the recipe_recommender_model once)
│ └─canonical_names.json (after running the recipe_recommender_model once)
│ └─canonical.faiss (after running the recipe_recommender_model once)
├─ data/
│ └─ recipes.parquet
│ └─ units.csv
├─ recipe_recommender_model.py
├─ recipe_recommender_requirements.txt
├─ recipe_recommender_server.py
└─ recipe_subset.py

## 📦 2. Install Dependencies

Navigate into the Recipe_Recommender directory:
pip install -r recipe_recommender_requirements.txt
Note that pip install does not work for ntlk for unknown reason. Therefore, you would need to:
   - Perform steps according to `https://www.nltk.org/data.html#manual-installation`. (Only corpora)
   - `nltk_data` folder and `corpora` subfolder could be placed under:
      - 'C:\\Users\\yourusername/nltk_data'
      - 'C:\\Users\\yourusername\\AppData\\Roaming\\nltk_data'
      - 'C:\\nltk_data'
      - 'D:\\nltk_data'
      - 'E:\\nltk_data' 
   - Populate the `corpora` subfolder with the unzipped folder of `https://raw.githubusercontent.com/nltk/nltk_data/gh-pages/packages/corpora/wordnet.zip` and `https://raw.githubusercontent.com/nltk/nltk_data/gh-pages/packages/corpora/omw-1.4.zip`. And those steps should suffice.

## ⚙️ 3. Configure Environment Variables

Inside the `Backend` directory, open your `.env` file (create one if needed) and add:
Local Development:

- RECIPE_RECOMMENDER_MODEL_URL=http://<your_ip>:9001

Replace `<your_ip>` with your machine’s actual local IP address.

Running in containers:

- RECIPE_RECOMMENDER_MODEL_URL=http://localhost:9001

---

## 🚀 4. Run the Recipe Recommender Server

Start the server:
cd into AI/Recipe_Recommender
Then run the following command
python recipe_recommender_server.py

> ⏳ **Note:** The first launch performs an initial setup and may take some time.

Now you can navigate to the Swagger docs to test the endpoints. You can find the Swagger doc by going to this URL:

http://<your_ip>:9001/docs for recipe recommender

## Any Issues

Ensure you have your correct IP address in the Backend .env file.
If any changes are made regarding the dataset in the Recipe Recommender, it is safe to delete recipe_assets.pkl. recipe_index.faiss, anything inside canonical_db, and then re-run them. Just note they will require a few extra minutes at startup to regenerate.
Ensure the database/XAMPP/MySQL is running and you have the latest schema.
Ensure that your local branch is up to date with origin main.


## 🔐 Input Sanitization

All user input and external data is sanitized on the backend before being stored, processed, or sent to AI services.

What is sanitized:
Text fields (item names, categories, search queries, user names)
   Trimmed, HTML-escaped, length-limited
   Unsafe characters removed

Numeric values (quantities)
   Converted to numbers
   Negative values are not allowed (clamped to 0)

URLs (profile images, product images)
   Only valid http:// and https:// URLs are accepted

Why:
Prevents invalid or malicious data
Ensures consistent pantry and AI behavior
Protects against XSS and injection issues
The frontend relies on React’s built-in escaping and does not render raw HTML. All critical sanitization is enforced server-side.
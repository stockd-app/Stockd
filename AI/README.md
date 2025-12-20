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

Your file structure should look like:
AI/
└─ Recipe_Recommender/
├─ data/
│ └─ recipes.parquet
├─ recipe_recommender_model.py
├─ recipe_recommender_requirements.txt
└─ recipe_recommender_server.py

## 📦 2. Install Dependencies

Navigate into the Recipe_Recommender directory:
pip install -r recipe_recommender_requirements.txt

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
python recipe_recommender_server.py

> ⏳ **Note:** The first launch performs an initial setup and may take some time.

Now you can navigate to the Swagger docs to test the endpoints. You can find the Swagger doc by going to this URL:

http://<your_ip>:9001/docs for recipe recommender

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
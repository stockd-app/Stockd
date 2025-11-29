# Recipe Recommender — Setup Guide

This project provides a local recipe-recommendation AI service powered by a Food.com dataset. Follow the steps below to set up the environment and run the server.

---

## 📥 1. Download the Dataset

1. Download the dataset archive from Kaggle:  
   **Food.com Recipes and Reviews**  
   https://www.kaggle.com/datasets/irkaal/foodcom-recipes-and-reviews
2. Extract the zip file named archive.
3. Locate the file **`recipes.parquet`**.
4. Create a `data` directory inside the project at:
AI/app/data

5. Place **`recipes.parquet`** into this newly created `data` folder.

Your file structure should look like:
AI/
└─ app/
├─ data/
│ └─ recipes.parquet
└─ server_recipe_recommender.py


## 📦 2. Install Dependencies

From the project root, install the required Python packages
pip install -r requirements.txt

## ⚙️ 3. Configure Environment Variables
Inside the `Backend` directory, open your `.env` file (create one if needed) and add:
FOOD_CLASSIFER_MODEL_URL=http://192.168.x.x:9000
RECIPE_RECOMMENDER_MODEL_URL=http://192.168.x.x:9001

Replace `192.168.x.x` with your machine’s actual local IP address.

---

## 🚀 4. Run the Recipe Recommender Server

Navigate into the app directory:
cd AI/app
Start the server:
python server_recipe_recommender.py

> ⏳ **Note:** The first launch performs an initial setup and may take some time.

Now you can navigate to the Swagger docs to test the endpoints. You can find the Swagger doc by going to this URL:
http://<YOUR_IP>:9000/docs for item classifier
OR
http://<YOUR_IP>:9000/docs for recipe recommender
# AI Services - Food Classifier & Recipe Recommender

> Intelligent food classification and personalized recipe recommendations for your pantry.

## 📋 Overview

This project includes two AI microservices:

| Service                | Purpose                                                                                            | Technology                                      |
| ---------------------- | -------------------------------------------------------------------------------------------------- | ----------------------------------------------- |
| **Food Classifier**    | Classifies receipt items as food/non-food, determines storage location, and categorizes food types | Facebook BART-MNLI (Zero-shot)                  |
| **Recipe Recommender** | Provides personalized recipe suggestions based on pantry ingredients                               | Sentence Transformers + Collaborative Filtering |

---

## 🏗️ System Architecture

![Food Classifier Architecture](https://i.ibb.co/FL1Dsqz7/Untitled-2025-10-15-1640-excalidraw.png)

The architecture shows how receipt items flow through the classification pipeline, from OCR extraction to final categorization.

---

## 🍎 Food Classifier Setup

### Quick Start

```bash
# Navigate to the directory
cd AI/Food_Classifier

# Install dependencies
pip install -r food_classifier_requirements.txt

# Run the server
python food_classifier_server.py
```

### Environment Configuration

Add to your `Backend/.env` file:

```bash
# Local Development
FOOD_CLASSIFER_MODEL_URL=http://<your_ip>:9002

# Docker/Container
FOOD_CLASSIFER_MODEL_URL=http://localhost:9002
```

### API Documentation

Once running, access Swagger docs at:

```
http://<your_ip>:9002/docs
```

> ⏳ **Note:** First launch may take a few minutes for model initialization.

---

## 🍳 Recipe Recommender Setup

### Prerequisites

1. **Download Food.com Dataset**
   - [Recipes and Reviews](https://www.kaggle.com/datasets/irkaal/foodcom-recipes-and-reviews)
   - Extract and place `recipes.parquet` in `AI/Recipe_Recommender/data/`

2. **Download Ingredients Dataset**
   - [Recipes with Ingredients and Tags](https://www.kaggle.com/datasets/realalexanderwei/food-com-recipes-with-ingredients-and-tags)
   - Rename `recipes_ingredients.csv` to `units.csv`
   - Place in `AI/Recipe_Recommender/data/`

### File Structure

```
AI/Recipe_Recommender/
├── canonical_db/          # Generated at runtime
├── data/
│   ├── recipes.parquet
│   └── units.csv
├── recipe_recommender_model.py
├── recipe_recommender_requirements.txt
└── recipe_recommender_server.py
```

### Installation

```bash
cd AI/Recipe_Recommender

# Install dependencies
pip install -r recipe_recommender_requirements.txt
```

#### NLTK Setup (Required)

NLTK data must be manually installed:

1. Download corpora:
   - [wordnet.zip](https://raw.githubusercontent.com/nltk/nltk_data/gh-pages/packages/corpora/wordnet.zip)
   - [omw-1.4.zip](https://raw.githubusercontent.com/nltk/nltk_data/gh-pages/packages/corpora/omw-1.4.zip)

2. Extract to one of these locations:
   ```
   C:\Users\<username>\nltk_data\corpora\
   C:\Users\<username>\AppData\Roaming\nltk_data\corpora\
   C:\nltk_data\corpora\
   ```

### Environment Configuration

Add to your `Backend/.env` file:

```bash
# Local Development
RECIPE_RECOMMENDER_MODEL_URL=http://<your_ip>:9001

# Docker/Container
RECIPE_RECOMMENDER_MODEL_URL=http://localhost:9001
```

### Run the Server

```bash
python recipe_recommender_server.py
```

### API Documentation

Access Swagger docs at:

```
http://<your_ip>:9001/docs
```

> ⏳ **Note:** First launch generates embeddings and indices, which may take several minutes.

---

## 🔐 Security & Input Sanitization

All user input is sanitized on the backend before processing:

| Input Type         | Sanitization                                                     |
| ------------------ | ---------------------------------------------------------------- |
| **Text Fields**    | Trimmed, HTML-escaped, length-limited, unsafe characters removed |
| **Numeric Values** | Converted to numbers, negative values clamped to 0               |
| **URLs**           | Only valid `http://` and `https://` accepted                     |

**Why?**

- Prevents XSS and injection attacks
- Ensures consistent AI behavior
- Protects data integrity

Frontend relies on React's built-in escaping. All critical sanitization is server-side.

---

## 🛠️ Troubleshooting

### Common Issues

**Service won't start:**

- Verify correct IP address in `Backend/.env`
- Ensure ports 9001 and 9002 are available
- Check that database/MySQL is running

**Recipe Recommender issues:**

- Delete generated files and restart:
  ```bash
  rm recipe_assets.pkl recipe_index.faiss
  rm -rf canonical_db/*
  ```
- Ensure `recipes.parquet` and `units.csv` are in `data/` folder

**Model loading errors:**

- First run takes longer for model downloads
- Ensure stable internet connection
- Check disk space for model files

### Fresh Start

If you encounter persistent issues:

1. Delete generated files:

   ```bash
   # Recipe Recommender
   rm recipe_assets.pkl recipe_index.faiss
   rm -rf canonical_db/*
   ```

2. Ensure latest code:

   ```bash
   git pull origin main
   ```

3. Verify database schema is up to date

4. Restart services

---

## 📊 Model Details

### Food Classifier

- **Model:** facebook/bart-large-mnli
- **Type:** Zero-shot classification
- **Port:** 9002
- **Response Time:** ~100-200ms per item

### Recipe Recommender

- **Model:** Sentence Transformers (MiniLM)
- **Similarity Search:** FAISS
- **Dataset:** 500K+ recipes from Food.com
- **Port:** 9001
- **Response Time:** ~50-100ms per query

---

## 📝 API Endpoints

### Food Classifier

```http
POST /classify-items
Content-Type: application/json

{
  "store": "Tesco",
  "items": {
    "Frozen Mixed Berries 300g": 1,
    "Whole Cucumber": 2
  }
}
```

### Recipe Recommender

```http
POST /recommend-recipes
Content-Type: application/json

{
  "user_id": 123,
  "pantry_items": ["chicken", "rice", "tomatoes"],
  "limit": 10
}
```

---

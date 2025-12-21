import pandas as pd
from transformers import pipeline
from sklearn.metrics import accuracy_score, classification_report
import torch
import sys
import os
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), '../..')))
from Backend.app.utils.sanitizer import sanitize_text

class FoodLabeler:
    def __init__(self):
        self.clf = pipeline("zero-shot-classification", model="facebook/bart-large-mnli")
        self.food_labels = ["food", "non-food"]
        self.storage_labels = ["a cool dry pantry", "a refrigerator", "a freezer"]
        self.storage_map = {
            "a cool dry pantry": "Pantry",
            "a refrigerator": "Refrigerator",
            "a freezer": "Freezer"
        }
        self.food_categories = [
            "cereal","coffee","sweets","snacks","beverage","dairy",
            "fruit","vegetable","meat","grain"
        ]

    def classify(self, item):
        item = sanitize_text(item)
        
        # 1. food vs non-food
        food_res = self.clf(item, self.food_labels, hypothesis_template="This is a {}.")
        food_label = food_res['labels'][0]

        if food_label == "non-food":
            return {
                "item": item,
                "is_food": "non-food",
                "storage": None,
                "category": None,
            }

        # 2. storage
        storage_res = self.clf(item, self.storage_labels,
                               hypothesis_template="This food item should be stored in the {}.")
        storage_label = self.storage_map[storage_res['labels'][0]]

        # 3. specific food category
        cat_res = self.clf(item, self.food_categories,
                           hypothesis_template="This is a {}.")
        category = cat_res['labels'][0]

        return {
            "item": item,
            "is_food": "food",
            "storage": storage_label,
            "category": category,
        }
    

if __name__ == "__main__":
    model = FoodLabeler()
    tesco_products = [ "Tesco Choco Snaps Cereal 350g", "Tesco Gold Instant Coffee 200g", "Tesco Whole Cucumber", "Oaities Chocolate Chip Cookies 300g", "Tesco 4711 Acqua Colonia “Floral Fields of Ireland” Eau de Cologne 50ml", "Tesco F&F Ottoman Storage Chair", "Tesco Household Washing Liquid", "Tesco Frozen Mixed Berries 300g", ]
    result = []
    for product in tesco_products:
        classification = model.classify(product)
        result.append(classification)
    print("Model's Result", result)


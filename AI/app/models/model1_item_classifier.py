import pandas as pd
from transformers import pipeline
from sklearn.metrics import accuracy_score, classification_report
import torch 

# Food vs Non-Food classification
food_labels = ["food", "non-food"]

classifier = pipeline("zero-shot-classification", model="facebook/bart-large-mnli")

def classify_food_or_non_food(item):
    premise = item
    results = classifier(premise, food_labels, hypothesis_template="This is a {}.")
    
    print(f"Item: {item}")
    print("Food vs Non-Food Classification Results:")
    for label, score in zip(results['labels'], results['scores']):
        print(f"{label}: {score:.4f}")
    print("-" * 40)
    
    return results['labels'][0], results['scores'][0]

print("Zero-shot classifier loaded!")
print(f"Candidate labels: {food_labels}")

items_to_classify = [
    "Apple", "Shampoo", "Frozen Pizza", "Milk", "Lamp",
    "Bread", "Toothpaste", "Socks"
]


tesco_products = [
    "Tesco Choco Snaps Cereal 350g",       
    "Tesco Gold Instant Coffee 200g",      
    "Tesco Whole Cucumber",                 
    "Oaities Chocolate Chip Cookies 300g",      
    "Tesco 4711 Acqua Colonia “Floral Fields of Ireland” Eau de Cologne 50ml",  
    "Tesco F&F Ottoman Storage Chair", 
    "Tesco Household Washing Liquid",       
    "Tesco Frozen Mixed Berries 300g",         
]

classified_items = []
for item in tesco_products:
    label, score = classify_food_or_non_food(item)
    if label == "food":
        classified_items.append(item)

print(f"Food Items: {classified_items}")

# Storage classification
storage_labels = [
    "a cool dry pantry",
    "a refrigerator",
    "a freezer"
]

label_map = {
    "a cool dry pantry": "Pantry",
    "a refrigerator": "Refrigerator",
    "a freezer": "Freezer"
}

def classify_storage(item):
    premise = item 
    results = classifier(premise, storage_labels, hypothesis_template="This food item should be stored in the {}.")
    
    print(f"Item: {item}")
    print("Storage Classification Results:")
    for label, score in zip(results['labels'], results['scores']):
        print(f"{label}: {score:.4f}")
    print("-" * 40)
    
    clean_label = label_map[results['labels'][0]]
    return clean_label, results['scores'][0]

food_storage_classified = {}
for item in classified_items:
    label, score = classify_storage(item)
    food_storage_classified[item] = [{'storage': label}]

print("Food Storage Classification Results:")
# for item, storage in food_storage_classified.items():
#     print(f"{item}: {storage}")
print(f"Food Items: {food_storage_classified}")

# Specific food category classification
specific_food_labels = [
    "cereal", "coffee", "sweets", "snacks", 
    "beverage", "dairy", "fruit", "vegetable", "meat", "grain",
]

def classify_specific_food(item):
    premise = item  
    results = classifier(premise, specific_food_labels, hypothesis_template="This is a {}.")

    best_label = results['labels'][0]
    best_score = results['scores'][0]

    print(f"Item: {item}")
    print(f"Item: {item:15} → {best_label} ({best_score:.3f})")
    # for label, score in zip(results['labels'], results['scores']):
    #     print(f"{label}: {score:.4f}")
        
    print("-------------")
    
    return best_label, best_score

# Testing
specific_food_classified = {}

for item in food_storage_classified:
    label, score = classify_specific_food(item)
    specific_food_classified[item] = food_storage_classified[item][0], {"type":label}

# for item, food_category in specific_food_classified.items():
#     print(f"{item}: {food_category}")
print(f"Specific Food Categories: {specific_food_classified}")
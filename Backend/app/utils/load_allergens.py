from collections import defaultdict
import csv

# ALLERGENS_CSV_PATH = os.getenv("ALLERGENS_CSV_PATH", "../data/allergens.csv") 
# Add above line from wherver this function is being called

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

# Example usage:
# allergen_map = load_allergen_map("../data/allergens.csv")
# print(allergen_map)
import re
from typing import Dict, Tuple, Optional, Any

# Conversion factors to metric units (grams for weight, milliliters for volume)
CONVERSIONS = {
    "cup": 240,
    "cups": 240,
    "tablespoon": 15,
    "tablespoons": 15,
    "tbsp": 15,
    "teaspoon": 5,
    "teaspoons": 5,
    "tsp": 5,
    "fluid ounce": 30,
    "fluid ounces": 30,
    "fl oz": 30,
    "fl. oz": 30,
    "ounce": 30,
    "ounces": 30,
    "oz": 30,
    "pint": 473,
    "pints": 473,
    "pt": 473,
    "quart": 946,
    "quarts": 946,
    "qt": 946,
    "gallon": 3785,
    "gallons": 3785,
    "gal": 3785,
    "pound": 454,
    "pounds": 454,
    "lb": 454,
    "lbs": 454,
    "ounce_weight": 28.35, 
    "oz_weight": 28.35,
    "gram": 1,
    "grams": 1,
    "g": 1,
    "kilogram": 1000,
    "kilograms": 1000,
    "kg": 1000,
    "milliliter": 1,
    "milliliters": 1,
    "millilitre": 1,
    "millilitres": 1,
    "ml": 1,
    "liter": 1000,
    "liters": 1000,
    "litre": 1000,
    "litres": 1000,
    "l": 1000,
}

# Common fractions
FRACTIONS = {
    "1/4": 0.25,
    "1/3": 0.33,
    "1/2": 0.5,
    "2/3": 0.67,
    "3/4": 0.75,
    "¼": 0.25,
    "⅓": 0.33,
    "½": 0.5,
    "⅔": 0.67,
    "¾": 0.75,
    "⅛": 0.125,
    "⅜": 0.375,
    "⅝": 0.625,
    "⅞": 0.875,
}

# Ingredient categories for determining if weight or volume
LIQUID_KEYWORDS = [
    "water", "milk", "juice", "broth", "stock", "oil", "vinegar", 
    "wine", "beer", "cream", "sauce", "syrup", "honey", "liquid",
    "melted", "coconut milk", "soy sauce", "worcestershire"
]

SOLID_KEYWORDS = [
    "flour", "sugar", "salt", "pepper", "butter", "cheese", "meat",
    "chicken", "beef", "pork", "fish", "vegetable", "fruit", "nut",
    "chocolate", "cocoa", "powder", "spice"
]

def parse_quantity(quantity_str: str) -> float:
    """
    Parse a quantity string that may contain fractions, decimals, or ranges.
    """
    if not quantity_str:
        return 1.0
    
    quantity_str = str(quantity_str).strip()
    
    for frac, value in FRACTIONS.items():
        if frac in quantity_str:
            quantity_str = quantity_str.replace(frac, str(value))
    
    if "-" in quantity_str or "to" in quantity_str.lower():
        parts = re.split(r"[-–—]|to", quantity_str, flags=re.IGNORECASE)
        try:
            nums = [float(p.strip()) for p in parts if p.strip()]
            return sum(nums) / len(nums)
        except:
            pass
    
    mixed_match = re.match(r"(\d+)\s+(\d+)/(\d+)", quantity_str)
    if mixed_match:
        whole = float(mixed_match.group(1))
        numerator = float(mixed_match.group(2))
        denominator = float(mixed_match.group(3))
        return whole + (numerator / denominator)
    
    frac_match = re.match(r"(\d+)/(\d+)", quantity_str)
    if frac_match:
        numerator = float(frac_match.group(1))
        denominator = float(frac_match.group(2))
        return numerator / denominator
    
    try:
        return float(re.findall(r"\d+\.?\d*", quantity_str)[0])
    except:
        return 1.0

if __name__ == "__main__":
    test_cases = [
        "1 cup", "2 tablespoons", "1/2 tsp", "3-4 cups", "1 to 2 tbsp",
        "1 1/2 cups", "¼ cup", "⅓ cup", "½ cup", "⅔ cup", "¾ cup",
        "1.5 cups", "2.5 tbsp"
    ]
    
    for test in test_cases:
        quantity = parse_quantity(test)
        print(f"'{test}' -> {quantity}")
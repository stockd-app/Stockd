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

def is_liquid_ingredient(ingredient_name: str) -> bool:
    ingredient_lower = ingredient_name.lower()
    return any(keyword in ingredient_lower for keyword in LIQUID_KEYWORDS)


def standardize_unit(quantity: float, unit: str, ingredient_name: str = "") -> Tuple[float, str]:
    if not unit:
        return quantity, "piece"
    
    unit_lower = unit.lower().strip()
    
    if unit_lower in ["g", "gram", "grams", "kg", "kilogram", "kilograms"]:
        if unit_lower in ["kg", "kilogram", "kilograms"]:
            return quantity, "kg"
        return quantity, "g"
    
    if unit_lower in ["ml", "milliliter", "milliliters", "millilitre", "millilitres"]:
        return quantity, "ml"
    
    if unit_lower in ["l", "liter", "liters", "litre", "litres"]:
        return quantity, "l"
    
    is_liquid = is_liquid_ingredient(ingredient_name)
    
    if unit_lower in ["cup", "cups", "tablespoon", "tablespoons", "tbsp", "teaspoon", 
                      "teaspoons", "tsp", "fluid ounce", "fluid ounces", "fl oz", 
                      "fl. oz", "pint", "pints", "pt", "quart", "quarts", "qt", 
                      "gallon", "gallons", "gal"]:
        ml_value = quantity * CONVERSIONS.get(unit_lower, 1)
        
        if ml_value >= 1000:
            return round(ml_value / 1000, 2), "l"
        return round(ml_value, 0), "ml"
    
    if unit_lower in ["pound", "pounds", "lb", "lbs"]:
        grams = quantity * CONVERSIONS["pound"]
        if grams >= 1000:
            return round(grams / 1000, 2), "kg"
        return round(grams, 0), "g"
    
    if unit_lower in ["ounce", "ounces", "oz"]:
        if is_liquid:
            ml_value = quantity * CONVERSIONS["oz"]
            if ml_value >= 1000:
                return round(ml_value / 1000, 2), "l"
            return round(ml_value, 0), "ml"
        else:
            grams = quantity * CONVERSIONS["ounce_weight"]
            if grams >= 1000:
                return round(grams / 1000, 2), "kg"
            return round(grams, 0), "g"
    
    return quantity, unit_lower

if __name__ == "__main__":
    test_cases = [
        ("1 1/2", "cup", "milk"),
        ("2-3", "tablespoons", "oil"),
        ("½", "teaspoon", "salt"),
        ("3/4", "pound", "flour"),
        ("1.5", "kg", "chicken"),
        ("1000", "ml", "broth"),
        ("2", "", "egg"),
        ("1/4", "oz", "vanilla extract"),
    ]
    
    for qty_str, unit, ingredient in test_cases:
        qty = parse_quantity(qty_str)
        std_qty, std_unit = standardize_unit(qty, unit, ingredient)
        print(f"{qty_str} {unit} of {ingredient} -> {std_qty} {std_unit}")
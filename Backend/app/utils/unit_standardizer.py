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
    
    # Weight conversions to grams
    "pound": 454,
    "pounds": 454,
    "lb": 454,
    "lbs": 454,
    "ounce_weight": 28.35,  # for solid ingredients
    "oz_weight": 28.35,
    
    # Already metric - no conversion needed
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
    
    Args:
        quantity_str: String like "1 1/2", "2.5", "1-2", "1/4"
    
    Returns:
        Float value of the quantity
    """
    if not quantity_str:
        return 1.0
    
    quantity_str = str(quantity_str).strip()
    
    # Handle unicode fractions
    for frac, value in FRACTIONS.items():
        if frac in quantity_str:
            quantity_str = quantity_str.replace(frac, str(value))
    
    # Handle ranges (take the average)
    if "-" in quantity_str or "to" in quantity_str.lower():
        parts = re.split(r"[-–—]|to", quantity_str, flags=re.IGNORECASE)
        try:
            nums = [float(p.strip()) for p in parts if p.strip()]
            return sum(nums) / len(nums)
        except:
            pass
    
    # Handle mixed numbers like "1 1/2"
    mixed_match = re.match(r"(\d+)\s+(\d+)/(\d+)", quantity_str)
    if mixed_match:
        whole = float(mixed_match.group(1))
        numerator = float(mixed_match.group(2))
        denominator = float(mixed_match.group(3))
        return whole + (numerator / denominator)
    
    # Handle simple fractions like "1/2"
    frac_match = re.match(r"(\d+)/(\d+)", quantity_str)
    if frac_match:
        numerator = float(frac_match.group(1))
        denominator = float(frac_match.group(2))
        return numerator / denominator
    
    # Handle decimal numbers
    try:
        return float(re.findall(r"\d+\.?\d*", quantity_str)[0])
    except:
        return 1.0


def is_liquid_ingredient(ingredient_name: str) -> bool:
    """
    Determine if an ingredient is likely a liquid based on keywords.
    
    Args:
        ingredient_name: Name of the ingredient
    
    Returns:
        True if likely a liquid, False otherwise
    """
    ingredient_lower = ingredient_name.lower()
    return any(keyword in ingredient_lower for keyword in LIQUID_KEYWORDS)


def standardize_unit(quantity: float, unit: str, ingredient_name: str = "") -> Tuple[float, str]:
    """
    Convert a quantity and unit to Irish/UK standard units.
    
    Args:
        quantity: Numeric quantity
        unit: Unit string (e.g., "cup", "oz", "lb")
        ingredient_name: Name of ingredient (helps determine liquid vs solid)
    
    Returns:
        Tuple of (standardized_quantity, standardized_unit)
    """
    if not unit:
        return quantity, "piece"
    
    unit_lower = unit.lower().strip()
    
    # Check if already metric
    if unit_lower in ["g", "gram", "grams", "kg", "kilogram", "kilograms"]:
        if unit_lower in ["kg", "kilogram", "kilograms"]:
            return quantity, "kg"
        return quantity, "g"
    
    if unit_lower in ["ml", "milliliter", "milliliters", "millilitre", "millilitres"]:
        return quantity, "ml"
    
    if unit_lower in ["l", "liter", "liters", "litre", "litres"]:
        return quantity, "l"
    
    # Determine if ingredient is liquid or solid
    is_liquid = is_liquid_ingredient(ingredient_name)
    
    # Convert volume measurements
    if unit_lower in ["cup", "cups", "tablespoon", "tablespoons", "tbsp", "teaspoon", 
                      "teaspoons", "tsp", "fluid ounce", "fluid ounces", "fl oz", 
                      "fl. oz", "pint", "pints", "pt", "quart", "quarts", "qt", 
                      "gallon", "gallons", "gal"]:
        ml_value = quantity * CONVERSIONS.get(unit_lower, 1)
        
        # Convert to litres if >= 1000ml
        if ml_value >= 1000:
            return round(ml_value / 1000, 2), "l"
        return round(ml_value, 0), "ml"
    
    # Convert weight measurements
    if unit_lower in ["pound", "pounds", "lb", "lbs"]:
        grams = quantity * CONVERSIONS["pound"]
        if grams >= 1000:
            return round(grams / 1000, 2), "kg"
        return round(grams, 0), "g"
    
    # Handle ounces (could be weight or volume)
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
    
    # Default: return as-is with cleaned unit
    return quantity, unit_lower


def parse_ingredient_string(ingredient_str: str) -> Dict[str, Any]:
    """
    Parse an ingredient string like "2 (21 ounce) cans cherry pie filling"
    and return standardized components.
    
    Args:
        ingredient_str: Raw ingredient string from recipe
    
    Returns:
        Dictionary with keys: quantity, unit, name, original
    """
    original = ingredient_str.strip()
    
    # Pattern to match quantity, unit, and ingredient name
    # Handles formats like:
    # "2 cups flour"
    # "1 (14 ounce) can milk"
    # "1/2 teaspoon salt"
    # "2-3 tablespoons sugar"
    
    # First, try to extract parenthetical quantity/unit (like "1 (14 ounce) can")
    paren_match = re.search(r"(\d+[\d\s/.-]*)\s*\((\d+[\d\s/.-]*)\s+([a-zA-Z]+)\)", ingredient_str)
    
    if paren_match:
        outer_qty = parse_quantity(paren_match.group(1))
        inner_qty = parse_quantity(paren_match.group(2))
        unit = paren_match.group(3)
        # Remove the matched part to get ingredient name
        name = re.sub(r"(\d+[\d\s/.-]*)\s*\((\d+[\d\s/.-]*)\s+([a-zA-Z]+)\)\s*[a-zA-Z]*\s*", "", ingredient_str).strip()
        
        # Multiply quantities (e.g., 2 cans of 14 oz = 28 oz)
        total_qty = outer_qty * inner_qty
        std_qty, std_unit = standardize_unit(total_qty, unit, name)
        
        return {
            "quantity": std_qty,
            "unit": std_unit,
            "name": name,
            "original": original
        }
    
    # Standard pattern: "quantity unit ingredient"
    match = re.match(r"^([\d\s/.-]+)\s+([a-zA-Z]+\.?)\s+(.+)$", ingredient_str)
    
    if match:
        qty_str = match.group(1)
        unit = match.group(2)
        name = match.group(3).strip()
        
        qty = parse_quantity(qty_str)
        std_qty, std_unit = standardize_unit(qty, unit, name)
        
        return {
            "quantity": std_qty,
            "unit": std_unit,
            "name": name,
            "original": original
        }
    
    # No clear quantity/unit pattern - return as-is
    return {
        "quantity": 1,
        "unit": "piece",
        "name": ingredient_str.strip(),
        "original": original
    }


def standardize_recipe_ingredients(ingredients_raw: list) -> list:
    """
    Process a list of raw ingredient strings and return standardized versions.
    
    Args:
        ingredients_raw: List of ingredient strings from recipe
    
    Returns:
        List of dictionaries with standardized ingredient data
    """
    standardized = []
    
    for ingredient in ingredients_raw:
        if not ingredient or not ingredient.strip():
            continue
        
        parsed = parse_ingredient_string(ingredient)
        standardized.append(parsed)
    
    return standardized


# Example usage and testing
if __name__ == "__main__":
    # Test cases
    test_ingredients = [
        "2 (21 ounce) cans cherry pie filling",
        "2 eggs",
        "1 (14 ounce) can sweetened condensed milk (not evaporated)",
        "1/4 cup melted margarine",
        "1/2 teaspoon cinnamon",
        "1/4 teaspoon nutmeg",
        "1/2 cup firmly packed light brown sugar",
        "1/2 cup self-rising flour",
        "1/4 cup margarine",
        "1/2 cup chopped nuts (chef's choice)",
        "1/2 cup quick-cooking oats",
        "butter-flavored cooking spray",
        "2 lbs ground beef",
        "3 cups water",
        "1 pint milk"
    ]
    
    print("=== Testing Unit Standardization ===\n")
    for ingredient in test_ingredients:
        result = parse_ingredient_string(ingredient)
        print(f"Original: {ingredient}")
        print(f"Standardized: {result['quantity']} {result['unit']} {result['name']}")
        print()

# Made with Bob

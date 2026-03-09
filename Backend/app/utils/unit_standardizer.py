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

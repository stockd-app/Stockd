"""
Shared ingredient matching and unit helpers for recipe completion.
"""

from __future__ import annotations

import re
from typing import Optional, Set

PREPARATION_WORDS = {
    "fresh",
    "frozen",
    "dried",
    "chopped",
    "diced",
    "minced",
    "sliced",
    "grated",
    "crushed",
    "ground",
    "softened",
    "melted",
    "boneless",
    "skinless",
    "lean",
    "optional",
    "divided",
    "extra",
    "virgin",
    "to",
    "taste",
    "for",
    "serving",
    "plus",
}

GENERIC_SINGLE_TOKEN_WORDS = {
    "pepper",
    "sauce",
    "stock",
    "broth",
    "oil",
    "milk",
    "cheese",
    "flour",
    "sugar",
    "juice",
    "powder",
    "seasoning",
    "paste",
    "extract",
}

FORM_MARKERS = {
    "powder",
    "sauce",
    "stock",
    "broth",
    "paste",
    "juice",
    "extract",
}

VEGETABLE_PEPPER_MARKERS = {
    "bell",
    "chili",
    "chilli",
    "jalapeno",
    "poblano",
    "capsicum",
    "red",
    "green",
    "yellow",
    "orange",
}

SPICE_PEPPER_MARKERS = {"black", "white", "cayenne"}

COMMON_INGREDIENTS = {
    "salt",
    "table salt",
    "sea salt",
    "kosher salt",
    "pepper",
    "black pepper",
    "ground black pepper",
    "flour",
    "plain flour",
    "all purpose flour",
    "all-purpose flour",
    "self raising flour",
    "self-raising flour",
    "baking powder",
    "baking soda",
    "bicarbonate of soda",
    "water",
    "olive oil",
    "vegetable oil",
    "sunflower oil",
    "cooking oil",
    "sugar",
    "white sugar",
    "brown sugar",
    "caster sugar",
    "icing sugar",
    "powdered sugar",
    "honey",
    "butter",
    "egg",
    "eggs",
    "garlic",
    "garlic powder",
    "onion powder",
    "mixed herbs",
    "italian seasoning",
    "oregano",
    "basil",
    "thyme",
    "cinnamon",
    "paprika",
    "soy sauce",
    "vinegar",
    "white vinegar",
    "apple cider vinegar",
    "mustard",
    "ketchup",
}

UNIT_ALIASES = {
    "gram": "g",
    "grams": "g",
    "g": "g",
    "kilogram": "kg",
    "kilograms": "kg",
    "kg": "kg",
    "milliliter": "ml",
    "milliliters": "ml",
    "millilitre": "ml",
    "millilitres": "ml",
    "ml": "ml",
    "liter": "l",
    "liters": "l",
    "litre": "l",
    "litres": "l",
    "l": "l",
    "teaspoon": "tsp",
    "teaspoons": "tsp",
    "tsp": "tsp",
    "tablespoon": "tbsp",
    "tablespoons": "tbsp",
    "tbsp": "tbsp",
    "cup": "cup",
    "cups": "cup",
    "ounce": "oz",
    "ounces": "oz",
    "oz": "oz",
    "pound": "lb",
    "pounds": "lb",
    "lb": "lb",
    "lbs": "lb",
    "pc": "piece",
    "pcs": "piece",
    "piece": "piece",
    "pieces": "piece",
    "count": "piece",
    "whole": "piece",
    "clove": "piece",
    "cloves": "piece",
    "can": "piece",
    "cans": "piece",
    "bunch": "piece",
    "bunches": "piece",
    "egg": "piece",
    "eggs": "piece",
    "large": "piece",
    "medium": "piece",
    "small": "piece",
}

UNIT_FACTORS = {
    "g": ("mass", 1.0),
    "kg": ("mass", 1000.0),
    "oz": ("mass", 28.3495),
    "lb": ("mass", 453.592),
    "ml": ("volume", 1.0),
    "l": ("volume", 1000.0),
    "tsp": ("volume", 5.0),
    "tbsp": ("volume", 15.0),
    "cup": ("volume", 240.0),
    "piece": ("count", 1.0),
}

COUNT_LIKE_UNITS = {
    "",
    "piece",
}


def normalize_text(text: Optional[str]) -> str:
    if not text:
        return ""
    normalized = re.sub(r"[^a-z\s]", " ", text.lower())
    return re.sub(r"\s+", " ", normalized).strip()


def _normalize_token(word: str) -> str:
    if word.endswith("ies") and len(word) > 3:
        return word[:-3] + "y"
    if word.endswith("es") and len(word) > 3:
        return word[:-2]
    if word.endswith("s") and len(word) > 3 and not word.endswith("ss"):
        return word[:-1]
    return word


def tokenize_text(text: Optional[str]) -> Set[str]:
    normalized = normalize_text(text)
    if not normalized:
        return set()
    return {_normalize_token(word) for word in normalized.split() if word}


def _meaningful_tokens(text: Optional[str]) -> Set[str]:
    return {token for token in tokenize_text(text) if token not in PREPARATION_WORDS}


def _has_conflicting_pepper_markers(left: Set[str], right: Set[str]) -> bool:
    if "pepper" not in left or "pepper" not in right:
        return False

    left_is_veg = bool(left & VEGETABLE_PEPPER_MARKERS)
    right_is_veg = bool(right & VEGETABLE_PEPPER_MARKERS)
    left_is_spice = bool(left & SPICE_PEPPER_MARKERS) or left == {"pepper"}
    right_is_spice = bool(right & SPICE_PEPPER_MARKERS) or right == {"pepper"}

    return (left_is_veg and right_is_spice) or (right_is_veg and left_is_spice)


def _has_conflicting_form_markers(left: Set[str], right: Set[str]) -> bool:
    return any((marker in left) ^ (marker in right) for marker in FORM_MARKERS)


def ingredient_match_score(ingredient: Optional[str], pantry_item: Optional[str]) -> int:
    ingredient_norm = normalize_text(ingredient)
    pantry_norm = normalize_text(pantry_item)

    if not ingredient_norm or not pantry_norm:
        return 0
    if ingredient_norm == pantry_norm:
        return 100

    ingredient_tokens = _meaningful_tokens(ingredient_norm)
    pantry_tokens = _meaningful_tokens(pantry_norm)

    if not ingredient_tokens or not pantry_tokens:
        return 0
    if _has_conflicting_pepper_markers(ingredient_tokens, pantry_tokens):
        return 0
    if _has_conflicting_form_markers(ingredient_tokens, pantry_tokens):
        return 0

    overlap = ingredient_tokens & pantry_tokens
    if not overlap:
        return 0

    if ingredient_tokens.issubset(pantry_tokens) or pantry_tokens.issubset(ingredient_tokens):
        if len(overlap) >= 2:
            return 75 + len(overlap) * 5

        shared = next(iter(overlap))
        return 0 if shared in GENERIC_SINGLE_TOKEN_WORDS else 65

    shorter, longer = sorted([ingredient_norm, pantry_norm], key=len)
    if len(shorter.split()) >= 2 and f" {shorter} " in f" {longer} ":
        return 70

    return 0


def is_common_ingredient(ingredient: Optional[str]) -> bool:
    ingredient_norm = normalize_text(ingredient)
    if not ingredient_norm:
        return False

    if re.search(
        r"\b(bell|red|green|yellow|orange|chili|chilli|jalapeno|poblano) pepper\b",
        ingredient_norm,
    ):
        return False

    for common in COMMON_INGREDIENTS:
        common_norm = normalize_text(common)
        if re.search(rf"(^|\s){re.escape(common_norm)}(\s|$)", ingredient_norm):
            return True

    return False


def normalize_unit(unit: Optional[str]) -> str:
    normalized = normalize_text(unit)
    return UNIT_ALIASES.get(normalized, normalized)


def get_unit_group(unit: Optional[str]) -> Optional[str]:
    normalized = normalize_unit(unit)
    if not normalized:
        return None
    return UNIT_FACTORS.get(normalized, (None, 0))[0]


def is_count_like_unit(unit: Optional[str]) -> bool:
    return normalize_unit(unit) in COUNT_LIKE_UNITS


def units_are_compatible(recipe_unit: Optional[str], pantry_unit: Optional[str]) -> bool:
    recipe_normalized = normalize_unit(recipe_unit)
    pantry_normalized = normalize_unit(pantry_unit)

    if recipe_normalized == pantry_normalized:
        return True

    if not recipe_normalized or not pantry_normalized:
        return True

    recipe_group = get_unit_group(recipe_normalized)
    pantry_group = get_unit_group(pantry_normalized)
    return bool(recipe_group and pantry_group and recipe_group == pantry_group)


def _quantity_to_base(quantity: float, unit: Optional[str]) -> tuple[float, str]:
    normalized = normalize_unit(unit)
    if not normalized or normalized not in UNIT_FACTORS:
        return quantity, "count"

    group, factor = UNIT_FACTORS[normalized]
    return quantity * factor, group


def convert_quantity(quantity: float, from_unit: Optional[str], to_unit: Optional[str]) -> float:
    if not from_unit or not to_unit:
        return quantity

    normalized_to = normalize_unit(to_unit)
    if not normalized_to or normalized_to not in UNIT_FACTORS:
        return quantity

    base_quantity, from_group = _quantity_to_base(quantity, from_unit)
    to_group = get_unit_group(normalized_to)
    if to_group is None or from_group != to_group:
        raise ValueError("Incompatible units")

    _, factor = UNIT_FACTORS[normalized_to]
    return base_quantity / factor

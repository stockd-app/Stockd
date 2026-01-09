import re
import inflect

p = inflect.engine()

# Common words to remove from food names
COMMON_WORDS = {
    "fresh", "organic", "large", "small", "green",
    "red", "extra", "whole", "protein",
    "lowfat", "fatfree", "fzn",
    "ripe", "sweet", "juicy", "crisp", "tender",
    "baby", "chopped", "tesco", "pk", "loose",
}

def clean_name(name: str) -> str:
    # Lowercase and remove special characters
    name = name.lower()
    name = re.sub(r"[^a-z\s]", "", name)
    return name.strip()

def strip_adjectives(name: str) -> str:
    # Remove common words
    return " ".join(w for w in name.split() if w not in COMMON_WORDS)

def singularize(name: str) -> str:
    # Convert plural words to singular
    words = name.split()
    singular_words = [p.singular_noun(w) or w for w in words]
    return " ".join(singular_words)

def normalize_food_name(name: str) -> str:
    name = clean_name(name)
    name = singularize(name)
    name = strip_adjectives(name)
    return name
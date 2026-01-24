"""
Scalable Ingredient Normalization & Canonicalization Pipeline

- Hybrid pipeline: lightweight cleaning + lemmatization + embedding-based canonicalization
- Stores a dynamic canonical vocabulary (names + embeddings) on disk
- Uses SentenceTransformer for embeddings and FAISS for nearest-neighbor lookup
- Exposes functions that can be caled from recipe processing pipeline

Notes:
- Requires: sentence-transformers, faiss, nltk (wordnet), joblib, pandas

Usage overview:
1. Initialize pipeline (loads or creates canonical DB)
2. Batch process recipe ingredients to build initial canonical set
3. For new ingredients: call canonicalize_ingredient(); if unknown, optionally auto-add
4. Use canonicalized ingredient names in downstream matching and embedding index for recipes
"""

import os
import re
import json
import joblib
import numpy as np
import threading
from typing import List, Tuple, Optional
from sentence_transformers import SentenceTransformer
import faiss
from nltk.stem import WordNetLemmatizer
import pandas as pd

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
CANONICAL_DB_DIR = os.path.join(BASE_DIR, "canonical_db")
if not os.path.exists(CANONICAL_DB_DIR):
    os.makedirs(CANONICAL_DB_DIR)

CANONICAL_JSON = os.path.join(CANONICAL_DB_DIR, "canonical_meta.json")
CANONICAL_EMB = os.path.join(CANONICAL_DB_DIR, "canonical_emb.npy")
CANONICAL_NAMES = os.path.join(CANONICAL_DB_DIR, "canonical_names.json")
FAISS_INDEX_PATH = os.path.join(CANONICAL_DB_DIR, "canonical.faiss")

EMBED_SIMILARITY_THRESHOLD = 0.62  # embedding cosine similarity threshold to match existing canonical
AUTO_ADD_THRESHOLD = 0.50          # if below this, create new canonical entry when auto_add=True


# model & NLP setup
lemmatizer = WordNetLemmatizer()
MODEL_NAME = 'all-MiniLM-L6-v2'
_model_lock = threading.Lock()
_model = None


def get_model():
    global _model
    with _model_lock:
        if _model is None:
            _model = SentenceTransformer(MODEL_NAME)
        return _model

# text cleaning helpers
DESCRIPTORS = {
    "fresh", "large", "small", "organic", "raw", "boneless",
    "skinless", "dried", "freshly", "chopped", "minced",
    "sliced", "free-range", "medium", "whole", "coarse", "packed",
    "ground", "shredded", "grated", "peeled", "seeded", "frozen", "grey", "of",
    "rack", "pieces", "leaves", "roast", "flake", "splenda", "prepared", "baking", "liquid", "broiler-fryer",
    "salted", "unsalted", "toasted", "lightly", "ripe", "baby", "thinly", "cut", "cubed",
    "boned", "halves", "cooked", "uncooked", "skin", "cans", "can", "bunch", "stalk", "stalks",
    "squeeze", "jar"
}

MULTI_KEEP = {
    "cream cheese", "feta cheese", "phyllo pastry",
    "brown sugar", "palm sugar",
    "coconut milk", "soy sauce", "fish sauce", "worcestershire sauce",
    "olive oil", "vegetable oil", "sesame oil",
    "lemon juice", "lime juice",
    "baking soda", "baking powder",
    "red wine vinegar", "white vinegar", "rice vinegar",
    "curry powder", "garam masala", "confectioners sugar",
    "dark rum", "cream sherry", "apple cider", "cornstarch"
}

GENERIC_PROTEINS = {
    "chicken", "beef", "pork", "lamb", "turkey", "duck", "fish", "salmon",
    "tuna", "shrimp", "prawns", "egg", "eggs", "tofu", "tempeh"
}

GENERIC_ENDINGS = {"juice", "oil", "vinegar", "sugar", "powder", "sauce", "milk", "sauce", "rice", "beans", "potatoes", "potato", "flour"}

IRREGULAR_MAP = {
    "gingerroot": "ginger",
    "chilies": "chili",
}

BRANDS = {"tesco", "aldi", "lidl", "dunnes stores", "supervalu"}

def clean_text(text: str) -> str:
    if not text:
        return ""
    text = text.lower()
    # remove parenthesis
    text = re.sub(r"\([^\)]*\)", " ", text)
    # remove digits, fractions, punctuation except hyphen
    text = re.sub(r"[^a-zA-Z\- ]+", " ", text)
    text = re.sub(r"\s+", " ", text).strip()
    return text


def normalize_tokens(text: str) -> str:
    text = clean_text(text)

    for k, v in IRREGULAR_MAP.items():
        if k in text:
            text = text.replace(k, v)

    tokens = text.split()
    # remove descriptors
    tokens = [t for t in tokens if t not in DESCRIPTORS and t not in BRANDS]
    if not tokens:
        return ""
    # lemmatize tokens
    tokens = [lemmatizer.lemmatize(t) for t in tokens]
    candidate = " ".join(tokens)
    # fix irregulars
    for k, v in IRREGULAR_MAP.items():
        candidate = candidate.replace(k, v)
    # preserve multi words
    for mw in MULTI_KEEP:
        if mw in candidate:
            return mw
    
    for token in reversed(tokens):
        if token in GENERIC_PROTEINS or token in GENERIC_ENDINGS:
            return token
    
    # if single token left
    if len(tokens) == 1:
        return tokens[0]
    # otherwise keep first two tokens for safety
    return " ".join(tokens[:2])

# canonical vocabulary management
class CanonicalDB:
    """Stores canonical ingredient names and their embeddings; provides FAISS ANN lookup."""
    def __init__(self, emb_dim: int = None):
        self.names = []  # list[str]
        self.embs = None  # numpy array (N, D)
        self.index = None
        self.dim = emb_dim
        self.model = get_model()
        self._load()

    def _load(self):
        # load names
        if os.path.exists(CANONICAL_NAMES):
            with open(CANONICAL_NAMES, 'r', encoding='utf-8') as f:
                self.names = json.load(f)
        # load embeddings
        if os.path.exists(CANONICAL_EMB):
            self.embs = np.load(CANONICAL_EMB)
            self.dim = self.embs.shape[1]
        # load faiss index
        if os.path.exists(FAISS_INDEX_PATH) and self.embs is not None:
            self.index = faiss.read_index(FAISS_INDEX_PATH)
        elif self.embs is not None:
            # build fresh index
            self._build_index()

    def _save(self):
        with open(CANONICAL_NAMES, 'w', encoding='utf-8') as f:
            json.dump(self.names, f, ensure_ascii=False, indent=2)
        if self.embs is not None:
            np.save(CANONICAL_EMB, self.embs)
        if self.index is not None:
            faiss.write_index(self.index, FAISS_INDEX_PATH)

    def _build_index(self):
        if self.embs is None:
            return
        self.dim = self.embs.shape[1]
        self.index = faiss.IndexFlatIP(self.dim)
        self.index.add(self.embs.astype('float32'))

    def refresh_index(self):
        self._build_index()
        self._save()

    def reembed_all_names(self):
        if not self.names:
            return
        self.embs = self.model.encode(self.names, normalize_embeddings=True, batch_size=256)
        self._build_index()
        self._save()

    def find_closest(self, name: str, top_k: int = 3) -> List[Tuple[str, float]]:
        if not name:
            return []
        if self.embs is None or self.index is None:
            return []
        emb = self.model.encode([name], normalize_embeddings=True).astype('float32')
        D, I = self.index.search(emb, top_k)
        res = []
        for dist, idx in zip(D[0], I[0]):
            if idx < 0 or idx >= len(self.names):
                continue
            res.append((self.names[idx], float(dist)))
        return res

    def add_canonical(self, name: str, save: bool = True) -> int:
        """Add a canonical name and its embedding; returns index."""
        if not name:
            return -1
        if self.names and name in self.names:
            return self.names.index(name)
        emb = self.model.encode([name], normalize_embeddings=True).astype('float32')
        if self.embs is None:
            self.embs = emb
        else:
            self.embs = np.vstack([self.embs, emb])
        self.names.append(name)

        self._build_index()
        if save:
            self._save()
        return len(self.names) - 1

# single shared canonical db instance
_canonical_db = None
_db_lock = threading.Lock()

def get_canonical_db():
    global _canonical_db
    with _db_lock:
        if _canonical_db is None:
            _canonical_db = CanonicalDB()
        return _canonical_db


def canonicalize_ingredient(raw: str, auto_add: bool = True) -> Tuple[str, float, Optional[str]]:
    """
    Normalize a single raw ingredient string and map it to a canonical ingredient.
    Returns: (canonical_name, similarity, matched_name_or_None)
    If no match and auto_add=True and embedding similarity < AUTO_ADD_THRESHOLD, a new canonical is created.
    """
    norm = normalize_tokens(raw)
    if norm in IRREGULAR_MAP:
        norm = IRREGULAR_MAP[norm]

    if not norm:
        return "", 0.0, None
    db = get_canonical_db()

    # Debug print
    # print(f"Raw: '{raw}' -> Normalized: '{norm}'")

    # short-circuit exact match
    if norm in db.names:
        idx = db.names.index(norm)
        return db.names[idx], 1.0, db.names[idx]
    # try multi-word exact checks
    for mw in MULTI_KEEP:
        if mw in norm and mw in db.names:
            return mw, 1.0, mw
    # embedding lookup
    candidates = db.find_closest(norm, top_k=3)
    if candidates:
        best_name, best_score = candidates[0]
        # note: faiss IndexFlatIP returns dot product; if embeddings normalized, it's cosine
        if best_score >= EMBED_SIMILARITY_THRESHOLD:
            return best_name, best_score, best_name
    # no confident match
    if auto_add:
        # if candidates exist but not confident, we may still add as new canonical if below AUTO_ADD_THRESHOLD
        new_idx = db.add_canonical(norm)
        return norm, 1.0, None
    else:
        return norm, candidates[0][1] if candidates else 0.0, None


def batch_build_canonical(initial_ingredients: List[str], min_occurrences: int = 1):
    """
    Build canonical vocabulary from a list of ingredient strings (possibly many duplicates).
    Typical flow: extract all ingredient strings from dataset, pass them here.
    """
    db = get_canonical_db()
    # normalize and count
    normalized = [normalize_tokens(x) for x in initial_ingredients if x]
    counts = {}
    for n in normalized:
        counts[n] = counts.get(n, 0) + 1
    # seed canonical with high-frequency items + MULTI_KEEP
    seeds = [k for k, v in counts.items() if v >= min_occurrences and k]
    # ensure we include MULTI_KEEP items
    seeds = list(set(seeds) | MULTI_KEEP)
    # add seeds
    for s in seeds:
        if s and s not in db.names:
            db.add_canonical(s, save=False)
    # embed remaining candidates in batches and either match or add
    remaining = [k for k in sorted(counts.keys(), key=lambda x: -counts[x]) if k and k not in db.names]
    for r in remaining:
        # try to find existing mapping
        candidates = db.find_closest(r, top_k=3)
        if candidates and candidates[0][1] >= EMBED_SIMILARITY_THRESHOLD:
            continue
        # else add as new canonical (to grow vocab quickly)
        db.add_canonical(r, save=False)
    db.refresh_index()
    return db

def canonicalize_recipe_ingredients(recipe_ing_list: List[str], auto_add: bool = False) -> List[str]:
    """Canonicalize a recipe's ingredient list (returns list of canonical ingredient names)."""
    out = []
    for ing in recipe_ing_list:
        can, score, matched = canonicalize_ingredient(ing, auto_add=auto_add)
        out.append(can)
    return out

# helper to build canonical DB from dataframe (recipes.parquet expected)
def build_canonical_from_recipe_df(df, ing_col='RecipeIngredientParts', min_occurrences=1):
    all_ing = []
    for _, row in df.iterrows():
        parts = row.get(ing_col)
        if parts is None:
            continue
        # handle list or array
        if isinstance(parts, (list, np.ndarray, pd.Series)):
            if len(parts) == 0:
                continue
            all_ing.extend(parts)
        else:
            # if it's a string with commas
            all_ing.extend([p.strip() for p in str(parts).split(',') if p.strip()])
    return batch_build_canonical(all_ing, min_occurrences=min_occurrences)

def export_canonical_list(path: str):
    db = get_canonical_db()
    with open(path, 'w', encoding='utf-8') as f:
        json.dump(db.names, f, ensure_ascii=False, indent=2)


# manual testing
if __name__ == '__main__':
    # quick demo: build from small dataset example
    sample = [
        "frozen spinach", "eggs", "onion", "cream cheese", "pepper", "feta cheese", "butter", "phyllo pastry",
        "rice vinegar", "olive oil", "potatoes", "baking soda", "baking powder", "boneless skinless chicken breast halves",
        "raw potatoes", "raw carrot", "canned corn niblet", "fresh lime juice", "garlic cloves"
    ]
    db = batch_build_canonical(sample, min_occurrences=1)
    print('Canonical names count:', len(db.names))
    for x in db.names[:50]:
        print(' -', x)

    # test canonicalize
    tests = ["freshly chopped garlic cloves", "rice vinegar", "boneless skinless chicken breast halves", "gingerroot"]
    for t in tests:
        print(t, '->', canonicalize_ingredient(t, auto_add=True))

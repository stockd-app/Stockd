const PREPARATION_WORDS = new Set([
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
]);

const GENERIC_SINGLE_TOKEN_WORDS = new Set([
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
]);

const FORM_MARKERS = new Set([
  "powder",
  "sauce",
  "stock",
  "broth",
  "paste",
  "juice",
  "extract",
]);

const VEGETABLE_PEPPER_MARKERS = new Set([
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
]);

const SPICE_PEPPER_MARKERS = new Set(["black", "white", "cayenne"]);

export function normalizeText(text: string): string {
  if (!text) return "";
  return text.toLowerCase().replace(/[^a-z\s]/g, " ").replace(/\s+/g, " ").trim();
}

export function tokenizeText(text: string): Set<string> {
  if (!text) return new Set<string>();

  const normalized = normalizeText(text);
  const tokens = new Set<string>();

  for (const word of normalized.split(" ")) {
    if (!word) continue;

    if (word.endsWith("ies") && word.length > 3) {
      tokens.add(word.slice(0, -3) + "y");
    } else if (word.endsWith("es") && word.length > 3) {
      tokens.add(word.slice(0, -2));
    } else if (word.endsWith("s") && word.length > 3 && !word.endsWith("ss")) {
      tokens.add(word.slice(0, -1));
    } else {
      tokens.add(word);
    }
  }

  return tokens;
}

function meaningfulTokens(text: string): Set<string> {
  return new Set(
    [...tokenizeText(text)].filter((token) => !PREPARATION_WORDS.has(token))
  );
}

function hasConflictingPepperMarkers(left: Set<string>, right: Set<string>): boolean {
  if (!left.has("pepper") || !right.has("pepper")) return false;

  const leftIsVeg = [...VEGETABLE_PEPPER_MARKERS].some((marker) => left.has(marker));
  const rightIsVeg = [...VEGETABLE_PEPPER_MARKERS].some((marker) => right.has(marker));
  const leftIsSpice =
    [...SPICE_PEPPER_MARKERS].some((marker) => left.has(marker)) ||
    (left.size === 1 && left.has("pepper"));
  const rightIsSpice =
    [...SPICE_PEPPER_MARKERS].some((marker) => right.has(marker)) ||
    (right.size === 1 && right.has("pepper"));

  return (leftIsVeg && rightIsSpice) || (rightIsVeg && leftIsSpice);
}

function hasConflictingFormMarkers(left: Set<string>, right: Set<string>): boolean {
  return [...FORM_MARKERS].some((marker) => left.has(marker) !== right.has(marker));
}

export function ingredientMatchScore(ingredient: string, pantryItem: string): number {
  const ingredientNorm = normalizeText(ingredient);
  const pantryNorm = normalizeText(pantryItem);

  if (!ingredientNorm || !pantryNorm) return 0;
  if (ingredientNorm === pantryNorm) return 100;

  const ingredientTokens = meaningfulTokens(ingredientNorm);
  const pantryTokens = meaningfulTokens(pantryNorm);

  if (!ingredientTokens.size || !pantryTokens.size) return 0;
  if (hasConflictingPepperMarkers(ingredientTokens, pantryTokens)) return 0;
  if (hasConflictingFormMarkers(ingredientTokens, pantryTokens)) return 0;

  const overlap = [...ingredientTokens].filter((token) => pantryTokens.has(token));
  if (!overlap.length) return 0;

  const ingredientSubset = [...ingredientTokens].every((token) => pantryTokens.has(token));
  const pantrySubset = [...pantryTokens].every((token) => ingredientTokens.has(token));

  if (ingredientSubset || pantrySubset) {
    if (overlap.length >= 2) return 75 + overlap.length * 5;
    return GENERIC_SINGLE_TOKEN_WORDS.has(overlap[0]) ? 0 : 65;
  }

  const [shorter, longer] =
    ingredientNorm.length <= pantryNorm.length
      ? [ingredientNorm, pantryNorm]
      : [pantryNorm, ingredientNorm];

  if (shorter.split(" ").length >= 2 && ` ${longer} `.includes(` ${shorter} `)) {
    return 70;
  }

  return 0;
}

export function ingredientsMatch(ingredient: string, pantryItem: string): boolean {
  return ingredientMatchScore(ingredient, pantryItem) > 0;
}

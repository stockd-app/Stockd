/* ========= Types ========= */

export type IngredientCategory =
    | "LIQUID"
    | "OIL"
    | "SPICE"
    | "POWDER"
    | "HERB"
    | "VEGETABLE"
    | "FRUIT"
    | "MEAT"
    | "SEAFOOD"
    | "DAIRY"
    | "GRAIN"
    | "BAKERY"
    | "LEGUME"
    | "CONDIMENT"
    | "UNKNOWN";

type CategoryRule = {
    keywords: string[];
    category: IngredientCategory;
};

/* ========= Category Rules ========= */

const CATEGORY_RULES: CategoryRule[] = [
    // liquids
    { keywords: ["water", "juice", "broth", "stock"], category: "LIQUID" },

    // oils
    { keywords: ["oil", "olive oil", "vegetable oil"], category: "OIL" },

    // spices & powders
    { keywords: ["salt", "pepper", "spice", "powder", "cumin", "paprika", "sugar", "jalapeno chile", "sauce"], category: "SPICE" },

    // herbs
    { keywords: ["cilantro", "parsley", "basil", "mint"], category: "HERB" },

    // vegetables
    { keywords: ["onion", "tomato", "carrot", "pepper", "lettuce", "garlic", "celery"], category: "VEGETABLE" },

    // fruits
    { keywords: ["lime", "lemon", "avocado", "apple"], category: "FRUIT" },

    // meat
    { keywords: ["chicken", "beef", "pork"], category: "MEAT" },

    // legumes
    { keywords: ["beans", "lentils", "chickpeas"], category: "LEGUME" },

    // dairy
    { keywords: ["milk", "cheese", "cream", "yogurt"], category: "DAIRY" },

    // bakery
    { keywords: ["bread", "baguette", "tortilla"], category: "BAKERY" },
];

/* ========= Default Units ========= */

const DEFAULT_UNIT_BY_CATEGORY: Record<IngredientCategory, string> = {
    LIQUID: "ml",
    OIL: "tbsp",
    SPICE: "tsp",
    POWDER: "g",
    HERB: "bunch",
    VEGETABLE: "piece",
    FRUIT: "piece",
    MEAT: "g",
    SEAFOOD: "g",
    DAIRY: "g",
    GRAIN: "g",
    BAKERY: "piece",
    LEGUME: "g",
    CONDIMENT: "tbsp",
    UNKNOWN: "",
};

/* ========= Quantity Normalization ========= */

function normalizeQuantity(
    qty: number,
    unit: string,
    category: IngredientCategory
): { qty: number; unit: string } {

    // Avoid unrealistic "1ml water"
    if (category === "LIQUID" && unit === "ml" && qty < 10) {
        return { qty: qty * 10, unit: "ml" };
    }

    // Beans: CSV values like 48 usually mean ~1 can
    if (category === "LEGUME" && qty >= 40) {
        return { qty: 400, unit: "g" };
    }

    // Meat: 1 chicken / 1 breast ≈ 200g
    if (category === "MEAT" && qty <= 2) {
        return { qty: qty * 200, unit: "g" };
    }

    return { qty, unit };
}

export function parseQuantity(raw: any): number {
    if (!raw) return 1;

    // already a number
    if (typeof raw === "number" && !isNaN(raw)) {
        return raw;
    }

    const str = raw.toString().trim().toLowerCase();

    // fractions like "1/2"
    if (str.includes("/")) {
        const [a, b] = str.split("/");
        const num = Number(a);
        const den = Number(b);
        if (!isNaN(num) && !isNaN(den) && den !== 0) {
            return num / den;
        }
    }

    // unicode fractions
    const unicodeFractions: Record<string, number> = {
        "¼": 0.25,
        "½": 0.5,
        "¾": 0.75,
    };
    if (unicodeFractions[str]) {
        return unicodeFractions[str];
    }

    // fallback: extract first number
    const match = str.match(/\d+(\.\d+)?/);
    if (match) {
        return Number(match[0]);
    }

    // "to taste", "as needed", etc.
    return 1;
}

/* ========= Public API ========= */

export function resolveIngredientDisplay(
    ingredient: string,
    rawQty: number
): { qty: number; unit: string } {
    const lower = ingredient.toLowerCase();

    const rule = CATEGORY_RULES.find(rule =>
        rule.keywords.some(k => lower.includes(k))
    );

    const category = rule?.category ?? "UNKNOWN";
    const defaultUnit = DEFAULT_UNIT_BY_CATEGORY[category];

    return normalizeQuantity(rawQty, defaultUnit, category);
}

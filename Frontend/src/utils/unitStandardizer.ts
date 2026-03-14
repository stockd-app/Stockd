// Conversion factors to metric units (grams for weight, milliliters for volume)
const CONVERSIONS: Record<string, number> = {
  cup: 240,
  cups: 240,
  tablespoon: 15,
  tablespoons: 15,
  tbsp: 15,
  teaspoon: 5,
  teaspoons: 5,
  tsp: 5,
  "fluid ounce": 30,
  "fluid ounces": 30,
  "fl oz": 30,
  "fl. oz": 30,
  ounce: 30,
  ounces: 30,
  oz: 30,
  pint: 473,
  pints: 473,
  pt: 473,
  quart: 946,
  quarts: 946,
  qt: 946,
  gallon: 3785,
  gallons: 3785,
  gal: 3785,
  pound: 454,
  pounds: 454,
  lb: 454,
  lbs: 454,
  ounce_weight: 28.35,
  oz_weight: 28.35,
  gram: 1,
  grams: 1,
  g: 1,
  kilogram: 1000,
  kilograms: 1000,
  kg: 1000,
  milliliter: 1,
  milliliters: 1,
  millilitre: 1,
  millilitres: 1,
  ml: 1,
  liter: 1000,
  liters: 1000,
  litre: 1000,
  litres: 1000,
  l: 1000,
};

// Common fractions
const FRACTIONS: Record<string, number> = {
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
};

// Ingredient categories for determining if weight or volume
const LIQUID_KEYWORDS = [
  "water",
  "milk",
  "juice",
  "broth",
  "stock",
  "oil",
  "vinegar",
  "wine",
  "beer",
  "cream",
  "sauce",
  "syrup",
  "honey",
  "liquid",
  "melted",
  "coconut milk",
  "soy sauce",
  "worcestershire",
];

const SOLID_KEYWORDS = [
  "flour",
  "sugar",
  "salt",
  "pepper",
  "butter",
  "cheese",
  "meat",
  "chicken",
  "beef",
  "pork",
  "fish",
  "vegetable",
  "fruit",
  "nut",
  "chocolate",
  "cocoa",
  "powder",
  "spice",
  "baking powder",
  "baking soda",
  "yeast",
  "cornstarch",
  "oats",
  "rice",
  "pasta",
  "bread",
];

export interface ParsedIngredient {
  quantity: number;
  unit: string;
  name: string;
  original: string;
}

/**
 * Parse a quantity string that may contain fractions, decimals, or ranges
 */
export function parseQuantity(quantityStr: string | number): number {
  if (!quantityStr) return 1.0;

  const str = String(quantityStr).trim();

  // Handle unicode fractions
  let processed = str;
  for (const [frac, value] of Object.entries(FRACTIONS)) {
    if (processed.includes(frac)) {
      processed = processed.replace(frac, String(value));
    }
  }

  // Handle ranges (take the average)
  if (processed.includes("-") || /\bto\b/i.test(processed)) {
    const parts = processed.split(/[-–—]|to/i);
    try {
      const nums = parts
        .map((p) => p.trim())
        .filter((p) => p)
        .map((p) => parseFloat(p));
      return nums.reduce((a, b) => a + b, 0) / nums.length;
    } catch {
      // Continue to other parsing methods
    }
  }

  // Handle mixed numbers like "1 1/2"
  const mixedMatch = processed.match(/(\d+)\s+(\d+)\/(\d+)/);
  if (mixedMatch) {
    const whole = parseFloat(mixedMatch[1]);
    const numerator = parseFloat(mixedMatch[2]);
    const denominator = parseFloat(mixedMatch[3]);
    return whole + numerator / denominator;
  }

  // Handle simple fractions like "1/2"
  const fracMatch = processed.match(/(\d+)\/(\d+)/);
  if (fracMatch) {
    const numerator = parseFloat(fracMatch[1]);
    const denominator = parseFloat(fracMatch[2]);
    return numerator / denominator;
  }

  // Handle decimal numbers
  const numMatch = processed.match(/\d+\.?\d*/);
  if (numMatch) {
    return parseFloat(numMatch[0]);
  }

  return 1.0;
}

/**
 * Determine if an ingredient is likely a liquid based on keywords
 */
export function isLiquidIngredient(ingredientName: string): boolean {
  const lower = ingredientName.toLowerCase();
  return LIQUID_KEYWORDS.some((keyword) => lower.includes(keyword));
}

/**
 * Convert a quantity and unit to Irish/UK standard units
 */
export function standardizeUnit(
  quantity: number,
  unit: string,
  ingredientName: string = "",
): { quantity: number; unit: string } {
  if (!unit) {
    return { quantity, unit: "piece" };
  }

  const unitLower = unit.toLowerCase().trim();

  // Check if already metric
  if (
    ["g", "gram", "grams", "kg", "kilogram", "kilograms"].includes(unitLower)
  ) {
    if (["kg", "kilogram", "kilograms"].includes(unitLower)) {
      return { quantity, unit: "kg" };
    }
    return { quantity, unit: "g" };
  }

  if (
    ["ml", "milliliter", "milliliters", "millilitre", "millilitres"].includes(
      unitLower,
    )
  ) {
    return { quantity, unit: "ml" };
  }

  if (["l", "liter", "liters", "litre", "litres"].includes(unitLower)) {
    return { quantity, unit: "l" };
  }

  // Determine if ingredient is liquid or solid
  const isLiquid = isLiquidIngredient(ingredientName);
  
  // Check if ingredient is solid (for weight conversion)
  const isSolid = SOLID_KEYWORDS.some((keyword) => ingredientName.toLowerCase().includes(keyword));

  // Convert volume measurements
  const volumeUnits = [
    "cup",
    "cups",
    "tablespoon",
    "tablespoons",
    "tbsp",
    "teaspoon",
    "teaspoons",
    "tsp",
    "fluid ounce",
    "fluid ounces",
    "fl oz",
    "fl. oz",
    "pint",
    "pints",
    "pt",
    "quart",
    "quarts",
    "qt",
    "gallon",
    "gallons",
    "gal",
  ];

  if (volumeUnits.includes(unitLower)) {
    // For solid ingredients, convert cups to grams (approximate)
    if (isSolid || !isLiquid) {
      let grams: number;
      
      // Approximate conversions for common dry ingredients
      // 1 cup flour ≈ 120g, 1 cup sugar ≈ 200g, average ≈ 160g
      if (["cup", "cups"].includes(unitLower)) {
        grams = quantity * 160; // Average for dry ingredients
      } else if (["tablespoon", "tablespoons", "tbsp"].includes(unitLower)) {
        grams = quantity * 10; // Approximate for dry ingredients
      } else if (["teaspoon", "teaspoons", "tsp"].includes(unitLower)) {
        grams = quantity * 3.5; // Approximate for dry ingredients
      } else {
        // For other volume units, use weight approximation
        const mlValue = quantity * (CONVERSIONS[unitLower] || 1);
        grams = mlValue * 0.6; // Rough density approximation
      }
      
      if (grams >= 1000) {
        return { quantity: Math.round((grams / 1000) * 100) / 100, unit: "kg" };
      }
      return { quantity: Math.round(grams), unit: "g" };
    } else {
      // For liquids, convert to ml/l
      const mlValue = quantity * (CONVERSIONS[unitLower] || 1);

      // Convert to litres if >= 1000ml
      if (mlValue >= 1000) {
        return { quantity: Math.round((mlValue / 1000) * 100) / 100, unit: "l" };
      }
      return { quantity: Math.round(mlValue), unit: "ml" };
    }
  }

  // Convert weight measurements
  if (["pound", "pounds", "lb", "lbs"].includes(unitLower)) {
    const grams = quantity * CONVERSIONS.pound;
    if (grams >= 1000) {
      return { quantity: Math.round((grams / 1000) * 100) / 100, unit: "kg" };
    }
    return { quantity: Math.round(grams), unit: "g" };
  }

  // Handle ounces (could be weight or volume)
  if (["ounce", "ounces", "oz"].includes(unitLower)) {
    if (isLiquid) {
      const mlValue = quantity * CONVERSIONS.oz;
      if (mlValue >= 1000) {
        return {
          quantity: Math.round((mlValue / 1000) * 100) / 100,
          unit: "l",
        };
      }
      return { quantity: Math.round(mlValue), unit: "ml" };
    } else {
      const grams = quantity * CONVERSIONS.ounce_weight;
      if (grams >= 1000) {
        return { quantity: Math.round((grams / 1000) * 100) / 100, unit: "kg" };
      }
      return { quantity: Math.round(grams), unit: "g" };
    }
  }

  // Default: return as-is with cleaned unit
  return { quantity, unit: unitLower };
}

/**
 * Parse an ingredient string and return standardized components
 */
export function parseIngredientString(ingredientStr: string): ParsedIngredient {
  const original = ingredientStr.trim();

  // Pattern to match parenthetical quantity/unit (like "1 (14 ounce) can")
  const parenMatch = ingredientStr.match(
    /(\d+[\d\s/.-]*)\s*\((\d+[\d\s/.-]*)\s+([a-zA-Z]+)\)/,
  );

  if (parenMatch) {
    const outerQty = parseQuantity(parenMatch[1]);
    const innerQty = parseQuantity(parenMatch[2]);
    const unit = parenMatch[3];
    // Remove the matched part to get ingredient name
    const name = ingredientStr
      .replace(
        /(\d+[\d\s/.-]*)\s*\((\d+[\d\s/.-]*)\s+([a-zA-Z]+)\)\s*[a-zA-Z]*\s*/,
        "",
      )
      .trim();

    // Multiply quantities (e.g., 2 cans of 14 oz = 28 oz)
    const totalQty = outerQty * innerQty;
    const { quantity: stdQty, unit: stdUnit } = standardizeUnit(
      totalQty,
      unit,
      name,
    );

    return {
      quantity: stdQty,
      unit: stdUnit,
      name,
      original,
    };
  }

  // Standard pattern: "quantity unit ingredient"
  const match = ingredientStr.match(/^([\d\s/.-]+)\s+([a-zA-Z]+\.?)\s+(.+)$/);

  if (match) {
    const qtyStr = match[1];
    const unit = match[2];
    const name = match[3].trim();

    const qty = parseQuantity(qtyStr);
    const { quantity: stdQty, unit: stdUnit } = standardizeUnit(
      qty,
      unit,
      name,
    );

    return {
      quantity: stdQty,
      unit: stdUnit,
      name,
      original,
    };
  }

  // No clear quantity/unit pattern - return as-is
  return {
    quantity: 1,
    unit: "piece",
    name: ingredientStr.trim(),
    original,
  };
}

/**
 * Process a list of raw ingredient strings and return standardized versions
 */
export function standardizeRecipeIngredients(
  ingredientsRaw: string[],
): ParsedIngredient[] {
  const standardized: ParsedIngredient[] = [];

  for (const ingredient of ingredientsRaw) {
    if (!ingredient || !ingredient.trim()) {
      continue;
    }

    const parsed = parseIngredientString(ingredient);
    standardized.push(parsed);
  }

  return standardized;
}

/**
 * Format a quantity and unit for display
 */
export function formatQuantityUnit(quantity: number, unit: string): string {
  // Format quantity to remove unnecessary decimals
  const formattedQty =
    quantity % 1 === 0 ? quantity.toString() : quantity.toFixed(2);

  // Handle special cases
  if (unit === "piece" || unit === "pcs") {
    return `×${formattedQty}`;
  }

  return `${formattedQty} ${unit}`;
}

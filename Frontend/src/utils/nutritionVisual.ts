export type NutritionItem = {
  label: string;
  value: number | string | null | undefined;
  unit?: string;
  icon?: string;
};

export type NutritionDisplayItem = {
  label: string;
  value: number | null;
  formattedValue: string;
  unit: string;
  target: number | null;
  targetLabel: string;
  percent: number;
  percentText: string;
  level: "low" | "medium" | "high";
  icon?: string;
};

export type NutritionTargetOverrides = Partial<Record<string, number>>;

const NUTRITION_CONFIG: Record<
  string,
  {
    target: number;
    unit: string;
    low: number;
    high: number;
  }
> = {
  Calories: {
    target: 2000,
    unit: "kcal",
    low: 30,
    high: 70,
  },
  Carbs: {
    target: 275,
    unit: "g",
    low: 30,
    high: 70,
  },
  Carbohydrates: {
    target: 275,
    unit: "g",
    low: 30,
    high: 70,
  },
  Protein: {
    target: 50,
    unit: "g",
    low: 30,
    high: 70,
  },
  Fat: {
    target: 78,
    unit: "g",
    low: 30,
    high: 70,
  },
  Fibre: {
    target: 28,
    unit: "g",
    low: 30,
    high: 70,
  },
  Fiber: {
    target: 28,
    unit: "g",
    low: 30,
    high: 70,
  },
  Sugar: {
    target: 50,
    unit: "g",
    low: 30,
    high: 70,
  },
  Sodium: {
    target: 2300,
    unit: "mg",
    low: 30,
    high: 70,
  },
  Cholesterol: {
    target: 300,
    unit: "mg",
    low: 30,
    high: 70,
  },
  "Saturated Fat": {
    target: 20,
    unit: "g",
    low: 30,
    high: 70,
  },
};

const ORDER = [
  "Calories",
  "Carbs",
  "Carbohydrates",
  "Protein",
  "Fat",
  "Fibre",
  "Fiber",
  "Sugar",
  "Sodium",
  "Cholesterol",
  "Saturated Fat",
];

const toNumber = (value: unknown): number | null => {
  if (value === null || value === undefined || value === "") return null;
  const n = Number(value);
  return Number.isNaN(n) ? null : n;
};

const formatNumber = (value: number | null) => {
  if (value === null) return "N/A";
  return Number.isInteger(value) ? String(value) : value.toFixed(1);
};

const getLevel = (
  percent: number,
  low: number,
  high: number
): "low" | "medium" | "high" => {
  if (percent < low) return "low";
  if (percent > high) return "high";
  return "medium";
};

export const buildNutritionDisplayItems = (
  items: NutritionItem[],
  servings?: number,
  targetOverrides: NutritionTargetOverrides = {}
): NutritionDisplayItem[] => {
  const safeServings =
    servings && Number(servings) > 0 ? Number(servings) : 1;

  const normalized: NutritionDisplayItem[] = items
    .filter((item) => item && item.label)
    .map((item) => {
      const config = NUTRITION_CONFIG[item.label];
      const rawValue = toNumber(item.value);
      const valuePerServing =
        rawValue === null ? null : rawValue / safeServings;

      const unit = item.unit || config?.unit || "";

      const defaultTarget = config?.target ?? null;
      const overrideTarget = targetOverrides[item.label];
      const target =
        overrideTarget !== undefined && overrideTarget > 0
          ? overrideTarget
          : defaultTarget;

      const percent =
        valuePerServing !== null && target
          ? Math.min((valuePerServing / target) * 100, 100)
          : 0;

      const level = getLevel(
        percent,
        config?.low ?? 30,
        config?.high ?? 70
      );

      return {
        label: item.label,
        value: valuePerServing,
        formattedValue: formatNumber(valuePerServing),
        unit,
        target,
        targetLabel: target ? `${target}${unit ? unit : ""}` : "—",
        percent,
        percentText: `${Math.round(percent)}%`,
        level,
        icon: item.icon,
      };
    });

  normalized.sort((a, b) => {
    const aIndex = ORDER.indexOf(a.label);
    const bIndex = ORDER.indexOf(b.label);
    const safeA = aIndex === -1 ? 999 : aIndex;
    const safeB = bIndex === -1 ? 999 : bIndex;
    return safeA - safeB;
  });

  return normalized;
};

export const getNutritionOverview = (items: NutritionDisplayItem[]) => {
  const calories =
    items.find((item) => item.label === "Calories") || null;

  const averagePercent =
    items.length > 0
      ? Math.round(
        items.reduce((sum, item) => sum + item.percent, 0) / items.length
      )
      : 0;

  const level =
    averagePercent < 30 ? "Low" : averagePercent > 70 ? "High" : "Medium";

  return {
    caloriesValue: calories?.formattedValue ?? "N/A",
    caloriesUnit: calories?.unit ?? "kcal",
    caloriesPercent: calories?.percentText ?? "0%",
    caloriesTarget: calories?.target
      ? `${calories.target} ${calories.unit}`
      : "—",
    caloriesIcon: calories?.icon ?? "",
    level,
    ringPercent: calories?.percent ?? 0,
  };
};
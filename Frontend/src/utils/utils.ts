/**
 * Format Prep time for ItemCard component
 * Convert "PT45M" to "45m" for example
 * Default to "15m"
 * @param isoTime 
 * @returns 
 */
export const formatPrepTime = (isoTime: string | undefined): string => {
    if (!isoTime) return "15m";

    // Example: "PT45M" -> 45m
    const match = isoTime.match(/PT(?:(\d+)H)?(?:(\d+)M)?/);

    if (!match) return "15m";

    const hours = match[1] ? `${match[1]}h` : "";
    const mins = match[2] ? `${match[2]}m` : "";

    return `${hours}${mins}` || "15m";
};

/**
 * Formate Prep time for filtering
 * Convert ISO duration (PT1H30M) → total minutes (90)
 * Used for filtering, NOT UI
 */
export const isoDurationToMinutes = (
    isoTime: string | undefined
): number | null => {
    if (!isoTime) return null;

    const match = isoTime.match(/PT(?:(\d+)H)?(?:(\d+)M)?/);
    if (!match) return null;

    const hours = match[1] ? parseInt(match[1]) : 0;
    const minutes = match[2] ? parseInt(match[2]) : 0;

    return hours * 60 + minutes;
};

/**
 * Check if two time ranges are the same
 * @param a 
 * @param b 
 * @returns 
 */
export const isSameRange = (
    a: { min: number | null; max: number | null } | null,
    b: { min: number | null; max: number | null } | null
) => {
    if (!a && !b) return true;
    if (!a || !b) return false;
    return a.min === b.min && a.max === b.max;
};
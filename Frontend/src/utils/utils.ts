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
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import PantryItemSection, { type PantryItem } from "../../components/PantryItemSection/PantryItemSection"; import { getPantryItems } from "../../services/api";

import "./pantrypage.css";

/**
 * Pantry Page
 * Displays user's pantry items grouped by storage location (Fridge, Pantry, Freezer)
 */

interface PantrySection {
    section: string;
    items: PantryItem[];
}

const PantryPage: React.FC = () => {
    const SECTION_ORDER = ["Pantry", "Refrigerator", "Freezer"];
    const [pantryData, setPantryData] = useState<PantrySection[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const navigate = useNavigate();

    useEffect(() => {
        fetchPantryData();

        const refresh = () => fetchPantryData();
        window.addEventListener("pantry:refresh", refresh);

        return () => window.removeEventListener("pantry:refresh", refresh);
    }, []);

    const fetchPantryData = async () => {
        try {
            setIsLoading(true);
            setError(null);

            // Get user from localStorage
            const userStr = localStorage.getItem("user");
            if (!userStr) {
                setError("Please log in to view your pantry");
                setIsLoading(false);
                return;
            }

            const user = JSON.parse(userStr);
            const response = await getPantryItems(user.id);

            // Transform grouped_items to pantryData format
            const grouped = response.grouped_items || {};
            const sections: PantrySection[] = Object.keys(grouped)
                .sort((a, b) => {
                    const indexA = SECTION_ORDER.indexOf(a);
                    const indexB = SECTION_ORDER.indexOf(b);

                    // both known -> follow fixed order
                    if (indexA !== -1 && indexB !== -1) {
                        return indexA - indexB;
                    }

                    // known sections always come first
                    if (indexA !== -1) return -1;
                    if (indexB !== -1) return 1;

                    // fallback alphabetical
                    return a.localeCompare(b);
                })
                .map((storage) => ({
                    section: storage,
                    items: grouped[storage]
                }));

            setPantryData(sections);
        } catch (err: any) {
            console.error("Error fetching pantry data:", err);
            setError("Failed to load pantry items");
        } finally {
            setIsLoading(false);
        }
    };

    if (isLoading) {
        return (
            <div className="pantry__container">
                <div className="pantry__content">
                    <p>Loading your pantry...</p>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="pantry__container">
                <div className="pantry__content">
                    <p>{error}</p>
                </div>
            </div>
        );
    }

    return (
        <div className="pantry__container">
            <div className="pantry__content">
                {pantryData.length === 0 ? (
                    <p>Your pantry is empty. Scan a receipt to add items!</p>
                ) : (
                    pantryData.map((section) => (
                        <PantryItemSection
                            key={section.section}
                            section={section.section}
                            items={section.items}
                            onRefresh={fetchPantryData}
                            onSeeMore={(storage) =>
                                navigate(`/pantry-${storage.toLowerCase()}`)
                            }
                        />
                    ))
                )}
            </div>
        </div>
    );
};

export default PantryPage;
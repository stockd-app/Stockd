import React, { useState, useEffect } from "react";
import { getPantryItems } from "../../services/api";
import PantryItemSection, { type PantryItem } from "../../components/PantryItemSection/PantryItemSection";
import BottomNavBar from "../../components/NavigationBar/BottomNavBar/BottomNavBar";

import "./pantrypage.css";

interface PantrySection {
    section: string;
    items: PantryItem[];
}

/**
 * Pantry Page
 * Displays user's pantry items grouped by storage location (Fridge, Pantry, Freezer)
 */
const PantryPage: React.FC = () => {
    const [pantryData, setPantryData] = useState<PantrySection[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        fetchPantryData();
    }, []);

    const fetchPantryData = async () => {
        try {
            setIsLoading(true);
            setError(null);

            // Get user from localStorage TODO: avoid prop drilling in the future, use localStorage instead
            const userStr = localStorage.getItem("user");
            if (!userStr) {
                setError("Please log in to view your pantry");
                setIsLoading(false);
                return;
            }

            const user = JSON.parse(userStr);
            const response = await getPantryItems(user.id);
            console.log("Pantry items fetched:", response);

            // Transform grouped_items to pantryData format
            const grouped = response.grouped_items || {};
            const sections: PantrySection[] = Object.keys(grouped).map((storage) => ({
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
                <BottomNavBar />
            </div>
        );
    }

    if (error) {
        return (
            <div className="pantry__container">
                <div className="pantry__content">
                    <p>{error}</p>
                </div>
                <BottomNavBar />
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
                        />
                    ))
                )}
            </div>
            <BottomNavBar />
        </div>
    );
};

export default PantryPage;
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import PantryItemSection, { type PantryItem } from "../../components/PantryItemSection/PantryItemSection"; import { getPantryItems } from "../../services/api";
import loading_anim from "../../assets/images/loading_anim.gif";

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
    const SECTION_ORDER = ["Pantry", "Fridge", "Freezer"];
    const [pantryData, setPantryData] = useState<PantrySection[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [showFallback, setShowFallback] = useState(false);

    useEffect(() => {
        let timer: ReturnType<typeof setTimeout>;;

        if (isLoading) {
            timer = setTimeout(() => {
                setShowFallback(true);
            }, 2500);
        } else {
            setShowFallback(false);
        }

        return () => {
            if (timer) clearTimeout(timer);
        };
    }, [isLoading]);

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
                <div className="pantry__centered">

                    {!showFallback ? (
                        <img
                            src={loading_anim}
                            alt="Loading"
                            className="pantry__loading_image"
                        />
                    ) : (
                        <div className="pantry__fallback">
                            <p className="pantry__title">
                                Still loading your pantry...
                            </p>
                            <p className="pantry__subtitle">
                                This is taking longer than expected. Please try again.
                            </p>
                        </div>
                    )}

                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="pantry__container">
                <div className="pantry__centered">
                    <div className="pantry__fallback">
                        <p className="pantry__title">Something went wrong</p>
                        <p className="pantry__subtitle">{error}</p>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="pantry__container">
            <div className="pantry__content">
                {pantryData.length === 0 ? (
                    <div className="pantry__centered">
                        <div className="pantry__fallback">
                            <p className="pantry__title">
                                Your pantry is empty.
                            </p>
                            <p className="pantry__subtitle">
                                Add ingredients by scanning a receipt or entering them manually.
                            </p>
                        </div>
                    </div>
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
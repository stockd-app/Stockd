import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { SlidersHorizontal, ArrowLeft } from "lucide-react";
import type { Recipe } from "../Dashboard/Dashboard";
import { applyAllergenFilter, formatRecipes, isoDurationToMinutes, isSameRange } from "../../utils/utils";
import { TIME_RANGES } from "../../config/consts";
import FilterDrawer from "../../components/FilterDrawer/FilterDrawer";
import FilterChip from "../../components/FilterChip/FilterChip";
import RecipeItemCard from "../../components/RecipeItemCard/RecipeItemCard";

import "./pantryrecipelistpage.css";

interface PantryRecipeListPageProps {
    title: string;
    fetchRecipes: (userId: number) => Promise<any>;
}

/**
 * Reusable Pantry Recipe List Recommendation Page Component
 * @returns 
 */
const PantryRecipeListPage: React.FC<PantryRecipeListPageProps> = ({ title, fetchRecipes }) => {
    const navigate = useNavigate();

    // Recipes visible to the user after applying allergen preferences
    const [recipes, setRecipes] = useState<Recipe[]>([]);

    // Recipes displayed after applying UI-level filters (rating, time, etc.)
    const [filteredRecipes, setFilteredRecipes] = useState<Recipe[]>([]);

    const [showFilters, setShowFilters] = useState(false);

    const [filters, setFilters] = useState({
        minRating: 0,
        timeRange: null as { min: number | null; max: number | null } | null,
    });


    useEffect(() => {
        const user = JSON.parse(localStorage.getItem("user") || "null");
        if (!user) {
            navigate("/");
            return;
        }

        const load = async () => {
            const data = await fetchRecipes(user.id);
            console.log("Fetched pantry recipes:", data);
            const formatted = formatRecipes(data.content_based || data.recommendations || []);

            const mode = localStorage.getItem("allergen_visibility");
            const visible =
                mode === "hide" ? applyAllergenFilter(formatted) : formatted;

            setRecipes(visible);
            setFilteredRecipes(visible);
        };
        load();
    }, []);

    useEffect(() => {
        let result = [...recipes];

        if (filters.minRating > 0) {
            result = result.filter(r => (r.rating ?? 0) >= filters.minRating);
        }

        const range = filters.timeRange;

        if (range) {
            result = result.filter(r => {
                const mins = isoDurationToMinutes(r.rawTime);
                if (mins === null) return false;

                if (range.min !== null && mins < range.min) return false;
                if (range.max !== null && mins > range.max) return false;

                return true;
            });
        }
        setFilteredRecipes(result);
    }, [filters, recipes]);

    return (
        <div className="pantryRecipes__container">
            {/* Header */}
            <div className="pantryRecipes__header">
                <button
                    onClick={() => navigate(-1)}
                    className="backBtn"
                    aria-label="Go back"
                >
                    <ArrowLeft size={22} />
                </button>

                <h2 className="pantryRecipes__title">{title}</h2>

                <button
                    className="filterIcon"
                    onClick={() => setShowFilters(true)}
                    aria-label="Open filters"
                >
                    <SlidersHorizontal size={20} />
                </button>
            </div>

            {/* Grid */}
            <div className="pantryRecipes__grid">
                {filteredRecipes.map(recipe => (
                    <RecipeItemCard
                        key={recipe.id}
                        name={recipe.name}
                        image={recipe.image}
                        rating={recipe.rating}
                        time={recipe.time}
                        status={recipe.status}
                        allergens={recipe.allergens}
                        onClick={() => navigate(`/recipes/${recipe.id}`)}
                    />
                ))}
            </div>

            {/* Filter Drawer */}
            <FilterDrawer open={showFilters} onClose={() => setShowFilters(false)}>
                <div className="filter__section">
                    <h4>Cooking Time</h4>
                    <div className="filter__chips">
                        {TIME_RANGES.map(opt => (
                            <FilterChip
                                key={opt.label}
                                label={opt.label}
                                active={isSameRange(filters.timeRange, opt.value)}

                                onClick={() =>
                                    setFilters(prev => ({
                                        ...prev,
                                        timeRange: opt.value,
                                    }))
                                }
                            />
                        ))}
                    </div>
                </div>


                <div className="filter__section">
                    <h4>Minimum Rating</h4>
                    <div className="filter__chips">
                        {[0, 3, 4, 5].map(r => (
                            <FilterChip
                                key={r}
                                label={r === 0 ? "All" : `${r}★ & up`}
                                active={filters.minRating === r}
                                onClick={() =>
                                    setFilters(prev => ({ ...prev, minRating: r }))
                                }
                            />
                        ))}
                    </div>
                </div>

                <div className="filter__actions">
                    <button
                        className="filter__reset"
                        onClick={() =>
                            setFilters({
                                minRating: 0,
                                timeRange: null,
                            })
                        }
                    >
                        Reset
                    </button>
                    <button
                        className="filter__apply"
                        onClick={() => setShowFilters(false)}
                    >
                        Apply
                    </button>
                </div>
            </FilterDrawer>
        </div>
    );
};

export default PantryRecipeListPage;

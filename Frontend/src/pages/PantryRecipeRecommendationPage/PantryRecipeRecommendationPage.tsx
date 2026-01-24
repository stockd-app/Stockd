import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { SlidersHorizontal } from "lucide-react";
import type { Recipe } from "../Dashboard/Dashboard";
import { getPantryRecommendations } from "../../services/api";
import { formatPrepTime, isoDurationToMinutes, isSameRange } from "../../utils/utils";
import { TIME_RANGES } from "../../config/consts";
import FilterDrawer from "../../components/FilterDrawer/FilterDrawer";
import FilterChip from "../../components/FilterChip/FilterChip";
import RecipeItemCard from "../../components/RecipeItemCard/RecipeItemCard";
import image_placeholder from "../../assets/images/error_handling/image_placeholder.png";
import DOMPurify from "dompurify";

import "./pantryreciperecommendationpage.css";

/**
 * Pantry Recipe Recommendation Page Component
 * @returns 
 */
const PantryRecipeRecommendationPage: React.FC = () => {
    const navigate = useNavigate();

    const [recipes, setRecipes] = useState<Recipe[]>([]);
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

        const fetchRecipes = async () => {
            const data = await getPantryRecommendations(user.id, 50);

            const formatted = data.content_based.map((r: any, i: number) => ({
                id: r.RecipeId || i,
                name: DOMPurify.sanitize(r.Name),
                image: r.Images?.[0] || image_placeholder,
                rating: Number(r.AggregatedRating) || 0,
                rawTime: r.PrepTime,               // ISO string
                time: formatPrepTime(r.PrepTime),  // UI string
                allergens: r.Allergens ?? [],
            }));

            setRecipes(formatted);
            setFilteredRecipes(formatted);
        };

        fetchRecipes();
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
                <button onClick={() => navigate(-1)} className="backBtn">←</button>
                <h2>Discover Recipes</h2>
                <button
                    className="filterIcon"
                    onClick={() => setShowFilters(true)}
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

export default PantryRecipeRecommendationPage;

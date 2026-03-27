import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { SlidersHorizontal, ArrowLeft } from "lucide-react";
import type { Recipe } from "../Dashboard/Dashboard";
import { applyAllergenFilter, formatRecipes, isoDurationToMinutes, isSameRange } from "../../utils/utils";
import { TIME_RANGES } from "../../config/consts";
import FilterDrawer from "../../components/FilterDrawer/FilterDrawer";
import FilterChip from "../../components/FilterChip/FilterChip";
import RecipeListCard from "../../components/RecipeListCard/RecipeListCard";
import Button from "../../components/Button/Button";
import EmptyPantryImage from "../../assets/images/EmptyPantry.png";
import "@/styles/variable.css";
import loading_anim from "../../assets/images/loading_anim.gif";
import { getLikedRecipes, toggleLikeRecipe } from "../../services/api";

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
    const [likedRecipeIds, setLikedRecipeIds] = useState<Set<number>>(new Set());

    const [showFilters, setShowFilters] = useState(false);

    const [filters, setFilters] = useState({
        minRating: 0,
        timeRange: null as { min: number | null; max: number | null } | null,
        category: null as string | null,
    });

    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const user = JSON.parse(localStorage.getItem("user") || "null");
        if (!user) {
            navigate("/");
            return;
        }

        const load = async () => {
            try {
                const data = await fetchRecipes(user.id);
                console.log("Fetched pantry recipes:", data);
                const formatted = formatRecipes(data.content_based || data.recommendations || []);

                const mode = localStorage.getItem("allergen_visibility");
                const visible =
                    mode === "hide" ? applyAllergenFilter(formatted) : formatted;

                setRecipes(visible);
                setFilteredRecipes(visible);

                const likedRes = await getLikedRecipes();
                const likedIds = new Set<number>();
                likedRes.liked_recipes.forEach((item: any) => likedIds.add(item.recipe.RecipeId));

                setLikedRecipeIds(likedIds);
            } catch (err) {
                console.error("Failed to load recipes:", err);
            } finally {
                setIsLoading(false);
            }
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

        if (filters.category) {
            result = result.filter(
                r => r.category?.toLowerCase() === filters.category?.toLowerCase()
            );
        }

        setFilteredRecipes(result);
    }, [filters, recipes]);

    const categories = Array.from(
        new Set(
            recipes
                .map(r => r.category)
                .filter((cat): cat is string => Boolean(cat))
        )
    );

    return (
        <div className="pantryRecipes__container">
            {/* Header */}
            <div className="pantryRecipes__header">
                <Button variant="back" onClick={() => navigate(-1)} aria-label="Go back" />

                <h2 className="pantryRecipes__title">{title}</h2>

                <Button
                    className="pantryRecipes__filterButton"
                    variant=""
                    onClick={() => setShowFilters(true)}
                    aria-label="Open filters"
                >
                    <SlidersHorizontal size={20} className="pantryRecipes__filterIcon" />
                </Button>
            </div>

            {/* Grid */}
            <div className="pantryRecipes__grid">

                {isLoading ? (
                    <div className="pantryRecipes__centered">
                        <img
                            src={loading_anim}
                            alt="Loading"
                            className="pantryRecipes__loading"
                        />
                    </div>
                ) : filteredRecipes.length === 0 ? (
                    <div className="pantryRecipes__centered">
                        <div className="pantryRecipes__empty">
                            <img
                            src={EmptyPantryImage}
                            alt="No recipes found"
                            className="pantryRecipes__emptyImage"
                            />
                            <p className="no-results">
                            Sorry, we couldn't find any recipes. try searching something else.
                            </p>
                        </div>
                    </div>
                    
                ) : (
                    filteredRecipes.map(recipe => (
                        <RecipeListCard
                            key={recipe.id}
                            recipeId={recipe.id}
                            name={recipe.name}
                            image={recipe.image}
                            rating={recipe.rating}
                            time={recipe.time}
                            allergens={recipe.allergens}
                            initialLiked={likedRecipeIds.has(recipe.id)}
                            onLikedChange={(liked) => {
                                setLikedRecipeIds(prev => {
                                    const next = new Set(prev);
                                    if (liked) next.add(recipe.id);
                                    else next.delete(recipe.id);
                                    return next;
                                });
                            }}
                            onClick={() => navigate(`/recipes/${recipe.id}`)}
                        />
                    ))
                )}
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

                <div className="filter__section">
                    <h4>Category</h4>
                    <div className="filter__chips">
                        <FilterChip
                            label="All"
                            active={filters.category === null}
                            onClick={() =>
                                setFilters(prev => ({ ...prev, category: null }))
                            }
                        />

                        {categories.map(cat => (
                            <FilterChip
                                key={cat}
                                label={cat}
                                active={filters.category === cat}
                                onClick={() =>
                                    setFilters(prev => ({ ...prev, category: cat }))
                                }
                            />
                        ))}
                    </div>
                </div>

                <div className="filter__actions">
                    <Button
                        variant="secondary"
                        onClick={() =>
                            setFilters({
                                minRating: 0,
                                timeRange: null,
                                category: null,
                            })
                        }>
                        Clear All
                    </Button>
                    <Button
                        variant="primary"
                        onClick={() => setShowFilters(false)}
                    >
                        Apply
                    </Button>
                </div>
            </FilterDrawer>
        </div>
    );
};

export default PantryRecipeListPage;

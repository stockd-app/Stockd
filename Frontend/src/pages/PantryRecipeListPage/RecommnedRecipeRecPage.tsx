import React from "react";
import PantryRecipeListPage from "../PantryRecipeListPage/PantryRecipeListPage";
import { getRecommendedRecipes } from "../../services/api";
import { useParams } from "react-router-dom";

const RecommendedRecipeRecPage = () => {
    const { category } = useParams<{ category: string }>();

    if (!category) {
        return <div>Error: No category selected</div>;
    }

    // Fetch function that filters by category
    const fetchRecipesForCategory = async (userId: number) => {
        const data = await getRecommendedRecipes(userId, 100);
        const recipes = data.recommendations || [];

        const key = category?.toLowerCase() || "";

        const filtered = recipes.filter((recipe: any) => {
            const recipeCategory = recipe.RecipeCategory?.toLowerCase() || "";
            const keywords = recipe.Keywords?.map((k: string) => k.toLowerCase()) || [];

            return recipeCategory.includes(key) || keywords.some((k: string) => k.includes(key));
        });

        return { content_based: filtered };
    };

    return (
        <PantryRecipeListPage
            title={`Recommended ${category?.charAt(0).toUpperCase() + category?.slice(1)} Recipes`}
            fetchRecipes={(userId) => fetchRecipesForCategory(userId)}
        />
    );
};

export default RecommendedRecipeRecPage;
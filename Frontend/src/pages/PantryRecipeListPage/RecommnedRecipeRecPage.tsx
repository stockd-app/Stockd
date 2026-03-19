import PantryRecipeListPage from "../PantryRecipeListPage/PantryRecipeListPage";
import { getRecommendedRecipes } from "../../services/api";
import { useParams } from "react-router-dom";

const recipeCache: Record<string, any> = {};

const RecommendedRecipeRecPage = () => {
    const { category } = useParams<{ category: string }>();

    if (!category) {
        return <div>Error: No category selected</div>;
    }

    const fetchRecipesForCategory = async (userId: number) => {
        const key = `${userId}_${category.toLowerCase()}`;

        if (recipeCache[key]) {
            return recipeCache[key];
        }

        const data = await getRecommendedRecipes(userId, 500);
        const recipes = data.recommendations || [];

        const filtered = recipes.filter((recipe: any) => {
            const recipeCategory = recipe.RecipeCategory?.toLowerCase() || "";
            const keywords = recipe.Keywords?.map((k: string) => k.toLowerCase()) || [];
            return recipeCategory.includes(category.toLowerCase()) || keywords.some((k: string | string[]) => k.includes(category.toLowerCase()));
        });

        // Save in cache
        recipeCache[key] = { content_based: filtered };
        return recipeCache[key];
    };

    return (
        <PantryRecipeListPage
            title={`Explore ${category.charAt(0).toUpperCase() + category.slice(1)} Recipes`}
            fetchRecipes={fetchRecipesForCategory}
        />
    );
};

export default RecommendedRecipeRecPage;
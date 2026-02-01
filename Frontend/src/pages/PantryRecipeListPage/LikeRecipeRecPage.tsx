import { getRecommendLikeRecipes } from "../../services/api";
import PantryRecipeListPage from "../PantryRecipeListPage/PantryRecipeListPage";

const LikedRecipeRecPage = () => {
    return (
        <PantryRecipeListPage
            title="Based On Your Liked Recipes"
            fetchRecipes={(userId) => getRecommendLikeRecipes(userId, 50)}
        />
    );
};

export default LikedRecipeRecPage;

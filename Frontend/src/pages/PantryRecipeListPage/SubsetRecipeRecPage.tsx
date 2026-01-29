import PantryRecipeListPage from "../PantryRecipeListPage/PantryRecipeListPage";
import { getSubsetRecipes } from "../../services/api";

const SubsetRecipeRecPage = () => {
    return (
        <PantryRecipeListPage
            title="Based On Your Pantry"
            fetchRecipes={(userId) => getSubsetRecipes(userId, 50)}
        />
    );
};

export default SubsetRecipeRecPage;

import PantryRecipeListPage from "../PantryRecipeListPage/PantryRecipeListPage";
import { getIncompleteRecipes } from "../../services/api";

const IncompleteRecipeRecPage = () => {
    return (
        <PantryRecipeListPage
            title="You May Not Have All The Ingredients"
            fetchRecipes={(userId) => getIncompleteRecipes(userId, 50)}
        />
    );
};

export default IncompleteRecipeRecPage;

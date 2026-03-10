import PantryRecipeListPage from "../PantryRecipeListPage/PantryRecipeListPage";
import { getIncompleteRecipes } from "../../services/api";

const IncompleteRecipeRecPage = () => {
    return (
        <PantryRecipeListPage
            title="Some Ingredients Needed"
            fetchRecipes={(userId) => getIncompleteRecipes(userId, 50)}
        />
    );
};

export default IncompleteRecipeRecPage;

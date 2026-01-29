import PantryRecipeListPage from "../PantryRecipeListPage/PantryRecipeListPage";
import { getCollaborativeRecipes } from "../../services/api";

const CollaborativeRecipeRecPage = () => {
  return (
    <PantryRecipeListPage
      title="Collaborative Recipes Recommended"
      fetchRecipes={(userId) => getCollaborativeRecipes(userId, 50)}
    />
  );
};

export default CollaborativeRecipeRecPage;

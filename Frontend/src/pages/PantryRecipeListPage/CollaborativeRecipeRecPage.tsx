import PantryRecipeListPage from "../PantryRecipeListPage/PantryRecipeListPage";
import { getCollaborativeRecipes } from "../../services/api";

const CollaborativeRecipeRecPage = () => {
  return (
    <PantryRecipeListPage
      title="Other Users Have Tried These"
      fetchRecipes={(userId) => getCollaborativeRecipes(userId, 50)}
    />
  );
};

export default CollaborativeRecipeRecPage;

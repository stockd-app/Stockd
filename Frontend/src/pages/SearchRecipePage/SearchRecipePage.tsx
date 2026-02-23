import { useSearchParams } from "react-router-dom";
import PantryRecipeListPage from "../PantryRecipeListPage/PantryRecipeListPage";
import { searchRecipes } from "../../services/api";
import { formatRecipes } from "../../utils/utils";

const SearchRecipePage = () => {
  const [params] = useSearchParams();
  const query = params.get("q") ?? "";

  return (
    <PantryRecipeListPage
      title={`Search results for "${query}"`}
      fetchRecipes={async (_userId: number) => {
        if (!query.trim()) {
          return { content_based: [] };
        }

        const results = await searchRecipes(query, 50);

        return {
          content_based: results,
        };
      }}
    />
  );
};

export default SearchRecipePage;
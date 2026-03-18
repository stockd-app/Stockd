import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { getSubsetRecipes, getIncompleteRecipes, updateUserAllergens, getRecommendLikeRecipes, getCollaborativeRecipes, getLikedRecipes } from "../../services/api";
import { applyAllergenFilter, formatRecipes } from "../../utils/utils";
import SearchBar from "../../components/SearchBar/SearchBar";
import FoodCategorySection from "../../components/FoodCategoryCard/FoodCategorySection";
import RecipeItemSection from "../../components/RecipeItemSection/RecipeItemSection";
import ExploreSection from "../../components/Dashboard/ExploreSection";
import AllergensModal from "../../components/AllergensModal/AllergensModal";
import AllergenPreferenceModal from "../../components/AllergenPreferenceModal/AllergenPreferenceModal";

import "./dashboard.css";

interface DashboardProps {
  userId: number | null;
}

/**
 * Represent what a recipe is
 */
export interface Recipe {
  id: number;
  name: string;
  image: string;
  rating?: number;
  time?: string;     // e.g. "35m" (For UI display)
  rawTime?: string;  // e.g. "PT35M" (For filtering purposes)
  category?: string; // e.g. "Beverages" (For filtering purposes)
  status?: string;
  allergens?: string[];
}

/**
 * Represents how the user wants to filter recipes
 */
export interface RecipeFilters {
  minRating: number;
  timeRange: {
    min: number | null;
    max: number | null;
  } | null;
  categories: string;
}


/**
 * Dashboard Page Component
 * TODO : Fetch and display dynamic data for AI  ***
 * TODO : Handling the situation where the backend pantry has no ingredients (an empty pantry displays a blur layer) ***
 * TODO : Click on the recipe to go to the single recipe page
 * TODO : API encapsulated into the services layer ***
 * @returns JSX.Element
 */
const Dashboard: React.FC<DashboardProps> = ({ userId }) => {
  // Initial state for showing allergens modal
  const [showAllergensModal, setShowAllergensModal] = useState(false);

  // State to control showing allergen preference modal
  const [showAllergenFilterModal, setShowAllergenFilterModal] = useState(false);



  // State to hold and pass input-text down to RecipeItemSection for UI display
  const [searchQuery, setSearchQuery] = useState("");



  // Recipes that are fully cookable with current pantry items (may be filtered by allergens, search, etc.)
  const [subsetRecipes, setSubsetRecipes] = useState<Recipe[]>([]);

  // Recipes with possible missing ingredients (may be filtered by allergens, search, etc.)
  const [incompleteRecipes, setIncompleteRecipes] = useState<Recipe[]>([]);



  // Recipes currently displayed in the UI after applying transient UI filters (e.g. search)
  // Derived from subsetRecipes and reset when UI filters are cleared
  const [filteredSubsetRecipes, setFilteredSubsetRecipes] = useState<Recipe[]>([]);

  // Recipes currently displayed in the UI after applying transient UI filters (e.g. search)
  // Derived from incompleteRecipes and reset when UI filters are cleared
  const [filteredIncompleteRecipes, setFilteredIncompleteRecipes] = useState<Recipe[]>([]);

  // Recipes recommended based on user's liked recipes
  const [likedRecommendedRecipes, setLikedRecommendedRecipes] = useState<Recipe[]>([]);
  const [filteredLikedRecommendedRecipes, setFilteredLikedRecommendedRecipes] = useState<Recipe[]>([]);

  // Collaborative filtering
  const [collaborativeRecipes, setCollaborativeRecipes] = useState<Recipe[]>([]);
  const [filteredCollaborativeRecipes, setFilteredCollaborativeRecipes] = useState<Recipe[]>([]);

  const [likedRecipeIds, setLikedRecipeIds] = useState<Set<number>>(new Set());

  const navigate = useNavigate();

  const handleSearchSubmit = () => {
    if (!searchQuery.trim()) return;
    navigate(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
  };

  /**
   * Check if user has completed allergens onboarding
   */
  useEffect(() => {
    const onboarded = localStorage.getItem("allergens_onboarded");

    if (!onboarded) {
      setShowAllergensModal(true);
    }
  }, []);

  /**
   * Fetch recipe recommendations
   */
  useEffect(() => {
    if (!userId) {
      navigate("/");
      return;
    }


    const fetchRecommendations = async () => {
      try {
        console.log("Attempt fetch recommendation pantry")
        const [subsetData, incompleteData, likedData, collaborativeData, likedRes] = await Promise.all([
          getSubsetRecipes(userId, 5),
          getIncompleteRecipes(userId, 5),
          getRecommendLikeRecipes(userId, 5),
          getCollaborativeRecipes(userId, 5),
          getLikedRecipes(),
        ]);
        const likedIds = new Set<number>();
        likedRes.liked_recipes.forEach((item: any) => likedIds.add(item.recipe.RecipeId));
        setLikedRecipeIds(likedIds);
        console.log("Cookable subset pantry recommendations:", subsetData.content_based);
        console.log("Incomplete ingredient pantry recommendations:", incompleteData.content_based);
        console.log("Liked recipe recommendations:", likedData.content_based);
        console.log("Collaborative recommendations:", collaborativeData.recommendations);

        const formattedSubset = formatRecipes(subsetData.content_based);
        const formattedIncompleteIngredient = formatRecipes(incompleteData.content_based);
        const formattedLiked = formatRecipes(likedData.content_based ?? []);
        const formattedCollaborative = formatRecipes(collaborativeData.recommendations ?? []);
        const mode = localStorage.getItem("allergen_visibility");

        // Apply allergen filter if set
        const visibleSubsetRecipe =
          mode === "hide"
            ? applyAllergenFilter(formattedSubset)
            : formattedSubset;

        const visibleIncmpltIngrdRecipe =
          mode === "hide"
            ? applyAllergenFilter(formattedIncompleteIngredient)
            : formattedIncompleteIngredient;

        const visibleLikedRecipes =
          mode === "hide"
            ? applyAllergenFilter(formattedLiked)
            : formattedLiked;

        const visibleCollaborative =
          mode === "hide"
            ? applyAllergenFilter(formattedCollaborative)
            : formattedCollaborative;

        const markLiked = (recipes: Recipe[]) =>
          recipes.map(r => ({ ...r, liked: likedIds.has(r.id) }));

        setSubsetRecipes(markLiked(visibleSubsetRecipe));
        setIncompleteRecipes(markLiked(visibleIncmpltIngrdRecipe));
        setLikedRecommendedRecipes(markLiked(visibleLikedRecipes));
        setFilteredSubsetRecipes(markLiked(visibleSubsetRecipe));
        setFilteredIncompleteRecipes(markLiked(visibleIncmpltIngrdRecipe));
        setFilteredLikedRecommendedRecipes(markLiked(visibleLikedRecipes));
        setCollaborativeRecipes(markLiked(visibleCollaborative));
        setFilteredCollaborativeRecipes(markLiked(visibleCollaborative));
      } catch (err) {
        console.error("Error fetching recommendations:", err);
      }
    };

    fetchRecommendations();
  }, [userId]);

  /**
   * Handle confirmation of selected allergens from the modal
   * @param selected 
   */
  const handleAllergensConfirm = async (selected: string[]) => {
    try {
      await updateUserAllergens(selected);
      localStorage.setItem("user_allergens", JSON.stringify(selected));
      localStorage.setItem("allergens_onboarded", "true");
      setShowAllergensModal(false);

      // Show second modal for allergen filtering if not dismissed before
      const dismissed = localStorage.getItem("allergen_modal_dismissed");
      if (!dismissed) {
        setShowAllergenFilterModal(true);
      }
    } catch (err) {
      console.error("Failed to update allergens", err);
    }
  };

  return (

    <div className="dashboard__container">
      {showAllergensModal && (
        <AllergensModal
          initial={JSON.parse(localStorage.getItem("user_allergens") || "[]")}
          onConfirm={handleAllergensConfirm}
          onClose={() => setShowAllergensModal(false)}
        />
      )}
      {showAllergenFilterModal && (
        <AllergenPreferenceModal
          onConfirm={(mode) => {
            setSubsetRecipes(prev => mode === "hide" ? applyAllergenFilter(prev) : prev);
            setIncompleteRecipes(prev => mode === "hide" ? applyAllergenFilter(prev) : prev);
            setShowAllergenFilterModal(false);
          }}
          onCancel={() => {
            setShowAllergenFilterModal(false);
          }}
        />
      )}
      <div className="dashboard__searchRow">
        <SearchBar
          value={searchQuery}
          onChange={setSearchQuery}
          onSubmit={handleSearchSubmit}
        />
      </div>

      <FoodCategorySection userId={userId} />

      <RecipeItemSection
        title="Based On Your Pantry"
        items={filteredSubsetRecipes}
        onItemClick={(recipeId: number) => {
          navigate(`/recipes/${recipeId}`);
        }}
        onSeeMore={() => navigate("/pantry-subset-recipes")}
        emptyTitle={"Nothing Cookable Yet!"}
        emptySubtitle={"Add More Ingredients To Your Pantry To Unlock New Recipes!"}
      />

      <RecipeItemSection title="Some Ingredients Needed"
        items={filteredIncompleteRecipes}
        onItemClick={(recipeId: number) => {
          navigate(`/recipes/${recipeId}`);
        }}
        onSeeMore={() => navigate("/pantry-incomplete-recipes")}
        emptyTitle={"Let’s Stock Your Pantry!"}
        emptySubtitle={"Add ingredients by uploading a receipt or other methods!"}
      />

      <RecipeItemSection title="Based On Your Liked Recipes"
        items={filteredLikedRecommendedRecipes}
        onItemClick={(recipeId: number) => {
          navigate(`/recipes/${recipeId}`);
        }}
        onSeeMore={() => navigate("/pantry-recommend-liked-recipes")}
        emptyTitle={"No Liked Recipe Recommendations Yet!"}
        emptySubtitle={"Like A Few Recipes To Get Personalized Recommendations!"}
      />
      <RecipeItemSection title="Other Users Have Tried These"
        items={filteredCollaborativeRecipes}
        onItemClick={(recipeId: number) => {
          navigate(`/recipes/${recipeId}`);
        }}
        onSeeMore={() => navigate("/pantry-collaborative-recipes")}
        emptyTitle={"No Collaborative Recommendations Yet!"}
        emptySubtitle={"Cook And Like More Recipes To Improve Recommendations!"
        }
      />
      <ExploreSection />
    </div>
  );
};

export default Dashboard;
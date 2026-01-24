import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { getPantryRecommendations, updateUserAllergens } from "../../services/api";
import { applyAllergenFilter, formatPrepTime, isoDurationToMinutes } from "../../utils/utils";
import SearchBar from "../../components/SearchBar/SearchBar";
import FoodCategorySection from "../../components/FoodCategoryCard/FoodCategorySection";
import RecipeItemSection from "../../components/RecipeItemSection/RecipeItemSection";
import ExploreSection from "../../components/Dashboard/ExploreSection";
import image_placeholder from "../../assets/images/error_handling/image_placeholder.png"
import DOMPurify from "dompurify";
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

  // All pantry recipes as returned from the backend (source of truth, never filtered)
  const [allPantryRecipes, setAllPantryRecipes] = useState<Recipe[]>([]);

  // Pantry recipes currently visible to the user (may be filtered by allergens, search, etc.)
  const [pantryRecipes, setPantryRecipes] = useState<Recipe[]>([]);

  // Recipes currently displayed in the UI after applying transient UI filters (e.g. search)
  // Derived from pantryRecipes and reset when UI filters are cleared
  const [filteredRecipes, setFilteredRecipes] = useState<Recipe[]>([]);

  const navigate = useNavigate();

  /**
   * Check if user has completed allergens onboarding
   */
  useEffect(() => {
    const onboarded = localStorage.getItem("allergens_onboarded");

    if (!onboarded) {
      setShowAllergensModal(true);
    }
  }, []);

  useEffect(() => {
    console.log("Dashboard useEffect mounted");
    console.log("Dashboard useEffect mounted");
    if (!userId) {
      navigate("/");
      return;
    }


    const fetchRecommendations = async () => {
      try {
        console.log("Attempt fetch recommendation pantry")
        const pantryData = await getPantryRecommendations(userId, 5);

        console.log("FULL pantryData response:", pantryData);
        console.log("Pantry-based recommendations:", pantryData.content_based);

        const formatted = pantryData.content_based.map((recipe: any, index: number) => {
          const hasImages = Array.isArray(recipe.Images) && recipe.Images.length > 0;
          const imageUrl = hasImages ? recipe.Images[0] : image_placeholder;

          return {
            id: Number(recipe.RecipeId) || index + 1,
            name: DOMPurify.sanitize(recipe.Name || "Unnamed Recipe"),
            image: imageUrl,
            rating: Number(recipe.AggregatedRating) || 0.0,
            rawTime: recipe.PrepTime,               // ISO string
            time: formatPrepTime(recipe.PrepTime),  // UI string
            allergens: recipe.Allergens ?? [],
            // status: "Available",
          };
        });

        setAllPantryRecipes(formatted);

        const mode = localStorage.getItem("allergen_visibility");

        if (mode === "hide") {
          setPantryRecipes(applyAllergenFilter(formatted));
        } else {
          setPantryRecipes(formatted);
        }
      } catch (err) {
        console.error("Error fetching recommendations:", err);
      }
    };

    fetchRecommendations();
  }, [userId]);

  useEffect(() => {
    if (!searchQuery.trim()) {
      setFilteredRecipes(pantryRecipes);
      return;
    }

    const q = searchQuery.toLowerCase();
    setFilteredRecipes(
      pantryRecipes.filter(r =>
        r.name.toLowerCase().includes(q)
      )
    );
  }, [searchQuery, pantryRecipes]);



  const aiRecommended = [
    {
      id: 3,
      name: "Shepherd’s Pie",
      image: "https://www.thewholesomedish.com/wp-content/uploads/2019/02/The-Best-Classic-Shepherds-Pie-550.jpg",
      rating: 4.0,
      time: "35m",
      status: "Missing 1 item",
    },
    {
      id: 4,
      name: "Scrambled Eggs",
      image: "https://recipeteacher.com/wp-content/uploads/2016/08/Restaurant-Style-Scrambled-Eggs-20-scaled.jpg",
      rating: 4.5,
      time: "10m",
      status: "Available",
    },
  ];

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
        />
      )}
      {showAllergenFilterModal && (
        <AllergenPreferenceModal
          onConfirm={(mode) => {
            if (mode === "hide") {
              setPantryRecipes(applyAllergenFilter(allPantryRecipes));
            } else {
              setPantryRecipes(allPantryRecipes);
            }

            setShowAllergenFilterModal(false);
          }}
          onCancel={() => {
            setPantryRecipes(allPantryRecipes);
            setShowAllergenFilterModal(false);
          }}
        />
      )}
      <div className="dashboard__searchRow">
        <SearchBar value={searchQuery} onChange={setSearchQuery} />
      </div>
      <FoodCategorySection />

      <RecipeItemSection title="Recommended Based on Your Pantry"
        items={filteredRecipes}
        onItemClick={(recipeId: number) => {
          navigate(`/recipes/${recipeId}`);
        }}
        onSeeMore={() => navigate("/pantry-recipes")}
        emptyTitle={
          searchQuery
            ? "No recipes found"
            : "Let’s stock your pantry!"
        }
        emptySubtitle={
          searchQuery
            ? `No results for "${searchQuery}"`
            : "Add ingredients by uploading a receipt or other methods."
        }
      />

      <RecipeItemSection title="AI - Recommended Recipes For You"
        items={aiRecommended} // mock data for now
      />
      <ExploreSection />
    </div>
  );
};

export default Dashboard;
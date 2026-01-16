import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { getPantryRecommendations } from "../../services/api";
import { formatPrepTime, isoDurationToMinutes } from "../../utils/utils";
import SearchBar from "../../components/SearchBar/SearchBar";
import FoodCategorySection from "../../components/FoodCategoryCard/FoodCategorySection";
import RecipeItemSection from "../../components/RecipeItemSection/RecipeItemSection";
import ExploreSection from "../../components/Dashboard/ExploreSection";
import BottomNavBar from "../../components/NavigationBar/BottomNavBar/BottomNavBar";
import image_placeholder from "../../assets/images/error_handling/image_placeholder.png"
import DOMPurify from "dompurify";

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
  // State to hold and pass input-text down to RecipeItemSection for UI display
  const [searchQuery, setSearchQuery] = useState("");

  // Pantry-based recommended recipes, fetched directly from Backend/API (source of truth for pantry recommendations)
  const [pantryRecipes, setPantryRecipes] = useState<Recipe[]>([]);

  // Filtered recipes by search query, derived/based on pantryRecipes
  const [filteredRecipes, setFilteredRecipes] = useState<Recipe[]>([]);

  const navigate = useNavigate();

  useEffect(() => {
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
            rating: Number(recipe.AggregatedRating) || 0,
            rawTime: recipe.PrepTime,               // ISO string
            time: formatPrepTime(recipe.PrepTime),  // UI string
            // status: "Available",
          };
        });

        setPantryRecipes(formatted);
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


  return (
    <div className="dashboard__container">
      <div className="dashboard__searchRow">
        <SearchBar value={searchQuery} onChange={setSearchQuery} />
      </div>
      <FoodCategorySection />
      <RecipeItemSection title="Recommended Based on Your Pantry"
        items={filteredRecipes}
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
      <BottomNavBar />
    </div>
  );
};

export default Dashboard;
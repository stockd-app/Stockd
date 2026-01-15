import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { getPantryRecommendations, getUserAllergens, updateUserAllergens } from "../../services/api";
import { formatPrepTime } from "../../utils/utils";
import SearchBar from "../../components/SearchBar/SearchBar";
import FoodCategorySection from "../../components/FoodCategoryCard/FoodCategorySection";
import RecipeItemSection from "../../components/RecipeItemSection/RecipeItemSection";
import ExploreSection from "../../components/Dashboard/ExploreSection";
import BottomNavBar from "../../components/NavigationBar/BottomNavBar/BottomNavBar";
import image_placeholder from "../../assets/images/error_handling/image_placeholder.png"
import AllergensModal from "../../components/AllergensModal/AllergensModal";
import DOMPurify from "dompurify";

import "./dashboard.css";

interface DashboardProps {
  userId: number | null;
}

/**
 * Dashboard Page Component
 * TODO : Fetch and display dynamic data for AI  ***
 * TODO : Handling the situation where the backend pantry has no ingredients (an empty pantry displays a blur layer) ***
 * TODO : Click on the recipe to go to the single recipe page
 * TODO : SearchBar needs improvement
 * TODO : API encapsulated into the services layer ***
 * @returns JSX.Element
 */
const Dashboard: React.FC<DashboardProps> = ({ userId }) => {
  const [recommendedItems, setRecommendedItems] = useState<any[]>([]);
  const [showAllergensModal, setShowAllergensModal] = useState(false);

  const navigate = useNavigate();

  useEffect(() => {
    console.log("Dashboard useEffect mounted");
    if (!userId) {
      navigate("/");
      return;
    }

    const checkAllergens = async () => {
      const alreadySet = localStorage.getItem("allergens_set");
      if (alreadySet) return;

      try {
        const res = await getUserAllergens();
        if (!res.allergens || res.allergens.length === 0) {
          setShowAllergensModal(true);
        } else {
          localStorage.setItem("allergens_set", "true");
        }
      } catch (err) {
        console.error("Failed to fetch allergens", err);
      }
    };

    checkAllergens();

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
            rating: Number(recipe.AggregatedRating) || 4.0,
            time: formatPrepTime(recipe.PrepTime),
            // status: "Available",
          };
        });

        setRecommendedItems(formatted);
      } catch (err) {
        console.error("Error fetching recommendations:", err);
      }
    };

    fetchRecommendations();
  }, [userId]);

  const handleAllergensConfirm = async (selected: string[]) => {
    try {
      await updateUserAllergens(selected);
      localStorage.setItem("allergens_set", "true");
      setShowAllergensModal(false);
    } catch (err) {
      console.error("Failed to save allergens", err);
    }
  };

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
    <>
      {showAllergensModal && (
        <AllergensModal onConfirm={handleAllergensConfirm} />
      )}
      
    <div className="dashboard__container">
      <SearchBar />
      <FoodCategorySection />
      
      <RecipeItemSection title="Recommended Based on Your Pantry"
        items={recommendedItems}
      />

      <RecipeItemSection title="AI - Recommended Recipes For You"
        items={aiRecommended} // mock data for now
      />
      <ExploreSection />
      <BottomNavBar />
    </div>
    </>
  );
};

export default Dashboard;
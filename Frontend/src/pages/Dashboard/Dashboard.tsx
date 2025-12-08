import React, { useState, useRef, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
// import { Heart } from "lucide-react";
import { DASHBOARD, NOTIFICATION_MESSAGES, NOTIFICATION_TYPES } from "../../config/consts";
import BottomNavBar from "../../components/NavigationBar/BottomNavBar/BottomNavBar";
import CategorySection from "../../components/Dashboard/CategorySection";
import SearchBar from "../../components/Dashboard/SearchBar";
import DashboardSection from "../../components/Dashboard/DashboardSection";
import ExploreSection from "../../components/Dashboard/ExploreSection";

import "@/styles/variable.css";
import "./dashboard.css";
import { getPantryRecommendations } from "../../services/api";

interface DashboardProps {
  userId: number | null;
}

/**
 * Dashboard Page Component
 * TODO : Fetch and display dynamic data ***
 * TODO : Handling the situation where the backend pantry has no ingredients (an empty pantry displays a blur layer) ***
 * TODO : Click on the recipe to go to the single recipe page
 * TODO : SearchBar needs improvement
 * TODO : API encapsulated into the services layer ***
 * @returns JSX.Element
 */
const Dashboard: React.FC<DashboardProps> = ({ userId }) => {
  const [recommendedItems, setRecommendedItems] = useState<any[]>([]);


  // const tabsRef = useRef<HTMLDivElement>(null);
  // const tabs = DASHBOARD.TABS;

  const navigate = useNavigate();

  useEffect(() => {
    console.log("Dashboard useEffect mounted"); 1
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

        const formatted = pantryData.content_based.map((recipe: any, index: number) => ({
          id: recipe.id ?? index + 1,
          name: recipe.name,
          image: recipe.image_url ?? "/placeholder.jpg",
          rating: recipe.rating ?? 4.0,
          time: recipe.time ?? "15m",
          status: "Available",
        }));

        setRecommendedItems(formatted);
      } catch (err) {
        console.error("Error fetching recommendations:", err);
      }
    };

    fetchRecommendations();
  }, [userId]);

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
      <SearchBar /> {/* Search Bar Component */}
      <CategorySection /> {/* Category Section Component */}
      <DashboardSection title="Recommended Based on Your Pantry"
        // items={recommendedItems.length > 0 ? recommendedItems : pantryRecommended}
        items={recommendedItems} // mock data for now
      />

      {/* AI Recommended */}
      <DashboardSection title="AI - Recommended Recipes For You"
        items={aiRecommended} // mock data for now
      />
      <ExploreSection /> {/* Explore Section Component */}
      <BottomNavBar /> {/* BottomNav Bar Component */}
    </div>
  );
};

export default Dashboard;
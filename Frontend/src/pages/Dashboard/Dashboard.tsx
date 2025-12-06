import React, { useState, useRef, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
// import { Heart } from "lucide-react";
import { DASHBOARD, NOTIFICATION_MESSAGES, NOTIFICATION_TYPES } from "../../config/consts";
import { useNotification } from "../../components/Notification/NotificationContext";
import BottomNavBar from "../../components/NavigationBar/BottomNavBar/BottomNavBar";
import CategorySection from "../../components/Dashboard/CategorySection";
import SearchBar from "../../components/Dashboard/SearchBar";
import DashboardSection from "../../components/Dashboard/DashboardSection";
import ExploreSection from "../../components/Dashboard/ExploreSection";

import "@/styles/variable.css";
import "./dashboard.css";

/**
 * Dashboard Page Component
 * TODO : Fetch and display dynamic data ***
 * TODO : Handling the situation where the backend pantry has no ingredients (an empty pantry displays a blur layer) ***
 * TODO : Click on the recipe to go to the single recipe page
 * TODO : SearchBar needs improvement
 * TODO : API encapsulated into the services layer ***
 * @returns JSX.Element
 */
const Dashboard: React.FC = () => {
  // const [activeTab, setActiveTab] = useState<"Discover" | "Recommend" | "Saved">("Discover");
  // const [indicatorStyle, setIndicatorStyle] = useState<{ left: string; width: string }>({ left: "0px", width: "0px" });
  // const [favorites, setFavorites] = useState<number[]>([]);
  const [recommendedItems, setRecommendedItems] = useState<any[]>([]);

  const notify = useNotification();

  // const tabsRef = useRef<HTMLDivElement>(null);
  // const tabs = DASHBOARD.TABS;

  const navigate = useNavigate();

  useEffect(() => {
    console.log("Dashboard useEffect mounted");
    const storedUser = localStorage.getItem("user");
    if (!storedUser) {
      navigate("/");
      return;
    }

    const user = JSON.parse(storedUser);
    const clientId = user.client_id;
    if (!clientId) return;

    const fetchRecommendations = async () => {
      try {
        const pantryRes = await fetch(`http://127.0.0.1:8000/recommendations/pantry/${clientId}?top_n=5`);
        const pantryData = await pantryRes.json();
        console.log("Pantry-based recommendations:", pantryData.content_based);

        const formatted = pantryData.content_based.map((recipe: any, index: number) => ({
          id: index + 1,
          category: "Recommended", // TODO get from recipe dataset
          name: recipe.name, // TODO replace below image from recipe dataset
          image: "https://imgs.search.brave.com/CX31bXPXmTWlpWh5q5_VpqdwO6ngivl3N7KgZSBtQOo/rs:fit:860:0:0:0/g:ce/aHR0cHM6Ly9pLnBp/bmltZy5jb20vb3Jp/Z2luYWxzL2MwL2Zm/L2Q0L2MwZmZkNGRj/ZDFjY2NjZGZhNjBm/NWExN2UzNzIyZDY0/LmpwZw", // TODO replace with image from recipe dataset
        }));

        setRecommendedItems(formatted);
      } catch (err) {
        console.error("Error fetching recommendations:", err);
      }
    };

    fetchRecommendations();
  }, []);

  // TODO : Replace with real data when backend is ready
  // const pantryRecommended: any[] = []; // if no pantry data, show placeholder
  const pantryRecommended = [
    {
      id: 1,
      name: "Creamy Garlic Shrimp",
      image: "https://www.melskitchencafe.com/wp-content/uploads/2023/02/creamy-garlic-shrimp-pasta11.jpg",
      rating: 4.0,
      time: "35m",
      status: "Available",
    },
    {
      id: 2,
      name: "Chicken Fried Rice",
      image: "https://www.averiecooks.com/wp-content/uploads/2025/03/chickenfriedrice-9.jpg",
      rating: 4.3,
      time: "15m",
      status: "Available",
    },
    {
      id: 5,
      name: "Shepherd’s Pie",
      image: "https://www.thewholesomedish.com/wp-content/uploads/2019/02/The-Best-Classic-Shepherds-Pie-550.jpg",
      rating: 4.0,
      time: "35m",
      status: "Missing 2 items",
    },
    {
      id: 6,
      name: "Scrambled Eggs",
      image: "https://recipeteacher.com/wp-content/uploads/2016/08/Restaurant-Style-Scrambled-Eggs-20-scaled.jpg",
      rating: 4.5,
      time: "10m",
      status: "Available",
    },
    {
      id: 7,
      name: "Shepherd’s Pie",
      image: "https://www.thewholesomedish.com/wp-content/uploads/2019/02/The-Best-Classic-Shepherds-Pie-550.jpg",
      rating: 4.0,
      time: "35m",
      status: "Missing 1 item",
    }
  ];

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

  // Example recommended list (swap with real data when ready)
  // const recommendedItems = useMemo(
  //   () => [items[1], items[3]].filter(Boolean),
  //   [items]
  // );

  // Move/resize the green tab indicator
  // useEffect(() => {
  //   const container = tabsRef.current;
  //   if (!container) return;
  //   const activeEl = container.querySelector(`.tab[data-tab="${activeTab}"]`) as HTMLElement | null;
  //   if (activeEl) {
  //     const { offsetLeft, offsetWidth } = activeEl;
  //     setIndicatorStyle({ left: `${offsetLeft}px`, width: `${offsetWidth}px` });
  //   }
  // }, [activeTab]);

  // Toggle favourite
  // If item is already favourited, remove it; otherwise, add it
  // const toggleFavorite = (id: number) => {
  //   setFavorites(prev => (prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]));
  // TEMPORARILY COMMENTED OUT to test notification feature

  // const toggleFavorite = (id: number) => {
  //   setFavorites(prev => {
  //     const isFav = prev.includes(id);

  //     if (isFav) {
  //       notify(NOTIFICATION_MESSAGES.DELETED, NOTIFICATION_TYPES.DELETED);
  //       return prev.filter(x => x !== id);
  //     } else {
  //       notify(NOTIFICATION_MESSAGES.ADDED, NOTIFICATION_TYPES.ADDED);
  //       return [...prev, id];
  //     }
  //   });
  // };

  // Decide which list to show based on the current page/tab
  // const displayedItems = useMemo(() => {
  //   switch (activeTab) {
  //     case DASHBOARD.DISCOVER:
  //       return items;
  //     case DASHBOARD.RECOMMEND:
  //       return recommendedItems;
  //     case DASHBOARD.SAVED:
  //       return items.filter(i => favorites.includes(i.id));
  //     default:
  //       return items;
  //   }
  // }, [activeTab, items, recommendedItems, favorites]);

  return (
    <div className="dashboard__container">
      <SearchBar /> {/* Search Bar Component */}
      <CategorySection /> {/* Category Section Component */}
      <DashboardSection title="Recommended Based on Your Pantry"
        // items={recommendedItems.length > 0 ? recommendedItems : pantryRecommended}
        items={pantryRecommended} // mock data for now
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
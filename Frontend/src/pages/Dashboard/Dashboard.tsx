import React, { useState, useRef, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { Heart } from "lucide-react";
import { DASHBOARD } from "../../config/consts";
import TopNavBar from "../../components/NavigationBar/TopNavBar/TopNavBar";
import BottomNavBar from "../../components/NavigationBar/BottomNavBar/BottomNavBar";

import Pancake from "../../assets/images/Pancake.png";
import ChocolateCookieShake from "../../assets/images/ChocolateCookieShake.png";
import PancakeTwo from "../../assets/images/PancakeTwo.png";
import DonutStack from "../../assets/images/DonutStack.png";

import "@/styles/variable.css";
import "./dashboard.css";

/**
 * Dashboard Page Component
 * TODO : Fetch and display dynamic data
 * TODO : Import static texts as constants
 * TODO : Extract Favorite button as separate component
 * @returns JSX.Element
 */
const Dashboard: React.FC = () => {
  const [activeTab, setActiveTab] = useState<"Discover" | "Recommend" | "Saved">("Discover");
  const [indicatorStyle, setIndicatorStyle] = useState<{ left: string; width: string }>({ left: "0px", width: "0px" });
  const [favorites, setFavorites] = useState<number[]>([]);

  const tabsRef = useRef<HTMLDivElement>(null);
  const tabs = DASHBOARD.TABS;

  const navigate = useNavigate();

  useEffect(() => {
    const user = localStorage.getItem("user");
    if (!user) navigate("/");
  }, []);


  // TODO : Replace with real data when backend is ready
  const items = [
    { id: 1, category: "Snack", name: "Pancake", image: Pancake },
    { id: 2, category: "Beverage", name: "Chocolate Cookie Shake", image: ChocolateCookieShake },
    { id: 3, category: "Meal", name: "Pancake 2", image: PancakeTwo },
    { id: 4, category: "Dessert", name: "Donut Stack", image: DonutStack },
  ];

  // Example recommended list (swap with real data when ready)
  const recommendedItems = useMemo(
    () => [items[1], items[3]].filter(Boolean),
    [items]
  );

  // Move/resize the green tab indicator
  useEffect(() => {
    const container = tabsRef.current;
    if (!container) return;
    const activeEl = container.querySelector(`.tab[data-tab="${activeTab}"]`) as HTMLElement | null;
    if (activeEl) {
      const { offsetLeft, offsetWidth } = activeEl;
      setIndicatorStyle({ left: `${offsetLeft}px`, width: `${offsetWidth}px` });
    }
  }, [activeTab]);

  // Toggle favourite
  // If item is already favourited, remove it; otherwise, add it
  const toggleFavorite = (id: number) => {
    setFavorites(prev => (prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]));
  };

  // Decide which list to show based on the current page/tab
  const displayedItems = useMemo(() => {
    switch (activeTab) {
      case DASHBOARD.DISCOVER:
        return items;
      case DASHBOARD.RECOMMEND:
        return recommendedItems;
      case DASHBOARD.SAVED:
        return items.filter(i => favorites.includes(i.id));
      default:
        return items;
    }
  }, [activeTab, items, recommendedItems, favorites]);

  return (
    <div className="dashboard__container">
      <TopNavBar />

      <div className="dashboard__tabs">
        <div className="dashboard__tab-header" ref={tabsRef}>
          {tabs.map(tab => (
            <p
              key={tab}
              data-tab={tab}
              className={`tab ${activeTab === tab ? "active" : ""}`}
              onClick={() => setActiveTab(tab)}
            >
              {tab}
            </p>
          ))}
          <span className="dashboard__indicator" style={indicatorStyle} />
        </div>

        <div className="dashboard__grid">
          {displayedItems.length > 0 ? (
            displayedItems.map(item => (
              <div className="dashboard__card" key={item.id}>
                <div className="dashboard__image-wrapper">
                  <img src={item.image} alt={item.name} className="dashboard__image" />
                  <button
                    className={`favorite__button ${favorites.includes(item.id) ? "favorited" : ""}`}
                    onClick={() => toggleFavorite(item.id)}
                    aria-label={favorites.includes(item.id) ? "Remove from favourites" : "Add to favourites"}
                  >
                    <Heart
                      size={18}
                      fill={favorites.includes(item.id) ? "var(--color-red)" : "transparent"}
                      color={favorites.includes(item.id) ? "var(--color-red)" : "var(--color-white)"}
                      strokeWidth={2}
                    />
                  </button>
                </div>

                <div className="dashboard__info">
                  <p className="dashboard__category">{item.category}</p>
                  <h4 className="dashboard__name">{item.name}</h4>
                  <p className="dashboard__details">Food • &gt; 60 mins</p>
                </div>
              </div>
            ))
          ) : (
            <p className="dashboard__placeholder">
              {activeTab === DASHBOARD.SAVED
                ? DASHBOARD.SAVED_PLACEHOLDER
                : activeTab === DASHBOARD.RECOMMEND
                  ? DASHBOARD.RECOMMEND_PLACEHOLDER
                  : DASHBOARD.DISCOVER_PLACEHOLDER}
            </p>
          )}
        </div>
      </div>

      <BottomNavBar />
    </div>
  );
};

export default Dashboard;
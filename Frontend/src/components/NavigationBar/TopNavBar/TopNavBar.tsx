import React, { useState } from "react";
import StockdLogo from "../../../assets/images/StockdLogo.svg";
import { SEARCH, TOP_NAV_BAR } from "../../../config/consts";

import "./topnavbar.css";

/**
 * Top Navigation Bar Component
 * TODO: Integrate search and category filter functionality
 * TODO: Accept props for dynamic behavior
 * @returns JSX.Element
 */
const TopNavBar: React.FC = () => {
    const [activeCategory, setActiveCategory] = useState("All");

    const categories = ["All", "Food", "Drink"];

    return (
        <div className="topnav__container">
            <div className="topnav__logo-search">
                <img src={StockdLogo} alt="Stockd Logo" className="topnav__logo" />
                <input type="text" placeholder={SEARCH} className="topnav__search" />
            </div>

            <p className="category__title">{TOP_NAV_BAR.CATEGORY}</p>

            <div className="category__filters">
                {categories.map((category) => (
                    <button
                        key={category}
                        className={`category__button ${activeCategory === category ? "active" : ""
                            }`}
                        onClick={() => setActiveCategory(category)}
                    >
                        {category}
                    </button>
                ))}
            </div>

            {/* Separator line */}
            <hr className="topnav__separator" />
        </div>
    );
};

export default TopNavBar;

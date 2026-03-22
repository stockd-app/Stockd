import React from "react";
import StockdLogo from "../../../assets/images/StockdLogo.svg";
import Profile from "../../Profile/Profile";
import ChangeMode from "../../ChangeMode/ChangeMode";

import "./topnavbar.css";

interface TopNavBarProps {
    theme: string;
    setTheme: React.Dispatch<React.SetStateAction<string>>;
}

/**
 * Top Navigation Bar Component
 * @returns JSX.Element
 */
const TopNavBar: React.FC<TopNavBarProps> = ({ theme, setTheme }) => {
    return (
        <div className="topnav__container">
            <div className="topnav__logo-search">
                <img src={StockdLogo} alt="Stockd Logo" className="topnav__logo" />
                <div className="topnav__profile">
                    <ChangeMode theme={theme} setTheme={setTheme} />
                    <Profile />
                </div>
            </div>
        </div>
    );
};

export default TopNavBar;

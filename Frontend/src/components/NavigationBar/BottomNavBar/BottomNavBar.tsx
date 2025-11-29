import React, { useState, useRef, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Home, Refrigerator, ScanLine, Bookmark, User } from "lucide-react";
import CameraModal from "../../CameraModal/CameraModal";
import { BOTTOM_NAV_ICON_SIZE } from "../../../config/consts";

import "./bottomnavbar.css";

/**
 * Bottom Navigation Bar Component
 * TODO : Add navigation functionality
 * TODO : Ensure navigation state persists across pages
 * @returns 
 */
const BottomNavBar: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const [showCamera, setShowCamera] = useState(false);
  const [activeItem, setActiveItem] = useState("home");
  const containerRef = useRef<HTMLDivElement>(null);
  const [indicatorStyle, setIndicatorStyle] = useState({ left: "0px", width: "0px" });
  const [isMoving, setIsMoving] = useState(false);

  // Sync activeItem with URL (persistent underline)
  useEffect(() => {
    if (location.pathname.startsWith("/dashboard")) setActiveItem("home");
    else if (location.pathname.startsWith("/pantry")) setActiveItem("pantry");
    else if (location.pathname.startsWith("/saved")) setActiveItem("saved");
    else if (location.pathname.startsWith("/profile")) setActiveItem("profile");
  }, [location.pathname]);

  // Move & resize the indicator under the active item
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const items = container.querySelectorAll(".bottomnav__item:not(.scan__button)");
    // Map activeItem to corresponding index. E.g., "home" -> 0, "update" -> 1, etc.
    const activeIndex = ["home", "pantry", "saved", "profile"].indexOf(activeItem);
    // Get the active element
    const activeEl = items[activeIndex] as HTMLElement;

    if (!activeEl) return;

    if (activeEl) {
      const { offsetLeft, offsetWidth } = activeEl;
      setIsMoving(true);
      // Center the indicator under the active item
      setIndicatorStyle({
        left: `${offsetLeft + offsetWidth * 0.35}px`,
        width: `${offsetWidth * 0.3}px`,
      });

      // Remove the "moving" class after animation
      const timeout = setTimeout(() => setIsMoving(false), 350);
      return () => clearTimeout(timeout);
    }
  }, [activeItem]);

  return (
    <div className="bottomnav__container" ref={containerRef}>
      <div
        className={`bottomnav__item ${activeItem === "home" ? "active" : ""}`}
        onClick={() => { setActiveItem("home"); navigate("/dashboard") }}
      >
        <Home size={BOTTOM_NAV_ICON_SIZE.NORMAL} />
        <p>Home</p>
      </div>

      <div
        className={`bottomnav__item ${activeItem === "pantry" ? "active" : ""}`}
        onClick={() => { setActiveItem("pantry"); navigate("/dashboard") }}
      >
        <Refrigerator size={BOTTOM_NAV_ICON_SIZE.NORMAL} />
        <p>Pantry</p>
      </div>

      <div className="bottomnav__item scan__button" onClick={() => setShowCamera(true)}>
        <ScanLine size={BOTTOM_NAV_ICON_SIZE.LARGE} />
      </div>

      <div
        className={`bottomnav__item ${activeItem === "saved" ? "active" : ""}`}
        onClick={() => { setActiveItem("saved"); navigate("/dashboard") }}
      >
        <Bookmark size={BOTTOM_NAV_ICON_SIZE.NORMAL} />
        <p>Saved</p>
      </div>

      <div
        className={`bottomnav__item ${activeItem === "profile" ? "active" : ""}`}
        onClick={() => { setActiveItem("profile"); navigate("/profile") }}
      >
        <User size={BOTTOM_NAV_ICON_SIZE.NORMAL} />
        <p>Profile</p>
      </div>

      {/* Animated underline indicator */}
      <div
        className={`bottomnav__indicator ${isMoving ? "moving" : ""}`}
        style={indicatorStyle}
      ></div>
      {showCamera && <CameraModal onClose={() => setShowCamera(false)} />}
    </div>
  );
};

export default BottomNavBar;

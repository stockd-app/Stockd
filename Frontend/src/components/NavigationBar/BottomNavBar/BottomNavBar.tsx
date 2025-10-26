import React, { useState, useRef, useEffect } from "react";
import { Home, RefreshCw, ScanLine, Bell, User } from "lucide-react";
import { BOTTOM_NAV_ICON_SIZE } from "../../../config/consts";

import "./bottomnavbar.css";

/**
 * Bottom Navigation Bar Component
 * TODO : Add navigation functionality
 * TODO : Ensure navigation state persists across pages
 * @returns 
 */
const BottomNavBar: React.FC = () => {
  const [activeItem, setActiveItem] = useState("home");
  const containerRef = useRef<HTMLDivElement>(null);
  const [indicatorStyle, setIndicatorStyle] = useState({ left: "0px", width: "0px" });
  const [isMoving, setIsMoving] = useState(false);

  // Move & resize the indicator under the active item
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const items = container.querySelectorAll(".bottomnav__item:not(.scan__button)");
    // Map activeItem to corresponding index. E.g., "home" -> 0, "update" -> 1, etc.
    const activeIndex = ["home", "update", "notification", "profile"].indexOf(activeItem);
    // Get the active element
    const activeEl = items[activeIndex] as HTMLElement;

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
        onClick={() => setActiveItem("home")}
      >
        <Home size={BOTTOM_NAV_ICON_SIZE.NORMAL} />
        <p>Home</p>
      </div>

      <div
        className={`bottomnav__item ${activeItem === "update" ? "active" : ""}`}
        onClick={() => setActiveItem("update")}
      >
        <RefreshCw size={BOTTOM_NAV_ICON_SIZE.NORMAL} />
        <p>Update</p>
      </div>

      <div className="bottomnav__item scan__button">
        <ScanLine size={BOTTOM_NAV_ICON_SIZE.LARGE} />
      </div>

      <div
        className={`bottomnav__item ${activeItem === "notification" ? "active" : ""}`}
        onClick={() => setActiveItem("notification")}
      >
        <Bell size={BOTTOM_NAV_ICON_SIZE.NORMAL} />
        <p>Notification</p>
      </div>

      <div
        className={`bottomnav__item ${activeItem === "profile" ? "active" : ""}`}
        onClick={() => setActiveItem("profile")}
      >
        <User size={BOTTOM_NAV_ICON_SIZE.NORMAL} />
        <p>Profile</p>
      </div>

      {/* Animated underline indicator */}
      <div
        className={`bottomnav__indicator ${isMoving ? "moving" : ""}`}
        style={indicatorStyle}
      ></div>
    </div>
  );
};

export default BottomNavBar;

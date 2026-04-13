import React, { useState, useRef, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import {
  Home,
  Refrigerator,
  List,
  Camera,
  PencilLine,
  ImagePlus,
  SquarePlus,
  Heart,
} from "lucide-react";
import { BOTTOM_NAV_ICON_SIZE } from "../../../config/consts";
import CameraModal from "../../CameraModal/CameraModal";
import Button from "../../Button/Button";

import "./bottomnavbar.css";
import "@/styles/variable.css";

interface BottomNavBarProps {
  onManualAdd?: () => void;
}

/**
 * Bottom Navigation Bar Component
 * TODO : Add navigation functionality
 * TODO : Ensure navigation state persists across pages
 * @returns
 */
const BottomNavBar: React.FC<BottomNavBarProps> = ({ onManualAdd }) => {
  const navigate = useNavigate();
  const location = useLocation();

  const [showCamera, setShowCamera] = useState(false);
  const [activeItem, setActiveItem] = useState("home");
  const containerRef = useRef<HTMLDivElement>(null);
  const [indicatorStyle, setIndicatorStyle] = useState({ left: "0px", width: "0px" });
  const [isMoving, setIsMoving] = useState(false);
  const [showCreationOptions, setShowCreationOptions] = useState(false);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [hasNewGroceryItem, setHasNewGroceryItem] = useState(false);

  const handleScanClick = () => {
    setShowCreationOptions(true); // Don't open the camera directly,first open the dialog for selecting the upload method.
  };

  const handleTakePhoto = () => {
    setShowCreationOptions(false);
    setShowCamera(true); // Open the camera modal
  };

  const handleManualAdd = () => {
    setShowCreationOptions(false);
    onManualAdd?.();
  };

  const handleSelectPhoto = () => {
    setShowCreationOptions(false);
    fileInputRef.current?.click(); // TODO: Implement the photo select from gallery, preview page and route in App.tsx
  };

  // Sync activeItem with URL (persistent underline)
  useEffect(() => {
    const path = location.pathname;

    if (path === "/dashboard") setActiveItem("home");
    else if (path === "/pantry") setActiveItem("pantry");
    else if (path === "/saved") setActiveItem("saved");
    else if (path === "/cart") {
      setActiveItem("cart");
      setHasNewGroceryItem(false);
      localStorage.setItem("groceryBadge", "false");
    }

  }, [location.pathname]);

  // Move & resize the indicator under the active item
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const items = container.querySelectorAll(".bottomnav__item:not(.scan__button)");
    // Map activeItem to corresponding index. E.g., "home" -> 0, "pantry" -> 1, etc.
    const activeIndex = ["home", "pantry", "saved", "cart"].indexOf(activeItem);
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

  useEffect(() => {
    const handleUpdate = () => {
      setHasNewGroceryItem(true);
    };

    window.addEventListener("grocery-updated", handleUpdate);

    return () => {
      window.removeEventListener("grocery-updated", handleUpdate);
    };
  }, []);

  useEffect(() => {
    const handleUpdate = () => setHasNewGroceryItem(true);
    const handleClear = () => setHasNewGroceryItem(false);

    window.addEventListener("grocery-updated", handleUpdate);
    window.addEventListener("grocery-cleared", handleClear);

    return () => {
      window.removeEventListener("grocery-updated", handleUpdate);
      window.removeEventListener("grocery-cleared", handleClear);
    };
  }, []);

  const handleFileSelected = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files ?? []);
    if (files.length === 0) return;

    const images = files.map((file) => ({
      file,
      url: URL.createObjectURL(file),
      id: crypto.randomUUID(),
    }));

    // allow selecting the same files again later
    event.target.value = "";

    navigate("/receipt_preview", {
      state: { images },
    });
  };

  return (
    <div className="bottomnav__container" ref={containerRef}>
      <input
        type="file"
        accept="image/*"
        multiple
        ref={fileInputRef}
        style={{ display: "none" }}
        onChange={handleFileSelected}
      />
      <div
        className={`bottomnav__item ${activeItem === "home" ? "active" : ""}`}
        onClick={() => { setActiveItem("home"); navigate("/dashboard") }}
      >
        <Home size={BOTTOM_NAV_ICON_SIZE.NORMAL} />
        <p>Home</p>
      </div>

      <div
        className={`bottomnav__item ${activeItem === "pantry" ? "active" : ""}`}
        onClick={() => { setActiveItem("pantry"); navigate("/pantry") }}
      >
        <Refrigerator size={BOTTOM_NAV_ICON_SIZE.NORMAL} />
        <p>Pantry</p>
      </div>

      <div className="bottomnav__item scan__button" onClick={handleScanClick}>
        <SquarePlus size={BOTTOM_NAV_ICON_SIZE.LARGE} />
      </div>

      <div
        className={`bottomnav__item ${activeItem === "saved" ? "active" : ""}`}
        onClick={() => { setActiveItem("saved"); navigate("/saved") }}
      >
        <Heart size={BOTTOM_NAV_ICON_SIZE.NORMAL} />
        <p>Liked</p>
      </div>

      <div
        className={`bottomnav__item ${activeItem === "cart" ? "active" : ""}`}
        onClick={() => { setActiveItem("cart"); navigate("/cart") }}
      >
        <div className="icon__wrapper">
          <List size={BOTTOM_NAV_ICON_SIZE.NORMAL} />
          {hasNewGroceryItem && <span className="notification__dot"></span>}
        </div>

        <p>Grocery</p>
      </div>

      {/* Animated underline indicator */}
      <div
        className={`bottomnav__indicator ${isMoving ? "moving" : ""}`}
        style={indicatorStyle}
      ></div>
      {showCreationOptions && (
        <div className="creation__modal__container" onClick={() => setShowCreationOptions(false)}>
          <div className="creation__modal">
            <div className="creation__modal__header">
              <h3>Choose Creation Method</h3>
              <Button variant="close" onClick={() => setShowCreationOptions(false)} aria-label="Close creation options" />
            </div>

            <button className="creation__button large" onClick={handleTakePhoto}>
              <Camera size={BOTTOM_NAV_ICON_SIZE.NORMAL} color={"var(--color-primary)"} />
              Take Receipt Photo
            </button>
            <div className="creation__row">
              <button className="creation__button" onClick={handleManualAdd}>
                <PencilLine size={BOTTOM_NAV_ICON_SIZE.NORMAL} color={"var(--color-primary)"} />
                Manual Add
              </button>
              <button className="creation__button" onClick={handleSelectPhoto}>
                <ImagePlus size={BOTTOM_NAV_ICON_SIZE.NORMAL} color={"var(--color-primary)"} />
                Select Receipt Photo
              </button>
            </div>
          </div>
        </div>
      )}
      {showCamera && (
        <CameraModal
          onClose={() => setShowCamera(false)}
          onPhotoCaptured={(file, url) => {
            navigate("/receipt_preview", {
              state: {
                images: [
                  { id: crypto.randomUUID(), file, url }
                ]
              }
            });
          }}
        />
      )}
    </div>
  );
};

export default BottomNavBar;

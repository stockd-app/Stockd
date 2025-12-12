import React, { useState, useRef, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Home, Refrigerator, ScanLine, Bookmark, User, Camera, PencilLine, ImagePlus, SquarePlus } from "lucide-react";
import CameraModal from "../../CameraModal/CameraModal";
import { BOTTOM_NAV_ICON_SIZE, ICON_COLOR } from "../../../config/consts";

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
  const [showCreationOptions, setShowCreationOptions] = useState(false);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const handleScanClick = () => {
    setShowCreationOptions(true); // Don't open the camera directly,first open the dialog for selecting the upload method.
  };

  const handleTakePhoto = () => {
    setShowCreationOptions(false);
    setShowCamera(true); // Open the camera modal
  };

  const handleManualAdd = () => {
    setShowCreationOptions(false);
    navigate("/additem"); //TODO：Implement the manual add page and route in App.tsx
  };

  const handleSelectPhoto = () => {
    setShowCreationOptions(false);
    fileInputRef.current?.click(); // TODO: Implement the photo select from gallery, preview page and route in App.tsx
  };

  // Handle successful receipt upload
  const handleUploadSuccess = (data: any) => {
    console.log("Receipt uploaded successfully:", data);
    // Navigate to pantry page to show the new items
    setActiveItem("pantry");
    navigate("/pantry");
  };

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

  const handleFileSelected = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    const imageURL = URL.createObjectURL(file);
    navigate("/preview_receipt", {
      state: { image: imageURL, file }
    });
  };

  return (
    <div className="bottomnav__container" ref={containerRef}>
      <input
        type="file"
        accept="image/*"
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

      {/* <div className="bottomnav__item scan__button" onClick={() => setShowCamera(true)}>
        <ScanLine size={BOTTOM_NAV_ICON_SIZE.LARGE} />
      </div> */}
      <div className="bottomnav__item scan__button" onClick={handleScanClick}>
        <SquarePlus size={BOTTOM_NAV_ICON_SIZE.LARGE} />
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
      {showCreationOptions && (
        <div className="creation__modal__container" onClick={() => setShowCreationOptions(false)}>
          <div className="creation__modal">
            <div className="creation__modal__header">
              <h3>Choose Creation Method</h3>
              <button className="close__btn" onClick={() => setShowCreationOptions(false)}>✕</button>
            </div>

            <button className="creation__button large" onClick={handleTakePhoto}>
              <Camera size={BOTTOM_NAV_ICON_SIZE.NORMAL} color={ICON_COLOR.ICON} />
              Take Photo
            </button>
            <div className="creation__row">
              <button className="creation__button" onClick={handleManualAdd}>
                <PencilLine size={BOTTOM_NAV_ICON_SIZE.NORMAL} color={ICON_COLOR.ICON} />
                Manual Add
              </button>
              <button className="creation__button" onClick={handleSelectPhoto}>
                <ImagePlus size={BOTTOM_NAV_ICON_SIZE.NORMAL} color={ICON_COLOR.ICON} />
                Select Photo
              </button>
            </div>
          </div>
        </div>
      )}
      {showCamera && (
        <CameraModal
          onClose={() => setShowCamera(false)}
          onUploadSuccess={handleUploadSuccess}
        />
      )}
    </div>
  );
};

export default BottomNavBar;

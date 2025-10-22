import React from "react";
import StockdLogo from "../../assets/images/StockdLogo.svg";
import { CustomGoogleButton } from "../../components/CustomGoogleButton";
import "./landingpage.css";

/**
 * Landing Page Component
 * @returns JSX.Element
 */
const LandingPage: React.FC = () => {


  return (
    <div className="landingPage__container">
      <img src={StockdLogo} alt="Stockd Logo" width={100} />
      <div className="landingPage__text-container">
        <p className="landingPage__header">Stockd</p>
        <p className="landingPage__text">Let's join our community to cook better food!</p>
      </div>
      <CustomGoogleButton />
    </div>
  );
};

export default LandingPage;

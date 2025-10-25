import React from "react";
import StockdLogo from "../../assets/images/StockdLogo.svg";
import { CustomGoogleButton } from "../../components/GoogleButton/CustomGoogleButton";
import { LANDING_PAGE } from "../../config/consts";

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
        <p className="landingPage__header">{LANDING_PAGE.STOCKD}</p>
        <p className="landingPage__text">{LANDING_PAGE.WELCOME_TEXT}</p>
      </div>
      <CustomGoogleButton />
    </div>
  );
};

export default LandingPage;

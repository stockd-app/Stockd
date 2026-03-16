import React from "react";
import StockdLogo from "../../assets/images/StockdLogo.svg";
import { CustomGoogleButton } from "../../components/GoogleButton/CustomGoogleButton";
import { LANDING_PAGE } from "../../config/consts";
import Herbs from "../../assets/images/login_page/herbs.png";
import Ramen from "../../assets/images/login_page/ramen.png";
import Flour from "../../assets/images/login_page/flour.png";

import "./landingpage.css";

/**
 * Landing Page Component
 * @returns JSX.Element
 */
const LandingPage: React.FC = () => {


  return (
    <div className="landingPage__container">
      <img className="bg-top-left" src={Herbs} />
      <img className="bg-top-right" src={Ramen} />
      <img className="bg-bottom-right" src={Flour} />

      <div className="landingPage__content">
        <img src={StockdLogo} alt="Stockd Logo" width={100} />

        <div className="landingPage__text-container">
          <p className="landingPage__header">{LANDING_PAGE.STOCKD}</p>
          <p className="landingPage__text">{LANDING_PAGE.WELCOME_TEXT}</p>
        </div>

        <CustomGoogleButton />
      </div>
    </div>
  );
};

export default LandingPage;

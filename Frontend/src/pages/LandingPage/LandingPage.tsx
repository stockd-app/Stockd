import React from "react";
import { GoogleLogin } from "@react-oauth/google";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { API_ROUTES } from "../../config/consts";
import StockdLogo from "../../assets/images/StockdLogo.svg";
import "./landingpage.css";

/**
 * 
 * @returns 
 */
const LandingPage: React.FC = () => {
  const navigate = useNavigate();

  const handleLoginSuccess = async (credentialResponse: any) => {
    try {
      const res = await axios.post(API_ROUTES.VERIFY_GOOGLE, {
        token: credentialResponse.credential,
      });

      // TODO: Handle user data and store elsewhere (e.g., context or state management), instead of localStorage
      localStorage.setItem("user", JSON.stringify(res.data.user));

      navigate("/dashboard");
    } catch (err) {
      console.error("Login failed:", err);
    }
  };

  return (
    <div className="landingPage__container">
      <img src={StockdLogo} alt="Stockd Logo" width={100} />
      <div className="landingPage__text-container">
        <p className="landingPage__header">Stockd</p>
        <p className="landingPage__text">Let's join our community to cook better food!</p>
      </div>
      <GoogleLogin
        text="continue_with"
        size="large"
        onSuccess={handleLoginSuccess}
        onError={() => console.log("Login Failed")}
      />
    </div>
  );
};

export default LandingPage;

import React from "react";
import { GoogleLogin } from "@react-oauth/google";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { API_ROUTES } from "../../config/consts";
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
      <h1>🍴 Welcome to Stockd</h1>
      <p>Waste less. Cook smarter.</p>
      <GoogleLogin
        onSuccess={handleLoginSuccess}
        onError={() => console.log("Login Failed")}
      />
    </div>
  );
};

export default LandingPage;

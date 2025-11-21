import React from "react";
import { useNavigate } from "react-router-dom";
import GoogleErrorScreen from "./GoogleErrorScreen";
import error400 from "../../assets/images/error_handling/food_splash_art.png";

const Error400: React.FC = () => {
    const navigate = useNavigate();

    return (
        <GoogleErrorScreen
            code="400"
            title="Request Error"
            message="We couldn’t complete your Google sign-in because your request was incomplete or invalid."
            subtext="Please check your Google account or try again."
            image={error400}
            buttonText="Retry Sign In"
            onRetry={() => navigate("/")}
        />
    );
};

export default Error400;

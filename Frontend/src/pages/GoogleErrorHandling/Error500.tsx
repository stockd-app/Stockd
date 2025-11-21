import React from "react";
import { useNavigate } from "react-router-dom";
import GoogleErrorScreen from "./GoogleErrorScreen";
import error500 from "../../assets/images/error_handling/falling_splash_art.png";

const Error500: React.FC = () => {
    const navigate = useNavigate();

    return (
        <GoogleErrorScreen
            code="500"
            title="Internal Error"
            message="Something went wrong on our side while processing your Google sign-in."
            subtext="Please try again later."
            image={error500}
            buttonText="Try again later"
            onRetry={() => navigate("/")}
        />
    );
};

export default Error500;

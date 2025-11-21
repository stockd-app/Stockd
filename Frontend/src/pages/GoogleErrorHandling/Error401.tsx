import React from "react";
import { useNavigate } from "react-router-dom";
import GoogleErrorScreen from "./GoogleErrorScreen";
import error401 from "../../assets/images/error_handling/food_splash_art.png";

const Error401: React.FC = () => {
    const navigate = useNavigate();

    return (
        <GoogleErrorScreen
            code="401"
            title="Authentication Failed"
            message="We couldn’t verify your Google identity. Your sign-in session may have expired."
            image={error401}
            buttonText="Retry Sign In"
            onRetry={() => navigate("/")}
        />
    );
};

export default Error401;

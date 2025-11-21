import React from "react";
import { useNavigate } from "react-router-dom";
import GoogleErrorScreen from "./GoogleErrorScreen";
import error503 from "../../assets/images/error_handling/falling_splash_art.png";

const Error503: React.FC = () => {
    const navigate = useNavigate();

    return (
        <GoogleErrorScreen
            code="503"
            title="Unable to Process Request"
            message="We’re unable to handle your Google sign-in request at the moment."
            subtext="This may be caused by a timeout or temporary outage."
            image={error503}
            buttonText="Try again later"
            onRetry={() => navigate("/")}
        />
    );
};

export default Error503;

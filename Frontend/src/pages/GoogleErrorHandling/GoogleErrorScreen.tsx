import React from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ERROR_CONFIG, UNKNOWN_ERROR } from "../../config/errorConfig";

import "./googleerror.css";

const GoogleErrorScreen: React.FC = () => {
    const { code } = useParams();
    const navigate = useNavigate();

    const error = ERROR_CONFIG[code || "500"];

    if (!error) {
        return <div>{UNKNOWN_ERROR}</div>;
    }

    return (
        <div className="error__container">

            <h1 className="error__code">{error.code}</h1>

            <h2 className="error__title">{error.title}</h2>

            <img
                src={error.image}
                alt={`${error.code} Error`}
                className="error__image"
            />

            <p className="error__message">{error.message}</p>

            {error.subtext && <p className="error__subtext">{error.subtext}</p>}

            <button
                className="error__retry-btn"
                onClick={() => navigate("/")}
            >
                {error.buttonText}
            </button>
        </div>
    );
};

export default GoogleErrorScreen;

import React from "react";
import "./googleerror.css";

interface GoogleErrorScreenProps {
    code: string;
    title: string;
    message: string;
    subtext?: string;
    image: string;
    buttonText: string;
    onRetry: () => void;
}

const GoogleErrorScreen: React.FC<GoogleErrorScreenProps> = ({
    code,
    title,
    message,
    subtext,
    image,
    buttonText,
    onRetry,
}) => {
    return (
        <div className="error__container">

            <h1 className="error__code">{code}</h1>

            <h2 className="error__title">{title}</h2>

            <img src={image} alt={`${code} Error`} className="error__image" />

            <p className="error__message">{message}</p>

            {subtext && <p className="error__subtext">{subtext}</p>}

            <button className="error__retry-btn" onClick={onRetry}>
                {buttonText}
            </button>
        </div>
    );
};

export default GoogleErrorScreen;

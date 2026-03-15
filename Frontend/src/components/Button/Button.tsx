import React from "react";
import { X, ArrowLeft } from "lucide-react";

import "./button.css";

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
    variant?: "primary" | "secondary" | "danger" | "close" | "back";
}

/**
 * A versatile button component that supports multiple variants and states.
 * @param param0 
 * @returns 
 */
const Button: React.FC<ButtonProps> = ({
    className = "",
    variant = "primary",
    children,
    disabled = false,
    ...rest
}) => {
    const renderContent = () => {
        if (variant === "close") return <X size={20} />;
        if (variant === "back") return <ArrowLeft size={22} />;
        return children;
    };

    return (
        <button
            className={`custom-button ${variant} ${disabled ? "disabled" : ""} ${className}`}
            disabled={disabled}
            {...rest}
        >
            {renderContent()}
        </button>
    );
};

export default Button;
import React from "react";
import image_placeholder from "../../assets/images/error_handling/image_placeholder.png"

import "./pantryitemcard.css";

interface PantryItemCardProps {
    name: string;
    qty?: string;
    image: string;
    onClick?: () => void;
}

const PantryItemCard: React.FC<PantryItemCardProps> = ({ name, qty, image, onClick }) => {
    const displayImage = image && image.trim() !== "" ? image : image_placeholder;
    return (
        <div className="pantryitemcard" onClick={onClick}>
            <div className="pantryitemcard__container">
                <img
                    src={displayImage}
                    alt={name}
                    className="pantryitemcard__image"
                    onError={(e) => {
                        // If image fails to load, use fallback
                        const target = e.target as HTMLImageElement;
                        if (target.src !== image_placeholder) {
                            target.src = image_placeholder;
                        }
                    }}
                />
            </div>
            <div className="pantryitemcard__info">
                <span className="pantryitemcard__name">{name}</span>
                <span className="pantryitemcard__qty">{qty}</span>
            </div>
        </div>
    );
};

export default PantryItemCard;

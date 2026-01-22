import React from "react";
import { Clock, Star } from "lucide-react";

import "./recipeitemcard.css";

interface RecipeItemCardProps {
    name: string;
    image: string;
    rating?: number;
    time?: string;
    status?: string;
    onClick?: () => void;
}

const RecipeItemCard: React.FC<RecipeItemCardProps> = ({ name, image, rating, time, status, onClick, }) => {
    const statusClass =
        status && status.toLowerCase().includes("missing")
            ? "status status--missing"
            : "status status--available";
    return (
        <div className={`recipeitemcard`} onClick={onClick}>
            <div className="recipeitemcard__image_container">
                <img src={image} alt={name} className="recipeitemcard__image" />
            </div>

            <div className="recipeitemcard__info">
                <span className="recipeitemcard__name">{name}</span>

                <div className="recipeitemcard__meta">
                    {time && (
                        <span className="recipeitemcard__meta_item">
                            <Clock size={16} /> {time}
                        </span>
                    )}
                    {rating !== undefined && rating !== null && (
                        <span className="recipeitemcard__meta_item">
                            <Star size={16} color="#FFD700" fill="#FFD700" /> {rating}
                        </span>
                    )}
                </div>

                {status && (
                    <span className={statusClass}>{status}</span>
                )}
            </div>
        </div>
    );
};

export default RecipeItemCard;

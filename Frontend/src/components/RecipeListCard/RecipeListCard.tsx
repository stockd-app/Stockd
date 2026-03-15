import React from "react";
import { Clock, Star } from "lucide-react";

import "./recipelistcard.css";

interface RecipeListCardProps {
    name: string;
    image: string;
    rating?: number;
    time?: string;
    allergens?: string[];
    onClick?: () => void;
}

const RecipeListCard: React.FC<RecipeListCardProps> = ({
    name,
    image,
    rating,
    time,
    allergens,
    onClick
}) => {
    return (
        <div className="recipelistcard" onClick={onClick}>
            <div className="recipelistcard__image">
                <img src={image} alt={name} />
            </div>

            <div className="recipelistcard__info">
                <div className="recipelistcard__name">{name}</div>

                <div className="recipelistcard__meta">
                    {time && (
                        <span className="meta">
                            <Clock size={16} /> {time}
                        </span>
                    )}
                    {rating !== undefined && (
                        <span className="meta rating">
                            {Array.from({ length: 5 }, (_, index) => (
                                <Star
                                    key={index}
                                    size={16}
                                    color={index < Math.round(rating) ? "#FFD700" : "#CCCCCC"}
                                    fill={index < Math.round(rating) ? "#FFD700" : "none"}
                                />
                            ))}
                            <span className="rating-number">{rating}</span>
                        </span>
                    )}
                </div>
                {allergens && allergens.length > 0 && (
                    <div className="recipelistcard__allergenSection">
                        <span className="recipelistcard__allergenLabel">Contains:</span>
                        <div className="recipelistcard__allergens">
                            {allergens.map((a) => (
                                <span key={a} className="recipelistcard__allergen">
                                    {a}
                                </span>
                            ))}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default RecipeListCard;
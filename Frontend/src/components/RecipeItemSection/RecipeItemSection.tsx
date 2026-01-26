import React from "react";
import RecipeItemCard from "../RecipeItemCard/RecipeItemCard";
import EmptyPantry from "../../assets/images/EmptyPantry.jpg";

import "./recipeitemsection.css";

interface RecipeItemSectionProps {
    title: string;
    seeMore?: boolean;
    onSeeMore?: () => void;
    items: {
        id: number;
        name: string;
        image: string;
        rating?: number;
        time?: string;
        status?: string;
        allergens?: string[];
    }[];
    onItemClick?: (id: number) => void;
    emptyTitle?: string;
    emptySubtitle?: string;
    emptyImage?: string;
}

/**
 * Renders a Recipe Item Section with a title, optional "See more" link, and a list of RecipeItemCards
 * @param param0 
 * @returns 
 */
const RecipeItemSection: React.FC<RecipeItemSectionProps> = ({ title, seeMore = true, onSeeMore, items, onItemClick, emptyTitle, emptySubtitle, emptyImage }) => {
    return (
        <div className="recipeItemSection__container">
            <div className="recipeItemSection__header">
                <h3> {title} </h3>
                {seeMore && onSeeMore && (
                    <span
                        className="recipeItemSection__seeMore"
                        onClick={onSeeMore}
                    >
                        See more
                    </span>
                )}
            </div>

            {items.length === 0 ? (
                <div className="recipeItemSection__empty">
                    <img
                        src={EmptyPantry}
                        alt="Empty Pantry"
                        className="recipeItemSection__empty_image"
                    />

                    <div className="recipeItemSection__empty_overlay">
                        <p className="recipeItemSection__empty_text">{emptyTitle ?? "Let’s stock your pantry!"}</p>
                        <p className="recipeItemSection__empty_subtext">
                            {emptySubtitle ?? "Add ingredients by uploading a receipt or manual addition."}
                        </p>
                    </div>
                </div>
            ) : (
                <div className="recipeItemSection__items_scroll">
                    {items.map((item, index) => (
                        <RecipeItemCard
                            key={index}
                            name={item.name}
                            image={item.image}
                            rating={item.rating}
                            time={item.time}
                            status={item.status}
                            allergens={item.allergens}
                            onClick={() => onItemClick?.(item.id)}
                        />
                    ))}
                </div>
            )}
        </div>
    );
};


export default RecipeItemSection;

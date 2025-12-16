import React from "react";
import RecipeItemCard from "../RecipeItemCard/RecipeItemCard";
import EmptyFridge from "../../assets/images/Emptyfridge.png";

import "./recipeitemsection.css";

interface RecipeItemSectionProps {
    title: string;
    seeMore?: boolean;
    items: {
        name: string;
        image: string;
        rating?: number;
        time?: string;
        status?: string;
    }[];
}

const RecipeItemSection: React.FC<RecipeItemSectionProps> = ({ title, seeMore = true, items }) => {
    return (
        <div className="recipeItemSection__container">
            <div className="recipeItemSection__header">
                <h3> {title} </h3>
                {seeMore && <span className="recipeItemSection__seeMore">See more</span>}
            </div>

            {items.length === 0 ? (
                <div className="recipeItemSection__empty">
                    <img
                        src={EmptyFridge}
                        alt="Empty Pantry"
                        className="recipeItemSection__empty_image"
                    />

                    <div className="recipeItemSection__empty_overlay">
                        <p className="recipeItemSection__empty_text">Let’s stock your pantry!</p>
                        <p className="recipeItemSection__empty_subtext">
                            Add ingredients by uploading a receipt or other methods.
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
                        />
                    ))}
                </div>
            )}
        </div>
    );
};


export default RecipeItemSection;

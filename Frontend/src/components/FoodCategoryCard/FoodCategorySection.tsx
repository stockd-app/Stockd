import React from "react";
import Breakfast from "../../assets/images/food_category/breakfast.png";
import Lunch from "../../assets/images/food_category/lunch.png";
import Dinner from "../../assets/images/food_category/dinner.png";
import Dessert from "../../assets/images/food_category/dessert.png";

import "./foodcategorysection.css";


interface FoodCategoryItem {
    name: string;
    image: string;
}

const foodCategories: FoodCategoryItem[] = [
    { name: "Breakfast", image: Breakfast },
    { name: "Lunch", image: Lunch },
    { name: "Dinner", image: Dinner },
    { name: "Dessert", image: Dessert },
];

const FoodCategorySection: React.FC = () => {
    return (
        <div className="foodCategorySection__container">
            {foodCategories.map((category, index) => (
                <div className="foodCategory__item" key={index}>
                    <div className="foodCategory__icon">
                        <img src={category.image} alt={category.name} />
                    </div>
                    <p className="foodCategory__name">{category.name}</p>
                </div>
            ))}
        </div>
    );
};

export default FoodCategorySection;

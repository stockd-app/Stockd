import React from "react";
import Breakfast from "../../assets/images/food_category/breakfast.png";
import Lunch from "../../assets/images/food_category/lunch.png";
import Dinner from "../../assets/images/food_category/dinner.png";
import Dessert from "../../assets/images/food_category/dessert.png";

import "./foodcategorysection.css";
import { useNavigate } from "react-router-dom";

interface FoodCategorySectionProps {
    userId: number | null;
}

interface FoodCategoryItem {
    name: string;
    image: string;
    keyword: string;
}

const foodCategories: FoodCategoryItem[] = [
    { name: "Breakfast", image: Breakfast, keyword: "breakfast" },
    { name: "Lunch", image: Lunch, keyword: "lunch" },
    { name: "Dinner", image: Dinner, keyword: "weeknight" },
    { name: "Dessert", image: Dessert, keyword: "dessert" },
];

const FoodCategorySection: React.FC<FoodCategorySectionProps> = ({ userId }) => {
    const navigate = useNavigate();

    const handleCategoryClick = async (category: string) => {
        if (!userId) {
            console.error("User ID is missing");
            return;
        }

        navigate(`/recommended/${category}`);

    }

    return (
        <div className="foodCategorySection__container">
            {foodCategories.map((category, index) => (
                <div className="foodCategory__item" key={index}
                    onClick={() => handleCategoryClick(category.keyword)}>
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

import React from "react";
import Breakfast from "../../assets/images/breakfast.png";
import Lunch from "../../assets/images/lunch.png";
import Dinner from "../../assets/images/dinner.png";
import Dessert from "../../assets/images/dessert.png";
import "./categorysection.css";


interface CategoryItem {
    name: string;
    image: string;
}

const categories: CategoryItem[] = [
    { name: "Breakfast", image: Breakfast },
    { name: "Lunch", image: Lunch },
    { name: "Dinner", image: Dinner },
    { name: "Dessert", image: Dessert },
];

const CategorySection: React.FC = () => {
    return (
        <div className="category__section">
            {categories.map((category, index) => (
                <div className="category__item" key={index}>
                    <div className="category__icon">
                        <img src={category.image} alt={category.name} />
                    </div>
                    <p className="category__name">{category.name}</p>
                </div>
            ))}
        </div>
    );
};

export default CategorySection;

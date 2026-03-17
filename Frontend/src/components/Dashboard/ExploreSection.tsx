import React from "react";
import { useNavigate } from "react-router-dom";
import ExploreImage1 from "../../assets/images/ExploreImage1.png";
import ExploreImage2 from "../../assets/images/ExploreImage2.png";
import ExploreImage3 from "../../assets/images/ExploreImage3.png";
import "./exploresection.css";

interface Category {
    name: string;
    image: string;
    type?: "large" | "small";
}

const ExploreSection: React.FC = () => {
    const navigate = useNavigate();

    const categories: Category[] = [
        { name: "Asian", image: ExploreImage1, type: "large" },
        { name: "Mexican", image: ExploreImage2 },
        { name: "European", image: ExploreImage3 },
    ];

    const handleClick = (category: string) => {
        navigate(`/recommended/${category}`);
    };

    return (
        <div className="explore__section">
            <h3 className="explore__title">Explore</h3>

            <div className="explore__grid">
                {categories.map((cat, i) => (
                    <div
                        key={i}
                        className={`explore__card ${
                            cat.type === "large"
                                ? "explore__large__card"
                                : "explore__small__card"
                        }`}
                        onClick={() => handleClick(cat.name)}
                    >
                        <img src={cat.image} alt={cat.name} className="explore__image" />
                        <p className="explore__text">{cat.name}</p>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default ExploreSection;
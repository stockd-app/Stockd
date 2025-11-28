import React, { useState } from "react"; //add useEffect for future data fetching
import BottomNavBar from "../../components/NavigationBar/BottomNavBar/BottomNavBar";

import "@/styles/variable.css";
import "./pantrypage.css";

/**
 * Pantry Page (Based on figma)
 * Pantry route is already wrote in src/config/consts.ts.
 * TODO: Connect to backend to get real pantry items and openFoodfacts Api images
 * TODO: useEffect to fetch pantry items data when backend is ready
 * TODO: Add category filters (Fridge, Pantry, Freezer)
 */

const PantryPage: React.FC = () => {
    //using static mock data for now
    const [pantryData] = useState([
        {
            section: "Fridge",
            items: [
                { id: 1, name: "Soy Milk", qty: "2", image: "https://images.openfoodfacts.org/images/products/506/040/608/0223/front_en.34.200.jpg" },
                { id: 2, name: "Nuggets", qty: "3", image: "https://images.openfoodfacts.org/images/products/377/001/893/4402/front_fr.27.200.jpg" },
                { id: 9, name: "Eggs", qty: "6", image: "https://images.openfoodfacts.org/images/products/000/000/121/7155/front_en.27.200.jpg" },
            ],
        },
        {
            section: "Pantry",
            items: [
                { id: 3, name: "Banana Chips", qty: "1", image: "https://images.openfoodfacts.org/images/products/871/840/388/7518/front_fr.34.200.jpg" },
                { id: 4, name: "Plain Flour", qty: "2", image: "https://images.openfoodfacts.org/images/products/408/860/008/6309/front_en.13.200.jpg" },
                { id: 5, name: "Cruseli Cereal", qty: "1", image: "https://images.openfoodfacts.org/images/products/316/893/001/0821/front_fr.37.200.jpg" },
            ],
        },
        {
            section: "Freezer",
            items: [
                { id: 6, name: "Mixed Vegetables", qty: "1", image: "https://images.openfoodfacts.org/images/products/408/860/025/7730/front_en.3.200.jpg" },
                { id: 7, name: "Ben & Jerry's", qty: "2", image: "https://images.openfoodfacts.org/images/products/871/132/737/0708/front_en.161.200.jpg" },
                { id: 8, name: "King Prawns", qty: "1", image: "https://images.openfoodfacts.org/images/products/405/648/982/5067/front_en.3.200.jpg" },
            ],
        }
    ]);
    //useEffect() - This will be used in the future to fetch backend data replace the mock data.

    return (
        <div className="pantry__container">
            <div className="pantry__content">
                {pantryData.map(section => (
                    <div key={section.section} className="pantry__section">
                        <div className="pantry__header">
                            <h2>{section.section}</h2>
                            <p className="see__more">See more</p>
                        </div>

                        <div className="pantry__items">
                            {section.items.map(item => (
                                <div key={item.id} className="pantry__card">
                                    <div className="pantry__image__Container">
                                        <img src={item.image} alt={item.name} className="pantry__image" />
                                    </div>
                                    <div className="pantry__info">
                                        <span className="pantry__name">{item.name}</span>
                                        <span className="pantry__qty">{item.qty}</span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                ))}
            </div>

            <BottomNavBar />
        </div>
    );
};

export default PantryPage;
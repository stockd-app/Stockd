import React, { useState } from "react";
import BottomNavBar from "../../components/NavigationBar/BottomNavBar/BottomNavBar";
import PantryItemSection from "../../components/PantryItemSection/PantryItemSection";

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
                { id: 1, name: "Soy Milk", qty: "x2", image: "https://images.openfoodfacts.org/images/products/506/040/608/0223/front_en.34.200.jpg" },
                { id: 2, name: "Nuggets", qty: "x3", image: "https://images.openfoodfacts.org/images/products/377/001/893/4402/front_fr.27.200.jpg" },
                { id: 9, name: "Eggs", qty: "x6", image: "https://images.openfoodfacts.org/images/products/000/000/121/7155/front_en.27.200.jpg" },
            ],
        },
        {
            section: "Pantry",
            items: [
                { id: 3, name: "Banana Chips", qty: "x1", image: "https://images.openfoodfacts.org/images/products/871/840/388/7518/front_fr.34.200.jpg" },
                { id: 4, name: "Plain Flour", qty: "x2", image: "https://images.openfoodfacts.org/images/products/408/860/008/6309/front_en.13.200.jpg" },
                { id: 5, name: "Cruseli Cereal", qty: "x1", image: "https://images.openfoodfacts.org/images/products/316/893/001/0821/front_fr.37.200.jpg" },
            ],
        },
        {
            section: "Freezer",
            items: [
                { id: 6, name: "Mixed Vegetables", qty: "x1", image: "https://images.openfoodfacts.org/images/products/408/860/025/7730/front_en.3.200.jpg" },
                { id: 7, name: "Ben & Jerry's", qty: "x2", image: "https://images.openfoodfacts.org/images/products/871/132/737/0708/front_en.161.200.jpg" },
                { id: 8, name: "King Prawns", qty: "x1", image: "https://images.openfoodfacts.org/images/products/405/648/982/5067/front_en.3.200.jpg" },
            ],
        }
    ]);
    //useEffect() - This will be used in the future to fetch backend data replace the mock data.

    return (
        <div className="pantry__container">
            <div className="pantry__content">
                {pantryData.map((section) => (
                    <PantryItemSection
                        key={section.section}
                        section={section.section}
                        items={section.items}
                    />
                ))}
            </div>
            <BottomNavBar />
        </div>
    );
};

export default PantryPage;
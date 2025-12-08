import React from "react";
import ItemCard from "../ItemCard/ItemCard";

import "./pantryitemsection.css";

interface PantryItemSectionProps {
    section: string;
    items: {
        id: number;
        name: string;
        qty: string;
        image: string;
    }[];
}

const ItemSection: React.FC<PantryItemSectionProps> = ({ section, items }) => {
    return (
        <div className="pantryItem__section">
            <div className="pantryItem__header">
                <h2>{section}</h2>
                <p className="see__more">See more</p>
            </div>

            <div className="pantryItem__items">
                {items.map((item) => (
                    <ItemCard
                        key={item.id}
                        name={item.name}
                        qty={item.qty}
                        image={item.image}
                    />
                ))}
            </div>
        </div>
    );
};

export default ItemSection;

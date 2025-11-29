import React from "react";
import ItemCard from "../ItemCard/ItemCard";
import "./itemsection.css";

interface ItemSectionProps {
    section: string;
    items: {
        id: number;
        name: string;
        qty: string;
        image: string;
    }[];
}

const ItemSection: React.FC<ItemSectionProps> = ({ section, items }) => {
    return (
        <div className="pantry__section">
            <div className="pantry__header">
                <h2>{section}</h2>
                <p className="see__more">See more</p>
            </div>

            <div className="pantry__items">
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

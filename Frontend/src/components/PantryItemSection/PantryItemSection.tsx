import React, { useState } from "react";
import PantryItemCard from "../PantryItemCard/PantryItemCard";
import PantryItemDetails from "../PantryItemDetails/PantryItemDetails";

import "./pantryitemsection.css";

export interface PantryItem {
    id: number;
    name: string;
    qty: string;
    unit: string;
    category: string;
    storage: string;
    added_on: string;
    image: string;
}

interface PantryItemSectionProps {
    section: string;
    items: PantryItem[];
    onRefresh: () => void;
    onSeeMore?: (section: string) => void;
}

const PantryItemSection: React.FC<PantryItemSectionProps> = ({ section, items, onRefresh, onSeeMore }) => {
    const [selectedItem, setSelectedItem] = useState<any | null>(null);
    console.log("Rendering ItemSection for section:", section);

    const handleItemClick = (item: PantryItem) => {
        setSelectedItem(item);
    };

    return (
        <>
            <div className="pantryitemsection__container">
                <div className="pantryitemsecton__header">
                    <h2>{section}</h2>
                    {onSeeMore && (
                        <p
                            className="see__more"
                            onClick={() => onSeeMore(section)}
                        >
                            See more
                        </p>
                    )}
                </div>

                <div className="pantryitemsection__items">
                    {items.map((item) => (
                        <PantryItemCard
                            key={item.id}
                            name={item.name}
                            qty={item.qty}
                            image={item.image}
                            onClick={() => handleItemClick(item)}
                        />
                    ))}
                </div>
            </div>

            {selectedItem && (
                <PantryItemDetails
                    id={selectedItem.id}
                    name={selectedItem.name}
                    qty={selectedItem.qty}
                    unit={selectedItem.unit}
                    category={selectedItem.category}
                    storage={selectedItem.storage}
                    added_on={selectedItem.added_on}
                    image={selectedItem.image}
                    onClose={() => setSelectedItem(null)}
                    onSaved={onRefresh}
                />
            )}
        </>
    );
};

export default PantryItemSection;
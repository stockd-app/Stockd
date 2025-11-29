import React from "react";
import "./itemcard.css";

interface ItemCardProps {
    name: string;
    qty: string;
    image: string;
}

const ItemCard: React.FC<ItemCardProps> = ({ name, qty, image }) => {
    return (
        <div className="pantry__card">
            <div className="pantry__image__Container">
                <img src={image} alt={name} className="pantry__image" />
            </div>
            <div className="pantry__info">
                <span className="pantry__name">{name}</span>
                <span className="pantry__qty">{qty}</span>
            </div>
        </div>
    );
};

export default ItemCard;

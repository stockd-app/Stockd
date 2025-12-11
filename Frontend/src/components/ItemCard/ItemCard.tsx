import React from "react";
import image_placeholder from "../../assets/images/error_handling/image_placeholder.png"

import "./itemcard.css";

interface ItemCardProps {
  name: string;
  qty: string;
  image: string;
  onClick?: () => void;
}

const ItemCard: React.FC<ItemCardProps> = ({ name, qty, image, onClick }) => {
  const displayImage = image && image.trim() !== "" ? image : image_placeholder;

  return (
    <div className="itemcard" onClick={onClick}>
      <div className="itemcard__container">
        <img
          src={displayImage}
          alt={name}
          className="itemcard__image"
          onError={(e) => {
            // If image fails to load, use fallback
            const target = e.target as HTMLImageElement;
            if (target.src !== image_placeholder) {
              target.src = image_placeholder;
            }
          }}
        />
      </div>
      <div className="itemcard__info">
        <span className="itemcard__name">{name}</span>
        <span className="itemcard__qty">{qty}</span>
      </div>
    </div>
  );
};

export default ItemCard;

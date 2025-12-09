import React from "react";
import "./itemcard.css";

interface ItemCardProps {
  name: string;
  qty: string;
  image: string;
}

// const FALLBACK_IMAGE = "https://static.vecteezy.com/system/resources/thumbnails/007/415/858/small/holding-signboard-404-not-found-cute-pear-cartoon-vector.jpg";

const FALLBACK_IMAGE =
  "https://media.discordapp.net/attachments/1357840230971080919/1447621855841095782/image.png?ex=69384a69&is=6936f8e9&hm=bcebac26a24594edb1e1dbac1bc3c614b62a9518aefeb65d264d87ed8cec6d4f&=&format=webp&quality=lossless&width=1570&height=1570";
const ItemCard: React.FC<ItemCardProps> = ({ name, qty, image }) => {
  const displayImage = image && image.trim() !== "" ? image : FALLBACK_IMAGE;

  return (
    <div className="pantry__card">
      <div className="pantry__image__Container">
        <img
          src={displayImage}
          alt={name}
          className="pantry__image"
          onError={(e) => {
            // If image fails to load, use fallback
            const target = e.target as HTMLImageElement;
            if (target.src !== FALLBACK_IMAGE) {
              target.src = FALLBACK_IMAGE;
            }
          }}
        />
      </div>
      <div className="pantry__info">
        <span className="pantry__name">{name}</span>
        <span className="pantry__qty">{qty}</span>
      </div>
    </div>
  );
};

export default ItemCard;

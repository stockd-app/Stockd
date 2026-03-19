import React from "react";
import pantry_placeholder from "../../assets/images/error_handling/recipe_placeholder_2.png"
import { useLongPress } from "../../utils/useLongPress";
import { Square, SquareCheckBig } from "lucide-react";

import "./pantryitemcard.css";

interface PantryItemCardProps {
    name: string;
    qty?: string;
    image: string;
    onClick?: () => void;
    isSelecting?: boolean;
    selected?: boolean;
    onLongPress?: () => void;
}

const PantryItemCard: React.FC<PantryItemCardProps> = ({ name, qty, image, onClick, isSelecting, selected, onLongPress }) => {
    const displayImage = image && image.trim() !== "" ? image : pantry_placeholder;
    const { handlers, wasLongPressed } = useLongPress(() => {
        onLongPress?.();
    }, 450);

    const handleCardClick = () => {
        if (wasLongPressed()) return;
        onClick?.();
    };
    return (
        <div className={`pantryitemcard ${selected ? "selected" : ""}`} onClick={handleCardClick} {...handlers} style={{ touchAction: "manipulation" }}>
            {isSelecting && (
                <div className="pantryItemCard__selectControl" onClick={(e) => e.stopPropagation()}>
                    <label className="pantryItemCard__selectLabel">
                        <input
                            className="pantryItemCard__checkbox"
                            type="checkbox"
                            checked={!!selected}
                            onChange={() => onClick?.()}
                        />
                        {/* <span className="pantryItemCard__selectDot" aria-hidden="true" /> */}
                    </label>
                </div>
            )}
            <div className="pantryitemcard__container">
                <img
                    src={displayImage}
                    alt={name}
                    className="pantryitemcard__image"
                    onError={(e) => {
                        // If image fails to load, use fallback
                        const target = e.target as HTMLImageElement;
                        if (target.src !== pantry_placeholder) {
                            target.src = pantry_placeholder;
                        }
                    }}
                />
            </div>
            <div className="pantryitemcard__info">
                <span className="pantryitemcard__name">{name}</span>
                <span className="pantryitemcard__qty">{qty}</span>
            </div>
        </div>
    );
};

export default PantryItemCard;


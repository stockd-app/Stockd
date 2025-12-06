import React from "react";
import "./itemcard.css";

interface ItemCardProps {
    name: string;
    qty?: string;
    image: string;
    rating?: number;
    time?: string;
    status?: string;
    mode?: "pantry" | "dashboard";
}

const ItemCard: React.FC<ItemCardProps> = ({ name, qty, image, rating, time, status, mode = "pantry" }) => {
    const statusClass =
        status && status.toLowerCase().includes("missing")
            ? "status status--missing"
            : "status status--available";
    return (
        <div className={`itemcard ${mode}`}>
            <div className="itemcard__image__Container">
                <img src={image} alt={name} className="itemcard__image" />
            </div>

            {mode === "pantry" && (
                <div className="pantry__info">
                    <span className="pantry__name">{name}</span>
                    {qty && <span className="pantry__qty">{qty}</span>}
                </div>
            )}

            {mode === "dashboard" && (
                <div className="dashboard__info">
                    <span className="dashboard__recipe__name">{name}</span>

                    {status && (
                        <span className={statusClass}>{status}</span>
                    )}

                    <div className="dashboard__meta">
                        {time && <span className="meta__item">⏱ {time}</span>}
                        {rating && <span className="meta__item">⭐ {rating}</span>}
                    </div>
                </div>
            )}
        </div>
    );
};

export default ItemCard;

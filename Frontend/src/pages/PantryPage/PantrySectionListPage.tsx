import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import PantryItemCard from "../../components/PantryItemCard/PantryItemCard";
import type { PantryItem } from "../../components/PantryItemSection/PantryItemSection";
import { getPantryItems } from "../../services/api";

import "./pantrysectionlistpage.css";

interface PantrySectionListPageProps {
    title: string;
    storage: "Pantry" | "Fridge" | "Freezer";
}

const PantrySectionListPage: React.FC<PantrySectionListPageProps> = ({
    title,
    storage,
}) => {
    const navigate = useNavigate();
    const [items, setItems] = useState<PantryItem[]>([]);

    useEffect(() => {
        const load = async () => {
            const user = JSON.parse(localStorage.getItem("user") || "null");
            if (!user) {
                navigate("/");
                return;
            }

            const res = await getPantryItems(user.id);
            setItems(res.grouped_items?.[storage] ?? []);
        };

        load();
    }, [storage, navigate]);

    return (
        <div className="pantrySection__container">
            <div className="pantrySection__header">
                <button onClick={() => navigate(-1)}>←</button>
                <h2>{title}</h2>
            </div>

            <div className="pantrySection__grid">
                {items.map(item => (
                    <PantryItemCard
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

export default PantrySectionListPage;

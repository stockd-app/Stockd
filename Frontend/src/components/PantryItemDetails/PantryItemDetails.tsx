import React, { useState } from "react";
import type { PantryItem } from "../PantryItemSection/PantryItemSection";
import { addOrUpdatePantryItem } from "../../services/api";

import "./pantryitemdetails.css";

interface PantryItemDetailProps extends PantryItem {
    onClose: () => void;
    onSaved: () => void;
}

const PantryItemDetails: React.FC<PantryItemDetailProps> = ({
    id,
    name,
    qty,
    unit,
    category,
    storage,
    added_on,
    image,
    onClose,
    onSaved,
}) => {
    const user = JSON.parse(localStorage.getItem("user")!);

    const [productName, setProductName] = useState(name);
    const [quantity, setQuantity] = useState(Number(qty.replace("x", "")));
    const [quantityUnit, setQuantityUnit] = useState(unit);
    const [itemCategory, setItemCategory] = useState(category);
    const [itemLocation, setItemLocation] = useState(storage);
    const [dateAdded, setDateAdded] = useState(added_on);

    const handleSave = async () => {

        const payload = {
            id: id,
            item_name: productName,
            quantity_value: quantity,
            quantity_unit: quantityUnit,
            category: itemCategory,
            storage: itemLocation,
            added_on: dateAdded,
            item_image: image,
        };

        try {
            await addOrUpdatePantryItem(user.id, [payload]);
            onSaved();
            onClose();
        } catch (err) {
            console.error("Error updating pantry item:", err);
        }
    };

    return (
        <div className="pid__overlay">
            <div className="pid__modal">

                <div className="pid__header">
                    <button className="pid__back" onClick={onClose}>←</button>
                    <h2>Pantry Item</h2>
                </div>

                <div className="pid__body">
                    <div className="pid__row editable">
                        <span className="pid__label">Product Name</span>
                        <input
                            value={productName}
                            onChange={(e) => setProductName(e.target.value)}
                            className="pid__input text"
                        />
                    </div>
                    <div className="pid__row editable">
                        <span className="pid__label">Quantity</span>
                        <div className="pid__qty_box">
                            <button onClick={() => setQuantity(q => Math.max(1, q - 1))}>−</button>
                            <input
                                type="number"
                                min={1}
                                step={1}
                                value={quantity}
                                onChange={(e) => {
                                    const value = Number(e.target.value);
                                    if (!Number.isNaN(value) && value >= 1) {
                                        setQuantity(value);
                                    }
                                }}
                                className="pid__qty_input"
                            />
                            <button onClick={() => setQuantity(q => q + 1)}>+</button>
                        </div>
                    </div>
                    <div className="pid__row editable">
                        <span className="pid__label">Unit</span>
                        <select
                            value={quantityUnit}
                            onChange={(e) => setQuantityUnit(e.target.value)}
                            className="pid__input select"
                        >
                            <option value="pcs">pcs</option>
                            <option value="kg">kg</option>
                            <option value="g">g</option>
                            <option value="L">L</option>
                        </select>
                    </div>
                    <div className="pid__row editable">
                        <span className="pid__label">Location</span>
                        <select
                            value={itemLocation}
                            onChange={(e) => setItemLocation(e.target.value)}
                            className="pid__input select"
                        >
                            <option value="Pantry">Pantry</option>
                            <option value="Fridge">Fridge</option>
                            <option value="Freezer">Freezer</option>
                        </select>
                    </div>
                    <div className="pid__row editable">
                        <span className="pid__label">Category</span>
                        <select
                            value={itemCategory}
                            onChange={(e) => setItemCategory(e.target.value)}
                            className="pid__input select"
                        >
                            <option value="vegetable">Vegetable</option>
                            <option value="meat">Meat</option>
                            <option value="fruit">Fruit</option>
                            <option value="dairy">Dairy</option>
                        </select>
                    </div>
                    <div className="pid__row editable">
                        <span className="pid__label">Date Added</span>
                        <input
                            type="datetime-local"
                            value={dateAdded}
                            onChange={(e) => setDateAdded(e.target.value)}
                            className="pid__input"
                        />
                    </div>
                </div>

                <div className="pid__footer">
                    <button className="pid__save" onClick={handleSave}>Done</button>
                </div>

            </div>
        </div>
    );
};

export default PantryItemDetails;
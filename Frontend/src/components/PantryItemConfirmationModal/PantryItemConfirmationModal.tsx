import React, { useState } from "react";

import "./pantryitemconfirmationmodal.css";

export interface ConfirmPantryItem {
    id?: number;
    item_name: string;
    quantity_value: number;
    storage: string;
}

interface Props {
    items: ConfirmPantryItem[];
    onClose: () => void;
    onConfirm: (updatedItems: ConfirmPantryItem[]) => void;
}

/**
 * Modal to confirm the pantry items detected from the receipt and allow user to edit quantity before saving to pantry
 * @param param0 
 * @returns 
 */
const PantryItemConfirmationModal: React.FC<Props> = ({
    items,
    onClose,
    onConfirm,
}) => {
    const [editedItems, setEditedItems] = useState<ConfirmPantryItem[]>(items);

    const increase = (index: number) => {
        const copy = [...editedItems];
        copy[index].quantity_value += 1;
        setEditedItems(copy);
    };

    const decrease = (index: number) => {
        const copy = [...editedItems];
        if (copy[index].quantity_value > 1) {
            copy[index].quantity_value -= 1;
        }
        setEditedItems(copy);
    };

    return (
        <div className="pcm__overlay">
            <div className="pcm__modal">
                <h3>Confirm Your New Pantry Items!</h3>
                <p>Are these the quantity of your pantry items?</p>

                <div className="pcm__list">
                    {editedItems.map((item, index) => (
                        <div key={index} className="pcm__item">
                            <span className="pcm__name">{item.item_name}</span>

                            <div className="pcm__qtyControls">
                                <button onClick={() => decrease(index)}>-</button>
                                <span>{item.quantity_value}</span>
                                <button onClick={() => increase(index)}>+</button>
                            </div>
                        </div>
                    ))}
                </div>

                <div className="pcm__actions">
                    <button className="pcm__cancel" onClick={onClose}>
                        Cancel
                    </button>
                    <button
                        className="pcm__confirm"
                        onClick={() => onConfirm(editedItems)}
                    >
                        Confirm & Save
                    </button>
                </div>
            </div>
        </div>
    );
};

export default PantryItemConfirmationModal;

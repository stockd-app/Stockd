import React, { useState, useEffect, useRef } from "react";
import { Pencil , Trash2, Plus} from "lucide-react";

import "./pantryitemconfirmationmodal.css";

const UNIT_OPTIONS = ["pc", "ml", "mg", "g", "kg", "l"]; // ask harry about the ones we're using

export interface ConfirmPantryItem {
    id?: number;
    item_name: string;
    normalized_name?: string;
    quantity_value: number;
    unit?: string;
    storage: string;
    category?: string;
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
    const [editedItems, setEditedItems] = useState<ConfirmPantryItem[]>(
        items.map(item => ({
            ...item,
            quantity_value: item.quantity_value || 1,
            unit: item.unit || "pc",
        }))
    );

    const [editingIndex, setEditingIndex] = useState<number | null>(null);

    const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

    const updateQuantity = (index: number, value: number) => {
        const copy = [...editedItems];
        copy[index].quantity_value = value > 0 ? value : 1;
        setEditedItems(copy);
    };

    const updateUnit = (index: number, unit: string) => {
        const copy = [...editedItems];
        copy[index].unit = unit;
        setEditedItems(copy);
    };

    const updateName = (index: number, name: string) => {
        const copy = [...editedItems];
        copy[index].item_name = name;
        setEditedItems(copy);
    };

    const confirmNameEdit = (index: number) => {
        const name = editedItems[index].item_name.trim();

        if (!name) {
            const copy = [...editedItems];
            copy[index].item_name = "Unnamed item";
            setEditedItems(copy);
        }

        setEditingIndex(null);
    };

    const deleteItem = (index: number) => {
    const copy = editedItems.filter((_, i) => i !== index);
    setEditedItems(copy);
};

const addNewItem = () => {
    const newItem: ConfirmPantryItem = {
        item_name: "",
        quantity_value: 1,
        unit: "pc",
        storage: "",
    };

    const newItems = [...editedItems, newItem];
    setEditedItems(newItems);

    setEditingIndex(newItems.length - 1);
};

useEffect(() => {
    if (editingIndex !== null) {
        const input = inputRefs.current[editingIndex];
        if (input) {
            input.focus();
            input.select();
        }
    }
}, [editingIndex]);

        return (
        <div className="pcm__overlay">
            <div className="pcm__modal">
                <h3>Confirm Your New Pantry Items!</h3>
                <p>Review and adjust your items before saving</p>

                <div className="pcm__list">
                    {editedItems.map((item, index) => (
                        <div key={index} className="pcm__item">

                            <div className="pcm__nameSection">
                                {editingIndex === index ? (
                                    <input
                                        type="text"
                                        value={item.item_name}
                                        onChange={(e) =>
                                            updateName(index, e.target.value)
                                        }
                                        onBlur={() => confirmNameEdit(index)}
                                        onKeyDown={(e) => {
                                            if (e.key === "Enter") {
                                                confirmNameEdit(index);
                                            }
                                        }}
                                        autoFocus
                                        ref={(el) => {
                                            inputRefs.current[index] = el;
                                        }}
                                        className="pcm__nameInput"
                                    />
                                ) : (
                                    <>
                                        <span className="pcm__name">
                                            {item.item_name}
                                        </span>
                                        <button
                                            className="pcm__editBtn"
                                            onClick={() => setEditingIndex(index)}
                                        >
                                            <Pencil size={16} />
                                        </button>
                                    </>
                                )}
                            </div>

                            <div className="pcm__controls">
                                <input
                                    type="number"
                                    min="1"
                                    value={item.quantity_value}
                                    onChange={(e) =>
                                        updateQuantity(
                                            index,
                                            parseInt(e.target.value) || 1
                                        )
                                    }
                                    className="pcm__qtyInput"
                                />

                                <select
                                    value={item.unit}
                                    onChange={(e) =>
                                        updateUnit(index, e.target.value)
                                    }
                                    className="pcm__unitSelect"
                                >
                                    {UNIT_OPTIONS.map((unit) => (
                                        <option key={unit} value={unit}>
                                            {unit}
                                        </option>
                                    ))}
                                </select>

                                 <button
                                    className="pcm__deleteBtn"
                                    onClick={() => deleteItem(index)}>
                                    <Trash2 size={16} />
                                </button>
                            </div>
                        </div>
                    ))}
                </div>

                <div className="pcm__addRow">
                    <button className="pcm__addBtn" onClick={addNewItem}>
                        <Plus size={16} />
                        Add item
                    </button>
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
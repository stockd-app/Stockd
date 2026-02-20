import React, { useState } from "react";
import PantryItemCard from "../PantryItemCard/PantryItemCard";
import PantryItemDetails from "../PantryItemDetails/PantryItemDetails";
import { deletePantryItems } from "../../services/api";
import { CheckSquare2, X, Square, Trash2 } from "lucide-react";
import ConfirmModal from "../ConfirmModal/ConfirmModal";
import { CONFIRM_DELETE_PANTRY_ITEM } from "../../config/consts";

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
    const [isSelecting, setIsSelecting] = useState(false);
    const [selectedIds, setSelectedIds] = useState<Set<number>>(new Set());
    const [showConfirmDelete, setShowConfirmDelete] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);

    const handleItemClick = (item: PantryItem) => {
        if (isSelecting) {
            toggleSelect(item.id); // Toggle selection state
        } else {
            setSelectedItem(item);
        }
    };

    const toggleSelect = (id: number) => {
        setSelectedIds(prev => {
            const next = new Set(prev);
            next.has(id) ? next.delete(id) : next.add(id);
            return next;
        });
    };

    const clearSelection = () => setSelectedIds(new Set());

    const handleDeleteSelected = () => {
        if (selectedIds.size === 0) return;
        setShowConfirmDelete(true);
    };

    const handleConfirmDeleteSelected = async () => {
        const ids = Array.from(selectedIds);
        if (ids.length === 0) {
            setShowConfirmDelete(false);
            return;
        }

        try {
            setIsDeleting(true);
            await deletePantryItems(ids);
            setIsSelecting(false);
            clearSelection();
            setShowConfirmDelete(false);
            onRefresh();
        } catch (e) {
            console.error("Failed to delete pantry items:", e);
            alert("Failed to delete items. Please try again.");
        } finally {
            setIsDeleting(false);
        }
    };
    const enterSelectMode = (id: number) => {
        setIsSelecting(true);
        setSelectedIds(new Set([id]));
    };

    const exitSelectMode = () => {
        setIsSelecting(false);
        clearSelection();
    };
    return (
        <>
            <div className="pantryitemsection__container">
                <div className="pantryitemsecton__header">
                    <h2>{section}</h2>
                    {onSeeMore && (
                        <p className="see__more" onClick={() => onSeeMore(section)} > See more </p>
                    )}
                </div>
                {isSelecting && (
                    <div className="pantryItemSection__bulkActions">
                        <div className="pantryItemSection__bulkActionsTrack">
                            <button
                                type="button"
                                className="pantryItemSection__bulkActionBtn"
                                onClick={() => setSelectedIds(new Set(items.map(i => i.id)))}
                            >
                                <CheckSquare2 className="pantryItemSection__bulkActionIcon" />
                                <span className="pantryItemSection__bulkActionText">Select all</span>
                            </button>

                            <button
                                type="button"
                                className="pantryItemSection__bulkActionBtn"
                                onClick={clearSelection}
                            >
                                <Square className="pantryItemSection__bulkActionIcon" />
                                <span className="pantryItemSection__bulkActionText">Unselect all</span>
                            </button>

                            <button
                                type="button"
                                className="pantryItemSection__bulkActionBtn"
                                onClick={exitSelectMode}
                            >
                                <X className="pantryItemSection__bulkActionIcon" />
                                <span className="pantryItemSection__bulkActionText">Cancel</span>
                            </button>

                            <button
                                type="button"
                                className="pantryItemSection__bulkActionBtn pantryItemSection__bulkActionDeleteBtn"
                                disabled={selectedIds.size === 0}
                                onClick={handleDeleteSelected}
                            >
                                <Trash2 className="pantryItemSection__bulkActionIcon" />
                                <span className="pantryItemSection__bulkActionText">
                                    Delete ({selectedIds.size})
                                </span>
                            </button>
                        </div>
                    </div>
                )}


                <div className="pantryitemsection__items">
                    {items.map((item) => (
                        <PantryItemCard
                            key={item.id}
                            name={item.name}
                            qty={item.qty}
                            image={item.image}
                            isSelecting={isSelecting}
                            selected={selectedIds.has(item.id)}
                            onClick={() => {
                                if (isSelecting) toggleSelect(item.id);
                                else handleItemClick(item);
                            }}
                            onLongPress={() => {
                                if (!isSelecting) enterSelectMode(item.id);
                            }}
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
            {showConfirmDelete && (
                <ConfirmModal
                    text={
                        <>
                            {CONFIRM_DELETE_PANTRY_ITEM}
                            <br />
                            Delete {selectedIds.size} item(s) from {section}?
                        </>
                    }
                    onConfirm={handleConfirmDeleteSelected}
                    onCancel={() => setShowConfirmDelete(false)}
                />
            )}
        </>
    );
};

export default PantryItemSection;

import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { CheckSquare2, SlidersHorizontal, Square, Trash2, X } from "lucide-react";
import PantryItemCard from "../../components/PantryItemCard/PantryItemCard";
import PantryItemDetails from "../../components/PantryItemDetails/PantryItemDetails";
import type { PantryItem } from "../../components/PantryItemSection/PantryItemSection";
import { getPantryItems, deletePantryItems } from "../../services/api";
import ConfirmModal from "../../components/ConfirmModal/ConfirmModal";
import { CONFIRM_DELETE_PANTRY_ITEM } from "../../config/consts";
import Button from "../../components/Button/Button";

import "./pantrysectionlistpage.css";
import FilterDrawer from "../../components/FilterDrawer/FilterDrawer";
import FilterChip from "../../components/FilterChip/FilterChip";

interface PantrySectionListPageProps {
    title: string;
    storage: "Pantry" | "Fridge" | "Freezer";
}

const PantrySectionListPage: React.FC<PantrySectionListPageProps> = ({
    title,
    storage,
}) => {
    const navigate = useNavigate();
    const [selectedItem, setSelectedItem] = useState<any | null>(null);
    const [items, setItems] = useState<PantryItem[]>([]);

    const [isSelecting, setIsSelecting] = useState(false);
    const [selectedIds, setSelectedIds] = useState<Set<number>>(new Set());
    const [showConfirmDelete, setShowConfirmDelete] = useState(false);

    const [showFilters, setShowFilters] = useState(false);
    const [filteredItems, setFilteredItems] = useState<PantryItem[]>([]);

    const [filters, setFilters] = useState({
        category: null as string | null,
    });

    const categories = Array.from(
        new Set(
            items
                .map(r => r.category)
                .filter((cat): cat is string => Boolean(cat))
        )
    );

    useEffect(() => {
        let result = [...items];

        if (filters.category) {
            result = result.filter(
                item =>
                    item.category?.toLowerCase() === filters.category?.toLowerCase()
            );
        }

        setFilteredItems(result);
    }, [items, filters]);

    const loadItems = async () => {
        const user = JSON.parse(localStorage.getItem("user") || "null");
        if (!user) {
            navigate("/");
            return;
        }
        const res = await getPantryItems(user.id);
        setItems(res.grouped_items?.[storage] ?? []);
    };

    useEffect(() => {
        loadItems();
    }, [storage]);

    const toggleSelect = (id: number) => {
        setSelectedIds((prev) => {
            const next = new Set(prev);
            next.has(id) ? next.delete(id) : next.add(id);
            return next;
        });
    };

    const clearSelection = () => setSelectedIds(new Set());


    const exitSelectMode = () => {
        setIsSelecting(false);
        clearSelection();
    };

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
            await deletePantryItems(ids);

            setShowConfirmDelete(false);
            exitSelectMode();
            setSelectedItem(null);
            await loadItems();
        } catch (e) {
            console.error("Failed to delete pantry items:", e);
            alert("Failed to delete items, please try again.");
        }
    }

    return (
        <>
            <div className="pantrySection__container">
                <div className="pantrySection__header">
                    <Button
                        variant="back"
                        onClick={() => navigate(-1)} />

                    <h2 className="pantrySection__title">{title}</h2>

                    <Button
                        className="pantrySection__filter"
                        onClick={() => setShowFilters(true)}
                        aria-label="Open filters"
                    >
                        <SlidersHorizontal size={20} />
                    </Button>

                    {/* Empty spacer to mirror right-side button space */}
                    <div className="pantrySection__spacer" />
                </div>

                {isSelecting && (
                    <div className="pantryItemSection__bulkActions">
                        <div className="pantryItemSection__bulkActionsTrack">
                            <button
                                type="button"
                                className="pantryItemSection__bulkActionBtn"
                                onClick={() => setSelectedIds(new Set(items.map((i) => i.id)))}
                            >
                                <CheckSquare2 className="pantryItemSection__bulkActionIcon" />
                                <span className="pantryItemSection__bulkActionText">
                                    Select all
                                </span>
                            </button>

                            <button
                                type="button"
                                className="pantryItemSection__bulkActionBtn"
                                onClick={clearSelection}
                            >
                                <Square className="pantryItemSection__bulkActionIcon" />
                                <span className="pantryItemSection__bulkActionText">
                                    Unselect all
                                </span>
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

                <div className="pantrySection__grid">
                    {filteredItems.map(item => (
                        <PantryItemCard
                            key={item.id}
                            name={item.name}
                            qty={item.qty.substring(1) + " " + item.unit}
                            image={item.image}
                            category={item.category ? [item.category] : []}
                            onClick={() => {
                                if (isSelecting) toggleSelect(item.id);
                                else setSelectedItem(item);
                            }}
                            isSelecting={isSelecting}
                            selected={selectedIds.has(item.id)}
                            onLongPress={() => {
                                setIsSelecting(true);
                                setSelectedIds(new Set([item.id]));
                            }}
                        />
                    ))}
                </div>
            </div>

            {selectedItem && (
                <PantryItemDetails
                    {...selectedItem}
                    onClose={() => setSelectedItem(null)}
                    onSaved={async () => {
                        const user = JSON.parse(localStorage.getItem("user") || "null");
                        if (!user) return;

                        const res = await getPantryItems(user.id);
                        setItems(res.grouped_items?.[storage] ?? []);
                    }}
                />
            )}
            {showConfirmDelete && (
                <ConfirmModal
                    text={
                        <>
                            {CONFIRM_DELETE_PANTRY_ITEM}
                            <br />
                            Delete {selectedIds.size} item(s) from {storage}?
                        </>
                    }
                    onConfirm={handleConfirmDeleteSelected}
                    onCancel={() => setShowConfirmDelete(false)}
                />
            )}

            {/* Filter Drawer */}
            <FilterDrawer open={showFilters} onClose={() => setShowFilters(false)}>

                <div className="filter__section">
                    <h4>Category</h4>
                    <div className="filter__chips">
                        <FilterChip
                            label="All"
                            active={filters.category === null}
                            onClick={() =>
                                setFilters(prev => ({ ...prev, category: null }))
                            }
                        />

                        {categories.map(cat => (
                            <FilterChip
                                key={cat}
                                label={cat.charAt(0).toUpperCase() + cat.slice(1)}
                                active={filters.category === cat}
                                onClick={() =>
                                    setFilters(prev => ({ ...prev, category: cat }))
                                }
                            />
                        ))}
                    </div>
                </div>

                <div className="filter__actions">
                    <Button
                        variant="secondary"
                        onClick={() =>
                            setFilters({
                                category: null,
                            })
                        }>
                        Clear All
                    </Button>
                    <Button
                        variant="primary"
                        onClick={() => setShowFilters(false)}
                    >
                        Apply
                    </Button>
                </div>
            </FilterDrawer>
        </>
    );
};

export default PantrySectionListPage;

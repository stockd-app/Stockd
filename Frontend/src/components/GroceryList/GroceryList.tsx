import React, { useState, useEffect } from "react";
import { Plus, MoreVertical, Check } from "lucide-react";
import { API_ROUTES, BOTTOM_NAV_ICON_SIZE, NOTIFICATION_MESSAGES, NOTIFICATION_TYPES } from "../../config/consts";
import ConfirmModal from "../ConfirmModal/ConfirmModal";
import Button from "../Button/Button";
import { useNotification } from "../Notification/NotificationContext";

import "./grocery-list.css";

interface GroceryItem {
  id: number;
  item_name: string;
  quantity_value: number;
  quantity_unit: string;
  is_purchased: boolean;
}

interface GroceryItemInput {
  id?: number;
  item_name: string;
  quantity_value: number | null;
  quantity_unit: string;
}

interface GroceryListProps {
  userId: number;
  accessToken: string;
}

const GroceryList: React.FC<GroceryListProps> = ({ userId, accessToken }) => {
  const notify = useNotification();
  const [groceryItems, setGroceryItems] = useState<GroceryItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingItemId, setEditingItemId] = useState<number | null>(null);
  const [openMenuId, setOpenMenuId] = useState<number | null>(null);
  const [selectedItemIds, setSelectedItemIds] = useState<number[]>([]);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [formData, setFormData] = useState<GroceryItemInput>({
    item_name: "",
    quantity_value: null,
    quantity_unit: "pcs",
  });

  // Fetch grocery items
  const fetchGroceryItems = async () => {
    setIsLoading(true);
    try {
      const response = await fetch(
        `${API_ROUTES.GET_GROCERY_ITEMS}/${userId}`,
        {
          method: "GET",
          headers: {
            Authorization: `Bearer ${accessToken}`,
            "Content-Type": "application/json",
          },
        },
      );

      if (!response.ok) throw new Error("Failed to fetch grocery items");

      const data = await response.json();
      console.log("API Response:", data);

      // API returns items as an array
      const itemsData = Array.isArray(data.items) ? data.items : [];
      setGroceryItems(itemsData);
    } catch (err) {
      notify(
        err instanceof Error ? err.message : "An error occurred",
        NOTIFICATION_TYPES.ERROR
      );
      setGroceryItems([]);
    } finally {
      setIsLoading(false);
    }
  };

  // Add or update grocery item
  const handleAddOrUpdate = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.item_name.trim()) {
      notify(
        "Item name is required",
        NOTIFICATION_TYPES.ERROR
      );
      return;
    }

    try {
      const response = await fetch(`${API_ROUTES.ADD_UPDATE_GROCERY_ITEM}`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          user_id: userId,
          items: [
            {
              ...formData,
              quantity_value: formData.quantity_value ?? 0,
            },
          ],
        }),
      });

      if (!response.ok) throw new Error("Failed to save item");

      notify(
        editingItemId
          ? NOTIFICATION_MESSAGES.UPDATED
          : NOTIFICATION_MESSAGES.ADDED,
        editingItemId
          ? NOTIFICATION_TYPES.UPDATED
          : NOTIFICATION_TYPES.ADDED
      );
      setFormData({
        item_name: "",
        quantity_value: null,
        quantity_unit: "pcs",
      });
      setShowAddForm(false);
      setEditingItemId(null);
      fetchGroceryItems();
    } catch (err) {
      notify(
        err instanceof Error ? err.message : "An error occurred",
        NOTIFICATION_TYPES.ERROR
      );
    }
  };

  // Delete grocery item
  const handleDelete = async (itemId: number) => {
    if (!confirm("Are you sure you want to delete this item?")) return;

    try {
      const response = await fetch(`${API_ROUTES.DELETE_GROCERY_ITEM}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          grocery_item_ids: [itemId],
        }),
      });

      if (!response.ok) throw new Error("Failed to delete item");

      notify(
        NOTIFICATION_MESSAGES.DELETED,
        NOTIFICATION_TYPES.DELETED
      );
      fetchGroceryItems();
    } catch (err) {
      notify(
        err instanceof Error ? err.message : "An error occurred",
        NOTIFICATION_TYPES.ERROR
      );
    }
  };

  // Mark all items as purchased
  const handleMarkSelectedPurchased = async () => {
    if (selectedItemIds.length === 0) return;

    try {
      const results = await Promise.all(
        selectedItemIds.map((itemId) =>
          fetch(
            `${API_ROUTES.MARK_GROCERY_PURCHASED}/${itemId}/mark-purchased`,
            {
              method: "PATCH",
              headers: {
                Authorization: `Bearer ${accessToken}`,
                "Content-Type": "application/json",
              },
            },
          ),
        ),
      );

      if (results.some((response) => !response.ok)) {
        throw new Error("Failed to move items");
      }

      notify(
        NOTIFICATION_MESSAGES.ADDED,
        NOTIFICATION_TYPES.ADDED
      );
      fetchGroceryItems();
      setSelectedItemIds([]);
    } catch (err) {
      notify(
        err instanceof Error ? err.message : "An error occurred",
        NOTIFICATION_TYPES.ERROR
      );
    }
  };

  // Load items on mount
  useEffect(() => {
    fetchGroceryItems();
  }, [userId]);

  useEffect(() => {
    setSelectedItemIds((prev) =>
      prev.filter((id) => groceryItems.some((item) => item.id === id)),
    );
  }, [groceryItems]);

  const totalItems = groceryItems.length;
  const selectedCount = selectedItemIds.length;
  const allSelected = totalItems > 0 && selectedCount === totalItems;

  // Handle edit item click
  const handleEditItem = (item: GroceryItem) => {
    setFormData({
      id: item.id,
      item_name: item.item_name,
      quantity_value: item.quantity_value,
      quantity_unit: item.quantity_unit,
    });
    setEditingItemId(item.id);
    setShowAddForm(true);
  };

  const handleConfirmPurchase = async () => {
    setShowConfirmModal(false);
    await handleMarkSelectedPurchased();
  };

  return (
    <div className="grocery-list__container">
      {/* Header */}
      <div className="grocery-list__header">
        <h1 className="grocery-list__title">Grocery List</h1>
        <div className="grocery-list__badge">{totalItems}</div>
      </div>

      {/* Action Buttons */}
      <div className="grocery-list__actions">
        <Button
          variant="primary"
          className="grocery-list__btn"
          onClick={() => {
            setShowAddForm(!showAddForm);
            setEditingItemId(null);
          }}>
          <Plus size={BOTTOM_NAV_ICON_SIZE.NORMAL} />
          Add Item
        </Button>
        {totalItems > 0 && (
          <Button
            variant="primary"
            className="grocery-list__btn grocery-list__btn--success"
            onClick={() => setShowConfirmModal(true)}
            disabled={selectedCount === 0}
          >
            <Check size={BOTTOM_NAV_ICON_SIZE.NORMAL} />
            Add to Pantry
          </Button>
        )}
      </div>

      {/* Add/Edit Form */}
      {showAddForm && (
        <div className="grocery-list__form-container">
          <h3 className="grocery-list__form-title">
            {editingItemId ? "Edit Item" : "Add New Item"}
          </h3>
          <form onSubmit={handleAddOrUpdate} className="grocery-list__form">
            <div className="grocery-list__form-group">
              <label>Item Name *</label>
              <input
                type="text"
                placeholder="e.g., Milk, Bread..."
                value={formData.item_name}
                onChange={(e) =>
                  setFormData({ ...formData, item_name: e.target.value })
                }
                required
              />
            </div>

            <div className="grocery-list__form-row">
              <div className="grocery-list__form-group">
                <label>Quantity</label>
                <input
                  type="number"
                  placeholder="0"
                  value={formData.quantity_value ?? ""}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      quantity_value:
                        e.target.value === ""
                          ? null
                          : parseFloat(e.target.value),
                    })
                  }
                  onFocus={(e) => {
                    if (e.target.value === "0") {
                      setFormData({ ...formData, quantity_value: null });
                    }
                  }}
                />
              </div>

              <div className="grocery-list__form-group">
                <label>Unit</label>
                <select
                  value={formData.quantity_unit}
                  onChange={(e) =>
                    setFormData({ ...formData, quantity_unit: e.target.value })
                  }
                >
                  {/* <option value="piece">piece</option> */}
                  <option value="pcs">pcs</option>
                  <option value="kg">kg</option>
                  <option value="g">g</option>
                  <option value="l">l</option>
                  <option value="ml">ml</option>
                  <option value="tbsp">tbsp</option>
                  <option value="tsp">tsp</option>
                  <option value="box">box</option>
                  <option value="bottle">bottle</option>
                  <option value="can">can</option>
                  <option value="jar">jar</option>
                </select>
              </div>
            </div>

            <div className="grocery-list__form-actions">
              <Button
                variant="primary"
                type="submit"
                className="grocery-list__btn grocery-list__btn--submit">
                {editingItemId ? "Update" : "Add"}
              </Button>
              <Button
                variant="secondary"
                className="grocery-list__btn grocery-list__btn--cancel"
                onClick={() => {
                  setShowAddForm(false);
                  setEditingItemId(null);
                  setFormData({
                    item_name: "",
                    quantity_value: null,
                    quantity_unit: "pcs",
                  });
                }}>
                Cancel
              </Button>
            </div>
          </form>
        </div>
      )}

      {/* Items List */}
      {isLoading ? (
        <div className="grocery-list__loading">Loading...</div>
      ) : totalItems === 0 ? (
        <div className="grocery-list__empty">
          <p>Your grocery list is empty</p>
          <small>Add items to get started</small>
        </div>
      ) : (
        <div className="grocery-list__items">
          <div className="grocery-list__select-all">
            <label className="grocery-list__select-all-label">
              <input
                type="checkbox"
                checked={allSelected}
                onChange={(e) =>
                  setSelectedItemIds(
                    e.target.checked ? groceryItems.map((item) => item.id) : [],
                  )
                }
                title="Select all items"
              />
              Select all
            </label>
          </div>
          {groceryItems.map((item) => (
            <div key={item.id} className="grocery-list__item">
              <div className="grocery-list__item-checkbox">
                <input
                  type="checkbox"
                  checked={selectedItemIds.includes(item.id)}
                  onChange={() =>
                    setSelectedItemIds((prev) =>
                      prev.includes(item.id)
                        ? prev.filter((id) => id !== item.id)
                        : [...prev, item.id],
                    )
                  }
                  title="Select item"
                />
              </div>

              <div className="grocery-list__item-info">
                <div className="grocery-list__item-name">{item.item_name}</div>
                <div className="grocery-list__item-quantity">
                  {item.quantity_value} {item.quantity_unit}
                </div>
              </div>

              <div className="grocery-list__item-menu">
                <button
                  className="grocery-list__menu-btn"
                  onClick={() =>
                    setOpenMenuId(openMenuId === item.id ? null : item.id)
                  }
                  title="Options"
                >
                  <MoreVertical size={20} />
                </button>

                {openMenuId === item.id && (
                  <div className="grocery-list__menu-dropdown">
                    <button
                      className="grocery-list__menu-item"
                      onClick={() => {
                        handleEditItem(item);
                        setOpenMenuId(null);
                      }}
                    >
                      Edit
                    </button>
                    <button
                      className="grocery-list__menu-item"
                      onClick={() => {
                        handleDelete(item.id);
                        setOpenMenuId(null);
                      }}
                    >
                      Delete
                    </button>
                    <button
                      className="grocery-list__menu-item grocery-list__menu-item--cancel"
                      onClick={() => setOpenMenuId(null)}
                    >
                      Cancel
                    </button>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {showConfirmModal && (
        <ConfirmModal
          text={
            "Bought selected grocery items? These items will now be added to your virtual pantry."
          }
          confirmLabel="Yes"
          cancelLabel="No"
          onConfirm={handleConfirmPurchase}
          onCancel={() => setShowConfirmModal(false)}
        />
      )}
    </div>
  );
};

export { GroceryList };
export type { GroceryItem, GroceryItemInput };

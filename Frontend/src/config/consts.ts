import { Check, Pencil, Trash2, Heart, HeartOff } from "lucide-react";

// Backend API base URL
export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "";

// Backend route endpoints
export const API_ROUTES = {
  REFRESH_TOKEN: `${API_BASE_URL}/auth/refresh`,
  UPLOAD_RECEIPT: `${API_BASE_URL}/upload-receipt`,
  VERIFY_GOOGLE: `${API_BASE_URL}/auth/google`,
  GET_PANTRY: `${API_BASE_URL}/pantry_items`,
  ADD_UPDATE_PANTRY_ITEM: `${API_BASE_URL}/add_update_pantry_items`,
  DELETE_PANTRY_ITEMS: `${API_BASE_URL}/pantry_items/delete`,
  GET_PANTRY_RECOMMENDATIONS: `${API_BASE_URL}/recommendations/pantry`, // Caller will append `user_id`
  GET_RECIPE_BY_ID: `${API_BASE_URL}/recipes`,
  // TOGGLE_LIKE_RECIPE: (recipeId: number) => `${API_BASE_URL}/recipes/${recipeId}/like`,
  TOGGLE_LIKE_RECIPE: `${API_BASE_URL}/recipes/:recipeId/like`,
  GET_LIKED_RECIPES: `${API_BASE_URL}/users/current/liked-recipes`,
  LOGOUT_GOOGLE: `${API_BASE_URL}/auth/google/logout`,
  DELETE_USER: `${API_BASE_URL}/delete_user`,
  GET_USER_ALLERGENS: `${API_BASE_URL}/user/get-allergens`,
  POST_USER_ALLERGENS: `${API_BASE_URL}/user/post-allergens`,
  GET_GROCERY_ITEMS: `${API_BASE_URL}/grocery_items`,
  ADD_UPDATE_GROCERY_ITEM: `${API_BASE_URL}/add_update_grocery_items`,
  DELETE_GROCERY_ITEM: `${API_BASE_URL}/grocery_items/delete`,
  MARK_GROCERY_PURCHASED: `${API_BASE_URL}/grocery_items`,
  MARK_ALL_GROCERY_PURCHASED: `${API_BASE_URL}/grocery_items/mark-all-purchased`,
};

// Google OAuth related constants
export const GOOGLE_CONSTS = {
  GOOGLE_IMAGE_URL: "https://developers.google.com/identity/images/g-logo.png",
  GOOGLE_TEXT: "Continue with Google",
  GOOGLE_ALT_TEXT: "Google logo",
  GOOGLE_ICON_SIZE: 18,
};

export const SEARCH = "Search recommended recipes";
export const LANDING_PAGE = {
  STOCKD: "Stockd",
  WELCOME_TEXT: "Let's join our community to cook better food!",
};

export const TOP_NAV_BAR = {
  CATEGORY: "Category",
};

export const BOTTOM_NAV_ICON_SIZE = {
  NORMAL: 22,
  LARGE: 26,
};

/* Update for pantry add/edit/delete */
export const NOTIFICATION_MESSAGES = {
  ADDED: "Pantry item has been added!",
  UPDATED: "Pantry item has been updated!",
  DELETED: "Pantry item has been deleted!",
  LIKED: "Recipe added to liked",
  UNLIKED: "Recipe removed from liked",
} as const;

export const NOTIFICATION_TYPES = {
  ADDED: "added",
  UPDATED: "updated",
  DELETED: "deleted",
  LIKED: "liked",
  UNLIKED: "unliked",
} as const;

export type NotificationType =
  (typeof NOTIFICATION_TYPES)[keyof typeof NOTIFICATION_TYPES];

export const NOTIFICATION_ICONS = {
  added: Check,
  updated: Pencil,
  deleted: Trash2,
  liked: Heart,
  unliked: HeartOff,
} as const;

export const NOTIFICATION_UI = {
  ICON_SIZE: 18,
  ICON_STROKE_WIDTH: 2,
};

export const NOTIFICATION_TIMEOUTS = {
  AUTO_REMOVE_MS: 1500,
  EXIT_ANIMATION_MS: 300,
};

export const CONFIRM_MODAL = {
  YES: "Yes",
  NO: "No",
};

export const CONFIRM_LOGOUT_TEXT = "Are you sure you want to log out?";

export const CONFIRM_DELETE_TEXT = "Are you sure you want to delete your account? This action cannot be undone.";
export const CONFIRM_DELETE_PANTRY_ITEM = "Are you sure you want to delete this item?";

export const TIME_RANGES = [
  { label: "All", value: null },
  { label: "Under 15 mins", value: { min: null, max: 15 } },
  { label: "15–30 mins", value: { min: 15, max: 30 } },
  { label: "30–60 mins", value: { min: 30, max: 60 } },
];

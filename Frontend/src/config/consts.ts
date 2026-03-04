import { Check, Pencil, Trash2, Heart, HeartOff, CircleCheckBig, CircleAlert } from "lucide-react";

// Common Allergens Icons (Separation for readability)
import {
  Wheat,
  Milk,
  Fish,
  Egg,
  Nut,
  Bean,
  Leaf,
  Shell,
  AlertTriangle,
} from "lucide-react";

// Backend API base URL
export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "";

// Backend route endpoints
export const API_ROUTES = {
  REFRESH_TOKEN: `${API_BASE_URL}/auth/refresh`,
  UPLOAD_RECEIPT: `${API_BASE_URL}/upload-receipt`,
  CONFIRM_RECEIPT_ITEMS: `${API_BASE_URL}/confirm-receipt-items`,
  VERIFY_GOOGLE: `${API_BASE_URL}/auth/google`,
  GET_PANTRY: `${API_BASE_URL}/pantry_items`,
  ADD_UPDATE_PANTRY_ITEM: `${API_BASE_URL}/add_update_pantry_items`,
  DELETE_PANTRY_ITEMS: `${API_BASE_URL}/pantry_items/delete`,
  GET_SUBSET_PANTRY_RECIPES: `${API_BASE_URL}/recommendations/subset`,  // Caller will append `user_id`
  GET_INCOMPLETE_PANTRY_RECIPES: `${API_BASE_URL}/recommendations/pantry`,   // Caller will append `user_id`
  GET_RECOMMEND_LIKED_RECIPES: `${API_BASE_URL}/recommendations/liked-categories`,   // Caller will append `user_id`
  GET_COLLABORATIVE_RECIPES: `${API_BASE_URL}/recommendations/collaborative`, // Caller will append `user_id`
  GET_RECIPE_BY_ID: `${API_BASE_URL}/recipes`,
  TOGGLE_LIKE_RECIPE: `${API_BASE_URL}/recipes/:recipeId/like`,
  GET_LIKED_RECIPES: `${API_BASE_URL}/users/current/liked-recipes`,
  COMPLETE_RECIPE: `${API_BASE_URL}/recipes/:recipeId/complete`,
  LOGOUT_GOOGLE: `${API_BASE_URL}/auth/google/logout`,
  DELETE_USER: `${API_BASE_URL}/delete_user`,
  GET_USER_ALLERGENS: `${API_BASE_URL}/user/get-allergens`,
  POST_USER_ALLERGENS: `${API_BASE_URL}/user/post-allergens`,
  GET_GROCERY_ITEMS: `${API_BASE_URL}/grocery_items`,
  ADD_UPDATE_GROCERY_ITEM: `${API_BASE_URL}/add_update_grocery_items`,
  DELETE_GROCERY_ITEM: `${API_BASE_URL}/grocery_items/delete`,
  MARK_GROCERY_PURCHASED: `${API_BASE_URL}/grocery_items`,
  MARK_ALL_GROCERY_PURCHASED: `${API_BASE_URL}/grocery_items/mark-all-purchased`,
  SEARCH_RECIPES: `${API_BASE_URL}/recipes/search`,
};

// Google OAuth related constants
export const GOOGLE_CONSTS = {
  GOOGLE_IMAGE_URL: "https://developers.google.com/identity/images/g-logo.png",
  GOOGLE_TEXT: "Continue with Google",
  GOOGLE_ALT_TEXT: "Google logo",
  GOOGLE_ICON_SIZE: 18,
};

export const SEARCH = "Search any recipe";
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
  RECIPE_COMPLETED: "Recipe completed! Pantry has been updated.",
  ERROR: "Failed to complete recipe. Please try again.",
} as const;

export const NOTIFICATION_TYPES = {
  ADDED: "added",
  UPDATED: "updated",
  DELETED: "deleted",
  LIKED: "liked",
  UNLIKED: "unliked",
  RECIPE_COMPLETED: "recipe_completed",
  ERROR: "error",
} as const;

export type NotificationType =
  (typeof NOTIFICATION_TYPES)[keyof typeof NOTIFICATION_TYPES];

export const NOTIFICATION_ICONS = {
  added: Check,
  updated: Pencil,
  deleted: Trash2,
  liked: Heart,
  unliked: HeartOff,
  recipe_completed: CircleCheckBig,
  error: CircleAlert,
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

export const COMMON_ALLERGENS = [
  { label: "Celery", value: "celery", icon: Leaf },
  { label: "Crustacean", value: "crustacean", icon: Shell },
  { label: "Egg", value: "egg", icon: Egg },
  { label: "Fish & Seafood", value: "fish, sea food", icon: Fish },
  { label: "Gluten", value: "gluten", icon: Wheat },
  { label: "Lupine", value: "lupine", icon: Bean },
  { label: "Milk", value: "milk", icon: Milk },
  { label: "Mustard", value: "mustard", icon: AlertTriangle },
  { label: "Peanut", value: "peanut", icon: Nut },
  { label: "Sesame", value: "sesame", icon: Bean },
  { label: "Soy", value: "soy", icon: Bean },
  { label: "Tree Nut", value: "tree-nut", icon: Nut },
] as const;

 export const GetNutritionItems = (recipe: any) => [
  { label: "Calories", value: recipe.Calories, unit: "kcal",icon:"https://cdn-icons-png.flaticon.com/512/17394/17394076.png" },
  { label: "Fat", value: recipe.FatContent, unit: "g",icon:"https://cdn-icons-png.flaticon.com/512/8131/8131971.png" },
  { label: "Saturated Fat", value: recipe.SaturatedFatContent, unit: "g",icon:"https://cdn-icons-png.flaticon.com/512/17972/17972269.png" },
  { label: "Cholesterol", value: recipe.CholesterolContent, unit: "mg",icon:"https://cdn-icons-png.flaticon.com/512/9957/9957003.png" },
  { label: "Sodium", value: recipe.SodiumContent, unit: "mg",icon:"https://cdn-icons-png.flaticon.com/512/9757/9757208.png" },
  { label: "Carbohydrates", value: recipe.CarbohydrateContent, unit: "g",icon:"https://cdn-icons-png.flaticon.com/512/11827/11827758.png" },
  { label: "Sugar", value: recipe.SugarContent, unit: "g",icon:"https://cdn-icons-png.flaticon.com/512/5835/5835935.png" },
  { label: "Protein", value: recipe.ProteinContent, unit: "g",icon:"https://cdn-icons-png.flaticon.com/512/3024/3024310.png" },
  { label: "Fiber", value: recipe.FiberContent, unit: "g",icon:"https://cdn-icons-png.flaticon.com/512/18433/18433150.png" },
];
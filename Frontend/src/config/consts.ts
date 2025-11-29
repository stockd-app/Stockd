import { Check, Pencil, Trash2 } from "lucide-react";

// Backend API base URL
export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "";

// Backend route endpoints
export const API_ROUTES = {
  UPLOAD_RECEIPT: `${API_BASE_URL}/upload-receipt`,
  VERIFY_GOOGLE: `${API_BASE_URL}/auth/google`,
  //Pantry route *
  GET_PANTRY: `${API_BASE_URL}/pantry`,
};

// Google OAuth related constants
export const GOOGLE_CONSTS = {
  GOOGLE_IMAGE_URL: "https://developers.google.com/identity/images/g-logo.png",
  GOOGLE_TEXT: "Continue with Google",
  GOOGLE_ALT_TEXT: "Google logo",
  GOOGLE_ICON_SIZE: 18,
}

export const SEARCH = "Search";
export const LANDING_PAGE = {
  STOCKD: "Stockd",
  WELCOME_TEXT: "Let's join our community to cook better food!",
}

export const TOP_NAV_BAR = {
  CATEGORY: "Category",
}

export const BOTTOM_NAV_ICON_SIZE = {
  NORMAL: 22,
  LARGE: 26,
}

export const DASHBOARD = {
  TABS: ["Discover", "Recommend", "Saved"] as const,
  DISCOVER: "Discover",
  RECOMMEND: "Recommend",
  SAVED: "Saved",
  SAVED_PLACEHOLDER: "No saved items yet.",
  RECOMMEND_PLACEHOLDER: "Recommended items will appear here.",
  DISCOVER_PLACEHOLDER: "No items to display.",
}

export const NOTIFICATION_MESSAGES = {
  ADDED: "Food has been added",
  UPDATED: "Food has been updated",
  DELETED: "Food has been deleted",
} as const;

export const NOTIFICATION_TYPES = {
  ADDED: "added",
  UPDATED: "updated",
  DELETED: "deleted",
} as const;

export type NotificationType = typeof NOTIFICATION_TYPES[keyof typeof NOTIFICATION_TYPES];

export const NOTIFICATION_ICONS = {
  added: Check,
  updated: Pencil,
  deleted: Trash2,
} as const;

export const NOTIFICATION_UI = {
  ICON_SIZE: 18,
  ICON_STROKE_WIDTH: 2,
}

export const NOTIFICATION_TIMEOUTS = {
  AUTO_REMOVE_MS: 1500,
  EXIT_ANIMATION_MS: 300,
};
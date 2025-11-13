// Backend API base URL
export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "";

// Backend route endpoints
export const API_ROUTES = {
  UPLOAD_RECEIPT: `${API_BASE_URL}/upload-receipt`,
  VERIFY_GOOGLE: `${API_BASE_URL}/auth/google`,
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
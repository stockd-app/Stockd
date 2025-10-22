// Backend API base URL
export const API_BASE_URL = "http://127.0.0.1:8000";

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
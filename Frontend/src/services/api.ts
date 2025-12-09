import axios from "axios";
import { API_ROUTES } from "../config/consts";

/**
 * Upload a receipt image file to Backend for OCR processing.
 * @param file
 * @returns
 */
export const uploadReceipt = async (file: File) => {
  const idToken = localStorage.getItem("google_id_token");
  
  if (!idToken) {
    throw new Error("Not authenticated. Please log in again.");
  }

  const formData = new FormData();
  formData.append("file", file);

  try {
    const response = await axios.post(API_ROUTES.UPLOAD_RECEIPT, formData, {
      headers: {
        "Content-Type": "multipart/form-data",
        Authorization: `Bearer ${idToken}`,
      },
    });

    return response.data;
  } catch (error: any) {
    if (error.response?.status === 401) {
      // Token expired or invalid
      localStorage.clear();
      throw new Error("Session expired. Please log in again.");
    }
    throw error;
  }
};

/**
 * Get pantry items for a user
 * @param userId
 * @returns
 */
export const getPantryItems = async (userId: number) => {
  const idToken = localStorage.getItem("google_id_token");

  const response = await axios.get(`${API_ROUTES.GET_PANTRY}/${userId}`, {
    headers: {
      Authorization: `Bearer ${idToken}`,
    },
  });

  return response.data;
};

/**
 * Handles Google login using the authorization code
 * @params authCode
 * @returns
 */
export const loginWithGoogle = async (authCode: string) => {
  try {
    // Send the authorization code to FastAPI backend for token exchange
    const res = await axios.post(API_ROUTES.VERIFY_GOOGLE, {
      token: authCode,
    });

    // Save user info
    localStorage.setItem("user", JSON.stringify(res.data.user));

    // Save Google Tokens (Crucial for Logout)
    localStorage.setItem("google_id_token", res.data.id_token);
    localStorage.setItem("google_access_token", res.data.access_token);

    return { success: true, data: res.data };
  } catch (err: any) {
    console.error("Google login failed:", err);

    return {
      success: false,
      status: err?.response?.status || 500,
    };
  }
};

/**
 * Fetch recipe recommendations based on the user's pantry
 * @param userId 
 * @param topN 
 * @returns
 */
export const getPantryRecommendations = async (userId: number, topN: number = 10) => {
  try {
    const url = `${API_ROUTES.GET_PANTRY_RECOMMENDATIONS}/${userId}?top_n=${topN}`;

    const res = await axios.get(url);

    return res.data;
  } catch (err: any) {
    console.error("Failed to fetch pantry recommendations:", err);
    throw err;
  }
};


/**
 * Logout from Google Account'
 * @returns
 */
export const handleLogout = async () => {
  try {
    const idToken = localStorage.getItem("google_id_token");
    const accessToken = localStorage.getItem("google_access_token");

    if (!idToken || !accessToken) {
      console.error("Missing Google tokens in localStorage");
      return;
    }

    const res = await fetch(API_ROUTES.LOGOUT_GOOGLE, {
      method: "POST",
      credentials: "include",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${idToken}`,
      },
      body: JSON.stringify({
        access_token: accessToken,
      }),
    });

    if (res.ok) {
      localStorage.clear();
      window.location.href = "/";
    } else {
      const error = await res.json();
      console.error("Logout failed:", error);
    }
  } catch (error) {
    console.error("Logout error:", error);
  }
};

/**
 * Delete User Account
 * @param userId
 * @returns
 */
export const deleteUserAccount = async (userId: number) => {
  try {
    const idToken = localStorage.getItem("google_id_token");

    const res = await fetch(`${API_ROUTES.DELETE_USER}/${userId}`, {
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${idToken}`,
        "Content-Type": "application/json",
      },
      credentials: "include",
    });

    if (!res.ok) {
      const err = await res.json();
      console.error("Delete user failed:", err);
      return false;
    }

    return true;
  } catch (err) {
    console.error("Delete user error:", err);
    return false;
  }
};

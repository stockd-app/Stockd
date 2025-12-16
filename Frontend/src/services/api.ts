import axios from "axios";
import { API_ROUTES } from "../config/consts";

/**
 * Refresh the Google access token using the refresh token stored in localStorage
 * @returns Returns true if the refresh was successful
 */
const refreshAccessToken = async () => {
  const refreshToken = localStorage.getItem("google_refresh_token");

  if (!refreshToken) {
    localStorage.clear();
    window.location.href = "/";
    throw new Error("No refresh token found. Please log in again.");
  }

  try {
    const response = await axios.post(API_ROUTES.REFRESH_TOKEN, { refresh_token: refreshToken });

    if (response.data?.access_token) {
      localStorage.setItem("google_id_token", response.data.id_token);
      localStorage.setItem("google_access_token", response.data.access_token);
      return true;
    } else {
      console.error("Token refresh failed. No access token returned.");
      return false;
    }
  } catch (error) {
    localStorage.clear();
    window.location.href = "/";
    console.error("Token refresh failed:", error);
    return false;
  }
};

/**
 * Upload a receipt image file to Backend for OCR processing.
 * @param file
 * @returns
 */
export const uploadReceipt = async (file: File) => {
  let idToken = localStorage.getItem("google_id_token");

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
      // Attempt to refresh the token
      const refreshed = await refreshAccessToken();
      if (refreshed) {
        idToken = localStorage.getItem("google_id_token");
        const retryResponse = await axios.post(API_ROUTES.UPLOAD_RECEIPT, formData, {
          headers: {
            "Content-Type": "multipart/form-data",
            Authorization: `Bearer ${idToken}`,
          },
        });
        return retryResponse.data;
      } else {
        // If refresh fails, log the user out
        localStorage.clear();
        window.location.href = "/";
        throw new Error("Session expired. Please log in again.");
      }
    } else {
      throw error;
    }
  }
};

/**
 * Get pantry items for a user
 * @param userId
 * @returns
 */
export const getPantryItems = async (userId: number) => {
  let idToken = localStorage.getItem("google_id_token");

  try {
    const response = await axios.get(`${API_ROUTES.GET_PANTRY}/${userId}`, {
      headers: {
        Authorization: `Bearer ${idToken}`,
      },
    });
    console.log("API getPantryItems response:", response);
    return response.data;
  } catch (error: any) {
    if (error.response?.status === 401) {
      // Token expired or invalid
      // Attempt to refresh the token
      const refreshed = await refreshAccessToken();
      if (refreshed) {
        idToken = localStorage.getItem("google_id_token");
        const retryResponse = await axios.get(`${API_ROUTES.GET_PANTRY}/${userId}`, {
          headers: {
            Authorization: `Bearer ${idToken}`,
          },
        });
        return retryResponse.data;
      } else {
        // If refresh fails, log the user out
        localStorage.clear();
        window.location.href = "/";
        throw new Error("Session expired. Please log in again.");
      }
    } else {
      throw error;
    }
  }
};


/**
 * Add or Update a pantry item for a user
 * @param userId 
 * @param itemData 
 * @returns 
 */
export const addOrUpdatePantryItem = async (userId: number, items: any) => {
  let idToken = localStorage.getItem("google_id_token");

  try {
    const response = await axios.post(API_ROUTES.ADD_UPDATE_PANTRY_ITEM, {
      user_id: userId,
      items,
    }, {
      headers: {
        Authorization: `Bearer ${idToken}`,
      },
    });
    return response.data;
  } catch (error: any) {
    if (error.response?.status === 401) {
      // Token expired or invalid
      // Attempt to refresh the token
      const refreshed = await refreshAccessToken();
      if (refreshed) {
        idToken = localStorage.getItem("google_id_token");
        const retryResponse = await axios.post(API_ROUTES.ADD_UPDATE_PANTRY_ITEM, {
          user_id: userId,
          items,
        }, {
          headers: {
            Authorization: `Bearer ${idToken}`,
          },
        });
        return retryResponse.data;
      } else {
        // If refresh fails, log the user out
        localStorage.clear();
        window.location.href = "/";
        throw new Error("Session expired. Please log in again.");
      }
    } else {
      throw error;
    }
  }
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
    localStorage.setItem("google_refresh_token", res.data.refresh_token);

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
    let idToken = localStorage.getItem("google_id_token");
    const accessToken = localStorage.getItem("google_access_token");

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
    localStorage.clear();
    window.location.href = "/";
      console.error("Logout failed:", error);
    }
  } catch (error: any) {
    console.error("Logout failed:", error);
    localStorage.clear();
    window.location.href = "/";
    throw new Error("Session expired. Please log in again.");
  }
}

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
  } catch (error: any) {
    if (error.response?.status === 401) {
      // Token expired or invalid
      // Attempt to refresh the token
      const refreshed = await refreshAccessToken();
      if (refreshed) {
        let idToken = localStorage.getItem("google_id_token");
        const retryResponse = await fetch(`${API_ROUTES.DELETE_USER}/${userId}`, {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${idToken}`,
            "Content-Type": "application/json",
          },
          credentials: "include",
        });

        if (!retryResponse.ok) {
          const retryErr = await retryResponse.json();
          console.error("Retry delete failed:", retryErr);
          return false;
        }
        return true;
      } else {
        // If refresh fails, log the user out
        localStorage.clear();
        window.location.href = "/";
        throw new Error("Session expired. Please log in again.");
      }
    }
  }
};

import axios from "axios";
import { API_ROUTES } from "../config/consts";

/**
 * Refresh the Google access token using the refresh token stored in localStorage
 * @returns Returns true if the refresh was successful
 */
const refreshToken = async () => {
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
export const uploadReceipt = async (files: File[]) => {
  let idToken = localStorage.getItem("google_id_token");

  if (!idToken) {
    throw new Error("Not authenticated. Please log in again.");
  }

  const formData = new FormData();
  files.forEach((file) => {
    formData.append("files", file); // MUST match backend param name
  });

  try {
    const response = await axios.post(API_ROUTES.UPLOAD_RECEIPT, formData, {
      headers: {
        Authorization: `Bearer ${idToken}`,
      },
    });

    return response.data;
  } catch (error: any) {
    if (error.response?.status === 401) {
      // Token expired or invalid
      // Attempt to refresh the token
      const refreshed = await refreshToken();
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
 * Send the confirmed receipt items to Backend to be stored in the database and update user's pantry
 * @param items 
 * @returns 
 */
export const confirmReceiptItems = async (items: any[]) => {
  let idToken = localStorage.getItem("google_id_token");

  const res = await axios.post(
    API_ROUTES.CONFIRM_RECEIPT_ITEMS,
    items,
    {
      headers: {
        Authorization: `Bearer ${idToken}`,
      },
    }
  );

  return res.data;
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
      const refreshed = await refreshToken();
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
      const refreshed = await refreshToken();
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
 * Delete pantry items by their IDs
 * @param itemIds 
 * @returns 
 */
export const deletePantryItems = async (itemIds: number[]) => {
  let idToken = localStorage.getItem("google_id_token");

  try {
    const res = await axios.delete(API_ROUTES.DELETE_PANTRY_ITEMS, {
      headers: {
        Authorization: `Bearer ${idToken}`,
      },
      data: {
        pantry_item_ids: itemIds,
      },
    });

    return res.data;
  } catch (error: any) {
    if (error.response?.status === 401) {
      const refreshed = await refreshToken();
      if (refreshed) {
        idToken = localStorage.getItem("google_id_token");
        const retry = await axios.delete(API_ROUTES.DELETE_PANTRY_ITEMS, {
          headers: {
            Authorization: `Bearer ${idToken}`,
          },
          data: {
            pantry_item_ids: itemIds,
          },
        });
        return retry.data;
      }
      throw error;
    }
    throw error;
  }
};



/**
 * Get single recipe by recipe ID
 * @param recipeId
 * @returns
 */
export const getRecipeById = async (recipeId: number) => {
  let idToken = localStorage.getItem("google_id_token");

  try {
    const res = await axios.get(`${API_ROUTES.GET_RECIPE_BY_ID}/${recipeId}`, {
      headers: {
        Authorization: `Bearer ${idToken}`,
      },
    });

    return res.data;
  } catch (error: any) {
    if (error.response?.status === 401) {
      const refreshed = await refreshToken();
      if (refreshed) {
        idToken = localStorage.getItem("google_id_token");
        const retryRes = await axios.get(
          `${API_ROUTES.GET_RECIPE_BY_ID}/${recipeId}`,
          {
            headers: {
              Authorization: `Bearer ${idToken}`,
            },
          }
        );
        return retryRes.data;
      } else {
        localStorage.clear();
        window.location.href = "/";
        throw new Error("Session expired. Please log in again.");
      }
    }
    throw error;
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
 * Fetch subset recipes based on the user's pantry
 * Recipes WILL NOT contain missing ingredients
 * @param userId 
 * @param topN 
 */
export const getSubsetRecipes = async (userId: number, topN: number = 10) => {
  try {
    const url = `${API_ROUTES.GET_SUBSET_PANTRY_RECIPES}/${userId}?top_n=${topN}`;

    const res = await axios.get(url);

    return res.data;
  } catch (err: any) {
    console.error("Failed to fetch cookable pantry recipes: ", err);
    throw err;
  }
}

/**
 * Fetch incomplete ingredient recipe based on the user's pantry
 * Recipes MAY contain missing ingredients
 * @param userId 
 * @param topN 
 * @returns
 */
export const getIncompleteRecipes = async (userId: number, topN: number = 10) => {
  try {
    const url = `${API_ROUTES.GET_INCOMPLETE_PANTRY_RECIPES}/${userId}?top_n=${topN}`;

    const res = await axios.get(url);

    return res.data;
  } catch (err: any) {
    console.error("Failed to fetch pantry recommendations:", err);
    throw err;
  }
};

/**
 * Fetch recipe recommendation based on user's liked recipes
 * @param userId 
 * @param topN 
 * @returns
 */
export const getRecommendLikeRecipes = async (userId: number, topN: number = 10) => {
  try {
    const url = `${API_ROUTES.GET_RECOMMEND_LIKED_RECIPES}/${userId}?top_n=${topN}`;

    const res = await axios.get(url);

    return res.data;
  } catch (err: any) {
    console.error("Failed to fetch liked recipes recommendations:", err);
    throw err;
  }
};


export const getCollaborativeRecipes = async (userId: number, topN: number = 10) => {
  try {
    const url = `${API_ROUTES.GET_COLLABORATIVE_RECIPES}/${userId}?top_n=${topN}`;

    const res = await axios.get(url);

    return res.data;
  } catch (err: any) {
    console.error("Failed to fetch collaborative recipes recommendations:", err);
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
      const refreshed = await refreshToken();
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

/**
 * Get user's allergens
 */
export const getUserAllergens = async () => {
  let idToken = localStorage.getItem("google_id_token");

  try {
    const res = await axios.get(API_ROUTES.GET_USER_ALLERGENS, {
      headers: {
        Authorization: `Bearer ${idToken}`,
      },
    });
    return res.data;
  } catch (error: any) {
    if (error.response?.status === 401) {
      const refreshed = await refreshToken();
      if (refreshed) {
        idToken = localStorage.getItem("google_id_token");
        const retry = await axios.get(API_ROUTES.GET_USER_ALLERGENS, {
          headers: { Authorization: `Bearer ${idToken}` },
        });
        return retry.data;
      }
    }
    throw error;
  }
};

/**
 * Update user's allergens
 */
export const updateUserAllergens = async (allergens: string[]) => {
  let idToken = localStorage.getItem("google_id_token");

  try {
    const res = await axios.post(
      API_ROUTES.POST_USER_ALLERGENS,
      { allergens },
      {
        headers: {
          Authorization: `Bearer ${idToken}`,
        },
      }
    );
    return res.data;
  } catch (error: any) {
    if (error.response?.status === 401) {
      const refreshed = await refreshToken();
      if (refreshed) {
        idToken = localStorage.getItem("google_id_token");
        const retry = await axios.post(
          API_ROUTES.POST_USER_ALLERGENS,
          { allergens },
          {
            headers: { Authorization: `Bearer ${idToken}` },
          }
        );
        return retry.data;
      }
    }
    throw error;
  }
};

/**
 * Toggle like / unlike a recipe
 * @param recipeId
 */
export const toggleLikeRecipe = async (recipeId: number) => {
  let idToken = localStorage.getItem("google_id_token");

  try {
    console.log(API_ROUTES.TOGGLE_LIKE_RECIPE.replace(":recipeId", String(recipeId)))
    console.log("Toggling like for recipe ID:", recipeId)
    const res = await axios.post(
      API_ROUTES.TOGGLE_LIKE_RECIPE.replace(":recipeId", String(recipeId)),
      {},
      {
        headers: {
          Authorization: `Bearer ${idToken}`,
        },
      }
    );
    return res.data;
  } catch (error: any) {
    if (error.response?.status === 401) {
      const refreshed = await refreshToken();
      if (refreshed) {
        idToken = localStorage.getItem("google_id_token");
        const retryRes = await axios.post(
          // API_ROUTES.TOGGLE_LIKE_RECIPE(recipeId),
          API_ROUTES.TOGGLE_LIKE_RECIPE.replace(":recipeId", String(recipeId)),
          {},
          {
            headers: {
              Authorization: `Bearer ${idToken}`,
            },
          }
        );
        return retryRes.data;
      } else {
        localStorage.clear();
        window.location.href = "/";
        throw new Error("Session expired. Please log in again.");
      }
    }
    throw error;
  }
};

/**
 * Get current user's liked recipes
 * @returns
 */
export const getLikedRecipes = async () => {
  let idToken = localStorage.getItem("google_id_token");

  try {
    const res = await axios.get(API_ROUTES.GET_LIKED_RECIPES, {
      headers: {
        Authorization: `Bearer ${idToken}`,
      },
    });

    return res.data;
  } catch (error: any) {
    if (error.response?.status === 401) {
      const refreshed = await refreshToken();
      if (refreshed) {
        idToken = localStorage.getItem("google_id_token");

        const retryRes = await axios.get(API_ROUTES.GET_LIKED_RECIPES, {
          headers: {
            Authorization: `Bearer ${idToken}`,
          },
        });

        return retryRes.data;
      } else {
        localStorage.clear();
        window.location.href = "/";
        throw new Error("Session expired. Please log in again.");
      }
    }
    throw error;
  }
};

/**
 * Complete a recipe and update pantry items
 */
export const completeRecipe = async (recipeId: number) => {
  let idToken = localStorage.getItem("google_id_token");

  try {
    const res = await axios.post(
      API_ROUTES.COMPLETE_RECIPE.replace(":recipeId", String(recipeId)),
      {},
      {
        headers: {
          Authorization: `Bearer ${idToken}`,
        },
      }
    );

    return res.data;
  } catch (error: any) {
    if (error.response?.status === 401) {
      const refreshed = await refreshToken();
      if (refreshed) {
        idToken = localStorage.getItem("google_id_token");

        const retryRes = await axios.post(
          API_ROUTES.COMPLETE_RECIPE.replace(":recipeId", String(recipeId)),
          {},
          {
            headers: {
              Authorization: `Bearer ${idToken}`,
            },
          }
        );

        return retryRes.data;
      } else {
        localStorage.clear();
        window.location.href = "/";
        throw new Error("Session expired. Please log in again.");
      }
    }

    throw error;
  }
};

/**
 * Search recipes by name substring
 * @param query
 * @param limit
 */
export const searchRecipes = async (query: string, limit: number = 20) => {
  if (!query.trim()) return [];

  try {
    const url = `${API_ROUTES.SEARCH_RECIPES}?query=${encodeURIComponent(query)}&limit=${limit}`;
    
    const idToken = localStorage.getItem("google_id_token");

    const res = await axios.get(url, {
      headers: {
        Authorization: idToken ? `Bearer ${idToken}` : undefined,
      },
    });

    return res.data.content_based ?? res.data.results ?? [];
  } catch (err: any) {
    console.error("Error searching recipes:", err);
    return [];
  }
};
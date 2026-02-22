import React, { useEffect, useState } from "react";
import { Routes, Route, Navigate, useLocation } from "react-router-dom";
import LandingPage from "./pages/LandingPage/LandingPage";
import Dashboard from "./pages/Dashboard/Dashboard";
import Profile from "./pages/Profile/Profile";
import TermsPage from "./pages/TermsAndCondition/TermsPage";
import FullTermsPage from "./pages/TermsAndCondition/FullTermsPage";
import GoogleErrorScreen from "./pages/GoogleErrorHandling/GoogleErrorScreen";
import PantryPage from "./pages/PantryPage/PantryPage";
import PantryItemDetails from "./components/PantryItemDetails/PantryItemDetails";
import PantryPantryPage from "./pages/PantryPage/PantryPantryPage";
import PantryFridgePage from "./pages/PantryPage/PantryFridgePage";
import PantryFreezerPage from "./pages/PantryPage/PantryFreezerPage";
import GroceryListPage from "./pages/GroceryListPage/GroceryListPage";
import ReceiptPreview from "./components/ReceiptPreview/ReceiptPreview";
import SingleRecipePage from "./pages/Recipe/SingleRecipePage";
import TopNavBar from "./components/NavigationBar/TopNavBar/TopNavBar";
import BottomNavBar from "./components/NavigationBar/BottomNavBar/BottomNavBar";
import SavedRecipes from "./pages/SavedRecipesPage/SavedRecipesPage";
import SubsetRecipeRecPage from "./pages/PantryRecipeListPage/SubsetRecipeRecPage";
import IncompleteRecipeRecPage from "./pages/PantryRecipeListPage/IncompleteRecipeRecPage";
import LikedRecipeRecPage from "./pages/PantryRecipeListPage/LikeRecipeRecPage";
import CollaborativeRecipeRecPage from "./pages/PantryRecipeListPage/CollaborativeRecipeRecPage";
import SearchRecipePage from "./pages/SearchRecipePage/SearchRecipePage";

const App: React.FC = () => {
  const [user, setUser] = useState<string | null>(localStorage.getItem("user"));
  const [showAddItem, setShowAddItem] = useState(false);
  const location = useLocation();

  // Recheck whenever localStorage changes (login/logout)
  useEffect(() => {
    const handleStorageChange = () => {
      setUser(localStorage.getItem("user"));
    };
    window.addEventListener("storage", handleStorageChange);
    return () => window.removeEventListener("storage", handleStorageChange);
  }, []);

  // Also recheck on route change
  useEffect(() => {
    setUser(localStorage.getItem("user"));
  }, [location.pathname]);

  return (
    <>
      {user && <TopNavBar />}

      <Routes>
        {/* If user exists, go to dashboard */}
        <Route
          path="/"
          element={user ? <Navigate to="/dashboard" replace /> : <LandingPage />}
        />
        {/* If not logged in, go back home */}
        <Route
          path="/dashboard"
          element={
            user ? (
              <Dashboard
                userId={JSON.parse(localStorage.getItem("user")!)?.id || null}
              />
            ) : (
              <Navigate to="/" replace />
            )
          }
        />
        <Route
          path="/pantry-subset-recipes"
          element={user ? <SubsetRecipeRecPage /> : <Navigate to="/" replace />}
        />
        <Route
          path="/pantry-incomplete-recipes"
          element={user ? <IncompleteRecipeRecPage /> : <Navigate to="/" replace />}
        />
        <Route
          path="/pantry-recommend-liked-recipes"
          element={user ? <LikedRecipeRecPage /> : <Navigate to="/" replace />}
        />
        <Route 
          path="/pantry-collaborative-recipes"
          element={user ? <CollaborativeRecipeRecPage /> : <Navigate to="/" replace />}
        />
        <Route
          path="/pantry"
          element={user ? <PantryPage /> : <Navigate to="/" replace />}
        />
        <Route
          path="/pantry-pantry"
          element={user ? <PantryPantryPage /> : <Navigate to="/" replace />}
        />
        <Route
          path="/pantry-fridge"
          element={user ? <PantryFridgePage /> : <Navigate to="/" replace />}
        />
        <Route
          path="/pantry-freezer"
          element={user ? <PantryFreezerPage /> : <Navigate to="/" replace />}
        />
        <Route
          path="/saved"
          element={user ? <SavedRecipes /> : <Navigate to="/" replace />}
        />
        <Route
          path="/search"
          element={user ? <SearchRecipePage /> : <Navigate to="/" replace />}
        />
        <Route
          path="/receipt_preview"
          element={user ? <ReceiptPreview /> : <Navigate to="/" replace />}
        />
        <Route path="/recipes/:id" element={<SingleRecipePage />} />
        <Route
          path="/profile"
          element={
            user ? (
              <Profile
                name={JSON.parse(localStorage.getItem("user")!)?.name || "Guest"}
                email={JSON.parse(localStorage.getItem("user")!)?.email || ""}
                picture={JSON.parse(localStorage.getItem("user")!)?.picture || ""}
                userId={JSON.parse(localStorage.getItem("user")!)?.id || null}
              />
            ) : (
              <Navigate to="/" replace />
            )
          }
        />
        <Route
          path="/cart"
          element={
            user ? (
              <GroceryListPage
                userId={JSON.parse(localStorage.getItem("user")!)?.id || null}
                accessToken={localStorage.getItem("google_access_token") || ""}
              />
            ) : (
              <Navigate to="/" replace />
            )
          }
        />
        <Route path="/terms" element={<TermsPage />} />
        <Route path="/terms-full" element={<FullTermsPage />} />
        <Route path="/error/:code" element={<GoogleErrorScreen />} />
      </Routes>

      {user && (<BottomNavBar onManualAdd={() => setShowAddItem(true)} />)}

      {showAddItem && (
        <PantryItemDetails
          id={0}
          name=""
          qty="1x"
          unit="pcs"
          category="vegetable"
          storage="Pantry"
          added_on={new Date().toISOString().slice(0, 16)}
          image=""
          onClose={() => setShowAddItem(false)}
          onSaved={() => {
            setShowAddItem(false);
            window.dispatchEvent(new Event("pantry:refresh"));
          }}
        />
      )}
    </>
  );
};

export default App;

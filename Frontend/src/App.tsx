import React, { useEffect, useState } from "react";
import { Routes, Route, Navigate, useLocation } from "react-router-dom";
import LandingPage from "./pages/LandingPage/LandingPage";
import Dashboard from "./pages/Dashboard/Dashboard";
import Profile from "./pages/Profile/Profile";
import TermsPage from "./pages/TermsAndCondition/TermsPage";
import FullTermsPage from "./pages/TermsAndCondition/FullTermsPage";
import GoogleErrorScreen from "./pages/GoogleErrorHandling/GoogleErrorScreen";
import PantryPage from "./pages/PantryPage/PantryPage";
import ReceiptPreview from "./components/ReceiptPreview/ReceiptPreview";

const App: React.FC = () => {
  const [user, setUser] = useState<string | null>(localStorage.getItem("user"));
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

  // TODO : Remove when prod
  console.log("Current user state:", user);

  return (
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
        path="/pantry"
        element={user ? <PantryPage /> : <Navigate to="/" replace />}
      />
      <Route
        path="/receipt_preview"
        element={user ? <ReceiptPreview /> : <Navigate to="/" replace />}
      />
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
      <Route path="/terms" element={<TermsPage />} />
      <Route path="/terms-full" element={<FullTermsPage />} />
      <Route path="/error/:code" element={<GoogleErrorScreen />} />
    </Routes>
  );
};

export default App;

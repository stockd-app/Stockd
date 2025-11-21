import React, { useEffect, useState } from "react";
import { Routes, Route, Navigate, useLocation } from "react-router-dom";
import LandingPage from "./pages/LandingPage/LandingPage";
import Dashboard from "./pages/Dashboard/Dashboard";
import TermsPage from "./pages/TermsAndCondition/TermsPage";
import FullTermsPage from "./pages/TermsAndCondition/FullTermsPage";
import Error400 from "./pages/GoogleErrorHandling/Error400";
import Error401 from "./pages/GoogleErrorHandling/Error401";
import Error500 from "./pages/GoogleErrorHandling/Error500";
import Error503 from "./pages/GoogleErrorHandling/Error503";

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
        element={user ? <Dashboard /> : <Navigate to="/" replace />}
      />
      <Route path="/terms" element={<TermsPage />} />
      <Route path="/terms-full" element={<FullTermsPage />} />
      <Route path="/error/400" element={<Error400 />} />
      <Route path="/error/401" element={<Error401 />} />
      <Route path="/error/500" element={<Error500 />} />
      <Route path="/error/503" element={<Error503 />} />
    </Routes>
  );
};

export default App;

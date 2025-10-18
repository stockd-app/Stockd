import React from "react";
import Profile from "../../components/Profile";
import OCRUpload from "../../components/OCRUpload";
import "./dashboard.css";

/**
 * Dashboard page component.
 * @returns 
 */
const Dashboard: React.FC = () => {
  const user = JSON.parse(localStorage.getItem("user") || "{}");

  return (
    <div className="dashboard__container">
      <Profile name={user.name} email={user.email} picture={user.picture} />
      <OCRUpload />
    </div>
  );
};

export default Dashboard;

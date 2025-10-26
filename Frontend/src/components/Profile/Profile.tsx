import React from "react";

interface ProfileProps {
  name: string;
  email: string;
  picture: string;
}

/**
 * Profile component to display user information.
 * @param param0 
 * @returns 
 */
const Profile: React.FC<ProfileProps> = ({ name, email, picture }) => {
  return (
    <div style={{ textAlign: "center", marginBottom: "20px" }}>
      <h1>Welcome, {name || "Guest"} 👋</h1>
      <p>Your email: {email}</p>
      <img
        src={picture}
        alt="Profile"
        width="80"
        style={{ borderRadius: "50%", marginTop: "10px" }}
      />
    </div>
  );
};

export default Profile;

import React from "react";
import { useNavigate } from "react-router-dom";
import { User } from "lucide-react";

import "./profile.css";

interface ProfileProps {
    size?: number;
}

const Profile: React.FC<ProfileProps> = ({ size = 24 }) => {
    const navigate = useNavigate();

    return (
        <button
            className="profile__button"
            onClick={() => navigate("/profile")}
            aria-label="Profile"
        >
            <User size={size} />
        </button>
    );
};

export default Profile;

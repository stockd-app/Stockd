import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Accessibility, ShieldCheck, MessageSquare, LogOut, UserX, Wheat } from "lucide-react";
import BottomNavBar from "../../components/NavigationBar/BottomNavBar/BottomNavBar";
import ConfirmModal from "../../components/ConfirmModal/ConfirmModal";
import { deleteUserAccount, handleLogout, getUserAllergens, updateUserAllergens } from "../../services/api";
import { CONFIRM_DELETE_TEXT, CONFIRM_LOGOUT_TEXT } from "../../config/consts";
import DOMPurify from "dompurify";
import AllergensModal from "../../components/AllergensModal/AllergensModal";


import "./profile.css";

interface ProfileProps {
    name: string;
    email: string;
    picture: string;
    userId: number;
}

const Profile: React.FC<ProfileProps> = ({ name, email, picture, userId }) => {
    const navigate = useNavigate();

    const [showLogoutModal, setShowLogoutModal] = useState(false);
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [showAllergensModal, setShowAllergensModal] = useState(false);
    const [initialAllergens, setInitialAllergens] = useState<string[]>([]);

    const handleDelete = async () => {
        console.log("userId to delete: ", userId)
        handleLogout();
        await deleteUserAccount(userId!);
    };

    const openAllergensModal = async () => {
        try {
            const res = await getUserAllergens();
            setInitialAllergens(res.allergens || []);
            setShowAllergensModal(true);
        } catch (err) {
            console.error("Failed to fetch allergens", err);
        }
    };

    const handleAllergensConfirm = async (selected: string[]) => {
        try {
            await updateUserAllergens(selected);
            localStorage.setItem("user_allergens", JSON.stringify(selected));
            localStorage.setItem("allergens_onboarded", "true");
            setShowAllergensModal(false);
        } catch (err) {
            console.error("Failed to update allergens", err);
        }
    };

    return (
        <div className="profile__container">

            {/* User Info */}
            <div className="profile__header">
                <div className="profile__avatar-wrapper">
                    <img src={picture} alt="Profile" className="profile__avatar" />
                </div>

                <h2 className="profile__name">{DOMPurify.sanitize(name)}</h2>
                <p className="profile__email">{DOMPurify.sanitize(email)}</p>
            </div>

            {/* Options */}
            <div className="profile__options">
                <div className="profile__item">
                    <Accessibility className="profile__icon" size={22} />
                    <span>Accessibility</span>
                </div>

                <div className="profile__item" onClick={() => navigate("/terms-full")}>
                    <ShieldCheck className="profile__icon" size={22} />
                    <span>Legal, Data and Privacy</span>
                </div>

                <div className="profile__item">
                    <MessageSquare className="profile__icon" size={22} />
                    <span>Feedback</span>
                </div>

                <div className="profile__item" onClick={openAllergensModal}>
                    <Wheat className="profile__icon" size={22} />
                    <span>Food Allergies</span>
                </div>

                <div className="profile__item" onClick={() => setShowLogoutModal(true)}>
                    <LogOut className="profile__icon" size={22} />
                    <span>Logout</span>
                </div>

                <div className="profile__item delete" onClick={() => setShowDeleteModal(true)}>
                    <UserX className="profile__icon delete-icon" size={22} />
                    <span>Delete Account</span>
                </div>
            </div>

            <BottomNavBar />

            {showAllergensModal && (
                <AllergensModal
                    initial={initialAllergens}
                    onConfirm={handleAllergensConfirm}
                />
            )}

            {/* Logout Modal */}
            {showLogoutModal && (
                <ConfirmModal
                    text={CONFIRM_LOGOUT_TEXT}
                    onConfirm={() => {
                        setShowLogoutModal(false);
                        handleLogout();
                    }}
                    onCancel={() => setShowLogoutModal(false)}
                />
            )}

            {/* Delete Account Modal */}
            {showDeleteModal && (
                <ConfirmModal
                    text={CONFIRM_DELETE_TEXT}
                    confirmLabel="Delete"
                    onConfirm={() => {
                        setShowDeleteModal(false);
                        handleDelete();
                    }}
                    onCancel={() => setShowDeleteModal(false)}
                />
            )}
        </div>
    );
};

export default Profile;

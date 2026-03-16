import React from "react";
import StockdLogo from "../../assets/images/StockdLogo.svg";
import { useNavigate } from "react-router-dom";
import Button from "../../components/Button/Button";

import "./fulltermspage.css";

/**
 * Full Terms & Condition Detail Page
 * @returns JSX.Element
 */
const FullTermsPage: React.FC = () => {
    const navigate = useNavigate();

    return (
        <div className="fullterms__container">

            {/* Back Button */}
            <Button
                variant="back"
                onClick={() => navigate(-1)}
            />

            {/* Header */}
            <div className="fullterms__header">
                {/* Green Title */}
                <h3 className="fullterms__title">Terms & Conditions</h3>

                <img src={StockdLogo} alt="Stockd Logo" className="fullterms__logo" />

                {/* Stockd title */}
                <h2 className="fullterms__stockd">Stockd</h2>

                <div className="fullterms__divider"></div>
            </div>

            {/* Content */}
            <div className="fullterms__content">

                <h4>Introduction</h4>
                <p>
                    Welcome to use Stockd, an AI-powered pantry management and recipe
                    recommendation platform.
                </p>

                <h4>Purpose of Stockd</h4>
                <p>
                    Stockd helps users manage their pantry, reduce food waste, and receive
                    AI-generated recipe suggestions based on available ingredients.
                    <br /><br />
                    This app is for personal and non-commercial use only.
                </p>

                <h4>Terms & Consent</h4>
                <p>
                    Before you can use Stockd, we require your consent to certain conditions
                    that allow the app to function properly.
                    <br /><br />
                    By agreeing, you confirm that you understand and accept how Stockd collects
                    and uses your data and images as described below. If you decline, you will
                    not be able to use Stockd or access its features.
                </p>

                <p>To provide personalized and AI-powered features, Stockd may need to:</p>

                <ul>
                    <li>
                        Collect basic app usage data, including your login information via Google
                        Account (such as your name and email address), to create and manage your
                        profile securely.
                    </li>
                    <li>
                        Access and process images that you capture or upload from your device’s
                        camera or gallery for ingredient recognition and recipe suggestions.
                    </li>
                </ul>

                <p>All collected data and images are used only for in-app functionality:</p>

                <ul>
                    <li>Ingredient recognition</li>
                    <li>Pantry tracking</li>
                    <li>Recipe generation</li>
                </ul>

                <p>
                    We do not publish, sell, or share your data or images with any third parties
                    unrelated to Stockd’s operation.
                </p>

                <p>By clicking “Agree & Continue”, you consent to:</p>

                <ul>
                    <li>The use of your Google account to authenticate and create your profile.</li>
                    <li>The collection and processing of app usage data for improvement.</li>
                    <li>The access and processing of your images for AI analysis.</li>
                </ul>

                <p>
                    You can delete your account at any time via <b>"Settings" → "Delete Account"</b>.
                    Once deleted, all your data will also be removed from our system, and your
                    access to the app will end.
                </p>

            </div>
        </div>
    );
};

export default FullTermsPage;

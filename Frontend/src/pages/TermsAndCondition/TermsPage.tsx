import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useGoogleLogin } from "@react-oauth/google";
import { loginWithGoogle } from "../../services/api";
import StockdLogo from "../../assets/images/StockdLogo.svg";

import "./termspage.css";

/**
 * Terms & Condition Page
 * @returns JSX.Element
 */
const TermsPage: React.FC = () => {
    const [checked, setChecked] = useState(false);
    const navigate = useNavigate();

    // Initiatise Google Login
    const login = useGoogleLogin({
        // Obtain temporary authorization code from Google for backend exchange
        flow: "auth-code",
        onSuccess: async (tokenResponse) => {
            const res = await loginWithGoogle(tokenResponse.code);

            if (res.success) {
                navigate("/dashboard");
            } else {
                navigate(`/error/${res.status}`);
            }
        },
        onError: () => console.error("Google login error"),
    });


    return (
        <div className="terms__container">
            <div className="terms__card">
                {/* Back Button */}
                <button className="terms__close" onClick={() => navigate("/")}>
                    ✕
                </button>

                {/* T&S Title */}
                <h2 className="terms__title">Terms & Condition</h2>

                {/* Stockd Logo */}
                <img src={StockdLogo} alt="Stockd Logo" width={100} className="terms__logo" />

                {/* Stockd Title */}
                <h2 className="terms__stockd">STOCKD</h2>

                {/* Text */}
                <p className="terms__text">
                    Before you continue, to keep using Stockd, please review our Terms & Conditions.
                    <br />
                    You can read the full details anytime by tapping the link below.
                </p>

                <p className="terms__text">
                    View our{" "}
                    <span
                        className="terms__link"
                        onClick={() => navigate("/terms-full")}
                        style={{ cursor: "pointer" }}
                    >
                        Terms & Conditions
                    </span>
                    .
                </p>

                {/* Checkbox + Span */}
                <label className="terms__checkbox">
                    <input
                        type="checkbox"
                        checked={checked}
                        onChange={() => setChecked(!checked)}
                    />
                    <span>I have read and agreed to the Terms & Conditions.</span>
                </label>

                {/* Continue Button */}
                <button
                    disabled={!checked}
                    className={`terms__continue ${checked ? "active" : ""}`}
                    onClick={() => login()}
                >
                    Continue
                </button>

            </div>
        </div >
    );
};

export default TermsPage;

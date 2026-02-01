import React, { useState } from "react";
import ConfirmModal from "../ConfirmModal/ConfirmModal";
import "./allergenpreferencemodal.css";

interface Props {
    onConfirm: (mode: "hide" | "show") => void;
    onCancel: () => void;
}

const AllergenPreferenceModal: React.FC<Props> = ({ onConfirm, onCancel }) => {
    const [dontAskAgain, setDontAskAgain] = useState(false);

    const handleConfirm = (mode: "hide" | "show") => {
        localStorage.setItem("allergen_visibility", mode);

        if (dontAskAgain) {
            localStorage.setItem("allergen_modal_dismissed", "true");
        }

        onConfirm(mode);
    };

    return (
        <ConfirmModal
            text={
                <div className="allergenPref">
                    <h3 className="allergenPref__title">Allergen Preferences</h3>

                    <p className="allergenPref__description">
                        You selected food allergies. Should we hide recipes containing these
                        allergens?
                    </p>

                    <label className="allergenPref__checkbox">
                        <input
                            type="checkbox"
                            checked={dontAskAgain}
                            onChange={() => setDontAskAgain(prev => !prev)}
                        />
                        <span>Do not show this again</span>
                    </label>
                </div>
            }
            confirmLabel="Hide Recipes"
            cancelLabel="Show Anyway"
            onConfirm={() => handleConfirm("hide")}
            onCancel={() => handleConfirm("show")}
        />
    );
};

export default AllergenPreferenceModal;

import React, { useState } from "react";
import { CONFIRM_MODAL } from "../../config/consts";

import "./confirmmodal.css";

interface ConfirmModalProps {
    text: string;
    onConfirm: () => void;
    onCancel: () => void;
    confirmLabel?: string;
    cancelLabel?: string;
}

const ConfirmModal: React.FC<ConfirmModalProps> = ({
    text,
    onConfirm,
    onCancel,
    confirmLabel = CONFIRM_MODAL.YES,
    cancelLabel = CONFIRM_MODAL.NO,
}) => {
    const [closing, setClosing] = useState(false);

    const handleClose = (action: () => void) => {
        setClosing(true);

        // Wait for animation to finish
        setTimeout(() => {
            action();
        }, 250); // match animation duration
    };

    return (
        <div className={`modal__overlay ${closing ? "fadeOut" : ""}`}>
            <div className={`modal__box ${closing ? "slideDown" : ""}`}>
                <p className="modal__text">{text}</p>

                <div className="modal__buttons">
                    <button
                        className="modal__btn modal__yes"
                        onClick={() => handleClose(onConfirm)}
                    >
                        {confirmLabel}
                    </button>

                    <button
                        className="modal__btn modal__no"
                        onClick={() => handleClose(onCancel)}
                    >
                        {cancelLabel}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ConfirmModal;

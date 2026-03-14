import React, { useState } from "react";
import { CONFIRM_MODAL } from "../../config/consts";
import Button from "../Button/Button";

import "./confirmmodal.css";

interface ConfirmModalProps {
    text: React.ReactNode;
    onConfirm: () => void;
    onCancel: () => void;
    confirmLabel?: string;
    cancelLabel?: string;
    confirmVariant?: "primary" | "secondary" | "danger";
}

const ConfirmModal: React.FC<ConfirmModalProps> = ({
    text,
    onConfirm,
    onCancel,
    confirmLabel = CONFIRM_MODAL.YES,
    cancelLabel = CONFIRM_MODAL.NO,
    confirmVariant = "primary",
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
                    <Button
                        variant={confirmVariant}
                        onClick={() => handleClose(onConfirm)}>
                        {confirmLabel}
                    </Button>
                    <Button
                        variant="secondary"
                        onClick={() => handleClose(onCancel)}>
                        {cancelLabel}
                    </Button>
                </div>
            </div>
        </div>
    );
};

export default ConfirmModal;

import React, { useState, useEffect } from "react";
import { X, Type } from "lucide-react";
import "./accessibilitymodal.css";

interface AccessibilityModalProps {
    onClose: () => void;
}

type TextSize = "small" | "medium" | "large" | "xlarge";

const TEXT_SIZE_OPTIONS = [
    { value: "small" as TextSize, label: "Small", scale: 0.875 },
    { value: "medium" as TextSize, label: "Medium", scale: 1 },
    { value: "large" as TextSize, label: "Large", scale: 1.125 },
    { value: "xlarge" as TextSize, label: "Extra Large", scale: 1.25 },
];

const AccessibilityModal: React.FC<AccessibilityModalProps> = ({ onClose }) => {
    const [selectedSize, setSelectedSize] = useState<TextSize>("medium");
    const [previewScale, setPreviewScale] = useState<number>(1);

    useEffect(() => {
        // load saved text size from localStorage
        const savedSize = localStorage.getItem("text_size") as TextSize;
        if (savedSize) {
            setSelectedSize(savedSize);
            const option = TEXT_SIZE_OPTIONS.find(opt => opt.value === savedSize);
            if (option) {
                setPreviewScale(option.scale);
            }
        }
    }, []);

    const handleSizeChange = (size: TextSize) => {
        setSelectedSize(size);
        
        // update preview only
        const option = TEXT_SIZE_OPTIONS.find(opt => opt.value === size);
        if (option) {
            setPreviewScale(option.scale);
        }
    };

    const handleDone = () => {
        // aave to localStorage and apply the text size when Done is clicked
        localStorage.setItem("text_size", selectedSize);
        
        const option = TEXT_SIZE_OPTIONS.find(opt => opt.value === selectedSize);
        if (option) {
            document.documentElement.style.setProperty("--text-scale", option.scale.toString());
        }
        
        onClose();
    };

    return (
        <div className="accessibility__overlay" onClick={onClose}>
            <div className="accessibility__modal no-scale" onClick={(e) => e.stopPropagation()}>
                <button className="accessibility__close" onClick={onClose}>
                    <X size={24} />
                </button>

                <div className="accessibility__header">
                    <Type size={32} className="accessibility__header-icon" />
                    <h2 className="accessibility__title">Accessibility Settings</h2>
                    <p className="accessibility__subtitle">
                        Customize your reading experience
                    </p>
                </div>

                <div className="accessibility__section">
                    <h3 className="accessibility__section-title">Text Size</h3>
                    <p className="accessibility__section-desc">
                        Choose a comfortable text size for better readability
                    </p>

                    <div className="accessibility__options">
                        {TEXT_SIZE_OPTIONS.map((option) => (
                            <button
                                key={option.value}
                                className={`accessibility__option ${
                                    selectedSize === option.value ? "active" : ""
                                }`}
                                onClick={() => handleSizeChange(option.value)}
                            >
                                <div className="accessibility__option-label">
                                    {option.label}
                                </div>
                                <div
                                    className="accessibility__option-preview"
                                    style={{ fontSize: `${option.scale * 16}px` }}
                                >
                                    Aa
                                </div>
                            </button>
                        ))}
                    </div>

                    <div className="accessibility__preview">
                        <p
                            className="accessibility__preview-text"
                            data-scale={previewScale}
                        >
                            Preview: This is how your text will look throughout the app.
                        </p>
                    </div>
                </div>

                <div className="accessibility__footer">
                    <button className="accessibility__done" onClick={handleDone}>
                        Done
                    </button>
                </div>
            </div>
        </div>
    );
};

export default AccessibilityModal;
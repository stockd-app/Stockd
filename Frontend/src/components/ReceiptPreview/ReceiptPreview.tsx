import React, { useEffect, useMemo, useRef, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { uploadReceipt } from "../../services/api";
import { Trash2, Upload, Camera, ChevronLeft } from "lucide-react";
import CameraModal from "../../components/CameraModal/CameraModal";

import "./receiptpreview.css";

type ReceiptImage = {
    id: string;
    url: string;
    file: File;
};

const ReceiptPreview: React.FC = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const fileInputRef = useRef<HTMLInputElement | null>(null);

    const [showCamera, setShowCamera] = useState(false);
    const [isUploading, setIsUploading] = useState(false);

    const initialImages = useMemo<ReceiptImage[]>(() => {
        return (location.state?.images as ReceiptImage[]) ?? [];
    }, [location.state]);

    const [images, setImages] = useState<ReceiptImage[]>(initialImages);

    // Cleanup blob URLs
    useEffect(() => {
        return () => {
            images.forEach((img) => URL.revokeObjectURL(img.url));
        };
    }, []);

    // Gallery 
    const handleGallerySelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = Array.from(e.target.files ?? []);
        if (!files.length) return;

        const newImages = files.map((file) => ({
            id: crypto.randomUUID(),
            file,
            url: URL.createObjectURL(file),
        }));

        setImages((prev) => [...prev, ...newImages]);
        e.target.value = "";
    };

    // Camera
    const handleCameraCapture = (file: File, url: string) => {
        setImages((prev) => [
            ...prev,
            { id: crypto.randomUUID(), file, url },
        ]);
    };

    // Delete
    const handleDelete = (id: string) => {
        setImages((prev) => {
            const target = prev.find((i) => i.id === id);
            if (target) URL.revokeObjectURL(target.url);
            return prev.filter((i) => i.id !== id);
        });
    };

    // Recogntion
    const handleRecognition = async () => {
        try {
            const files = images.map((img) => img.file);
            if (!files.length) return;

            console.log("Uploading:", files);
            setIsUploading(true);

            await uploadReceipt(files);

            navigate("/pantry");
        } catch (err) {
            console.error("Recognition failed:", err);
            alert("Failed to recognize receipt. Please try again.");
        } finally {
            setIsUploading(false);
        }
    };

    const mainImage = images[0];

    return (
        <div className="rp__page">
            <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                multiple
                style={{ display: "none" }}
                onChange={handleGallerySelect}
            />

            <div className="rp__header">
                <button className="rp__back" onClick={() => navigate(-1)}>
                    <ChevronLeft size={22} />
                </button>
            </div>

            <div className="rp__content">
                {mainImage && (
                    <div className="rp__previewCard">
                        <img src={mainImage.url} className="rp__image" />
                        <button
                            className="rp__delete"
                            disabled={isUploading}
                            onClick={() => handleDelete(mainImage.id)}
                        >
                            <Trash2 size={16} />
                            Delete
                        </button>

                        {images.length > 1 && (
                            <div className="rp__count">
                                {images.length} receipts selected
                            </div>
                        )}
                    </div>
                )}

                {/* Secondary receipts */}
                {images.length > 1 && (
                    <div className="rp__secondaryList">
                        {images.slice(1).map((img) => (
                            <div key={img.id} className="rp__secondaryCard">
                                <img src={img.url} />
                                <button onClick={() => handleDelete(img.id)}>
                                    <Trash2 size={14} /> Delete
                                </button>
                            </div>
                        ))}
                    </div>
                )}


                <div className="rp__addMore">
                    <h4>Add another receipt</h4>
                    <p>
                        When adding multiple receipts, photograph a long receipt in parts.
                        AI automatically combines them.
                    </p>

                    <div className="rp__actions">
                        <button className="rp__actionBtn" onClick={() => setShowCamera(true)}>
                            <Camera size={20} />
                            <span>Take Photo</span>
                        </button>

                        <button className="rp__actionBtn" onClick={() => fileInputRef.current?.click()}>
                            <Upload size={20} />
                            <span>Select Photo</span>
                        </button>
                    </div>
                </div>

                <button
                    className="rp__recognition"
                    disabled={!images.length || isUploading}
                    onClick={handleRecognition}
                >
                    {isUploading ? "Processing..." : "Recognition"}
                </button>
            </div>

            {/* Camera Mdal */}
            {showCamera && (
                <CameraModal
                    onClose={() => setShowCamera(false)}
                    onPhotoCaptured={handleCameraCapture}
                />
            )}

            {/* Loading indicator */}
            {isUploading && (
                <div className="uploading__overlay">
                    <div className="spinner"></div>
                    <p className="loading__text">AI is scanning your receipt…</p>
                </div>
            )}

        </div>
    );
};

export default ReceiptPreview;

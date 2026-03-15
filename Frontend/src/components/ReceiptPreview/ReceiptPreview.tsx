import React, { useEffect, useMemo, useRef, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { addOrUpdatePantryItem, confirmReceiptItems, uploadReceipt } from "../../services/api";
import { Trash2, Upload, Camera, ChevronLeft } from "lucide-react";
import CameraModal from "../../components/CameraModal/CameraModal";
import type { ConfirmPantryItem } from "../PantryItemConfirmationModal/PantryItemConfirmationModal";
import PantryItemConfirmationModal from "../PantryItemConfirmationModal/PantryItemConfirmationModal";
import receiptGif from "../../assets/images/receipt_gif.gif";
import try_again from "../../assets/images/error_handling/try_again.png";
import Button from "../Button/Button";

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
    const [scanError, setScanError] = useState(false);

    const [showConfirmation, setShowConfirmation] = useState(false);
    const [detectedItems, setDetectedItems] = useState<ConfirmPantryItem[]>([]);

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
            setScanError(false);

            // 1 min delay for gif to load
            const [response] = await Promise.all([
                uploadReceipt(files),
                new Promise(resolve => setTimeout(resolve, 1000))
            ]);

            if (!response.items || response.items.length === 0) {
                setScanError(true);
                return;
            }

            // merge duplicate items by normalized_name and storage
            const mergedItems: { [key: string]: ConfirmPantryItem } = {};

            response.items.forEach((item: ConfirmPantryItem) => {
                const key = `${item.normalized_name}_${item.storage}`;

                if (mergedItems[key]) {
                    mergedItems[key].quantity_value += item.quantity_value;
                } else {
                    mergedItems[key] = { ...item };
                }
            });

            const mergedItemsArray = Object.values(mergedItems);

            setDetectedItems(mergedItemsArray);
            setShowConfirmation(true);
        } catch (err) {
            console.error("Recognition failed:", err);
            setScanError(true);
        } finally {
            setIsUploading(false);
        }
    };

    // Confirm receipt items and update pantry
    const handleConfirmItems = async (updatedItems: ConfirmPantryItem[]) => {
        try {
            await confirmReceiptItems(updatedItems);
            setShowConfirmation(false);
            navigate("/pantry");
        } catch (err) {
            console.error(err);
            alert("Failed to save items.");
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
                <Button
                    variant="back"
                    onClick={() => navigate(-1)}>
                    <ChevronLeft size={22} />
                </Button>
            </div>

            <div className="rp__content">
                {mainImage && (
                    <div className="rp__previewCard">
                        <img src={mainImage.url} className="rp__image" />
                        <Button
                            className="rp__delete"
                            variant="secondary"
                            disabled={isUploading}
                            onClick={() => handleDelete(mainImage.id)}>
                            <Trash2 size={16} />
                            Delete
                        </Button>
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
                                <Button
                                    className="rp__delete"
                                    variant="secondary"
                                    onClick={() => handleDelete(img.id)}>
                                    <Trash2 size={16} />
                                    Delete
                                </Button>
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
                <Button
                    className="rp__recognition"
                    disabled={!images.length || isUploading}
                    onClick={handleRecognition}>
                    {isUploading ? "Processing..." : "Scan Receipt(s)"}
                </Button>
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
                    <img src={receiptGif} alt="Scanning receipt" className="receipt__gif" />
                    <p className="loading__text">Stockd is scanning your receipt…</p>
                </div>
            )}

            {/* Error modal */}
            {scanError && (
                <div className="error__overlay" onClick={() => setScanError(false)}>
                    <div className="error__modal" onClick={(e) => e.stopPropagation()}>
                        <img
                            src={try_again}
                            alt="Try again"
                            className="error__image"
                        />
                        <h3 className="error__title">Oops!</h3>
                        <p className="error__message">
                            Sorry, we couldn't parse your receipt. Please try again later.
                        </p>
                        <Button onClick={() => setScanError(false)}>
                            Close
                        </Button>
                    </div>
                </div>
            )}

            {showConfirmation && (
                <PantryItemConfirmationModal
                    items={detectedItems}
                    onClose={() => setShowConfirmation(false)}
                    onConfirm={handleConfirmItems}
                />
            )}

        </div>
    );
};

export default ReceiptPreview;

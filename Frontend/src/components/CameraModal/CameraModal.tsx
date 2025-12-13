import React, { useRef, useState, useEffect } from "react";

import "./cameramodal.css";

interface CameraModalProps {
  onClose: () => void;
  onPhotoCaptured: (file: File, url: string) => void;
}

/**
 * Camera Modal component
 *
 *  Displays a full-screen modal camera interface that allows the user to:
 * - Open the **rear (environment)** camera using `getUserMedia`.
 * - Capture a still image from the video stream.
 * @param param0
 * @returns
 */
const CameraModal: React.FC<CameraModalProps> = ({
  onClose,
  onPhotoCaptured,
}) => {
  // Reference to the <video> element displaying the live camera feed
  const videoRef = useRef<HTMLVideoElement>(null);

  // Stores the active MediaStream (so we can stop/restart the camera)
  const [stream, setStream] = useState<MediaStream | null>(null);

  /**
   * Initializes the camera.
   *
   * Attempts to open the **rear camera** first.
   * If unavailable (e.g. desktop or older phone), it falls back to the default camera.
   */
  const startCamera = async () => {
    const s = await navigator.mediaDevices.getUserMedia({
      video: { facingMode: { ideal: "environment" } },
    });
    if (videoRef.current) videoRef.current.srcObject = s;
    setStream(s);
  };

  useEffect(() => {
    startCamera();
    return () => stream?.getTracks().forEach((t) => t.stop());
  }, []);

  const capturePhoto = async () => {
    const video = videoRef.current;
    if (!video) return;

    const canvas = document.createElement("canvas");
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    ctx.drawImage(video, 0, 0);

    // Stop stream to release camera resource
    stream?.getTracks().forEach((track) => track.stop());

    const blob = await (await fetch(canvas.toDataURL("image/jpeg"))).blob();
    const file = new File([blob], "receipt.jpg", { type: "image/jpeg" });
    const url = URL.createObjectURL(file);

    onPhotoCaptured(file, url);
    onClose();
  };

  return (
    <div className="camera-modal">
      {/* ===== Live Camera View ===== */}
      <div className="camera-frame">
        <video ref={videoRef} autoPlay playsInline muted />
        <div className="camera-outline" />
      </div>

      {/* Capture Controls (Shutter + Close) */}
      <div className="camera-controls">
        <button className="capture-btn" onClick={capturePhoto} />
        <button className="close-btn" onClick={onClose}>
          ✕
        </button>
      </div>
    </div>
  );
};

export default CameraModal;

import React, { useRef, useState, useEffect } from "react";

import "./cameramodal.css";

interface CameraModalProps {
  onClose: () => void;
}

/**
 * Camera Modal component
 * 
 *  Displays a full-screen modal camera interface that allows the user to:
 * - Open the **rear (environment)** camera using `getUserMedia`.
 * - Capture a still image from the video stream.
 * - Preview the captured photo before confirming or retaking it.
 * 
 * TODO : Expand on camera modal functionality based on Figma
 * @param param0 
 * @returns 
 */
const CameraModal: React.FC<CameraModalProps> = ({ onClose }) => {
  // Reference to the <video> element displaying the live camera feed
  const videoRef = useRef<HTMLVideoElement>(null);

  // Holds the captured image in Base64 format (used for preview)
  const [photo, setPhoto] = useState<string | null>(null);

  // Stores the active MediaStream (so we can stop/restart the camera)
  const [stream, setStream] = useState<MediaStream | null>(null);

  /**
   * Initializes the camera.
   * 
   * Attempts to open the **rear camera** first.
   * If unavailable (e.g. desktop or older phone), it falls back to the default camera.
   */
  const startCamera = async () => {
    try {
      const s = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: { ideal: "environment" },
          width: { ideal: 1920 },
          height: { ideal: 1080 },
        },
      });
      if (videoRef.current) {
        videoRef.current.srcObject = s;
      }
      setStream(s);
    } catch (err) {
      console.warn("Rear camera not found, falling back:", err);
      const fallback = await navigator.mediaDevices.getUserMedia({ video: true });
      if (videoRef.current) {
        videoRef.current.srcObject = fallback;
      }
      setStream(fallback);
    }
  };

  /**
   * Starts the camera when the modal mounts.
   * Cleans up the camera stream when the modal is closed/unmounted.
   */
  useEffect(() => {
    startCamera();
    return () => {
      stream?.getTracks().forEach((track) => track.stop());
    };
  }, []);

  /**
   * Captures the current frame from the live camera feed.
   * 
   * Steps:
   * 1. Draws the video frame onto a temporary <canvas>.
   * 2. Converts the canvas image into a Base64 PNG.
   * 3. Stops the video stream to release the camera.
   * 4. Displays the captured photo in preview mode.
   */
  const capturePhoto = () => {
    const video = videoRef.current;
    if (!video) return;

    const canvas = document.createElement("canvas");
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    const ctx = canvas.getContext("2d");
    if (ctx) ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

    // Stop stream to release camera resource
    stream?.getTracks().forEach((track) => track.stop());
    setPhoto(canvas.toDataURL("image/png"));
  };

  /**
   * Retakes the photo.
   * 
   * Clears the captured image and reinitializes the camera.
   */
  const retakePhoto = async () => {
    setPhoto(null);
    await startCamera(); // Restart camera feed
  };

  /**
   * Confirms the captured photo.
   * 
   * Currently logs the photo and closes the modal.
   * TODO : Can be extended to upload or process the image later.
   */
  const usePhoto = () => {
    console.log("Photo accepted:", photo);
    onClose();
  };

  /**
   * UI rendering logic:
   * 
   * - If `photo` is null → show **live camera view** and capture controls.
   * - If `photo` is set → show **captured image preview** with retake/use options.
   */
  return (
    <div className="camera-modal">
      {!photo ? (
        <>
          {/* ===== Live Camera View ===== */}
          <div className="camera-frame">
            <video ref={videoRef} autoPlay playsInline muted />
            <div className="camera-outline"></div>
          </div>

          {/* Capture Controls (Shutter + Close) */}
          <div className="camera-controls">
            <button className="capture-btn" onClick={capturePhoto}></button>
            <button className="close-btn" onClick={onClose}>✕</button>
          </div>
        </>
      ) : (
        <>
          {/* ===== Photo Preview ===== */}
          <div className="photo-preview">
            <img src={photo} alt="Captured" className="captured-photo" />
          </div>

          {/* Preview Controls (Retake / Use Photo) */}
          <div className="preview-controls">
            <button className="retake-btn" onClick={retakePhoto}>Retake</button>
            <button className="use-btn" onClick={usePhoto}>Use Photo</button>
          </div>
        </>
      )}
    </div>
  );
};

export default CameraModal;

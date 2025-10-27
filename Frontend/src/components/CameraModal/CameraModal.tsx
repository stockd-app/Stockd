import React, { useRef, useState, useEffect } from "react";

import './cameramodal.css'

interface CameraModalProps {
  onClose: () => void;
}

/**
 * TODO : Once PWA is accessible, start further development on this. (Image transfer + Styling)
 * TODO : Do not make the image persistent, as it may violate GDPR.
 * Currently the image is stored in "photo" react state as Base64 image string.
 * @param param0 
 * @returns 
 */
const CameraModal: React.FC<CameraModalProps> = ({ onClose }) => {
  const videoRef = useRef<HTMLVideoElement>(null);

  // Holds the captured photo as a Base64 image string
  const [photo, setPhoto] = useState<string | null>(null);

  /**
   * Requests access to the user's camera and streams it into the <video> tag.
   */
  useEffect(() => {
    const startCamera = async () => {
      try {
        // Ask for permission to use the camera
        const stream = await navigator.mediaDevices.getUserMedia({ video: true });

        // Assign the live stream to the video element if available
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
        }
      } catch (err) {
        console.error("Camera access denied:", err);
      }
    };

    // Start the camera when modal opens
    startCamera();

    // Cleanup function: stops the camera when modal closes or unmounts
    return () => {
      const stream = videoRef.current?.srcObject as MediaStream;
      stream?.getTracks().forEach(track => track.stop());
    };
  }, []);

  /**
   * - Takes a snapshot from the current video frame
   * - Draws it onto a hidden <canvas>
   * - Converts the image to Base64 format
   * - Saves it to state (so we can preview or send it to backend later)
   */
  const capturePhoto = () => {
    const video = videoRef.current;
    if (!video) return;

    // Create a temporary canvas to draw the current video frame
    const canvas = document.createElement("canvas");
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;

    // Draw the live video frame onto the canvas
    const ctx = canvas.getContext("2d");
    if (ctx) ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

    // Convert canvas image to Base64 PNG format and store in state 
    setPhoto(canvas.toDataURL("image/png"));
  };

  return (
    <div className="camera-modal">
      <div className="camera-frame">
        <video ref={videoRef} autoPlay playsInline />
        <div className="camera-outline"></div>
      </div>

      <div className="camera-controls">
        <button onClick={capturePhoto}>Capture</button>
        <button onClick={onClose}>Close</button>
      </div>

      {photo && <img src={photo} alt="Captured" className="preview" />}
    </div>
  );
};

export default CameraModal;

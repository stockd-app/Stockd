import { useGoogleLogin } from "@react-oauth/google";
import axios from "axios";
import { API_ROUTES, GOOGLE_CONSTS } from "../../config/consts";
import { useNavigate } from "react-router-dom";
import "./customGoogleButton.css";

/**
 * Custom Google Login Button Component
 * 
 * Instead of using the default Google-rendered button,
 * this allows full styling control (consistent with our Figma design).
 * 
 * @returns JSX.Element
 */
export const CustomGoogleButton: React.FC = () => {
  const navigate = useNavigate();

  // Initialize Google Login
  const login = useGoogleLogin({
    // Obtain temporary authorization code from Google for backend exchange
    flow: "auth-code",
    onSuccess: async (tokenResponse) => {
      try {
        // Send the authorization code to FastAPI backend for token exchange
        const res = await axios.post(API_ROUTES.VERIFY_GOOGLE, {
          token: tokenResponse.code,
        });

        localStorage.setItem("user", JSON.stringify(res.data.user));

        navigate("/dashboard");
      } catch (err) {
        console.error("Login failed:", err);
      }
    },
    onError: () => console.error("Login Failed"),
  });

  return (
    <button className="custom__google-btn" onClick={() => login()}>
      <img
        src= {GOOGLE_CONSTS.GOOGLE_IMAGE_URL}
        alt= {GOOGLE_CONSTS.GOOGLE_ALT_TEXT}
        width= {GOOGLE_CONSTS.GOOGLE_ICON_SIZE}
        height= {GOOGLE_CONSTS.GOOGLE_ICON_SIZE}
      />
      {GOOGLE_CONSTS.GOOGLE_TEXT}
    </button>
  );
};

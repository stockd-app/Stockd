import { useNavigate } from "react-router-dom";
import { GOOGLE_CONSTS } from "../../config/consts";

import "./customgooglebutton.css";

export const CustomGoogleButton: React.FC = () => {
  const navigate = useNavigate();

  return (
    <button className="custom__google-btn" onClick={() => navigate("/terms")}>
      <img
        src={GOOGLE_CONSTS.GOOGLE_IMAGE_URL}
        alt={GOOGLE_CONSTS.GOOGLE_ALT_TEXT}
        width={GOOGLE_CONSTS.GOOGLE_ICON_SIZE}
        height={GOOGLE_CONSTS.GOOGLE_ICON_SIZE}
      />
      {GOOGLE_CONSTS.GOOGLE_TEXT}
    </button>
  );
};

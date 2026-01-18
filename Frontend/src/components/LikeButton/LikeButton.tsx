import { useEffect, useState } from "react";
import { Heart } from "lucide-react";
import { toggleLikeRecipe } from "../../services/api";
import { useNotification } from "../Notification/NotificationContext";
import { NOTIFICATION_MESSAGES, NOTIFICATION_TYPES } from "../../config/consts";
import "./LikeButton.css";

interface LikeButtonProps {
    recipeId: number;
    initialLiked?: boolean;
    size?: number;
    onLikedChange?: (liked: boolean) => void;
}

const LikeButton: React.FC<LikeButtonProps> = ({
    recipeId,
    initialLiked = false,
    size = 24,
    onLikedChange,
}) => {
    const [liked, setLiked] = useState(initialLiked);
    const [loading, setLoading] = useState(false);
    const notify = useNotification();

    useEffect(() => {
        setLiked(initialLiked);
    }, [initialLiked]);

    const handleToggleLike = async () => {
        if (loading) return;

        try {
            setLoading(true);
            await toggleLikeRecipe(recipeId);

            const next = !liked;
            setLiked(next);
            onLikedChange?.(next);
            notify(
                next ? NOTIFICATION_MESSAGES.LIKED : NOTIFICATION_MESSAGES.UNLIKED,
                next ? NOTIFICATION_TYPES.LIKED : NOTIFICATION_TYPES.UNLIKED
            );
        } catch (err) {
            console.error("Failed to toggle like:", err);
        } finally {
            setLoading(false);
        }
    };

    return (
        <button
            className={`like__button ${liked ? "liked" : ""}`}
            onClick={handleToggleLike}
            disabled={loading}
            aria-label="Like recipe"
            type="button"
        >
            <Heart
                size={size}
                fill={liked ? "#ef4444" : "none"}
                color={liked ? "#ef4444" : "#374151"}
            />
        </button>
    );
};

export default LikeButton;

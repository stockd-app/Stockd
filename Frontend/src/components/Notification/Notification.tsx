import React from "react";
import { NOTIFICATION_ICONS, NOTIFICATION_UI, type NotificationType } from "../../config/consts";

import "./notification.css";

interface NotificationProps {
    message: string;
    type: NotificationType;
    leaving?: boolean;
}

const Notification: React.FC<NotificationProps> = ({ message, type, leaving }) => {
    const Icon = NOTIFICATION_ICONS[type];

    return (
        <div className={`notification__container ${type} ${leaving ? "leaving" : ""}`}>
            <Icon className="notification__icon" size={NOTIFICATION_UI.ICON_SIZE} strokeWidth={NOTIFICATION_UI.ICON_STROKE_WIDTH} />
            <span className="notification__message">{message}</span>
        </div>
    );
};

export default Notification;
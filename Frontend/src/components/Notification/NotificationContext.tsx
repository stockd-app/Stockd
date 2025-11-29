import React, { createContext, useContext, useState } from "react";
import Notification from "./Notification";
import { NOTIFICATION_TIMEOUTS, type NotificationType } from "../../config/consts";

interface NotificationItem {
    id: string;
    message: string;
    type: NotificationType;
    leaving?: boolean;
}

interface NotificationContextState {
    notify: (message: string, type: NotificationType) => void;
}

const NotificationContext = createContext<NotificationContextState | undefined>(undefined);

export const NotificationProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [notifications, setNotifications] = useState<NotificationItem[]>([]);

    const notify = (message: string, type: NotificationType) => {
        const id = crypto.randomUUID();

        setNotifications(prev => [...prev, { id, message, type }]);

        setTimeout(() => {
            // Add a leaving flag for css
            setNotifications(prev =>
                prev.map(n =>
                    n.id === id ? { ...n, leaving: true } : n
                )
            );

            // Remove after animation
            setTimeout(() => {
                setNotifications(prev =>
                    prev.filter(n => n.id !== id)
                );
            }, NOTIFICATION_TIMEOUTS.EXIT_ANIMATION_MS);

        }, NOTIFICATION_TIMEOUTS.AUTO_REMOVE_MS);
    };

    return (
        <NotificationContext.Provider value={{ notify }}>
            {children}

            <div className="notification__stack">
                {notifications.map(n => (
                    <Notification
                        key={n.id}
                        message={n.message}
                        type={n.type}
                        leaving={n.leaving}
                    />
                ))}
            </div>
        </NotificationContext.Provider>
    );
};

export const useNotification = () => {
    const ctx = useContext(NotificationContext);
    if (!ctx) {
        throw new Error("useNotification must be used inside NotificationProvider");
    }
    return ctx.notify;
};
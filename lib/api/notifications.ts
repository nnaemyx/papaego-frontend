import api from "./client";

export interface Notification {
    id: string;
    userId: string;
    type: string;
    title: string;
    message: string;
    isRead: boolean;
    metadata?: Record<string, unknown>;
    createdAt: string;
}

export const notificationApi = {
    // Get all notifications for the current user
    getNotifications: async (): Promise<Notification[]> => {
        const response = await api.get("/notifications");
        return response.data;
    },

    // Mark a single notification as read
    markAsRead: async (id: string) => {
        const response = await api.patch(`/notifications/${id}/read`);
        return response.data;
    },

    // Mark all notifications as read
    markAllAsRead: async () => {
        const response = await api.post("/notifications/read-all");
        return response.data;
    },
};

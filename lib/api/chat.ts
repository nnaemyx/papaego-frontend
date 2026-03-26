import api from "./client";

export interface ChatMessage {
    id: string;
    tradeId: string;
    senderId: string;
    message: string;
    imageUrl?: string | null;
    role: "CUSTOMER" | "AGENT" | "ADMIN";
    createdAt: string;
}

export const chatApi = {
    /**
     * Send a text message for a specific trade
     */
    sendMessage: async (tradeId: string, message: string, imageUrl?: string) => {
        const response = await api.post("/chat/messages", { tradeId, message, imageUrl });
        return response.data as ChatMessage;
    },

    /**
     * Upload an image to Cloudinary and send as a chat message
     */
    sendImage: async (tradeId: string, file: File): Promise<ChatMessage> => {
        // Step 1: Upload to Cloudinary via the uploads endpoint
        const formData = new FormData();
        formData.append("file", file);
        const uploadRes = await api.post<{ url: string }>("/uploads", formData, {
            headers: { "Content-Type": "multipart/form-data" },
        });
        const imageUrl = uploadRes.data.url;

        // Step 2: Send as a chat message with imageUrl
        const response = await api.post("/chat/messages", {
            tradeId,
            message: "",
            imageUrl,
        });
        return response.data as ChatMessage;
    },

    /**
     * Get all messages for a trade
     */
    getMessages: async (tradeId: string) => {
        const response = await api.get(`/chat/messages/${tradeId}`);
        return response.data as ChatMessage[];
    },
};

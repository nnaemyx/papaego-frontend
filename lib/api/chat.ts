import api from "./client";

export interface ChatMessage {
    id: string;
    tradeId: string;
    senderId: string;
    message: string;
    role: "CUSTOMER" | "AGENT" | "ADMIN";
    createdAt: string;
}

export const chatApi = {
    /**
     * Send a message for a specific trade
     */
    sendMessage: async (tradeId: string, message: string) => {
        const response = await api.post("/chat/messages", { tradeId, message });
        return response.data as ChatMessage;
    },

    /**
     * Get all messages for a trade
     */
    getMessages: async (tradeId: string) => {
        const response = await api.get(`/chat/messages/${tradeId}`);
        return response.data as ChatMessage[];
    }
};

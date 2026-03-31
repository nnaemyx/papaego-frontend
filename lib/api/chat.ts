import api from "./client";

export interface ChatMessage {
    id: string;
    tradeId?: string | null;
    tradeRequestId?: string | null;
    senderId: string;
    message: string;
    imageUrl?: string | null;
    fileUrl?: string | null;
    role: "CUSTOMER" | "AGENT" | "ADMIN";
    createdAt: string;
}

export const chatApi = {
    /**
     * Send a text message for a specific trade or request
     */
    sendMessage: async (payload: { tradeId?: string | null; tradeRequestId?: string | null; message: string; imageUrl?: string; fileUrl?: string }) => {
        const response = await api.post("/chat/messages", payload);
        return response.data as ChatMessage;
    },

    /**
     * Upload an image/file to Cloudinary and send as a chat message
     */
    sendFile: async (payload: { tradeId?: string | null; tradeRequestId?: string | null; file: File; isImage: boolean }): Promise<ChatMessage> => {
        // Step 1: Upload to Cloudinary via the uploads endpoint
        const formData = new FormData();
        formData.append("file", payload.file);
        const uploadRes = await api.post<{ url: string }>("/upload", formData, {
            headers: { "Content-Type": "multipart/form-data" },
        });
        
        // Use generic upload url for file or image
        const fileUrl = uploadRes.data.url;

        // Step 2: Send as a chat message
        const response = await api.post("/chat/messages", {
            tradeId: payload.tradeId,
            tradeRequestId: payload.tradeRequestId,
            message: "",
            imageUrl: payload.isImage ? fileUrl : undefined,
            fileUrl: !payload.isImage ? fileUrl : undefined,
        });
        return response.data as ChatMessage;
    },

    /**
     * Get all messages for a trade or tradeRequest
     */
    getMessages: async (id: string, isTradeRequest = false) => {
        const response = await api.get(`/chat/messages/${id}${isTradeRequest ? "?isTradeRequest=true" : ""}`);
        return response.data as ChatMessage[];
    },
};

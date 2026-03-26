"use client";

import { useEffect, useState, useRef } from "react";
import { Send, Image as ImageIcon, X, Loader2 } from "lucide-react";
import { chatApi, ChatMessage } from "@/lib/api/chat";
import { useAuthStore } from "@/store/auth-store";
import { format } from "date-fns";

interface TransactionChatProps {
    tradeId: string;
}

export function TransactionChat({ tradeId }: TransactionChatProps) {
    const { user } = useAuthStore();
    const [messages, setMessages] = useState<ChatMessage[]>([]);
    const [newMessage, setNewMessage] = useState("");
    const [loading, setLoading] = useState(true);
    const [sendingImage, setSendingImage] = useState(false);
    const [imagePreview, setImagePreview] = useState<{ file: File; url: string } | null>(null);
    const scrollRef = useRef<HTMLDivElement>(null);
    const imageInputRef = useRef<HTMLInputElement>(null);

    const fetchMessages = async () => {
        try {
            const data = await chatApi.getMessages(tradeId);
            setMessages(data);
        } catch (error) {
            console.error("Failed to fetch messages:", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchMessages();
        const interval = setInterval(fetchMessages, 5000);
        return () => clearInterval(interval);
    }, [tradeId]);

    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
        }
    }, [messages]);

    const handleSendMessage = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newMessage.trim() && !imagePreview) return;

        if (imagePreview) {
            // Send image
            setSendingImage(true);
            try {
                const sent = await chatApi.sendImage(tradeId, imagePreview.file);
                setMessages((prev) => [...prev, sent]);
                setImagePreview(null);
                setNewMessage("");
            } catch (error) {
                console.error("Failed to send image:", error);
            } finally {
                setSendingImage(false);
            }
            return;
        }

        try {
            const sent = await chatApi.sendMessage(tradeId, newMessage);
            setMessages((prev) => [...prev, sent]);
            setNewMessage("");
        } catch (error) {
            console.error("Failed to send message:", error);
        }
    };

    const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;
        const url = URL.createObjectURL(file);
        setImagePreview({ file, url });
        // Reset input so same file can be selected again
        e.target.value = "";
    };

    const cancelImagePreview = () => {
        if (imagePreview) {
            URL.revokeObjectURL(imagePreview.url);
            setImagePreview(null);
        }
    };

    return (
        <div
            className="bg-white rounded-2xl border flex flex-col h-[400px] overflow-hidden"
            style={{ borderColor: "#E1E3E6" }}
        >
            {/* Header */}
            <div
                className="px-4 py-3 border-b flex items-center justify-between"
                style={{ borderColor: "#E1E3E6", backgroundColor: "#F7F8F9" }}
            >
                <h3
                    className="text-sm font-bold flex items-center gap-2"
                    style={{ color: "#012333" }}
                >
                    Transaction Chat
                </h3>
                <span className="text-[10px] uppercase font-bold tracking-wider text-[#6B7078]">
                    Real-time Support
                </span>
            </div>

            {/* Messages */}
            <div
                ref={scrollRef}
                className="flex-1 overflow-y-auto p-4 space-y-4 bg-[#fbfcfd]"
            >
                {loading && messages.length === 0 ? (
                    <div className="flex justify-center py-10">
                        <div className="w-6 h-6 border-2 border-[#C9A227] border-t-transparent rounded-full animate-spin" />
                    </div>
                ) : messages.length === 0 ? (
                    <div className="text-center py-10">
                        <p className="text-xs text-[#9AA0A6]">
                            No messages yet. Start the conversation!
                        </p>
                    </div>
                ) : (
                    messages.map((msg) => {
                        const isMe = msg.senderId === user?.id;
                        return (
                            <div
                                key={msg.id}
                                className={`flex flex-col ${isMe ? "items-end" : "items-start"}`}
                            >
                                <div
                                    className={`flex items-start gap-2 max-w-[80%] ${
                                        isMe ? "flex-row-reverse" : "flex-row"
                                    }`}
                                >
                                    <div
                                        className={`w-8 h-8 rounded-full flex-shrink-0 flex items-center justify-center text-[10px] font-bold ${
                                            msg.role === "ADMIN"
                                                ? "bg-red-100 text-red-600"
                                                : msg.role === "AGENT"
                                                ? "bg-[#E1F1FF] text-[#0066CC]"
                                                : "bg-[#E2FDED] text-[#27AE60]"
                                        }`}
                                    >
                                        {msg.role === "ADMIN"
                                            ? "AD"
                                            : msg.role === "AGENT"
                                            ? "AG"
                                            : "CU"}
                                    </div>
                                    <div
                                        className={`p-2 rounded-2xl text-sm overflow-hidden ${
                                            isMe
                                                ? "bg-[#012333] text-white rounded-tr-none"
                                                : "bg-white border rounded-tl-none text-[#012333]"
                                        }`}
                                        style={{
                                            borderColor: isMe ? "transparent" : "#E1E3E6",
                                        }}
                                    >
                                        {msg.imageUrl ? (
                                            <a
                                                href={msg.imageUrl}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="block"
                                            >
                                                <img
                                                    src={msg.imageUrl}
                                                    alt="Shared image"
                                                    className="max-w-[200px] max-h-[200px] rounded-lg object-cover"
                                                />
                                            </a>
                                        ) : (
                                            <span className="break-words">{msg.message}</span>
                                        )}
                                    </div>
                                </div>
                                <span className="text-[10px] text-[#9AA0A6] mt-1 px-10">
                                    {format(new Date(msg.createdAt), "HH:mm")}
                                </span>
                            </div>
                        );
                    })
                )}
            </div>

            {/* Image preview bar */}
            {imagePreview && (
                <div
                    className="px-3 py-2 border-t flex items-center gap-3"
                    style={{ borderColor: "#E1E3E6", backgroundColor: "#F7F8F9" }}
                >
                    <div className="relative">
                        <img
                            src={imagePreview.url}
                            alt="Preview"
                            className="w-12 h-12 object-cover rounded-lg border"
                            style={{ borderColor: "#E1E3E6" }}
                        />
                    </div>
                    <span className="text-xs text-[#6B7078] flex-1 truncate">
                        {imagePreview.file.name}
                    </span>
                    <button
                        type="button"
                        onClick={cancelImagePreview}
                        className="p-1 rounded-full hover:bg-gray-200 transition-colors"
                    >
                        <X className="w-4 h-4 text-[#6B7078]" />
                    </button>
                </div>
            )}

            {/* Input area */}
            <form
                onSubmit={handleSendMessage}
                className="p-3 border-t bg-white"
                style={{ borderColor: "#E1E3E6" }}
            >
                <div className="relative flex items-center gap-2">
                    {/* Image upload button */}
                    <button
                        type="button"
                        onClick={() => imageInputRef.current?.click()}
                        disabled={sendingImage}
                        className="flex-shrink-0 w-8 h-8 flex items-center justify-center rounded-lg transition-colors hover:bg-gray-100 disabled:opacity-50"
                        title="Send image"
                    >
                        <ImageIcon className="w-4 h-4 text-[#9AA0A6]" />
                    </button>
                    <input
                        ref={imageInputRef}
                        type="file"
                        accept="image/jpeg,image/png,image/jpg,image/webp,image/gif"
                        className="hidden"
                        onChange={handleImageSelect}
                    />

                    <input
                        type="text"
                        value={newMessage}
                        onChange={(e) => setNewMessage(e.target.value)}
                        placeholder={imagePreview ? "Add a caption (optional)…" : "Type your message…"}
                        disabled={sendingImage}
                        className="flex-1 pl-4 pr-4 py-3 bg-[#F7F8F9] rounded-xl text-sm focus:outline-none focus:ring-1 focus:ring-[#C9A227] disabled:opacity-60"
                    />

                    <button
                        type="submit"
                        disabled={(!newMessage.trim() && !imagePreview) || sendingImage}
                        className="flex-shrink-0 w-8 h-8 flex items-center justify-center rounded-lg bg-[#012333] text-white disabled:opacity-50 transition-opacity"
                    >
                        {sendingImage ? (
                            <Loader2 className="w-4 h-4 animate-spin" />
                        ) : (
                            <Send className="w-4 h-4" />
                        )}
                    </button>
                </div>
            </form>
        </div>
    );
}

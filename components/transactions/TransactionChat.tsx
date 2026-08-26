"use client";

import { useEffect, useState, useRef } from "react";
import { Send, Image as ImageIcon, Paperclip, X, Loader2, File as FileIcon, MessageCircle } from "lucide-react";
import { chatApi, ChatMessage } from "@/lib/api/chat";
import { useAuthStore } from "@/store/auth-store";
import { format } from "date-fns";
import { formatCurrency, formatExchangeRate } from "@/lib/formatters";

interface TransactionChatProps {
    tradeId?: string;
    tradeRequestId?: string;
    tradeInfo?: {
        amount?: number;
        sendCurrency?: string;
        receiveCurrency?: string;
        fxRate?: string;
        payoutAmount?: number;
        status?: string;
    };
}

export function TransactionChat({ tradeId, tradeRequestId, tradeInfo }: TransactionChatProps) {
    const { user } = useAuthStore();
    const [messages, setMessages] = useState<ChatMessage[]>([]);
    const [newMessage, setNewMessage] = useState("");
    const [loading, setLoading] = useState(true);
    const [sendingFile, setSendingFile] = useState(false);
    const [filePreview, setFilePreview] = useState<{ file: File; url: string; isImage: boolean } | null>(null);
    const scrollRef = useRef<HTMLDivElement>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const activeId = tradeRequestId || tradeId;
    const isTradeRequest = !!tradeRequestId;

    const fetchMessages = async () => {
        if (!activeId) return;
        try {
            const data = await chatApi.getMessages(activeId, isTradeRequest);
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
    }, [activeId, isTradeRequest]);

    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
        }
    }, [messages]);

    const handleSendMessage = async (e: React.FormEvent) => {
        e.preventDefault();
        if ((!newMessage.trim() && !filePreview) || !activeId) return;

        // If user is AGENT, don't allow sending (per requirement)
        if (user?.role === "AGENT") {
            console.error("Agents are not allowed to use chat");
            return;
        }

        if (filePreview) {
            setSendingFile(true);
            try {
                const sent = await chatApi.sendFile({
                    tradeId: tradeId || null,
                    tradeRequestId: tradeRequestId || null,
                    file: filePreview.file,
                    isImage: filePreview.isImage
                });
                setMessages((prev) => [...prev, sent]);
                setFilePreview(null);
                setNewMessage("");
            } catch (error) {
                console.error("Failed to send file:", error);
            } finally {
                setSendingFile(false);
            }
            return;
        }

        try {
            const sent = await chatApi.sendMessage({
                tradeId: tradeId || null,
                tradeRequestId: tradeRequestId || null,
                message: newMessage
            });
            setMessages((prev) => [...prev, sent]);
            setNewMessage("");
        } catch (error) {
            console.error("Failed to send message:", error);
        }
    };

    const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;
        
        const isImage = file.type.startsWith("image/");
        const url = URL.createObjectURL(file);
        
        setFilePreview({ file, url, isImage });
        e.target.value = ""; // Reset input
    };

    const cancelFilePreview = () => {
        if (filePreview) {
            URL.revokeObjectURL(filePreview.url);
            setFilePreview(null);
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
                    <MessageCircle className="w-4 h-4" style={{ color: "#C9A227" }} />
                    Transaction Chat
                </h3>
                <span className="text-[10px] uppercase font-bold tracking-wider text-[#6B7078]">
                    Real-time Support
                </span>
            </div>

            {/* Trade Info Banner */}
            {tradeInfo && (
                <div 
                    className="px-4 py-2 border-b flex flex-wrap items-center gap-x-4 gap-y-1 text-[11px]"
                    style={{ backgroundColor: "#F0F2F5", borderColor: "#E1E3E6" }}
                >
                    {(tradeInfo.amount || tradeInfo.sendCurrency) && (
                        <div className="flex items-center gap-1.5">
                            <span className="font-bold text-[#6B7078]">Trade:</span>
                            <span className="font-medium text-[#012333]">
                                {tradeInfo.amount ?? ""} {tradeInfo.sendCurrency ?? ""} {tradeInfo.receiveCurrency ? `→ ${tradeInfo.receiveCurrency}` : ""}
                            </span>
                        </div>
                    )}
                    {tradeInfo.fxRate && (
                        <div className="flex items-center gap-1.5">
                            <span className="font-bold text-[#6B7078]">Rate:</span>
                            <span className="font-medium text-[#012333]">
                                {formatExchangeRate(Number(tradeInfo.fxRate), tradeInfo.sendCurrency || "NGN", tradeInfo.receiveCurrency || "USD")}
                            </span>
                        </div>
                    )}
                    {tradeInfo.status && (
                        <div className="flex items-center gap-1.5 ml-auto">
                            <span 
                                className="px-1.5 py-0.5 rounded-md font-bold text-[9px] uppercase tracking-wide"
                                style={{ 
                                    backgroundColor: tradeInfo.status === 'COMPLETED' ? '#E2FDED' : '#FFF8E1',
                                    color: tradeInfo.status === 'COMPLETED' ? '#27AE60' : '#F59E0B'
                                }}
                            >
                                {tradeInfo.status.replace(/_/g, ' ')}
                            </span>
                        </div>
                    )}
                </div>
            )}

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
                                        ) : msg.fileUrl ? (
                                            <a
                                                href={msg.fileUrl}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="flex items-center gap-2 p-2 hover:bg-black/5 rounded transition-colors"
                                            >
                                                <FileIcon className="w-5 h-5 flex-shrink-0" />
                                                <span className="underline decoration-1 underline-offset-2">View Attached File</span>
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

            {filePreview && (
                <div
                    className="px-3 py-2 border-t flex items-center gap-3"
                    style={{ borderColor: "#E1E3E6", backgroundColor: "#F7F8F9" }}
                >
                    <div className="relative">
                        {filePreview.isImage ? (
                            <img
                                src={filePreview.url}
                                alt="Preview"
                                className="w-12 h-12 object-cover rounded-lg border"
                                style={{ borderColor: "#E1E3E6" }}
                            />
                        ) : (
                            <div className="w-12 h-12 flex items-center justify-center bg-gray-200 rounded-lg border border-gray-300">
                                <FileIcon className="w-6 h-6 text-gray-500" />
                            </div>
                        )}
                    </div>
                    <span className="text-xs text-[#6B7078] flex-1 truncate">
                        {filePreview.file.name}
                    </span>
                    <button
                        type="button"
                        onClick={cancelFilePreview}
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
                    {/* File upload button */}
                    <button
                        type="button"
                        onClick={() => fileInputRef.current?.click()}
                        disabled={sendingFile}
                        className="flex-shrink-0 w-8 h-8 flex items-center justify-center rounded-lg transition-colors hover:bg-gray-100 disabled:opacity-50"
                        title="Attach file"
                    >
                        <Paperclip className="w-4 h-4 text-[#9AA0A6]" />
                    </button>
                    <input
                        ref={fileInputRef}
                        type="file"
                        accept="image/jpeg,image/png,image/jpg,image/webp,image/gif,application/pdf"
                        className="hidden"
                        onChange={handleFileSelect}
                    />

                    <input
                        type="text"
                        value={newMessage}
                        onChange={(e) => setNewMessage(e.target.value)}
                        placeholder={filePreview ? "Add a caption (optional)…" : "Type your message…"}
                        disabled={sendingFile}
                        className="flex-1 pl-4 pr-4 py-3 bg-[#F7F8F9] rounded-xl text-sm focus:outline-none focus:ring-1 focus:ring-[#C9A227] disabled:opacity-60"
                    />

                    <button
                        type="submit"
                        disabled={(!newMessage.trim() && !filePreview) || sendingFile}
                        className="flex-shrink-0 w-8 h-8 flex items-center justify-center rounded-lg bg-[#012333] text-white disabled:opacity-50 transition-opacity"
                    >
                        {sendingFile ? (
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

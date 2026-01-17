"use client";

import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import api from "@/lib/api/client";
import { useRouter } from "next/navigation";

export default function TradeForm() {
    const router = useRouter();
    const queryClient = useQueryClient();
    const [amount, setAmount] = useState("");
    const [sendCurrency, setSendCurrency] = useState("USD");
    const [receiveCurrency, setReceiveCurrency] = useState("NGN");
    const [quote, setQuote] = useState<any>(null);
    const [error, setError] = useState("");

    const quoteMutation = useMutation({
        mutationFn: async (data: any) => {
            const res = await api.post("/trades/quote", data);
            return res.data;
        },
        onSuccess: (data) => {
            setQuote(data);
            setError("");
        },
        onError: (err: any) => {
            setError(err.response?.data?.error || "Failed to get quote");
        },
    });

    const createTradeMutation = useMutation({
        mutationFn: async (data: any) => {
            const res = await api.post("/trades", data);
            return res.data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["trades"] });
            router.push("/agent/transactions");
        },
        onError: (err: any) => {
            setError(err.response?.data?.error || "Failed to create trade");
        },
    });

    const handleGetQuote = (e: React.FormEvent) => {
        e.preventDefault();
        if (!amount) return;
        quoteMutation.mutate({
            sendCurrency,
            receiveCurrency,
            amount: parseFloat(amount),
        });
    };

    const handleCreateTrade = () => {
        if (!quote) return;
        // Assuming backend handles trade creation from just quote or re-sends params. 
        // Based on backend implementation usually we send params again or quote ID.
        // For now re-sending params.
        createTradeMutation.mutate({
            sendCurrency,
            receiveCurrency,
            amount: parseFloat(amount),
            customerId: "temp-customer-id", // TODO: Select customer logic
        });
    };

    return (
        <div className="p-6 bg-white rounded-lg shadow-sm border border-gray-100">
            <h3 className="text-lg font-bold mb-4">New Trade</h3>

            {error && (
                <div className="p-3 mb-4 text-sm text-red-500 bg-red-50 rounded-md">
                    {error}
                </div>
            )}

            <form onSubmit={handleGetQuote} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Send</label>
                        <select
                            value={sendCurrency}
                            onChange={(e) => setSendCurrency(e.target.value)}
                            className="w-full mt-1 border rounded-md p-2"
                        >
                            <option value="USD">USD</option>
                            <option value="GBP">GBP</option>
                            <option value="EUR">EUR</option>
                        </select>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Receive</label>
                        <select
                            value={receiveCurrency}
                            onChange={(e) => setReceiveCurrency(e.target.value)}
                            className="w-full mt-1 border rounded-md p-2"
                        >
                            <option value="NGN">NGN</option>
                        </select>
                    </div>
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700">Amount</label>
                    <input
                        type="number"
                        value={amount}
                        onChange={(e) => setAmount(e.target.value)}
                        className="w-full mt-1 border rounded-md p-2"
                        placeholder="1000"
                        required
                        min="1"
                    />
                </div>

                <button
                    type="submit"
                    disabled={quoteMutation.isPending}
                    className="w-full px-4 py-2 text-white bg-blue-600 rounded-md hover:bg-blue-700 disabled:opacity-50"
                >
                    {quoteMutation.isPending ? "Getting Quote..." : "Get Quote"}
                </button>
            </form>

            {quote && (
                <div className="mt-6 p-4 bg-gray-50 rounded-md border border-gray-200">
                    <p className="text-sm text-gray-600">Exchange Rate</p>
                    <p className="text-xl font-bold">1 {sendCurrency} = {quote.rate} {receiveCurrency}</p>

                    <div className="mt-4 pt-4 border-t border-gray-200 flex justify-between items-center">
                        <div>
                            <p className="text-sm text-gray-600">Total Receiver Gets</p>
                            <p className="text-lg font-bold text-green-600">
                                {quote.totalReceive} {receiveCurrency}
                            </p>
                        </div>
                        <button
                            onClick={handleCreateTrade}
                            disabled={createTradeMutation.isPending}
                            className="px-4 py-2 text-white bg-green-600 rounded-md hover:bg-green-700 disabled:opacity-50"
                        >
                            {createTradeMutation.isPending ? "Processing..." : "Confirm Trade"}
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}

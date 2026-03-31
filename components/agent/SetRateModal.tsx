"use client";

import { useState, useEffect } from "react";
import { X, RefreshCw, Calculator } from "lucide-react";
import { agentApi } from "@/lib/api/agent";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

interface SetRateModalProps {
    request: {
        id: string;
        amount: string;
        sendCurrency: string;
        receiveCurrency: string;
        customer: {
            firstName: string;
            lastName: string;
        };
    };
    onClose: () => void;
    onSuccess: () => void;
}

export function SetRateModal({ request, onClose, onSuccess }: SetRateModalProps) {
    const [fxRate, setFxRate] = useState("");
    const [payoutAmount, setPayoutAmount] = useState("");
    const [submitting, setSubmitting] = useState(false);

    // Auto-calculate payout amount when rate changes
    useEffect(() => {
        const rate = parseFloat(fxRate);
        const amount = parseFloat(request.amount);
        if (!isNaN(rate) && !isNaN(amount) && rate > 0) {
            // Because rate represents "1 Foreign = X NGN"
            // If sending NGN, Payout = Amount / Rate (e.g. 900 NGN / 1800 = 0.5 EUR)
            // If receiving NGN, Payout = Amount * Rate (e.g. 100 EUR * 1800 = 180,000 NGN)
            if (request.sendCurrency.toUpperCase() === "NGN") {
                setPayoutAmount((amount / rate).toFixed(2));
            } else {
                setPayoutAmount((amount * rate).toFixed(2));
            }
        } else {
            setPayoutAmount("");
        }
    }, [fxRate, request.amount, request.sendCurrency]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!fxRate || parseFloat(fxRate) <= 0) {
            toast.error("Please enter a valid FX rate");
            return;
        }

        setSubmitting(true);
        try {
            await agentApi.setTradeRequestRate(request.id, fxRate, payoutAmount);
            toast.success("Quote submitted successfully! Admin will be notified.");
            onSuccess();
            onClose();
        } catch (error) {
            console.error("Failed to set rate:", error);
            toast.error("Failed to submit quote. Please try again.");
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
            <div className="w-full max-w-md bg-white rounded-2xl shadow-xl overflow-hidden animate-in fade-in zoom-in duration-200">
                {/* Header */}
                <div className="px-6 py-4 border-b flex items-center justify-between bg-gray-50">
                    <h3 className="font-bold text-[#012333]">Set Exchange Rate</h3>
                    <button onClick={onClose} className="p-1 hover:bg-gray-200 rounded-full transition-colors">
                        <X className="w-5 h-5 text-gray-500" />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="p-6 space-y-5">
                    <div className="bg-amber-50 p-4 rounded-xl border border-amber-100 mb-2">
                        <div className="flex justify-between items-center mb-1">
                            <span className="text-xs text-amber-600 font-bold uppercase tracking-wider">Customer</span>
                            <span className="text-xs text-amber-700 font-medium">{request.customer.firstName} {request.customer.lastName}</span>
                        </div>
                        <div className="flex justify-between items-center">
                            <span className="text-xs text-amber-600 font-bold uppercase tracking-wider">Amount to Swap</span>
                            <span className="text-sm font-black text-[#012333]">{request.amount} {request.sendCurrency}</span>
                        </div>
                    </div>

                    <div className="space-y-4">
                        <div>
                            <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5">
                                FX Rate (1 {request.sendCurrency.toUpperCase() === 'NGN' ? request.receiveCurrency : request.sendCurrency} = ? NGN)
                            </label>
                            <div className="relative">
                                <div className="absolute left-3 top-1/2 -translate-y-1/2">
                                    <Calculator className="w-4 h-4 text-gray-400" />
                                </div>
                                <input
                                    type="number"
                                    step="0.0001"
                                    value={fxRate}
                                    onChange={(e) => setFxRate(e.target.value)}
                                    placeholder="Enter current rate..."
                                    className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#C9A227] focus:border-transparent transition-all"
                                    required
                                    autoFocus
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5">
                                Payout Amount ({request.receiveCurrency})
                            </label>
                            <div className="relative">
                                <div className="absolute left-3 top-1/2 -translate-y-1/2 font-bold text-gray-400 text-xs">
                                    {request.receiveCurrency}
                                </div>
                                <input
                                    type="text"
                                    value={payoutAmount}
                                    readOnly
                                    className="w-full pl-12 pr-4 py-3 bg-gray-100 border border-gray-200 rounded-xl text-sm font-bold text-[#012333] outline-none"
                                />
                                <p className="text-[10px] text-gray-400 mt-1">
                                    Automatically calculated based on the rate above.
                                </p>
                            </div>
                        </div>
                    </div>

                    <div className="flex gap-3 pt-2">
                        <Button
                            type="button"
                            variant="outline"
                            onClick={onClose}
                            className="flex-1 rounded-xl h-12 font-bold"
                        >
                            Cancel
                        </Button>
                        <Button
                            type="submit"
                            disabled={submitting || !fxRate}
                            className="flex-1 bg-[#012333] hover:bg-[#02334a] text-white rounded-xl h-12 font-bold"
                        >
                            {submitting ? (
                                <RefreshCw className="w-4 h-4 animate-spin mr-2" />
                            ) : null}
                            {submitting ? "Submitting..." : "Submit Quote"}
                        </Button>
                    </div>
                </form>
            </div>
        </div>
    );
}

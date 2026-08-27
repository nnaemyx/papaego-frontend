"use client";

import React, { useState } from "react";
import { X, Wallet, CreditCard, Sparkles, CheckCircle2, RefreshCw } from "lucide-react";
import { customerApi } from "@/lib/api/customer";
import { loadPaystackInline } from "@/lib/paystack";
import { toast } from "sonner";

interface PapaEgoFundModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSuccess?: () => void;
}

const PRESET_AMOUNTS = [50000, 100000, 250000, 500000, 1000000, 2500000];

export function PapaEgoFundModal({ isOpen, onClose, onSuccess }: PapaEgoFundModalProps) {
    const [amount, setAmount] = useState<string>("100000");
    const [submitting, setSubmitting] = useState(false);

    if (!isOpen) return null;

    const handlePaystackDeposit = async () => {
        const parsed = parseFloat(amount);
        if (!parsed || isNaN(parsed) || parsed < 100) {
            toast.error("Please enter a valid deposit amount (min ₦100).");
            return;
        }

        setSubmitting(true);
        try {
            const init = await customerApi.initializePaystackDeposit(parsed);
            const PaystackPop = await loadPaystackInline();
            if (!PaystackPop) {
                toast.error("Could not load Paystack SDK. Please check your internet connection.");
                setSubmitting(false);
                return;
            }

            const rawKey = init.publicKey || process.env.NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY || "pk_test_2250be21340e86249354313ff63bd93bc8656a15";
            const publicKey = rawKey.trim();
            const email = (init.email || "customer@papaego.com").trim();

            const onPaymentSuccess = async (txRef: string) => {
                toast.loading("Verifying Paystack deposit...");
                try {
                    await customerApi.verifyPaystackDeposit(txRef, init.amount);
                    toast.dismiss();
                    toast.success(`Successfully deposited ₦${init.amount.toLocaleString()} into your ledger!`);
                    onSuccess?.();
                    onClose();
                } catch {
                    toast.dismiss();
                    toast.error("Deposit verification failed. Please refresh your ledger balance.");
                } finally {
                    setSubmitting(false);
                }
            };

            if (typeof PaystackPop.setup === "function") {
                const handler = PaystackPop.setup({
                    key: publicKey,
                    email: email,
                    amount: Math.round(init.amount * 100),
                    ref: init.reference,
                    currency: "NGN",
                    callback: (response: any) => onPaymentSuccess(response.reference || init.reference),
                    onClose: () => setSubmitting(false),
                });
                handler.openIframe();
            } else if (typeof PaystackPop === "function") {
                const popup = new PaystackPop();
                popup.newTransaction({
                    key: publicKey,
                    email: email,
                    amount: Math.round(init.amount * 100),
                    reference: init.reference,
                    currency: "NGN",
                    onSuccess: (transaction: any) => onPaymentSuccess(transaction.reference || init.reference),
                    onCancel: () => setSubmitting(false),
                });
            }
        } catch (err: any) {
            console.error("Paystack deposit initialization error:", err);
            const errMsg = err?.response?.data?.error || err?.message || "Failed to initialize Paystack deposit";
            toast.error(errMsg);
            setSubmitting(false);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in font-sans">
            <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200 space-y-5">
                {/* Header */}
                <div className="flex items-center justify-between border-b pb-4">
                    <div className="flex items-center gap-2.5">
                        <div className="p-2 rounded-xl bg-amber-50 border border-amber-200 text-[#C9A227]">
                            <Wallet className="w-5 h-5" />
                        </div>
                        <div>
                            <h3 className="font-bold text-base text-slate-900">Fund Your NGN Ledger</h3>
                            <p className="text-xs text-slate-500">Instant automated credit via Paystack</p>
                        </div>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-1.5 rounded-lg text-slate-400 hover:bg-slate-100 transition-colors"
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>

                {/* Amount Input */}
                <div className="space-y-2">
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-600">
                        Deposit Amount (NGN)
                    </label>
                    <div className="relative">
                        <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 font-bold text-sm">
                            ₦
                        </span>
                        <input
                            type="number"
                            min="100"
                            step="100"
                            value={amount}
                            onChange={(e) => setAmount(e.target.value)}
                            placeholder="0.00"
                            className="w-full pl-8 pr-4 py-2.5 rounded-xl border border-slate-200 font-bold text-base text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#C9A227]/40 focus:border-[#C9A227]"
                        />
                    </div>
                </div>

                {/* Quick Preset Buttons */}
                <div className="space-y-1.5">
                    <label className="block text-[11px] font-semibold text-slate-500">
                        Quick Select
                    </label>
                    <div className="grid grid-cols-3 gap-2">
                        {PRESET_AMOUNTS.map((preset) => (
                            <button
                                key={preset}
                                type="button"
                                onClick={() => setAmount(preset.toString())}
                                className={`py-1.5 px-2 rounded-lg text-xs font-semibold border transition-all ${
                                    amount === preset.toString()
                                        ? "bg-amber-50 border-[#C9A227] text-[#C9A227]"
                                        : "bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100"
                                }`}
                            >
                                ₦{preset.toLocaleString()}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Paystack Info Box */}
                <div className="p-3.5 rounded-xl bg-emerald-50/70 border border-emerald-200 text-xs text-emerald-900 flex items-start gap-2.5">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                    <div>
                        <strong>Instant Deposit:</strong> Pay securely with debit card, USSD, or direct bank transfer via Paystack. Funds reflect immediately in your spendable ledger balance.
                    </div>
                </div>

                {/* Action Buttons */}
                <div className="flex gap-3 pt-2">
                    <button
                        type="button"
                        onClick={onClose}
                        className="flex-1 py-3 rounded-xl border border-slate-200 text-slate-700 font-bold text-xs hover:bg-slate-50 transition-colors"
                    >
                        Cancel
                    </button>
                    <button
                        type="button"
                        disabled={submitting || !amount || parseFloat(amount) <= 0}
                        onClick={handlePaystackDeposit}
                        className="flex-[2] py-3 rounded-xl bg-[#C9A227] hover:bg-[#b08e20] text-white font-bold text-xs flex items-center justify-center gap-2 shadow-sm transition-all disabled:opacity-50"
                    >
                        {submitting ? (
                            <RefreshCw className="w-4 h-4 animate-spin" />
                        ) : (
                            <CreditCard className="w-4 h-4" />
                        )}
                        {submitting
                            ? "Connecting to Paystack..."
                            : `Pay ₦${amount ? Number(amount).toLocaleString() : "0"} with Paystack`}
                    </button>
                </div>
            </div>
        </div>
    );
}

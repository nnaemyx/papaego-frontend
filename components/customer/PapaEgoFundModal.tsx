"use client";

import React, { useState } from "react";
import { X, Wallet, Building, CheckCircle2, RefreshCw, Copy, Check, Clock, ShieldCheck } from "lucide-react";
import { customerApi } from "@/lib/api/customer";
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
    const [moneyPingsAccount, setMoneyPingsAccount] = useState<{
        accountNumber: string;
        accountName: string;
        bankName: string;
        amount: number;
        expiresAt: string;
        reference: string;
    } | null>(null);
    const [copied, setCopied] = useState(false);

    if (!isOpen) return null;

    const handleMoneyPingsDeposit = async () => {
        const parsed = parseFloat(amount);
        if (!parsed || isNaN(parsed) || parsed < 100) {
            toast.error("Please enter a valid deposit amount (min ₦100).");
            return;
        }

        setSubmitting(true);
        try {
            const data = await customerApi.initMoneyPingsDeposit(parsed);
            setMoneyPingsAccount(data);
            toast.success("Dedicated MoneyPings deposit account generated!");
        } catch (err: any) {
            console.error("MoneyPings deposit initialization error:", err);
            const errMsg = err?.response?.data?.error || err?.response?.data?.details || err?.message || "Failed to generate MoneyPings deposit account";
            toast.error(errMsg);
        } finally {
            setSubmitting(false);
        }
    };

    const handleCopyAccount = (acc: string) => {
        navigator.clipboard.writeText(acc);
        setCopied(true);
        toast.success("Account number copied to clipboard!");
        setTimeout(() => setCopied(false), 2000);
    };

    const handleClose = () => {
        setMoneyPingsAccount(null);
        onClose();
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
                            <p className="text-xs text-slate-500">Dedicated bank transfer rail via MoneyPings</p>
                        </div>
                    </div>
                    <button
                        onClick={handleClose}
                        className="p-1.5 rounded-lg text-slate-400 hover:bg-slate-100 transition-colors"
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>

                {moneyPingsAccount ? (
                    /* Account Generated View */
                    <div className="space-y-4 animate-fade-in">
                        <div className="p-4 rounded-xl bg-amber-50/70 border border-amber-200/80 space-y-3">
                            <div className="flex items-center justify-between text-xs text-amber-900 font-semibold border-b pb-2 border-amber-200/60">
                                <span className="uppercase text-[10px] tracking-wider">Dedicated Virtual Account</span>
                                <span className="flex items-center gap-1 font-mono text-[11px]">
                                    <Clock className="w-3.5 h-3.5" /> ~5 hrs expiry
                                </span>
                            </div>

                            <div className="space-y-2.5">
                                <div>
                                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                                        Bank Name
                                    </span>
                                    <p className="text-sm font-bold text-slate-900 flex items-center gap-1.5 mt-0.5">
                                        <Building className="w-4 h-4 text-[#C9A227]" />
                                        {moneyPingsAccount.bankName || "Providus Bank / Wema Bank"}
                                    </p>
                                </div>

                                <div>
                                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                                        Virtual Account Number
                                    </span>
                                    <div className="flex items-center justify-between mt-0.5 bg-white p-2.5 rounded-lg border border-slate-200 shadow-sm">
                                        <span className="font-mono text-lg font-extrabold text-slate-900 tracking-wider">
                                            {moneyPingsAccount.accountNumber}
                                        </span>
                                        <button
                                            type="button"
                                            onClick={() => handleCopyAccount(moneyPingsAccount.accountNumber)}
                                            className="inline-flex items-center gap-1 px-3 py-1 text-xs font-bold text-[#C9A227] hover:bg-amber-50 rounded-md border border-[#C9A227]/40 transition-colors"
                                        >
                                            {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                                            {copied ? "Copied" : "Copy"}
                                        </button>
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-2">
                                    <div>
                                        <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                                            Account Name
                                        </span>
                                        <p className="text-xs font-bold text-slate-800 truncate mt-0.5">
                                            {moneyPingsAccount.accountName || "PapaEgo / Customer"}
                                        </p>
                                    </div>
                                    <div>
                                        <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                                            Amount
                                        </span>
                                        <p className="text-xs font-black text-emerald-600 font-mono mt-0.5">
                                            ₦{Number(moneyPingsAccount.amount || amount).toLocaleString()}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-600 flex items-start gap-2">
                            <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                            <span>
                                Transfer exact amount from your mobile banking app. MoneyPings will verify and credit your ledger automatically.
                            </span>
                        </div>

                        <div className="flex gap-3 pt-2">
                            <button
                                type="button"
                                onClick={() => setMoneyPingsAccount(null)}
                                className="flex-1 py-3 rounded-xl border border-slate-200 text-slate-700 font-bold text-xs hover:bg-slate-50 transition-colors"
                            >
                                Change Amount
                            </button>
                            <button
                                type="button"
                                onClick={() => {
                                    onSuccess?.();
                                    handleClose();
                                    toast.success("Deposit submitted! Balance will refresh shortly.");
                                }}
                                className="flex-[2] py-3 rounded-xl bg-[#C9A227] hover:bg-[#b08e20] text-white font-bold text-xs flex items-center justify-center gap-2 shadow-sm transition-all"
                            >
                                <CheckCircle2 className="w-4 h-4" />
                                I Have Transferred Funds
                            </button>
                        </div>
                    </div>
                ) : (
                    /* Initial Amount Form */
                    <div className="space-y-5">
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

                        {/* MoneyPings Info Box */}
                        <div className="p-3.5 rounded-xl bg-emerald-50/70 border border-emerald-200 text-xs text-emerald-900 flex items-start gap-2.5">
                            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                            <div>
                                <strong>MoneyPings Direct Rail:</strong> Zero card charges. We generate a dedicated virtual bank account number. When you transfer funds from your bank, your ledger credits in seconds.
                            </div>
                        </div>

                        {/* Action Buttons */}
                        <div className="flex gap-3 pt-2">
                            <button
                                type="button"
                                onClick={handleClose}
                                className="flex-1 py-3 rounded-xl border border-slate-200 text-slate-700 font-bold text-xs hover:bg-slate-50 transition-colors"
                            >
                                Cancel
                            </button>
                            <button
                                type="button"
                                disabled={submitting || !amount || parseFloat(amount) <= 0}
                                onClick={handleMoneyPingsDeposit}
                                className="flex-[2] py-3 rounded-xl bg-[#C9A227] hover:bg-[#b08e20] text-white font-bold text-xs flex items-center justify-center gap-2 shadow-sm transition-all disabled:opacity-50"
                            >
                                {submitting ? (
                                    <RefreshCw className="w-4 h-4 animate-spin" />
                                ) : (
                                    <Building className="w-4 h-4" />
                                )}
                                {submitting
                                    ? "Generating Dedicated Account..."
                                    : `Generate Deposit Account (₦${amount ? Number(amount).toLocaleString() : "0"})`}
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}

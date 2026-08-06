"use client";

import React, { useState } from "react";
import { X, Copy, Check, Building2, Wallet, Landmark, Info } from "lucide-react";
import { toast } from "sonner";

interface PapaEgoFundModalProps {
    isOpen: boolean;
    onClose: () => void;
}

export function PapaEgoFundModal({ isOpen, onClose }: PapaEgoFundModalProps) {
    const [copiedIndex, setCopiedIndex] = useState<number | null>(null);

    if (!isOpen) return null;

    const treasuryAccounts = [
        {
            bankName: "Guaranty Trust Bank (GTBank)",
            accountName: "PapaEgo Treasury Limited",
            accountNumber: "0123456789",
            currency: "NGN",
            type: "Bank Transfer"
        },
        {
            bankName: "Access Bank Plc",
            accountName: "PapaEgo Global Operations",
            accountNumber: "1489023411",
            currency: "NGN",
            type: "Bank Transfer"
        },
        {
            bankName: "FV Bank U.S.",
            accountName: "PapaEgo Treasury Settlement",
            accountNumber: "021000021-9981",
            currency: "USD",
            type: "Wire / ACH Transfer"
        }
    ];

    const handleCopy = (text: string, index: number) => {
        navigator.clipboard.writeText(text);
        setCopiedIndex(index);
        toast.success("Account details copied to clipboard!");
        setTimeout(() => setCopiedIndex(null), 2000);
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in font-sans">
            <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 space-y-6">
                
                {/* Header */}
                <div className="flex items-center justify-between border-b pb-4">
                    <div className="flex items-center gap-2.5">
                        <div className="p-2 rounded-xl bg-amber-50 border border-amber-200 text-[#C9A227]">
                            <Landmark className="w-5 h-5" />
                        </div>
                        <div>
                            <h3 className="font-bold text-base text-slate-900">Fund Your PapaEgo Ledger Balance</h3>
                            <p className="text-xs text-slate-500">Transfer funds to any PapaEgo account below</p>
                        </div>
                    </div>
                    <button onClick={onClose} className="p-1.5 rounded-lg text-slate-400 hover:bg-slate-100 transition-colors">
                        <X className="w-5 h-5" />
                    </button>
                </div>

                {/* Instructions Alert */}
                <div className="flex items-start gap-3 p-3.5 rounded-xl bg-blue-50/80 border border-blue-200 text-xs text-blue-800">
                    <Info className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
                    <div>
                        <strong>Automatic Ledger Credit:</strong> Once your transfer is received, your PapaEgo ledger balance will be credited automatically. Use your ledger balance to initiate trades and pay international suppliers.
                    </div>
                </div>

                {/* Accounts List */}
                <div className="space-y-3.5">
                    {treasuryAccounts.map((acc, index) => (
                        <div key={index} className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-2 hover:border-[#C9A227] transition-all">
                            <div className="flex items-center justify-between">
                                <span className="font-bold text-xs text-slate-900 flex items-center gap-1.5">
                                    <Building2 className="w-3.5 h-3.5 text-[#C9A227]" />
                                    {acc.bankName}
                                </span>
                                <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-100 text-emerald-800">
                                    {acc.currency} • {acc.type}
                                </span>
                            </div>

                            <div className="text-xs text-slate-600">
                                Account Name: <span className="font-semibold text-slate-800">{acc.accountName}</span>
                            </div>

                            <div className="flex items-center justify-between bg-white p-2.5 rounded-lg border border-slate-200">
                                <span className="font-mono text-sm font-bold text-slate-900">{acc.accountNumber}</span>
                                <button
                                    onClick={() => handleCopy(acc.accountNumber, index)}
                                    className="flex items-center gap-1 text-xs font-semibold text-[#C9A227] hover:underline"
                                >
                                    {copiedIndex === index ? (
                                        <>
                                            <Check className="w-3.5 h-3.5 text-emerald-600" />
                                            Copied
                                        </>
                                    ) : (
                                        <>
                                            <Copy className="w-3.5 h-3.5" />
                                            Copy
                                        </>
                                    )}
                                </button>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Close Button */}
                <button
                    onClick={onClose}
                    className="w-full py-3 rounded-xl bg-[#012333] hover:bg-[#02354d] text-white font-bold text-xs transition-colors"
                >
                    Done / Close
                </button>
            </div>
        </div>
    );
}

"use client";

import React, { useState, useEffect } from "react";
import { X, Loader2, AlertCircle, CheckCircle2 } from "lucide-react";
import { customerApi } from "@/lib/api/customer";

interface Supplier {
    id: string;
    beneficiaryName: string;
    bankName?: string;
    accountNumber?: string;
    iban?: string;
    swiftBic?: string;
    routingCode?: string;
    currency?: string;
    address?: string;
}

interface SupplierModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSave: (supplierData: Partial<Supplier>) => Promise<void>;
    initialData?: Supplier | null;
}

export function SupplierModal({ isOpen, onClose, onSave, initialData }: SupplierModalProps) {
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState<Partial<Supplier>>({
        beneficiaryName: "",
        bankName: "",
        accountNumber: "",
        iban: "",
        swiftBic: "",
        routingCode: "",
        currency: "USD",
        address: "",
    });
    const [existingSuppliers, setExistingSuppliers] = useState<Supplier[]>([]);
    const [swiftError, setSwiftError] = useState<string | null>(null);
    const [swiftInfo, setSwiftInfo] = useState<{ bank: string; country: string; location: string; branch: string } | null>(null);

    const validateSwift = (code: string) => {
        if (!code) {
            setSwiftError(null);
            setSwiftInfo(null);
            return;
        }
        const cleanCode = code.trim().toUpperCase();
        const swiftRegex = /^[A-Z]{6}[A-Z0-9]{2}([A-Z0-9]{3})?$/;
        if (!swiftRegex.test(cleanCode)) {
            setSwiftError("Invalid SWIFT/BIC format. Must be 8 or 11 alphanumeric characters.");
            setSwiftInfo(null);
        } else {
            setSwiftError(null);
            setSwiftInfo({
                bank: cleanCode.substring(0, 4),
                country: cleanCode.substring(4, 6),
                location: cleanCode.substring(6, 8),
                branch: cleanCode.length === 11 ? cleanCode.substring(8, 11) : "Primary"
            });
        }
    };

    useEffect(() => {
        if (isOpen) {
            // Load existing suppliers for duplicate pre-check
            customerApi.getSuppliers().then(setExistingSuppliers).catch(() => {});

            if (initialData) {
                setFormData(initialData);
                if (initialData.swiftBic) {
                    validateSwift(initialData.swiftBic);
                } else {
                    setSwiftError(null);
                    setSwiftInfo(null);
                }
            } else {
                setFormData({
                    beneficiaryName: "",
                    bankName: "",
                    accountNumber: "",
                    iban: "",
                    swiftBic: "",
                    routingCode: "",
                    currency: "USD",
                    address: "",
                });
                setSwiftError(null);
                setSwiftInfo(null);
            }
        }
    }, [isOpen, initialData]);

    const isDuplicate = existingSuppliers.some((s) => 
        s.id !== initialData?.id &&
        s.bankName?.toLowerCase().trim() === formData.bankName?.toLowerCase().trim() &&
        s.accountNumber?.trim() === formData.accountNumber?.trim() &&
        formData.bankName?.trim() &&
        formData.accountNumber?.trim()
    );

    const handleSwiftChange = (val: string) => {
        setFormData({ ...formData, swiftBic: val });
        validateSwift(val);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (swiftError) return;
        setLoading(true);
        try {
            await onSave(formData);
            onClose();
        } finally {
            setLoading(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />

            <div className="bg-white w-full max-w-2xl rounded-2xl shadow-2xl relative flex flex-col max-h-[90vh]">
                {/* Header */}
                <div className="flex items-center justify-between p-6 border-b" style={{ borderColor: "#E1E3E6" }}>
                    <div>
                        <h2 className="text-xl font-bold" style={{ color: "var(--text-primary)" }}>
                            {initialData ? "Edit Supplier" : "Add New Supplier"}
                        </h2>
                        <p className="body-secondary mt-1">Enter the recipient details for future trades.</p>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                    >
                        <X className="w-5 h-5 text-gray-500" />
                    </button>
                </div>

                {/* Body */}
                <div className="p-6 overflow-y-auto custom-scrollbar">
                    <form id="supplier-form" onSubmit={handleSubmit} className="space-y-5">
                        <div className="space-y-1.5">
                            <label className="text-sm font-semibold text-[#012333]">
                                Beneficiary Name <span className="text-red-500">*</span>
                            </label>
                            <input
                                required
                                type="text"
                                value={formData.beneficiaryName}
                                onChange={(e) => setFormData({ ...formData, beneficiaryName: e.target.value })}
                                placeholder="Full Name or Company Name"
                                className="w-full h-12 px-4 rounded-xl border bg-gray-50 focus:bg-white transition-all outline-none focus:ring-2"
                                style={{ borderColor: "#E1E3E6" }}
                            />
                        </div>

                        <div className="space-y-1.5">
                            <label className="text-sm font-semibold text-[#012333]">Beneficiary Address</label>
                            <input
                                type="text"
                                value={formData.address || ""}
                                onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                                placeholder="Full Address"
                                className="w-full h-12 px-4 rounded-xl border bg-gray-50 focus:bg-white transition-all outline-none focus:ring-2"
                                style={{ borderColor: "#E1E3E6" }}
                            />
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                            <div className="space-y-1.5 md:col-span-2">
                                {isDuplicate && (
                                    <div className="flex items-center gap-2 p-4 bg-amber-50 border border-amber-200 rounded-xl text-sm text-amber-700">
                                        <AlertCircle className="w-5 h-5 shrink-0 text-amber-500 animate-bounce" />
                                        <div>
                                            <span className="font-bold">Duplicate Supplier Warning:</span> A supplier with this Bank Name and Account Number already exists.
                                        </div>
                                    </div>
                                )}
                            </div>

                            <div className="space-y-1.5">
                                <label className="text-sm font-semibold text-[#012333]">
                                    Bank Name <span className="text-red-500">*</span>
                                </label>
                                <input
                                    required
                                    type="text"
                                    value={formData.bankName || ""}
                                    onChange={(e) => setFormData({ ...formData, bankName: e.target.value })}
                                    placeholder="e.g. Chase Bank"
                                    className="w-full h-12 px-4 rounded-xl border bg-gray-50 focus:bg-white transition-all outline-none focus:ring-2 focus:ring-[#C9A227]/50"
                                    style={{ borderColor: "#E1E3E6" }}
                                />
                            </div>

                            <div className="space-y-1.5">
                                <label className="text-sm font-semibold text-[#012333]">
                                    Account Number <span className="text-red-500">*</span>
                                </label>
                                <input
                                    required
                                    type="text"
                                    value={formData.accountNumber || ""}
                                    onChange={(e) => setFormData({ ...formData, accountNumber: e.target.value })}
                                    placeholder="Enter account number"
                                    className="w-full h-12 px-4 rounded-xl border bg-gray-50 focus:bg-white transition-all outline-none focus:ring-2 focus:ring-[#C9A227]/50"
                                    style={{ borderColor: "#E1E3E6" }}
                                />
                            </div>

                            <div className="space-y-1.5">
                                <label className="text-sm font-semibold text-[#012333]">IBAN</label>
                                <input
                                    type="text"
                                    value={formData.iban || ""}
                                    onChange={(e) => setFormData({ ...formData, iban: e.target.value })}
                                    placeholder="For Europe and international"
                                    className="w-full h-12 px-4 rounded-xl border bg-gray-50 focus:bg-white transition-all outline-none focus:ring-2 focus:ring-[#C9A227]/50"
                                    style={{ borderColor: "#E1E3E6" }}
                                />
                            </div>

                            <div className="space-y-1.5">
                                <label className="text-sm font-semibold text-[#012333]">SWIFT / BIC</label>
                                <input
                                    type="text"
                                    value={formData.swiftBic || ""}
                                    onChange={(e) => handleSwiftChange(e.target.value)}
                                    placeholder="8 or 11 characters"
                                    className={`w-full h-12 px-4 rounded-xl border bg-gray-50 focus:bg-white transition-all outline-none focus:ring-2 ${
                                        swiftError ? "border-rose-400 focus:ring-rose-200" : swiftInfo ? "border-emerald-400 focus:ring-emerald-200" : "focus:ring-[#C9A227]/50"
                                    }`}
                                    style={{ borderColor: swiftError ? "#EF4444" : swiftInfo ? "#10B981" : "#E1E3E6" }}
                                />
                                {swiftError && (
                                    <p className="text-xs text-rose-500 font-medium flex items-center gap-1 mt-1">
                                        <AlertCircle className="w-3.5 h-3.5" /> {swiftError}
                                    </p>
                                )}
                                {swiftInfo && (
                                    <div className="mt-2 p-3 bg-emerald-50/50 border border-emerald-100 rounded-xl text-xs text-emerald-800 space-y-1">
                                        <p className="font-bold flex items-center gap-1 text-emerald-700">
                                            <CheckCircle2 className="w-3.5 h-3.5" /> SWIFT Code Validated
                                        </p>
                                        <div className="grid grid-cols-2 gap-2 font-mono text-[11px] mt-1.5">
                                            <div>Bank: <span className="font-bold">{swiftInfo.bank}</span></div>
                                            <div>Country: <span className="font-bold">{swiftInfo.country}</span></div>
                                            <div>Location: <span className="font-bold">{swiftInfo.location}</span></div>
                                            <div>Branch: <span className="font-bold">{swiftInfo.branch}</span></div>
                                        </div>
                                    </div>
                                )}
                            </div>

                            <div className="space-y-1.5">
                                <label className="text-sm font-semibold text-[#012333]">Routing Code</label>
                                <input
                                    type="text"
                                    value={formData.routingCode || ""}
                                    onChange={(e) => setFormData({ ...formData, routingCode: e.target.value })}
                                    placeholder="e.g. ABA / CLABE"
                                    className="w-full h-12 px-4 rounded-xl border bg-gray-50 focus:bg-white transition-all outline-none focus:ring-2 focus:ring-[#C9A227]/50"
                                    style={{ borderColor: "#E1E3E6" }}
                                />
                            </div>

                            <div className="space-y-1.5">
                                <label className="text-sm font-semibold text-[#012333]">
                                    Expected Currency <span className="text-red-500">*</span>
                                </label>
                                <select
                                    required
                                    value={formData.currency || "USD"}
                                    onChange={(e) => setFormData({ ...formData, currency: e.target.value })}
                                    className="w-full h-12 px-4 rounded-xl border bg-gray-50 focus:bg-white transition-all outline-none focus:ring-2 focus:ring-[#C9A227]/50"
                                    style={{ borderColor: "#E1E3E6" }}
                                >
                                    <option value="USD">USD - US Dollar</option>
                                    <option value="EUR">EUR - Euro</option>
                                    <option value="GBP">GBP - British Pound</option>
                                    <option value="CAD">CAD - Canadian Dollar</option>
                                    <option value="AED">AED - UAE Dirham</option>
                                    <option value="NGN">NGN - Nigerian Naira</option>
                                </select>
                            </div>
                        </div>
                    </form>
                </div>

                {/* Footer */}
                <div className="p-6 border-t flex justify-end gap-3" style={{ borderColor: "#E1E3E6" }}>
                    <button
                        type="button"
                        onClick={onClose}
                        className="px-6 py-2.5 rounded-xl font-bold bg-gray-100 text-gray-700 hover:bg-gray-200 transition-colors"
                    >
                        Cancel
                    </button>
                    <button
                        type="submit"
                        form="supplier-form"
                        disabled={
                            loading || 
                            !formData.beneficiaryName?.trim() || 
                            !formData.bankName?.trim() || 
                            !formData.accountNumber?.trim() || 
                            isDuplicate || 
                            !!swiftError
                        }
                        className="px-6 py-2.5 rounded-xl font-bold text-white transition-opacity disabled:opacity-50 flex items-center justify-center min-w-[120px]"
                        style={{ backgroundColor: "var(--brand-primary)" }}
                    >
                        {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : "Save Supplier"}
                    </button>
                </div>
            </div>
        </div>
    );
}

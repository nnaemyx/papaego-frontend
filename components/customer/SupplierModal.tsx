"use client";

import React, { useState, useEffect } from "react";
import { X, Loader2 } from "lucide-react";

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

    useEffect(() => {
        if (isOpen) {
            if (initialData) {
                setFormData(initialData);
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
            }
        }
    }, [isOpen, initialData]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
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
                            <div className="space-y-1.5">
                                <label className="text-sm font-semibold text-[#012333]">Bank Name</label>
                                <input
                                    type="text"
                                    value={formData.bankName || ""}
                                    onChange={(e) => setFormData({ ...formData, bankName: e.target.value })}
                                    placeholder="e.g. Chase Bank"
                                    className="w-full h-12 px-4 rounded-xl border bg-gray-50 focus:bg-white transition-all outline-none focus:ring-2"
                                    style={{ borderColor: "#E1E3E6" }}
                                />
                            </div>

                            <div className="space-y-1.5">
                                <label className="text-sm font-semibold text-[#012333]">Account Number</label>
                                <input
                                    type="text"
                                    value={formData.accountNumber || ""}
                                    onChange={(e) => setFormData({ ...formData, accountNumber: e.target.value })}
                                    className="w-full h-12 px-4 rounded-xl border bg-gray-50 focus:bg-white transition-all outline-none focus:ring-2"
                                    style={{ borderColor: "#E1E3E6" }}
                                />
                            </div>

                            <div className="space-y-1.5">
                                <label className="text-sm font-semibold text-[#012333]">IBAN</label>
                                <input
                                    type="text"
                                    value={formData.iban || ""}
                                    onChange={(e) => setFormData({ ...formData, iban: e.target.value })}
                                    placeholder="For Europe and others"
                                    className="w-full h-12 px-4 rounded-xl border bg-gray-50 focus:bg-white transition-all outline-none focus:ring-2"
                                    style={{ borderColor: "#E1E3E6" }}
                                />
                            </div>

                            <div className="space-y-1.5">
                                <label className="text-sm font-semibold text-[#012333]">SWIFT / BIC</label>
                                <input
                                    type="text"
                                    value={formData.swiftBic || ""}
                                    onChange={(e) => setFormData({ ...formData, swiftBic: e.target.value })}
                                    placeholder="8 or 11 character code"
                                    className="w-full h-12 px-4 rounded-xl border bg-gray-50 focus:bg-white transition-all outline-none focus:ring-2"
                                    style={{ borderColor: "#E1E3E6" }}
                                />
                            </div>

                            <div className="space-y-1.5">
                                <label className="text-sm font-semibold text-[#012333]">Routing Code</label>
                                <input
                                    type="text"
                                    value={formData.routingCode || ""}
                                    onChange={(e) => setFormData({ ...formData, routingCode: e.target.value })}
                                    placeholder="e.g. ABA / CLABE"
                                    className="w-full h-12 px-4 rounded-xl border bg-gray-50 focus:bg-white transition-all outline-none focus:ring-2"
                                    style={{ borderColor: "#E1E3E6" }}
                                />
                            </div>

                            <div className="space-y-1.5">
                                <label className="text-sm font-semibold text-[#012333]">Expected Currency</label>
                                <select
                                    value={formData.currency || "USD"}
                                    onChange={(e) => setFormData({ ...formData, currency: e.target.value })}
                                    className="w-full h-12 px-4 rounded-xl border bg-gray-50 focus:bg-white transition-all outline-none focus:ring-2"
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
                        disabled={loading || !formData.beneficiaryName?.trim()}
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

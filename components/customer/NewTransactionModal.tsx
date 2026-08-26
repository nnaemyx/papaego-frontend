"use client";

import { useState, useEffect } from "react";
import { CheckCircle, RefreshCw, ChevronLeft, Wallet, AlertCircle, Sparkles, CreditCard } from "lucide-react";
import { customerApi } from "@/lib/api/customer";
import { NIGERIAN_SECTORS } from "@/lib/api/customer";
import { loadPaystackInline } from "@/lib/paystack";
import { toast } from "sonner";

interface NewTransactionModalProps {
    onClose: () => void;
    draftToEdit?: any | null;
}

const CURRENCIES = ["USD", "GBP", "EUR", "NGN", "CAD", "AED"];

type Step = 1 | 2;

interface SupplierDetails {
    businessName: string;
    bankName: string;
    accountNumber: string;
    sector: string;
    address: string;
}

const EMPTY_SUPPLIER: SupplierDetails = {
    businessName: "",
    bankName: "",
    accountNumber: "",
    sector: "",
    address: "",
};

export function NewTransactionModal({ onClose, draftToEdit }: NewTransactionModalProps) {
    // Step 1 fields
    const [amount, setAmount] = useState(draftToEdit ? draftToEdit.amount.toString() : "");
    const [fromCurrency, setFromCurrency] = useState(draftToEdit ? draftToEdit.sendCurrency : "USD");
    const [toCurrency, setToCurrency] = useState(draftToEdit ? draftToEdit.receiveCurrency : "NGN");
    const [purpose, setPurpose] = useState(draftToEdit ? draftToEdit.purpose || "" : "");

    // Step 2 fields
    const [supplier, setSupplier] = useState<SupplierDetails>({
        businessName: draftToEdit?.supplierBusinessName || "",
        bankName: draftToEdit?.supplierBankName || "",
        accountNumber: draftToEdit?.supplierAccountNumber || "",
        sector: draftToEdit?.supplierSector || "",
        address: draftToEdit?.supplierAddress || "",
    });
    const [savedSuppliers, setSavedSuppliers] = useState<any[]>([]);
    const [useNewSupplier, setUseNewSupplier] = useState(draftToEdit ? !draftToEdit.supplierId : false);

    // Wallet / Ledger state
    const [availableBalance, setAvailableBalance] = useState<number | null>(null);
    const [fundingPaystack, setFundingPaystack] = useState(false);
    const [lowFundsError, setLowFundsError] = useState<{
        available: string;
        required: string;
        shortfall: string;
    } | null>(null);

    // UI state
    const [step, setStep] = useState<Step>(1);
    const [submitting, setSubmitting] = useState(false);
    const [submitted, setSubmitted] = useState(false);
    const [successMessage, setSuccessMessage] = useState("Request Submitted!");
    const [invoiceFile, setInvoiceFile] = useState<File | null>(null);

    const refreshBalance = async () => {
        try {
            const stats = await customerApi.getDashboardStats();
            if (stats && stats.availableBalance !== undefined) {
                setAvailableBalance(Number(stats.availableBalance));
            }
        } catch {
            // Ignore if stats fail
        }
    };

    useEffect(() => {
        customerApi.getSuppliers?.().then(setSavedSuppliers).catch(() => {});
        refreshBalance();
    }, []);

    const updateSupplier = (key: keyof SupplierDetails, value: string) =>
        setSupplier((prev) => ({ ...prev, [key]: value }));

    const handleStep1Next = (e: React.FormEvent) => {
        e.preventDefault();
        const amt = parseFloat(amount);
        if (!amount || isNaN(amt) || amt <= 0) {
            toast.error("Please enter a valid amount.");
            return;
        }
        setStep(2);
    };

    const handlePaystackTopUp = async (depositAmount: number) => {
        if (!depositAmount || depositAmount <= 0) return;
        setFundingPaystack(true);
        try {
            const init = await customerApi.initializePaystackDeposit(depositAmount);
            const PaystackPop = await loadPaystackInline();
            if (!PaystackPop) {
                toast.error("Could not load Paystack SDK. Please check connection.");
                setFundingPaystack(false);
                return;
            }

            const handler = PaystackPop.setup({
                key: init.publicKey,
                email: init.email,
                amount: Math.round(init.amount * 100),
                ref: init.reference,
                currency: "NGN",
                callback: async (response: any) => {
                    toast.loading("Verifying Paystack deposit...");
                    try {
                        await customerApi.verifyPaystackDeposit(response.reference, init.amount);
                        toast.dismiss();
                        toast.success(`Successfully deposited ₦${init.amount.toLocaleString()} to your ledger!`);
                        setLowFundsError(null);
                        await refreshBalance();
                    } catch {
                        toast.dismiss();
                        toast.error("Deposit confirmation failed. Please refresh balance.");
                    } finally {
                        setFundingPaystack(false);
                    }
                },
                onClose: () => {
                    setFundingPaystack(false);
                },
            });
            handler.openIframe();
        } catch (err: any) {
            toast.error(err?.response?.data?.error || "Failed to initialize Paystack deposit");
            setFundingPaystack(false);
        }
    };

    const handleSubmit = async (e: React.FormEvent, isDraft: boolean = false) => {
        if (e) e.preventDefault();
        setSubmitting(true);
        setLowFundsError(null);
        try {
            let invoiceUrl = draftToEdit?.invoiceUrl || undefined;
            if (invoiceFile) {
                const uploadRes = await customerApi.uploadDocument(invoiceFile);
                invoiceUrl = uploadRes.url;
            }

            const payload: any = {
                amount,
                sendCurrency: fromCurrency,
                receiveCurrency: toCurrency,
                purpose,
                tradeType: "BUY",
                // Supplier details
                businessName: supplier.businessName || undefined,
                bankName: supplier.bankName || undefined,
                accountNumber: supplier.accountNumber || undefined,
                sector: supplier.sector || undefined,
                address: supplier.address || undefined,
                invoiceUrl,
                status: isDraft ? "DRAFT" : "PENDING",
            };

            if (draftToEdit) {
                await customerApi.updateTradeRequest(draftToEdit.id, payload);
            } else {
                await customerApi.createTradeRequest(payload);
            }

            setSuccessMessage(isDraft ? "Draft Saved!" : "Request Submitted & Funded!");
            setSubmitted(true);
            toast.success(isDraft ? "Trade request draft saved" : "Trade submitted and reserved from ledger");
            setTimeout(() => {
                onClose();
                window.location.reload();
            }, 1800);
        } catch (err: any) {
            console.error("Trade initiation error:", err);
            const data = err?.response?.data;
            if (data?.code === "INSUFFICIENT_FUNDS") {
                setLowFundsError({
                    available: data.availableBalance || (availableBalance !== null ? availableBalance.toString() : "0"),
                    required: data.requiredAmount || amount,
                    shortfall: data.shortfall || (parseFloat(amount) - (availableBalance || 0)).toString(),
                });
                toast.error("Insufficient ledger balance. Please top up using Paystack.");
            } else {
                toast.error(data?.error || "Failed to initiate trade. Please try again.");
            }
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <div
            className="fixed inset-0 z-50 flex items-end justify-center"
            style={{ backgroundColor: "rgba(0,0,0,0.55)" }}
            onClick={onClose}
        >
            <div
                className="w-full max-w-lg bg-white rounded-t-3xl p-6 pb-10"
                onClick={(e) => e.stopPropagation()}
            >
                {/* ── Success State ── */}
                {submitted ? (
                    <div className="text-center py-10">
                        <div
                            className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4"
                            style={{ backgroundColor: "#E2FDED" }}
                        >
                            <CheckCircle className="w-8 h-8" style={{ color: "#27AE60" }} />
                        </div>
                        <h3
                            className="text-xl font-bold mb-2"
                            style={{ color: "#012333" }}
                        >
                            {successMessage}
                        </h3>
                        <p className="body-secondary">
                            Admin will review and process your trade shortly.
                        </p>
                    </div>
                ) : (
                    <>
                        {/* ── Header ── */}
                        <div className="flex items-center justify-between mb-5">
                            <div className="flex items-center gap-2">
                                {step === 2 && (
                                    <button
                                        onClick={() => setStep(1)}
                                        className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-100 transition-colors"
                                    >
                                        <ChevronLeft className="w-5 h-5 text-gray-500" />
                                    </button>
                                )}
                                <div>
                                    <h3
                                        className="text-xl font-bold"
                                        style={{ color: "var(--text-primary)" }}
                                    >
                                        {step === 1 ? (draftToEdit ? "Edit Trade Request" : "New Trade Request") : "Supplier Details"}
                                    </h3>
                                    <p
                                        className="caption mt-0.5"
                                        style={{ color: "var(--text-secondary)" }}
                                    >
                                        {step === 1
                                            ? "Step 1 of 2 — Trade details"
                                            : "Step 2 of 2 — Supplier information"}
                                    </p>
                                </div>
                            </div>
                            <button
                                onClick={onClose}
                                className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-100 text-gray-400 text-xl font-bold transition-colors"
                            >
                                ×
                            </button>
                        </div>

                        {/* ── Step indicator ── */}
                        <div className="flex gap-1.5 mb-5">
                            {[1, 2].map((s) => (
                                <div
                                    key={s}
                                    className="h-1 flex-1 rounded-full transition-colors"
                                    style={{
                                        backgroundColor:
                                            s <= step
                                                ? "var(--brand-primary)"
                                                : "#E1E3E6",
                                    }}
                                />
                            ))}
                        </div>

                        {/* ── Step 1: Trade Details ── */}
                        {step === 1 && (
                            <form onSubmit={handleStep1Next} className="space-y-4">
                                {/* BUY label & Ledger Balance */}
                                <div className="flex items-center justify-between">
                                    <div
                                        className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-bold"
                                        style={{
                                            backgroundColor: "#E2FDED",
                                            color: "#27AE60",
                                        }}
                                    >
                                        Buy Currency
                                    </div>

                                    {availableBalance !== null && (
                                        <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-gray-50 border border-gray-200 text-xs font-semibold text-gray-700">
                                            <Wallet className="w-3.5 h-3.5 text-amber-600" />
                                            <span>Ledger: ₦{availableBalance.toLocaleString()}</span>
                                        </div>
                                    )}
                                </div>

                                {/* Currency selects */}
                                <div className="grid grid-cols-2 gap-3">
                                    {(
                                        [
                                            {
                                                label: "From Currency (Send)",
                                                value: fromCurrency,
                                                onChange: setFromCurrency,
                                            },
                                            {
                                                label: "To Currency (Receive)",
                                                value: toCurrency,
                                                onChange: setToCurrency,
                                            },
                                        ] as const
                                    ).map(({ label, value, onChange }) => (
                                        <div key={label}>
                                            <label
                                                className="caption font-medium mb-1 block"
                                                style={{ color: "var(--text-secondary)" }}
                                            >
                                                {label}
                                            </label>
                                            <select
                                                value={value}
                                                onChange={(e) => onChange(e.target.value)}
                                                className="w-full border rounded-lg px-3 py-2.5 text-sm outline-none bg-white font-medium"
                                                style={{
                                                    borderColor: "var(--border-custom)",
                                                    color: "var(--text-primary)",
                                                }}
                                            >
                                                {CURRENCIES.map((c) => (
                                                    <option key={c}>{c}</option>
                                                ))}
                                            </select>
                                        </div>
                                    ))}
                                </div>

                                {/* Amount */}
                                <div>
                                    <div className="flex items-center justify-between mb-1">
                                        <label
                                            className="caption font-medium block"
                                            style={{ color: "var(--text-secondary)" }}
                                        >
                                            Amount (You Send)
                                        </label>
                                        {amount && !isNaN(parseFloat(amount)) && fromCurrency === "NGN" && availableBalance !== null && (
                                            <span className={`text-xs font-medium ${parseFloat(amount) <= availableBalance ? "text-emerald-600" : "text-amber-600"}`}>
                                                {parseFloat(amount) <= availableBalance
                                                    ? "✓ Covered by ledger"
                                                    : `Shortfall: ₦${(parseFloat(amount) - availableBalance).toLocaleString()}`}
                                            </span>
                                        )}
                                    </div>
                                    <input
                                        type="number"
                                        value={amount}
                                        onChange={(e) => {
                                            setAmount(e.target.value);
                                            setLowFundsError(null);
                                        }}
                                        placeholder="Enter amount"
                                        required
                                        min="1"
                                        className="w-full border rounded-lg px-3 py-2.5 text-sm outline-none font-medium"
                                        style={{
                                            borderColor: "var(--border-custom)",
                                            color: "var(--text-primary)",
                                        }}
                                    />
                                </div>

                                {/* Purpose */}
                                <div>
                                    <label
                                        className="caption font-medium mb-1 block"
                                        style={{ color: "var(--text-secondary)" }}
                                    >
                                        Purpose{" "}
                                        <span style={{ color: "var(--text-tertiary)" }}>
                                            (optional)
                                        </span>
                                    </label>
                                    <input
                                        value={purpose}
                                        onChange={(e) => setPurpose(e.target.value)}
                                        placeholder="e.g. Business payment, School fees..."
                                        className="w-full border rounded-lg px-3 py-2.5 text-sm outline-none"
                                        style={{
                                            borderColor: "var(--border-custom)",
                                            color: "var(--text-primary)",
                                        }}
                                    />
                                </div>

                                <button
                                    type="submit"
                                    className="w-full h-12 rounded-xl font-semibold text-white flex items-center justify-center gap-2 transition-opacity mt-2"
                                    style={{ backgroundColor: "var(--brand-primary)" }}
                                >
                                    Next: Add Supplier Details →
                                </button>
                            </form>
                        )}

                        {/* ── Step 2: Supplier Details ── */}
                        {step === 2 && (
                            <form onSubmit={handleSubmit} className="space-y-4">
                                <p
                                    className="text-xs p-3 rounded-lg mb-4"
                                    style={{
                                        backgroundColor: "#FFF8E1",
                                        color: "#92400E",
                                        border: "1px solid #FDE68A",
                                    }}
                                >
                                    Provide your supplier's bank details. Admin will verify and
                                    process the payment on your behalf.
                                </p>

                                {savedSuppliers.length > 0 && !useNewSupplier && (
                                    <div className="mb-4 space-y-3 p-4 border rounded-xl" style={{ backgroundColor: "#F7F8F9", borderColor: "#E1E3E6" }}>
                                        <label className="caption font-medium mb-1 block" style={{ color: "var(--text-primary)" }}>
                                            Select a Saved Supplier
                                        </label>
                                        <select
                                            onChange={(e) => {
                                                const id = e.target.value;
                                                const found = savedSuppliers.find(s => s.id === id);
                                                if (found) {
                                                    setSupplier({
                                                        businessName: found.businessName || "",
                                                        bankName: found.bankName || "",
                                                        accountNumber: found.accountNumber || "",
                                                        sector: found.sector || "",
                                                        address: found.address || ""
                                                    });
                                                }
                                            }}
                                            className="w-full border rounded-lg px-3 py-2.5 text-sm outline-none bg-white"
                                            style={{ borderColor: "var(--border-custom)" }}
                                        >
                                            <option value="">-- Choose a supplier --</option>
                                            {savedSuppliers.map(s => (
                                                <option key={s.id} value={s.id}>
                                                    {s.businessName} - {s.bankName} ({s.accountNumber})
                                                </option>
                                            ))}
                                        </select>
                                        <button 
                                            type="button" 
                                            onClick={() => { setUseNewSupplier(true); setSupplier(EMPTY_SUPPLIER); }}
                                            className="text-sm font-semibold transition-colors mt-2 hover:underline"
                                            style={{ color: "var(--brand-primary)" }}
                                        >
                                            + Add a new supplier instead
                                        </button>
                                    </div>
                                )}

                                {(savedSuppliers.length === 0 || useNewSupplier) && (
                                    <div className="space-y-4">
                                        {savedSuppliers.length > 0 && (
                                            <button 
                                                type="button" 
                                                onClick={() => { setUseNewSupplier(false); setSupplier(EMPTY_SUPPLIER); }}
                                                className="text-sm font-semibold transition-colors mb-2 hover:underline inline-flex items-center gap-1"
                                                style={{ color: "var(--text-secondary)" }}
                                            >
                                                <ChevronLeft className="w-3 h-3" /> Back to saved suppliers
                                            </button>
                                        )}
                                        
                                        {/* Business Name */}
                                <div>
                                    <label
                                        className="caption font-medium mb-1 block"
                                        style={{ color: "var(--text-secondary)" }}
                                    >
                                        Supplier Business Name{" "}
                                        <span style={{ color: "var(--text-tertiary)" }}>
                                            (optional)
                                        </span>
                                    </label>
                                    <input
                                        value={supplier.businessName}
                                        onChange={(e) =>
                                            updateSupplier("businessName", e.target.value)
                                        }
                                        placeholder="e.g. Apex Imports Ltd"
                                        className="w-full border rounded-lg px-3 py-2.5 text-sm outline-none"
                                        style={{
                                            borderColor: "var(--border-custom)",
                                            color: "var(--text-primary)",
                                        }}
                                    />
                                </div>

                                {/* Bank + Account Number */}
                                <div className="grid grid-cols-2 gap-3">
                                    <div>
                                        <label
                                            className="caption font-medium mb-1 block"
                                            style={{ color: "var(--text-secondary)" }}
                                        >
                                            Bank Name
                                        </label>
                                        <input
                                            value={supplier.bankName}
                                            onChange={(e) =>
                                                updateSupplier("bankName", e.target.value)
                                            }
                                            placeholder="e.g. Zenith Bank"
                                            className="w-full border rounded-lg px-3 py-2.5 text-sm outline-none"
                                            style={{
                                                borderColor: "var(--border-custom)",
                                                color: "var(--text-primary)",
                                            }}
                                        />
                                    </div>
                                    <div>
                                        <label
                                            className="caption font-medium mb-1 block"
                                            style={{ color: "var(--text-secondary)" }}
                                        >
                                            Account Number
                                        </label>
                                        <input
                                            value={supplier.accountNumber}
                                            onChange={(e) =>
                                                updateSupplier("accountNumber", e.target.value)
                                            }
                                            placeholder="0123456789"
                                            className="w-full border rounded-lg px-3 py-2.5 text-sm outline-none"
                                            style={{
                                                borderColor: "var(--border-custom)",
                                                color: "var(--text-primary)",
                                            }}
                                        />
                                    </div>
                                </div>

                                {/* Sector */}
                                <div>
                                    <label
                                        className="caption font-medium mb-1 block"
                                        style={{ color: "var(--text-secondary)" }}
                                    >
                                        Supplier Sector{" "}
                                        <span style={{ color: "var(--text-tertiary)" }}>
                                            (optional)
                                        </span>
                                    </label>
                                    <select
                                        value={supplier.sector}
                                        onChange={(e) =>
                                            updateSupplier("sector", e.target.value)
                                        }
                                        className="w-full border rounded-lg px-3 py-2.5 text-sm outline-none bg-white"
                                        style={{
                                            borderColor: "var(--border-custom)",
                                            color: supplier.sector
                                                ? "var(--text-primary)"
                                                : "var(--text-tertiary)",
                                        }}
                                    >
                                        <option value="">Select a sector…</option>
                                        {NIGERIAN_SECTORS.map((s) => (
                                            <option key={s} value={s}>
                                                {s}
                                            </option>
                                        ))}
                                    </select>
                                </div>

                                {/* Address */}
                                <div>
                                    <label
                                        className="caption font-medium mb-1 block"
                                        style={{ color: "var(--text-secondary)" }}
                                    >
                                        Supplier Address{" "}
                                        <span style={{ color: "var(--text-tertiary)" }}>
                                            (optional)
                                        </span>
                                    </label>
                                    <input
                                        value={supplier.address}
                                        onChange={(e) =>
                                            updateSupplier("address", e.target.value)
                                        }
                                        placeholder="Full address of the supplier"
                                        className="w-full border rounded-lg px-3 py-2.5 text-sm outline-none"
                                        style={{
                                            borderColor: "var(--border-custom)",
                                            color: "var(--text-primary)",
                                        }}
                                    />
                                </div>
                                </div>
                                )}

                                {/* Invoice Upload */}
                                <div>
                                    <label
                                        className="caption font-medium mb-1 block mt-2"
                                        style={{ color: "var(--text-secondary)" }}
                                    >
                                        Attach Invoice / Supporting Document{" "}
                                        <span style={{ color: "var(--text-tertiary)" }}>
                                            (optional)
                                        </span>
                                    </label>
                                    <input
                                        type="file"
                                        onChange={(e) => {
                                            if (e.target.files && e.target.files[0]) {
                                                setInvoiceFile(e.target.files[0]);
                                            }
                                        }}
                                        accept="image/jpeg,image/png,image/jpg,application/pdf"
                                        className="w-full border rounded-lg px-3 py-2 text-sm outline-none bg-white cursor-pointer"
                                        style={{ borderColor: "var(--border-custom)" }}
                                    />
                                    {invoiceFile && (
                                        <p className="text-xs mt-1 text-green-600 font-medium">Selected: {invoiceFile.name}</p>
                                    )}
                                </div>

                                {/* Low Funds / Paystack Top-up Card */}
                                {lowFundsError ? (
                                    <div className="p-4 rounded-xl border border-amber-200 bg-amber-50 space-y-3">
                                        <div className="flex items-start gap-2.5">
                                            <AlertCircle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
                                            <div>
                                                <h4 className="text-sm font-bold text-amber-900">Insufficient Ledger Balance</h4>
                                                <p className="text-xs text-amber-700 mt-0.5">
                                                    You need <span className="font-semibold">₦{parseFloat(lowFundsError.required).toLocaleString()}</span>, but have <span className="font-semibold">₦{parseFloat(lowFundsError.available).toLocaleString()}</span> in your wallet.
                                                </p>
                                            </div>
                                        </div>

                                        <div className="flex items-center justify-between pt-1">
                                            <span className="text-xs font-semibold text-amber-900">
                                                Shortfall: ₦{parseFloat(lowFundsError.shortfall).toLocaleString()}
                                            </span>
                                            <button
                                                type="button"
                                                disabled={fundingPaystack}
                                                onClick={() => handlePaystackTopUp(parseFloat(lowFundsError.shortfall))}
                                                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-amber-600 text-white text-xs font-bold hover:bg-amber-700 transition-colors shadow-sm disabled:opacity-50"
                                            >
                                                {fundingPaystack ? (
                                                    <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                                                ) : (
                                                    <CreditCard className="w-3.5 h-3.5" />
                                                )}
                                                {fundingPaystack ? "Loading Paystack..." : `Top Up ₦${parseFloat(lowFundsError.shortfall).toLocaleString()} via Paystack`}
                                            </button>
                                        </div>
                                    </div>
                                ) : (
                                    /* Normal Ledger Funding Notice */
                                    <div className="p-3 rounded-xl border border-emerald-100 bg-emerald-50/60 flex items-center justify-between text-xs text-emerald-900">
                                        <div className="flex items-center gap-2">
                                            <Wallet className="w-4 h-4 text-emerald-600" />
                                            <span>
                                                Funds (<span className="font-bold">{amount} {fromCurrency}</span>) will be reserved from your Ledger.
                                            </span>
                                        </div>
                                        {availableBalance !== null && (
                                            <span className="font-semibold text-emerald-700">
                                                Available: ₦{availableBalance.toLocaleString()}
                                            </span>
                                        )}
                                    </div>
                                )}

                                <div className="flex flex-col gap-2 pt-2">
                                    <div className="flex gap-3">
                                        <button
                                            type="button"
                                            onClick={() => setStep(1)}
                                            className="flex-1 h-12 rounded-xl font-semibold border-2 transition-opacity"
                                            style={{
                                                borderColor: "var(--brand-primary)",
                                                color: "var(--brand-primary)",
                                            }}
                                        >
                                            Back
                                        </button>
                                        <button
                                            type="button"
                                            disabled={submitting}
                                            onClick={(e) => handleSubmit(e as any, true)}
                                            className="flex-1 h-12 rounded-xl font-semibold border transition-opacity hover:bg-gray-50 bg-white"
                                            style={{
                                                borderColor: "var(--border-custom)",
                                                color: "var(--text-primary)",
                                            }}
                                        >
                                            Save as Draft
                                        </button>
                                    </div>
                                    <button
                                        type="submit"
                                        disabled={submitting}
                                        className="w-full h-12 rounded-xl font-semibold text-white flex items-center justify-center gap-2 transition-opacity"
                                        style={{
                                            backgroundColor: "var(--brand-primary)",
                                            opacity: submitting ? 0.7 : 1,
                                        }}
                                    >
                                        {submitting && (
                                            <RefreshCw className="w-4 h-4 animate-spin" />
                                        )}
                                        {submitting ? "Processing..." : draftToEdit ? "Publish & Submit" : "Submit Request"}
                                    </button>
                                </div>
                            </form>
                        )}
                    </>
                )}
            </div>
        </div>
    );
}

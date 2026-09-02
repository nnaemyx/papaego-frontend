"use client";

import { useState, useEffect, useMemo } from "react";
import { CheckCircle, RefreshCw, ChevronLeft, Wallet, AlertCircle, Sparkles, CreditCard, Building2, ArrowRight, ShieldCheck, FileText, ArrowDownLeft } from "lucide-react";
import { customerApi, type FxRate } from "@/lib/api/customer";
import { NIGERIAN_SECTORS } from "@/lib/api/customer";
import { loadPaystackInline } from "@/lib/paystack";
import { toast } from "sonner";

interface NewTransactionModalProps {
    onClose: () => void;
    draftToEdit?: any | null;
}

const CURRENCIES = ["USD", "GBP", "EUR", "NGN", "CAD", "AED"];

type Step = 1 | 2 | 3;

interface SupplierDetails {
    id?: string;
    businessName: string;
    bankName: string;
    accountNumber: string;
    sector: string;
    address: string;
}

const EMPTY_SUPPLIER: SupplierDetails = {
    id: undefined,
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

    // FX Rates
    const [fxRates, setFxRates] = useState<FxRate[]>([]);
    const [loadingRates, setLoadingRates] = useState(false);

    // Step 2 fields
    const [purpose, setPurpose] = useState(draftToEdit ? draftToEdit.purpose || "" : "");
    const [supplier, setSupplier] = useState<SupplierDetails>({
        id: draftToEdit?.supplierId || undefined,
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

    const fetchRates = async () => {
        setLoadingRates(true);
        try {
            const res = await customerApi.getFxRates();
            if (res?.rates) {
                setFxRates(res.rates);
            }
        } catch (err) {
            console.warn("Could not fetch latest rates:", err);
        } finally {
            setLoadingRates(false);
        }
    };

    useEffect(() => {
        customerApi.getSuppliers?.().then((list) => {
            if (Array.isArray(list)) setSavedSuppliers(list);
        }).catch(() => {});
        refreshBalance();
        fetchRates();
    }, []);

    // Calculate applied FX rate and estimated payout
    const { currentRate, calculatedPayout } = useMemo(() => {
        let rate = 1;
        const pairDirect = `${fromCurrency}/${toCurrency}`;
        const pairInverse = `${toCurrency}/${fromCurrency}`;
        const directMatch = fxRates.find(r => r.pair === pairDirect);
        const inverseMatch = fxRates.find(r => r.pair === pairInverse);

        if (directMatch) {
            rate = directMatch.sell || directMatch.buy || 1;
        } else if (inverseMatch) {
            rate = 1 / (inverseMatch.buy || inverseMatch.sell || 1);
        } else {
            // Standard fallback reference rates
            if (fromCurrency === "USD" && toCurrency === "NGN") rate = 1480;
            else if (fromCurrency === "NGN" && toCurrency === "USD") rate = 1 / 1520;
            else if (fromCurrency === "GBP" && toCurrency === "NGN") rate = 1920;
            else if (fromCurrency === "EUR" && toCurrency === "NGN") rate = 1620;
            else if (fromCurrency === "CAD" && toCurrency === "NGN") rate = 1100;
            else if (fromCurrency === "AED" && toCurrency === "NGN") rate = 405;
            else rate = 1;
        }

        const amtNum = parseFloat(amount);
        const payout = !isNaN(amtNum) && amtNum > 0 ? amtNum * rate : 0;
        return { currentRate: rate, calculatedPayout: payout };
    }, [fromCurrency, toCurrency, fxRates, amount]);

    const updateSupplier = (key: keyof SupplierDetails, value: string) =>
        setSupplier((prev) => ({ ...prev, [key]: value }));

    const handleStep1Next = (e: React.FormEvent) => {
        e.preventDefault();
        const amt = parseFloat(amount);
        if (!amount || isNaN(amt) || amt <= 0) {
            toast.error("Please enter a valid amount.");
            return;
        }
        if (fromCurrency === toCurrency) {
            toast.error("From and To currencies must be different.");
            return;
        }
        setStep(2);
    };

    const handleStep2Next = (e: React.FormEvent) => {
        e.preventDefault();
        if (!supplier.businessName?.trim()) {
            toast.error("Please provide or select a supplier business name.");
            return;
        }
        setStep(3);
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

            const rawKey = init.publicKey || process.env.NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY || "pk_test_2250be21340e86249354313ff63bd93bc8656a15";
            const publicKey = rawKey.trim();
            const email = (init.email || "customer@papaego.com").trim();

            const onPaymentSuccess = async (txRef: string) => {
                toast.loading("Verifying Paystack deposit...");
                try {
                    await customerApi.verifyPaystackDeposit(txRef, init.amount);
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
            };

            if (typeof PaystackPop.setup === "function") {
                const handler = PaystackPop.setup({
                    key: publicKey,
                    email: email,
                    amount: Math.round(init.amount * 100),
                    ref: init.reference,
                    currency: "NGN",
                    callback: (response: any) => onPaymentSuccess(response.reference || init.reference),
                    onClose: () => setFundingPaystack(false),
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
                    onCancel: () => setFundingPaystack(false),
                });
            }
        } catch (err: any) {
            console.error("Paystack top-up initialization error:", err);
            const errMsg = err?.response?.data?.error || err?.message || "Failed to initialize Paystack deposit";
            toast.error(errMsg);
            setFundingPaystack(false);
        }
    };

    const handleSubmit = async (e?: React.FormEvent, isDraft: boolean = false) => {
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
                supplierId: supplier.id || undefined,
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
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
            style={{ backgroundColor: "rgba(0,0,0,0.6)" }}
            onClick={onClose}
        >
            <div
                className="w-full max-w-xl bg-white rounded-3xl p-6 sm:p-8 shadow-2xl overflow-hidden max-h-[90vh] flex flex-col"
                onClick={(e) => e.stopPropagation()}
            >
                {/* ── Success State ── */}
                {submitted ? (
                    <div className="text-center py-10 my-auto">
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
                        <p className="text-sm text-slate-500">
                            PapaEgo is processing your trade in real-time.
                        </p>
                    </div>
                ) : (
                    <>
                        {/* ── Header ── */}
                        <div className="flex items-center justify-between pb-4 border-b border-slate-100">
                            <div className="flex items-center gap-2">
                                {step > 1 && (
                                    <button
                                        onClick={() => setStep((s) => (s - 1) as Step)}
                                        className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-100 transition-colors"
                                    >
                                        <ChevronLeft className="w-5 h-5 text-gray-500" />
                                    </button>
                                )}
                                <div>
                                    <h3
                                        className="text-lg sm:text-xl font-bold"
                                        style={{ color: "var(--text-primary)" }}
                                    >
                                        {step === 1
                                            ? draftToEdit ? "Edit Trade Request" : "New Trade Request"
                                            : step === 2
                                            ? "Supplier Information"
                                            : "Review & Confirm Trade"}
                                    </h3>
                                    <p
                                        className="text-xs mt-0.5 text-slate-500"
                                    >
                                        {step === 1 && "Step 1 of 3 — Currency, Amount & FX Rate"}
                                        {step === 2 && "Step 2 of 3 — Beneficiary Supplier Details"}
                                        {step === 3 && "Step 3 of 3 — Verification & Final Confirmation"}
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
                        <div className="flex gap-1.5 my-4">
                            {[1, 2, 3].map((s) => (
                                <div
                                    key={s}
                                    className="h-1.5 flex-1 rounded-full transition-all duration-300"
                                    style={{
                                        backgroundColor:
                                            s <= step
                                                ? "#C9A227"
                                                : "#E1E3E6",
                                    }}
                                />
                            ))}
                        </div>

                        {/* ── Scrollable Body ── */}
                        <div className="flex-1 overflow-y-auto pr-1 space-y-4">
                            {/* ── Step 1: Trade Details & Live FX Quote ── */}
                            {step === 1 && (
                                <form onSubmit={handleStep1Next} className="space-y-4">
                                    {/* BUY label & Ledger Balance */}
                                    <div className="flex items-center justify-between">
                                        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                                            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                                            Live Spot Rate Quoting
                                        </span>

                                        {availableBalance !== null && (
                                            <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-50 border border-slate-200 text-xs font-semibold text-slate-700">
                                                <Wallet className="w-3.5 h-3.5 text-amber-600" />
                                                <span>Ledger: ₦{availableBalance.toLocaleString()}</span>
                                            </div>
                                        )}
                                    </div>

                                    {/* Currency selects */}
                                    <div className="grid grid-cols-2 gap-3">
                                        <div>
                                            <label className="text-xs font-bold uppercase tracking-wider block text-slate-500 mb-1">
                                                Sending Currency
                                            </label>
                                            <select
                                                value={fromCurrency}
                                                onChange={(e) => setFromCurrency(e.target.value)}
                                                className="w-full border rounded-xl px-3 py-2.5 text-sm font-bold outline-none bg-white border-slate-200 focus:border-[#C9A227]"
                                            >
                                                {CURRENCIES.map((c) => (
                                                    <option key={c} value={c}>{c}</option>
                                                ))}
                                            </select>
                                        </div>

                                        <div>
                                            <label className="text-xs font-bold uppercase tracking-wider block text-slate-500 mb-1">
                                                Receiving Currency
                                            </label>
                                            <select
                                                value={toCurrency}
                                                onChange={(e) => setToCurrency(e.target.value)}
                                                className="w-full border rounded-xl px-3 py-2.5 text-sm font-bold outline-none bg-white border-slate-200 focus:border-[#C9A227]"
                                            >
                                                {CURRENCIES.map((c) => (
                                                    <option key={c} value={c}>{c}</option>
                                                ))}
                                            </select>
                                        </div>
                                    </div>

                                    {/* Amount to send */}
                                    <div>
                                        <div className="flex items-center justify-between mb-1">
                                            <label className="text-xs font-bold uppercase tracking-wider block text-slate-500">
                                                Amount You Send ({fromCurrency})
                                            </label>
                                            {amount && !isNaN(parseFloat(amount)) && fromCurrency === "NGN" && availableBalance !== null && (
                                                <span className={`text-xs font-semibold ${parseFloat(amount) <= availableBalance ? "text-emerald-600" : "text-amber-600"}`}>
                                                    {parseFloat(amount) <= availableBalance
                                                        ? "✓ Covered by ledger"
                                                        : `Shortfall: ₦${(parseFloat(amount) - availableBalance).toLocaleString()}`}
                                                </span>
                                            )}
                                        </div>
                                        <div className="relative">
                                            <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 font-bold text-sm">
                                                {fromCurrency}
                                            </span>
                                            <input
                                                type="number"
                                                value={amount}
                                                onChange={(e) => {
                                                    setAmount(e.target.value);
                                                    setLowFundsError(null);
                                                }}
                                                placeholder="0.00"
                                                required
                                                min="1"
                                                step="any"
                                                className="w-full pl-14 pr-4 py-3 rounded-xl border border-slate-200 font-extrabold text-slate-900 text-base outline-none focus:border-[#C9A227] focus:ring-2 focus:ring-[#C9A227]/20"
                                            />
                                        </div>
                                    </div>

                                    {/* ── PROMINENT LIVE FX RATE CARD (Finding 1) ── */}
                                    <div className="p-4 rounded-2xl border border-amber-200 bg-amber-50/70 space-y-2.5">
                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center gap-2">
                                                <Sparkles className="w-4 h-4 text-[#C9A227]" />
                                                <span className="text-xs font-bold text-amber-900 uppercase tracking-wider">
                                                    PapaEgo Offered FX Rate
                                                </span>
                                            </div>
                                            <span className="text-xs font-semibold text-slate-500">
                                                {loadingRates ? "Updating rate..." : "Guaranteed Market Rate"}
                                            </span>
                                        </div>

                                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pt-1 border-t border-amber-200/60">
                                            <div>
                                                <p className="text-xs text-slate-500">Exchange Rate</p>
                                                <p className="text-sm font-extrabold text-slate-900">
                                                    1 {fromCurrency} = {currentRate >= 1 ? currentRate.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 4 }) : currentRate.toFixed(6)} {toCurrency}
                                                </p>
                                            </div>

                                            <div className="sm:text-right">
                                                <p className="text-xs text-slate-500">Estimated Recipient Receives</p>
                                                <p className="text-base font-extrabold text-emerald-700">
                                                    {toCurrency} {calculatedPayout > 0 ? calculatedPayout.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 }) : "0.00"}
                                                </p>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Next Button */}
                                    <button
                                        type="submit"
                                        className="w-full h-12 rounded-xl font-bold text-white flex items-center justify-center gap-2 transition-all shadow-sm hover:opacity-95 mt-2"
                                        style={{ backgroundColor: "#C9A227" }}
                                    >
                                        Next: Supplier Details →
                                    </button>
                                </form>
                            )}

                            {/* ── Step 2: Supplier Selection (Finding 5) ── */}
                            {step === 2 && (
                                <form onSubmit={handleStep2Next} className="space-y-4">
                                    {/* Supplier Selector */}
                                    {savedSuppliers.length > 0 && !useNewSupplier ? (
                                        <div className="p-4 rounded-2xl border border-slate-200 bg-slate-50/70 space-y-3">
                                            <div className="flex items-center justify-between">
                                                <label className="text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
                                                    <Building2 className="w-4 h-4 text-[#C9A227]" />
                                                    Select Saved Supplier
                                                </label>
                                                <button
                                                    type="button"
                                                    onClick={() => {
                                                        setUseNewSupplier(true);
                                                        setSupplier(EMPTY_SUPPLIER);
                                                    }}
                                                    className="text-xs font-bold text-[#C9A227] hover:underline"
                                                >
                                                    + Add New Supplier
                                                </button>
                                            </div>

                                            <select
                                                value={supplier.id || ""}
                                                onChange={(e) => {
                                                    const id = e.target.value;
                                                    const found = savedSuppliers.find((s) => s.id === id);
                                                    if (found) {
                                                        setSupplier({
                                                            id: found.id,
                                                            businessName: found.businessName || found.beneficiaryName || "",
                                                            bankName: found.bankName || "",
                                                            accountNumber: found.accountNumber || "",
                                                            sector: found.sector || found.routingCode || "",
                                                            address: found.address || "",
                                                        });
                                                    } else {
                                                        setSupplier(EMPTY_SUPPLIER);
                                                    }
                                                }}
                                                className="w-full border rounded-xl px-3 py-2.5 text-sm font-semibold outline-none bg-white border-slate-200 focus:border-[#C9A227]"
                                            >
                                                <option value="">-- Choose from your suppliers --</option>
                                                {savedSuppliers.map((s) => (
                                                    <option key={s.id} value={s.id}>
                                                        {s.businessName || s.beneficiaryName} — {s.bankName} ({s.accountNumber})
                                                    </option>
                                                ))}
                                            </select>

                                            {supplier.businessName && (
                                                <div className="p-3 bg-white rounded-xl border border-slate-200 text-xs space-y-1">
                                                    <p className="font-bold text-slate-900">{supplier.businessName}</p>
                                                    <p className="text-slate-600">{supplier.bankName} • {supplier.accountNumber}</p>
                                                    {supplier.address && <p className="text-slate-400">{supplier.address}</p>}
                                                </div>
                                            )}
                                        </div>
                                    ) : (
                                        /* Manual Supplier Entry */
                                        <div className="space-y-3">
                                            {savedSuppliers.length > 0 && (
                                                <div className="flex justify-between items-center pb-1">
                                                    <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
                                                        New Supplier Details
                                                    </span>
                                                    <button
                                                        type="button"
                                                        onClick={() => {
                                                            setUseNewSupplier(false);
                                                            setSupplier(EMPTY_SUPPLIER);
                                                        }}
                                                        className="text-xs font-bold text-slate-600 hover:text-slate-900 flex items-center gap-1"
                                                    >
                                                        <ChevronLeft className="w-3 h-3" /> Back to saved suppliers
                                                    </button>
                                                </div>
                                            )}

                                            <div>
                                                <label className="text-xs font-bold uppercase tracking-wider block text-slate-500 mb-1">
                                                    Supplier Business Name *
                                                </label>
                                                <input
                                                    value={supplier.businessName}
                                                    onChange={(e) => updateSupplier("businessName", e.target.value)}
                                                    placeholder="e.g. Apex Global Trading Ltd"
                                                    required
                                                    className="w-full border rounded-xl px-3 py-2.5 text-sm font-medium outline-none border-slate-200 focus:border-[#C9A227]"
                                                />
                                            </div>

                                            <div className="grid grid-cols-2 gap-3">
                                                <div>
                                                    <label className="text-xs font-bold uppercase tracking-wider block text-slate-500 mb-1">
                                                        Bank Name
                                                    </label>
                                                    <input
                                                        value={supplier.bankName}
                                                        onChange={(e) => updateSupplier("bankName", e.target.value)}
                                                        placeholder="e.g. JPMorgan Chase"
                                                        className="w-full border rounded-xl px-3 py-2.5 text-sm font-medium outline-none border-slate-200 focus:border-[#C9A227]"
                                                    />
                                                </div>
                                                <div>
                                                    <label className="text-xs font-bold uppercase tracking-wider block text-slate-500 mb-1">
                                                        Account Number / IBAN
                                                    </label>
                                                    <input
                                                        value={supplier.accountNumber}
                                                        onChange={(e) => updateSupplier("accountNumber", e.target.value)}
                                                        placeholder="0123456789"
                                                        className="w-full border rounded-xl px-3 py-2.5 text-sm font-medium outline-none border-slate-200 focus:border-[#C9A227]"
                                                    />
                                                </div>
                                            </div>

                                            <div className="grid grid-cols-2 gap-3">
                                                <div>
                                                    <label className="text-xs font-bold uppercase tracking-wider block text-slate-500 mb-1">
                                                        Sector
                                                    </label>
                                                    <select
                                                        value={supplier.sector}
                                                        onChange={(e) => updateSupplier("sector", e.target.value)}
                                                        className="w-full border rounded-xl px-3 py-2.5 text-sm font-medium outline-none bg-white border-slate-200 focus:border-[#C9A227]"
                                                    >
                                                        <option value="">Select sector...</option>
                                                        {NIGERIAN_SECTORS.map((s) => (
                                                            <option key={s} value={s}>{s}</option>
                                                        ))}
                                                    </select>
                                                </div>
                                                <div>
                                                    <label className="text-xs font-bold uppercase tracking-wider block text-slate-500 mb-1">
                                                        Supplier Address
                                                    </label>
                                                    <input
                                                        value={supplier.address}
                                                        onChange={(e) => updateSupplier("address", e.target.value)}
                                                        placeholder="City, Country"
                                                        className="w-full border rounded-xl px-3 py-2.5 text-sm font-medium outline-none border-slate-200 focus:border-[#C9A227]"
                                                    />
                                                </div>
                                            </div>
                                        </div>
                                    )}

                                    {/* Purpose */}
                                    <div>
                                        <label className="text-xs font-bold uppercase tracking-wider block text-slate-500 mb-1">
                                            Transaction Purpose (Optional)
                                        </label>
                                        <input
                                            value={purpose}
                                            onChange={(e) => setPurpose(e.target.value)}
                                            placeholder="e.g. Raw materials import, Software license payment..."
                                            className="w-full border rounded-xl px-3 py-2.5 text-sm font-medium outline-none border-slate-200 focus:border-[#C9A227]"
                                        />
                                    </div>

                                    {/* Invoice Attachment */}
                                    <div>
                                        <label className="text-xs font-bold uppercase tracking-wider block text-slate-500 mb-1">
                                            Attach Invoice / Supporting Document (Optional)
                                        </label>
                                        <input
                                            type="file"
                                            onChange={(e) => {
                                                if (e.target.files && e.target.files[0]) {
                                                    setInvoiceFile(e.target.files[0]);
                                                }
                                            }}
                                            accept="image/jpeg,image/png,image/jpg,application/pdf"
                                            className="w-full border rounded-xl px-3 py-2 text-xs outline-none bg-white border-slate-200 cursor-pointer"
                                        />
                                        {invoiceFile && (
                                            <p className="text-xs mt-1 text-emerald-600 font-medium">Selected: {invoiceFile.name}</p>
                                        )}
                                    </div>

                                    <div className="flex gap-3 pt-2">
                                        <button
                                            type="button"
                                            onClick={() => setStep(1)}
                                            className="flex-1 h-12 rounded-xl font-bold border border-slate-300 text-slate-700 hover:bg-slate-50 transition-colors"
                                        >
                                            Back
                                        </button>
                                        <button
                                            type="submit"
                                            className="flex-1 h-12 rounded-xl font-bold text-white transition-all shadow-sm hover:opacity-95"
                                            style={{ backgroundColor: "#C9A227" }}
                                        >
                                            Next: Review Trade Details →
                                        </button>
                                    </div>
                                </form>
                            )}

                            {/* ── Step 3: Trade Review & Confirmation (Finding 6) ── */}
                            {step === 3 && (
                                <div className="space-y-4">
                                    <div className="rounded-2xl border border-slate-200 bg-slate-50/80 p-5 space-y-4">
                                        <div className="flex items-center justify-between border-b pb-3 border-slate-200">
                                            <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
                                                Trade Summary Breakdown
                                            </span>
                                            <span className="text-xs font-bold text-[#C9A227]">
                                                Review before submit
                                            </span>
                                        </div>

                                        {/* Selling -> Buying Flow Box */}
                                        <div className="bg-white border rounded-xl p-4 flex items-center justify-between border-slate-200">
                                            <div>
                                                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">You Send</span>
                                                <p className="text-base font-extrabold text-slate-900 mt-0.5">
                                                    {fromCurrency} {parseFloat(amount).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                                                </p>
                                            </div>

                                            <ArrowRight className="w-5 h-5 text-slate-400" />

                                            <div className="text-right">
                                                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Supplier Receives</span>
                                                <p className="text-base font-extrabold text-emerald-700 mt-0.5">
                                                    {toCurrency} {calculatedPayout.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                                                </p>
                                            </div>
                                        </div>

                                        {/* Detailed rows */}
                                        <div className="divide-y divide-slate-100 text-xs space-y-2 pt-1">
                                            <div className="pt-2 flex justify-between">
                                                <span className="text-slate-500">Supplier / Beneficiary</span>
                                                <span className="font-bold text-slate-900 text-right">{supplier.businessName || "—"}</span>
                                            </div>
                                            {supplier.bankName && (
                                                <div className="pt-2 flex justify-between">
                                                    <span className="text-slate-500">Bank & Account</span>
                                                    <span className="font-semibold text-slate-800 text-right">{supplier.bankName} ({supplier.accountNumber || "—"})</span>
                                                </div>
                                            )}
                                            <div className="pt-2 flex justify-between">
                                                <span className="text-slate-500">Offered FX Rate</span>
                                                <span className="font-bold text-slate-900">
                                                    1 {fromCurrency} = {currentRate >= 1 ? currentRate.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 4 }) : currentRate.toFixed(6)} {toCurrency}
                                                </span>
                                            </div>
                                            <div className="pt-2 flex justify-between">
                                                <span className="text-slate-500">PapaEgo Platform Fees</span>
                                                <span className="font-bold text-emerald-600">₦0.00 (Zero Fee)</span>
                                            </div>
                                            {purpose && (
                                                <div className="pt-2 flex justify-between">
                                                    <span className="text-slate-500">Purpose</span>
                                                    <span className="font-medium text-slate-700 text-right">{purpose}</span>
                                                </div>
                                            )}
                                            {invoiceFile && (
                                                <div className="pt-2 flex justify-between">
                                                    <span className="text-slate-500">Attachment</span>
                                                    <span className="font-medium text-emerald-600">{invoiceFile.name}</span>
                                                </div>
                                            )}
                                            <div className="pt-3 flex justify-between text-sm font-extrabold border-t border-slate-200">
                                                <span className="text-slate-900">Total Payable</span>
                                                <span className="text-slate-900">{fromCurrency} {parseFloat(amount).toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Low funds or ledger reservation banner */}
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
                                                    {fundingPaystack ? "Loading..." : `Top Up ₦${parseFloat(lowFundsError.shortfall).toLocaleString()} via Paystack`}
                                                </button>
                                            </div>
                                        </div>
                                    ) : (
                                        <div className="p-3 rounded-xl border border-emerald-100 bg-emerald-50/60 flex items-center justify-between text-xs text-emerald-900">
                                            <div className="flex items-center gap-2">
                                                <Wallet className="w-4 h-4 text-emerald-600" />
                                                <span>
                                                    Funds will be reserved from your Spendable Ledger upon submission.
                                                </span>
                                            </div>
                                            {availableBalance !== null && (
                                                <span className="font-semibold text-emerald-700">
                                                    Available: ₦{availableBalance.toLocaleString()}
                                                </span>
                                            )}
                                        </div>
                                    )}

                                    {/* Action Buttons */}
                                    <div className="flex flex-col gap-2 pt-2">
                                        <div className="flex gap-3">
                                            <button
                                                type="button"
                                                onClick={() => setStep(2)}
                                                className="flex-1 h-12 rounded-xl font-bold border border-slate-300 text-slate-700 hover:bg-slate-50 transition-colors"
                                            >
                                                Back to Edit
                                            </button>
                                            <button
                                                type="button"
                                                disabled={submitting}
                                                onClick={() => handleSubmit(undefined, true)}
                                                className="flex-1 h-12 rounded-xl font-bold border border-slate-300 text-slate-700 hover:bg-slate-50 bg-white transition-colors"
                                            >
                                                Save as Draft
                                            </button>
                                        </div>

                                        <button
                                            type="button"
                                            disabled={submitting}
                                            onClick={() => handleSubmit(undefined, false)}
                                            className="w-full h-12 rounded-xl font-bold text-white flex items-center justify-center gap-2 transition-all shadow-md hover:opacity-95 disabled:opacity-60"
                                            style={{ backgroundColor: "#C9A227" }}
                                        >
                                            {submitting && (
                                                <RefreshCw className="w-4 h-4 animate-spin" />
                                            )}
                                            {submitting ? "Processing..." : draftToEdit ? "Publish & Submit Trade" : "Confirm & Submit Trade"}
                                        </button>
                                    </div>
                                </div>
                            )}
                        </div>
                    </>
                )}
            </div>
        </div>
    );
}

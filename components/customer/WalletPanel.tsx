"use client";

import { useCallback, useEffect, useState } from "react";
import { getMyWallet, type WalletSummary, type WalletTransaction, type WalletTransactionType } from "@/lib/api/wallet";
import { customerApi } from "@/lib/api/customer";
import { toast } from "sonner";
import {
    Wallet,
    CreditCard,
    Sparkles,
    CheckCircle2,
    RefreshCw,
    ArrowDownLeft,
    ArrowUpRight,
    Clock,
    ShieldCheck,
    Search,
    Filter,
    X,
    ChevronLeft,
    ChevronRight,
    Calendar,
    Copy,
    Check,
    Building,
} from "lucide-react";

function formatMoney(amount: string | number, currency = "NGN") {
    const value = typeof amount === "string" ? Number(amount) : amount;
    return new Intl.NumberFormat("en-NG", {
        style: "currency",
        currency,
        minimumFractionDigits: 2,
    }).format(Number.isFinite(value) ? value : 0);
}

function formatDate(iso: string) {
    return new Date(iso).toLocaleString();
}

const PRESET_AMOUNTS = [20000000, 50000000, 100000000, 250000000, 500000000];

const TYPE_OPTIONS: { label: string; value: WalletTransactionType | "ALL" }[] = [
    { label: "All Types", value: "ALL" },
    { label: "Deposits", value: "DEPOSIT" },
    { label: "Trade Debits", value: "TRADE_DEBIT" },
    { label: "Trade Refunds", value: "TRADE_REFUND" },
    { label: "Adjustment Credit", value: "ADJUSTMENT_CREDIT" },
    { label: "Adjustment Debit", value: "ADJUSTMENT_DEBIT" },
];

export function WalletPanel() {
    const [summary, setSummary] = useState<WalletSummary | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    // KYC/KYB Verification gate state
    const [verification, setVerification] = useState<{
        isFullyVerified: boolean;
        kycStatus: string;
        kybStatus?: string | null;
    } | null>(null);

    // Filter states
    const [selectedType, setSelectedType] = useState<WalletTransactionType | "ALL">("ALL");
    const [search, setSearch] = useState("");
    const [startDate, setStartDate] = useState("");
    const [endDate, setEndDate] = useState("");
    const [minAmount, setMinAmount] = useState("");
    const [maxAmount, setMaxAmount] = useState("");
    const [currentPage, setCurrentPage] = useState(1);
    const limit = 10;

    // MoneyPings Instant Bank Rail state (Minimum ₦20,000,000)
    const [depositAmount, setDepositAmount] = useState("20000000");
    const [submittingMoneyPings, setSubmittingMoneyPings] = useState(false);
    const [moneyPingsAccount, setMoneyPingsAccount] = useState<{
        accountNumber: string;
        accountName: string;
        bankName: string;
        amount: number;
        expiresAt: string;
        reference: string;
    } | null>(null);
    const [copied, setCopied] = useState(false);

    const load = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            const walletData = await getMyWallet({
                page: currentPage,
                limit,
                type: selectedType,
                search: search.trim() || undefined,
                startDate: startDate || undefined,
                endDate: endDate || undefined,
                minAmount: minAmount ? Number(minAmount) : undefined,
                maxAmount: maxAmount ? Number(maxAmount) : undefined,
            });
            setSummary(walletData);
        } catch (err) {
            console.error("Failed to load wallet", err);
            setError("We couldn't load your wallet. Please try again.");
        } finally {
            setLoading(false);
        }
    }, [currentPage, selectedType, search, startDate, endDate, minAmount, maxAmount]);

    useEffect(() => {
        load();
        customerApi.getKycStatus().then((res) => {
            setVerification(res);
        }).catch(() => {});
    }, [load]);

    const resetFilters = () => {
        setSelectedType("ALL");
        setSearch("");
        setStartDate("");
        setEndDate("");
        setMinAmount("");
        setMaxAmount("");
        setCurrentPage(1);
    };

    const hasActiveFilters = selectedType !== "ALL" || search || startDate || endDate || minAmount || maxAmount;

    const handleMoneyPingsDeposit = async () => {
        if (verification && verification.isFullyVerified === false) {
            toast.error("Your identity & business verification (KYC/KYB) must be approved before funding your ledger.");
            return;
        }

        const parsed = Number(depositAmount);
        if (!parsed || parsed < 20000000) {
            toast.error("Minimum transaction amount is ₦20,000,000.");
            return;
        }

        setSubmittingMoneyPings(true);
        try {
            const data = await customerApi.initMoneyPingsDeposit(parsed);
            setMoneyPingsAccount(data);
            toast.success("Dedicated MoneyPings deposit account generated!");
        } catch (err: any) {
            console.error("MoneyPings deposit initialization error:", err);
            toast.error(err?.response?.data?.error || err?.response?.data?.details || "Failed to generate MoneyPings deposit account");
        } finally {
            setSubmittingMoneyPings(false);
        }
    };

    const handleCopyAccount = (acc: string) => {
        navigator.clipboard.writeText(acc);
        setCopied(true);
        toast.success("Account number copied to clipboard!");
        setTimeout(() => setCopied(false), 2000);
    };

    const currency = summary?.currency ?? "NGN";
    const transactions = summary?.transactions ?? [];
    const totalCount = summary?.totalCount ?? transactions.length;
    const totalPages = summary?.totalPages ?? (Math.ceil(totalCount / limit) || 1);

    return (
        <div className="space-y-6 font-sans">
            {/* Balance cards */}
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                <div className="rounded-2xl border bg-white p-6 shadow-sm border-slate-200">
                    <div className="flex items-center justify-between mb-2">
                        <span className="text-xs font-bold uppercase tracking-wider text-slate-500">Available Balance</span>
                        <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
                            <Wallet className="w-4 h-4" />
                        </div>
                    </div>
                    <p className="text-2xl md:text-3xl font-extrabold text-slate-900 tracking-tight">
                        {loading && !summary ? "—" : formatMoney(summary?.availableBalance ?? 0, currency)}
                    </p>
                    <p className="text-xs text-emerald-600 mt-2 font-medium">Ready for immediate trades</p>
                </div>

                <div className="rounded-2xl border bg-white p-6 shadow-sm border-slate-200">
                    <div className="flex items-center justify-between mb-2">
                        <span className="text-xs font-bold uppercase tracking-wider text-slate-500">Reserved (In-Flight Trades)</span>
                        <div className="w-8 h-8 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center">
                            <Clock className="w-4 h-4" />
                        </div>
                    </div>
                    <p className="text-2xl md:text-3xl font-extrabold text-slate-900 tracking-tight">
                        {loading && !summary ? "—" : formatMoney(summary?.reservedBalance ?? 0, currency)}
                    </p>
                    <p className="text-xs text-amber-600 mt-2 font-medium">Held for active trades</p>
                </div>

                <div className="rounded-2xl border bg-white p-6 shadow-sm border-slate-200">
                    <div className="flex items-center justify-between mb-2">
                        <span className="text-xs font-bold uppercase tracking-wider text-slate-500">Total Deposited</span>
                        <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
                            <ShieldCheck className="w-4 h-4" />
                        </div>
                    </div>
                    <p className="text-2xl md:text-3xl font-extrabold text-slate-900 tracking-tight">
                        {loading && !summary ? "—" : formatMoney(summary?.totalDeposited ?? 0, currency)}
                    </p>
                    <p className="text-xs text-slate-500 mt-2 font-medium">Cumulative funded amount</p>
                </div>
            </div>

            {error && (
                <div className="rounded-xl bg-red-50 p-4 text-sm text-red-700 border border-red-200">{error}</div>
            )}

            {/* Fund wallet via MoneyPings */}
            <div className="rounded-2xl border bg-white p-6 shadow-sm border-slate-200 space-y-5">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 border-b pb-4 border-slate-100">
                    <div>
                        <h3 className="text-lg font-bold text-slate-900">Fund Your Ledger via MoneyPings</h3>
                        <p className="text-xs text-slate-500 mt-0.5">
                            Automated bank transfer rails — transfer directly to your dedicated virtual account to credit your ledger instantly.
                        </p>
                    </div>
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 text-emerald-700 text-xs font-bold border border-emerald-200">
                        <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                        MoneyPings Direct Rail
                    </span>
                </div>

                {moneyPingsAccount ? (
                    /* Active Virtual Account Display */
                    <div className="p-6 rounded-2xl bg-gradient-to-br from-amber-50/70 via-slate-50 to-amber-50/40 border border-amber-200/80 space-y-5 animate-fade-in">
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b pb-3 border-amber-200/60">
                            <div>
                                <span className="text-[11px] font-bold uppercase tracking-wider text-amber-800">
                                    Dedicated Deposit Account Ready
                                </span>
                                <h4 className="text-sm font-bold text-slate-900">
                                    Transfer exact funds below via your mobile banking app
                                </h4>
                            </div>
                            <div className="flex items-center gap-1.5 text-xs font-semibold text-amber-900 bg-amber-100/80 px-3 py-1 rounded-lg">
                                <Clock className="w-3.5 h-3.5 text-amber-700" />
                                <span>Expires in ~5 hours</span>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {/* Account Details Box */}
                            <div className="space-y-3 bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
                                <div>
                                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                                        Beneficiary Bank
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
                                    <div className="flex items-center justify-between mt-0.5 bg-slate-50 p-2.5 rounded-lg border border-slate-200">
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

                                <div>
                                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                                        Account Name
                                    </span>
                                    <p className="text-xs font-bold text-slate-800 mt-0.5">
                                        {moneyPingsAccount.accountName || "PapaEgo / Customer Wallet"}
                                    </p>
                                </div>
                            </div>

                            {/* Payment Summary Box */}
                            <div className="space-y-3 bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex flex-col justify-between">
                                <div className="space-y-2">
                                    <div>
                                        <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                                            Exact Amount to Transfer
                                        </span>
                                        <p className="text-2xl font-black text-slate-900 font-mono mt-0.5 text-emerald-600">
                                            ₦{Number(moneyPingsAccount.amount || depositAmount).toLocaleString()}
                                        </p>
                                    </div>
                                    <div className="text-[11px] text-slate-500 bg-slate-50 p-2.5 rounded-lg border border-slate-100 space-y-1">
                                        <p className="flex items-center gap-1 text-slate-700 font-medium">
                                            <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                                            Automated HMAC-SHA256 Webhook Verification
                                        </p>
                                        <p>
                                            Once your bank completes the transfer, MoneyPings notifies PapaEgo and your ledger credits automatically within seconds.
                                        </p>
                                    </div>
                                </div>

                                <div className="flex gap-2 pt-2">
                                    <button
                                        type="button"
                                        onClick={() => setMoneyPingsAccount(null)}
                                        className="flex-1 py-2.5 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50 text-xs font-bold transition-all"
                                    >
                                        New Amount
                                    </button>
                                    <button
                                        type="button"
                                        onClick={async () => {
                                            toast.loading("Checking for credited funds...");
                                            await load();
                                            toast.dismiss();
                                            toast.success("Ledger refreshed!");
                                        }}
                                        className="flex-[2] py-2.5 rounded-xl bg-[#C9A227] hover:bg-[#b08e20] text-white text-xs font-bold flex items-center justify-center gap-1.5 shadow-sm transition-all"
                                    >
                                        <RefreshCw className="w-3.5 h-3.5" />
                                        I Have Transferred / Refresh
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                ) : (
                    /* Amount Selection & Generation View */
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-3">
                            <label className="block text-xs font-bold uppercase tracking-wider text-slate-600">
                                Deposit Amount ({currency})
                            </label>
                            <div className="relative">
                                <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 font-bold text-sm">
                                    ₦
                                </span>
                                <input
                                    type="number"
                                    min="100"
                                    step="100"
                                    value={depositAmount}
                                    onChange={(e) => setDepositAmount(e.target.value)}
                                    className="w-full pl-8 pr-4 py-2.5 rounded-xl border border-slate-200 font-bold text-base text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#C9A227]/40 focus:border-[#C9A227]"
                                    placeholder="50,000.00"
                                />
                            </div>

                            {/* Quick Presets */}
                            <div className="space-y-1">
                                <span className="text-[11px] font-semibold text-slate-500">Quick Select:</span>
                                <div className="grid grid-cols-3 gap-2">
                                    {PRESET_AMOUNTS.map((preset) => (
                                        <button
                                            key={preset}
                                            type="button"
                                            onClick={() => setDepositAmount(preset.toString())}
                                            className={`py-1.5 px-2 rounded-lg text-xs font-semibold border transition-all ${
                                                depositAmount === preset.toString()
                                                    ? "bg-amber-50 border-[#C9A227] text-[#C9A227]"
                                                    : "bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100"
                                            }`}
                                        >
                                            ₦{preset.toLocaleString()}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        </div>

                        <div className="flex flex-col justify-between bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-4">
                            <div className="space-y-2">
                                <div className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                                    <Building className="w-4 h-4 text-[#C9A227]" />
                                    Dedicated MoneyPings Bank Transfer Rail
                                </div>
                                <p className="text-xs text-slate-600">
                                    Generates a unique Nigerian virtual bank account number dedicated to this deposit. No card fees, no transaction limits.
                                </p>
                            </div>

                            <button
                                type="button"
                                disabled={submittingMoneyPings || !depositAmount || parseFloat(depositAmount) <= 0}
                                onClick={handleMoneyPingsDeposit}
                                className="w-full py-3 rounded-xl bg-[#C9A227] hover:bg-[#b08e20] text-white font-bold text-sm flex items-center justify-center gap-2 shadow-sm transition-all disabled:opacity-50"
                            >
                                {submittingMoneyPings ? (
                                    <RefreshCw className="w-4 h-4 animate-spin" />
                                ) : (
                                    <Building className="w-4 h-4" />
                                )}
                                {submittingMoneyPings
                                    ? "Generating Dedicated Account..."
                                    : `Generate Deposit Account (₦${depositAmount ? Number(depositAmount).toLocaleString() : "0"})`}
                            </button>
                        </div>
                    </div>
                )}
            </div>

            {/* ── Wallet Ledger Transactions with Filters & Pagination (Findings 7 & 8) ── */}
            <div className="rounded-2xl border bg-white p-6 shadow-sm border-slate-200 space-y-5">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div>
                        <h3 className="text-lg font-bold text-slate-900">Ledger Activity</h3>
                        <p className="text-xs text-slate-500">Immutable record of every deposit, trade deduction, and refund</p>
                    </div>
                    <button
                        onClick={load}
                        className="text-xs font-bold text-[#C9A227] hover:underline flex items-center gap-1 self-start sm:self-auto"
                    >
                        <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`} /> Refresh Table
                    </button>
                </div>

                {/* Filter Toolbar */}
                <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 space-y-3">
                    <div className="flex items-center justify-between">
                        <span className="text-xs font-bold uppercase tracking-wider text-slate-600 flex items-center gap-1.5">
                            <Filter className="w-3.5 h-3.5 text-[#C9A227]" />
                            Transaction Filters
                        </span>
                        {hasActiveFilters && (
                            <button
                                onClick={resetFilters}
                                className="text-xs font-bold text-red-600 hover:underline flex items-center gap-1"
                            >
                                <X className="w-3.5 h-3.5" /> Clear Filters
                            </button>
                        )}
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                        {/* Search description */}
                        <div className="relative">
                            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                            <input
                                type="text"
                                value={search}
                                onChange={(e) => {
                                    setSearch(e.target.value);
                                    setCurrentPage(1);
                                }}
                                placeholder="Search by description or ID..."
                                className="w-full pl-9 pr-3 py-2 rounded-lg border border-slate-200 bg-white text-xs font-medium focus:outline-none focus:border-[#C9A227]"
                            />
                        </div>

                        {/* Type Select */}
                        <div>
                            <select
                                value={selectedType}
                                onChange={(e) => {
                                    setSelectedType(e.target.value as any);
                                    setCurrentPage(1);
                                }}
                                className="w-full px-3 py-2 rounded-lg border border-slate-200 bg-white text-xs font-semibold text-slate-800 focus:outline-none focus:border-[#C9A227]"
                            >
                                {TYPE_OPTIONS.map((opt) => (
                                    <option key={opt.value} value={opt.value}>
                                        {opt.label}
                                    </option>
                                ))}
                            </select>
                        </div>

                        {/* Date From */}
                        <div className="relative">
                            <input
                                type="date"
                                value={startDate}
                                onChange={(e) => {
                                    setStartDate(e.target.value);
                                    setCurrentPage(1);
                                }}
                                className="w-full px-3 py-2 rounded-lg border border-slate-200 bg-white text-xs font-medium text-slate-700 focus:outline-none focus:border-[#C9A227]"
                                title="From Date"
                            />
                        </div>

                        {/* Date To */}
                        <div className="relative">
                            <input
                                type="date"
                                value={endDate}
                                onChange={(e) => {
                                    setEndDate(e.target.value);
                                    setCurrentPage(1);
                                }}
                                className="w-full px-3 py-2 rounded-lg border border-slate-200 bg-white text-xs font-medium text-slate-700 focus:outline-none focus:border-[#C9A227]"
                                title="To Date"
                            />
                        </div>
                    </div>
                </div>

                {/* Table */}
                {loading ? (
                    <div className="space-y-2 py-4">
                        {Array.from({ length: 5 }).map((_, i) => (
                            <div key={i} className="h-12 bg-slate-100 rounded-lg animate-pulse" />
                        ))}
                    </div>
                ) : transactions.length === 0 ? (
                    <div className="text-center py-12 text-slate-400 text-xs border border-dashed rounded-xl bg-slate-50/50">
                        No ledger transactions found {hasActiveFilters ? "matching your filter criteria" : "yet"}.
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-slate-100 text-xs">
                            <thead>
                                <tr className="text-left font-bold uppercase tracking-wider text-slate-400">
                                    <th className="py-2.5 pr-4">Type</th>
                                    <th className="py-2.5 pr-4">Description</th>
                                    <th className="py-2.5 pr-4">Amount</th>
                                    <th className="py-2.5 pr-4">Balance After</th>
                                    <th className="py-2.5 pr-4">Date</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-50">
                                {transactions.map((tx) => {
                                    const isCredit = Number(tx.amount) > 0;
                                    return (
                                        <tr key={tx.id} className="hover:bg-slate-50/60 transition-colors">
                                            <td className="py-3 pr-4 font-semibold">
                                                <span
                                                    className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-[11px] font-bold ${
                                                        isCredit
                                                            ? "bg-emerald-50 text-emerald-700"
                                                            : "bg-red-50 text-red-700"
                                                    }`}
                                                >
                                                    {isCredit ? (
                                                        <ArrowDownLeft className="w-3 h-3 text-emerald-600" />
                                                    ) : (
                                                        <ArrowUpRight className="w-3 h-3 text-red-600" />
                                                    )}
                                                    {tx.type}
                                                </span>
                                            </td>
                                            <td className="py-3 pr-4 text-slate-700 font-medium">{tx.description || "—"}</td>
                                            <td className={`py-3 pr-4 font-bold ${isCredit ? "text-emerald-700" : "text-slate-900"}`}>
                                                {isCredit ? "+" : ""}{formatMoney(tx.amount, tx.currency || currency)}
                                            </td>
                                            <td className="py-3 pr-4 text-slate-600 font-semibold">{formatMoney(tx.balanceAfter, tx.currency || currency)}</td>
                                            <td className="py-3 pr-4 text-slate-400">{formatDate(tx.createdAt)}</td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                )}

                {/* ── Pagination Controls (Finding 7) ── */}
                {totalPages > 1 && (
                    <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-4 border-t border-slate-100">
                        <p className="text-xs text-slate-500 font-medium">
                            Showing page <span className="font-bold text-slate-800">{currentPage}</span> of{" "}
                            <span className="font-bold text-slate-800">{totalPages}</span> ({totalCount} total entries)
                        </p>

                        <div className="flex items-center gap-2">
                            <button
                                disabled={currentPage === 1 || loading}
                                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                                className="px-3 py-1.5 rounded-lg text-xs font-bold border border-slate-200 text-slate-700 hover:bg-slate-50 transition-colors disabled:opacity-30 disabled:cursor-not-allowed flex items-center gap-1"
                            >
                                <ChevronLeft className="w-3.5 h-3.5" /> Previous
                            </button>

                            <div className="flex items-center gap-1">
                                {Array.from({ length: totalPages }, (_, i) => i + 1)
                                    .filter((p) => p === 1 || p === totalPages || Math.abs(p - currentPage) <= 1)
                                    .map((p, idx, arr) => {
                                        const prev = arr[idx - 1];
                                        return (
                                            <div key={p} className="flex items-center gap-1">
                                                {prev && p - prev > 1 && <span className="text-slate-400 text-xs px-1">…</span>}
                                                <button
                                                    onClick={() => setCurrentPage(p)}
                                                    className={`w-7 h-7 rounded-lg text-xs font-bold transition-colors ${
                                                        currentPage === p
                                                            ? "bg-[#C9A227] text-white"
                                                            : "border border-slate-200 text-slate-700 hover:bg-slate-50"
                                                    }`}
                                                >
                                                    {p}
                                                </button>
                                            </div>
                                        );
                                    })}
                            </div>

                            <button
                                disabled={currentPage === totalPages || loading}
                                onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                                className="px-3 py-1.5 rounded-lg text-xs font-bold border border-slate-200 text-slate-700 hover:bg-slate-50 transition-colors disabled:opacity-30 disabled:cursor-not-allowed flex items-center gap-1"
                            >
                                Next <ChevronRight className="w-3.5 h-3.5" />
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}

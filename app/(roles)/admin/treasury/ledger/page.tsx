"use client";

import { useState, useCallback } from "react";
import { useQuery } from "@tanstack/react-query";
import { treasuryApi, type LedgerEntry, type LedgerEntryType } from "@/lib/api/treasury";
import {
    ArrowLeft,
    Search,
    FileText,
    Filter,
    ArrowUpRight,
    ArrowDownLeft,
    Lock,
    Unlock,
    CheckCircle2,
    DollarSign,
    RefreshCw,
    ChevronLeft,
    ChevronRight,
    X,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import Link from "next/link";

// ─── Constants ────────────────────────────────────────────────────────────────

const LEDGER_ENTRY_CONFIG: Record<
    LedgerEntryType,
    { label: string; icon: typeof ArrowUpRight; color: string; bg: string }
> = {
    DEPOSIT: { label: "Deposit", icon: ArrowDownLeft, color: "#27ae60", bg: "#e2fded" },
    WITHDRAWAL: { label: "Withdrawal", icon: ArrowUpRight, color: "#e05555", bg: "#ffe5e5" },
    RESERVATION: { label: "Reservation", icon: Lock, color: "#f0a500", bg: "#fff3d0" },
    RELEASE: { label: "Release", icon: Unlock, color: "#1890ff", bg: "#e6f7ff" },
    SETTLEMENT: { label: "Settlement", icon: CheckCircle2, color: "#6b3fa0", bg: "#f0e8ff" },
    FEE: { label: "Fee", icon: DollarSign, color: "#e05555", bg: "#ffe5e5" },
    SYNC_ADJUSTMENT: { label: "Sync Adjustment", icon: RefreshCw, color: "#6b7078", bg: "#f0f0f0" },
};

const CURRENCY_SYMBOLS: Record<string, string> = {
    NGN: "₦", USD: "$", EUR: "€", GBP: "£", AED: "د.إ", CNY: "¥", USDT: "₮", USDC: "◎",
};

const PAGE_SIZE_OPTIONS = [25, 50, 100];

// ─── Formatters ───────────────────────────────────────────────────────────────

function formatAmount(amount: string | number, currency: string): string {
    const num = typeof amount === "string" ? parseFloat(amount) : amount;
    const symbol = CURRENCY_SYMBOLS[currency] || "";
    return `${symbol}${num.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

function formatDate(date: string): string {
    return new Date(date).toLocaleString("en-GB", {
        day: "2-digit",
        month: "short",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
    });
}

function shortRef(ref: string): string {
    return ref.substring(0, 8).toUpperCase();
}

// ─── Ledger Row ───────────────────────────────────────────────────────────────

function LedgerRow({
    entry,
    onClick,
}: {
    entry: LedgerEntry;
    onClick: () => void;
}) {
    const config = LEDGER_ENTRY_CONFIG[entry.transactionType] || LEDGER_ENTRY_CONFIG.DEPOSIT;
    const Icon = config.icon;

    return (
        <tr
            className="border-b border-gray-100 hover:bg-amber-50/40 cursor-pointer transition-colors group"
            onClick={onClick}
        >
            <td className="px-4 py-3">
                <div className="flex items-center gap-2">
                    <div
                        className="w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0"
                        style={{ backgroundColor: config.bg }}
                    >
                        <Icon size={13} style={{ color: config.color }} />
                    </div>
                    <div>
                        <p className="text-xs font-mono font-bold text-gray-500">{shortRef(entry.reference)}</p>
                    </div>
                </div>
            </td>
            <td className="px-4 py-3">
                <Badge
                    variant="outline"
                    className="text-xs font-medium"
                    style={{ color: config.color, borderColor: config.color, backgroundColor: config.bg }}
                >
                    {config.label}
                </Badge>
            </td>
            <td className="px-4 py-3">
                <div className="text-sm">
                    {entry.debitAccount ? (
                        <p className="text-gray-700 font-medium">
                            ← {entry.debitAccount.accountName}
                        </p>
                    ) : null}
                    {entry.creditAccount ? (
                        <p className="text-gray-700 font-medium">
                            → {entry.creditAccount.accountName}
                        </p>
                    ) : null}
                    {!entry.debitAccount && !entry.creditAccount && (
                        <p className="text-gray-400 text-xs italic">System</p>
                    )}
                </div>
            </td>
            <td className="px-4 py-3">
                <p className="font-bold text-gray-800 text-sm">
                    {formatAmount(entry.amount, entry.currency)}
                </p>
                <p className="text-xs text-gray-400">{entry.currency}</p>
            </td>
            <td className="px-4 py-3 max-w-xs">
                <p className="text-xs text-gray-500 truncate">{entry.description}</p>
            </td>
            <td className="px-4 py-3">
                <p className="text-xs text-gray-400 whitespace-nowrap">{formatDate(entry.createdAt)}</p>
            </td>
            <td className="px-4 py-3">
                <ArrowUpRight size={14} className="text-gray-300 group-hover:text-amber-500 transition-colors" />
            </td>
        </tr>
    );
}

// ─── Entry Detail Modal ───────────────────────────────────────────────────────

function EntryDetailModal({ entry, onClose }: { entry: LedgerEntry | null; onClose: () => void }) {
    if (!entry) return null;

    const config = LEDGER_ENTRY_CONFIG[entry.transactionType] || LEDGER_ENTRY_CONFIG.DEPOSIT;
    const Icon = config.icon;

    return (
        <Dialog open={!!entry} onOpenChange={onClose}>
            <DialogContent className="max-w-lg">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        <div
                            className="w-8 h-8 rounded-lg flex items-center justify-center"
                            style={{ backgroundColor: config.bg }}
                        >
                            <Icon size={15} style={{ color: config.color }} />
                        </div>
                        Ledger Entry Details
                    </DialogTitle>
                </DialogHeader>

                <div className="space-y-4">
                    {/* Immutability notice */}
                    <div className="p-3 rounded-lg bg-gray-50 border border-gray-200 flex gap-2">
                        <Lock size={13} className="text-gray-400 mt-0.5 flex-shrink-0" />
                        <p className="text-xs text-gray-500">
                            Ledger entries are immutable. This record cannot be modified or deleted.
                        </p>
                    </div>

                    <div className="grid grid-cols-2 gap-3 text-sm">
                        <div className="col-span-2">
                            <p className="text-xs text-gray-400 mb-1">Reference</p>
                            <p className="font-mono font-bold text-gray-800 text-xs bg-gray-50 p-2 rounded-lg break-all">
                                {entry.reference}
                            </p>
                        </div>
                        <div>
                            <p className="text-xs text-gray-400 mb-1">Type</p>
                            <Badge
                                variant="outline"
                                style={{ color: config.color, borderColor: config.color, backgroundColor: config.bg }}
                            >
                                {config.label}
                            </Badge>
                        </div>
                        <div>
                            <p className="text-xs text-gray-400 mb-1">Currency</p>
                            <p className="font-medium text-gray-800">{entry.currency}</p>
                        </div>
                        <div>
                            <p className="text-xs text-gray-400 mb-1">Amount</p>
                            <p className="font-black text-gray-800 text-lg">
                                {formatAmount(entry.amount, entry.currency)}
                            </p>
                        </div>
                        <div>
                            <p className="text-xs text-gray-400 mb-1">Timestamp</p>
                            <p className="font-medium text-gray-800 text-xs">{formatDate(entry.createdAt)}</p>
                        </div>
                        {entry.debitAccount && (
                            <div>
                                <p className="text-xs text-gray-400 mb-1">Debit Account</p>
                                <p className="font-medium text-gray-800">{entry.debitAccount.accountName}</p>
                                <p className="text-xs text-gray-400">{entry.debitAccount.provider}</p>
                            </div>
                        )}
                        {entry.creditAccount && (
                            <div>
                                <p className="text-xs text-gray-400 mb-1">Credit Account</p>
                                <p className="font-medium text-gray-800">{entry.creditAccount.accountName}</p>
                                <p className="text-xs text-gray-400">{entry.creditAccount.provider}</p>
                            </div>
                        )}
                        <div className="col-span-2">
                            <p className="text-xs text-gray-400 mb-1">Description</p>
                            <p className="text-gray-700 text-sm">{entry.description}</p>
                        </div>
                        {entry.metadata && Object.keys(entry.metadata).length > 0 && (
                            <div className="col-span-2">
                                <p className="text-xs text-gray-400 mb-1">Metadata</p>
                                <pre className="text-xs bg-gray-50 p-3 rounded-lg overflow-auto max-h-40 text-gray-600">
                                    {JSON.stringify(entry.metadata, null, 2)}
                                </pre>
                            </div>
                        )}
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function LedgerPage() {
    const [page, setPage] = useState(1);
    const [limit, setLimit] = useState(50);
    const [currencyFilter, setCurrencyFilter] = useState<string>("");
    const [typeFilter, setTypeFilter] = useState<string>("");
    const [search, setSearch] = useState<string>("");
    const [selectedEntry, setSelectedEntry] = useState<LedgerEntry | null>(null);

    const { data, isLoading, refetch } = useQuery({
        queryKey: ["ledger-entries", page, limit, currencyFilter, typeFilter],
        queryFn: () =>
            treasuryApi.getLedgerEntries({
                currency: currencyFilter || undefined,
                transactionType: typeFilter ? (typeFilter as LedgerEntryType) : undefined,
                page,
                limit,
            }),
    });

    const entries = data?.entries ?? [];
    const total = data?.total ?? 0;
    const totalPages = Math.ceil(total / limit);

    // Client-side search filter on reference/description
    const filteredEntries = search
        ? entries.filter(
            (e) =>
                e.reference.toLowerCase().includes(search.toLowerCase()) ||
                e.description.toLowerCase().includes(search.toLowerCase()) ||
                e.debitAccount?.accountName?.toLowerCase().includes(search.toLowerCase()) ||
                e.creditAccount?.accountName?.toLowerCase().includes(search.toLowerCase())
        )
        : entries;

    const clearFilters = useCallback(() => {
        setCurrencyFilter("");
        setTypeFilter("");
        setSearch("");
        setPage(1);
    }, []);

    const hasFilters = currencyFilter || typeFilter || search;

    return (
        <div className="min-h-screen" style={{ backgroundColor: "#f7f8f9" }}>
            {/* Header */}
            <div
                className="px-8 pt-8 pb-8"
                style={{ background: "linear-gradient(135deg, #2f2403 0%, #4a3a05 100%)" }}
            >
                <div className="max-w-7xl mx-auto">
                    <Link href="/admin/treasury" className="flex items-center gap-2 text-white/60 hover:text-white mb-4 transition-colors w-fit">
                        <ArrowLeft size={14} />
                        <span className="text-sm">Back to Treasury</span>
                    </Link>
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <div className="p-2 rounded-xl" style={{ background: "rgba(201,162,39,0.2)" }}>
                                <FileText size={22} style={{ color: "#c9a227" }} />
                            </div>
                            <div>
                                <h1 className="text-2xl font-bold text-white">Treasury Ledger</h1>
                                <p className="text-white/50 text-sm">
                                    Immutable audit trail of all treasury movements
                                </p>
                            </div>
                        </div>
                        <div className="flex items-center gap-2">
                            <span className="text-white/50 text-sm">{total.toLocaleString()} entries</span>
                            <Button
                                size="sm"
                                variant="outline"
                                onClick={() => refetch()}
                                className="text-white/80"
                                style={{ borderColor: "rgba(255,255,255,0.2)", background: "transparent" }}
                            >
                                <RefreshCw size={13} className="mr-1" />
                                Refresh
                            </Button>
                        </div>
                    </div>
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-8 py-8">
                {/* Filters */}
                <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100 mb-6">
                    <div className="flex items-center gap-3 flex-wrap">
                        <div className="flex items-center gap-2 text-sm text-gray-500">
                            <Filter size={14} />
                            <span className="font-medium">Filter:</span>
                        </div>
                        <div className="relative flex-1 min-w-48">
                            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                            <Input
                                placeholder="Search reference, description, account..."
                                value={search}
                                onChange={(e) => { setSearch(e.target.value); setPage(1); }}
                                className="pl-8 h-9 text-sm border-gray-200"
                            />
                        </div>
                        <Select value={currencyFilter || "ALL"} onValueChange={(v) => { setCurrencyFilter(v === "ALL" ? "" : v); setPage(1); }}>
                            <SelectTrigger className="w-32 h-9 text-sm">
                                <SelectValue placeholder="Currency" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="ALL">All Currencies</SelectItem>
                                {["NGN", "USD", "EUR", "GBP", "AED", "CNY", "USDT", "USDC"].map((c) => (
                                    <SelectItem key={c} value={c}>{c}</SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                        <Select value={typeFilter || "ALL"} onValueChange={(v) => { setTypeFilter(v === "ALL" ? "" : v); setPage(1); }}>
                            <SelectTrigger className="w-44 h-9 text-sm">
                                <SelectValue placeholder="Entry Type" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="ALL">All Types</SelectItem>
                                {Object.entries(LEDGER_ENTRY_CONFIG).map(([key, cfg]) => (
                                    <SelectItem key={key} value={key}>{cfg.label}</SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                        <Select value={limit.toString()} onValueChange={(v) => { setLimit(Number(v)); setPage(1); }}>
                            <SelectTrigger className="w-28 h-9 text-sm">
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                {PAGE_SIZE_OPTIONS.map((n) => (
                                    <SelectItem key={n} value={n.toString()}>{n} per page</SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                        {hasFilters && (
                            <Button
                                size="sm"
                                variant="ghost"
                                onClick={clearFilters}
                                className="h-9 text-gray-500 hover:text-gray-800"
                            >
                                <X size={13} className="mr-1" />
                                Clear
                            </Button>
                        )}
                    </div>
                </div>

                {/* Table */}
                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                    {isLoading ? (
                        <div className="p-8 text-center">
                            <RefreshCw size={24} className="animate-spin text-gray-300 mx-auto mb-3" />
                            <p className="text-gray-400">Loading ledger entries...</p>
                        </div>
                    ) : filteredEntries.length === 0 ? (
                        <div className="p-12 text-center">
                            <FileText size={40} className="text-gray-200 mx-auto mb-3" />
                            <p className="text-gray-500 font-medium">No ledger entries found</p>
                            <p className="text-gray-400 text-sm mt-1">
                                {hasFilters ? "Try adjusting your filters" : "Treasury movements will appear here as they occur"}
                            </p>
                        </div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead>
                                    <tr className="border-b border-gray-100">
                                        {["Reference", "Type", "Accounts", "Amount", "Description", "Timestamp", ""].map((col) => (
                                            <th key={col} className="px-4 py-3 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider">
                                                {col}
                                            </th>
                                        ))}
                                    </tr>
                                </thead>
                                <tbody>
                                    {filteredEntries.map((entry) => (
                                        <LedgerRow
                                            key={entry.id}
                                            entry={entry}
                                            onClick={() => setSelectedEntry(entry)}
                                        />
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}

                    {/* Pagination */}
                    {totalPages > 1 && (
                        <div className="flex items-center justify-between px-6 py-4 border-t border-gray-100">
                            <p className="text-sm text-gray-400">
                                Showing {((page - 1) * limit) + 1}–{Math.min(page * limit, total)} of {total.toLocaleString()} entries
                            </p>
                            <div className="flex items-center gap-2">
                                <Button
                                    size="sm"
                                    variant="outline"
                                    onClick={() => setPage((p) => Math.max(1, p - 1))}
                                    disabled={page === 1}
                                    className="h-8 w-8 p-0"
                                >
                                    <ChevronLeft size={14} />
                                </Button>
                                <span className="text-sm text-gray-600 font-medium">
                                    {page} / {totalPages}
                                </span>
                                <Button
                                    size="sm"
                                    variant="outline"
                                    onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                                    disabled={page === totalPages}
                                    className="h-8 w-8 p-0"
                                >
                                    <ChevronRight size={14} />
                                </Button>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            <EntryDetailModal
                entry={selectedEntry}
                onClose={() => setSelectedEntry(null)}
            />
        </div>
    );
}

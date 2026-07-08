"use client";

import { useState, useCallback } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { treasuryApi, type AggregatedBalance, type TreasuryAccount, type BalanceSyncLog } from "@/lib/api/treasury";
import { toast } from "sonner";
import {
    Wallet,
    RefreshCw,
    Plus,
    CheckCircle2,
    XCircle,
    Clock,
    AlertTriangle,
    ArrowUpRight,
    ArrowDownLeft,
    Shield,
    Activity,
    Database,
    Building2,
    Coins,
    DollarSign,
    FileText,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import Link from "next/link";

// ─── Constants ────────────────────────────────────────────────────────────────

const CURRENCY_ICONS: Record<string, string> = {
    NGN: "₦",
    USD: "$",
    EUR: "€",
    GBP: "£",
    AED: "د.إ",
    CNY: "¥",
    USDT: "₮",
    USDC: "◎",
    GHS: "₵",
    KES: "KSh",
};

const CURRENCY_COLORS: Record<string, { bg: string; accent: string; text: string }> = {
    NGN: { bg: "linear-gradient(135deg, #1a6b3c 0%, #0d4527 100%)", accent: "#2dd97a", text: "#fff" },
    USD: { bg: "linear-gradient(135deg, #1a4d8a 0%, #0d2f5e 100%)", accent: "#5ba3f5", text: "#fff" },
    EUR: { bg: "linear-gradient(135deg, #003399 0%, #001f66 100%)", accent: "#6e8ef5", text: "#fff" },
    GBP: { bg: "linear-gradient(135deg, #7a1a2e 0%, #4d0d1c 100%)", accent: "#f57a92", text: "#fff" },
    AED: { bg: "linear-gradient(135deg, #8b3a00 0%, #5c2600 100%)", accent: "#f5a65b", text: "#fff" },
    CNY: { bg: "linear-gradient(135deg, #8b1a1a 0%, #5c1010 100%)", accent: "#f55b5b", text: "#fff" },
    USDT: { bg: "linear-gradient(135deg, #1a6b5e 0%, #0d4538 100%)", accent: "#2dd9c4", text: "#fff" },
    USDC: { bg: "linear-gradient(135deg, #2962b8 0%, #1a3d7a 100%)", accent: "#76b0ff", text: "#fff" },
};

const DEFAULT_COLOR = { bg: "linear-gradient(135deg, #3a3a4a 0%, #22222f 100%)", accent: "#aaa", text: "#fff" };

const ACCOUNT_TYPE_ICONS: Record<string, typeof Building2> = {
    BANK: Building2,
    WALLET: Wallet,
    EXCHANGE: Activity,
    LIQUIDITY_PROVIDER: Coins,
};

// ─── Formatters ───────────────────────────────────────────────────────────────

function formatAmount(amount: string | number, currency: string): string {
    const num = typeof amount === "string" ? parseFloat(amount) : amount;
    const symbol = CURRENCY_ICONS[currency] || "";
    return `${symbol}${num.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

function formatDate(date: string): string {
    return new Date(date).toLocaleString("en-GB", {
        day: "2-digit",
        month: "short",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
    });
}

// ─── Balance Card ─────────────────────────────────────────────────────────────

function BalanceCard({ balance, onClick }: { balance: AggregatedBalance; onClick: () => void }) {
    const colors = CURRENCY_COLORS[balance.currency] || DEFAULT_COLOR;
    const available = parseFloat(balance.totalAvailable.toString());
    const reserved = parseFloat(balance.totalReserved.toString());
    const total = parseFloat(balance.totalBalance.toString());
    const reservedPct = total > 0 ? (reserved / total) * 100 : 0;

    return (
        <div
            className="relative rounded-2xl overflow-hidden cursor-pointer group transition-all duration-300 hover:scale-[1.02] hover:shadow-2xl"
            style={{ background: colors.bg, boxShadow: "0 4px 20px rgba(0,0,0,0.25)" }}
            onClick={onClick}
        >
            {/* Decorative circle */}
            <div
                className="absolute -right-8 -top-8 w-36 h-36 rounded-full opacity-10"
                style={{ background: colors.accent }}
            />
            <div
                className="absolute -right-4 -bottom-10 w-24 h-24 rounded-full opacity-10"
                style={{ background: colors.accent }}
            />

            <div className="relative p-6">
                {/* Header */}
                <div className="flex items-center justify-between mb-5">
                    <div className="flex items-center gap-2">
                        <span
                            className="text-2xl font-black"
                            style={{ color: colors.accent }}
                        >
                            {CURRENCY_ICONS[balance.currency] || "◎"}
                        </span>
                        <span className="text-white font-bold text-lg tracking-wide">{balance.currency}</span>
                    </div>
                    <span className="text-xs px-2 py-1 rounded-full font-medium" style={{ background: "rgba(255,255,255,0.15)", color: "#fff" }}>
                        {balance.accounts.length} account{balance.accounts.length !== 1 ? "s" : ""}
                    </span>
                </div>

                {/* Total balance */}
                <div className="mb-4">
                    <p className="text-white/60 text-xs uppercase tracking-widest mb-1">Total Balance</p>
                    <p className="text-white font-black text-2xl leading-tight">
                        {formatAmount(balance.totalBalance, balance.currency)}
                    </p>
                </div>

                {/* Available / Reserved */}
                <div className="grid grid-cols-2 gap-3 mb-4">
                    <div>
                        <p className="text-white/50 text-xs mb-1">Available</p>
                        <p className="font-bold text-sm" style={{ color: colors.accent }}>
                            {formatAmount(balance.totalAvailable, balance.currency)}
                        </p>
                    </div>
                    <div>
                        <p className="text-white/50 text-xs mb-1">Reserved</p>
                        <p className="font-bold text-sm text-amber-300">
                            {formatAmount(balance.totalReserved, balance.currency)}
                        </p>
                    </div>
                </div>

                {/* Progress bar */}
                {total > 0 && (
                    <div>
                        <div className="flex justify-between text-xs text-white/40 mb-1">
                            <span>Available utilization</span>
                            <span>{(100 - reservedPct).toFixed(1)}%</span>
                        </div>
                        <div className="w-full h-1.5 rounded-full" style={{ background: "rgba(255,255,255,0.15)" }}>
                            <div
                                className="h-full rounded-full transition-all duration-500"
                                style={{ width: `${100 - reservedPct}%`, background: colors.accent }}
                            />
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}

// ─── Sync Log Item ────────────────────────────────────────────────────────────

function SyncLogItem({ log }: { log: BalanceSyncLog }) {
    const statusConfig = {
        SUCCESS: { icon: CheckCircle2, color: "#27ae60", label: "Success" },
        FAILED: { icon: XCircle, color: "#e05555", label: "Failed" },
        PARTIAL: { icon: AlertTriangle, color: "#f0cd00", label: "Partial" },
    }[log.status];

    const Icon = statusConfig.icon;

    return (
        <div className="flex items-center gap-3 py-3 border-b border-gray-100 last:border-0">
            <Icon size={16} style={{ color: statusConfig.color, flexShrink: 0 }} />
            <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-800 truncate">
                    {log.account?.accountName || log.accountId}
                </p>
                <p className="text-xs text-gray-500">
                    {log.provider} · {log.currency}
                    {log.status === "SUCCESS" && log.syncedBalance !== null && (
                        <> · Balance: {formatAmount(log.syncedBalance!, log.currency)}</>
                    )}
                    {log.status === "FAILED" && log.errorMessage && (
                        <> · {log.errorMessage}</>
                    )}
                </p>
            </div>
            <span className="text-xs text-gray-400 whitespace-nowrap">{formatDate(log.syncedAt)}</span>
        </div>
    );
}

// ─── Add Account Modal ────────────────────────────────────────────────────────

function AddAccountModal({
    open,
    onClose,
    onSuccess,
}: {
    open: boolean;
    onClose: () => void;
    onSuccess: () => void;
}) {
    const [form, setForm] = useState({
        accountName: "",
        provider: "",
        currency: "NGN",
        accountType: "BANK" as "BANK" | "WALLET" | "EXCHANGE" | "LIQUIDITY_PROVIDER",
        accountNumber: "",
    });

    const mutation = useMutation({
        mutationFn: () =>
            treasuryApi.createAccount({
                accountName: form.accountName,
                provider: form.provider,
                currency: form.currency,
                accountType: form.accountType,
                metadata: form.accountNumber ? { accountNumber: form.accountNumber } : undefined,
            }),
        onSuccess: () => {
            toast.success("Treasury account created");
            onSuccess();
            onClose();
            setForm({ accountName: "", provider: "", currency: "NGN", accountType: "BANK", accountNumber: "" });
        },
        onError: (err: any) => toast.error(err.response?.data?.error || "Failed to create account"),
    });

    return (
        <Dialog open={open} onOpenChange={onClose}>
            <DialogContent className="max-w-md">
                <DialogHeader>
                    <DialogTitle>Add Treasury Account</DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                    <div>
                        <Label>Account Name</Label>
                        <Input
                            placeholder="e.g. GTBank NGN Main"
                            value={form.accountName}
                            onChange={(e) => setForm((p) => ({ ...p, accountName: e.target.value }))}
                        />
                    </div>
                    <div>
                        <Label>Provider</Label>
                        <Input
                            placeholder="e.g. GTBank, Binance, OKX"
                            value={form.provider}
                            onChange={(e) => setForm((p) => ({ ...p, provider: e.target.value }))}
                        />
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                        <div>
                            <Label>Currency</Label>
                            <Select value={form.currency} onValueChange={(v) => setForm((p) => ({ ...p, currency: v }))}>
                                <SelectTrigger><SelectValue /></SelectTrigger>
                                <SelectContent>
                                    {["NGN", "USD", "EUR", "GBP", "AED", "CNY", "USDT", "USDC"].map((c) => (
                                        <SelectItem key={c} value={c}>{c}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                        <div>
                            <Label>Account Type</Label>
                            <Select value={form.accountType} onValueChange={(v) => setForm((p) => ({ ...p, accountType: v as any }))}>
                                <SelectTrigger><SelectValue /></SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="BANK">Bank</SelectItem>
                                    <SelectItem value="WALLET">Wallet</SelectItem>
                                    <SelectItem value="EXCHANGE">Exchange</SelectItem>
                                    <SelectItem value="LIQUIDITY_PROVIDER">Liquidity Provider</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </div>
                    <div>
                        <Label>Account Number / Address (optional)</Label>
                        <Input
                            placeholder="Bank account number or wallet address"
                            value={form.accountNumber}
                            onChange={(e) => setForm((p) => ({ ...p, accountNumber: e.target.value }))}
                        />
                    </div>
                </div>
                <DialogFooter>
                    <Button variant="outline" onClick={onClose}>Cancel</Button>
                    <Button
                        onClick={() => mutation.mutate()}
                        disabled={mutation.isPending || !form.accountName || !form.provider}
                        style={{ backgroundColor: "#c9a227" }}
                        className="text-white"
                    >
                        {mutation.isPending ? "Creating..." : "Create Account"}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}

// ─── Manual Sync Modal ────────────────────────────────────────────────────────

function ManualSyncModal({
    open,
    onClose,
    accounts,
    onSuccess,
}: {
    open: boolean;
    onClose: () => void;
    accounts: TreasuryAccount[];
    onSuccess: () => void;
}) {
    const [selectedAccountId, setSelectedAccountId] = useState("");
    const [currency, setCurrency] = useState("NGN");
    const [balance, setBalance] = useState("");

    const selectedAccount = accounts.find((a) => a.id === selectedAccountId);

    const mutation = useMutation({
        mutationFn: () =>
            treasuryApi.manualSync({
                accountId: selectedAccountId,
                currency,
                balance: parseFloat(balance),
            }),
        onSuccess: () => {
            toast.success("Balance updated successfully");
            onSuccess();
            onClose();
            setBalance("");
        },
        onError: (err: any) => toast.error(err.response?.data?.error || "Sync failed"),
    });

    return (
        <Dialog open={open} onOpenChange={onClose}>
            <DialogContent className="max-w-md">
                <DialogHeader>
                    <DialogTitle>Manual Balance Sync</DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                    <div className="p-3 rounded-lg bg-amber-50 border border-amber-200 flex gap-2">
                        <AlertTriangle size={16} className="text-amber-600 mt-0.5 flex-shrink-0" />
                        <p className="text-sm text-amber-700">
                            This directly sets the total balance on the account. Use for manual reconciliation only.
                            An immutable ledger entry will be created.
                        </p>
                    </div>
                    <div>
                        <Label>Account</Label>
                        <Select value={selectedAccountId} onValueChange={setSelectedAccountId}>
                            <SelectTrigger>
                                <SelectValue placeholder="Select account" />
                            </SelectTrigger>
                            <SelectContent>
                                {accounts.map((a) => (
                                    <SelectItem key={a.id} value={a.id}>
                                        {a.accountName} ({a.provider})
                                    </SelectItem>
                                ))}
                            </SelectContent>
        </Select>
                    </div>
                    <div>
                        <Label>Currency</Label>
                        <Select value={currency} onValueChange={setCurrency}>
                            <SelectTrigger><SelectValue /></SelectTrigger>
                            <SelectContent>
                                {["NGN", "USD", "EUR", "GBP", "AED", "CNY", "USDT", "USDC"].map((c) => (
                                    <SelectItem key={c} value={c}>{c}</SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>
                    <div>
                        <Label>New Total Balance</Label>
                        <Input
                            type="number"
                            placeholder="Enter exact balance"
                            value={balance}
                            onChange={(e) => setBalance(e.target.value)}
                        />
                    </div>
                </div>
                <DialogFooter>
                    <Button variant="outline" onClick={onClose}>Cancel</Button>
                    <Button
                        onClick={() => mutation.mutate()}
                        disabled={mutation.isPending || !selectedAccountId || !balance}
                        style={{ backgroundColor: "#c9a227" }}
                        className="text-white"
                    >
                        {mutation.isPending ? "Syncing..." : "Apply Balance"}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function TreasuryDashboardPage() {
    const queryClient = useQueryClient();
    const [addAccountOpen, setAddAccountOpen] = useState(false);
    const [manualSyncOpen, setManualSyncOpen] = useState(false);
    const [selectedCurrency, setSelectedCurrency] = useState<string | null>(null);
    const [currencyFilter, setCurrencyFilter] = useState<string>("ALL");

    const {
        data: balancesData,
        isLoading: balancesLoading,
        refetch: refetchBalances,
    } = useQuery({
        queryKey: ["treasury-balances"],
        queryFn: treasuryApi.getAllBalances,
        refetchInterval: 30000,
    });

    const { data: accountsData, refetch: refetchAccounts } = useQuery({
        queryKey: ["treasury-accounts"],
        queryFn: () => treasuryApi.getAccounts(),
    });

    const { data: syncLogsData } = useQuery({
        queryKey: ["treasury-sync-logs"],
        queryFn: () => treasuryApi.getSyncLogs({ limit: 10 }),
        refetchInterval: 60000,
    });

    const syncMutation = useMutation({
        mutationFn: treasuryApi.syncAll,
        onSuccess: (data) => {
            const { synced, failed } = data.summary;
            if (failed > 0) {
                toast.warning(`Sync complete: ${synced} synced, ${failed} failed`);
            } else {
                toast.success(`Sync complete: ${synced} accounts synced`);
            }
            queryClient.invalidateQueries({ queryKey: ["treasury-balances"] });
            queryClient.invalidateQueries({ queryKey: ["treasury-sync-logs"] });
        },
        onError: (err: any) => toast.error(err.response?.data?.error || "Sync failed"),
    });

    const balances = balancesData?.balances ?? [];
    const accounts = accountsData?.accounts ?? [];
    const syncLogs = syncLogsData?.logs ?? [];

    const filteredBalances = currencyFilter === "ALL"
        ? balances
        : balances.filter((b) => b.currency === currencyFilter);

    // Compute totals
    const totalUSD = balances.reduce((sum, b) => {
        if (b.currency === "USD") return sum + parseFloat(b.totalBalance.toString());
        return sum;
    }, 0);

    const lastSyncLog = syncLogs[0];

    const handleRefresh = useCallback(() => {
        refetchBalances();
        queryClient.invalidateQueries({ queryKey: ["treasury-sync-logs"] });
    }, [refetchBalances, queryClient]);

    return (
        <div className="min-h-screen" style={{ backgroundColor: "#f7f8f9" }}>
            {/* ── Header ── */}
            <div
                className="px-8 pt-8 pb-10 relative overflow-hidden"
                style={{ background: "linear-gradient(135deg, #2f2403 0%, #4a3a05 50%, #2f2403 100%)" }}
            >
                <div className="absolute inset-0 opacity-5">
                    <div
                        className="absolute inset-0"
                        style={{
                            backgroundImage: "repeating-linear-gradient(45deg, #c9a227 0, #c9a227 1px, transparent 0, transparent 50%)",
                            backgroundSize: "20px 20px",
                        }}
                    />
                </div>
                <div className="relative max-w-7xl mx-auto">
                    <div className="flex items-start justify-between">
                        <div>
                            <div className="flex items-center gap-3 mb-2">
                                <div className="p-2 rounded-xl" style={{ background: "rgba(201,162,39,0.2)" }}>
                                    <Database size={22} style={{ color: "#c9a227" }} />
                                </div>
                                <h1 className="text-2xl font-bold text-white">Treasury Ledger</h1>
                            </div>
                            <p className="text-white/50 text-sm">
                                Single source of truth for all PapaEgo liquidity positions
                            </p>
                        </div>
                        <div className="flex items-center gap-3">
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={handleRefresh}
                                className="border-white/20 text-white/80 hover:bg-white/10 hover:text-white"
                                style={{ borderColor: "rgba(255,255,255,0.2)", background: "transparent" }}
                            >
                                <RefreshCw size={14} className="mr-2" />
                                Refresh
                            </Button>
                            <Button
                                size="sm"
                                onClick={() => syncMutation.mutate()}
                                disabled={syncMutation.isPending}
                                style={{ backgroundColor: "#c9a227", color: "#fff" }}
                            >
                                <RefreshCw size={14} className={`mr-2 ${syncMutation.isPending ? "animate-spin" : ""}`} />
                                {syncMutation.isPending ? "Syncing..." : "Sync All"}
                            </Button>
                            <Button
                                size="sm"
                                onClick={() => setManualSyncOpen(true)}
                                style={{ backgroundColor: "rgba(255,255,255,0.15)", color: "#fff" }}
                            >
                                <Shield size={14} className="mr-2" />
                                Manual Sync
                            </Button>
                            <Button
                                size="sm"
                                onClick={() => setAddAccountOpen(true)}
                                style={{ backgroundColor: "rgba(255,255,255,0.15)", color: "#fff" }}
                            >
                                <Plus size={14} className="mr-2" />
                                Add Account
                            </Button>
                        </div>
                    </div>

                    {/* Quick stats strip */}
                    <div className="mt-6 grid grid-cols-4 gap-4">
                        {[
                            { label: "Total Currencies", value: balances.length, icon: Coins },
                            { label: "Active Accounts", value: accounts.filter((a) => a.status === "ACTIVE").length, icon: Building2 },
                            { label: "Last Sync", value: lastSyncLog ? formatDate(lastSyncLog.syncedAt) : "Never", icon: Clock },
                            {
                                label: "Sync Status",
                                value: lastSyncLog ? lastSyncLog.status : "–",
                                icon: lastSyncLog?.status === "SUCCESS" ? CheckCircle2 : lastSyncLog?.status === "FAILED" ? XCircle : Clock,
                                color: lastSyncLog?.status === "SUCCESS" ? "#27ae60" : lastSyncLog?.status === "FAILED" ? "#e05555" : "#aaa",
                            },
                        ].map((stat) => {
                            const Icon = stat.icon;
                            return (
                                <div
                                    key={stat.label}
                                    className="rounded-xl p-4"
                                    style={{ background: "rgba(255,255,255,0.08)" }}
                                >
                                    <div className="flex items-center gap-2 mb-2">
                                        <Icon size={14} style={{ color: stat.color || "#c9a227" }} />
                                        <span className="text-white/50 text-xs">{stat.label}</span>
                                    </div>
                                    <p className="text-white font-bold text-sm" style={stat.color ? { color: stat.color } : undefined}>
                                        {stat.value}
                                    </p>
                                </div>
                            );
                        })}
                    </div>
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-8 py-8">
                {/* ── Currency Filter Tabs ── */}
                <div className="flex items-center gap-2 mb-6 overflow-x-auto pb-2 scrollbar-hidden">
                    {["ALL", ...balances.map((b) => b.currency)].map((currency) => (
                        <button
                            key={currency}
                            onClick={() => setCurrencyFilter(currency)}
                            className={`px-4 py-2 rounded-full text-sm font-semibold whitespace-nowrap transition-all ${currencyFilter === currency
                                ? "text-white shadow-md"
                                : "text-gray-500 hover:text-gray-800"
                                }`}
                            style={
                                currencyFilter === currency
                                    ? { backgroundColor: "#c9a227" }
                                    : { backgroundColor: "#fff", border: "1px solid #e1e3e6" }
                            }
                        >
                            {currency === "ALL" ? "All Currencies" : `${CURRENCY_ICONS[currency] || ""}  ${currency}`}
                        </button>
                    ))}
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* ── Balance Cards ── */}
                    <div className="lg:col-span-2">
                        <div className="flex items-center justify-between mb-4">
                            <h2 className="font-bold text-gray-800 text-lg">Currency Positions</h2>
                            <Link
                                href="/admin/treasury/ledger"
                                className="flex items-center gap-1 text-sm font-medium"
                                style={{ color: "#c9a227" }}
                            >
                                <FileText size={14} />
                                View Ledger
                            </Link>
                        </div>

                        {balancesLoading ? (
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                {[1, 2, 3, 4].map((i) => (
                                    <div key={i} className="h-52 rounded-2xl bg-gray-200 animate-pulse" />
                                ))}
                            </div>
                        ) : filteredBalances.length === 0 ? (
                            <div className="flex flex-col items-center justify-center py-20 rounded-2xl border-2 border-dashed border-gray-200">
                                <Database size={40} className="text-gray-300 mb-3" />
                                <p className="text-gray-500 font-medium">No balances recorded yet</p>
                                <p className="text-gray-400 text-sm mt-1">
                                    Add a treasury account and sync or record a deposit to get started
                                </p>
                                <Button
                                    className="mt-4"
                                    onClick={() => setAddAccountOpen(true)}
                                    style={{ backgroundColor: "#c9a227", color: "#fff" }}
                                >
                                    <Plus size={14} className="mr-2" />
                                    Add First Account
                                </Button>
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                {filteredBalances.map((balance) => (
                                    <BalanceCard
                                        key={balance.currency}
                                        balance={balance}
                                        onClick={() => setSelectedCurrency(balance.currency)}
                                    />
                                ))}
                            </div>
                        )}
                    </div>

                    {/* ── Right Panel ── */}
                    <div className="space-y-6">
                        {/* Sync Status Widget */}
                        <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
                            <h3 className="font-bold text-gray-800 mb-4 flex items-center gap-2">
                                <Activity size={16} style={{ color: "#c9a227" }} />
                                Recent Sync Activity
                            </h3>
                            {syncLogs.length === 0 ? (
                                <div className="text-center py-6">
                                    <Clock size={28} className="text-gray-300 mx-auto mb-2" />
                                    <p className="text-sm text-gray-400">No sync activity yet</p>
                                </div>
                            ) : (
                                <div>
                                    {syncLogs.slice(0, 8).map((log) => (
                                        <SyncLogItem key={log.id} log={log} />
                                    ))}
                                </div>
                            )}
                        </div>

                        {/* Treasury Accounts */}
                        <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
                            <h3 className="font-bold text-gray-800 mb-4 flex items-center gap-2">
                                <Building2 size={16} style={{ color: "#c9a227" }} />
                                Treasury Accounts
                                <span className="ml-auto text-xs font-normal text-gray-400">
                                    {accounts.filter((a) => a.status === "ACTIVE").length} active
                                </span>
                            </h3>
                            {accounts.length === 0 ? (
                                <div className="text-center py-6">
                                    <Building2 size={28} className="text-gray-300 mx-auto mb-2" />
                                    <p className="text-sm text-gray-400">No accounts registered</p>
                                </div>
                            ) : (
                                <div className="space-y-2">
                                    {accounts.slice(0, 8).map((account) => {
                                        const TypeIcon = ACCOUNT_TYPE_ICONS[account.accountType] || Building2;
                                        return (
                                            <div
                                                key={account.id}
                                                className="flex items-center gap-3 p-3 rounded-xl hover:bg-gray-50 transition-colors"
                                            >
                                                <div
                                                    className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0"
                                                    style={{ backgroundColor: "#fdf3d0" }}
                                                >
                                                    <TypeIcon size={14} style={{ color: "#c9a227" }} />
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <p className="text-sm font-medium text-gray-800 truncate">{account.accountName}</p>
                                                    <p className="text-xs text-gray-400">{account.provider} · {account.currency}</p>
                                                </div>
                                                <Badge
                                                    variant="outline"
                                                    className="text-xs"
                                                    style={{
                                                        color: account.status === "ACTIVE" ? "#27ae60" : "#e05555",
                                                        borderColor: account.status === "ACTIVE" ? "#27ae60" : "#e05555",
                                                    }}
                                                >
                                                    {account.status}
                                                </Badge>
                                            </div>
                                        );
                                    })}
                                </div>
                            )}
                        </div>

                        {/* Quick Actions */}
                        <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
                            <h3 className="font-bold text-gray-800 mb-4">Quick Actions</h3>
                            <div className="space-y-2">
                                <Link href="/admin/treasury/ledger">
                                    <button className="w-full flex items-center gap-3 p-3 rounded-xl hover:bg-gray-50 transition-colors text-left">
                                        <div className="w-8 h-8 rounded-lg bg-blue-50 flex items-center justify-center">
                                            <FileText size={14} className="text-blue-600" />
                                        </div>
                                        <div>
                                            <p className="text-sm font-medium text-gray-800">View Ledger</p>
                                            <p className="text-xs text-gray-400">Full transaction history</p>
                                        </div>
                                        <ArrowUpRight size={14} className="ml-auto text-gray-400" />
                                    </button>
                                </Link>
                                <Link href="/admin/exchange-rates">
                                    <button className="w-full flex items-center gap-3 p-3 rounded-xl hover:bg-gray-50 transition-colors text-left">
                                        <div className="w-8 h-8 rounded-lg bg-amber-50 flex items-center justify-center">
                                            <DollarSign size={14} style={{ color: "#c9a227" }} />
                                        </div>
                                        <div>
                                            <p className="text-sm font-medium text-gray-800">Exchange Rates</p>
                                            <p className="text-xs text-gray-400">Configure markup</p>
                                        </div>
                                        <ArrowUpRight size={14} className="ml-auto text-gray-400" />
                                    </button>
                                </Link>
                                <button
                                    onClick={() => setManualSyncOpen(true)}
                                    className="w-full flex items-center gap-3 p-3 rounded-xl hover:bg-gray-50 transition-colors text-left"
                                >
                                    <div className="w-8 h-8 rounded-lg bg-green-50 flex items-center justify-center">
                                        <ArrowDownLeft size={14} className="text-green-600" />
                                    </div>
                                    <div>
                                        <p className="text-sm font-medium text-gray-800">Manual Sync</p>
                                        <p className="text-xs text-gray-400">Override balance</p>
                                    </div>
                                    <ArrowUpRight size={14} className="ml-auto text-gray-400" />
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Modals */}
            <AddAccountModal
                open={addAccountOpen}
                onClose={() => setAddAccountOpen(false)}
                onSuccess={() => {
                    queryClient.invalidateQueries({ queryKey: ["treasury-accounts"] });
                    queryClient.invalidateQueries({ queryKey: ["treasury-balances"] });
                }}
            />
            <ManualSyncModal
                open={manualSyncOpen}
                onClose={() => setManualSyncOpen(false)}
                accounts={accounts}
                onSuccess={() => {
                    queryClient.invalidateQueries({ queryKey: ["treasury-balances"] });
                    queryClient.invalidateQueries({ queryKey: ["treasury-sync-logs"] });
                }}
            />
        </div>
    );
}

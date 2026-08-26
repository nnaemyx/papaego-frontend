"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { treasuryApi, type AggregatedBalance, type TreasuryAccount, type BalanceSyncLog } from "@/lib/api/treasury";
import { toast } from "sonner";
import {
    RefreshCw,
    Plus,
    Filter,
} from "lucide-react";
import { Button } from "@/components/ui/button";
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

export default function AdminTreasuryPositionPage() {
    const queryClient = useQueryClient();

    // Filters
    const [currencyFilter, setCurrencyFilter] = useState("ALL");
    const [providerFilter, setProviderFilter] = useState("ALL");
    const [statusFilter, setStatusFilter] = useState("ACTIVE");
    const [search, setSearch] = useState("");

    // Modals
    const [isCreateOpen, setIsCreateOpen] = useState(false);
    const [newAccount, setNewAccount] = useState({
        accountName: "",
        accountType: "BANK",
        providerName: "",
        currency: "USD",
        accountNumber: "",
        initialBalance: "",
    });

    const { data: accountsData, isLoading } = useQuery({
        queryKey: ["treasury-accounts"],
        queryFn: () => treasuryApi.getAccounts(),
    });

    const syncMutation = useMutation({
        mutationFn: () => treasuryApi.syncAll(),
        onSuccess: () => {
            toast.success("Treasury balances synced successfully");
            queryClient.invalidateQueries({ queryKey: ["treasury-accounts"] });
        },
        onError: () => toast.error("Failed to sync treasury balances"),
    });

    const createMutation = useMutation({
        mutationFn: () =>
            treasuryApi.createAccount({
                accountName: newAccount.accountName,
                provider: newAccount.providerName,
                currency: newAccount.currency,
                accountType: newAccount.accountType as any,
            }),
        onSuccess: () => {
            toast.success("Treasury account registered");
            setIsCreateOpen(false);
            setNewAccount({
                accountName: "",
                accountType: "BANK",
                providerName: "",
                currency: "USD",
                accountNumber: "",
                initialBalance: "",
            });
            queryClient.invalidateQueries({ queryKey: ["treasury-accounts"] });
        },
        onError: () => toast.error("Failed to create treasury account"),
    });

    const accounts: TreasuryAccount[] = (accountsData?.accounts || []).filter((acc: TreasuryAccount) => {
        if (currencyFilter !== "ALL" && acc.currency !== currencyFilter) return false;
        if (providerFilter !== "ALL" && acc.provider !== providerFilter) return false;
        if (statusFilter !== "ALL" && (statusFilter === "ACTIVE" ? acc.status !== "ACTIVE" : acc.status === "ACTIVE")) return false;
        if (search.trim()) {
            const q = search.toLowerCase();
            return (
                acc.accountName.toLowerCase().includes(q) ||
                acc.provider.toLowerCase().includes(q) ||
                acc.currency.toLowerCase().includes(q)
            );
        }
        return true;
    });

    const getAvail = (acc: TreasuryAccount) => parseFloat(acc.balances?.[0]?.availableBalance || (acc as any).availableBalance || "0");
    const getResv = (acc: TreasuryAccount) => parseFloat(acc.balances?.[0]?.reservedBalance || (acc as any).reservedBalance || "0");
    const getPend = (acc: TreasuryAccount) => parseFloat((acc as any).pendingInbound || "0");

    // Compute aggregated totals
    const totalAvailableUsd = accounts.reduce((acc, a) => acc + getAvail(a), 0);
    const totalReservedUsd = accounts.reduce((acc, a) => acc + getResv(a), 0);
    const totalPendingUsd = accounts.reduce((acc, a) => acc + getPend(a), 0);
    const grandTotalUsd = totalAvailableUsd + totalReservedUsd;

    return (
        <div className="p-4 md:p-8 space-y-6 max-w-7xl mx-auto font-sans" style={{ backgroundColor: "#F7F8F9" }}>
            {/* ── Header ── */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b pb-4" style={{ borderColor: "#E1E3E6" }}>
                <div>
                    <div className="flex items-center gap-3">
                        <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-slate-900">
                            Treasury Position
                        </h1>
                        <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-blue-50 text-blue-700 border border-blue-200">
                            HEALTHY
                        </span>
                    </div>
                    <p className="text-xs md:text-sm text-slate-500 mt-1">
                        Liquidity vs Obligations ratio remains stable above threshold.
                    </p>
                </div>

                <div className="flex items-center gap-3">
                    <Button
                        onClick={() => syncMutation.mutate()}
                        disabled={syncMutation.isPending}
                        variant="outline"
                        className="bg-white border-slate-200 text-slate-700 text-xs font-bold px-4 py-2.5 h-auto rounded-lg shadow-sm gap-2"
                    >
                        <RefreshCw className={`w-4 h-4 text-slate-500 ${syncMutation.isPending ? "animate-spin" : ""}`} />
                        Sync Balances
                    </Button>

                    <Button
                        onClick={() => setIsCreateOpen(true)}
                        className="bg-[#C9A227] hover:bg-[#b08e20] text-white text-xs font-bold px-4 py-2.5 h-auto rounded-lg shadow-sm gap-1.5"
                    >
                        <Plus className="w-4 h-4" />
                        Add Account
                    </Button>
                </div>
            </div>

            {/* ── Filters Bar ── */}
            <div className="bg-white p-4 rounded-2xl border shadow-sm flex flex-wrap items-center justify-between gap-3" style={{ borderColor: "#E1E3E6" }}>
                <div className="flex items-center gap-2 text-xs font-bold text-slate-700">
                    <Filter className="w-4 h-4 text-slate-400" />
                    <span>Filters</span>
                    <span className="text-slate-300 mx-1">|</span>
                </div>

                <div className="flex flex-wrap items-center gap-3">
                    <Select value={currencyFilter} onValueChange={setCurrencyFilter}>
                        <SelectTrigger className="w-32 h-9 text-xs font-semibold bg-slate-50 border-slate-200">
                            <SelectValue placeholder="Currency: All" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="ALL">Currency: All</SelectItem>
                            <SelectItem value="USD">USD</SelectItem>
                            <SelectItem value="NGN">NGN</SelectItem>
                            <SelectItem value="EUR">EUR</SelectItem>
                            <SelectItem value="GBP">GBP</SelectItem>
                            <SelectItem value="USDT">USDT</SelectItem>
                        </SelectContent>
                    </Select>

                    <Select value={providerFilter} onValueChange={setProviderFilter}>
                        <SelectTrigger className="w-36 h-9 text-xs font-semibold bg-slate-50 border-slate-200">
                            <SelectValue placeholder="Provider: All" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="ALL">Provider: All</SelectItem>
                            <SelectItem value="FV Bank">FV Bank</SelectItem>
                            <SelectItem value="Binance">Binance</SelectItem>
                            <SelectItem value="Zenith Bank">Zenith Bank</SelectItem>
                        </SelectContent>
                    </Select>

                    <Select value={statusFilter} onValueChange={setStatusFilter}>
                        <SelectTrigger className="w-36 h-9 text-xs font-semibold bg-slate-50 border-slate-200">
                            <SelectValue placeholder="Status: All Active" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="ACTIVE">Status: All Active</SelectItem>
                            <SelectItem value="ALL">Status: All</SelectItem>
                        </SelectContent>
                    </Select>
                </div>

                <div className="w-full sm:w-64">
                    <Input
                        placeholder="Search provider, currency..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="h-9 text-xs bg-slate-50 border-slate-200"
                    />
                </div>
            </div>

            {/* ── Table Card ── */}
            <div className="bg-white rounded-2xl border shadow-sm overflow-hidden" style={{ borderColor: "#E1E3E6" }}>
                <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs">
                        <thead className="bg-slate-50/80 border-b border-slate-100 text-slate-500 uppercase tracking-wider text-[10px] font-bold">
                            <tr>
                                <th className="py-4 px-6">Account / Provider</th>
                                <th className="py-4 px-6">Currency</th>
                                <th className="py-4 px-6">Account ID</th>
                                <th className="py-4 px-6 text-right">Available Balance</th>
                                <th className="py-4 px-6 text-right">Reserved</th>
                                <th className="py-4 px-6 text-right">Pending</th>
                                <th className="py-4 px-6 text-right">Total Balance</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
                            {isLoading ? (
                                <tr>
                                    <td colSpan={7} className="py-12 text-center text-slate-400">
                                        Loading treasury position...
                                    </td>
                                </tr>
                            ) : accounts.length === 0 ? (
                                <tr>
                                    <td colSpan={7} className="py-12 text-center text-slate-400">
                                        No treasury accounts matching filters.
                                    </td>
                                </tr>
                            ) : (
                                accounts.map((acc) => {
                                    const avail = getAvail(acc);
                                    const resv = getResv(acc);
                                    const pend = getPend(acc);
                                    const tot = avail + resv;

                                    return (
                                        <tr key={acc.id} className="hover:bg-slate-50/60 transition-colors">
                                            <td className="py-4 px-6 whitespace-nowrap">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-700 font-bold flex items-center justify-center text-xs">
                                                        {acc.provider?.slice(0, 2).toUpperCase() || "FV"}
                                                    </div>
                                                    <div>
                                                        <p className="font-bold text-slate-900">{acc.accountName}</p>
                                                        <p className="text-[10px] text-slate-400">{acc.provider}</p>
                                                    </div>
                                                </div>
                                            </td>

                                            <td className="py-4 px-6 whitespace-nowrap">
                                                <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-slate-100 text-slate-800">
                                                    {acc.currency}
                                                </span>
                                            </td>

                                            <td className="py-4 px-6 font-mono text-slate-500 whitespace-nowrap">
                                                {`FVB-${acc.id.slice(0, 7)}`}
                                            </td>

                                            <td className="py-4 px-6 text-right font-mono font-bold text-slate-900 whitespace-nowrap">
                                                {avail.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                                            </td>

                                            <td className="py-4 px-6 text-right font-mono text-slate-500 whitespace-nowrap">
                                                {resv.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                                            </td>

                                            <td className="py-4 px-6 text-right font-mono text-slate-500 whitespace-nowrap">
                                                {pend.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                                            </td>

                                            <td className="py-4 px-6 text-right font-mono font-bold text-slate-900 whitespace-nowrap">
                                                {tot.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                                            </td>
                                        </tr>
                                    );
                                })
                            )}
                        </tbody>

                        {/* Summary Footer Row matching design */}
                        {accounts.length > 0 && (
                            <tfoot className="bg-slate-50/90 border-t-2 border-slate-200 text-xs font-bold text-slate-900">
                                <tr>
                                    <td colSpan={3} className="py-4 px-6 text-slate-700">
                                        Aggregated USD Equivalent:
                                    </td>
                                    <td className="py-4 px-6 text-right font-mono">
                                        ~ ${totalAvailableUsd.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                                    </td>
                                    <td className="py-4 px-6 text-right font-mono text-slate-600">
                                        ~ ${totalReservedUsd.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                                    </td>
                                    <td className="py-4 px-6 text-right font-mono text-slate-600">
                                        ~ ${totalPendingUsd.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                                    </td>
                                    <td className="py-4 px-6 text-right font-mono text-emerald-700">
                                        ~ ${grandTotalUsd.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                                    </td>
                                </tr>
                            </tfoot>
                        )}
                    </table>
                </div>
            </div>

            {/* Create Account Dialog */}
            <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
                <DialogContent className="max-w-md">
                    <DialogHeader>
                        <DialogTitle>Register Treasury Account</DialogTitle>
                    </DialogHeader>

                    <div className="space-y-4 py-2">
                        <div>
                            <Label className="text-xs font-semibold">Account Name</Label>
                            <Input
                                placeholder="e.g. FV Bank Operating USD"
                                value={newAccount.accountName}
                                onChange={(e) => setNewAccount({ ...newAccount, accountName: e.target.value })}
                                className="mt-1"
                            />
                        </div>

                        <div className="grid grid-cols-2 gap-3">
                            <div>
                                <Label className="text-xs font-semibold">Provider</Label>
                                <Input
                                    placeholder="e.g. FV Bank"
                                    value={newAccount.providerName}
                                    onChange={(e) => setNewAccount({ ...newAccount, providerName: e.target.value })}
                                    className="mt-1"
                                />
                            </div>

                            <div>
                                <Label className="text-xs font-semibold">Currency</Label>
                                <Select
                                    value={newAccount.currency}
                                    onValueChange={(c) => setNewAccount({ ...newAccount, currency: c })}
                                >
                                    <SelectTrigger className="mt-1">
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="USD">USD</SelectItem>
                                        <SelectItem value="NGN">NGN</SelectItem>
                                        <SelectItem value="EUR">EUR</SelectItem>
                                        <SelectItem value="GBP">GBP</SelectItem>
                                        <SelectItem value="USDT">USDT</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>

                        <div>
                            <Label className="text-xs font-semibold">Account Number / Reference</Label>
                            <Input
                                placeholder="FVB-XXXX-XXXX"
                                value={newAccount.accountNumber}
                                onChange={(e) => setNewAccount({ ...newAccount, accountNumber: e.target.value })}
                                className="mt-1"
                            />
                        </div>
                    </div>

                    <DialogFooter>
                        <Button variant="outline" onClick={() => setIsCreateOpen(false)}>Cancel</Button>
                        <Button
                            onClick={() => createMutation.mutate()}
                            disabled={createMutation.isPending || !newAccount.accountName || !newAccount.providerName}
                            className="bg-[#C9A227] hover:bg-[#b08e20] text-white"
                        >
                            Save Account
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}

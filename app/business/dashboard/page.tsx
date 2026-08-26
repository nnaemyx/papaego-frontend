"use client";

import { useCallback, useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import Link from "next/link";
import {
    Wallet, Send, Copy, Check, RefreshCw, Landmark, TrendingUp, Download,
    FileText, ArrowDownLeft, ArrowUpRight, Clock, CheckCircle2, ChevronRight,
    Search, Bell, HelpCircle, Grid
} from "lucide-react";
import { toast } from "sonner";
import { useAuthStore } from "@/store/auth-store";
import { organizationsApi, type Organization } from "@/lib/api/organizations";
import { getBankingProfile, type BankingProfile } from "@/lib/api/banking";
import { customerApi, type CustomerTrade, type CustomerTradeRequest, type FxRate } from "@/lib/api/customer";
import { NewTransactionModal } from "@/components/customer/NewTransactionModal";
import { PapaEgoFundModal } from "@/components/customer/PapaEgoFundModal";
import { TradeProgressStepper, type TradeStage } from "@/components/transactions/TradeProgressStepper";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { formatCurrency } from "@/lib/formatters";

export default function MergedBusinessCustomerDashboard() {
    const router = useRouter();
    const pathname = usePathname();
    const { user, isAuthenticated } = useAuthStore();

    const [org, setOrg] = useState<Organization | null>(null);
    const [bankingProfile, setBankingProfile] = useState<BankingProfile | null>(null);
    const [trades, setTrades] = useState<CustomerTrade[]>([]);
    const [tradeRequests, setTradeRequests] = useState<CustomerTradeRequest[]>([]);
    const [ledgerBalance, setLedgerBalance] = useState<{ available: number; reserved: number; totalDeposited: number }>({
        available: 0,
        reserved: 0,
        totalDeposited: 0,
    });
    const [isLoading, setIsLoading] = useState(true);

    const [showNewTradeModal, setShowNewTradeModal] = useState(false);
    const [showFundModal, setShowFundModal] = useState(false);

    const fetchDashboardData = useCallback(async () => {
        setIsLoading(true);
        try {
            const orgRes = await organizationsApi.getMyOrganization().catch(() => null);
            if (orgRes?.organization) {
                setOrg(orgRes.organization);
            }

            const bankRes = await getBankingProfile().catch(() => null);
            if (bankRes?.profile) {
                setBankingProfile(bankRes.profile);
            }

            const [tradesRes, requestsRes, statsRes] = await Promise.all([
                customerApi.getTrades({ limit: 10 }).catch(() => ({ trades: [] })),
                customerApi.getTradeRequests({ limit: 5 }).catch(() => ({ requests: [] })),
                customerApi.getDashboardStats().catch(() => null),
            ]);

            const allTrades = tradesRes.trades || [];
            setTrades(allTrades);
            setTradeRequests(requestsRes.requests || []);

            if (statsRes) {
                setLedgerBalance({
                    available: (statsRes as any).availableBalance || 0,
                    reserved: (statsRes as any).reservedBalance || 0,
                    totalDeposited: (statsRes as any).totalDeposited || ((statsRes as any).availableBalance || 0) + ((statsRes as any).reservedBalance || 0),
                });
            }
        } catch (err: any) {
            console.error("Dashboard data load error:", err);
        } finally {
            setIsLoading(false);
        }
    }, []);

    useEffect(() => {
        if (pathname === "/business/dashboard") {
            router.replace("/customer/dashboard");
            return;
        }
        if (isAuthenticated) {
            fetchDashboardData();
        }
    }, [pathname, isAuthenticated, router, fetchDashboardData]);

    if (!isAuthenticated) return null;

    // Calculate pending settlements sum from active in-flight trades or reserved balance
    const pendingSettlementTrades = trades.filter((t) =>
        ["AWAITING_PAYMENT", "PAYMENT_UPLOADED", "PAYMENT_CONFIRMED", "PROCESSING", "PROCESSED", "INITIATED", "QUOTED", "SENT_TO_CUSTOMER", "CUSTOMER_CONFIRMED"].includes(t.status)
    );
    const tradesSum = pendingSettlementTrades.reduce((acc, t) => acc + (parseFloat(t.amount) || 0), 0);
    const pendingSettlementTotal = Math.max(ledgerBalance.reserved || 0, tradesSum);

    // Active trade for Lifecycle Stepper
    const activeTrade = pendingSettlementTrades[0] || trades[0] || null;

    // Determine lifecycle stage title
    const getActiveStageBadge = (status?: string) => {
        if (!status) return "Idle";
        if (["QUOTED", "SENT_TO_CUSTOMER", "CUSTOMER_CONFIRMED"].includes(status)) return "Quoted (Stage 1 of 4)";
        if (["AWAITING_PAYMENT", "PAYMENT_UPLOADED"].includes(status)) return "Funding (Stage 2 of 4)";
        if (["PAYMENT_CONFIRMED", "PROCESSING", "PROCESSED"].includes(status)) return "Processing (Stage 3 of 4)";
        if (status === "COMPLETED") return "Settled (Stage 4 of 4)";
        return "Processing (Stage 2 of 4)";
    };

    // Calculate total ledger value = available + reserved (or totalDeposited)
    const totalLedgerValue = (ledgerBalance.available || 0) + (ledgerBalance.reserved || 0);

    return (
        <div className="p-4 md:p-8 space-y-6 max-w-7xl mx-auto font-sans" style={{ color: "var(--text-primary)" }}>
            {/* ── Top Header ── */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl md:text-3xl font-bold tracking-tight" style={{ color: "var(--text-primary)" }}>
                        Corporate Dashboard
                    </h1>
                    <p className="text-xs md:text-sm mt-1 text-slate-500">
                        Overview of treasury operations and pending settlements.
                    </p>
                </div>

                <div className="flex items-center gap-3 shrink-0">
                    <Button
                        variant="outline"
                        onClick={() => router.push("/customer/wallet")}
                        className="bg-white border-slate-200 text-slate-700 text-xs font-semibold px-4 py-2.5 h-auto rounded-lg shadow-sm hover:bg-slate-50 gap-2"
                    >
                        <FileText className="w-4 h-4 text-slate-500" />
                        Statements
                    </Button>

                    <Button
                        onClick={() => setShowNewTradeModal(true)}
                        className="bg-[#C9A227] hover:bg-[#b08e20] text-white text-xs font-bold px-5 py-2.5 h-auto rounded-lg shadow-sm gap-2 transition-all hover:scale-[1.02]"
                    >
                        <Send className="w-4 h-4" />
                        Start Transfer
                    </Button>
                </div>
            </div>

            {/* ── Top 3 Financial Metrics Cards ── */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-5 items-stretch">
                {/* Card 1: Total Ledger Value */}
                <div
                    className="bg-white p-6 rounded-2xl border shadow-sm flex flex-col justify-between relative overflow-hidden"
                    style={{ borderColor: "#E1E3E6" }}
                >
                    <div>
                        <div className="flex items-center justify-between mb-4">
                            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
                                Total Ledger Value
                            </span>
                            <div className="w-7 h-7 rounded-lg bg-amber-50 flex items-center justify-center text-[#C9A227]">
                                <Wallet className="w-4 h-4" />
                            </div>
                        </div>

                        <div className="text-2xl md:text-3xl font-extrabold text-slate-900 tracking-tight">
                            NGN {totalLedgerValue.toLocaleString("en-NG", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                        </div>

                        <div className="flex items-center gap-2 mt-3">
                            <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md">
                                <TrendingUp className="w-3 h-3 text-emerald-600" />
                                +2.4%
                            </span>
                            <span className="text-xs text-slate-400">vs last 30 days</span>
                        </div>
                    </div>

                    {/* Mini Sparkline Bar Chart Indicator */}
                    <div className="flex items-end gap-1.5 pt-6 mt-2">
                        <div className="h-2 w-full bg-[#EBDDB2] rounded-sm" />
                        <div className="h-3 w-full bg-[#EBDDB2] rounded-sm" />
                        <div className="h-4 w-full bg-[#EBDDB2] rounded-sm" />
                        <div className="h-6 w-full bg-[#D5BD6A] rounded-sm" />
                        <div className="h-5 w-full bg-[#D5BD6A] rounded-sm" />
                        <div className="h-8 w-full bg-[#C9A227] rounded-sm" />
                        <div className="h-7 w-full bg-[#C9A227] rounded-sm" />
                    </div>
                </div>

                {/* Card 2: Available Balance */}
                <div
                    className="bg-white p-6 rounded-2xl border shadow-sm flex flex-col justify-between relative"
                    style={{ borderColor: "#E1E3E6" }}
                >
                    <div>
                        <div className="flex items-center justify-between mb-4">
                            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 flex items-center gap-2">
                                <span className="w-2 h-2 rounded-full bg-emerald-500" />
                                Available Balance
                            </span>
                        </div>

                        <div className="text-2xl md:text-3xl font-extrabold text-slate-900 tracking-tight">
                            NGN {ledgerBalance.available.toLocaleString("en-NG", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                        </div>

                        <p className="text-xs text-slate-500 mt-2">
                            Ready for immediate transfer
                        </p>
                    </div>

                    <div className="pt-6 flex items-center justify-between border-t border-slate-50 mt-4">
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setShowFundModal(true)}
                            className="text-xs font-bold text-[#C9A227] hover:text-[#a8861d] p-0 h-auto"
                        >
                            + Fund Ledger
                        </Button>
                        <div className="w-8 h-8 rounded-full bg-emerald-50 flex items-center justify-center text-emerald-600">
                            <CheckCircle2 className="w-5 h-5" />
                        </div>
                    </div>
                </div>

                {/* Card 3: Pending Settlements */}
                <div
                    className="bg-white p-6 rounded-2xl border shadow-sm flex flex-col justify-between relative"
                    style={{ borderColor: "#E1E3E6" }}
                >
                    <div>
                        <div className="flex items-center justify-between mb-4">
                            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 flex items-center gap-2">
                                <span className="w-2 h-2 rounded-full bg-amber-500" />
                                Pending Settlements
                            </span>
                        </div>

                        <div className="text-2xl md:text-3xl font-extrabold text-slate-900 tracking-tight">
                            NGN {pendingSettlementTotal.toLocaleString("en-NG", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                        </div>

                        <p className="text-xs text-slate-500 mt-2">
                            {pendingSettlementTrades.length > 0
                                ? `${pendingSettlementTrades.length} in-flight transfer(s) clearing`
                                : "Expected clearing within 24h"}
                        </p>
                    </div>

                    <div className="pt-6 flex items-center justify-between border-t border-slate-50 mt-4">
                        <Link
                            href="/customer/trades"
                            className="text-xs font-bold text-slate-600 hover:text-slate-900"
                        >
                            View active trades →
                        </Link>
                        <div className="w-8 h-8 rounded-full bg-amber-50 flex items-center justify-center text-amber-600">
                            <Clock className="w-5 h-5" />
                        </div>
                    </div>
                </div>
            </div>

            {/* ── Transaction Lifecycle Section ── */}
            <div
                className="bg-white p-6 md:p-8 rounded-2xl border shadow-sm space-y-6"
                style={{ borderColor: "#E1E3E6" }}
            >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b pb-4">
                    <div>
                        <h2 className="text-base md:text-lg font-bold text-slate-900">
                            Transaction Lifecycle
                        </h2>
                        {activeTrade ? (
                            <p className="text-xs text-slate-500 mt-0.5">
                                Active Transfer: <span className="font-semibold text-slate-800">{activeTrade.tradeId}</span>{" "}
                                ({formatCurrency(activeTrade.amount, activeTrade.sendCurrency)} → {activeTrade.receiveCurrency})
                            </p>
                        ) : (
                            <p className="text-xs text-slate-500 mt-0.5">
                                No active in-flight transfers currently processing.
                            </p>
                        )}
                    </div>

                    {activeTrade && (
                        <span className="self-start sm:self-auto px-3 py-1 rounded-full text-xs font-bold bg-amber-50 text-amber-800 border border-amber-200">
                            {getActiveStageBadge(activeTrade.status)}
                        </span>
                    )}
                </div>

                {/* 4-Stage Stepper */}
                <div className="py-2">
                    <TradeProgressStepper
                        currentStatus={(activeTrade?.status as TradeStage) || "QUOTED"}
                        variant="dashboard"
                    />
                </div>
            </div>

            {/* ── Recent Treasury Activity Table ── */}
            <div
                className="bg-white rounded-2xl border shadow-sm overflow-hidden"
                style={{ borderColor: "#E1E3E6" }}
            >
                <div className="p-6 border-b flex items-center justify-between" style={{ borderColor: "#E1E3E6" }}>
                    <div>
                        <h2 className="text-base md:text-lg font-bold text-slate-900">
                            Recent Treasury Activity
                        </h2>
                        <p className="text-xs text-slate-500 mt-0.5">
                            Real-time ledger entries and counterparty settlements
                        </p>
                    </div>

                    <Link
                        href="/customer/trades"
                        className="text-xs font-bold text-[#C9A227] hover:text-[#a8861d] flex items-center gap-1 transition-colors"
                    >
                        View All →
                    </Link>
                </div>

                {trades.length === 0 ? (
                    <div className="text-center py-12 px-4 space-y-3">
                        <FileText className="w-10 h-10 mx-auto text-slate-300" />
                        <p className="text-xs text-slate-500">No recent activity found on your treasury ledger.</p>
                        <Button
                            size="sm"
                            onClick={() => setShowNewTradeModal(true)}
                            className="bg-[#C9A227] hover:bg-[#b08e20] text-white text-xs font-semibold"
                        >
                            Initiate First Trade
                        </Button>
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full text-left text-xs">
                            <thead className="bg-slate-50/75 border-b border-slate-100 text-slate-500 uppercase tracking-wider text-[10px] font-bold">
                                <tr>
                                    <th className="py-3.5 px-6">Date</th>
                                    <th className="py-3.5 px-6">Type</th>
                                    <th className="py-3.5 px-6">Counterparty</th>
                                    <th className="py-3.5 px-6">Amount ({trades[0]?.sendCurrency || "NGN"})</th>
                                    <th className="py-3.5 px-6 text-right">Status</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
                                {trades.slice(0, 6).map((trade) => {
                                    const isCompleted = trade.status === "COMPLETED";
                                    const isProcessing = ["PAYMENT_CONFIRMED", "PROCESSING", "PROCESSED"].includes(trade.status);
                                    const isPending = ["AWAITING_PAYMENT", "PAYMENT_UPLOADED", "QUOTED", "SENT_TO_CUSTOMER"].includes(trade.status);

                                    return (
                                        <tr
                                            key={trade.id}
                                            onClick={() => router.push(`/customer/trades/${trade.id}`)}
                                            className="hover:bg-slate-50/60 cursor-pointer transition-colors"
                                        >
                                            <td className="py-4 px-6 text-slate-500 whitespace-nowrap">
                                                {new Date(trade.createdAt).toLocaleDateString("en-US", {
                                                    month: "short",
                                                    day: "numeric",
                                                    hour: "2-digit",
                                                    minute: "2-digit",
                                                })}
                                            </td>

                                            <td className="py-4 px-6 whitespace-nowrap">
                                                <div className="flex items-center gap-1.5 font-bold">
                                                    <ArrowUpRight className="w-3.5 h-3.5 text-amber-600" />
                                                    <span>Transfer</span>
                                                </div>
                                            </td>

                                            <td className="py-4 px-6 font-semibold text-slate-900 whitespace-nowrap">
                                                {trade.recipientName || "Institutional Supplier"}
                                            </td>

                                            <td className="py-4 px-6 font-bold text-slate-900 whitespace-nowrap">
                                                - {formatCurrency(trade.amount, trade.sendCurrency)}
                                            </td>

                                            <td className="py-4 px-6 text-right whitespace-nowrap">
                                                <span
                                                    className={`inline-flex px-2.5 py-1 rounded-full text-[11px] font-bold ${
                                                        isCompleted
                                                            ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                                                            : isProcessing
                                                            ? "bg-blue-50 text-blue-700 border border-blue-200"
                                                            : isPending
                                                            ? "bg-amber-50 text-amber-700 border border-amber-200"
                                                            : "bg-slate-100 text-slate-600"
                                                    }`}
                                                >
                                                    {isCompleted ? "Settled" : isProcessing ? "Processing" : "Pending"}
                                                </span>
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>

            {/* ── Modals ── */}
            {showNewTradeModal && (
                <NewTransactionModal
                    onClose={() => {
                        setShowNewTradeModal(false);
                        fetchDashboardData();
                    }}
                />
            )}

            <PapaEgoFundModal
                isOpen={showFundModal}
                onClose={() => {
                    setShowFundModal(false);
                    fetchDashboardData();
                }}
            />
        </div>
    );
}

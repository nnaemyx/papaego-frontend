"use client";

import { useQuery } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import {
  Download,
  Plus,
  TrendingUp,
  AlertTriangle,
  Clock,
  ArrowDownLeft,
  ArrowUpRight,
  ChevronRight,
  Filter,
  CheckCircle2,
  Wallet,
  Hourglass,
  Coins,
  ShieldCheck,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { transactionsApi } from "@/lib/api/transactions";
import { treasuryApi } from "@/lib/api/treasury";
import { adminDepositsApi } from "@/lib/api/admin-deposits";
import { toast } from "sonner";
import Link from "next/link";

export default function AdminGlobalDashboardPage() {
  const router = useRouter();

  const { data: stats } = useQuery({
    queryKey: ["dashboard-stats"],
    queryFn: transactionsApi.getDashboardStats,
    staleTime: 30_000,
  });

  const { data: recentData } = useQuery({
    queryKey: ["recent-transactions"],
    queryFn: () => transactionsApi.getTransactions({ limit: 6, page: 1 }),
    staleTime: 30_000,
  });

  const { data: depositsData } = useQuery({
    queryKey: ["admin-deposits"],
    queryFn: () => adminDepositsApi.list({ limit: 5 }),
    staleTime: 30_000,
  });

  const { data: treasuryData } = useQuery({
    queryKey: ["treasury-balances"],
    queryFn: () => treasuryApi.getAllBalances(),
    staleTime: 60_000,
  });

  const rawTrades = recentData?.trades ?? [];
  const rawDeposits = depositsData?.deposits ?? [];
  const pendingDeposits = rawDeposits.filter((d) => d.status === "PENDING");
  const unmatchedCount = stats?.unmatchedDepositsCount ?? pendingDeposits.length;

  const totalTreasury = stats?.totalTreasuryValue ?? stats?.tradeVolume ?? 0;
  const totalAvailable = stats?.availableLiquidity ?? 0;
  const pendingSettlement = stats?.pendingSettlement ?? 0;

  const liquidityPct = totalTreasury > 0 ? Math.min(100, Math.round((totalAvailable / totalTreasury) * 100)) : 0;

  return (
    <div className="p-4 md:p-8 space-y-6 max-w-7xl mx-auto font-sans" style={{ backgroundColor: "#F7F8F9" }}>
      {/* ── Top Header ── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b pb-4" style={{ borderColor: "#E1E3E6" }}>
        <div>
          <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight text-slate-900">
            Global Dashboard
          </h1>
          <p className="text-xs md:text-sm text-slate-500 mt-1">
            Real-time overview of global liquidity and operational status.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            onClick={() => toast.info("Exporting treasury overview...")}
            className="bg-white border-slate-200 text-slate-700 text-xs font-bold px-4 py-2.5 h-auto rounded-lg shadow-sm gap-2"
          >
            <Download className="w-4 h-4 text-slate-500" />
            Export
          </Button>

          <Button
            onClick={() => router.push("/admin/transactions")}
            className="bg-[#C9A227] hover:bg-[#b08e20] text-white text-xs font-bold px-4 py-2.5 h-auto rounded-lg shadow-sm gap-1.5"
          >
            <Plus className="w-4 h-4" />
            View Transactions
          </Button>
        </div>
      </div>

      {/* ── Top 4 Financial Metric Cards ── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Total Treasury Value */}
        <div className="bg-white p-5 rounded-2xl border shadow-sm flex flex-col justify-between" style={{ borderColor: "#E1E3E6" }}>
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Total Treasury Value</span>
            <Wallet className="w-4 h-4 text-slate-400" />
          </div>
          <div className="mt-3">
            <p className="text-2xl font-black text-slate-900">
              ₦{totalTreasury.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </p>
            <div className="flex items-center gap-1.5 mt-2">
              <span className="text-[11px] font-bold text-emerald-600 flex items-center gap-0.5">
                <TrendingUp className="w-3.5 h-3.5" />
                Live Sync
              </span>
              <span className="text-[11px] text-slate-400">from ledger & trades</span>
            </div>
          </div>
        </div>

        {/* Card 2: Available Liquidity */}
        <div className="bg-white p-5 rounded-2xl border shadow-sm flex flex-col justify-between" style={{ borderColor: "#E1E3E6" }}>
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Available Liquidity</span>
            <span className="w-2.5 h-2.5 rounded-full bg-blue-500" />
          </div>
          <div className="mt-3">
            <p className="text-2xl font-black text-slate-900">
              ₦{totalAvailable.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </p>
            <div className="mt-2 space-y-1">
              <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
                <div className="bg-blue-600 h-full rounded-full transition-all" style={{ width: `${liquidityPct}%` }} />
              </div>
              <span className="text-[10px] font-semibold text-slate-400 block">{liquidityPct}% of total assets</span>
            </div>
          </div>
        </div>

        {/* Card 3: Pending Settlement */}
        <div className="bg-white p-5 rounded-2xl border shadow-sm flex flex-col justify-between" style={{ borderColor: "#E1E3E6" }}>
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Pending Settlement</span>
            <Hourglass className="w-4 h-4 text-amber-500" />
          </div>
          <div className="mt-3">
            <p className="text-2xl font-black text-slate-900">
              ₦{pendingSettlement.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </p>
            <div className="flex items-center gap-2 mt-2">
              <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-50 text-amber-700">
                {rawTrades.filter(t => ["AWAITING_PAYMENT", "PAYMENT_UPLOADED", "PAYMENT_CONFIRMED", "PROCESSING", "PROCESSED"].includes(t.status)).length} In-Flight
              </span>
              <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-slate-100 text-slate-700">Reserved for Trades</span>
            </div>
          </div>
        </div>

        {/* Card 4: Exceptions / Alerts */}
        <div
          onClick={() => router.push("/admin/deposits")}
          className={`p-5 rounded-2xl border shadow-sm flex flex-col justify-between cursor-pointer transition-colors ${
            unmatchedCount > 0
              ? "bg-amber-50/70 border-amber-200 hover:bg-amber-50"
              : "bg-white border-slate-200 hover:bg-slate-50"
          }`}
        >
          <div className="flex items-center justify-between">
            <span className={`text-[10px] font-bold uppercase tracking-wider ${unmatchedCount > 0 ? "text-amber-800" : "text-slate-400"}`}>
              Exceptions / Alerts
            </span>
            <AlertTriangle className={`w-4 h-4 ${unmatchedCount > 0 ? "text-amber-600" : "text-slate-400"}`} />
          </div>
          <div className="mt-3">
            <p className={`text-3xl font-black ${unmatchedCount > 0 ? "text-amber-600" : "text-slate-900"}`}>
              {unmatchedCount}
            </p>
            <span className={`text-[11px] font-bold mt-2 flex items-center gap-1 ${unmatchedCount > 0 ? "text-amber-800" : "text-slate-500"}`}>
              {unmatchedCount > 0 ? "Pending review requests" : "No active flags"} <ChevronRight className="w-3 h-3" />
            </span>
          </div>
        </div>
      </div>

      {/* ── Middle Row: Liquidity by Currency & Customer Funds Overview ── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Liquidity by Currency (2 cols) */}
        <div className="lg:col-span-2 bg-white rounded-2xl border p-6 shadow-sm space-y-4" style={{ borderColor: "#E1E3E6" }}>
          <div className="flex items-center justify-between border-b pb-3" style={{ borderColor: "#E1E3E6" }}>
            <h2 className="text-sm font-bold text-slate-900">Liquidity by Currency</h2>
            <Link href="/admin/treasury" className="text-xs font-bold text-[#C9A227] hover:underline">
              View All Accounts →
            </Link>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3">
            {[
              {
                code: "NGN",
                flag: "NG",
                avail: `₦${(totalAvailable || 0).toLocaleString("en-US", { maximumFractionDigits: 0 })}`,
                sub: `Pending ₦${(pendingSettlement || 0).toLocaleString("en-US", { maximumFractionDigits: 0 })}`,
                color: "bg-emerald-50 text-emerald-700"
              },
              {
                code: "USD",
                flag: "US",
                avail: "$0.00",
                sub: "Settlement Vault",
                color: "bg-blue-50 text-blue-700"
              },
              {
                code: "USDT",
                flag: "TRON",
                avail: "0.00",
                sub: "TRC20 Network",
                color: "bg-amber-50 text-amber-700"
              },
              {
                code: "EUR",
                flag: "EU",
                avail: "€0.00",
                sub: "SEPA Pool",
                color: "bg-purple-50 text-purple-700"
              },
              {
                code: "GBP",
                flag: "GB",
                avail: "£0.00",
                sub: "FPS Clearing",
                color: "bg-indigo-50 text-indigo-700"
              },
            ].map((c, i) => (
              <div key={i} className="p-3.5 rounded-xl border border-slate-100 bg-slate-50/50 space-y-2">
                <div className="flex items-center gap-1.5">
                  <span className={`px-1.5 py-0.5 rounded text-[10px] font-black ${c.color}`}>{c.flag}</span>
                  <span className="text-xs font-bold text-slate-900">{c.code}</span>
                </div>
                <div>
                  <p className="text-[10px] text-slate-400 font-medium">Available</p>
                  <p className="text-xs font-bold text-slate-900 mt-0.5">{c.avail}</p>
                  <p className="text-[9px] text-slate-400 mt-1">{c.sub}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Customer Funds Overview (1 col) */}
        <div className="bg-white rounded-2xl border p-6 shadow-sm space-y-4" style={{ borderColor: "#E1E3E6" }}>
          <div className="border-b pb-3" style={{ borderColor: "#E1E3E6" }}>
            <h2 className="text-sm font-bold text-slate-900">Customer Funds Overview</h2>
          </div>

          <div className="text-center py-4 space-y-1">
            <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Total Customer Ledger</p>
            <p className="text-3xl font-black text-slate-900">
              ₦{((totalAvailable + pendingSettlement) || totalTreasury).toLocaleString("en-US", { maximumFractionDigits: 0 })}
            </p>
          </div>

          <div className="space-y-3 pt-2 text-xs border-t border-slate-100">
            <div className="flex items-center justify-between">
              <span className="flex items-center gap-2 text-slate-600 font-medium">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-600" />
                Available Spendable
              </span>
              <span className="font-bold text-slate-900">₦{totalAvailable.toLocaleString("en-US")}</span>
            </div>

            <div className="flex items-center justify-between">
              <span className="flex items-center gap-2 text-slate-600 font-medium">
                <span className="w-2.5 h-2.5 rounded-full bg-amber-500" />
                Reserved for In-Flight Trades
              </span>
              <span className="font-bold text-slate-900">₦{pendingSettlement.toLocaleString("en-US")}</span>
            </div>
          </div>
        </div>
      </div>

      {/* ── Bottom Row: Action Required & Recent Activity Feed ── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Action Required */}
        <div className="bg-white rounded-2xl border p-6 shadow-sm space-y-4" style={{ borderColor: "#E1E3E6" }}>
          <div className="flex items-center justify-between border-b pb-3" style={{ borderColor: "#E1E3E6" }}>
            <div className="flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-amber-600" />
              <h2 className="text-sm font-bold text-slate-900">Action Required</h2>
            </div>
            <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${unmatchedCount > 0 ? "bg-amber-500 text-white" : "bg-slate-100 text-slate-600"}`}>
              {unmatchedCount} Items
            </span>
          </div>

          <div className="space-y-3">
            {pendingDeposits.length > 0 ? (
              pendingDeposits.slice(0, 3).map((dep) => (
                <div key={dep.id} className="p-4 rounded-xl border border-amber-100 bg-amber-50/40 flex items-center justify-between gap-3">
                  <div className="space-y-1">
                    <p className="text-xs font-bold text-amber-900">
                      Pending Deposit: ₦{parseFloat(dep.amount).toLocaleString()}
                    </p>
                    <p className="text-[11px] text-slate-600">
                      Customer: {dep.customer?.fullName || dep.customer?.email || "Customer"}
                    </p>
                    <span className="text-[10px] text-slate-400">Ref: {dep.reference || dep.id.slice(0, 8)}</span>
                  </div>
                  <Button
                    size="sm"
                    onClick={() => router.push(`/admin/deposits/${dep.id}`)}
                    className="h-8 text-xs font-bold bg-white text-slate-900 border border-slate-200 hover:bg-slate-50 shadow-sm shrink-0"
                  >
                    Review
                  </Button>
                </div>
              ))
            ) : (
              <div className="text-center py-8 text-slate-400 text-xs">
                No critical actions required at this moment.
              </div>
            )}
          </div>
        </div>

        {/* Real Activity Feed */}
        <div className="bg-white rounded-2xl border p-6 shadow-sm space-y-4 flex flex-col justify-between" style={{ borderColor: "#E1E3E6" }}>
          <div>
            <div className="flex items-center justify-between border-b pb-3" style={{ borderColor: "#E1E3E6" }}>
              <h2 className="text-sm font-bold text-slate-900">Recent Activity Feed</h2>
              <Filter className="w-3.5 h-3.5 text-slate-400" />
            </div>

            <div className="divide-y divide-slate-100 text-xs">
              {rawTrades.length > 0 ? (
                rawTrades.slice(0, 4).map((trade) => {
                  const isCompleted = trade.status === "COMPLETED";
                  return (
                    <div key={trade.id} className="py-3 flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className={`w-7 h-7 rounded-lg flex items-center justify-center ${isCompleted ? "bg-emerald-50 text-emerald-600" : "bg-amber-50 text-amber-600"}`}>
                          {isCompleted ? <ArrowUpRight className="w-4 h-4" /> : <Clock className="w-4 h-4" />}
                        </div>
                        <div>
                          <p className="font-bold text-slate-900">
                            Trade #{trade.id.slice(0, 8).toUpperCase()} ({trade.sendCurrency} → {trade.receiveCurrency})
                          </p>
                          <p className="text-[10px] text-slate-400">
                            Status: <span className="font-semibold text-slate-700">{trade.status}</span>
                          </p>
                        </div>
                      </div>
                      <span className="font-bold text-slate-900">
                        {parseFloat(trade.amount).toLocaleString()} {trade.sendCurrency}
                      </span>
                    </div>
                  );
                })
              ) : (
                <div className="text-center py-8 text-slate-400 text-xs">
                  No activity recorded yet.
                </div>
              )}
            </div>
          </div>

          <div className="pt-3 border-t border-slate-100 text-center">
            <Link href="/admin/transactions" className="text-xs font-bold text-[#C9A227] hover:underline">
              View All Activity →
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

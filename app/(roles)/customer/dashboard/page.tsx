"use client";

import React, { useEffect, useState } from "react";
import {
  AlertTriangle,
  TrendingUp,
  Clock,
  ChevronRight,
  Send,
  Download,
  Phone,
  Zap,
  CheckCircle,
} from "lucide-react";
import { useAuthStore } from "@/store/auth-store";
import {
  customerApi,
  CustomerTrade,
  FxRate,
  CustomerDashboardStats,
} from "@/lib/api/customer";
import Link from "next/link";
import { CustomerStatCard } from "@/components/customer/CustomerStatCard";
import { ExchangeRateCarousel } from "@/components/customer/ExchangeRateCarousel";
import { CustomerQuickActions } from "@/components/customer/CustomerQuickActions";
import { CustomerTradeItem } from "@/components/customer/CustomerTradeItem";
import { NewTransactionModal } from "@/components/customer/NewTransactionModal";

type GradientKey = "green" | "blue" | "yellow" | "pink";

const GRADIENT_STYLES: Record<GradientKey, { background: string; textColor: string }> = {
  green:  { background: "var(--gradient-green)",  textColor: "var(--action-green-text)" },
  blue:   { background: "var(--gradient-blue)",   textColor: "var(--action-blue-text)" },
  yellow: { background: "var(--gradient-yellow)", textColor: "var(--action-yellow-text)" },
  pink:   { background: "var(--gradient-pink)",   textColor: "var(--action-pink-text)" },
};

// ── Static data ──────────────────────────────────────────────────────────────
const SERVICES: { label: string; icon: React.ElementType; gradient: GradientKey; href: string }[] = [
  { label: "Send Money",    icon: Send,      gradient: "green",  href: "/customer/trades" },
  { label: "Receive Money", icon: Download,  gradient: "blue",   href: "/customer/trades" },
  { label: "FX Rates",      icon: TrendingUp, gradient: "yellow", href: "/customer/rates" },
  { label: "Airtime",       icon: Phone,     gradient: "pink",   href: "#" },
  { label: "Quick Pay",     icon: Zap,       gradient: "blue",   href: "#" },
];

const HOW_TO_STEPS = [
  { title: "Request a quote",  desc: "Enter amount and currency to begin" },
  { title: "Review & confirm", desc: "Check supplier details and locked rate" },
  { title: "Make payment",     desc: "Transfer to the provided account" },
  { title: "Upload proof",     desc: "Confirm payment to complete the trade" },
];

// ── Page ─────────────────────────────────────────────────────────────────────
export default function CustomerDashboardPage() {
  const { user } = useAuthStore();

  const [stats, setStats] = useState<CustomerDashboardStats | null>(null);
  const [trades, setTrades] = useState<CustomerTrade[]>([]);
  const [tradeRequests, setTradeRequests] = useState<any[]>([]);
  const [rates, setRates] = useState<FxRate[]>([]);
  const [loading, setLoading] = useState(true);
  const [showNewTrade, setShowNewTrade] = useState(false);

  useEffect(() => {
    fetchAll();
  }, []);

  const fetchAll = async () => {
    setLoading(true);
    try {
      const [s, t, r, reqs] = await Promise.all([
        customerApi.getDashboardStats(),
        customerApi.getTrades({ limit: 5 }),
        customerApi.getFxRates(),
        customerApi.getTradeRequests(),
      ]);
      setStats(s);
      setTrades(t.trades);
      setRates(r.rates);
      setTradeRequests(reqs.filter((req: any) => req.status === "PENDING"));
    } catch {
      setStats({ totalTrades: 0, todayTrades: 0, pendingActions: 0, kycVerified: false });
      setTrades([]);
      setTradeRequests([]);
      setRates([
        { pair: "USD/NGN", buy: 1580, sell: 1600, lastUpdated: new Date().toISOString() },
        { pair: "GBP/NGN", buy: 1990, sell: 2020, lastUpdated: new Date().toISOString() },
        { pair: "EUR/NGN", buy: 1720, sell: 1745, lastUpdated: new Date().toISOString() },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const firstName =
    user?.firstName || (user as any)?.name?.split(" ")[0] || "there";
  const pendingActions = (stats?.pendingActions ?? 0) + tradeRequests.length;

  return (
    <div className="p-4 md:p-6 lg:pl-7 lg:pr-6 space-y-6 md:space-y-8">

      {/* ── Welcome Header ── */}
      <div className="flex items-start justify-between">
        <div>
          <h1
            className="text-2xl md:text-3xl lg:text-4xl font-bold mb-2"
            style={{ color: "var(--text-primary)" }}
          >
            Hello, {firstName}! 👋
          </h1>
          <div className="flex items-center gap-2 flex-wrap">
            <p
              className="text-sm md:text-base"
              style={{ color: "var(--text-secondary)" }}
            >
              Welcome back to PapaEgo
            </p>
            <span
              className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold"
              style={{
                backgroundColor: stats?.kycVerified ? "#E2FDED" : "#FFF8E1",
                color: stats?.kycVerified ? "#27AE60" : "#F59E0B",
              }}
            >
              {stats?.kycVerified ? (
                <CheckCircle className="w-3 h-3" />
              ) : (
                <Clock className="w-3 h-3" />
              )}
              {loading
                ? "Checking KYC..."
                : stats?.kycVerified
                ? "KYC Verified"
                : "KYC Pending"}
            </span>
          </div>
        </div>
      </div>

      {/* ── Stat Cards ── */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <CustomerStatCard
          title="Pending Actions"
          value={loading ? "–" : pendingActions}
          icon={AlertTriangle}
          iconColor="#F59E0B"
          iconBg="#FFF8E1"
          description="Trades awaiting your action"
          href="/customer/trades?status=PENDING"
          loading={loading}
        />
        <CustomerStatCard
          title="Today's Trades"
          value={loading ? "–" : stats?.todayTrades ?? 0}
          icon={TrendingUp}
          iconColor="#3B82F6"
          iconBg="#EFF6FF"
          description="Trades initiated today"
          loading={loading}
        />
        <CustomerStatCard
          title="Total Trades"
          value={loading ? "–" : stats?.totalTrades ?? 0}
          icon={Clock}
          iconColor="#8B5CF6"
          iconBg="#EDE9FE"
          description="All-time trade history"
          href="/customer/trades"
          loading={loading}
        />
      </div>

      {/* ── Pending Requests Banner (conditional) ── */}
      {tradeRequests.length > 0 && (
        <div
          className="bg-white rounded-2xl border p-5"
          style={{ borderColor: "#F59E0B40", borderLeftWidth: "3px", borderLeftColor: "#F59E0B" }}
        >
          <div className="flex items-center justify-between mb-3">
            <h2
              className="text-sm font-bold flex items-center gap-2"
              style={{ color: "var(--text-primary)" }}
            >
              <AlertTriangle className="w-4 h-4" style={{ color: "#F59E0B" }} />
              Pending Requests
            </h2>
            <span
              className="px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider"
              style={{ backgroundColor: "#C9A22720", color: "#C9A227" }}
            >
              {tradeRequests.length} Awaiting
            </span>
          </div>
          <div className="space-y-2">
            {tradeRequests.map((req) => (
              <div
                key={req.id}
                className="flex items-center justify-between p-3 rounded-xl"
                style={{ backgroundColor: "#FFF8E1" }}
              >
                <div>
                  <p className="text-sm font-bold" style={{ color: "var(--text-primary)" }}>
                    {req.amount} {req.sendCurrency} → {req.receiveCurrency}
                  </p>
                  <p className="caption" style={{ color: "var(--text-secondary)" }}>
                    Requested {new Date(req.createdAt).toLocaleDateString()}
                  </p>
                </div>
                <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-white border border-amber-100">
                  <Clock className="w-3 h-3 text-[#F59E0B]" />
                  <span className="caption font-bold text-[#F59E0B]">Waiting</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ── Exchange Rate Carousel ── */}
      <ExchangeRateCarousel rates={rates} loading={loading} />

      {/* ── Quick Actions ── */}
      <CustomerQuickActions onNewTrade={() => setShowNewTrade(true)} />

      {/* ── Recent Trades ── */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-lg font-bold" style={{ color: "var(--text-primary)" }}>
            Recent Trades
          </h2>
          <Link
            href="/customer/trades"
            className="text-sm font-medium flex items-center gap-1 hover:underline"
            style={{ color: "var(--brand-primary)" }}
          >
            See all <ChevronRight className="w-4 h-4" />
          </Link>
        </div>

        {loading ? (
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                className="h-20 rounded-xl animate-pulse"
                style={{ backgroundColor: "#E1E3E6" }}
              />
            ))}
          </div>
        ) : trades.length === 0 ? (
          <div
            className="text-center py-12 bg-white rounded-xl border"
            style={{ borderColor: "var(--border-custom)" }}
          >
            <div
              className="w-14 h-14 rounded-full flex items-center justify-center mx-auto mb-3"
              style={{ backgroundColor: "var(--bg-muted)" }}
            >
              <TrendingUp className="w-7 h-7" style={{ color: "#D1D5DB" }} />
            </div>
            <p className="font-medium mb-1" style={{ color: "var(--text-tertiary)" }}>
              No trades yet
            </p>
            <p className="body-secondary">
              Start your first transaction using the Quick Actions above
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {trades.map((trade) => (
              <CustomerTradeItem key={trade.id} trade={trade} />
            ))}
          </div>
        )}
      </div>

      {/* ── Services ── */}
      <div>
        <h2 className="text-lg font-bold mb-4" style={{ color: "var(--text-primary)" }}>
          Services
        </h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4">
          {SERVICES.map((svc) => {
            const Icon = svc.icon;
            const { background, textColor } = GRADIENT_STYLES[svc.gradient];
            return (
              <Link key={svc.label} href={svc.href}>
                <div
                  className="rounded-xl py-5 px-4 shadow-[0px_10px_30px_rgba(206,206,206,0.25),inset_0px_8px_16px_rgba(0,0,0,0.12)] transition-transform hover:scale-[1.02] flex flex-col h-32"
                  style={{ background }}
                >
                  <div className="flex-1 flex items-start">
                    <div
                      className="w-11 h-11 rounded-lg flex items-center justify-center"
                      style={{ backgroundColor: "rgba(255,255,255,0.55)" }}
                    >
                      <Icon className="w-5 h-5" style={{ color: textColor }} />
                    </div>
                  </div>
                  <p
                    className="text-sm font-black text-right leading-tight"
                    style={{ color: textColor }}
                  >
                    {svc.label}
                  </p>
                </div>
              </Link>
            );
          })}
        </div>
      </div>

      {/* ── How to Transact ── */}
      <div
        className="rounded-2xl border bg-white overflow-hidden"
        style={{ borderColor: "var(--border-custom)" }}
      >
        {/* Card header */}
        <div
          className="px-5 py-4 border-b"
          style={{ borderColor: "var(--border-light)", backgroundColor: "var(--bg-muted)" }}
        >
          <h2 className="text-lg font-bold" style={{ color: "var(--text-primary)" }}>
            How to Transact
          </h2>
          <p className="caption mt-0.5" style={{ color: "var(--text-secondary)" }}>
            Follow these 4 simple steps to complete a trade
          </p>
        </div>

        {/* Steps */}
        <div className="p-5 space-y-5">
          {HOW_TO_STEPS.map((step, i) => (
            <div key={i} className="flex items-start gap-4">
              {/* Step number with connector line */}
              <div className="flex flex-col items-center flex-shrink-0">
                <div
                  className="w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold text-white shadow-sm"
                  style={{ backgroundColor: "var(--brand-primary)" }}
                >
                  {i + 1}
                </div>
                {i < HOW_TO_STEPS.length - 1 && (
                  <div
                    className="w-px h-5 mt-1"
                    style={{ backgroundColor: "var(--border-custom)" }}
                  />
                )}
              </div>
              <div className="pb-1">
                <p
                  className="text-sm font-semibold mb-0.5"
                  style={{ color: "var(--text-primary)" }}
                >
                  {step.title}
                </p>
                <p className="body-secondary">{step.desc}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Footer link */}
        <div
          className="px-5 py-4 border-t flex items-center justify-between"
          style={{ borderColor: "var(--border-light)" }}
        >
          <p className="caption" style={{ color: "var(--text-tertiary)" }}>
            Need more help? Check our full guide.
          </p>
          <Link
            href="/customer/help"
            className="text-sm font-semibold flex items-center gap-1 hover:underline flex-shrink-0"
            style={{ color: "var(--brand-primary)" }}
          >
            View guide <ChevronRight className="w-4 h-4" />
          </Link>
        </div>
      </div>

      {/* ── Spacer ── */}
      <div className="pb-4" />

      {/* ── New Transaction Modal ── */}
      {showNewTrade && (
        <NewTransactionModal
          onClose={() => {
            setShowNewTrade(false);
            fetchAll(); // refresh stats + pending requests
          }}
        />
      )}
    </div>
  );
}

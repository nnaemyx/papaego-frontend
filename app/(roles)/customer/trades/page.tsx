"use client";

import { useEffect, useState } from "react";
import { Clock, TrendingUp, Plus } from "lucide-react";
import { customerApi, CustomerTrade } from "@/lib/api/customer";
import { CustomerTradeItem } from "@/components/customer/CustomerTradeItem";
import { NewTransactionModal } from "@/components/customer/NewTransactionModal";
import Link from "next/link";

const TABS = ["All", "Pending", "Completed", "Flagged"] as const;
type Tab = (typeof TABS)[number];

const STATUS_MAP: Record<Tab, string | undefined> = {
  All: undefined,
  Pending: "AWAITING_PAYMENT",
  Completed: "COMPLETED",
  Flagged: "FLAGGED",
};

const TAB_DESCRIPTIONS: Record<Tab, string> = {
  All: "All of your trade history",
  Pending: "Trades waiting for your action",
  Completed: "Successfully completed trades",
  Flagged: "Trades requiring attention",
};

export default function CustomerTradesPage() {
  const [activeTab, setActiveTab] = useState<Tab>("All");
  const [trades, setTrades] = useState<CustomerTrade[]>([]);
  const [loading, setLoading] = useState(true);
  const [showNewTrade, setShowNewTrade] = useState(false);

  useEffect(() => {
    fetchTrades();
  }, [activeTab]);

  const fetchTrades = async () => {
    setLoading(true);
    try {
      const result = await customerApi.getTrades({
        status: STATUS_MAP[activeTab],
        limit: 50,
      });
      setTrades(result.trades);
    } catch {
      setTrades([]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-4 md:p-6 lg:pl-7 lg:pr-6 space-y-6">
      {/* ── Header ── */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1
            className="text-2xl md:text-3xl lg:text-4xl font-bold mb-1.5"
            style={{ color: "var(--text-primary)" }}
          >
            My Trades
          </h1>
          <p className="text-sm md:text-base" style={{ color: "var(--text-secondary)" }}>
            {TAB_DESCRIPTIONS[activeTab]}
          </p>
        </div>
        <button
          onClick={() => setShowNewTrade(true)}
          className="flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-semibold text-white flex-shrink-0 transition-opacity hover:opacity-90"
          style={{ backgroundColor: "var(--brand-primary)" }}
        >
          <Plus className="w-4 h-4" />
          <span className="hidden sm:inline">New Trade</span>
        </button>
      </div>

      {/* ── Filter Tabs ── */}
      <div className="flex gap-2 overflow-x-auto scrollbar-hidden pb-1">
        {TABS.map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className="px-5 py-2 rounded-full text-sm font-semibold flex-shrink-0 transition-colors"
            style={{
              backgroundColor:
                activeTab === tab ? "var(--brand-primary)" : "#F6F6F6",
              color: activeTab === tab ? "white" : "var(--text-secondary)",
            }}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* ── Trade List ── */}
      <div className="space-y-3">
        {loading ? (
          Array.from({ length: 5 }).map((_, i) => (
            <div
              key={i}
              className="h-20 rounded-xl animate-pulse"
              style={{ backgroundColor: "#E1E3E6" }}
            />
          ))
        ) : trades.length === 0 ? (
          <div
            className="text-center py-16 bg-white rounded-xl border"
            style={{ borderColor: "var(--border-custom)" }}
          >
            <div
              className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4"
              style={{ backgroundColor: "var(--bg-muted)" }}
            >
              <Clock className="w-8 h-8" style={{ color: "#D1D5DB" }} />
            </div>
            <p className="font-semibold mb-1" style={{ color: "var(--text-tertiary)" }}>
              No {activeTab.toLowerCase()} trades found
            </p>
            <p className="body-secondary mb-5">
              {activeTab === "All"
                ? "Start your first trade from the dashboard"
                : `You have no ${activeTab.toLowerCase()} trades at the moment`}
            </p>
            {activeTab === "All" && (
              <Link
                href="/customer/dashboard"
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-semibold text-white"
                style={{ backgroundColor: "var(--brand-primary)" }}
              >
                <TrendingUp className="w-4 h-4" />
                Go to Dashboard
              </Link>
            )}
          </div>
        ) : (
          trades.map((trade) => <CustomerTradeItem key={trade.id} trade={trade} />)
        )}
      </div>

      {/* ── New Trade Modal ── */}
      {showNewTrade && (
        <NewTransactionModal onClose={() => setShowNewTrade(false)} />
      )}
    </div>
  );
}

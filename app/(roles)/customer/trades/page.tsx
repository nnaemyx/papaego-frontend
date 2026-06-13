"use client";

import { useEffect, useState } from "react";
import { Clock, TrendingUp, Plus, ArrowRight, RefreshCw, Search } from "lucide-react";
import { customerApi, CustomerTrade, CustomerTradeRequest } from "@/lib/api/customer";
import { formatCurrency } from "@/lib/formatters";
import { CustomerTradeItem } from "@/components/customer/CustomerTradeItem";
import { NewTransactionModal } from "@/components/customer/NewTransactionModal";
import Link from "next/link";
import { Input } from "@/components/ui/input";

const TABS = ["All", "Requests", "Pending", "Completed", "Flagged"] as const;
type Tab = (typeof TABS)[number];

const STATUS_MAP: Record<Tab, string | undefined> = {
  All: undefined,
  Requests: undefined,
  Pending: "AWAITING_PAYMENT",
  Completed: "COMPLETED",
  Flagged: "FLAGGED",
};

const TAB_DESCRIPTIONS: Record<Tab, string> = {
  All: "All your trades and pending requests",
  Requests: "Trade requests awaiting admin processing",
  Pending: "Trades waiting for your action",
  Completed: "Successfully completed trades",
  Flagged: "Trades requiring attention",
};

const REQUEST_STATUS_STYLE: Record<string, { label: string; bg: string; color: string }> = {
  PENDING:   { label: "Submitted", bg: "#FFF8E1", color: "#F59E0B" },
  POOL:      { label: "Submitted", bg: "#FFF8E1", color: "#F59E0B" },
  ASSIGNED:  { label: "Rate Pending", bg: "#EFF6FF", color: "#3B82F6" },
  QUOTED:    { label: "Rate Ready", bg: "#E2FDED", color: "#27AE60" },
  PROCESSED: { label: "Processing", bg: "#EDE9FE", color: "#8B5CF6" },
  REJECTED:  { label: "Rejected",   bg: "#FFE5E5", color: "#E05555" },
};

function TradeRequestItem({ req }: { req: CustomerTradeRequest }) {
  const cfg = REQUEST_STATUS_STYLE[req.status] || REQUEST_STATUS_STYLE.PENDING;
  const href = req.status === "PROCESSED" && req.linkedTradeId
    ? `/customer/trades/${req.linkedTradeId}`
    : `/customer/trade-requests/${req.id}`;

  return (
    <Link
      href={href}
      className="bg-white rounded-xl border p-4 flex items-center justify-between hover:bg-gray-50 transition-colors group"
      style={{ borderColor: "var(--border-custom)", borderLeftWidth: "3px", borderLeftColor: cfg.color }}
    >
      <div className="flex items-center gap-3">
        <div
          className="w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0"
          style={{ backgroundColor: cfg.bg }}
        >
          <RefreshCw className="w-4 h-4" style={{ color: cfg.color }} />
        </div>
        <div>
          <p className="caption font-semibold" style={{ color: "var(--text-tertiary)" }}>
            Trade Request
          </p>
          <p className="text-sm font-bold" style={{ color: "var(--text-primary)" }}>
            {formatCurrency(req.amount, req.sendCurrency)}{" "}
            <ArrowRight className="inline w-3.5 h-3.5 mx-0.5" />{" "}
            {req.receiveCurrency}
          </p>
          <p className="caption" style={{ color: "var(--text-tertiary)" }}>
            {new Date(req.createdAt).toLocaleDateString("en-NG", {
              day: "2-digit",
              month: "short",
              year: "numeric",
            })}
          </p>
        </div>
      </div>
      <div className="flex flex-col items-end gap-1.5 ml-3 flex-shrink-0">
        <span
          className="px-2.5 py-1 rounded-full caption font-semibold whitespace-nowrap"
          style={{ backgroundColor: cfg.bg, color: cfg.color }}
        >
          {cfg.label}
        </span>
        <span className="caption" style={{ color: "var(--text-tertiary)" }}>
          {req.status === "PENDING" || req.status === "POOL"
            ? "Awaiting admin review"
            : req.status === "ASSIGNED"
            ? "Agent setting rate…"
            : req.status === "QUOTED"
            ? "Admin processing rate…"
            : req.status === "PROCESSED"
            ? "Trade in progress"
            : ""}
        </span>
      </div>
    </Link>
  );
}

export default function CustomerTradesPage() {
  const [activeTab, setActiveTab] = useState<Tab>("All");
  const [trades, setTrades] = useState<CustomerTrade[]>([]);
  const [tradeRequests, setTradeRequests] = useState<CustomerTradeRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [showNewTrade, setShowNewTrade] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const [search, setSearch] = useState("");
  const limit = 10;

  useEffect(() => {
    setCurrentPage(1); // Reset page on tab or search change
  }, [activeTab, search]);

  useEffect(() => {
    fetchAll();
  }, [activeTab, currentPage, search]);

  const fetchAll = async () => {
    setLoading(true);
    try {
      const promises: Promise<any>[] = [
        customerApi.getTrades({ status: STATUS_MAP[activeTab], page: currentPage, limit, search: search || undefined }),
      ];
      // Always fetch requests for "All" and "Requests" tabs
      if (activeTab === "All" || activeTab === "Requests") {
        promises.push(customerApi.getTradeRequests({ page: currentPage, limit, search: search || undefined }));
      }

      const [tradeResult, requestResult] = await Promise.all(promises);
      setTrades(tradeResult.trades);
      
      if (activeTab === "Requests") {
        setTotalPages(Math.ceil(requestResult.total / limit));
        setTotalCount(requestResult.total);
      } else {
        setTotalPages(Math.ceil(tradeResult.total / limit));
        setTotalCount(tradeResult.total);
      }

      if (requestResult) {
        // Filter: only show non-REJECTED requests (or include REJECTED on Requests tab)
        const requests = requestResult.requests || [];
        const filtered = activeTab === "Requests"
          ? requests
          : requests.filter((r: CustomerTradeRequest) => r.status !== "REJECTED");
        setTradeRequests(filtered);
      } else {
        setTradeRequests([]);
      }
    } catch (error) {
      console.error("Fetch error:", error);
      setTrades([]);
      setTradeRequests([]);
    } finally {
      setLoading(false);
    }
  };

  // On "Requests" tab, only show trade requests
  const showOnlyRequests = activeTab === "Requests";
  const isEmpty = showOnlyRequests
    ? tradeRequests.length === 0
    : trades.length === 0 && tradeRequests.length === 0;

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
              backgroundColor: activeTab === tab ? "var(--brand-primary)" : "#F6F6F6",
              color: activeTab === tab ? "white" : "var(--text-secondary)",
            }}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* ── Search Bar ── */}
      <div className="relative w-full sm:w-80">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
        <Input
          placeholder="Search by trade ID, supplier, or currency"
          className="pl-10"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
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
        ) : isEmpty ? (
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
              {activeTab === "Requests"
                ? "No trade requests yet"
                : `No ${activeTab.toLowerCase()} trades found`}
            </p>
            <p className="body-secondary mb-5">
              {activeTab === "All" || activeTab === "Requests"
                ? "Submit a new trade request using the button above"
                : `You have no ${activeTab.toLowerCase()} trades at the moment`}
            </p>
            {(activeTab === "All" || activeTab === "Requests") && (
              <button
                onClick={() => setShowNewTrade(true)}
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-semibold text-white"
                style={{ backgroundColor: "var(--brand-primary)" }}
              >
                <TrendingUp className="w-4 h-4" />
                Submit a Trade Request
              </button>
            )}
          </div>
        ) : (
          <>
            {/* Trade Requests (shown on All + Requests tab) */}
            {tradeRequests.length > 0 && (
              <div className="space-y-3">
                {activeTab === "All" && (
                  <p className="text-xs font-bold uppercase tracking-wider px-1" style={{ color: "#9AA0A6" }}>
                    Trade Requests
                  </p>
                )}
                {tradeRequests.map((req) => (
                  <TradeRequestItem key={req.id} req={req} />
                ))}
                {activeTab === "All" && trades.length > 0 && (
                  <p className="text-xs font-bold uppercase tracking-wider px-1 pt-2" style={{ color: "#9AA0A6" }}>
                    Active Trades
                  </p>
                )}
              </div>
            )}

            {/* Actual Trades */}
            {!showOnlyRequests &&
              trades.map((trade) => (
                <CustomerTradeItem key={trade.id} trade={trade} />
              ))}

            {/* Pagination UI */}
            {totalPages > 1 && (
              <div className="flex items-center justify-between pt-6 border-t mt-8" style={{ borderColor: "var(--border-custom)" }}>
                <p className="caption" style={{ color: "var(--text-tertiary)" }}>
                  Showing page {currentPage} of {totalPages} ({totalCount} items)
                </p>
                <div className="flex gap-2">
                  <button
                    disabled={currentPage === 1 || loading}
                    onClick={() => setCurrentPage(p => p - 1)}
                    className="px-4 py-2 rounded-lg text-sm font-bold border transition-colors disabled:opacity-30 disabled:cursor-not-allowed hover:bg-gray-50"
                    style={{ borderColor: "var(--border-custom)", color: "var(--text-secondary)" }}
                  >
                    Previous
                  </button>
                  <button
                    disabled={currentPage === totalPages || loading}
                    onClick={() => setCurrentPage(p => p + 1)}
                    className="px-4 py-2 rounded-lg text-sm font-bold border transition-colors disabled:opacity-30 disabled:cursor-not-allowed hover:bg-gray-50"
                    style={{ borderColor: "var(--border-custom)", color: "var(--text-secondary)" }}
                  >
                    Next
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </div>

      {/* ── New Trade Modal ── */}
      {showNewTrade && (
        <NewTransactionModal
          onClose={() => {
            setShowNewTrade(false);
            fetchAll(); // refresh list after submitting
          }}
        />
      )}
    </div>
  );
}

"use client";

import { useEffect, useState } from "react";
import { RefreshCw, TrendingUp, Info } from "lucide-react";
import { apiClient } from "@/lib/api/client";

interface FxRate {
  pair: string;
  baseCurrency?: string;
  quoteCurrency?: string;
  buy: number;
  sell: number;
  lastUpdated: string;
  isActive?: boolean;
}

export default function AgentRatesPage() {
  const [rates, setRates] = useState<FxRate[]>([]);
  const [loading, setLoading] = useState(true);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => { fetchRates(); }, []);

  const fetchRates = async () => {
    setRefreshing(true);
    try {
      const data = await apiClient.get<FxRate[]>('/agent/fx-rates');
      setRates(Array.isArray(data) ? data : []);
      setLastUpdated(new Date());
    } catch {
      setRates([]);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };


  return (
    <div className="p-4 md:p-6 lg:pl-7 lg:pr-6 space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl lg:text-4xl font-bold mb-1.5" style={{ color: "var(--text-primary)" }}>
            Exchange Rates
          </h1>
          <p className="text-sm md:text-base" style={{ color: "var(--text-secondary)" }}>
            {lastUpdated
              ? `Live FX rates · Updated at ${lastUpdated.toLocaleTimeString()}`
              : "Current live FX rates — set by administrators"}
          </p>
        </div>
        <button
          onClick={fetchRates}
          disabled={refreshing}
          className="w-10 h-10 rounded-full border bg-white flex items-center justify-center shadow-sm hover:bg-gray-50 transition-colors shrink-0"
          style={{ borderColor: "var(--border-custom)" }}
        >
          <RefreshCw className={`w-5 h-5 ${refreshing ? "animate-spin" : ""}`} style={{ color: "var(--brand-primary)" }} />
        </button>
      </div>

      {/* Admin-set notice */}
      <div className="flex items-start gap-3 p-4 rounded-xl border" style={{ backgroundColor: "#FFF8E1", borderColor: "#FDE68A" }}>
        <Info className="w-5 h-5 shrink-0 mt-0.5" style={{ color: "#C9A227" }} />
        <div>
          <p className="text-sm font-semibold" style={{ color: "#92400E" }}>Rates are set by PapaEgo Administrators</p>
          <p className="text-xs mt-0.5" style={{ color: "#B45309" }}>
            These rates reflect the current admin-configured FX margin. Rates are locked at trade confirmation. Contact your admin for rate queries or updates.
          </p>
        </div>
      </div>

      {/* Hero Banner */}
      <div className="rounded-2xl p-6 text-white" style={{ background: "linear-gradient(135deg, #012333 0%, #023a50 100%)" }}>
        <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-widest mb-3 inline-block" style={{ backgroundColor: "rgba(201,162,39,0.2)", color: "#C9A227" }}>
          LIVE RATES
        </span>
        <h2 className="text-2xl font-bold mb-1">PapaEgo FX Rates</h2>
        <p className="text-sm leading-relaxed" style={{ color: "#9AA0A6" }}>
          Rates are subject to our hybrid rate-fixing system and may vary at time of trade. Final rates are locked at trade confirmation.
        </p>
        <div className="flex items-center gap-4 mt-4">
          <div className="flex items-center gap-1.5">
            <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: "#27AE60" }} />
            <span className="text-xs" style={{ color: "#9AA0A6" }}>Buy Rate (customer buys FX)</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: "#F59E0B" }} />
            <span className="text-xs" style={{ color: "#9AA0A6" }}>Sell Rate (customer sells FX)</span>
          </div>
        </div>
      </div>

      {/* Rate Cards */}
      <div className="space-y-3">
        {loading ? (
          Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="h-28 rounded-xl animate-pulse" style={{ backgroundColor: "#E1E3E6" }} />
          ))
        ) : rates.length === 0 ? (
          <div className="py-16 text-center bg-white rounded-2xl border" style={{ borderColor: "var(--border-custom)" }}>
            <TrendingUp className="w-12 h-12 mx-auto mb-3 opacity-20" style={{ color: "var(--text-tertiary)" }} />
            <p className="font-semibold" style={{ color: "var(--text-secondary)" }}>No rates available</p>
            <p className="text-sm mt-1" style={{ color: "var(--text-tertiary)" }}>
              Your administrator has not configured any exchange rates yet. Please check back later.
            </p>
          </div>
        ) : (
          rates.map((rate) => {
            const [from] = rate.pair.split("/");
            const spread = rate.sell - rate.buy;
            return (
              <div key={rate.pair} className="bg-white rounded-xl border p-4 hover:shadow-sm transition-shadow" style={{ borderColor: "var(--border-custom)" }}>
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <div className="w-11 h-11 rounded-full flex items-center justify-center font-bold text-sm shrink-0" style={{ backgroundColor: "#012333", color: "#C9A227" }}>
                      {from}
                    </div>
                    <div>
                      <p className="font-bold" style={{ color: "var(--text-primary)" }}>{rate.pair}</p>
                      <p className="caption" style={{ color: "var(--text-tertiary)" }}>Spread: ₦{spread.toLocaleString()}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full" style={{ backgroundColor: "#E2FDED" }}>
                    <TrendingUp className="w-3.5 h-3.5" style={{ color: "#27AE60" }} />
                    <span className="caption font-semibold" style={{ color: "#27AE60" }}>Live</span>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div className="rounded-lg p-3.5" style={{ backgroundColor: "#E2FDED" }}>
                    <p className="caption mb-1 font-medium" style={{ color: "#27AE60" }}>Buy Rate</p>
                    <p className="text-lg font-bold" style={{ color: "var(--text-primary)" }}>₦{rate.buy.toLocaleString()}</p>
                  </div>
                  <div className="rounded-lg p-3.5" style={{ backgroundColor: "#FFF8E1" }}>
                    <p className="caption mb-1 font-medium" style={{ color: "#F59E0B" }}>Sell Rate</p>
                    <p className="text-lg font-bold" style={{ color: "var(--text-primary)" }}>₦{rate.sell.toLocaleString()}</p>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      <p className="caption text-center pb-4 px-4" style={{ color: "var(--text-tertiary)" }}>
        * All rates are indicative and subject to change. Final rates are locked at time of trade confirmation.
      </p>
    </div>
  );
}

"use client";

import { useEffect, useRef, useState } from "react";
import { ChevronRight, RefreshCw } from "lucide-react";
import Link from "next/link";

export interface FxRateItem {
  pair: string;
  buy: number;
  sell: number;
  lastUpdated: string;
}

interface ExchangeRateCarouselProps {
  rates: FxRateItem[];
  loading?: boolean;
}

export function ExchangeRateCarousel({ rates, loading }: ExchangeRateCarouselProps) {
  const [currentIdx, setCurrentIdx] = useState(0);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    if (rates.length > 1) {
      intervalRef.current = setInterval(
        () => setCurrentIdx((i) => (i + 1) % rates.length),
        4000
      );
    }
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [rates.length]);

  const rate = rates[currentIdx];

  return (
    <div>
      <div className="flex items-center justify-between mb-3">
        <h2 className="text-lg font-bold" style={{ color: "var(--text-primary)" }}>
          Live Exchange Rates
        </h2>
        <Link
          href="/customer/rates"
          className="text-sm font-medium flex items-center gap-1 hover:underline"
          style={{ color: "var(--brand-primary)" }}
        >
          See all <ChevronRight className="w-4 h-4" />
        </Link>
      </div>

      {loading ? (
        <div
          className="h-48 rounded-2xl animate-pulse"
          style={{ backgroundColor: "#D1D5DB" }}
        />
      ) : rate ? (
        <div
          className="relative overflow-hidden rounded-2xl"
          style={{ backgroundColor: "#012333" }}
        >
          <div className="p-6">
            <div className="flex items-start justify-between mb-5">
              <div>
                <p className="text-xs font-medium mb-1.5" style={{ color: "#9AA0A6" }}>
                  Currency Pair
                </p>
                <span className="text-3xl font-bold text-white">{rate.pair}</span>
              </div>
              <span
                className="px-3 py-1 rounded-lg text-xs font-bold tracking-widest uppercase mt-1"
                style={{ backgroundColor: "rgba(201,162,39,0.2)", color: "#C9A227" }}
              >
                LIVE
              </span>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div
                className="rounded-xl p-4"
                style={{ backgroundColor: "rgba(255,255,255,0.07)" }}
              >
                <p className="text-xs mb-1.5 font-medium" style={{ color: "#9AA0A6" }}>
                  Buy Rate
                </p>
                <p className="text-2xl font-bold text-white">
                  ₦{rate.buy?.toLocaleString()}
                </p>
              </div>
              <div
                className="rounded-xl p-4"
                style={{ backgroundColor: "rgba(255,255,255,0.07)" }}
              >
                <p className="text-xs mb-1.5 font-medium" style={{ color: "#9AA0A6" }}>
                  Sell Rate
                </p>
                <p className="text-2xl font-bold text-white">
                  ₦{rate.sell?.toLocaleString()}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-1.5 mt-3">
              <RefreshCw className="w-3 h-3" style={{ color: "#6B7078" }} />
              <p className="text-xs" style={{ color: "#6B7078" }}>
                Updated {new Date(rate.lastUpdated).toLocaleTimeString()}
              </p>
            </div>
          </div>

          {/* Dots */}
          <div className="flex items-center justify-center gap-1.5 pb-5">
            {rates.slice(0, 6).map((_, i) => (
              <button
                key={i}
                onClick={() => setCurrentIdx(i)}
                className="rounded-full transition-all duration-300"
                style={{
                  width: i === currentIdx ? "24px" : "6px",
                  height: "6px",
                  backgroundColor:
                    i === currentIdx ? "#C9A227" : "rgba(255,255,255,0.25)",
                }}
              />
            ))}
          </div>
        </div>
      ) : null}
    </div>
  );
}

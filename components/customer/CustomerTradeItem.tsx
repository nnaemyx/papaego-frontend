"use client";

import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { CustomerTrade } from "@/lib/api/customer";

export const STATUS_CONFIG: Record<string, { label: string; color: string; bg: string }> = {
  AWAITING_PAYMENT:   { label: "Awaiting Payment",  color: "#F59E0B", bg: "#FFF8E1" },
  PAYMENT_CONFIRMED:  { label: "Payment Confirmed", color: "#3B82F6", bg: "#EFF6FF" },
  COMPLETED:          { label: "Completed",         color: "#27AE60", bg: "#E2FDED" },
  FLAGGED:            { label: "Flagged",            color: "#E05555", bg: "#FFE5E5" },
  INITIATED:          { label: "In Progress",       color: "#6B7078", bg: "#F6F6F6" },
  QUOTED:             { label: "Quoted",             color: "#8B5CF6", bg: "#EDE9FE" },
  SENT_TO_CUSTOMER:   { label: "Review Required",   color: "#F59E0B", bg: "#FFF8E1" },
  CUSTOMER_CONFIRMED: { label: "Confirmed",         color: "#3B82F6", bg: "#EFF6FF" },
  CUSTOMER_VERIFIED:  { label: "Verified",          color: "#27AE60", bg: "#E2FDED" },
  UNDER_REVIEW:       { label: "Under Review",      color: "#F59E0B", bg: "#FFF8E1" },
  CANCELLED:          { label: "Cancelled",         color: "#E05555", bg: "#FFE5E5" },
  EXPIRED:            { label: "Expired",           color: "#9AA0A6", bg: "#F6F6F6" },
};

export const PENDING_STATUSES = [
  "INITIATED",
  "QUOTED",
  "SENT_TO_CUSTOMER",
  "AWAITING_PAYMENT",
  "CUSTOMER_CONFIRMED",
];

export function CustomerTradeItem({ trade }: { trade: CustomerTrade }) {
  const cfg = STATUS_CONFIG[trade.status] || {
    label: trade.status,
    color: "#6B7078",
    bg: "#F6F6F6",
  };
  const isPending = PENDING_STATUSES.includes(trade.status);

  return (
    <Link href={`/customer/trades/${trade.id}`} className="block">
      <div
        className="bg-white rounded-xl border p-4 flex items-center justify-between hover:border-amber-400 transition-all hover:shadow-sm"
        style={{ borderColor: "var(--border-custom)" }}
      >
        <div className="flex items-center gap-3">
          <div
            className="w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0"
            style={{ backgroundColor: cfg.bg }}
          >
            <ArrowUpRight className="w-5 h-5" style={{ color: cfg.color }} />
          </div>
          <div>
            <p className="caption font-semibold" style={{ color: "var(--text-tertiary)" }}>
              {trade.tradeId}
            </p>
            <p className="text-sm font-bold" style={{ color: "var(--text-primary)" }}>
              {trade.amount} {trade.sendCurrency} → {trade.receiveCurrency}
            </p>
            <p className="caption" style={{ color: "var(--text-tertiary)" }}>
              {new Date(trade.createdAt).toLocaleDateString("en-NG", {
                day: "2-digit",
                month: "short",
                year: "numeric",
              })}
            </p>
          </div>
        </div>

        <div className="flex flex-col items-end gap-2 flex-shrink-0 ml-3">
          <span
            className="px-2.5 py-1 rounded-full caption font-semibold whitespace-nowrap"
            style={{ backgroundColor: cfg.bg, color: cfg.color }}
          >
            {cfg.label}
          </span>
          <span className="caption font-semibold" style={{ color: "var(--brand-primary)" }}>
            {isPending ? "Action needed →" : "View Details →"}
          </span>
        </div>
      </div>
    </Link>
  );
}

"use client";

import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { CustomerTrade } from "@/lib/api/customer";
import { formatCurrency } from "@/lib/formatters";

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

function getCustomerFriendlyStage(status: string): { label: string; stageNumber: number; color: string; bg: string } {
  switch (status) {
    case "REQUESTED":
    case "INITIATED":
    case "CUSTOMER_VERIFIED":
    case "UNDER_REVIEW":
    case "FLAGGED":
      return { label: "Under Review", stageNumber: 1, color: "#3B82F6", bg: "#EFF6FF" };
    case "QUOTED":
    case "SENT_TO_CUSTOMER":
    case "CUSTOMER_CONFIRMED":
      return { label: "Rate Assigned", stageNumber: 2, color: "#8B5CF6", bg: "#EDE9FE" };
    case "AWAITING_PAYMENT":
    case "PAYMENT_UPLOADED":
      return { label: "Payment Submitted", stageNumber: 3, color: "#F59E0B", bg: "#FFF8E1" };
    case "PAYMENT_CONFIRMED":
      return { label: "Payment Verified", stageNumber: 4, color: "#3B82F6", bg: "#EFF6FF" };
    case "COMPLETED":
      return { label: "Completed", stageNumber: 5, color: "#27AE60", bg: "#E2FDED" };
    case "CANCELLED":
      return { label: "Cancelled", stageNumber: 0, color: "#E05555", bg: "#FFE5E5" };
    case "EXPIRED":
      return { label: "Expired", stageNumber: 0, color: "#9AA0A6", bg: "#F6F6F6" };
    default:
      return { label: status, stageNumber: 0, color: "#6B7078", bg: "#F6F6F6" };
  }
}

export function CustomerTradeItem({ 
  trade,
  onCancel,
}: { 
  trade: CustomerTrade;
  onCancel?: (trade: CustomerTrade) => void;
}) {
  const stageInfo = getCustomerFriendlyStage(trade.status);
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
            style={{ backgroundColor: stageInfo.bg }}
          >
            <ArrowUpRight className="w-5 h-5" style={{ color: stageInfo.color }} />
          </div>
          <div>
            <p className="caption font-semibold" style={{ color: "var(--text-tertiary)" }}>
              {trade.tradeId}
            </p>
            <p className="text-sm font-bold" style={{ color: "var(--text-primary)" }}>
              {formatCurrency(trade.amount, trade.sendCurrency)} → {trade.receiveCurrency}
            </p>
            <div className="flex items-center gap-4 flex-wrap">
              <p className="caption" style={{ color: "var(--text-tertiary)" }}>
                {new Date(trade.createdAt).toLocaleDateString("en-NG", {
                  day: "2-digit",
                  month: "short",
                  year: "numeric",
                })}
              </p>
              
              {stageInfo.stageNumber > 0 && (
                <div className="flex items-center gap-1 w-20" title={`Stage ${stageInfo.stageNumber} of 5: ${stageInfo.label}`}>
                  {[1, 2, 3, 4, 5].map((s) => (
                    <div
                      key={s}
                      className="h-1 rounded-full flex-1 transition-all"
                      style={{
                        backgroundColor: s <= stageInfo.stageNumber ? stageInfo.color : "#E1E3E6",
                      }}
                    />
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="flex flex-col items-end gap-2 flex-shrink-0 ml-3">
          <span
            className="px-2.5 py-1 rounded-full caption font-semibold whitespace-nowrap"
            style={{ backgroundColor: stageInfo.bg, color: stageInfo.color }}
          >
            {stageInfo.label}
          </span>
          <div className="flex items-center gap-3">
            {!["COMPLETED", "CANCELLED", "EXPIRED"].includes(trade.status) && onCancel && (
              <button
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  onCancel(trade);
                }}
                className="text-xs font-bold text-red-500 hover:text-red-700 transition-colors"
              >
                Cancel Trade
              </button>
            )}
            <span className="caption font-semibold" style={{ color: "var(--brand-primary)" }}>
              {isPending ? "Action needed →" : "View Details →"}
            </span>
          </div>
        </div>
      </div>
    </Link>
  );
}

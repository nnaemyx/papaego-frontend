"use client";

import React, { use, useEffect, useState, useRef } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ChevronLeft,
  Loader2,
  ArrowUpRight,
  Clock,
  Timer,
  AlertCircle,
} from "lucide-react";
import { customerApi } from "@/lib/api/customer";
import { TransactionChat } from "@/components/transactions/TransactionChat";
import { TradeProgressStepper, TradeStage } from "@/components/transactions/TradeProgressStepper";
import { formatCurrency, formatExchangeRate } from "@/lib/formatters";
import { format } from "date-fns";
import { toast } from "sonner";

interface CustomerTradeRequestDetailsPageProps {
  params: Promise<{ id: string }>;
}

const STATUS_CONFIG: Record<string, { label: string; color: string; bg: string }> = {
  PENDING:   { label: "Submitted", color: "#F59E0B", bg: "#FFF8E1" },
  POOL:      { label: "Submitted", color: "#F59E0B", bg: "#FFF8E1" },
  ASSIGNED:  { label: "Rate Pending", color: "#3B82F6", bg: "#EFF6FF" },
  QUOTED:    { label: "Rate Ready", color: "#27AE60", bg: "#E2FDED" },
  PROCESSED: { label: "Processing", color: "#8B5CF6", bg: "#EDE9FE" },
  REJECTED:  { label: "Rejected",   color: "#E05555", bg: "#FFE5E5" },
};

// ── Rate Countdown component ──────────────────────────────────────────────────
function RateCountdown({ seconds: initialSeconds, onExpire }: { seconds: number; onExpire?: () => void }) {
  const [remaining, setRemaining] = useState(initialSeconds);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    setRemaining(initialSeconds);
  }, [initialSeconds]);

  useEffect(() => {
    if (remaining <= 0) {
      if (onExpire) onExpire();
      return;
    }
    intervalRef.current = setInterval(() => {
      setRemaining((s) => (s <= 1 ? 0 : s - 1));
    }, 1000);
    return () => clearInterval(intervalRef.current!);
  }, [remaining <= 0]);

  const mins = Math.floor(remaining / 60);
  const secs = remaining % 60;
  const isUrgent = remaining <= 60;
  const expired = remaining === 0;

  if (expired) {
    return (
      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold"
        style={{ backgroundColor: "#FFE5E5", color: "#E05555" }}>
        <AlertCircle className="w-3 h-3" />
        Rate Expired
      </span>
    );
  }

  return (
    <span
      className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold tabular-nums"
      style={{
        backgroundColor: isUrgent ? "#FFE5E5" : "#FFF8E1",
        color: isUrgent ? "#E05555" : "#92400E",
        animation: isUrgent ? "pulse 1s infinite" : undefined,
      }}
    >
      <Timer className="w-3 h-3" />
      {`${mins}m ${secs.toString().padStart(2, "0")}s`}
    </span>
  );
}

export default function CustomerTradeRequestDetailsPage({
  params,
}: CustomerTradeRequestDetailsPageProps) {
  const { id: tradeRequestId } = use(params);
  const router = useRouter();

  const [request, setRequest] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const fetchRequest = async () => {
    try {
      const data = await customerApi.getTradeRequest(tradeRequestId);
      setRequest(data);
    } catch {
      toast.error("Failed to load trade request details");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRequest();
  }, [tradeRequestId]);

  useEffect(() => {
    if (request && request.status === "PROCESSED" && request.linkedTradeId) {
      router.push(`/customer/trades/${request.linkedTradeId}`);
    }
  }, [request, router]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <Loader2
            className="w-10 h-10 animate-spin mx-auto mb-3"
            style={{ color: "var(--brand-primary)" }}
          />
          <p className="body-secondary">Loading trade request details…</p>
        </div>
      </div>
    );
  }

  if (!request) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] p-6 text-center">
        <div
          className="w-16 h-16 rounded-full flex items-center justify-center mb-4"
          style={{ backgroundColor: "#FFE5E5" }}
        >
          <ArrowUpRight className="w-8 h-8" style={{ color: "#E05555" }} />
        </div>
        <h1 className="text-2xl font-bold mb-2" style={{ color: "var(--text-primary)" }}>
          Trade Request Not Found
        </h1>
        <p className="body-secondary mb-6">
          This trade request may have been removed or you don't have access to it.
        </p>
        <Link
          href="/customer/trades"
          className="px-6 py-2.5 rounded-lg font-bold text-white"
          style={{ backgroundColor: "var(--brand-primary)" }}
        >
          Back to Trades
        </Link>
      </div>
    );
  }

  const cfg = STATUS_CONFIG[request.status] || {
    label: request.status,
    color: "#6B7078",
    bg: "#F6F6F6",
  };

  return (
    <div className="min-h-screen" style={{ backgroundColor: "#f7f8f9" }}>
      {/* Sub-header / Breadcrumb */}
      <div
        className="h-14 flex items-center px-4 md:px-8 border-b bg-white"
        style={{ borderColor: "var(--border-custom)" }}
      >
        <div className="flex items-center gap-2 text-sm font-medium">
          <Link
            href="/customer/trades"
            className="flex items-center gap-1.5 hover:underline transition-colors"
            style={{ color: "var(--text-secondary)" }}
          >
            <ChevronLeft className="w-4 h-4" />
            Trades
          </Link>
          <span style={{ color: "var(--border-custom)" }}>/</span>
          <span className="font-bold" style={{ color: "var(--text-primary)" }}>
            Req: {request.id.slice(0, 8).toUpperCase()}
          </span>
        </div>
      </div>

      <main className="p-4 md:p-8 max-w-6xl mx-auto space-y-6">
        
        {/* Progress Stepper */}
        <TradeProgressStepper currentStatus={request.status as TradeStage} isTradeRequest={true} />

        {/* ── Info Banner ── */}
        <div
          className="bg-white rounded-2xl border p-5 md:p-6 flex flex-col md:flex-row md:items-center justify-between gap-4"
          style={{ borderColor: "var(--border-custom)" }}
        >
          <div className="flex items-center gap-4">
            <div
              className="w-12 h-12 rounded-full flex items-center justify-center flex-shrink-0"
              style={{ backgroundColor: cfg.bg }}
            >
              <Clock className="w-6 h-6" style={{ color: cfg.color }} />
            </div>
            <div>
              <h1 className="text-xl md:text-2xl font-bold" style={{ color: "var(--text-primary)" }}>
                {formatCurrency(request.amount, request.sendCurrency)} → {request.receiveCurrency}
              </h1>
              <p className="body-secondary mt-0.5">
                Submitted on {format(new Date(request.createdAt), "MMMM d, yyyy")}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3 flex-wrap md:flex-col md:items-end">
            <span
              className="px-3 py-1 rounded-full text-sm font-bold"
              style={{ backgroundColor: cfg.bg, color: cfg.color }}
            >
              {cfg.label}
            </span>
            {request.rateExpiresIn !== null && request.status === "QUOTED" && (
              <RateCountdown seconds={request.rateExpiresIn} onExpire={fetchRequest} />
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* ── Left: Details ── */}
          <div className="lg:col-span-2 space-y-6">

            {/* Request Details */}
            <div
              className="bg-white rounded-2xl border overflow-hidden"
              style={{ borderColor: "var(--border-custom)" }}
            >
              <div
                className="px-5 py-4 border-b"
                style={{
                  borderColor: "var(--border-light)",
                  backgroundColor: "var(--bg-muted)",
                }}
              >
                <h2 className="heading-card">Request Details</h2>
              </div>
              <div className="divide-y" style={{ borderColor: "var(--border-light)" }}>
                {[
                  { label: "Send Amount",          val: formatCurrency(request.amount, request.sendCurrency) },
                  { label: "Receive Currency",      val: request.receiveCurrency },
                  { label: "Purpose",               val: request.purpose || "Not Specified" },
                  { label: "Status",                val: cfg.label },
                ].map((item, idx) => (
                  <div key={idx} className="px-5 py-4 flex flex-col sm:flex-row sm:justify-between sm:items-center gap-1.5">
                    <span className="body-secondary">{item.label}</span>
                    <span className="font-semibold text-right" style={{ color: "var(--text-primary)" }}>
                      {item.val}
                    </span>
                  </div>
                ))}

                {/* Exchange Rate — shown once agent has quoted */}
                {request.fxRate && (
                  <div className="px-5 py-4 flex flex-col sm:flex-row sm:justify-between sm:items-center gap-1.5">
                    <span className="body-secondary">Exchange Rate</span>
                    <div className="flex items-center gap-2 flex-wrap sm:justify-end">
                      <span className="font-bold text-right" style={{ color: "#27AE60" }}>
                        {formatExchangeRate(request.fxRate.toString(), request.sendCurrency, request.receiveCurrency)}
                      </span>
                      {request.rateExpiresIn !== null && request.status === "QUOTED" && (
                        <RateCountdown seconds={request.rateExpiresIn} onExpire={fetchRequest} />
                      )}
                    </div>
                  </div>
                )}

                {/* Estimated Payout — shown once agent has quoted */}
                {request.payoutAmount && (
                  <div className="px-5 py-4 flex flex-col sm:flex-row sm:justify-between sm:items-center gap-1.5">
                    <span className="body-secondary">Estimated Payout</span>
                    <span className="font-bold text-right text-lg" style={{ color: "#012333" }}>
                      {Number(request.payoutAmount).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })} {request.receiveCurrency}
                    </span>
                  </div>
                )}
              </div>

              {/* Banner: rate is ready, action required */}
              {request.status === "QUOTED" && request.fxRate && (
                <div
                  className="mx-5 mb-5 mt-3 rounded-xl px-4 py-3 flex items-start gap-3"
                  style={{ backgroundColor: "#E2FDED", border: "1px solid #A7F3D0" }}
                >
                  <span className="text-xl">✅</span>
                  <div>
                    <p className="text-sm font-bold" style={{ color: "#065F46" }}>
                      Your rate is ready!
                    </p>
                    <p className="text-xs mt-0.5" style={{ color: "#047857" }}>
                      Your agent has set an exchange rate of{" "}
                      <strong>{formatExchangeRate(request.fxRate.toString(), request.sendCurrency, request.receiveCurrency)}</strong>.
                      An email has been sent to you with full details. Please review and proceed.
                    </p>
                    <p className="text-xs mt-1.5 font-bold" style={{ color: "#065F46" }}>
                      ⚠️ Please proceed before the 10-minute timer expires, or else the exchange rate will automatically update to follow the latest live rate.
                    </p>
                  </div>
                </div>
              )}
            </div>

            {/* Supplier Information */}
            <div
              className="bg-white rounded-2xl border overflow-hidden"
              style={{ borderColor: "var(--border-custom)" }}
            >
              <div
                className="px-5 py-4 border-b"
                style={{
                  borderColor: "var(--border-light)",
                  backgroundColor: "var(--bg-muted)",
                }}
              >
                <h2 className="heading-card">Supplier Information</h2>
              </div>
              <div className="p-5">
                 {request.supplierBusinessName ? (
                     <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <p className="caption" style={{ color: "var(--text-tertiary)" }}>Business Name</p>
                            <p className="font-semibold mt-0.5">{request.supplierBusinessName}</p>
                        </div>
                        <div>
                            <p className="caption" style={{ color: "var(--text-tertiary)" }}>Bank Name</p>
                            <p className="font-semibold mt-0.5">{request.supplierBankName || "N/A"}</p>
                        </div>
                        <div>
                            <p className="caption" style={{ color: "var(--text-tertiary)" }}>Account Number</p>
                            <p className="font-semibold mt-0.5">{request.supplierAccountNumber || "N/A"}</p>
                        </div>
                        <div>
                            <p className="caption" style={{ color: "var(--text-tertiary)" }}>Sector</p>
                            <p className="font-semibold mt-0.5">{request.supplierSector || "N/A"}</p>
                        </div>
                        {request.supplierAddress && (
                          <div className="md:col-span-2">
                              <p className="caption" style={{ color: "var(--text-tertiary)" }}>Address</p>
                              <p className="font-semibold mt-0.5">{request.supplierAddress}</p>
                          </div>
                        )}
                        {request.invoiceUrl && (
                          <div className="md:col-span-2 pt-2 border-t" style={{ borderColor: "#E1E3E6" }}>
                             <p className="caption mb-2" style={{ color: "var(--text-tertiary)" }}>Attached Invoice</p>
                             <a
                                href={request.invoiceUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center gap-2 px-4 py-2 bg-gray-50 border border-gray-200 rounded-lg hover:bg-gray-100 transition-colors text-sm font-medium"
                              >
                                View Invoice Document
                             </a>
                          </div>
                        )}
                     </div>
                 ) : (
                     <p className="text-gray-500 text-sm">No specific supplier information was provided for this request.</p>
                 )}
              </div>
            </div>
          </div>

          {/* ── Right: Chat ── */}
          <div className="space-y-6">
            <TransactionChat tradeRequestId={request.id} />
          </div>
        </div>
      </main>
    </div>
  );
}

"use client";

import React, { use, useEffect, useState, useCallback, useRef } from "react";
import Link from "next/link";
import {
  ChevronLeft,
  Loader2,
  ArrowUpRight,
  Upload,
  CheckCircle,
  Clock,
  MessageCircle,
  FileText,
  ExternalLink,
  TrendingDown,
  AlertCircle,
  X,
  Timer,
  AlertTriangle,
  Sparkles,
} from "lucide-react";
import { customerApi, CustomerTradeDetail } from "@/lib/api/customer";
import { TransactionChat } from "@/components/transactions/TransactionChat";
import { TradeTimeline } from "@/components/customer/TradeTimeline";
import { formatCurrency, formatExchangeRate } from "@/lib/formatters";
import { format } from "date-fns";
import { toast } from "sonner";

interface CustomerTradeDetailsPageProps {
  params: Promise<{ id: string }>;
}

function RatingForm({ tradeId, onSubmitted }: { tradeId: string; onSubmitted: () => void }) {
  const [rating, setRating] = useState(5);
  const [hoverRating, setHoverRating] = useState(0);
  const [feedback, setFeedback] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (rating < 1 || rating > 5) {
      toast.error("Please select a rating between 1 and 5");
      return;
    }
    setSubmitting(true);
    try {
      await customerApi.rateAgent(tradeId, rating, feedback.trim() || undefined);
      toast.success("Thank you for your feedback!");
      onSubmitted();
    } catch {
      toast.error("Failed to submit rating");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block text-sm font-semibold text-gray-700 mb-1">
          Select Rating
        </label>
        <div className="flex items-center gap-1">
          {[1, 2, 3, 4, 5].map((star) => {
            const active = hoverRating ? star <= hoverRating : star <= rating;
            return (
              <button
                key={star}
                type="button"
                onClick={() => setRating(star)}
                onMouseEnter={() => setHoverRating(star)}
                onMouseLeave={() => setHoverRating(0)}
                className="p-1 focus:outline-none transition-transform hover:scale-110"
              >
                <svg
                  className={`w-8 h-8 ${
                    active ? "text-amber-500 fill-amber-500" : "text-gray-300"
                  }`}
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                </svg>
              </button>
            );
          })}
        </div>
      </div>

      <div>
        <label className="block text-sm font-semibold text-gray-700 mb-1">
          Comments (Optional)
        </label>
        <textarea
          rows={3}
          value={feedback}
          onChange={(e) => setFeedback(e.target.value)}
          placeholder="Share your experience working with this agent..."
          className="w-full rounded-xl border border-gray-300 p-3 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500/50 bg-gray-50 focus:bg-white transition-colors"
        />
      </div>

      <button
        type="submit"
        disabled={submitting}
        className="px-5 py-2.5 rounded-lg text-sm font-bold text-white transition-opacity hover:opacity-90 disabled:opacity-50"
        style={{ backgroundColor: "var(--brand-primary)" }}
      >
        {submitting ? "Submitting..." : "Submit Rating"}
      </button>
    </form>
  );
}

const STATUS_CONFIG: Record<string, { label: string; color: string; bg: string }> = {
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
  PAYMENT_UPLOADED:   { label: "Payment Submitted", color: "#3B82F6", bg: "#EFF6FF" },
};

const ACTION_STATUSES = [
  "INITIATED",
  "QUOTED",
  "SENT_TO_CUSTOMER",
  "AWAITING_PAYMENT",
  "CUSTOMER_CONFIRMED",
  "PAYMENT_UPLOADED",
];

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

// ── Negotiate Rate Modal ──────────────────────────────────────────────────────
function NegotiateModal({
  trade,
  onClose,
  onSuccess,
}: {
  trade: CustomerTradeDetail;
  onClose: () => void;
  onSuccess: () => void;
}) {
  const originalRate = Number(trade.fxRate || 0);
  const maxDiscount = 0.05; // default; overridden by eligibility response
  const minRate = originalRate * (1 - maxDiscount);

  const [eligibility, setEligibility] = useState<{
    eligible: boolean;
    turnover: number;
    turnoverThreshold: number;
    maxDiscountPct: number;
    reason?: string;
  } | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [requestedRate, setRequestedRate] = useState(originalRate.toFixed(2));

  useEffect(() => {
    customerApi
      .getNegotiationEligibility(trade.id)
      .then(setEligibility)
      .catch(() => toast.error("Failed to check eligibility"))
      .finally(() => setLoading(false));
  }, [trade.id]);

  const effMinRate = eligibility
    ? originalRate * (1 - eligibility.maxDiscountPct)
    : minRate;
  const effMaxDiscountPct = eligibility?.maxDiscountPct ?? maxDiscount;

  const handleSubmit = async () => {
    const val = parseFloat(requestedRate);
    if (isNaN(val) || val <= 0) {
      toast.error("Enter a valid rate");
      return;
    }
    if (val < effMinRate) {
      toast.error(`Rate too low. Minimum is ${effMinRate.toFixed(2)}`);
      return;
    }
    if (val >= originalRate) {
      toast.error("Requested rate must be lower than the quoted rate");
      return;
    }
    setSubmitting(true);
    try {
      const result = await customerApi.requestNegotiation(trade.id, val);
      toast.success(result.message || "Negotiation submitted! Admin will review shortly.");
      onSuccess();
      onClose();
    } catch (err: any) {
      const msg = err?.response?.data?.error || "Failed to submit negotiation";
      toast.error(msg);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ backgroundColor: "rgba(0,0,0,0.5)" }}
    >
      <div
        className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div
          className="flex items-center justify-between px-6 py-4 border-b"
          style={{ borderColor: "var(--border-custom)" }}
        >
          <div className="flex items-center gap-2">
            <TrendingDown className="w-5 h-5" style={{ color: "var(--brand-primary)" }} />
            <h2 className="font-bold text-lg" style={{ color: "var(--text-primary)" }}>
              Request Rate Negotiation
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg hover:bg-gray-100 transition-colors"
          >
            <X className="w-5 h-5" style={{ color: "var(--text-secondary)" }} />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 space-y-5">
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="w-8 h-8 animate-spin" style={{ color: "var(--brand-primary)" }} />
            </div>
          ) : !eligibility?.eligible ? (
            <div
              className="rounded-xl p-4 flex gap-3"
              style={{ backgroundColor: "#FFE5E5" }}
            >
              <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" style={{ color: "#E05555" }} />
              <div>
                <p className="font-bold text-sm" style={{ color: "#B91C1C" }}>
                  Not Eligible for Negotiation
                </p>
                <p className="text-sm mt-1" style={{ color: "#7F1D1D" }}>
                  {eligibility?.reason}
                </p>
                {eligibility && (
                  <div className="mt-3 text-xs space-y-1" style={{ color: "#991B1B" }}>
                    <p>Your 30-day volume: <strong>${eligibility.turnover.toLocaleString(undefined, { maximumFractionDigits: 2 })}</strong></p>
                    <p>Required: <strong>${eligibility.turnoverThreshold.toLocaleString()}</strong></p>
                  </div>
                )}
              </div>
            </div>
          ) : (
            <>
              {/* Rate info */}
              <div
                className="rounded-xl p-4 space-y-3"
                style={{ backgroundColor: "#F8FAFF", border: "1px solid #DBEAFE" }}
              >
                <div className="flex justify-between text-sm">
                  <span style={{ color: "var(--text-secondary)" }}>Current quoted rate</span>
                  <span className="font-bold" style={{ color: "var(--text-primary)" }}>
                    1 {trade.sendCurrency} = {originalRate.toLocaleString()} {trade.receiveCurrency}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span style={{ color: "var(--text-secondary)" }}>Max discount allowed</span>
                  <span className="font-bold" style={{ color: "#8B5CF6" }}>
                    {(effMaxDiscountPct * 100).toFixed(1)}%
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span style={{ color: "var(--text-secondary)" }}>Minimum allowable rate</span>
                  <span className="font-bold" style={{ color: "#27AE60" }}>
                    {effMinRate.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </span>
                </div>
              </div>

              {/* Input */}
              <div className="space-y-1.5">
                <label
                  className="text-sm font-semibold block"
                  style={{ color: "var(--text-primary)" }}
                >
                  Your requested rate (1 {trade.sendCurrency} = ? {trade.receiveCurrency})
                </label>
                <input
                  type="number"
                  step="0.01"
                  value={requestedRate}
                  onChange={(e) => setRequestedRate(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl border text-sm font-semibold focus:outline-none focus:ring-2"
                  style={{
                    borderColor: "var(--border-custom)",
                    color: "var(--text-primary)",
                  }}
                  placeholder={`Min: ${effMinRate.toFixed(2)}`}
                />
                <p className="text-xs" style={{ color: "var(--text-tertiary)" }}>
                  Your 30-day volume: ${eligibility.turnover.toLocaleString(undefined, { maximumFractionDigits: 2 })} — you qualify for up to {(effMaxDiscountPct * 100).toFixed(1)}% discount
                </p>
              </div>

              {/* Action */}
              <button
                onClick={handleSubmit}
                disabled={submitting}
                className="w-full py-3 rounded-xl font-bold text-white flex items-center justify-center gap-2 transition-opacity hover:opacity-90 disabled:opacity-60"
                style={{ backgroundColor: "var(--brand-primary)" }}
              >
                {submitting ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Submitting…
                  </>
                ) : (
                  <>
                    <TrendingDown className="w-4 h-4" />
                    Submit Negotiation Request
                  </>
                )}
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

// ── Main Page ─────────────────────────────────────────────────────────────────
export default function CustomerTradeDetailsPage({
  params,
}: CustomerTradeDetailsPageProps) {
  const { id: transactionId } = use(params);

  const [trade, setTrade] = useState<CustomerTradeDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [uploadingProof, setUploadingProof] = useState(false);
  const [proofSuccess, setProofSuccess] = useState(false);
  const [showNegotiate, setShowNegotiate] = useState(false);

  // ── Negotiation state ──
  const [negotiationEligible, setNegotiationEligible] = useState(false);
  const [negotiationChecking, setNegotiationChecking] = useState(false);
  const [negotiating, setNegotiating] = useState(false);

  // ── Rate expiry countdown ──
  const [rateCountdown, setRateCountdown] = useState<number | null>(null);
  const fetchTrade = useCallback(async () => {
    try {
      const data = await customerApi.getTrade(transactionId);
      setTrade(data);

      // Set initial countdown from server
      if (data.rateExpiresIn && data.rateExpiresIn > 0 && !data.isRateExpired) {
        setRateCountdown(data.rateExpiresIn);
      } else {
        setRateCountdown(null);
      }

      // Check negotiation eligibility if trade has a rate and isn't negotiated yet
      if (data.fxRate && !data.negotiationUsed && !data.isRateExpired) {
        setNegotiationChecking(true);
        try {
          const eligibility = await customerApi.checkNegotiationEligibility(data.id);
          setNegotiationEligible(eligibility.eligible);
        } catch {
          setNegotiationEligible(false);
        } finally {
          setNegotiationChecking(false);
        }
      }
    } catch {
      toast.error("Failed to load trade details");
    } finally {
      setLoading(false);
    }
  }, [transactionId]);

  useEffect(() => {
    fetchTrade();
  }, [fetchTrade]);
  // Countdown timer
  useEffect(() => {
    if (rateCountdown === null || rateCountdown <= 0) return;
    const interval = setInterval(() => {
      setRateCountdown((prev) => {
        if (prev === null || prev <= 1) {
          clearInterval(interval);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [rateCountdown]);

  const formatCountdown = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${s.toString().padStart(2, "0")}`;
  };

  const handleNegotiate = async () => {
    if (!trade) return;
    setNegotiating(true);
    try {
      const result = await customerApi.negotiateTrade(trade.id);
      toast.success(result.message);
      setNegotiationEligible(false);
      fetchTrade();
    } catch (err: any) {
      toast.error(err?.response?.data?.error || "Failed to negotiate rate");
    } finally {
      setNegotiating(false);
    }
  };

  const handleProofUpload = async (file: File) => {
    if (!trade) return;
    setUploadingProof(true);
    try {
      await customerApi.uploadPaymentProof(trade.id, file);
      setProofSuccess(true);
      toast.success("Payment proof uploaded successfully");
      setTimeout(() => setProofSuccess(false), 3000);
      fetchTrade();
    } catch {
      toast.error("Failed to upload proof");
    } finally {
      setUploadingProof(false);
    }
  };

  const handleReceiptUpload = async (file: File) => {
    if (!trade) return;
    setUploadingProof(true);
    try {
      await customerApi.uploadReceipt(trade.id, file);
      setProofSuccess(true);
      toast.success("Receipt uploaded successfully. Admin will process shortly.");
      setTimeout(() => setProofSuccess(false), 3000);
      fetchTrade();
    } catch {
      toast.error("Failed to upload receipt");
    } finally {
      setUploadingProof(false);
    }
  };

  /* ── Loading ─────────────────────────────────────────────────────────────── */
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <Loader2
            className="w-10 h-10 animate-spin mx-auto mb-3"
            style={{ color: "var(--brand-primary)" }}
          />
          <p className="body-secondary">Loading trade details…</p>
        </div>
      </div>
    );
  }

  /* ── Not Found ───────────────────────────────────────────────────────────── */
  if (!trade) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] p-6 text-center">
        <div
          className="w-16 h-16 rounded-full flex items-center justify-center mb-4"
          style={{ backgroundColor: "#FFE5E5" }}
        >
          <ArrowUpRight className="w-8 h-8" style={{ color: "#E05555" }} />
        </div>
        <h1 className="text-2xl font-bold mb-2" style={{ color: "var(--text-primary)" }}>
          Trade Not Found
        </h1>
        <p className="body-secondary mb-6">
          This trade may have been removed or you don&apos;t have access to it.
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

  const cfg = STATUS_CONFIG[trade.status] || {
    label: trade.status,
    color: "#6B7078",
    bg: "#F6F6F6",
  };
  const needsAction = ACTION_STATUSES.includes(trade.status);
  const canNegotiate =
    !trade.negotiationUsed &&
    (trade.status === "QUOTED" || trade.status === "SENT_TO_CUSTOMER") &&
    !!trade.fxRate;
  const rateIsExpired = trade.rateExpiresIn !== null && trade.rateExpiresIn === 0;

  /* ── Page ────────────────────────────────────────────────────────────────── */
  return (
    <div className="min-h-screen" style={{ backgroundColor: "#f7f8f9" }}>
      {/* Negotiate Rate Modal */}
      {showNegotiate && (
        <NegotiateModal
          trade={trade}
          onClose={() => setShowNegotiate(false)}
          onSuccess={fetchTrade}
        />
      )}

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
            {trade.tradeId}
          </span>
        </div>
      </div>

      <main className="p-4 md:p-8 max-w-6xl mx-auto space-y-6">
        
        {/* Progress Stepper */}
        <TradeTimeline stages={trade.stages || []} />

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
              <ArrowUpRight className="w-6 h-6" style={{ color: cfg.color }} />
            </div>
            <div>
              <h1 className="text-xl md:text-2xl font-bold" style={{ color: "var(--text-primary)" }}>
                {formatCurrency(trade.amount, trade.sendCurrency)} → {trade.receiveCurrency}
              </h1>
              <p className="body-secondary mt-0.5">
                Initiated on {format(new Date(trade.createdAt), "MMMM d, yyyy")}
              </p>
            </div>
          </div>

          <div className="flex flex-wrap gap-2 md:flex-col md:items-end">
            <span
              className="px-3 py-1 rounded-full text-sm font-bold"
              style={{ backgroundColor: cfg.bg, color: cfg.color }}
            >
              {cfg.label}
            </span>
            {trade.fxRate && (
              <div className="flex items-center gap-2 flex-wrap">
                <p className="text-sm font-medium" style={{ color: "var(--text-secondary)" }}>
                  Rate: {formatExchangeRate(Number(trade.fxRate), trade.sendCurrency, trade.receiveCurrency)}
                </p>
                {/* Rate countdown timer */}
                {trade.rateExpiresIn !== null && (trade.status === "QUOTED" || trade.status === "SENT_TO_CUSTOMER" || trade.status === "AWAITING_PAYMENT") && (
                  <RateCountdown seconds={trade.rateExpiresIn} onExpire={fetchTrade} />
                )}
              </div>
            )}
            {/* Negotiate rate button */}
            {canNegotiate && !rateIsExpired && (
              <button
                onClick={() => setShowNegotiate(true)}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold border transition-colors hover:opacity-90"
                style={{
                  borderColor: "#8B5CF6",
                  color: "#8B5CF6",
                  backgroundColor: "#F5F3FF",
                }}
              >
                <TrendingDown className="w-3.5 h-3.5" />
                Negotiate Rate
              </button>
            )}
            {trade.negotiationUsed && (
              <span className="text-xs font-medium px-2.5 py-1 rounded-full"
                style={{ backgroundColor: "#EDE9FE", color: "#7C3AED" }}>
                Negotiation Used
              </span>
            )}
            {!["COMPLETED", "CANCELLED", "EXPIRED"].includes(trade.status) && (
              <button
                onClick={async () => {
                  if (!confirm("Are you sure you want to cancel this trade?")) return;
                  try {
                    await customerApi.cancelTrade(trade.id);
                    toast.success("Trade cancelled successfully");
                    fetchTrade();
                  } catch (error) {
                    toast.error("Failed to cancel trade");
                  }
                }}
                className="mt-2 px-4 py-2 border border-red-200 bg-red-50 text-red-600 hover:bg-red-100 rounded-lg text-xs font-bold transition-colors"
              >
                Cancel Trade
              </button>
            )}
          </div>
        </div>

        {/* Rate Expiry & Negotiation Panel */}
        {trade.fxRate && (
          <div
            className="bg-white rounded-2xl border p-5 md:p-6 overflow-hidden relative"
            style={{ borderColor: "var(--border-custom)" }}
          >
            {/* Visual indicator bar */}
            <div 
              className="absolute top-0 left-0 w-2 h-full" 
              style={{ 
                backgroundColor: trade.isRateExpired 
                  ? "#E05555" 
                  : trade.negotiationUsed 
                  ? "#8B5CF6" 
                  : "var(--brand-primary)" 
              }} 
            />
            
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pl-3">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <Timer className="w-5 h-5 text-amber-500 animate-pulse" />
                  <span className="font-bold text-gray-900 text-lg">Rate Protection Status</span>
                </div>
                <p className="text-sm text-gray-500">
                  {trade.isRateExpired 
                    ? "This quoted exchange rate has expired. Please contact support or request a new quote."
                    : `Your rate is locked. Complete your payment before the timer expires.`}
                </p>
              </div>
              
              <div className="flex flex-col items-start md:items-end gap-1 flex-shrink-0">
                {trade.isRateExpired ? (
                  <span className="px-3 py-1.5 rounded-lg text-xs font-bold bg-red-50 text-red-600 flex items-center gap-1">
                    <AlertTriangle className="w-3.5 h-3.5" /> Expired
                  </span>
                ) : rateCountdown !== null ? (
                  <div className="flex items-center gap-2 bg-amber-50 px-4 py-2 rounded-xl border border-amber-200">
                    <span className="text-xs font-semibold text-amber-800 uppercase tracking-wider">Expires In</span>
                    <span className="font-mono text-lg font-bold text-amber-600">
                      {formatCountdown(rateCountdown)}
                    </span>
                  </div>
                ) : (
                  <span className="px-3 py-1.5 rounded-lg text-xs font-bold bg-green-50 text-green-700 flex items-center gap-1">
                    <CheckCircle className="w-3.5 h-3.5" /> Locked
                  </span>
                )}
              </div>
            </div>

            {/* Negotiation result */}
            {trade.negotiationUsed && (
              <div className="mt-4 p-4 rounded-xl bg-purple-50 border border-purple-100 flex items-start gap-3 pl-3">
                <Sparkles className="w-5 h-5 text-purple-600 flex-shrink-0 mt-0.5" />
                <div>
                  <h4 className="text-sm font-bold text-purple-900">✨ Preferred Rate Applied!</h4>
                  <p className="text-xs text-purple-700 mt-0.5">
                    A volume-based customer discount of 0.05% has been applied to this trade. 
                    Original rate: <span className="font-semibold">{Number(trade.originalFxRate || trade.fxRate).toFixed(4)}</span> → 
                    Negotiated rate: <span className="font-bold">{Number(trade.negotiatedRate || trade.fxRate).toFixed(4)}</span>
                  </p>
                </div>
              </div>
            )}

            {/* Negotiation offer */}
            {negotiationEligible && !trade.negotiationUsed && !trade.isRateExpired && (
              <div className="mt-4 p-4 rounded-xl bg-gradient-to-r from-purple-50 to-indigo-50 border border-purple-100 flex flex-col md:flex-row md:items-center justify-between gap-4 pl-3">
                <div className="flex items-start gap-3">
                  <Sparkles className="w-5 h-5 text-purple-600 flex-shrink-0 mt-0.5 animate-bounce" />
                  <div>
                    <h4 className="text-sm font-bold text-purple-950">✨ Preferred FX Discount Available!</h4>
                    <p className="text-xs text-purple-800 mt-0.5">
                      Because of your high activity and turnover, you are eligible for an instant 0.05% discount.
                    </p>
                  </div>
                </div>
                <button
                  onClick={handleNegotiate}
                  disabled={negotiating}
                  className="px-4 py-2.5 rounded-lg text-xs font-bold text-white bg-purple-600 hover:bg-purple-700 flex items-center gap-1.5 transition-colors self-start md:self-auto disabled:opacity-50 shadow-sm"
                >
                  {negotiating ? (
                    <>
                      <Loader2 className="w-3.5 h-3.5 animate-spin" /> Negotiating...
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-3.5 h-3.5" /> Negotiate Rate
                    </>
                  )}
                </button>
              </div>
            )}
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* ── Left: Details ── */}
          <div className="lg:col-span-2 space-y-6">

            {/* Agent Rating Section (shown only when COMPLETED) */}
            {trade.status === "COMPLETED" && (
              <div
                className="bg-white rounded-2xl border p-5 md:p-6"
                style={{ borderColor: "var(--border-custom)" }}
              >
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 rounded-full bg-amber-50 flex items-center justify-center">
                    <Sparkles className="w-5 h-5 text-amber-500" />
                  </div>
                  <div>
                    <h2 className="text-lg font-bold text-gray-900">Agent Feedback</h2>
                    <p className="text-xs text-gray-500">
                      Rate your experience with agent {trade.agent ? `${(trade.agent as any).firstName} ${(trade.agent as any).lastName}` : "assigned to this trade"}
                    </p>
                  </div>
                </div>

                {trade.agentRating ? (
                  <div className="bg-amber-50/50 border border-amber-100 rounded-xl p-4">
                    <div className="flex items-center gap-1.5 mb-2">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <svg
                          key={star}
                          className={`w-5 h-5 ${
                            star <= (trade.agentRating?.rating || 0)
                              ? "text-amber-500 fill-amber-500"
                              : "text-gray-300"
                          }`}
                          fill="currentColor"
                          viewBox="0 0 20 20"
                        >
                          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                        </svg>
                      ))}
                    </div>
                    {trade.agentRating?.feedback ? (
                      <p className="text-sm text-gray-700 italic">
                        "{trade.agentRating.feedback}"
                      </p>
                    ) : (
                      <p className="text-xs text-gray-500 italic">No written feedback provided.</p>
                    )}
                  </div>
                ) : (
                  <RatingForm tradeId={trade.id} onSubmitted={fetchTrade} />
                )}
              </div>
            )}

            {/* Trade Details */}
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
                <h2 className="heading-card">Trade Details</h2>
              </div>
              <div className="divide-y" style={{ borderColor: "var(--border-light)" }}>
                {[
                  { label: "Send Amount",          val: formatCurrency(trade.amount, trade.sendCurrency) },
                  { label: "Receive Currency",      val: trade.receiveCurrency },
                  {
                    label: "Locked Exchange Rate",
                    val: trade.fxRate
                      ? `1 ${trade.sendCurrency} = ${Number(trade.fxRate).toLocaleString()} ${trade.receiveCurrency}`
                      : "Not finalized",
                  },
                  ...(trade.negotiationUsed && trade.originalFxRate
                    ? [{ label: "Original Rate", val: `1 ${trade.sendCurrency} = ${Number(trade.originalFxRate).toLocaleString()} ${trade.receiveCurrency}` }]
                    : []),
                  {
                    label: "Total Payout",
                    val: trade.payoutAmount
                      ? `${Number(trade.payoutAmount).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })} ${trade.receiveCurrency}`
                      : "Pending",
                  },
                  {
                    label: "Rate Locked Until",
                    val: trade.lockedUntil
                      ? format(new Date(trade.lockedUntil), "PPP p")
                      : "N/A",
                  },
                ].map(({ label, val }) => (
                  <div key={label} className="px-5 py-3.5 flex items-center justify-between gap-4">
                    <span className="body-secondary flex-shrink-0">{label}</span>
                    <span
                      className="text-sm font-semibold text-right"
                      style={{ color: "var(--text-primary)" }}
                    >
                      {val}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Receipt from Admin/Agent */}
            {trade.receiptUrl && (
              <div
                className="bg-white rounded-2xl border p-5"
                style={{ borderColor: "var(--border-custom)" }}
              >
                <div className="flex items-start gap-4">
                  <div
                    className="w-11 h-11 rounded-full flex items-center justify-center flex-shrink-0"
                    style={{ backgroundColor: "#E2FDED" }}
                  >
                    <FileText className="w-5 h-5" style={{ color: "#27AE60" }} />
                  </div>
                  <div className="flex-1">
                    <h3
                      className="font-bold mb-1"
                      style={{ color: "var(--text-primary)" }}
                    >
                      Receipt / Invoice from Agent
                    </h3>
                    <p className="body-secondary mb-4">
                      Your agent has sent a receipt or invoice for this trade. Review it
                      before making payment.
                    </p>
                    <a
                      href={trade.receiptUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 px-4 py-2 border rounded-lg text-sm font-bold hover:bg-gray-50 transition-colors"
                      style={{
                        borderColor: "#27AE60",
                        color: "#27AE60",
                        backgroundColor: "#E2FDED",
                      }}
                    >
                      <ExternalLink className="w-4 h-4" />
                      View Receipt
                    </a>
                  </div>
                </div>
              </div>
            )}

            {/* Payment Proof / Receipt */}
            {trade.paymentProofUrl && (
              <div
                className="bg-white rounded-2xl border p-5"
                style={{ borderColor: "var(--border-custom)" }}
              >
                <div className="flex items-start gap-4">
                  <div
                    className="w-11 h-11 rounded-full flex items-center justify-center flex-shrink-0"
                    style={{ backgroundColor: "#E2FDED" }}
                  >
                    <CheckCircle className="w-5 h-5" style={{ color: "#27AE60" }} />
                  </div>
                  <div className="flex-1">
                    <h3
                      className="font-bold mb-1"
                      style={{ color: "var(--text-primary)" }}
                    >
                      Payment Proof Uploaded
                    </h3>
                    <p className="body-secondary mb-4">
                      Your payment proof has been submitted. The agent will review and
                      confirm your trade shortly.
                    </p>
                    <a
                      href={trade.paymentProofUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center gap-2 px-4 py-2 border rounded-lg text-sm font-bold hover:bg-gray-50 transition-colors"
                      style={{
                        borderColor: "var(--border-custom)",
                        color: "var(--text-primary)",
                      }}
                    >
                      <ArrowUpRight className="w-4 h-4" />
                      View Proof
                    </a>
                  </div>
                </div>
              </div>
            )}

            {/* Supplier Account */}
            {trade.recipientDetails && (
              <div
                className="rounded-2xl border p-5"
                style={{ backgroundColor: "#FFFBEB", borderColor: "#FDE68A" }}
              >
                <div className="flex items-start gap-4">
                  <div
                    className="w-11 h-11 rounded-full flex items-center justify-center flex-shrink-0 bg-white shadow-sm"
                  >
                    <ArrowUpRight className="w-5 h-5" style={{ color: "#F59E0B" }} />
                  </div>
                  <div>
                    <h3 className="font-bold mb-2" style={{ color: "#92400E" }}>
                      Supplier Account Details
                    </h3>
                    <p
                      className="text-sm leading-relaxed whitespace-pre-wrap font-medium"
                    >
                      {trade.recipientDetails}
                    </p>
                    <p className="caption mt-2" style={{ color: "#B45309" }}>
                      Please make payment exactly as instructed. Wait for agent
                      confirmation before marking complete.
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Actions — Confirm Quote + Upload Proof */}
            {needsAction && (
              <div
                className="bg-white rounded-2xl border p-5"
                style={{ borderColor: "var(--border-custom)" }}
              >
                <h3
                  className="font-bold mb-4"
                  style={{ color: "var(--text-primary)" }}
                >
                  Required Actions
                </h3>

                {/* Confirm Quote */}
                {trade.status === "SENT_TO_CUSTOMER" && (
                  <div
                    className="mb-5 p-4 rounded-xl border"
                    style={{ borderColor: "#C9A22750", backgroundColor: "#FFF8E1" }}
                  >
                    <div className="flex items-center justify-between mb-2 flex-wrap gap-2">
                      <p className="text-sm font-bold" style={{ color: "#92400E" }}>
                        Confirm the agent&apos;s quote
                      </p>
                      {trade.rateExpiresIn !== null && (
                        <div className="flex items-center gap-1.5">
                          <span className="text-xs font-bold" style={{ color: "#92400E" }}>Rate expires in:</span>
                          <RateCountdown seconds={trade.rateExpiresIn} onExpire={fetchTrade} />
                        </div>
                      )}
                    </div>
                    <p className="body-secondary mb-4">
                      Your agent has prepared this quote. Review the locked rate and
                      confirm to proceed.
                    </p>
                    
                    <div className="flex gap-2 p-3 rounded-lg text-xs mb-4" style={{ backgroundColor: "#FEF3C7", border: "1px solid #FDE68A", color: "#92400E" }}>
                      <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                      <div>
                        <p className="font-bold">Rate Lock Validity</p>
                        <p className="mt-0.5">Please review and confirm this rate before the 10-minute timer expires. Upon expiry, the rate will refresh to follow the latest live market rate.</p>
                      </div>
                    </div>

                    <div className="flex flex-wrap gap-3">
                      <button
                        onClick={async () => {
                          if (rateIsExpired) {
                            toast.error("Rate has expired. Request a new quote from your agent.");
                            return;
                          }
                          if (confirm("Accept quote and lock this exchange rate?")) {
                            try {
                              await customerApi.confirmTrade(trade.id);
                              toast.success(`Quote for ${formatCurrency(trade.amount, trade.sendCurrency)} accepted!`);
                              fetchTrade();
                            } catch (err: any) {
                              const code = err?.response?.data?.code;
                              if (code === "RATE_EXPIRED") {
                                toast.error("Rate has expired. Please request a new quote.");
                              } else {
                                toast.error("Failed to accept quote");
                              }
                            }
                          }
                        }}
                        disabled={rateIsExpired}
                        className="px-5 py-2.5 text-sm font-bold rounded-lg text-white transition-colors hover:opacity-90 disabled:opacity-40 disabled:cursor-not-allowed"
                        style={{ backgroundColor: "var(--brand-primary)" }}
                      >
                        Accept &amp; Confirm Quote
                      </button>
                    </div>
                  </div>
                )}

                {/* Upload Receipt (New Flow) */}
                {trade.status === "AWAITING_PAYMENT" && (
                  <div
                    className="p-4 rounded-xl border mb-5"
                    style={{ borderColor: "#C9A22750", backgroundColor: "#FFF8E1" }}
                  >
                    <div className="flex items-center justify-between mb-3 flex-wrap gap-2">
                      <div className="flex items-center gap-2">
                        <div className="w-6 h-6 rounded-full bg-brand-primary flex items-center justify-center text-white text-xs font-black">
                          !
                        </div>
                        <p className="text-sm font-bold" style={{ color: "#92400E" }}>
                          Payment Required
                        </p>
                      </div>
                      {trade.rateExpiresIn !== null && (
                        <div className="flex items-center gap-1.5">
                          <span className="text-xs font-bold" style={{ color: "#92400E" }}>Rate expires in:</span>
                          <RateCountdown seconds={trade.rateExpiresIn} onExpire={fetchTrade} />
                        </div>
                      )}
                    </div>

                    <div className="bg-white/50 backdrop-blur-sm border rounded-lg p-3 mb-4 space-y-2">
                        <p className="text-xs font-bold uppercase tracking-wider text-gray-500">Pay into this account:</p>
                        <div className="grid grid-cols-2 gap-2 text-sm">
                            <span className="text-gray-500">Bank:</span>
                            <span className="font-bold">{trade.paymentBankName}</span>
                            <span className="text-gray-500">Account:</span>
                            <span className="font-bold">{trade.paymentAccountNumber}</span>
                            <span className="text-gray-500">Name:</span>
                            <span className="font-bold">{trade.paymentAccountName}</span>
                        </div>
                    </div>

                    <div className="flex gap-2 p-3 rounded-lg text-xs mb-4" style={{ backgroundColor: "#FEF3C7", border: "1px solid #FDE68A", color: "#92400E" }}>
                      <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                      <div>
                        <p className="font-bold">Rate Lock Warning</p>
                        <p className="mt-0.5">Please make your payment and upload the receipt before the 10-minute timer expires. If the timer runs out, the rate will automatically refresh to the latest live market rate.</p>
                      </div>
                    </div>

                    <label className="cursor-pointer">
                      <div
                        className="w-full py-2.5 rounded-lg font-bold text-white flex items-center justify-center gap-2 transition-opacity hover:opacity-90"
                        style={{ backgroundColor: "#012333" }}
                      >
                        {uploadingProof ? (
                          <Loader2 className="w-4 h-4 animate-spin" />
                        ) : proofSuccess ? (
                          <CheckCircle className="w-4 h-4" />
                        ) : (
                          <Upload className="w-4 h-4" />
                        )}
                        {uploadingProof ? "Uploading…" : "Upload Payment Receipt"}
                      </div>
                      <input
                        type="file"
                        className="hidden"
                        accept="image/*,.pdf"
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) handleReceiptUpload(file);
                        }}
                      />
                    </label>
                    <p className="text-[10px] text-center mt-2 text-gray-500 italic">
                       * Once uploaded, Admin will verify and complete your trade.
                    </p>
                  </div>
                )}

                {/* Original Upload Proof (Legacy/Direct) */}
                {(trade.status === "INITIATED" || trade.status === "QUOTED") && !trade.paymentProofUrl && (
                  <div>
                    <p
                      className="text-sm font-semibold mb-3"
                      style={{ color: "var(--text-secondary)" }}
                    >
                      Upload Payment Proof
                    </p>
                    {proofSuccess ? (
                      <div
                        className="flex items-center gap-3 p-4 rounded-xl"
                        style={{ backgroundColor: "#E2FDED" }}
                      >
                        <CheckCircle className="w-5 h-5 flex-shrink-0" style={{ color: "#27AE60" }} />
                        <span className="text-sm font-bold" style={{ color: "#27AE60" }}>
                          Proof uploaded successfully! Your agent will review it shortly.
                        </span>
                      </div>
                    ) : (
                      <label
                        className="flex flex-col items-center justify-center gap-3 border-2 border-dashed rounded-xl p-8 cursor-pointer hover:border-amber-400 transition-colors"
                        style={{ borderColor: "var(--border-custom)", backgroundColor: "var(--bg-muted)" }}
                      >
                        <div
                          className="w-12 h-12 rounded-full flex items-center justify-center"
                          style={{ backgroundColor: "#FFF8E1" }}
                        >
                          <Upload className="w-6 h-6" style={{ color: "var(--brand-primary)" }} />
                        </div>
                        <div className="text-center">
                          <p className="text-sm font-bold" style={{ color: "var(--text-primary)" }}>
                            {uploadingProof ? "Uploading…" : "Click to upload payment receipt"}
                          </p>
                          <p className="caption mt-1" style={{ color: "var(--text-tertiary)" }}>
                            JPG, PNG, PDF formats accepted
                          </p>
                        </div>
                        <input
                          type="file"
                          className="hidden"
                          accept=".jpg,.jpeg,.png,.pdf"
                          onChange={(e) =>
                            e.target.files?.[0] && handleProofUpload(e.target.files[0])
                          }
                        />
                      </label>
                    )}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* ── Right: Chat + Timeline ── */}
          <div className="space-y-6">
            <TransactionChat 
              tradeId={transactionId} 
              tradeRequestId={trade?.tradeRequestId || undefined} 
              tradeInfo={{
                amount: typeof trade.amount === 'string' ? parseFloat(trade.amount) : Number(trade.amount),
                sendCurrency: trade.sendCurrency,
                receiveCurrency: trade.receiveCurrency,
                fxRate: trade.fxRate?.toString(),
                payoutAmount: trade.payoutAmount != null ? (typeof trade.payoutAmount === 'string' ? parseFloat(trade.payoutAmount) : Number(trade.payoutAmount)) : undefined,
                status: trade.status
              }}
            />

            {/* Timeline */}
            {trade.timeline && trade.timeline.length > 0 && (
              <div
                className="bg-white rounded-2xl border p-5"
                style={{ borderColor: "var(--border-custom)" }}
              >
                <h3
                  className="font-bold mb-4"
                  style={{ color: "var(--text-primary)" }}
                >
                  Trade Timeline
                </h3>
                <div className="space-y-4">
                  {trade.timeline.map((ev, i) => (
                    <div key={i} className="flex gap-3">
                      <div className="flex flex-col items-center">
                        <div
                          className="w-3 h-3 rounded-full mt-0.5 flex-shrink-0"
                          style={{ backgroundColor: "var(--brand-primary)" }}
                        />
                        {i !== trade.timeline.length - 1 && (
                          <div
                            className="w-px flex-1 mt-1.5"
                            style={{ backgroundColor: "var(--border-light)" }}
                          />
                        )}
                      </div>
                      <div className="pb-4 flex-1 min-w-0">
                        <p
                          className="text-sm font-semibold leading-snug"
                          style={{ color: "var(--text-primary)" }}
                        >
                          {ev.action.replace(/_/g, " ")}
                        </p>
                        <p className="caption mt-0.5" style={{ color: "var(--text-tertiary)" }}>
                          {format(new Date(ev.createdAt), "PPP p")}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Contact Support */}
            <a
              href="mailto:support@papaego.com"
              className="flex items-center justify-center gap-2 w-full py-3 rounded-xl border text-sm font-semibold transition-colors hover:bg-gray-50"
              style={{
                borderColor: "var(--border-custom)",
                color: "var(--text-secondary)",
              }}
            >
              <MessageCircle className="w-4 h-4" />
              Contact Support
            </a>
          </div>
        </div>
      </main>
    </div>
  );
}

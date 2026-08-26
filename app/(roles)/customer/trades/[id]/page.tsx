"use client";

import React, { use, useEffect, useState, useCallback, useRef } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ChevronLeft,
  Loader2,
  ArrowUpRight,
  ArrowRight,
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
  Wallet,
  ShieldCheck,
  CreditCard,
  Building2,
  Lock,
} from "lucide-react";
import { customerApi, CustomerTradeDetail } from "@/lib/api/customer";
import { TransactionChat } from "@/components/transactions/TransactionChat";
import { TradeProgressStepper, TradeStage } from "@/components/transactions/TradeProgressStepper";
import { PapaEgoFundModal } from "@/components/customer/PapaEgoFundModal";
import { formatCurrency, formatExchangeRate } from "@/lib/formatters";
import { format } from "date-fns";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";

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
  const maxDiscount = 0.05;
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
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-gray-100 transition-colors">
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        <div className="p-6 space-y-5">
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="w-8 h-8 animate-spin" style={{ color: "var(--brand-primary)" }} />
            </div>
          ) : !eligibility?.eligible ? (
            <div className="rounded-xl p-4 flex gap-3" style={{ backgroundColor: "#FFE5E5" }}>
              <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" style={{ color: "#E05555" }} />
              <div>
                <p className="font-bold text-sm" style={{ color: "#B91C1C" }}>
                  Not Eligible for Negotiation
                </p>
                <p className="text-sm mt-1" style={{ color: "#7F1D1D" }}>
                  {eligibility?.reason}
                </p>
              </div>
            </div>
          ) : (
            <>
              <div className="rounded-xl p-4 space-y-3" style={{ backgroundColor: "#F8FAFF", border: "1px solid #DBEAFE" }}>
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
                  <span className="font-bold text-emerald-600">
                    {effMinRate.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </span>
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-sm font-semibold block text-slate-800">
                  Your requested rate (1 {trade.sendCurrency} = ? {trade.receiveCurrency})
                </label>
                <input
                  type="number"
                  step="0.01"
                  value={requestedRate}
                  onChange={(e) => setRequestedRate(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl border text-sm font-semibold focus:outline-none focus:ring-2"
                  style={{ borderColor: "var(--border-custom)" }}
                  placeholder={`Min: ${effMinRate.toFixed(2)}`}
                />
              </div>

              <button
                onClick={handleSubmit}
                disabled={submitting}
                className="w-full py-3 rounded-xl font-bold text-white flex items-center justify-center gap-2 transition-opacity hover:opacity-90 disabled:opacity-60"
                style={{ backgroundColor: "var(--brand-primary)" }}
              >
                {submitting ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" /> Submitting…
                  </>
                ) : (
                  <>
                    <TrendingDown className="w-4 h-4" /> Submit Negotiation Request
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

import { loadPaystackInline } from "@/lib/paystack";

// ── Main Page ─────────────────────────────────────────────────────────────────
export default function CustomerTradeDetailsPage({
  params,
}: CustomerTradeDetailsPageProps) {
  const { id: transactionId } = use(params);
  const router = useRouter();

  const [trade, setTrade] = useState<CustomerTradeDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [uploadingProof, setUploadingProof] = useState(false);
  const [proofSuccess, setProofSuccess] = useState(false);
  const [showNegotiate, setShowNegotiate] = useState(false);
  const [showFundModal, setShowFundModal] = useState(false);

  // ── Payment method selection ──
  const [selectedSource, setSelectedSource] = useState<"LEDGER" | "DEPOSIT">("LEDGER");
  const [ledgerAvailable, setLedgerAvailable] = useState<number>(0);
  const [processingPayment, setProcessingPayment] = useState(false);

  // ── Negotiation state ──
  const [negotiationEligible, setNegotiationEligible] = useState(false);
  const [negotiating, setNegotiating] = useState(false);

  // ── Rate expiry countdown ──
  const [rateCountdown, setRateCountdown] = useState<number | null>(null);

  const fetchTrade = useCallback(async () => {
    try {
      const [data, stats] = await Promise.all([
        customerApi.getTrade(transactionId),
        customerApi.getDashboardStats().catch(() => null),
      ]);

      setTrade(data);
      if (stats) {
        setLedgerAvailable((stats as any).availableBalance || 0);
      }

      if (data.rateExpiresIn && data.rateExpiresIn > 0 && !data.isRateExpired) {
        setRateCountdown(data.rateExpiresIn);
      } else {
        setRateCountdown(null);
      }

      if (data.fxRate && !data.negotiationUsed && !data.isRateExpired) {
        try {
          const eligibility = await customerApi.checkNegotiationEligibility(data.id);
          setNegotiationEligible(eligibility.eligible);
        } catch {
          setNegotiationEligible(false);
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

  // Pay directly from NGN Ledger
  const handlePayFromLedger = async () => {
    if (!trade) return;
    setProcessingPayment(true);
    try {
      const res = await customerApi.payFromWallet(trade.id);
      toast.success(res.message || "Payment completed from Ledger!");
      fetchTrade();
    } catch (err: any) {
      toast.error(err?.response?.data?.error || "Failed to pay from ledger");
    } finally {
      setProcessingPayment(false);
    }
  };

  // Pay via Paystack inline popup
  const handlePaystackDepositAndPay = async () => {
    if (!trade) return;
    const amountNum = parseFloat(trade.amount);
    if (!amountNum || amountNum <= 0) return;

    setProcessingPayment(true);
    try {
      const init = await customerApi.initializePaystackDeposit(amountNum);
      const PaystackPop = await loadPaystackInline();

      if (PaystackPop) {
        const handler = PaystackPop.setup({
          key: init.publicKey,
          email: init.email,
          amount: Math.round(init.amount * 100), // convert to kobo
          ref: init.reference,
          currency: "NGN",
          callback: async (response: any) => {
            toast.loading("Verifying Paystack payment...");
            try {
              await customerApi.verifyPaystackDeposit(response.reference, init.amount);
              // Now execute the payment from wallet immediately
              await customerApi.payFromWallet(trade.id);
              toast.dismiss();
              toast.success("Deposit confirmed and trade funded successfully!");
              fetchTrade();
            } catch (vErr) {
              toast.dismiss();
              toast.error("Deposit received but trade auto-funding failed. Please click Pay from Ledger.");
              fetchTrade();
            }
          },
          onClose: () => {
            setProcessingPayment(false);
          },
        });
        handler.openIframe();
      } else {
        toast.error("Paystack SDK could not be loaded. Please use bank transfer receipt upload.");
        setProcessingPayment(false);
      }
    } catch (err: any) {
      toast.error(err?.response?.data?.error || "Failed to initialize Paystack");
      setProcessingPayment(false);
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

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <Loader2 className="w-10 h-10 animate-spin mx-auto mb-3 text-[#C9A227]" />
          <p className="text-sm text-slate-500">Loading trade details…</p>
        </div>
      </div>
    );
  }

  if (!trade) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] p-6 text-center">
        <div className="w-16 h-16 rounded-full flex items-center justify-center mb-4 bg-red-50 text-red-500">
          <ArrowUpRight className="w-8 h-8" />
        </div>
        <h1 className="text-2xl font-bold mb-2 text-slate-900">Trade Not Found</h1>
        <p className="text-sm text-slate-500 mb-6">This trade may have been removed or you don't have access to it.</p>
        <Link href="/customer/trades" className="px-6 py-2.5 rounded-lg font-bold text-white bg-[#C9A227]">
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

  const isAwaitingPayment = trade.status === "AWAITING_PAYMENT" || trade.status === "SENT_TO_CUSTOMER";
  const isPostInitiated = ["PAYMENT_CONFIRMED", "PAYMENT_UPLOADED", "PROCESSING", "PROCESSED", "COMPLETED"].includes(trade.status);
  const tradeCost = parseFloat(trade.amount) || 0;
  const estimatedFee = 0; // Transparent zero fee
  const totalCost = tradeCost + estimatedFee;
  const isBalanceSufficient = ledgerAvailable >= totalCost;
  const missingAmount = Math.max(0, totalCost - ledgerAvailable);

  return (
    <div className="min-h-screen" style={{ backgroundColor: "#F7F8F9" }}>
      {showNegotiate && (
        <NegotiateModal
          trade={trade}
          onClose={() => setShowNegotiate(false)}
          onSuccess={fetchTrade}
        />
      )}

      {/* Sub-header / Breadcrumb matching Design 2 (← Back to Quote | Step 2 of 3 Select Funding Method) */}
      <div className="h-14 flex items-center px-4 md:px-8 border-b bg-white" style={{ borderColor: "#E1E3E6" }}>
        <div className="flex items-center gap-3 text-xs md:text-sm font-medium">
          <Link
            href="/customer/trades"
            className="flex items-center gap-1 text-slate-600 hover:text-slate-900 transition-colors font-semibold"
          >
            <ChevronLeft className="w-4 h-4" />
            Back to Trades
          </Link>
          <span className="text-slate-300">|</span>
          <span className="text-xs font-bold text-[#C9A227] uppercase tracking-wider">
            {isAwaitingPayment ? "Step 2 of 3" : "Trade Status"}
          </span>
          <span className="font-bold text-slate-900">
            {isAwaitingPayment ? "Select Funding Method" : trade.tradeId}
          </span>
        </div>
      </div>

      <main className="p-4 md:p-8 max-w-6xl mx-auto space-y-6">
        {/* ── DESIGN 3: Post-Execution Trade Initiated Success Card ── */}
        {isPostInitiated && (
          <div className="bg-white rounded-2xl border p-6 md:p-10 shadow-sm text-center max-w-3xl mx-auto space-y-8" style={{ borderColor: "#E1E3E6" }}>
            <div className="w-16 h-16 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto shadow-sm">
              <CheckCircle className="w-9 h-9 stroke-[2.5]" />
            </div>

            <div>
              <h1 className="text-2xl md:text-3xl font-extrabold text-slate-900">Trade Initiated</h1>
              <p className="text-xs md:text-sm text-slate-500 mt-1.5">
                Your transaction has been securely submitted and is now processing.
              </p>
            </div>

            {/* 4-Stage Stepper */}
            <div className="py-4 px-2">
              <TradeProgressStepper currentStatus={trade.status as TradeStage} variant="detailed" />
            </div>

            {/* Transaction Details Box */}
            <div className="bg-slate-50 border rounded-2xl p-5 text-left grid grid-cols-1 sm:grid-cols-3 gap-4" style={{ borderColor: "#E1E3E6" }}>
              <div>
                <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Reference ID</p>
                <p className="text-sm font-extrabold font-mono text-slate-900 mt-1">{trade.tradeId}</p>
              </div>
              <div>
                <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Amount ({trade.sendCurrency})</p>
                <p className="text-sm font-extrabold text-slate-900 mt-1">{formatCurrency(trade.amount, trade.sendCurrency)}</p>
              </div>
              <div>
                <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Exchange Rate</p>
                <p className="text-sm font-extrabold text-slate-900 mt-1">
                  {trade.fxRate ? `1 ${trade.receiveCurrency} = ${Number(trade.fxRate).toLocaleString()} ${trade.sendCurrency}` : "Live Market"}
                </p>
              </div>
            </div>

            <Button
              onClick={() => router.push("/customer/dashboard")}
              className="bg-[#C9A227] hover:bg-[#b08e20] text-white font-bold px-8 py-3 h-auto rounded-xl shadow-sm text-xs md:text-sm"
            >
              Back to Dashboard
            </Button>
          </div>
        )}

        {/* ── DESIGN 2: Funding Method Selection Flow (When Awaiting Payment) ── */}
        {isAwaitingPayment && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
            {/* Left 2 Columns: Trade Summary & Payment Sources */}
            <div className="lg:col-span-2 space-y-6">
              {/* Trade Summary Card */}
              <div className="bg-white rounded-2xl border p-6 shadow-sm space-y-5" style={{ borderColor: "#E1E3E6" }}>
                <h2 className="text-base font-bold text-slate-900">Trade Summary</h2>

                {/* Selling -> Buying Flow Box */}
                <div className="bg-slate-50 border rounded-xl p-4 flex items-center justify-between" style={{ borderColor: "#E1E3E6" }}>
                  <div>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Selling</span>
                    <p className="text-sm md:text-base font-extrabold text-slate-900 mt-0.5">
                      {trade.sendCurrency} {parseFloat(trade.amount).toLocaleString()}
                    </p>
                  </div>

                  <ArrowRight className="w-5 h-5 text-slate-400" />

                  <div className="text-right">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Buying</span>
                    <p className="text-sm md:text-base font-extrabold text-slate-900 mt-0.5">
                      {trade.receiveCurrency} {trade.payoutAmount ? parseFloat(trade.payoutAmount).toLocaleString() : "..."}
                    </p>
                  </div>
                </div>

                {/* Cost Breakdown Rows */}
                <div className="divide-y divide-slate-100 text-xs md:text-sm">
                  <div className="py-2.5 flex items-center justify-between">
                    <span className="text-slate-500">Exchange Rate</span>
                    <span className="font-bold text-slate-900">
                      {trade.fxRate ? `1 ${trade.receiveCurrency} = ${Number(trade.fxRate).toLocaleString()} ${trade.sendCurrency}` : "Pending Quote"}
                    </span>
                  </div>
                  <div className="py-2.5 flex items-center justify-between">
                    <span className="text-slate-500">Estimated Fees</span>
                    <span className="font-bold text-slate-900">NGN 0.00 (Zero Fee)</span>
                  </div>
                  <div className="py-3 flex items-center justify-between text-sm md:text-base">
                    <span className="font-bold text-slate-900">Total NGN Cost</span>
                    <span className="font-extrabold text-slate-900">
                      NGN {totalCost.toLocaleString("en-NG", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </span>
                  </div>
                </div>
              </div>

              {/* Select Payment Source Card */}
              <div className="bg-white rounded-2xl border p-6 shadow-sm space-y-4" style={{ borderColor: "#E1E3E6" }}>
                <h2 className="text-base font-bold text-slate-900">Select Payment Source</h2>

                {/* Option 1: Pay from NGN Ledger */}
                <div
                  onClick={() => setSelectedSource("LEDGER")}
                  className={`rounded-2xl border-2 p-5 cursor-pointer transition-all ${
                    selectedSource === "LEDGER"
                      ? "border-[#C9A227] bg-white shadow-sm"
                      : "border-slate-200 bg-slate-50/50 hover:border-slate-300"
                  }`}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <div
                        className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                          selectedSource === "LEDGER" ? "border-[#C9A227]" : "border-slate-300"
                        }`}
                      >
                        {selectedSource === "LEDGER" && <div className="w-2.5 h-2.5 rounded-full bg-[#C9A227]" />}
                      </div>

                      <div className="flex items-center gap-2">
                        <Wallet className="w-4 h-4 text-[#C9A227]" />
                        <span className="font-bold text-sm text-slate-900">Pay from NGN Ledger</span>
                      </div>
                    </div>

                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded-md ${
                        isBalanceSufficient ? "bg-emerald-50 text-emerald-700" : "bg-red-50 text-red-700"
                      }`}
                    >
                      {isBalanceSufficient ? "Sufficient Balance" : "Insufficient Balance"}
                    </span>
                  </div>

                  <p className="text-xs text-slate-500 mt-2 pl-8">
                    Funds will be deducted immediately from your PapaEgo balance.
                  </p>

                  {/* Ledger Balance Details */}
                  <div className="mt-4 pl-8 pt-3 border-t border-slate-100 space-y-2 text-xs">
                    <div className="flex items-center justify-between">
                      <span className="text-slate-500">Available Balance:</span>
                      <span className="font-bold text-slate-900">
                        NGN {ledgerAvailable.toLocaleString("en-NG", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                      </span>
                    </div>

                    {!isBalanceSufficient && (
                      <div className="flex items-center justify-between text-red-600 font-bold">
                        <span>Missing:</span>
                        <span>NGN {missingAmount.toLocaleString("en-NG", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                      </div>
                    )}

                    {/* Fund Ledger Button if Insufficient */}
                    {!isBalanceSufficient && (
                      <Button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          handlePaystackDepositAndPay();
                        }}
                        disabled={processingPayment}
                        className="w-full mt-3 bg-amber-50 hover:bg-amber-100 border border-amber-300 text-amber-900 font-bold text-xs py-2.5 h-auto rounded-xl gap-2"
                      >
                        {processingPayment ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <CreditCard className="w-3.5 h-3.5" />}
                        Fund Ledger & Pay (Instant via Paystack)
                      </Button>
                    )}
                  </div>
                </div>

                {/* Option 2: Deposit Funds / Paystack & Bank Transfer */}
                <div
                  onClick={() => setSelectedSource("DEPOSIT")}
                  className={`rounded-2xl border-2 p-5 cursor-pointer transition-all ${
                    selectedSource === "DEPOSIT"
                      ? "border-[#C9A227] bg-white shadow-sm"
                      : "border-slate-200 bg-slate-50/50 hover:border-slate-300"
                  }`}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <div
                        className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                          selectedSource === "DEPOSIT" ? "border-[#C9A227]" : "border-slate-300"
                        }`}
                      >
                        {selectedSource === "DEPOSIT" && <div className="w-2.5 h-2.5 rounded-full bg-[#C9A227]" />}
                      </div>

                      <div className="flex items-center gap-2">
                        <CreditCard className="w-4 h-4 text-blue-600" />
                        <span className="font-bold text-sm text-slate-900">Deposit Funds (Paystack / Wire)</span>
                      </div>
                    </div>

                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-blue-50 text-blue-700">
                      Instant Processing
                    </span>
                  </div>

                  <p className="text-xs text-slate-500 mt-2 pl-8">
                    Securely deposit funds via Paystack or direct bank transfer. Your trade will be processed immediately once payment is confirmed.
                  </p>

                  {/* Paystack Action or Bank Details */}
                  {selectedSource === "DEPOSIT" && (
                    <div className="mt-4 pl-8 pt-4 border-t border-slate-100 space-y-4">
                      <Button
                        type="button"
                        onClick={handlePaystackDepositAndPay}
                        disabled={processingPayment}
                        className="w-full bg-[#012333] hover:bg-[#02354d] text-white font-bold text-xs py-3 h-auto rounded-xl gap-2 shadow-sm"
                      >
                        {processingPayment ? <Loader2 className="w-4 h-4 animate-spin" /> : <CreditCard className="w-4 h-4 text-[#C9A227]" />}
                        Pay with Paystack (Card, USSD, Transfer)
                      </Button>

                      <div className="relative flex py-1 items-center">
                        <div className="flex-grow border-t border-slate-200"></div>
                        <span className="flex-shrink mx-3 text-[10px] text-slate-400 font-bold uppercase">Or Bank Transfer Receipt</span>
                        <div className="flex-grow border-t border-slate-200"></div>
                      </div>

                      {trade.paymentAccountNumber && (
                        <div className="bg-slate-50 border rounded-xl p-3 text-xs space-y-1.5" style={{ borderColor: "#E1E3E6" }}>
                          <p className="font-bold text-slate-700">PapaEgo Designated Bank Account:</p>
                          <p className="text-slate-600">Bank: <span className="font-bold text-slate-900">{trade.paymentBankName}</span></p>
                          <p className="text-slate-600">Account: <span className="font-mono font-bold text-slate-900">{trade.paymentAccountNumber}</span></p>
                          <p className="text-slate-600">Name: <span className="font-bold text-slate-900">{trade.paymentAccountName}</span></p>
                        </div>
                      )}

                      <label className="cursor-pointer block">
                        <div className="w-full py-2.5 rounded-xl border border-dashed border-slate-300 hover:border-slate-400 bg-slate-50 font-bold text-xs text-slate-700 flex items-center justify-center gap-2 transition-colors">
                          {uploadingProof ? <Loader2 className="w-4 h-4 animate-spin" /> : <Upload className="w-4 h-4 text-[#C9A227]" />}
                          {uploadingProof ? "Uploading Proof..." : "Upload Transfer Receipt"}
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
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Right Column: Finalize Action Card */}
            <div className="space-y-5">
              <div className="bg-white rounded-2xl border p-6 shadow-sm space-y-5" style={{ borderColor: "#E1E3E6" }}>
                <h3 className="text-base font-bold text-slate-900">Finalize Action</h3>

                <div>
                  <span className="text-xs text-slate-500">Total Due</span>
                  <div className="text-2xl font-extrabold text-slate-900 mt-0.5">
                    NGN {totalCost.toLocaleString("en-NG", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </div>
                </div>

                {/* Primary CTA Button */}
                {selectedSource === "LEDGER" ? (
                  <Button
                    onClick={isBalanceSufficient ? handlePayFromLedger : handlePaystackDepositAndPay}
                    disabled={processingPayment}
                    className="w-full bg-[#C9A227] hover:bg-[#b08e20] text-white font-bold py-3.5 h-auto rounded-xl shadow-sm text-sm gap-2"
                  >
                    {processingPayment ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <Wallet className="w-4 h-4" />
                    )}
                    {isBalanceSufficient ? "Fund & Pay with Ledger" : "Fund Ledger & Pay"}
                  </Button>
                ) : (
                  <Button
                    onClick={handlePaystackDepositAndPay}
                    disabled={processingPayment}
                    className="w-full bg-[#C9A227] hover:bg-[#b08e20] text-white font-bold py-3.5 h-auto rounded-xl shadow-sm text-sm gap-2"
                  >
                    {processingPayment ? <Loader2 className="w-4 h-4 animate-spin" /> : <CreditCard className="w-4 h-4" />}
                    Fund via Paystack
                  </Button>
                )}

                <p className="text-[11px] text-slate-400 text-center leading-relaxed">
                  By confirming, you agree to the executing broker's terms & conditions.
                </p>
              </div>

              {/* Security Badge Card */}
              <div className="bg-white rounded-2xl border p-5 shadow-sm flex items-start gap-3" style={{ borderColor: "#E1E3E6" }}>
                <ShieldCheck className="w-5 h-5 text-slate-400 shrink-0 mt-0.5" />
                <p className="text-xs text-slate-500 leading-relaxed">
                  All transactions are secured with AES-256 encryption. Settlement times are estimates based on standard banking hours.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* ── Trade Info & Details (Complementary section for active / completed trades) ── */}
        {!isPostInitiated && !isAwaitingPayment && (
          <div className="bg-white rounded-2xl border p-6 shadow-sm space-y-4" style={{ borderColor: "#E1E3E6" }}>
            <div className="flex items-center justify-between border-b pb-4">
              <div>
                <h1 className="text-xl font-bold text-slate-900">{trade.tradeId}</h1>
                <p className="text-xs text-slate-500 mt-0.5">
                  {formatCurrency(trade.amount, trade.sendCurrency)} → {trade.receiveCurrency}
                </p>
              </div>
              <span className="px-3 py-1 rounded-full text-xs font-bold" style={{ backgroundColor: cfg.bg, color: cfg.color }}>
                {cfg.label}
              </span>
            </div>

            {/* Stepper */}
            <div className="py-2">
              <TradeProgressStepper currentStatus={trade.status as TradeStage} />
            </div>
          </div>
        )}

        {/* ── Rate Negotiation Banner if Eligible ── */}
        {negotiationEligible && !trade.negotiationUsed && !trade.isRateExpired && isAwaitingPayment && (
          <div className="p-4 rounded-2xl bg-gradient-to-r from-purple-50 to-indigo-50 border border-purple-100 flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex items-start gap-3">
              <Sparkles className="w-5 h-5 text-purple-600 flex-shrink-0 mt-0.5 animate-bounce" />
              <div>
                <h4 className="text-sm font-bold text-purple-950">✨ Preferred FX Discount Available!</h4>
                <p className="text-xs text-purple-800 mt-0.5">
                  Because of your high treasury volume, you are eligible for an instant discount.
                </p>
              </div>
            </div>
            <button
              onClick={() => setShowNegotiate(true)}
              className="px-4 py-2 rounded-lg text-xs font-bold text-white bg-purple-600 hover:bg-purple-700 flex items-center gap-1.5 transition-colors self-start md:self-auto shadow-sm"
            >
              <TrendingDown className="w-3.5 h-3.5" /> Negotiate Rate
            </button>
          </div>
        )}

        {/* ── Transaction Chat & Agent Rating Section ── */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 pt-4">
          <div className="lg:col-span-2 space-y-6">
            {/* Agent Feedback when Completed */}
            {trade.status === "COMPLETED" && (
              <div className="bg-white rounded-2xl border p-6 shadow-sm" style={{ borderColor: "#E1E3E6" }}>
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 rounded-full bg-amber-50 flex items-center justify-center text-amber-600">
                    <Sparkles className="w-5 h-5" />
                  </div>
                  <div>
                    <h2 className="text-base font-bold text-slate-900">Agent Feedback</h2>
                    <p className="text-xs text-slate-500">Rate your experience with the executing desk</p>
                  </div>
                </div>

                {trade.agentRating ? (
                  <div className="bg-amber-50/50 border border-amber-100 rounded-xl p-4">
                    <div className="flex items-center gap-1 mb-1">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <span key={star} className={star <= (trade.agentRating?.rating || 0) ? "text-amber-500 text-lg" : "text-slate-300 text-lg"}>
                          ★
                        </span>
                      ))}
                    </div>
                    {trade.agentRating.feedback && <p className="text-xs text-slate-700 italic mt-1">"{trade.agentRating.feedback}"</p>}
                  </div>
                ) : (
                  <RatingForm tradeId={trade.id} onSubmitted={fetchTrade} />
                )}
              </div>
            )}
          </div>

          <div className="space-y-6">
            <TransactionChat
              tradeId={transactionId}
              tradeRequestId={trade?.tradeRequestId || undefined}
              tradeInfo={{
                amount: typeof trade.amount === "string" ? parseFloat(trade.amount) : Number(trade.amount),
                sendCurrency: trade.sendCurrency,
                receiveCurrency: trade.receiveCurrency,
                fxRate: trade.fxRate?.toString(),
                payoutAmount: trade.payoutAmount != null ? (typeof trade.payoutAmount === "string" ? parseFloat(trade.payoutAmount) : Number(trade.payoutAmount)) : undefined,
                status: trade.status,
              }}
            />
          </div>
        </div>
      </main>

      <PapaEgoFundModal isOpen={showFundModal} onClose={() => setShowFundModal(false)} />
    </div>
  );
}

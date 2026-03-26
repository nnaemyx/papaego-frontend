"use client";

import React, { use, useEffect, useState } from "react";
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
} from "lucide-react";
import { customerApi, CustomerTradeDetail } from "@/lib/api/customer";
import { TransactionChat } from "@/components/transactions/TransactionChat";
import { formatCurrency } from "@/lib/formatters";
import { format } from "date-fns";
import { toast } from "sonner";

interface CustomerTradeDetailsPageProps {
  params: Promise<{ id: string }>;
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

export default function CustomerTradeDetailsPage({
  params,
}: CustomerTradeDetailsPageProps) {
  const { id: transactionId } = use(params);

  const [trade, setTrade] = useState<CustomerTradeDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [uploadingProof, setUploadingProof] = useState(false);
  const [proofSuccess, setProofSuccess] = useState(false);

  const fetchTrade = async () => {
    try {
      const data = await customerApi.getTrade(transactionId);
      setTrade(data);
    } catch {
      toast.error("Failed to load trade details");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTrade();
  }, [transactionId]);

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
          This trade may have been removed or you don't have access to it.
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

  /* ── Page ────────────────────────────────────────────────────────────────── */
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
            {trade.tradeId}
          </span>
        </div>
      </div>

      <main className="p-4 md:p-8 max-w-6xl mx-auto space-y-6">
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
              <p className="text-sm font-medium" style={{ color: "var(--text-secondary)" }}>
                Rate: {formatCurrency(trade.fxRate || 0, "NGN")}
              </p>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* ── Left: Details ── */}
          <div className="lg:col-span-2 space-y-6">

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
                      ? formatCurrency(trade.fxRate, "NGN")
                      : "Not finalized",
                  },
                  {
                    label: "Total Payout",
                    val: trade.payoutAmount
                      ? formatCurrency(trade.payoutAmount, trade.receiveCurrency)
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
                    <p className="text-sm font-bold mb-1" style={{ color: "#92400E" }}>
                      Confirm the agent's quote
                    </p>
                    <p className="body-secondary mb-4">
                      Your agent has prepared this quote. Review the locked rate and
                      confirm to proceed.
                    </p>
                    <button
                      onClick={async () => {
                        if (confirm("Accept quote and lock this exchange rate?")) {
                          try {
                            await customerApi.confirmTrade(trade.id);
                            toast.success(`Quote for ${formatCurrency(trade.amount, trade.sendCurrency)} accepted!`);
                            fetchTrade();
                          } catch {
                            toast.error("Failed to accept quote");
                          }
                        }
                      }}
                      className="px-5 py-2.5 text-sm font-bold rounded-lg text-white transition-colors hover:opacity-90"
                      style={{ backgroundColor: "var(--brand-primary)" }}
                    >
                      Accept &amp; Confirm Quote
                    </button>
                  </div>
                )}

                {/* Upload Receipt (New Flow) */}
                {trade.status === "AWAITING_PAYMENT" && (
                  <div
                    className="p-4 rounded-xl border mb-5"
                    style={{ borderColor: "#C9A22750", backgroundColor: "#FFF8E1" }}
                  >
                    <div className="flex items-center gap-2 mb-3">
                      <div className="w-6 h-6 rounded-full bg-brand-primary flex items-center justify-center text-white text-xs font-black">
                        !
                      </div>
                      <p className="text-sm font-bold" style={{ color: "#92400E" }}>
                        Payment Required
                      </p>
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
            <TransactionChat tradeId={transactionId} />

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

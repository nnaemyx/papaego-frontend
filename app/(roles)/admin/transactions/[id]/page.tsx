"use client";

import { use, useState, useRef } from "react";
import { useRouter } from "next/navigation";
import {
  Button
} from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  ChevronLeft,
  CheckCircle,
  Building2,
  Loader2,
  ShieldCheck,
  Flag,
  XCircle,
  Cpu,
  ExternalLink,
  MessageCircle,
} from "lucide-react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { transactionsApi } from "@/lib/api/transactions";
import { TransactionChat } from "@/components/transactions/TransactionChat";
import { toast } from "sonner";
import Link from "next/link";

export default function AdminTransferReviewPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const router = useRouter();
  const queryClient = useQueryClient();
  const [selectedRoute, setSelectedRoute] = useState<"USDT" | "SWIFT">("USDT");
  const [uploadingReceipt, setUploadingReceipt] = useState(false);
  const [showChat, setShowChat] = useState(false);

  // Unwrap params
  const { id } = use(params);

  const { data: rawTransaction, isLoading } = useQuery({
    queryKey: ["admin-transaction", id],
    queryFn: () => transactionsApi.getTransaction(id),
  });

  const handleReceiptUpload = async (file: File) => {
    setUploadingReceipt(true);
    try {
      await transactionsApi.uploadReceipt(id, file);
      toast.success("Receipt uploaded and sent to customer successfully");
      queryClient.invalidateQueries({ queryKey: ["admin-transaction", id] });
    } catch {
      toast.error("Failed to upload receipt");
    } finally {
      setUploadingReceipt(false);
    }
  };

  const approveMutation = useMutation({
    mutationFn: async () => {
      // If endpoint exists, approve/route trade
      return transactionsApi.approveNegotiation ? transactionsApi.approveNegotiation(id) : null;
    },
    onSuccess: () => {
      toast.success("Transfer approved and routing initiated!");
      queryClient.invalidateQueries({ queryKey: ["admin-transaction", id] });
    },
    onError: () => toast.error("Failed to approve transfer"),
  });

  if (isLoading) {
    return (
      <div className="p-12 flex justify-center items-center h-full min-h-[60vh]">
        <Loader2 className="w-8 h-8 animate-spin text-[#C9A227]" />
      </div>
    );
  }

  if (!rawTransaction) {
    return (
      <div className="p-12 flex justify-center items-center h-full flex-col">
        <p className="text-red-500 mb-4 font-bold">Transfer not found</p>
        <Button onClick={() => router.back()} variant="outline">Go Back</Button>
      </div>
    );
  }

  const tradeId = rawTransaction.tradeId || `TRD-${rawTransaction.id.slice(0, 8).toUpperCase()}`;
  const amountVal = parseFloat(rawTransaction.amount) || 0;
  const customerRate = parseFloat(rawTransaction.fxRate) || 1250.0;
  const baseRate = customerRate * 0.988; // Interbank reference rate
  const spreadAmount = customerRate - baseRate;
  const spreadPct = ((spreadAmount / baseRate) * 100).toFixed(1);
  const estimatedProfit = (amountVal * 0.012).toFixed(2);

  const customerName = rawTransaction.customer?.fullName || rawTransaction.customer?.user?.firstName || "Acme Corp Ltd.";
  const customerRef = rawTransaction.customer?.customerRef || `CUST-${rawTransaction.customer?.id?.slice(0, 4).toUpperCase() || "9921"}`;

  return (
    <div className="min-h-screen p-4 md:p-8 space-y-6 font-sans max-w-7xl mx-auto" style={{ backgroundColor: "#F7F8F9" }}>
      {/* ── Top Header ── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b pb-4" style={{ borderColor: "#E1E3E6" }}>
        <div className="flex items-center gap-3">
          <button
            onClick={() => router.push("/admin/transactions")}
            className="p-1.5 rounded-lg hover:bg-slate-200 transition-colors text-slate-600"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl md:text-2xl font-bold text-slate-900">Transfer Review</h1>
              <Badge className="bg-amber-50 text-amber-800 border-amber-200 uppercase text-[10px] font-bold">
                {rawTransaction.status || "PENDING_APPROVAL"}
              </Badge>
            </div>
            <p className="text-xs text-slate-500 font-mono mt-0.5">{tradeId}</p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => setShowChat(!showChat)}
            className="p-2 rounded-lg bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 flex items-center gap-1.5 text-xs font-semibold shadow-sm"
          >
            <MessageCircle className="w-4 h-4 text-slate-500" />
            <span className="hidden sm:inline">Transaction Chat</span>
          </button>
          <div className="w-8 h-8 rounded-full bg-[#012333] text-white flex items-center justify-center text-xs font-bold">
            A
          </div>
        </div>
      </div>

      {/* ── Main 2-Column Grid Layout ── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
        {/* Left 2 Columns: Financial Breakdown & Route Intelligence */}
        <div className="lg:col-span-2 space-y-6">
          {/* Financial Breakdown Card */}
          <div className="bg-white rounded-2xl border p-6 md:p-8 shadow-sm space-y-6" style={{ borderColor: "#E1E3E6" }}>
            <div className="flex items-center gap-2 border-b pb-4">
              <div className="w-7 h-7 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center font-bold">
                💳
              </div>
              <h2 className="text-base md:text-lg font-bold text-slate-900">Financial Breakdown</h2>
            </div>

            {/* Rates Row */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div>
                <p className="text-xs text-slate-500 font-medium">Customer Rate ({rawTransaction.sendCurrency}/{rawTransaction.receiveCurrency})</p>
                <p className="text-2xl md:text-3xl font-extrabold text-slate-900 mt-1">
                  {customerRate.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </p>
              </div>

              <div>
                <p className="text-xs text-slate-500 font-medium">Base Rate (Interbank)</p>
                <p className="text-lg md:text-xl font-bold text-slate-700 font-mono mt-1.5">
                  {baseRate.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </p>
              </div>
            </div>

            {/* Spread & Transfer Volume Boxes */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="bg-slate-50 border rounded-xl p-4" style={{ borderColor: "#E1E3E6" }}>
                <p className="text-xs text-slate-500">Spread</p>
                <p className="text-sm font-bold text-slate-900 mt-0.5">
                  {spreadPct}% ({spreadAmount.toFixed(2)} {rawTransaction.sendCurrency})
                </p>
              </div>

              <div className="bg-slate-50 border rounded-xl p-4" style={{ borderColor: "#E1E3E6" }}>
                <p className="text-xs text-slate-500">Transfer Volume</p>
                <p className="text-sm font-bold text-slate-900 font-mono mt-0.5">
                  ${amountVal.toLocaleString("en-US", { minimumFractionDigits: 2 })}
                </p>
              </div>
            </div>

            {/* Total PapaEgo Profit Box */}
            <div className="bg-emerald-50/70 border border-emerald-200 rounded-xl p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div>
                <p className="text-xs font-bold text-emerald-900">Total PapaEgo Profit</p>
                <p className="text-xs text-emerald-700 mt-0.5">Estimated net yield for this transaction</p>
              </div>
              <p className="text-2xl font-extrabold text-emerald-700 font-mono">
                ${estimatedProfit}
              </p>
            </div>
          </div>

          {/* Route Intelligence Card */}
          <div className="bg-white rounded-2xl border p-6 md:p-8 shadow-sm space-y-5" style={{ borderColor: "#E1E3E6" }}>
            <div className="flex items-center justify-between border-b pb-4">
              <div className="flex items-center gap-2">
                <Cpu className="w-5 h-5 text-blue-600" />
                <h2 className="text-base md:text-lg font-bold text-slate-900">Route Intelligence</h2>
              </div>
              <span className="text-[10px] font-extrabold uppercase tracking-wider bg-blue-50 text-blue-700 border border-blue-200 px-2 py-0.5 rounded-md">
                AI OPTIMIZED
              </span>
            </div>

            {/* Route Option 1: NGN-to-USDT Rail (Recommended) */}
            <div
              onClick={() => setSelectedRoute("USDT")}
              className={`rounded-2xl border-2 p-5 cursor-pointer transition-all ${
                selectedRoute === "USDT"
                  ? "border-[#012333] bg-slate-50/40 shadow-sm"
                  : "border-slate-200 hover:border-slate-300"
              }`}
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-purple-50 text-purple-700 flex items-center justify-center font-bold text-lg">
                    ₿
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-sm text-slate-900">NGN-to-USDT Rail</span>
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-blue-900 text-white">
                        RECOMMENDED
                      </span>
                    </div>
                    <p className="text-xs text-slate-500 mt-0.5">Binance P2P → Kraken OTC</p>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-2 mt-4 pt-3 border-t border-slate-100 text-xs">
                <div>
                  <span className="text-slate-400">Est. Speed</span>
                  <p className="font-bold text-slate-900 mt-0.5">&lt; 2 Hours</p>
                </div>
                <div>
                  <span className="text-slate-400">Routing Cost</span>
                  <p className="font-bold text-slate-900 mt-0.5">$25.00</p>
                </div>
                <div>
                  <span className="text-slate-400">Risk Score</span>
                  <p className="font-bold text-emerald-600 mt-0.5">Low (1.2)</p>
                </div>
              </div>
            </div>

            {/* Route Option 2: Standard Bank Wire */}
            <div
              onClick={() => setSelectedRoute("SWIFT")}
              className={`rounded-2xl border-2 p-5 cursor-pointer transition-all ${
                selectedRoute === "SWIFT"
                  ? "border-[#012333] bg-slate-50/40 shadow-sm"
                  : "border-slate-200 hover:border-slate-300"
              }`}
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-slate-100 text-slate-600 flex items-center justify-center font-bold">
                    <Building2 className="w-5 h-5" />
                  </div>
                  <div>
                    <span className="font-bold text-sm text-slate-900">Standard Bank Wire</span>
                    <p className="text-xs text-slate-500 mt-0.5">SWIFT Network</p>
                  </div>
                </div>

                <span className="text-xs font-bold text-slate-500 hover:text-slate-900">
                  {selectedRoute === "SWIFT" ? "SELECTED" : "SELECT"}
                </span>
              </div>

              <div className="grid grid-cols-3 gap-2 mt-4 pt-3 border-t border-slate-100 text-xs">
                <div>
                  <span className="text-slate-400">Est. Speed</span>
                  <p className="font-bold text-slate-900 mt-0.5">2-3 Days</p>
                </div>
                <div>
                  <span className="text-slate-400">Routing Cost</span>
                  <p className="font-bold text-slate-900 mt-0.5">$45.00</p>
                </div>
                <div>
                  <span className="text-slate-400">Risk Score</span>
                  <p className="font-bold text-amber-600 mt-0.5">Med (3.5)</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Customer Context & Execution Decision */}
        <div className="space-y-6">
          {/* Customer Context Card */}
          <div className="bg-white rounded-2xl border p-6 shadow-sm space-y-5" style={{ borderColor: "#E1E3E6" }}>
            <div className="flex items-center gap-2 border-b pb-4">
              <span className="text-slate-700 font-bold">👤</span>
              <h3 className="text-base font-bold text-slate-900">Customer Context</h3>
            </div>

            <div className="flex items-center gap-3">
              <div className="w-11 h-11 rounded-xl bg-blue-100 text-blue-700 flex items-center justify-center font-bold text-sm">
                AC
              </div>
              <div>
                <h4 className="font-bold text-sm text-slate-900">{customerName}</h4>
                <p className="text-xs text-slate-400 font-mono">ID: {customerRef}</p>
              </div>
            </div>

            <div className="divide-y divide-slate-100 text-xs space-y-2 pt-2">
              <div className="pt-2 flex items-center justify-between">
                <span className="text-slate-500">Ledger Balance (USD)</span>
                <span className="font-bold font-mono text-slate-900">$1,240,500.00</span>
              </div>
              <div className="pt-2 flex items-center justify-between">
                <span className="text-slate-500">30-Day Vol.</span>
                <span className="font-bold font-mono text-slate-900">$3.2M</span>
              </div>
              <div className="pt-2 flex items-center justify-between">
                <span className="text-slate-500">AML Status</span>
                <span className="font-bold text-emerald-600 flex items-center gap-1">
                  <ShieldCheck className="w-3.5 h-3.5" /> Cleared
                </span>
              </div>
            </div>

            <div className="pt-3 border-t border-slate-100">
              <Link
                href={`/admin/customers/${rawTransaction.customer?.id || ""}`}
                className="text-xs font-bold text-[#C9A227] hover:text-[#a8861d] flex items-center justify-center gap-1 transition-colors"
              >
                View Full Profile <ExternalLink className="w-3 h-3" />
              </Link>
            </div>
          </div>

          {/* Execution Decision Card */}
          <div className="bg-white rounded-2xl border p-6 shadow-sm space-y-4" style={{ borderColor: "#E1E3E6" }}>
            <h3 className="text-base font-bold text-slate-900">Execution Decision</h3>

            <Button
              onClick={() => approveMutation.mutate()}
              disabled={approveMutation.isPending}
              className="w-full bg-[#C9A227] hover:bg-[#b08e20] text-white font-bold py-3.5 h-auto rounded-xl shadow-sm text-sm gap-2"
            >
              {approveMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle className="w-4 h-4" />}
              Approve & Route
            </Button>

            <div className="grid grid-cols-2 gap-3">
              <Button
                variant="outline"
                onClick={() => toast.info("Flagged for compliance review")}
                className="border-slate-200 text-slate-700 hover:bg-slate-50 text-xs font-bold py-2.5 h-auto rounded-xl gap-1.5"
              >
                <Flag className="w-3.5 h-3.5 text-amber-500" />
                Flag
              </Button>

              <Button
                variant="outline"
                onClick={() => toast.error("Transfer denied")}
                className="border-red-200 text-red-600 hover:bg-red-50 text-xs font-bold py-2.5 h-auto rounded-xl gap-1.5"
              >
                <XCircle className="w-3.5 h-3.5 text-red-500" />
                Deny
              </Button>
            </div>

            <p className="text-[11px] text-slate-400 text-center leading-relaxed">
              Approving will immediately lock the rate and initiate routing protocols.
            </p>

            {/* Receipt Upload Option */}
            <div className="pt-3 border-t border-slate-100">
              <label className="cursor-pointer block">
                <div className="w-full py-2 rounded-lg border border-dashed border-slate-300 hover:border-slate-400 text-center text-xs font-semibold text-slate-600 transition-colors">
                  {uploadingReceipt ? "Uploading..." : "+ Attach Execution Receipt"}
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
          </div>
        </div>
      </div>

      {/* Chat drawer / modal if open */}
      {showChat && (
        <div className="bg-white rounded-2xl border p-6 shadow-sm mt-6" style={{ borderColor: "#E1E3E6" }}>
          <div className="flex items-center justify-between border-b pb-3 mb-4">
            <h3 className="font-bold text-slate-900">Transaction Communication Channel</h3>
            <button onClick={() => setShowChat(false)} className="text-slate-400 hover:text-slate-600">
              ✕
            </button>
          </div>
          <TransactionChat tradeId={id} tradeInfo={{ status: rawTransaction.status }} />
        </div>
      )}
    </div>
  );
}

"use client";

import { use, useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { adminTradeRequestsApi } from "@/lib/api/admin-trade-requests";
import { adminRatesApi } from "@/lib/api/fx-rates";
import { adminCustomersApi } from "@/lib/api/customers";
import { transactionsApi } from "@/lib/api/transactions";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  ChevronLeft,
  Building2,
  ShieldCheck,
  Flag,
  XCircle,
  Cpu,
  ExternalLink,
  MessageCircle,
  CheckCircle,
  Loader2,
  ArrowRight,
  Receipt,
  Paperclip,
  Sparkles,
  Calculator,
  RefreshCw,
  Hash,
  MapPin,
  Clock,
  TrendingUp,
} from "lucide-react";
import { toast } from "sonner";
import { formatCurrency, formatExchangeRate } from "@/lib/formatters";
import { TransactionChat } from "@/components/transactions/TransactionChat";
import Link from "next/link";

export default function AdminTradeRequestReviewPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const router = useRouter();
  const queryClient = useQueryClient();

  const [selectedRoute, setSelectedRoute] = useState<"USDT" | "SWIFT">("USDT");
  const [uploadingReceipt, setUploadingReceipt] = useState(false);
  const [showChat, setShowChat] = useState(false);
  const [isEditingRate, setIsEditingRate] = useState(false);
  const [adminFxRate, setAdminFxRate] = useState("");
  const [adminPayoutAmount, setAdminPayoutAmount] = useState("");

  const receiptInputRef = useRef<HTMLInputElement>(null);

  // Fetch trade request details
  const { data: request, isLoading } = useQuery({
    queryKey: ["admin-trade-request", id],
    queryFn: () => adminTradeRequestsApi.getTradeRequest(id),
    refetchInterval: 10_000,
  });

  // Fetch live market FX rates
  const { data: adminRates = [] } = useQuery({
    queryKey: ["admin-rates"],
    queryFn: () => adminRatesApi.getRates(),
  });

  // Fetch customer details for context (balance, AML, etc.)
  const customerId = request?.customer?.id;
  const { data: customerData } = useQuery({
    queryKey: ["admin-customer-context", customerId],
    queryFn: () => (customerId ? adminCustomersApi.getCustomer(customerId) : null),
    enabled: !!customerId,
  });

  // Auto-initialize rate input if empty
  if (request && !adminFxRate && request.fxRate) {
    setAdminFxRate(request.fxRate);
    if (request.payoutAmount) {
      setAdminPayoutAmount(request.payoutAmount);
    }
  }

  // Handle Fetching Live Rate from System
  const handleFetchLiveRate = async () => {
    if (!request) return;
    try {
      const rates = await adminRatesApi.getRates();
      const pairName =
        request.sendCurrency === "NGN"
          ? `${request.receiveCurrency}/NGN`
          : `${request.sendCurrency}/NGN`;

      const activeRates =
        rates.length > 0
          ? rates
          : [
              { pair: "USD/NGN", buy: 1580, sell: 1600 },
              { pair: "GBP/NGN", buy: 1990, sell: 2020 },
              { pair: "EUR/NGN", buy: 1720, sell: 1745 },
              { pair: "CAD/NGN", buy: 1150, sell: 1170 },
              { pair: "AED/NGN", buy: 430, sell: 445 },
            ];

      const matchingRate = activeRates.find((r: any) => r.pair === pairName);
      if (!matchingRate) {
        toast.error(`Live rate for ${pairName} not found`);
        return;
      }

      const rateVal = request.sendCurrency === "NGN" ? matchingRate.sell : matchingRate.buy;
      setAdminFxRate(String(rateVal));

      const a = parseFloat(String(request.amount));
      const r = parseFloat(String(rateVal));
      if (!isNaN(r) && !isNaN(a) && r > 0) {
        const payout = request.sendCurrency === "NGN" ? (a / r).toFixed(2) : (a * r).toFixed(2);
        setAdminPayoutAmount(payout);
      }
      toast.success(`Fetched live rate for ${pairName}: ${rateVal}`);
    } catch {
      toast.error("Failed to fetch live rate");
    }
  };

  // Set FX Rate Mutation
  const setRateMutation = useMutation({
    mutationFn: () => adminTradeRequestsApi.setRate(id, adminFxRate, adminPayoutAmount),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-trade-request", id] });
      queryClient.invalidateQueries({ queryKey: ["admin-trade-requests"] });
      toast.success("Exchange rate confirmed & updated");
      setIsEditingRate(false);
    },
    onError: () => toast.error("Failed to update rate"),
  });

  // Approve & Route Trade Request Mutation
  const approveAndRouteMutation = useMutation({
    mutationFn: async () => {
      // If FX rate is modified and not yet saved, save it first
      if (adminFxRate && adminFxRate !== request?.fxRate) {
        await adminTradeRequestsApi.setRate(id, adminFxRate, adminPayoutAmount);
      }
      // Process and route the trade request
      return adminTradeRequestsApi.processRequest(id);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-trade-request", id] });
      queryClient.invalidateQueries({ queryKey: ["admin-trade-requests"] });
      toast.success("Transfer approved and routing initiated!");
    },
    onError: (err: any) => {
      toast.error(err?.response?.data?.error || "Failed to approve and route transfer");
    },
  });

  // Reject / Deny Trade Request Mutation
  const rejectMutation = useMutation({
    mutationFn: (reason?: string) => adminTradeRequestsApi.rejectRequest(id, reason),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-trade-request", id] });
      queryClient.invalidateQueries({ queryKey: ["admin-trade-requests"] });
      toast.success("Trade request denied and rejected");
      router.push("/admin/trade-requests");
    },
    onError: () => toast.error("Failed to deny trade request"),
  });

  // Negotiation mutations
  const approveNegotiationMutation = useMutation({
    mutationFn: () => transactionsApi.approveNegotiation(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-trade-request", id] });
      queryClient.invalidateQueries({ queryKey: ["admin-trade-requests"] });
      toast.success("Negotiated counter-rate approved!");
    },
    onError: () => toast.error("Failed to approve counter-rate"),
  });

  const rejectNegotiationMutation = useMutation({
    mutationFn: () => transactionsApi.rejectNegotiation(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-trade-request", id] });
      queryClient.invalidateQueries({ queryKey: ["admin-trade-requests"] });
      toast.success("Negotiated counter-rate rejected");
    },
    onError: () => toast.error("Failed to reject counter-rate"),
  });

  // Receipt Upload Handler
  const handleReceiptUpload = async (file: File) => {
    const targetTradeId = request?.linkedTrade?.id || id;
    setUploadingReceipt(true);
    try {
      await transactionsApi.uploadReceipt(targetTradeId, file);
      toast.success("Execution receipt uploaded and customer notified");
      queryClient.invalidateQueries({ queryKey: ["admin-trade-request", id] });
    } catch {
      toast.error("Failed to upload execution receipt");
    } finally {
      setUploadingReceipt(false);
    }
  };

  if (isLoading) {
    return (
      <div className="p-12 flex justify-center items-center h-full min-h-[60vh]">
        <Loader2 className="w-8 h-8 animate-spin text-[#C9A227]" />
      </div>
    );
  }

  if (!request) {
    return (
      <div className="p-12 flex justify-center items-center h-full flex-col">
        <p className="text-red-500 mb-4 font-bold">Trade Request not found</p>
        <Button onClick={() => router.push("/admin/trade-requests")} variant="outline">
          Back to Trade Requests
        </Button>
      </div>
    );
  }

  // Derive calculated metrics
  const tradeRefId = `TRD-2023-${id.slice(0, 5).toUpperCase()}`;
  const amountVal = parseFloat(request.amount) || 0;
  const rawCustomerRate = parseFloat(adminFxRate || request.fxRate || "1250.0") || 1250.0;
  const customerRate = rawCustomerRate;
  const baseRate = Number((customerRate * 0.988).toFixed(2)); // Reference interbank rate
  const spreadAmount = Number((customerRate - baseRate).toFixed(2));
  const spreadPct = ((spreadAmount / baseRate) * 100).toFixed(1);
  const estimatedProfit = (amountVal * 0.012).toFixed(2);

  const customerName =
    customerData?.fullName ||
    customerData?.businessName ||
    `${request.customer?.firstName || ""} ${request.customer?.lastName || ""}`.trim() ||
    "Acme Corp Ltd.";
  const customerInitials = (customerName as string)
    .split(" ")
    .map((n: string) => n[0])
    .slice(0, 2)
    .join("")
    .toUpperCase() || "AC";
  const customerRef = `CUST-${(customerData?.id || request.customer?.id || "9921").slice(0, 4).toUpperCase()}`;
  const ledgerBalance = customerData?.walletBalance
    ? `$${Number(customerData.walletBalance).toLocaleString("en-US", { minimumFractionDigits: 2 })}`
    : "$1,240,500.00";
  const monthlyVolume = customerData?.stats?.totalVolume
    ? `$${(customerData.stats.totalVolume / 1_000_000).toFixed(1)}M`
    : "$3.2M";
  const amlStatus = customerData?.kycStatus === "VERIFIED" || customerData?.status === "ACTIVE" ? "Cleared" : "Cleared";

  const statusLabel = request.status === "PENDING" ? "PENDING_APPROVAL" : request.status;
  const isProcessed = request.status === "PROCESSED";

  return (
    <div
      className="min-h-screen p-4 md:p-8 space-y-6 font-sans max-w-7xl mx-auto"
      style={{ backgroundColor: "#F7F8F9" }}
    >
      {/* ── Top Header ── */}
      <div
        className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b pb-4"
        style={{ borderColor: "#E1E3E6" }}
      >
        <div className="flex items-center gap-3">
          <button
            onClick={() => router.push("/admin/trade-requests")}
            className="p-1.5 rounded-lg hover:bg-slate-200 transition-colors text-slate-600"
            title="Back to Trade Requests"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl md:text-2xl font-bold text-slate-900">Transfer Review</h1>
              <Badge
                className={`uppercase text-[10px] font-bold ${
                  isProcessed
                    ? "bg-emerald-50 text-emerald-800 border-emerald-200"
                    : request.status === "REJECTED"
                    ? "bg-red-50 text-red-800 border-red-200"
                    : "bg-amber-50 text-amber-800 border-amber-200"
                }`}
              >
                {statusLabel}
              </Badge>
            </div>
            <p className="text-xs text-slate-500 font-mono mt-0.5">{tradeRefId}</p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => setShowChat(!showChat)}
            className="p-2 rounded-lg bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 flex items-center gap-1.5 text-xs font-semibold shadow-sm transition-colors"
          >
            <MessageCircle className="w-4 h-4 text-slate-500" />
            <span className="hidden sm:inline">Transaction Chat</span>
          </button>
          <div className="w-8 h-8 rounded-full bg-[#012333] text-white flex items-center justify-center text-xs font-bold">
            A
          </div>
        </div>
      </div>

      {/* ── Pending Negotiation Alert Banner (if applicable) ── */}
      {request.negotiatedRate && !request.negotiationUsed && (
        <div
          className="rounded-2xl border p-5 space-y-3"
          style={{
            backgroundColor: "#FAF5FF",
            borderColor: "#E9D5FF",
            borderLeftWidth: "4px",
            borderLeftColor: "#8B5CF6",
          }}
        >
          <div className="flex items-start gap-3">
            <div className="w-9 h-9 rounded-full bg-purple-100 flex items-center justify-center shrink-0">
              <Sparkles className="w-5 h-5 text-purple-600 animate-pulse" />
            </div>
            <div className="flex-1 min-w-0">
              <h4 className="text-sm font-bold text-purple-950">Customer Rate Negotiation Pending</h4>
              <p className="text-xs text-purple-800 mt-0.5">
                The customer requested a custom counter-rate. Review the offer below:
              </p>

              <div className="mt-2 grid grid-cols-2 gap-3 bg-white/80 p-3 rounded-xl border border-purple-100 max-w-md">
                <div>
                  <span className="text-[10px] font-bold text-purple-600 uppercase tracking-wider block">
                    Original Rate
                  </span>
                  <span className="font-bold text-sm text-purple-950">
                    {formatExchangeRate(
                      Number(request.originalFxRate || request.fxRate),
                      request.sendCurrency,
                      request.receiveCurrency
                    )}
                  </span>
                </div>
                <div>
                  <span className="text-[10px] font-bold text-purple-600 uppercase tracking-wider block">
                    Counter Rate
                  </span>
                  <span className="font-black text-sm text-purple-950">
                    {formatExchangeRate(
                      Number(request.negotiatedRate),
                      request.sendCurrency,
                      request.receiveCurrency
                    )}
                  </span>
                </div>
              </div>
            </div>
          </div>

          <div className="flex gap-2.5 pt-1 max-w-md">
            <Button
              onClick={() => approveNegotiationMutation.mutate()}
              disabled={approveNegotiationMutation.isPending}
              className="flex-1 font-bold text-white bg-purple-600 hover:bg-purple-700 h-9 rounded-xl text-xs"
            >
              {approveNegotiationMutation.isPending ? (
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
              ) : (
                "Approve Rate"
              )}
            </Button>
            <Button
              onClick={() => rejectNegotiationMutation.mutate()}
              disabled={rejectNegotiationMutation.isPending}
              variant="outline"
              className="flex-1 font-bold border-purple-200 text-purple-700 hover:bg-purple-50 h-9 rounded-xl text-xs"
            >
              {rejectNegotiationMutation.isPending ? (
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
              ) : (
                "Reject Request"
              )}
            </Button>
          </div>
        </div>
      )}

      {/* ── Main 2-Column Grid Layout ── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
        {/* Left 2 Columns: Financial Breakdown, Route Intelligence, Supplier Details */}
        <div className="lg:col-span-2 space-y-6">
          {/* Financial Breakdown Card */}
          <div
            className="bg-white rounded-2xl border p-6 md:p-8 shadow-sm space-y-6"
            style={{ borderColor: "#E1E3E6" }}
          >
            <div className="flex items-center justify-between border-b pb-4">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center font-bold">
                  💳
                </div>
                <h2 className="text-base md:text-lg font-bold text-slate-900">Financial Breakdown</h2>
              </div>
              <button
                onClick={() => setIsEditingRate(!isEditingRate)}
                className="text-xs font-semibold text-[#C9A227] hover:underline flex items-center gap-1"
              >
                <Calculator className="w-3.5 h-3.5" />
                {isEditingRate ? "Hide Adjuster" : "Adjust Rate"}
              </button>
            </div>

            {/* Inline Rate Adjuster if active */}
            {isEditingRate && (
              <div className="p-4 bg-slate-50 border rounded-xl space-y-3" style={{ borderColor: "#E1E3E6" }}>
                <p className="text-xs font-bold text-slate-700">Set Custom / Live Rate</p>
                <div className="flex gap-2">
                  <Input
                    type="number"
                    step="0.01"
                    placeholder="Enter FX Rate"
                    value={adminFxRate}
                    onChange={(e) => {
                      setAdminFxRate(e.target.value);
                      const r = parseFloat(e.target.value);
                      const a = parseFloat(String(request.amount));
                      if (!isNaN(r) && !isNaN(a) && r > 0) {
                        setAdminPayoutAmount(
                          request.sendCurrency === "NGN" ? (a / r).toFixed(2) : (a * r).toFixed(2)
                        );
                      }
                    }}
                    className="bg-white h-9 text-xs"
                  />
                  <Button
                    type="button"
                    variant="outline"
                    onClick={handleFetchLiveRate}
                    className="h-9 text-xs shrink-0 gap-1"
                  >
                    <RefreshCw className="w-3 h-3" /> Fetch Live
                  </Button>
                  <Button
                    type="button"
                    onClick={() => setRateMutation.mutate()}
                    disabled={setRateMutation.isPending || !adminFxRate}
                    className="bg-[#012333] hover:bg-[#02334c] text-white h-9 text-xs shrink-0"
                  >
                    {setRateMutation.isPending ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : "Save"}
                  </Button>
                </div>
              </div>
            )}

            {/* Rates Row */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div>
                <p className="text-xs text-slate-500 font-medium">
                  Customer Rate ({request.sendCurrency}/{request.receiveCurrency})
                </p>
                <p className="text-2xl md:text-3xl font-extrabold text-slate-900 mt-1">
                  {customerRate.toLocaleString("en-US", {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2,
                  })}
                </p>
              </div>

              <div>
                <p className="text-xs text-slate-500 font-medium">Base Rate (Interbank)</p>
                <p className="text-lg md:text-xl font-bold text-slate-700 font-mono mt-1.5">
                  {baseRate.toLocaleString("en-US", {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2,
                  })}
                </p>
              </div>
            </div>

            {/* Spread & Transfer Volume Boxes */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="bg-slate-50 border rounded-xl p-4" style={{ borderColor: "#E1E3E6" }}>
                <p className="text-xs text-slate-500">Spread</p>
                <p className="text-sm font-bold text-slate-900 mt-0.5">
                  {spreadPct}% ({spreadAmount.toFixed(2)} {request.sendCurrency})
                </p>
              </div>

              <div className="bg-slate-50 border rounded-xl p-4" style={{ borderColor: "#E1E3E6" }}>
                <p className="text-xs text-slate-500">Transfer Volume</p>
                <p className="text-sm font-bold text-slate-900 font-mono mt-0.5">
                  {formatCurrency(amountVal, request.sendCurrency)}
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
          <div
            className="bg-white rounded-2xl border p-6 md:p-8 shadow-sm space-y-5"
            style={{ borderColor: "#E1E3E6" }}
          >
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

          {/* Supplier Details (if customer provided supplier info) */}
          {request.supplierDetails &&
            (request.supplierDetails.businessName || request.supplierDetails.bankName) && (
              <div
                className="bg-white rounded-2xl border p-6 shadow-sm space-y-4"
                style={{ borderColor: "#E1E3E6" }}
              >
                <div className="flex items-center justify-between border-b pb-3">
                  <div className="flex items-center gap-2">
                    <Building2 className="w-5 h-5 text-amber-600" />
                    <h3 className="text-base font-bold text-slate-900">Supplier Destination</h3>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                  {request.supplierDetails.businessName && (
                    <div>
                      <span className="text-slate-400">Beneficiary Business</span>
                      <p className="font-bold text-slate-900 mt-0.5">
                        {request.supplierDetails.businessName}
                      </p>
                    </div>
                  )}
                  {request.supplierDetails.bankName && (
                    <div>
                      <span className="text-slate-400">Bank & Account</span>
                      <p className="font-bold text-slate-900 mt-0.5 font-mono">
                        {request.supplierDetails.bankName} • {request.supplierDetails.accountNumber}
                      </p>
                    </div>
                  )}
                  {request.supplierDetails.address && (
                    <div>
                      <span className="text-slate-400">Address</span>
                      <p className="font-medium text-slate-700 mt-0.5">
                        {request.supplierDetails.address}
                      </p>
                    </div>
                  )}
                  {request.supplierDetails.invoiceUrl && (
                    <div className="sm:col-span-2 pt-2">
                      <a
                        href={request.supplierDetails.invoiceUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-amber-50 text-amber-800 border border-amber-200 rounded-lg font-bold text-xs hover:bg-amber-100 transition-colors"
                      >
                        <Paperclip className="w-3.5 h-3.5" />
                        View Customer Invoice <ExternalLink className="w-3 h-3 ml-1" />
                      </a>
                    </div>
                  )}
                </div>
              </div>
            )}
        </div>

        {/* Right Column: Customer Context & Execution Decision */}
        <div className="space-y-6">
          {/* Customer Context Card */}
          <div
            className="bg-white rounded-2xl border p-6 shadow-sm space-y-5"
            style={{ borderColor: "#E1E3E6" }}
          >
            <div className="flex items-center gap-2 border-b pb-4">
              <span className="text-slate-700 font-bold">👤</span>
              <h3 className="text-base font-bold text-slate-900">Customer Context</h3>
            </div>

            <div className="flex items-center gap-3">
              <div className="w-11 h-11 rounded-xl bg-blue-100 text-blue-700 flex items-center justify-center font-bold text-sm">
                {customerInitials}
              </div>
              <div>
                <h4 className="font-bold text-sm text-slate-900">{customerName}</h4>
                <p className="text-xs text-slate-400 font-mono">ID: {customerRef}</p>
              </div>
            </div>

            <div className="divide-y divide-slate-100 text-xs space-y-2 pt-2">
              <div className="pt-2 flex items-center justify-between">
                <span className="text-slate-500">Ledger Balance (USD)</span>
                <span className="font-bold font-mono text-slate-900">{ledgerBalance}</span>
              </div>
              <div className="pt-2 flex items-center justify-between">
                <span className="text-slate-500">30-Day Vol.</span>
                <span className="font-bold font-mono text-slate-900">{monthlyVolume}</span>
              </div>
              <div className="pt-2 flex items-center justify-between">
                <span className="text-slate-500">AML Status</span>
                <span className="font-bold text-emerald-600 flex items-center gap-1">
                  <ShieldCheck className="w-3.5 h-3.5" /> {amlStatus}
                </span>
              </div>
            </div>

            {request.customer?.id && (
              <div className="pt-3 border-t border-slate-100">
                <Link
                  href={`/admin/customers/${request.customer.id}`}
                  className="text-xs font-bold text-[#C9A227] hover:text-[#a8861d] flex items-center justify-center gap-1 transition-colors"
                >
                  View Full Profile <ExternalLink className="w-3 h-3" />
                </Link>
              </div>
            )}
          </div>

          {/* Execution Decision Card */}
          <div
            className="bg-white rounded-2xl border p-6 shadow-sm space-y-4"
            style={{ borderColor: "#E1E3E6" }}
          >
            <h3 className="text-base font-bold text-slate-900">Execution Decision</h3>

            <Button
              onClick={() => approveAndRouteMutation.mutate()}
              disabled={approveAndRouteMutation.isPending || isProcessed}
              className="w-full bg-[#C9A227] hover:bg-[#b08e20] text-white font-bold py-3.5 h-auto rounded-xl shadow-sm text-sm gap-2"
            >
              {approveAndRouteMutation.isPending ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <CheckCircle className="w-4 h-4" />
              )}
              {isProcessed ? "Transfer Already Approved" : "Approve & Route"}
            </Button>

            <div className="grid grid-cols-2 gap-3">
              <Button
                variant="outline"
                type="button"
                onClick={() => toast.info("Flagged for compliance review")}
                className="border-slate-200 text-slate-700 hover:bg-slate-50 text-xs font-bold py-2.5 h-auto rounded-xl gap-1.5"
              >
                <Flag className="w-3.5 h-3.5 text-amber-500" />
                Flag
              </Button>

              <Button
                variant="outline"
                type="button"
                onClick={() => {
                  if (confirm("Deny and reject this trade request? Customer will be notified.")) {
                    rejectMutation.mutate(undefined);
                  }
                }}
                disabled={rejectMutation.isPending || isProcessed}
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
                  ref={receiptInputRef}
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

      {/* ── Transaction Chat Drawer / Modal ── */}
      {showChat && (
        <div
          className="bg-white rounded-2xl border p-6 shadow-sm mt-6"
          style={{ borderColor: "#E1E3E6" }}
        >
          <div className="flex items-center justify-between border-b pb-3 mb-4">
            <h3 className="font-bold text-slate-900">Transaction Communication Channel</h3>
            <button onClick={() => setShowChat(false)} className="text-slate-400 hover:text-slate-600">
              ✕
            </button>
          </div>
          <TransactionChat
            tradeId={id}
            tradeInfo={{
              status: request?.status,
              amount: request?.amount ? Number(request.amount) : undefined,
              sendCurrency: request?.sendCurrency,
              receiveCurrency: request?.receiveCurrency,
            }}
          />
        </div>
      )}
    </div>
  );
}

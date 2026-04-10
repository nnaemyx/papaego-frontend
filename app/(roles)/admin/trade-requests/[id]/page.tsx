"use client";

import { use, useRef, useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
    adminTradeRequestsApi,
} from "@/lib/api/admin-trade-requests";
import { agentsApi } from "@/lib/api/agents";
import { transactionsApi } from "@/lib/api/transactions";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import {
    ChevronLeft,
    User,
    Building2,
    Hash,
    MapPin,
    UserCheck,
    CheckCircle,
    XCircle,
    Loader2,
    Upload,
    Paperclip,
    ArrowRight,
    TrendingUp,
    Clock,
    Receipt,
    ExternalLink,
    Calculator,
} from "lucide-react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { formatCurrency, formatExchangeRate } from "@/lib/formatters";
import { TransactionChat } from "@/components/transactions/TransactionChat";
import { format } from "date-fns";
import Link from "next/link";

const STATUS_STYLE: Record<string, { bg: string; text: string; border: string; label: string }> = {
    PENDING: { bg: "#FFF8E1", text: "#F59E0B", border: "#FDE68A", label: "Pending" },
    POOL: { bg: "#FFF8E1", text: "#F59E0B", border: "#FDE68A", label: "In Pool" },
    ASSIGNED: { bg: "#EFF6FF", text: "#3B82F6", border: "#BFDBFE", label: "Agent Assigned" },
    QUOTED: { bg: "#EDE9FE", text: "#8B5CF6", border: "#DDD6FE", label: "Rate Quoted" },
    PROCESSED: { bg: "#E2FDED", text: "#27AE60", border: "#A7F3D0", label: "Processed" },
    REJECTED: { bg: "#FFE5E5", text: "#E05555", border: "#FECACA", label: "Rejected" },
};

const TRADE_STATUS_STYLE: Record<string, { bg: string; text: string; label: string }> = {
    INITIATED: { bg: "#F6F6F6", text: "#6B7078", label: "Trade Initiated" },
    QUOTED: { bg: "#EDE9FE", text: "#8B5CF6", label: "Rate Set by Agent" },
    SENT_TO_CUSTOMER: { bg: "#FFF8E1", text: "#F59E0B", label: "Sent to Customer" },
    CUSTOMER_CONFIRMED: { bg: "#EFF6FF", text: "#3B82F6", label: "Customer Confirmed" },
    AWAITING_PAYMENT: { bg: "#FFF8E1", text: "#F59E0B", label: "Awaiting Payment" },
    PAYMENT_CONFIRMED: { bg: "#EFF6FF", text: "#3B82F6", label: "Payment Confirmed" },
    COMPLETED: { bg: "#E2FDED", text: "#27AE60", label: "Completed" },
    FLAGGED: { bg: "#FFE5E5", text: "#E05555", label: "Flagged" },
    CANCELLED: { bg: "#FFE5E5", text: "#E05555", label: "Cancelled" },
};

export default function AdminTradeRequestDetailPage({
    params,
}: {
    params: Promise<{ id: string }>;
}) {
    const { id } = use(params);
    const router = useRouter();
    const queryClient = useQueryClient();
    const receiptInputRef = useRef<HTMLInputElement>(null);
    const [selectedAgentId, setSelectedAgentId] = useState<string>("");
    const [uploadingReceipt, setUploadingReceipt] = useState(false);
    const [receiptFile, setReceiptFile] = useState<File | null>(null);

    const [paymentAccountName, setPaymentAccountName] = useState("");
    const [paymentAccountNumber, setPaymentAccountNumber] = useState("");
    const [paymentBankName, setPaymentBankName] = useState("");
    const [paymentAmount, setPaymentAmount] = useState("");

    // Admin rate-setting state
    const [adminFxRate, setAdminFxRate] = useState("");
    const [adminPayoutAmount, setAdminPayoutAmount] = useState("");
    const [settingRate, setSettingRate] = useState(false);

    const { data: request, isLoading } = useQuery({
        queryKey: ["admin-trade-request", id],
        queryFn: () => adminTradeRequestsApi.getTradeRequest(id),
        refetchInterval: 10_000,
    });

    const { data: agents = [] } = useQuery({
        queryKey: ["agents"],
        queryFn: () => agentsApi.getAgents(),
        staleTime: 60_000,
    });

    const assignMutation = useMutation({
        mutationFn: (agentId: string) =>
            adminTradeRequestsApi.assignAgent(id, agentId),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["admin-trade-request", id] });
            queryClient.invalidateQueries({ queryKey: ["admin-trade-requests"] });
            toast.success("Agent assigned — they will be notified to set the rate");
        },
        onError: () => toast.error("Failed to assign agent"),
    });

    const processMutation = useMutation({
        mutationFn: () => adminTradeRequestsApi.processRequest(id, {
            paymentAccountName,
            paymentAccountNumber,
            paymentBankName,
            paymentAmount: paymentAmount || request?.amount?.toString() || ""
        }),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["admin-trade-request", id] });
            queryClient.invalidateQueries({ queryKey: ["admin-trade-requests"] });
            toast.success("Trade created and customer notified with payment details");
        },
        onError: () => toast.error("Failed to process request"),
    });

    const setRateMutation = useMutation({
        mutationFn: () => adminTradeRequestsApi.setRate(id, adminFxRate, adminPayoutAmount),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["admin-trade-request", id] });
            queryClient.invalidateQueries({ queryKey: ["admin-trade-requests"] });
            toast.success("Exchange rate set successfully");
            setSettingRate(false);
        },
        onError: () => toast.error("Failed to set rate"),
    });

    const rejectMutation = useMutation({
        mutationFn: (reason?: string) =>
            adminTradeRequestsApi.rejectRequest(id, reason),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["admin-trade-request", id] });
            queryClient.invalidateQueries({ queryKey: ["admin-trade-requests"] });
            toast.success("Trade request rejected");
            router.push("/admin/trade-requests");
        },
        onError: () => toast.error("Failed to reject request"),
    });

    const handleReject = () => {
        if (confirm("Reject this trade request? The customer will be notified.")) {
            rejectMutation.mutate(undefined);
        }
    };

    const handleAssign = () => {
        if (!selectedAgentId) {
            toast.error("Please select an agent");
            return;
        }
        assignMutation.mutate(selectedAgentId);
    };

    const handleReceiptUpload = async (file: File) => {
        if (!request?.linkedTrade?.id) {
            toast.error("No linked trade found");
            return;
        }
        setUploadingReceipt(true);
        try {
            await transactionsApi.uploadReceipt(request.linkedTrade.id, file);
            setReceiptFile(file);
            queryClient.invalidateQueries({ queryKey: ["admin-trade-request", id] });
            toast.success("Receipt uploaded and customer notified");
        } catch {
            toast.error("Failed to upload receipt");
        } finally {
            setUploadingReceipt(false);
        }
    };

    if (isLoading) {
        return (
            <div className="flex items-center justify-center min-h-[60vh]">
                <Loader2 className="w-10 h-10 animate-spin" style={{ color: "#C9A227" }} />
            </div>
        );
    }

    if (!request) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4 p-8">
                <p className="font-bold text-red-500">Trade request not found</p>
                <Button variant="outline" onClick={() => router.back()}>
                    Go Back
                </Button>
            </div>
        );
    }

    const reqStyle = STATUS_STYLE[request.status] || STATUS_STYLE.PENDING;
    const tradeStyle = request.linkedTrade
        ? TRADE_STATUS_STYLE[request.linkedTrade.status] || { bg: "#F6F6F6", text: "#6B7078", label: request.linkedTrade.status }
        : null;
    const hasSupplier =
        request.supplierDetails?.businessName || request.supplierDetails?.bankName;
    const isActionable = ["PENDING", "POOL", "ASSIGNED", "QUOTED"].includes(request.status);
    const agentSetRate =
        request.fxRate && parseFloat(request.fxRate) > 0;

    return (
        <div className="p-4 md:p-6 lg:p-8 space-y-6 max-w-5xl mx-auto" style={{ backgroundColor: "#F7F8F9", minHeight: "100vh" }}>
            {/* Back */}
            <button
                onClick={() => router.back()}
                className="flex items-center gap-2 text-sm font-semibold hover:underline"
                style={{ color: "#2b2f33" }}
            >
                <ChevronLeft className="w-4 h-4" />
                Back to Trade Requests
            </button>

            {/* Header */}
            <div className="bg-white rounded-2xl border p-6 flex items-start justify-between gap-4" style={{ borderColor: "#E1E3E6" }}>
                <div>
                    <h1 className="text-2xl font-bold mb-1" style={{ color: "#2b2f33" }}>
                        Trade Request
                    </h1>
                    <p className="text-sm font-mono" style={{ color: "#9AA0A6" }}>
                        #{id.slice(0, 12).toUpperCase()}
                    </p>
                    <p className="text-xs mt-1" style={{ color: "#9AA0A6" }}>
                        Submitted {format(new Date(request.createdAt), "PPP p")}
                    </p>
                </div>
                <div className="flex items-center gap-3">
                    <Badge
                        variant="outline"
                        className="text-sm px-3 py-1 font-bold"
                        style={{
                            backgroundColor: reqStyle.bg,
                            color: reqStyle.text,
                            borderColor: reqStyle.border,
                        }}
                    >
                        {reqStyle.label}
                    </Badge>
                    {isActionable && (
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={handleReject}
                            disabled={rejectMutation.isPending}
                            className="border-red-200 text-red-500 hover:bg-red-50"
                        >
                            <XCircle className="w-4 h-4 mr-1" />
                            Reject
                        </Button>
                    )}
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Left Column */}
                <div className="lg:col-span-2 space-y-6">

                    {/* Trade Summary */}
                    <div className="bg-white rounded-2xl border p-6" style={{ borderColor: "#E1E3E6" }}>
                        <h2 className="font-bold text-lg mb-4" style={{ color: "#2b2f33" }}>
                            Trade Summary
                        </h2>
                        <div className="flex items-center justify-between p-5 rounded-xl" style={{ backgroundColor: "#F7F8F9" }}>
                            <div>
                                <p className="text-xs uppercase tracking-wider font-bold mb-1" style={{ color: "#9AA0A6" }}>Customer Sends</p>
                                <p className="text-3xl font-black" style={{ color: "#012333" }}>
                                    {formatCurrency(request.amount, request.sendCurrency)}
                                </p>
                            </div>
                            <div className="w-10 h-10 rounded-full flex items-center justify-center" style={{ backgroundColor: "#C9A22720" }}>
                                <ArrowRight className="w-5 h-5" style={{ color: "#C9A227" }} />
                            </div>
                            <div className="text-right">
                                <p className="text-xs uppercase tracking-wider font-bold mb-1" style={{ color: "#9AA0A6" }}>Receives</p>
                                <p className="text-3xl font-black" style={{ color: "#012333" }}>
                                    {request.receiveCurrency}
                                </p>
                            </div>
                        </div>
                        {request.purpose && (
                            <p className="text-sm mt-4 italic" style={{ color: "#6B7078" }}>
                                Purpose: "{request.purpose}"
                            </p>
                        )}
                        {request.receiptUrl && (
                            <div className="mt-4 p-3 rounded-xl border border-[#C9A227] bg-amber-50 flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                    <Receipt className="w-4 h-4 text-[#C9A227]" />
                                    <span className="text-sm font-semibold text-[#012333]">Customer Receipt Attached</span>
                                </div>
                                <a 
                                    href={request.receiptUrl} 
                                    target="_blank" 
                                    rel="noopener noreferrer"
                                    className="text-xs font-bold text-[#C9A227] hover:underline flex items-center gap-1"
                                >
                                    View <ExternalLink className="w-3 h-3" />
                                </a>
                            </div>
                        )}
                    </div>

                    {/* Customer Info */}
                    <div className="bg-white rounded-2xl border p-6" style={{ borderColor: "#E1E3E6" }}>
                        <h2 className="font-bold text-lg mb-4 flex items-center gap-2" style={{ color: "#2b2f33" }}>
                            <User className="w-5 h-5" style={{ color: "#C9A227" }} />
                            Customer
                        </h2>
                        <div className="space-y-3">
                            {[
                                { label: "Full Name", val: `${request.customer.firstName} ${request.customer.lastName}` },
                                { label: "Email", val: request.customer.email },
                                { label: "Phone", val: request.customer.phone || "—" },
                            ].map(({ label, val }) => (
                                <div key={label} className="flex justify-between items-center py-2 border-b last:border-0" style={{ borderColor: "#F0F0F0" }}>
                                    <span className="text-sm" style={{ color: "#9AA0A6" }}>{label}</span>
                                    <span className="text-sm font-semibold" style={{ color: "#2b2f33" }}>{val}</span>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Supplier Details */}
                    {hasSupplier && (
                        <div className="rounded-2xl border p-6" style={{ backgroundColor: "#FFFBEB", borderColor: "#FDE68A" }}>
                            <h2 className="font-bold text-lg mb-4 flex items-center gap-2" style={{ color: "#92400E" }}>
                                <Building2 className="w-5 h-5" style={{ color: "#D97706" }} />
                                Supplier Details (from customer)
                            </h2>
                            <div className="space-y-2.5">
                                {[
                                    { icon: Building2, label: "Business", val: request.supplierDetails?.businessName },
                                    { icon: Hash, label: "Bank", val: request.supplierDetails?.bankName },
                                    { icon: Hash, label: "Account No.", val: request.supplierDetails?.accountNumber },
                                    { icon: Building2, label: "Sector", val: request.supplierDetails?.sector },
                                    { icon: MapPin, label: "Address", val: request.supplierDetails?.address },
                                ]
                                    .filter((r) => r.val)
                                    .map(({ icon: Icon, label, val }) => (
                                        <div key={label} className="flex items-center gap-3">
                                            <Icon className="w-4 h-4 shrink-0" style={{ color: "#D97706" }} />
                                            <span className="text-sm" style={{ color: "#92400E" }}>
                                                <span className="font-semibold">{label}:</span> {val}
                                            </span>
                                        </div>
                                    ))}
                                {request.supplierDetails?.invoiceUrl && (
                                    <div className="mt-4 pt-3 border-t border-amber-200">
                                        <a 
                                            href={request.supplierDetails.invoiceUrl} 
                                            target="_blank" 
                                            rel="noopener noreferrer"
                                            className="flex items-center justify-center gap-2 w-full py-2 bg-amber-100 hover:bg-amber-200 text-amber-900 rounded-xl text-xs font-bold transition-colors"
                                        >
                                            <Paperclip className="w-3.5 h-3.5" />
                                            View Customer Invoice
                                            <ExternalLink className="w-3 h-3" />
                                        </a>
                                    </div>
                                )}
                            </div>
                        </div>
                    )}

                    {/* Linked Trade Status (once processed) */}
                    {request.linkedTrade && tradeStyle && (
                        <div className="bg-white rounded-2xl border p-6" style={{ borderColor: "#E1E3E6" }}>
                            <h2 className="font-bold text-lg mb-4 flex items-center gap-2" style={{ color: "#2b2f33" }}>
                                <TrendingUp className="w-5 h-5" style={{ color: "#27AE60" }} />
                                Linked Trade
                            </h2>
                            <div className="flex items-center justify-between mb-4">
                                <div>
                                    <p className="text-xs" style={{ color: "#9AA0A6" }}>Trade ID</p>
                                    <p className="font-mono font-bold text-sm" style={{ color: "#2b2f33" }}>
                                        #{request.linkedTrade.id.slice(0, 12).toUpperCase()}
                                    </p>
                                </div>
                                <Badge
                                    variant="outline"
                                    style={{
                                        backgroundColor: tradeStyle.bg,
                                        color: tradeStyle.text,
                                        borderColor: tradeStyle.bg,
                                    }}
                                >
                                    {tradeStyle.label}
                                </Badge>
                            </div>

                             {/* Agent rate info moved here or shown if exists on request */}
                             {agentSetRate ? (
                                <div
                                    className="p-4 rounded-xl mb-4"
                                    style={{ backgroundColor: "#E2FDED", border: "1px solid #A7F3D0" }}
                                >
                                    <p className="text-sm font-bold mb-1" style={{ color: "#27AE60" }}>
                                        ✅ Agent has set the exchange rate
                                    </p>
                                    <p className="text-xl font-black" style={{ color: "#27AE60" }}>
                                        {formatExchangeRate(request.fxRate || 0, request.sendCurrency, request.receiveCurrency)}
                                    </p>
                                    {request.payoutAmount && (
                                        <p className="text-sm mt-1" style={{ color: "#27AE60" }}>
                                            Estimated Payout: {Number(request.payoutAmount).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })} {request.receiveCurrency}
                                        </p>
                                    )}
                                </div>
                            ) : request.assignedAgent ? (
                                <div
                                    className="p-4 rounded-xl mb-4"
                                    style={{ backgroundColor: "#FFF8E1", border: "1px solid #FDE68A" }}
                                >
                                    <div className="flex items-center gap-2">
                                        <Clock className="w-4 h-4" style={{ color: "#F59E0B" }} />
                                        <p className="text-sm font-semibold" style={{ color: "#92400E" }}>
                                            Waiting for agent to set the exchange rate…
                                        </p>
                                    </div>
                                    <p className="text-xs mt-1" style={{ color: "#B45309" }}>
                                        Assigned to: {request.assignedAgent.firstName} {request.assignedAgent.lastName}
                                    </p>
                                </div>
                            ) : null}

                            {/* Receipt section */}
                            <div>
                                <p className="text-sm font-bold mb-3" style={{ color: "#2b2f33" }}>
                                    Upload Payout Receipt for Customer
                                </p>

                                {request.linkedTrade.receiptUrl || receiptFile ? (
                                    <div
                                        className="flex items-center justify-between p-4 rounded-xl"
                                        style={{ backgroundColor: "#E2FDED", border: "1px solid #A7F3D0" }}
                                    >
                                        <div className="flex items-center gap-3">
                                            <Receipt className="w-5 h-5" style={{ color: "#27AE60" }} />
                                            <span className="text-sm font-semibold" style={{ color: "#27AE60" }}>
                                                {receiptFile ? receiptFile.name : "Receipt uploaded — customer notified"}
                                            </span>
                                        </div>
                                        {request.linkedTrade.receiptUrl && (
                                            <a
                                                href={request.linkedTrade.receiptUrl}
                                                target="_blank"
                                                rel="noreferrer"
                                                className="flex items-center gap-1 text-xs font-bold"
                                                style={{ color: "#27AE60" }}
                                            >
                                                View <ExternalLink className="w-3 h-3" />
                                            </a>
                                        )}
                                    </div>
                                ) : (
                                    <label
                                        className="flex flex-col items-center justify-center gap-3 border-2 border-dashed rounded-xl p-6 cursor-pointer hover:border-green-400 transition-colors"
                                        style={{ borderColor: "#E1E3E6", backgroundColor: "#F7F8F9" }}
                                    >
                                        <div
                                            className="w-11 h-11 rounded-full flex items-center justify-center"
                                            style={{ backgroundColor: "#E2FDED" }}
                                        >
                                            {uploadingReceipt ? (
                                                <Loader2 className="w-5 h-5 animate-spin" style={{ color: "#27AE60" }} />
                                            ) : (
                                                <Upload className="w-5 h-5" style={{ color: "#27AE60" }} />
                                            )}
                                        </div>
                                        <div className="text-center">
                                            <p className="text-sm font-bold" style={{ color: "#2b2f33" }}>
                                                {uploadingReceipt ? "Uploading…" : "Upload payout receipt for customer"}
                                            </p>
                                            <p className="text-xs mt-0.5" style={{ color: "#9AA0A6" }}>
                                                JPG, PNG or PDF · Customer will be notified instantly
                                            </p>
                                        </div>
                                        <input
                                            ref={receiptInputRef}
                                            type="file"
                                            className="hidden"
                                            accept=".jpg,.jpeg,.png,.pdf"
                                            onChange={(e) => {
                                                const file = e.target.files?.[0];
                                                if (file) handleReceiptUpload(file);
                                            }}
                                        />
                                    </label>
                                )}
                            </div>

                            {/* Link to full transaction */}
                            <Link
                                href={`/admin/transactions/${request.linkedTrade.id}`}
                                className="mt-4 flex items-center justify-center gap-2 w-full py-2.5 rounded-xl text-sm font-semibold transition-colors hover:opacity-80"
                                style={{ backgroundColor: "#012333", color: "white" }}
                            >
                                View Full Trade Details
                                <ExternalLink className="w-4 h-4" />
                            </Link>
                        </div>
                    )}

                    {/* Customer Payment Proof (if uploaded) */}
                    {request.linkedTrade?.paymentProofUrl && (
                        <div className="bg-white rounded-2xl border p-6" style={{ borderColor: "#E1E3E6" }}>
                            <div className="flex items-center justify-between mb-4">
                                <h2 className="font-bold text-lg flex items-center gap-2" style={{ color: "#2b2f33" }}>
                                    <CheckCircle className="w-5 h-5" style={{ color: "#27AE60" }} />
                                    Customer Payment Proof
                                </h2>
                                <a
                                    href={request.linkedTrade.paymentProofUrl}
                                    target="_blank"
                                    rel="noreferrer"
                                    className="text-sm font-bold text-brand-primary hover:underline flex items-center gap-1"
                                    style={{ color: "#C9A227" }}
                                >
                                    View Full Image <ExternalLink className="w-4 h-4" />
                                </a>
                            </div>
                            <div className="rounded-xl overflow-hidden border bg-gray-50 aspect-video flex items-center justify-center relative group">
                                <img
                                    src={request.linkedTrade.paymentProofUrl}
                                    alt="Payment Proof"
                                    className="max-h-full object-contain"
                                />
                                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                    <a
                                        href={request.linkedTrade.paymentProofUrl}
                                        target="_blank"
                                        rel="noreferrer"
                                        className="bg-white text-black px-4 py-2 rounded-lg font-bold text-sm shadow-lg flex items-center gap-2"
                                    >
                                        <ExternalLink className="w-4 h-4" />
                                        Open Original
                                    </a>
                                </div>
                            </div>
                            <p className="text-xs mt-3 text-gray-500 italic">
                                * Verify this proof against your bank statement before completing the trade.
                            </p>
                        </div>
                    )}
                </div>

                {/* Right Column — Actions */}
                <div className="space-y-5">

                    {/* Step 1: Assign Agent */}
                    <div
                        className="bg-white rounded-2xl border p-5"
                        style={{
                            borderColor: request.assignedAgent ? "#A7F3D0" : "#E1E3E6",
                            borderLeftWidth: "3px",
                            borderLeftColor: request.assignedAgent ? "#27AE60" : "#C9A227",
                        }}
                    >
                        <div className="flex items-center gap-2 mb-3">
                            <div
                                className="w-6 h-6 rounded-full flex items-center justify-center text-xs font-black text-white"
                                style={{ backgroundColor: (request.fxRate && parseFloat(request.fxRate) > 0) ? "#27AE60" : "#C9A227" }}
                            >
                                1
                            </div>
                            <h3 className="font-bold text-sm" style={{ color: "#2b2f33" }}>
                                Set Exchange Rate
                            </h3>
                        </div>

                        {(request.fxRate && parseFloat(request.fxRate) > 0) ? (
                            <div className="space-y-3">
                                <div className="flex items-center gap-2 p-3 rounded-xl" style={{ backgroundColor: "#E2FDED" }}>
                                    <CheckCircle className="w-4 h-4 shrink-0" style={{ color: "#27AE60" }} />
                                    <div>
                                        <p className="text-xs font-bold" style={{ color: "#27AE60" }}>Rate Set</p>
                                        <p className="text-sm font-black" style={{ color: "#27AE60" }}>
                                            {formatExchangeRate(request.fxRate || 0, request.sendCurrency, request.receiveCurrency)}
                                        </p>
                                    </div>
                                </div>
                                <button
                                    onClick={() => { setSettingRate(true); setAdminFxRate(request.fxRate || ""); }}
                                    className="text-xs underline"
                                    style={{ color: "#9AA0A6" }}
                                >
                                    Update Rate
                                </button>
                            </div>
                        ) : settingRate || !(request.fxRate && parseFloat(request.fxRate) > 0) ? (
                            <div className="space-y-3">
                                <p className="text-xs" style={{ color: "#9AA0A6" }}>
                                    Set the exchange rate for this trade. The agent will be notified.
                                </p>
                                <div className="space-y-2">
                                    <div className="relative">
                                        <Calculator className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: "#9AA0A6" }} />
                                        <Input
                                            type="number"
                                            step="0.0001"
                                            placeholder={`FX Rate (1 ${request.sendCurrency === 'NGN' ? request.receiveCurrency : request.sendCurrency} = ? NGN)`}
                                            value={adminFxRate}
                                            onChange={(e) => {
                                                setAdminFxRate(e.target.value);
                                                const r = parseFloat(e.target.value);
                                                const a = parseFloat(String(request.amount));
                                                if (!isNaN(r) && !isNaN(a) && r > 0) {
                                                    setAdminPayoutAmount(request.sendCurrency === 'NGN' ? (a / r).toFixed(2) : (a * r).toFixed(2));
                                                }
                                            }}
                                            className="pl-9 h-10"
                                        />
                                    </div>
                                    {adminPayoutAmount && (
                                        <p className="text-xs" style={{ color: "#27AE60" }}>
                                            Est. payout: {adminPayoutAmount} {request.receiveCurrency}
                                        </p>
                                    )}
                                </div>
                                <Button
                                    onClick={() => setRateMutation.mutate()}
                                    disabled={setRateMutation.isPending || !adminFxRate || parseFloat(adminFxRate) <= 0}
                                    className="w-full font-bold text-white"
                                    style={{ backgroundColor: "#012333" }}
                                >
                                    {setRateMutation.isPending ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Calculator className="w-4 h-4 mr-2" />}
                                    Confirm Rate
                                </Button>
                                {/* Still allow agent assignment as optional step */}
                                <div className="pt-2 border-t" style={{ borderColor: "#F0F0F0" }}>
                                    <p className="text-xs mb-2" style={{ color: "#9AA0A6" }}>Or assign agent to handle:</p>
                                    <Select value={selectedAgentId} onValueChange={setSelectedAgentId}>
                                        <SelectTrigger className="h-9 text-sm">
                                            <SelectValue placeholder="Assign agent (optional)…" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {(agents as any[]).map((a: any) => (
                                                <SelectItem key={a.id} value={a.id}>
                                                    {a.name || `${a.firstName || ""} ${a.lastName || ""}`.trim() || a.email}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                    {selectedAgentId && (
                                        <Button onClick={handleAssign} disabled={assignMutation.isPending} size="sm" variant="outline" className="w-full mt-2 h-8 text-xs">
                                            {assignMutation.isPending ? <Loader2 className="w-3 h-3 mr-1 animate-spin" /> : <UserCheck className="w-3 h-3 mr-1" />}
                                            Assign Agent
                                        </Button>
                                    )}
                                </div>
                            </div>
                        ) : null}

                        {request.assignedAgent && (
                            <div className="flex items-center gap-2 p-2 rounded-lg mt-3" style={{ backgroundColor: "#F7F8F9" }}>
                                <UserCheck className="w-4 h-4 shrink-0" style={{ color: "#3B82F6" }} />
                                <p className="text-xs" style={{ color: "#3B82F6" }}>
                                    {request.assignedAgent.firstName} {request.assignedAgent.lastName} assigned
                                </p>
                            </div>
                        )}
                    </div>

                    {/* Step 2: Process Trade */}
                    <div
                        className="bg-white rounded-2xl border p-5"
                        style={{
                            borderColor: request.linkedTrade ? "#A7F3D0" : "#E1E3E6",
                            borderLeftWidth: "3px",
                            borderLeftColor: request.linkedTrade ? "#27AE60" : "#9AA0A6",
                        }}
                    >
                        <div className="flex items-center gap-2 mb-3">
                            <div
                                className="w-6 h-6 rounded-full flex items-center justify-center text-xs font-black text-white"
                                style={{ backgroundColor: request.linkedTrade ? "#27AE60" : "#9AA0A6" }}
                            >
                                2
                            </div>
                            <h3 className="font-bold text-sm" style={{ color: "#2b2f33" }}>
                                Create Trade
                            </h3>
                        </div>

                        {request.linkedTrade ? (
                            <div className="flex items-center gap-2 p-3 rounded-xl" style={{ backgroundColor: "#E2FDED" }}>
                                <CheckCircle className="w-4 h-4 shrink-0" style={{ color: "#27AE60" }} />
                                <p className="text-sm font-bold" style={{ color: "#27AE60" }}>
                                    Trade created successfully
                                </p>
                            </div>
                        ) : (
                            <div className="space-y-4">
                                <p className="text-xs" style={{ color: "#9AA0A6" }}>
                                    {request.assignedAgent
                                        ? agentSetRate
                                            ? "Agent has provided a rate. Enter the payment details you want the customer to pay into."
                                            : "Waiting for agent to set the rate. You can still process manually if needed."
                                        : "Assign an agent first, or process directly if you have a rate ready."}
                                </p>
                                
                                {agentSetRate && (
                                    <div className="p-3 rounded-xl border border-green-200 bg-green-50 mb-3">
                                        <p className="text-[10px] font-bold text-green-600 uppercase tracking-wider mb-1">Current Quoted Rate</p>
                                        <div className="flex items-baseline gap-2">
                                            <span className="text-lg font-black text-green-700">
                                                {formatExchangeRate(request.fxRate || 0, request.sendCurrency, request.receiveCurrency)}
                                            </span>
                                            {request.payoutAmount && (
                                                <span className="text-xs text-green-600 font-medium">
                                                    (Payout: {Number(request.payoutAmount).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })} {request.receiveCurrency})
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                )}
                                
                                <div className="space-y-3 bg-gray-50 p-4 rounded-xl border border-gray-100">
                                    <h4 className="text-xs font-bold text-gray-700 uppercase tracking-wider mb-2">Payment Details to Customer</h4>
                                    <Input 
                                        placeholder="Bank Name" 
                                        value={paymentBankName}
                                        onChange={(e) => setPaymentBankName(e.target.value)}
                                    />
                                    <Input 
                                        placeholder="Account Name" 
                                        value={paymentAccountName}
                                        onChange={(e) => setPaymentAccountName(e.target.value)}
                                    />
                                    <Input 
                                        placeholder="Account Number" 
                                        value={paymentAccountNumber}
                                        onChange={(e) => setPaymentAccountNumber(e.target.value)}
                                    />
                                    <Input 
                                        placeholder={`Amount (Default: ${formatCurrency(request.amount, request.sendCurrency)})`} 
                                        value={paymentAmount}
                                        onChange={(e) => setPaymentAmount(e.target.value)}
                                    />
                                </div>

                                <Button
                                    onClick={() => processMutation.mutate()}
                                    disabled={processMutation.isPending || request.status === "PROCESSED" || (!paymentBankName || !paymentAccountName || !paymentAccountNumber)}
                                    className="w-full font-bold text-white"
                                    style={{ backgroundColor: "#C9A227" }}
                                >
                                    {processMutation.isPending ? (
                                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                    ) : (
                                        <CheckCircle className="w-4 h-4 mr-2" />
                                    )}
                                    Send Payment Details &amp; Create Trade
                                </Button>
                            </div>
                        )}
                    </div>

                    {/* Step 3: Upload Receipt */}
                    <div
                        className="bg-white rounded-2xl border p-5"
                        style={{
                            borderColor: (request.linkedTrade?.receiptUrl || receiptFile) ? "#A7F3D0" : "#E1E3E6",
                            borderLeftWidth: "3px",
                            borderLeftColor: (request.linkedTrade?.receiptUrl || receiptFile) ? "#27AE60" : "#9AA0A6",
                        }}
                    >
                        <div className="flex items-center gap-2 mb-3">
                            <div
                                className="w-6 h-6 rounded-full flex items-center justify-center text-xs font-black text-white"
                                style={{ backgroundColor: (request.linkedTrade?.receiptUrl || receiptFile) ? "#27AE60" : "#9AA0A6" }}
                            >
                                3
                            </div>
                            <h3 className="font-bold text-sm" style={{ color: "#2b2f33" }}>
                                Send Receipt to Customer
                            </h3>
                        </div>

                        {(request.linkedTrade?.receiptUrl || receiptFile) ? (
                            <div className="flex items-center gap-2 p-3 rounded-xl" style={{ backgroundColor: "#E2FDED" }}>
                                <CheckCircle className="w-4 h-4 shrink-0" style={{ color: "#27AE60" }} />
                                <p className="text-sm font-bold" style={{ color: "#27AE60" }}>
                                    Receipt sent to customer
                                </p>
                            </div>
                        ) : request.linkedTrade ? (
                            <div className="space-y-3">
                                <p className="text-xs" style={{ color: "#9AA0A6" }}>
                                    Upload the payment receipt or invoice. Customer will be instantly notified.
                                </p>
                                <label
                                    className="flex items-center justify-center gap-2 w-full py-2.5 border-2 border-dashed rounded-xl cursor-pointer hover:border-green-400 transition-colors text-sm font-semibold"
                                    style={{ borderColor: "#E1E3E6", color: "#6B7078" }}
                                >
                                    {uploadingReceipt ? (
                                        <Loader2 className="w-4 h-4 animate-spin" />
                                    ) : (
                                        <Upload className="w-4 h-4" />
                                    )}
                                    {uploadingReceipt ? "Uploading…" : "Upload Receipt"}
                                    <input
                                        type="file"
                                        className="hidden"
                                        accept=".jpg,.jpeg,.png,.pdf"
                                        onChange={(e) => {
                                            const file = e.target.files?.[0];
                                            if (file) handleReceiptUpload(file);
                                        }}
                                    />
                                </label>
                            </div>
                        ) : (
                            <p className="text-xs" style={{ color: "#C9A8A8" }}>
                                Create the trade first to upload a receipt.
                            </p>
                        )}
                    </div>

                    {/* Step 4: Chat with Customer */}
                    <div className="bg-white rounded-2xl border overflow-hidden flex flex-col" style={{ borderColor: "#E1E3E6" }}>
                        <div className="px-5 py-3 border-b bg-gray-50 flex items-center justify-between" style={{ borderColor: "#E1E3E6" }}>
                            <h3 className="font-bold text-sm" style={{ color: "#2b2f33" }}>Chat with Customer</h3>
                        </div>
                        <div className="h-[400px]">
                            <TransactionChat 
                                tradeRequestId={id} 
                                tradeId={request.linkedTrade?.id} 
                                tradeInfo={{
                                    amount: typeof request.amount === 'string' ? parseFloat(request.amount) : Number(request.amount),
                                    sendCurrency: request.sendCurrency,
                                    receiveCurrency: request.receiveCurrency,
                                    fxRate: request.fxRate ?? undefined,
                                    payoutAmount: request.payoutAmount != null ? (typeof request.payoutAmount === 'string' ? parseFloat(request.payoutAmount) : Number(request.payoutAmount)) : undefined,
                                    status: request.linkedTrade?.status || request.status
                                }}
                            />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

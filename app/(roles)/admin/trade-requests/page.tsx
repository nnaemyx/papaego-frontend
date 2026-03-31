"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
    adminTradeRequestsApi,
    type AdminTradeRequest,
} from "@/lib/api/admin-trade-requests";
import { agentsApi } from "@/lib/api/agents";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import {
    FileText,
    ArrowRight,
    XCircle,
    User,
    Calendar,
    AlertCircle,
    CheckCircle,
    UserCheck,
    Building2,
    MapPin,
    Hash,
    ChevronRight,
    TrendingUp,
    Clock,
    Trash2,
} from "lucide-react";
import { toast } from "sonner";
import { formatCurrency, formatExchangeRate } from "@/lib/formatters";
import Link from "next/link";

const STATUS_TABS = ["ALL", "PENDING", "ASSIGNED", "PROCESSED", "REJECTED"] as const;

const STATUS_STYLE: Record<string, { bg: string; text: string; border: string }> = {
    PENDING:   { bg: "#FFF8E1", text: "#F59E0B", border: "#FDE68A" },
    POOL:      { bg: "#FFF8E1", text: "#F59E0B", border: "#FDE68A" },
    ASSIGNED:  { bg: "#EFF6FF", text: "#3B82F6", border: "#BFDBFE" },
    PROCESSED: { bg: "#E2FDED", text: "#27AE60", border: "#A7F3D0" },
    REJECTED:  { bg: "#FFE5E5", text: "#E05555", border: "#FECACA" },
    ALL:       { bg: "#F7F8F9", text: "#6B7078", border: "#E1E3E6" },
};

export default function AdminTradeRequestsPage() {
    const queryClient = useQueryClient();
    const [statusFilter, setStatusFilter] = useState<string>("ALL");
    const [page, setPage] = useState<number>(1);
    const [assigningId, setAssigningId] = useState<string | null>(null);
    const [selectedAgentId, setSelectedAgentId] = useState<string>("");

    const { data, isLoading, error } = useQuery({
        queryKey: ["admin-trade-requests", statusFilter, page],
        queryFn: () => adminTradeRequestsApi.getTradeRequests(statusFilter, page, 20),
        refetchInterval: 15_000, // Auto-refresh every 15s to catch new customer requests
        staleTime: 0,
    });

    const requests = data?.requests || [];
    const totalPages = data ? Math.ceil(data.total / data.limit) : 1;

    const { data: agents = [] } = useQuery({
        queryKey: ["agents"],
        queryFn: () => agentsApi.getAgents(),
        staleTime: 60_000,
    });

    const rejectMutation = useMutation({
        mutationFn: (id: string) => adminTradeRequestsApi.rejectRequest(id),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["admin-trade-requests"] });
            toast.success("Trade request rejected");
        },
        onError: () => toast.error("Failed to reject request"),
    });

    const assignMutation = useMutation({
        mutationFn: ({ id, agentId }: { id: string; agentId: string }) =>
            adminTradeRequestsApi.assignAgent(id, agentId),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["admin-trade-requests"] });
            toast.success("Agent assigned successfully");
            setAssigningId(null);
            setSelectedAgentId("");
        },
        onError: () => toast.error("Failed to assign agent"),
    });

    const processMutation = useMutation({
        mutationFn: (id: string) => adminTradeRequestsApi.processRequest(id),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["admin-trade-requests"] });
            toast.success("Trade request processed — trade created");
        },
        onError: () => toast.error("Failed to process request"),
    });

    const deleteMutation = useMutation({
        mutationFn: (id: string) => adminTradeRequestsApi.deleteRequest(id),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["admin-trade-requests"] });
            toast.success("Trade request deleted");
        },
        onError: () => toast.error("Failed to delete request"),
    });

    const handleReject = (id: string) => {
        if (confirm("Are you sure you want to reject this request?")) {
            rejectMutation.mutate(id);
        }
    };

    const handleDelete = (id: string) => {
        if (confirm("Are you sure you want to completely delete this trade request? This action cannot be undone.")) {
            deleteMutation.mutate(id);
        }
    };

    const handleAssign = (req: AdminTradeRequest) => {
        if (assigningId === req.id) {
            if (!selectedAgentId) {
                toast.error("Please select an agent first");
                return;
            }
            assignMutation.mutate({ id: req.id, agentId: selectedAgentId });
        } else {
            setAssigningId(req.id);
            setSelectedAgentId(agents[0]?.id || "");
        }
    };

    return (
        <div className="p-4 md:p-6 lg:p-8 max-w-7xl mx-auto space-y-8">
            {/* Header */}
            <div>
                <h1
                    className="text-3xl md:text-4xl font-bold mb-2 flex items-center gap-3"
                    style={{ color: "#2b2f33" }}
                >
                    <FileText className="w-8 h-8" style={{ color: "#C9A227" }} />
                    Trade Requests
                </h1>
                <p style={{ color: "#6b7078" }}>
                    All incoming trade requests from customers. Assign agents for
                    rate-setting and process trades from here.
                </p>
            </div>

            {/* Status Tabs */}
            <div className="flex gap-2 border-b pb-px overflow-x-auto">
                {STATUS_TABS.map((status) => (
                    <button
                        key={status}
                        onClick={() => {
                            setStatusFilter(status);
                            setPage(1);
                        }}
                        className="px-4 py-2 text-sm font-bold transition-all border-b-2 shrink-0"
                        style={{
                            borderColor:
                                statusFilter === status ? "#C9A227" : "transparent",
                            color: statusFilter === status ? "#012333" : "#9AA0A6",
                        }}
                    >
                        {status}
                    </button>
                ))}
            </div>


            {/* Content */}
            {isLoading ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {[1, 2, 3].map((i) => (
                        <div
                            key={i}
                            className="h-72 bg-gray-100 rounded-2xl animate-pulse"
                        />
                    ))}
                </div>
            ) : error ? (
                <div className="p-12 text-center bg-red-50 rounded-2xl border border-red-100">
                    <AlertCircle className="w-12 h-12 text-red-400 mx-auto mb-4" />
                    <h3 className="text-lg font-bold text-red-800">
                        Failed to load requests
                    </h3>
                    <p className="text-red-600">
                        Please check your connection and try again.
                    </p>
                </div>
            ) : !requests || requests.length === 0 ? (
                <div className="p-20 text-center bg-gray-50 rounded-3xl border border-dashed border-gray-200">
                    <FileText className="w-16 h-16 text-gray-200 mx-auto mb-4" />
                    <h3 className="text-xl font-bold text-gray-400">
                        No {statusFilter.toLowerCase()} requests
                    </h3>
                    <p className="text-gray-400">Everything is up to date!</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {requests.map((req) => {
                        const style =
                            STATUS_STYLE[req.status] || STATUS_STYLE.PENDING;
                        const isAssigning = assigningId === req.id;

                        return (
                            <Card
                                key={req.id}
                                className="overflow-hidden border-none shadow-sm hover:shadow-md transition-shadow rounded-2xl bg-white"
                            >
                                <Link
                                    href={`/admin/trade-requests/${req.id}`}
                                    className="block px-6 pt-4 pb-1 border-b"
                                    style={{ borderColor: "#F0F0F0" }}
                                >
                                    <div className="flex items-center justify-between">
                                        <span className="text-xs font-semibold" style={{ color: "#9AA0A6" }}>
                                            View Details
                                        </span>
                                        <div className="flex items-center gap-2">
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                onClick={(e) => {
                                                    e.preventDefault();
                                                    handleDelete(req.id);
                                                }}
                                                className="w-8 h-8 p-0 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-full"
                                                disabled={deleteMutation.isPending}
                                            >
                                                <Trash2 className="w-4 h-4" />
                                            </Button>
                                            <ChevronRight className="w-4 h-4" style={{ color: "#C9A227" }} />
                                        </div>
                                    </div>
                                </Link>
                                <div className="p-6 space-y-4">
                                    {/* Status + Date */}
                                    <div className="flex justify-between items-start">
                                        <Badge
                                            variant="outline"
                                            className="text-xs font-bold"
                                            style={{
                                                backgroundColor: style.bg,
                                                color: style.text,
                                                borderColor: style.border,
                                            }}
                                        >
                                            {req.status}
                                        </Badge>
                                        <span
                                            className="text-[10px] flex items-center gap-1"
                                            style={{ color: "#9AA0A6" }}
                                        >
                                            <Calendar className="w-3 h-3" />
                                            {new Date(req.createdAt).toLocaleDateString()}
                                        </span>
                                    </div>

                                    {/* Customer */}
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 rounded-full bg-gray-50 flex items-center justify-center">
                                            <User className="w-5 h-5 text-gray-400" />
                                        </div>
                                        <div>
                                            <p
                                                className="text-sm font-bold"
                                                style={{ color: "#012333" }}
                                            >
                                                {req.customer.firstName} {req.customer.lastName}
                                            </p>
                                            <p className="text-xs" style={{ color: "#6B7078" }}>
                                                {req.customer.email}
                                            </p>
                                        </div>
                                    </div>

                                    {/* Trade Summary */}
                                    <div
                                        className="p-4 rounded-xl"
                                        style={{ backgroundColor: "#F7F8F9" }}
                                    >
                                        <div className="flex items-center justify-between">
                                            <div>
                                                <p
                                                    className="text-[10px] uppercase tracking-wider font-bold"
                                                    style={{ color: "#9AA0A6" }}
                                                >
                                                    Send
                                                </p>
                                                <p
                                                    className="text-lg font-black"
                                                    style={{ color: "#012333" }}
                                                >
                                                    {formatCurrency(req.amount, req.sendCurrency)}
                                                </p>
                                            </div>
                                            <ArrowRight
                                                className="w-5 h-5"
                                                style={{ color: "#C9A227" }}
                                            />
                                            <div className="text-right">
                                                <p
                                                    className="text-[10px] uppercase tracking-wider font-bold"
                                                    style={{ color: "#9AA0A6" }}
                                                >
                                                    Receive
                                                </p>
                                                <p
                                                    className="text-lg font-black"
                                                    style={{ color: "#012333" }}
                                                >
                                                    {req.receiveCurrency}
                                                </p>
                                            </div>
                                        </div>
                                        {req.purpose && (
                                            <p
                                                className="text-xs mt-3 italic"
                                                style={{ color: "#6B7078" }}
                                            >
                                                Purpose: "{req.purpose}"
                                            </p>
                                        )}
                                    </div>

                                    {/* Supplier Details (if provided by customer) */}
                                    {req.supplierDetails &&
                                        (req.supplierDetails.businessName ||
                                            req.supplierDetails.bankName) && (
                                            <div
                                                className="p-3 rounded-xl space-y-1.5 border"
                                                style={{
                                                    backgroundColor: "#FFFBEB",
                                                    borderColor: "#FDE68A",
                                                }}
                                            >
                                                <p
                                                    className="text-[10px] font-bold uppercase tracking-wider mb-2"
                                                    style={{ color: "#B45309" }}
                                                >
                                                    Supplier Details
                                                </p>
                                                {req.supplierDetails.businessName && (
                                                    <div className="flex items-center gap-2">
                                                        <Building2
                                                            className="w-3 h-3 shrink-0"
                                                            style={{ color: "#D97706" }}
                                                        />
                                                        <span
                                                            className="text-xs font-medium"
                                                            style={{ color: "#92400E" }}
                                                        >
                                                            {req.supplierDetails.businessName}
                                                        </span>
                                                    </div>
                                                )}
                                                {req.supplierDetails.bankName && (
                                                    <div className="flex items-center gap-2">
                                                        <Hash
                                                            className="w-3 h-3 shrink-0"
                                                            style={{ color: "#D97706" }}
                                                        />
                                                        <span
                                                            className="text-xs"
                                                            style={{ color: "#92400E" }}
                                                        >
                                                            {req.supplierDetails.bankName} •{" "}
                                                            {req.supplierDetails.accountNumber}
                                                        </span>
                                                    </div>
                                                )}
                                                {req.supplierDetails.address && (
                                                    <div className="flex items-center gap-2">
                                                        <MapPin
                                                            className="w-3 h-3 shrink-0"
                                                            style={{ color: "#D97706" }}
                                                        />
                                                        <span
                                                            className="text-xs"
                                                            style={{ color: "#92400E" }}
                                                        >
                                                            {req.supplierDetails.address}
                                                        </span>
                                                    </div>
                                                )}
                                            </div>
                                        )}

                                    {/* Assigned Agent */}
                                    {req.assignedAgent && (
                                        <div className="flex items-center gap-2 text-xs" style={{ color: "#3B82F6" }}>
                                            <UserCheck className="w-4 h-4" />
                                            <span className="font-semibold">
                                                Assigned: {req.assignedAgent.firstName}{" "}
                                                {req.assignedAgent.lastName}
                                            </span>
                                        </div>
                                    )}

                                    {/* Rate Set Indicator */}
                                    {req.status === "ASSIGNED" && (
                                        req.linkedTradeFxRate ? (
                                            <div
                                                className="flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-bold"
                                                style={{ backgroundColor: "#E2FDED", color: "#27AE60" }}
                                            >
                                                <TrendingUp className="w-3.5 h-3.5" />
                                                Rate Set: {formatExchangeRate(req.linkedTradeFxRate || 0, req.sendCurrency, req.receiveCurrency)} — Ready to process
                                            </div>
                                        ) : (
                                            <div
                                                className="flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-semibold"
                                                style={{ backgroundColor: "#FFF8E1", color: "#92400E" }}
                                            >
                                                <Clock className="w-3.5 h-3.5" />
                                                Waiting for agent to set exchange rate…
                                            </div>
                                        )
                                    )}

                                    {/* Agent Assignment Dropdown (when assigning) */}
                                    {isAssigning && (
                                        <Select
                                            value={selectedAgentId}
                                            onValueChange={setSelectedAgentId}
                                        >
                                            <SelectTrigger className="h-10 text-sm">
                                                <SelectValue placeholder="Select agent…" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {(agents as any[]).map((a: any) => (
                                                    <SelectItem key={a.id} value={a.id}>
                                                        {a.name || a.email}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    )}

                                    {/* Actions */}
                                    {req.status === "PENDING" && (
                                        <div className="flex gap-3 pt-1">
                                            <Button
                                                onClick={() => handleAssign(req)}
                                                disabled={assignMutation.isPending}
                                                className="flex-1 h-10 rounded-xl font-bold text-white"
                                                style={{ backgroundColor: "#012333" }}
                                            >
                                                <UserCheck className="w-4 h-4 mr-2" />
                                                {isAssigning ? "Confirm Assign" : "Assign Agent"}
                                            </Button>
                                            <Button
                                                onClick={() => processMutation.mutate(req.id)}
                                                disabled={processMutation.isPending}
                                                className="flex-1 h-10 rounded-xl font-bold text-white"
                                                style={{ backgroundColor: "#C9A227" }}
                                            >
                                                <CheckCircle className="w-4 h-4 mr-2" />
                                                Process
                                            </Button>
                                            <Button
                                                variant="outline"
                                                onClick={() => handleReject(req.id)}
                                                className="w-10 h-10 rounded-xl border-red-100 text-red-500 hover:bg-red-50 p-0"
                                            >
                                                <XCircle className="w-5 h-5" />
                                            </Button>
                                        </div>
                                    )}

                                    {req.status === "ASSIGNED" && (
                                        <div className="flex gap-3 pt-1">
                                            <Button
                                                onClick={() => processMutation.mutate(req.id)}
                                                disabled={processMutation.isPending}
                                                className="flex-1 h-10 rounded-xl font-bold text-white"
                                                style={{ backgroundColor: "#C9A227" }}
                                            >
                                                <CheckCircle className="w-4 h-4 mr-2" />
                                                Process Trade
                                            </Button>
                                            <Button
                                                variant="outline"
                                                onClick={() => handleReject(req.id)}
                                                className="w-10 h-10 rounded-xl border-red-100 text-red-500 hover:bg-red-50 p-0"
                                            >
                                                <XCircle className="w-5 h-5" />
                                            </Button>
                                        </div>
                                    )}
                                </div>
                            </Card>
                        );
                    })}
                </div>
            )}

            {/* Pagination Controls */}
            {totalPages > 1 && (
                <div className="flex items-center justify-center gap-4 pt-6">
                    <Button
                        variant="outline"
                        onClick={() => setPage(p => Math.max(1, p - 1))}
                        disabled={page === 1}
                        className="rounded-xl border-gray-200"
                    >
                        Previous
                    </Button>
                    <span className="text-sm font-semibold text-gray-600">
                        Page {page} of {totalPages}
                    </span>
                    <Button
                        variant="outline"
                        onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                        disabled={page === totalPages}
                        className="rounded-xl border-gray-200"
                    >
                        Next
                    </Button>
                </div>
            )}
        </div>
    );
}

"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
    adminDepositsApi,
    type AdminDepositRequest,
} from "@/lib/api/admin-deposits";
import {
    ArrowDownToLine,
    Search,
    CheckCircle2,
    XCircle,
    Clock,
    RefreshCw,
    AlertCircle,
    ImageIcon,
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogFooter,
    DialogDescription,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import type { DepositStatus } from "@/lib/api/wallet";

// ── helpers ──────────────────────────────────────────────────────────────────

const STATUS_TABS: Array<{ label: string; value: string }> = [
    { label: "All", value: "ALL" },
    { label: "Pending", value: "PENDING" },
    { label: "Approved", value: "APPROVED" },
    { label: "Rejected", value: "REJECTED" },
    { label: "Cancelled", value: "CANCELLED" },
];

function StatusBadge({ status }: { status: DepositStatus }) {
    switch (status) {
        case "PENDING":
            return (
                <Badge className="bg-amber-50 text-amber-700 border border-amber-200">
                    Pending Review
                </Badge>
            );
        case "APPROVED":
            return (
                <Badge className="bg-emerald-50 text-emerald-700 border border-emerald-200">
                    Approved
                </Badge>
            );
        case "REJECTED":
            return (
                <Badge className="bg-red-50 text-red-700 border border-red-200">
                    Rejected
                </Badge>
            );
        case "CANCELLED":
            return (
                <Badge className="bg-slate-100 text-slate-600 border border-slate-200">
                    Cancelled
                </Badge>
            );
        default:
            return <Badge variant="outline">{status}</Badge>;
    }
}

function fmt(amount: string | number | undefined | null): string {
    if (amount === null || amount === undefined) return "—";
    return `₦${Number(amount).toLocaleString("en-NG", { minimumFractionDigits: 2 })}`;
}

// ── page ─────────────────────────────────────────────────────────────────────

export default function AdminDepositsPage() {
    const qc = useQueryClient();

    const [statusFilter, setStatusFilter] = useState<string>("ALL");
    const [search, setSearch] = useState<string>("");

    // ── Approve dialog ───────────────────────────────────────────────────────
    const [approveTarget, setApproveTarget] = useState<AdminDepositRequest | null>(null);
    const [correctedAmount, setCorrectedAmount] = useState<string>("");

    // ── Reject dialog ────────────────────────────────────────────────────────
    const [rejectTarget, setRejectTarget] = useState<AdminDepositRequest | null>(null);
    const [rejectReason, setRejectReason] = useState<string>("");

    // ── Proof preview dialog ─────────────────────────────────────────────────
    const [proofUrl, setProofUrl] = useState<string | null>(null);

    // ── Query ────────────────────────────────────────────────────────────────
    const { data, isLoading, refetch } = useQuery({
        queryKey: ["admin-deposits", statusFilter],
        queryFn: () =>
            adminDepositsApi.list({ status: statusFilter === "ALL" ? undefined : statusFilter }),
    });

    const deposits: AdminDepositRequest[] = (data?.deposits ?? []).filter((d) => {
        if (!search.trim()) return true;
        const q = search.toLowerCase();
        return (
            d.customer?.fullName?.toLowerCase().includes(q) ||
            d.customer?.email?.toLowerCase().includes(q) ||
            d.reference?.toLowerCase().includes(q)
        );
    });

    // ── Approve mutation ─────────────────────────────────────────────────────
    const approveMutation = useMutation({
        mutationFn: ({ id, creditedAmount }: { id: string; creditedAmount?: number }) =>
            adminDepositsApi.approve(id, creditedAmount),
        onSuccess: () => {
            toast.success("Deposit approved and wallet credited.");
            setApproveTarget(null);
            setCorrectedAmount("");
            qc.invalidateQueries({ queryKey: ["admin-deposits"] });
        },
        onError: (e: any) => {
            toast.error(e?.response?.data?.error ?? "Failed to approve deposit.");
        },
    });

    // ── Reject mutation ──────────────────────────────────────────────────────
    const rejectMutation = useMutation({
        mutationFn: ({ id, reason }: { id: string; reason?: string }) =>
            adminDepositsApi.reject(id, reason),
        onSuccess: () => {
            toast.success("Deposit rejected.");
            setRejectTarget(null);
            setRejectReason("");
            qc.invalidateQueries({ queryKey: ["admin-deposits"] });
        },
        onError: (e: any) => {
            toast.error(e?.response?.data?.error ?? "Failed to reject deposit.");
        },
    });

    // ── handlers ─────────────────────────────────────────────────────────────
    function handleApproveConfirm() {
        if (!approveTarget) return;
        const override = correctedAmount.trim() ? parseFloat(correctedAmount) : undefined;
        if (override !== undefined && (isNaN(override) || override <= 0)) {
            toast.error("Enter a valid corrected amount or leave blank to use requested amount.");
            return;
        }
        approveMutation.mutate({ id: approveTarget.id, creditedAmount: override });
    }

    function handleRejectConfirm() {
        if (!rejectTarget) return;
        rejectMutation.mutate({ id: rejectTarget.id, reason: rejectReason.trim() || undefined });
    }

    // ── render ────────────────────────────────────────────────────────────────
    return (
        <div className="p-8 space-y-8 font-sans max-w-7xl mx-auto">
            {/* Header */}
            <div
                className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b pb-6"
                style={{ borderColor: "#E1E3E6" }}
            >
                <div>
                    <div className="flex items-center gap-2">
                        <ArrowDownToLine className="w-7 h-7" style={{ color: "#C9A227" }} />
                        <h1 className="text-2xl font-bold tracking-tight" style={{ color: "#012333" }}>
                            Customer Deposit Requests
                        </h1>
                    </div>
                    <p className="text-sm mt-1 text-slate-500">
                        Review proof-of-payment submissions and credit customer wallets after verification.
                    </p>
                </div>
                <div className="flex items-center gap-3">
                    <Badge variant="outline" className="px-3 py-1.5 text-xs font-semibold bg-white">
                        Total: {data?.total ?? 0}
                    </Badge>
                    <Button
                        variant="outline"
                        size="sm"
                        className="gap-1.5 text-xs"
                        onClick={() => refetch()}
                    >
                        <RefreshCw className="w-3.5 h-3.5" />
                        Refresh
                    </Button>
                </div>
            </div>

            {/* Filters */}
            <div
                className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-white p-4 rounded-xl border shadow-sm"
                style={{ borderColor: "#E1E3E6" }}
            >
                {/* Search */}
                <div className="relative w-full sm:w-80">
                    <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                    <Input
                        placeholder="Search customer, email, reference..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="pl-9 bg-slate-50 border-slate-200 focus:bg-white text-sm"
                    />
                </div>

                {/* Status Tabs */}
                <div className="flex items-center gap-1.5 w-full sm:w-auto overflow-x-auto pb-1 sm:pb-0">
                    {STATUS_TABS.map((tab) => (
                        <button
                            key={tab.value}
                            onClick={() => setStatusFilter(tab.value)}
                            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors whitespace-nowrap ${statusFilter === tab.value
                                ? "bg-[#012333] text-white shadow-sm"
                                : "text-slate-600 hover:bg-slate-100"
                                }`}
                        >
                            {tab.label}
                        </button>
                    ))}
                </div>
            </div>

            {/* Table */}
            {isLoading ? (
                <div
                    className="bg-white p-12 rounded-xl border text-center text-slate-500"
                    style={{ borderColor: "#E1E3E6" }}
                >
                    <Clock className="w-8 h-8 animate-spin mx-auto mb-2 text-amber-500" />
                    Loading deposit requests...
                </div>
            ) : deposits.length === 0 ? (
                <div
                    className="bg-white p-12 rounded-xl border text-center"
                    style={{ borderColor: "#E1E3E6" }}
                >
                    <AlertCircle className="w-12 h-12 mx-auto mb-3 text-slate-300" />
                    <h3 className="text-base font-semibold text-slate-800">No deposits found</h3>
                    <p className="text-sm text-slate-500 max-w-sm mx-auto mt-1">
                        No deposit requests match the current filter.
                    </p>
                </div>
            ) : (
                <div
                    className="bg-white border rounded-xl shadow-sm overflow-hidden"
                    style={{ borderColor: "#E1E3E6" }}
                >
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse text-sm">
                            <thead>
                                <tr
                                    className="border-b bg-slate-50/80 text-xs font-semibold uppercase tracking-wider text-slate-500"
                                    style={{ borderColor: "#E1E3E6" }}
                                >
                                    <th className="p-4">Customer</th>
                                    <th className="p-4">Reference</th>
                                    <th className="p-4">Requested</th>
                                    <th className="p-4">Credited</th>
                                    <th className="p-4">Method</th>
                                    <th className="p-4">Status</th>
                                    <th className="p-4">Submitted</th>
                                    <th className="p-4 text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                                {deposits.map((deposit) => (
                                    <tr
                                        key={deposit.id}
                                        className="hover:bg-slate-50/50 transition-colors"
                                    >
                                        {/* Customer */}
                                        <td className="p-4">
                                            <div className="font-semibold text-slate-900">
                                                {deposit.customer?.fullName ?? "—"}
                                            </div>
                                            <div className="text-xs text-slate-500">
                                                {deposit.customer?.email ?? deposit.customerId}
                                            </div>
                                        </td>

                                        {/* Reference */}
                                        <td className="p-4 text-xs text-slate-600 font-mono">
                                            {deposit.reference
                                                ? deposit.reference.slice(0, 12) + "…"
                                                : "—"}
                                        </td>

                                        {/* Requested amount */}
                                        <td className="p-4 font-semibold text-slate-900">
                                            {fmt(deposit.amount)}
                                        </td>

                                        {/* Credited amount */}
                                        <td className="p-4 text-slate-700">
                                            {deposit.creditedAmount ? fmt(deposit.creditedAmount) : "—"}
                                        </td>

                                        {/* Method */}
                                        <td className="p-4 text-xs text-slate-600">
                                            {deposit.method.replace("_", " ")}
                                        </td>

                                        {/* Status */}
                                        <td className="p-4">
                                            <StatusBadge status={deposit.status} />
                                        </td>

                                        {/* Date */}
                                        <td className="p-4 text-xs text-slate-500">
                                            {new Date(deposit.createdAt).toLocaleDateString("en-NG", {
                                                day: "2-digit",
                                                month: "short",
                                                year: "numeric",
                                            })}
                                        </td>

                                        {/* Actions */}
                                        <td className="p-4 text-right">
                                            <div className="flex items-center justify-end gap-2">
                                                {/* Proof of payment */}
                                                {deposit.proofUrl && (
                                                    <Button
                                                        size="sm"
                                                        variant="ghost"
                                                        className="text-xs px-2"
                                                        onClick={() => setProofUrl(deposit.proofUrl!)}
                                                    >
                                                        <ImageIcon className="w-3.5 h-3.5 mr-1" />
                                                        Proof
                                                    </Button>
                                                )}

                                                {/* Approve / Reject only on reviewable statuses */}
                                                {(deposit.status === "PENDING" ||
                                                    deposit.status === "CANCELLED") && (
                                                        <>
                                                            <Button
                                                                size="sm"
                                                                className="text-xs gap-1 bg-emerald-600 hover:bg-emerald-700 text-white"
                                                                onClick={() => {
                                                                    setApproveTarget(deposit);
                                                                    setCorrectedAmount("");
                                                                }}
                                                            >
                                                                <CheckCircle2 className="w-3.5 h-3.5" />
                                                                Approve
                                                            </Button>
                                                            <Button
                                                                size="sm"
                                                                variant="outline"
                                                                className="text-xs gap-1 border-red-200 text-red-600 hover:bg-red-50"
                                                                onClick={() => {
                                                                    setRejectTarget(deposit);
                                                                    setRejectReason("");
                                                                }}
                                                            >
                                                                <XCircle className="w-3.5 h-3.5" />
                                                                Reject
                                                            </Button>
                                                        </>
                                                    )}

                                                {/* Show rejection reason tooltip */}
                                                {deposit.status === "REJECTED" &&
                                                    deposit.rejectionReason && (
                                                        <span
                                                            title={deposit.rejectionReason}
                                                            className="text-xs text-slate-400 cursor-help underline decoration-dotted"
                                                        >
                                                            reason
                                                        </span>
                                                    )}
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            {/* ── Approve Dialog ─────────────────────────────────────────────── */}
            <Dialog
                open={!!approveTarget}
                onOpenChange={(open) => {
                    if (!open) {
                        setApproveTarget(null);
                        setCorrectedAmount("");
                    }
                }}
            >
                <DialogContent className="sm:max-w-md">
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2 text-emerald-700">
                            <CheckCircle2 className="w-5 h-5" />
                            Approve Deposit
                        </DialogTitle>
                        <DialogDescription>
                            Approving will atomically credit the customer&apos;s wallet. This cannot be
                            undone.
                        </DialogDescription>
                    </DialogHeader>

                    {approveTarget && (
                        <div className="space-y-4 py-2">
                            <div className="bg-slate-50 rounded-lg p-3 text-sm space-y-1.5 border border-slate-200">
                                <div className="flex justify-between">
                                    <span className="text-slate-500">Customer</span>
                                    <span className="font-semibold">
                                        {approveTarget.customer?.fullName ?? approveTarget.customerId}
                                    </span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-slate-500">Requested</span>
                                    <span className="font-semibold">{fmt(approveTarget.amount)}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-slate-500">Method</span>
                                    <span>{approveTarget.method.replace("_", " ")}</span>
                                </div>
                                {approveTarget.depositBank && (
                                    <div className="flex justify-between">
                                        <span className="text-slate-500">Bank</span>
                                        <span>{approveTarget.depositBank}</span>
                                    </div>
                                )}
                                {approveTarget.note && (
                                    <div className="flex justify-between">
                                        <span className="text-slate-500">Note</span>
                                        <span className="text-right max-w-[200px] text-xs">{approveTarget.note}</span>
                                    </div>
                                )}
                            </div>

                            <div>
                                <label className="text-xs font-semibold text-slate-700 block mb-1">
                                    Credit amount{" "}
                                    <span className="font-normal text-slate-400">
                                        (leave blank to use requested amount)
                                    </span>
                                </label>
                                <Input
                                    type="number"
                                    step="0.01"
                                    min="0.01"
                                    placeholder={`Default: ${fmt(approveTarget.amount)}`}
                                    value={correctedAmount}
                                    onChange={(e) => setCorrectedAmount(e.target.value)}
                                    className="text-sm"
                                />
                            </div>
                        </div>
                    )}

                    <DialogFooter>
                        <Button
                            variant="outline"
                            onClick={() => {
                                setApproveTarget(null);
                                setCorrectedAmount("");
                            }}
                        >
                            Cancel
                        </Button>
                        <Button
                            className="bg-emerald-600 hover:bg-emerald-700 text-white gap-1"
                            onClick={handleApproveConfirm}
                            disabled={approveMutation.isPending}
                        >
                            {approveMutation.isPending ? "Approving…" : "Confirm & Credit"}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* ── Reject Dialog ──────────────────────────────────────────────── */}
            <Dialog
                open={!!rejectTarget}
                onOpenChange={(open) => {
                    if (!open) {
                        setRejectTarget(null);
                        setRejectReason("");
                    }
                }}
            >
                <DialogContent className="sm:max-w-md">
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2 text-red-700">
                            <XCircle className="w-5 h-5" />
                            Reject Deposit
                        </DialogTitle>
                        <DialogDescription>
                            The customer will be notified. No funds will be credited.
                        </DialogDescription>
                    </DialogHeader>

                    {rejectTarget && (
                        <div className="space-y-4 py-2">
                            <div className="bg-slate-50 rounded-lg p-3 text-sm space-y-1.5 border border-slate-200">
                                <div className="flex justify-between">
                                    <span className="text-slate-500">Customer</span>
                                    <span className="font-semibold">
                                        {rejectTarget.customer?.fullName ?? rejectTarget.customerId}
                                    </span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-slate-500">Requested</span>
                                    <span className="font-semibold">{fmt(rejectTarget.amount)}</span>
                                </div>
                            </div>

                            <div>
                                <label className="text-xs font-semibold text-slate-700 block mb-1">
                                    Rejection reason{" "}
                                    <span className="font-normal text-slate-400">(optional)</span>
                                </label>
                                <Textarea
                                    placeholder="e.g. Payment proof not verifiable, incorrect amount..."
                                    value={rejectReason}
                                    onChange={(e) => setRejectReason(e.target.value)}
                                    rows={3}
                                    className="text-sm resize-none"
                                />
                            </div>
                        </div>
                    )}

                    <DialogFooter>
                        <Button
                            variant="outline"
                            onClick={() => {
                                setRejectTarget(null);
                                setRejectReason("");
                            }}
                        >
                            Cancel
                        </Button>
                        <Button
                            className="bg-red-600 hover:bg-red-700 text-white gap-1"
                            onClick={handleRejectConfirm}
                            disabled={rejectMutation.isPending}
                        >
                            {rejectMutation.isPending ? "Rejecting…" : "Confirm Rejection"}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* ── Proof preview dialog ───────────────────────────────────────── */}
            <Dialog open={!!proofUrl} onOpenChange={(open) => !open && setProofUrl(null)}>
                <DialogContent className="sm:max-w-2xl">
                    <DialogHeader>
                        <DialogTitle>Proof of Payment</DialogTitle>
                    </DialogHeader>
                    {proofUrl && (
                        <div className="flex flex-col items-center gap-3">
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img
                                src={proofUrl}
                                alt="Proof of payment"
                                className="max-h-[60vh] object-contain rounded-lg border border-slate-200"
                            />
                            <a
                                href={proofUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-xs text-blue-600 underline"
                            >
                                Open in new tab
                            </a>
                        </div>
                    )}
                </DialogContent>
            </Dialog>
        </div>
    );
}

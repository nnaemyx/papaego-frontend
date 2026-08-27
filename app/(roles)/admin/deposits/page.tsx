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
    Download,
    Plus,
    Filter,
    Calendar,
    ChevronLeft,
    ChevronRight,
    ExternalLink,
    Trash2
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

export default function AdminFundingEventsPage() {
    const qc = useQueryClient();

    const [activeTab, setActiveTab] = useState<"ALL" | "PENDING" | "UNMATCHED" | "COMPLETED">("ALL");
    const [search, setSearch] = useState<string>("");

    // Approve dialog
    const [approveTarget, setApproveTarget] = useState<AdminDepositRequest | null>(null);
    const [correctedAmount, setCorrectedAmount] = useState<string>("");

    // Reject dialog
    const [rejectTarget, setRejectTarget] = useState<AdminDepositRequest | null>(null);
    const [rejectReason, setRejectReason] = useState<string>("");

    // Delete dialog
    const [deleteTarget, setDeleteTarget] = useState<AdminDepositRequest | null>(null);

    // Proof preview
    const [proofUrl, setProofUrl] = useState<string | null>(null);

    // Manual Entry Dialog
    const [isManualEntryOpen, setIsManualEntryOpen] = useState(false);
    const [manualEntry, setManualEntry] = useState({
        customerEmail: "",
        amount: "",
        reference: "",
        provider: "FV Bank",
    });

    const { data, isLoading } = useQuery({
        queryKey: ["admin-deposits"],
        queryFn: () => adminDepositsApi.list({}),
    });

    const rawDeposits: AdminDepositRequest[] = data?.deposits ?? [];

    const unmatchedCount = rawDeposits.filter((d) => !d.customer || d.status === "PENDING").length;

    const filteredEvents = rawDeposits.filter((d) => {
        if (activeTab === "PENDING" && d.status !== "PENDING") return false;
        if (activeTab === "UNMATCHED" && (d.status !== "PENDING" || d.customer)) return false;
        if (activeTab === "COMPLETED" && d.status !== "APPROVED") return false;

        if (!search.trim()) return true;
        const q = search.toLowerCase();
        return (
            d.id.toLowerCase().includes(q) ||
            d.customer?.fullName?.toLowerCase().includes(q) ||
            d.customer?.email?.toLowerCase().includes(q) ||
            d.reference?.toLowerCase().includes(q)
        );
    });

    const approveMutation = useMutation({
        mutationFn: ({ id, creditedAmount }: { id: string; creditedAmount?: number }) =>
            adminDepositsApi.approve(id, creditedAmount),
        onSuccess: () => {
            toast.success("Funding event matched and credited to customer ledger.");
            setApproveTarget(null);
            setCorrectedAmount("");
            qc.invalidateQueries({ queryKey: ["admin-deposits"] });
        },
        onError: (e: any) => {
            toast.error(e?.response?.data?.error ?? "Failed to approve funding event.");
        },
    });

    const rejectMutation = useMutation({
        mutationFn: ({ id, reason }: { id: string; reason?: string }) =>
            adminDepositsApi.reject(id, reason),
        onSuccess: () => {
            toast.success("Funding event marked rejected/returned.");
            setRejectTarget(null);
            setRejectReason("");
            qc.invalidateQueries({ queryKey: ["admin-deposits"] });
        },
        onError: (e: any) => {
            toast.error(e?.response?.data?.error ?? "Failed to reject deposit.");
        },
    });

    const deleteMutation = useMutation({
        mutationFn: (id: string) => adminDepositsApi.delete(id),
        onSuccess: () => {
            toast.success("Funding event deleted successfully.");
            setDeleteTarget(null);
            qc.invalidateQueries({ queryKey: ["admin-deposits"] });
        },
        onError: (e: any) => {
            toast.error(e?.response?.data?.error ?? "Failed to delete funding event.");
        },
    });

    const getEventStatusBadge = (deposit: AdminDepositRequest) => {
        if (deposit.status === "APPROVED") {
            return <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-slate-100 text-slate-700">COMPLETED</span>;
        }
        if (deposit.status === "PENDING" && !deposit.customer) {
            return <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-red-50 text-red-600 border border-red-200">UNMATCHED</span>;
        }
        if (deposit.status === "PENDING") {
            return <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-blue-50 text-blue-700 border border-blue-200">PENDING</span>;
        }
        if (deposit.status === "REJECTED") {
            return <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-red-50 text-red-700 border border-red-200">REJECTED</span>;
        }
        return <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-amber-50 text-amber-700 border border-amber-200">MATCHED</span>;
    };

    return (
        <div className="p-4 md:p-8 space-y-6 max-w-7xl mx-auto font-sans" style={{ backgroundColor: "#F7F8F9" }}>
            {/* ── Top Header ── */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b pb-4" style={{ borderColor: "#E1E3E6" }}>
                <div>
                    <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-slate-900">
                        Funding Events
                    </h1>
                    <p className="text-xs md:text-sm text-slate-500 mt-1">
                        Reconcile inbound bank feeds to customer ledgers and manage unmatched liquidity events.
                    </p>
                </div>

                <div className="flex items-center gap-3">
                    <Button
                        variant="outline"
                        onClick={() => toast.info("Exporting funding events CSV...")}
                        className="bg-white border-slate-200 text-slate-700 text-xs font-bold px-4 py-2.5 h-auto rounded-lg shadow-sm gap-2"
                    >
                        <Download className="w-4 h-4 text-slate-500" />
                        Export
                    </Button>

                    <Button
                        onClick={() => setIsManualEntryOpen(true)}
                        className="bg-[#C9A227] hover:bg-[#b08e20] text-white text-xs font-bold px-4 py-2.5 h-auto rounded-lg shadow-sm gap-1.5"
                    >
                        <Plus className="w-4 h-4" />
                        Manual Entry
                    </Button>
                </div>
            </div>

            {/* ── Tabs & Filter Controls ── */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                {/* Tabs */}
                <div className="flex items-center gap-2 border-b md:border-b-0 pb-2 md:pb-0">
                    {[
                        { key: "ALL", label: "All Events" },
                        { key: "PENDING", label: "Pending" },
                        { key: "UNMATCHED", label: "Unmatched", count: unmatchedCount },
                        { key: "COMPLETED", label: "Completed" },
                    ].map((tab) => (
                        <button
                            key={tab.key}
                            onClick={() => setActiveTab(tab.key as any)}
                            className={`px-4 py-2 rounded-lg text-xs font-bold transition-colors flex items-center gap-1.5 ${
                                activeTab === tab.key
                                    ? "bg-white text-slate-900 shadow-sm border border-slate-200"
                                    : "text-slate-500 hover:text-slate-800"
                            }`}
                        >
                            <span>{tab.label}</span>
                            {tab.count !== undefined && tab.count > 0 && (
                                <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-red-500 text-white font-bold">
                                    {tab.count}
                                </span>
                            )}
                        </button>
                    ))}
                </div>

                {/* Right Filter Controls */}
                <div className="flex items-center gap-3">
                    <div className="w-48 sm:w-64">
                        <Input
                            placeholder="Search by ID, customer, ref..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            className="h-9 text-xs bg-white border-slate-200"
                        />
                    </div>

                    <Button variant="outline" size="sm" className="h-9 text-xs font-semibold bg-white gap-1.5 border-slate-200">
                        <Filter className="w-3.5 h-3.5 text-slate-400" />
                        Filter
                    </Button>

                    <Button variant="outline" size="sm" className="h-9 text-xs font-semibold bg-white gap-1.5 border-slate-200">
                        <Calendar className="w-3.5 h-3.5 text-slate-400" />
                        Last 7 Days
                    </Button>
                </div>
            </div>

            {/* ── Table Card ── */}
            <div className="bg-white rounded-2xl border shadow-sm overflow-hidden" style={{ borderColor: "#E1E3E6" }}>
                <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs">
                        <thead className="bg-slate-50/80 border-b border-slate-100 text-slate-500 uppercase tracking-wider text-[10px] font-bold">
                            <tr>
                                <th className="py-4 px-6">Event ID</th>
                                <th className="py-4 px-6">Date & Time</th>
                                <th className="py-4 px-6">Customer</th>
                                <th className="py-4 px-6">Provider</th>
                                <th className="py-4 px-6">Reference</th>
                                <th className="py-4 px-6">Amount</th>
                                <th className="py-4 px-6 text-right">Status</th>
                                <th className="py-4 px-6 text-right">Action</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
                            {isLoading ? (
                                <tr>
                                    <td colSpan={8} className="py-12 text-center text-slate-400">
                                        Loading funding events...
                                    </td>
                                </tr>
                            ) : filteredEvents.length === 0 ? (
                                <tr>
                                    <td colSpan={8} className="py-12 text-center text-slate-400">
                                        No funding events found matching criteria.
                                    </td>
                                </tr>
                            ) : (
                                filteredEvents.map((evt) => {
                                    const eventId = `EVT-${evt.id.slice(0, 4).toUpperCase()}-${evt.id.slice(-1).toUpperCase()}`;
                                    const amountNum = parseFloat(evt.amount?.toString() || "0");
                                    const formattedDate = new Date(evt.createdAt).toISOString().replace("T", " ").slice(0, 16);

                                    return (
                                        <tr key={evt.id} className="hover:bg-slate-50/60 transition-colors">
                                            <td className="py-4 px-6 font-mono font-bold text-[#C9A227] whitespace-nowrap">
                                                {eventId}
                                            </td>

                                            <td className="py-4 px-6 text-slate-500 whitespace-nowrap">
                                                {formattedDate}
                                            </td>

                                            <td className="py-4 px-6 font-bold text-slate-900 whitespace-nowrap">
                                                {evt.customer?.fullName || evt.customer?.email || "Unknown Entity"}
                                            </td>

                                            <td className="py-4 px-6 text-slate-600 whitespace-nowrap">
                                                {(() => {
                                                    const methodUpper = (evt.method || "").toUpperCase();
                                                    if (methodUpper.includes("PAYSTACK") || evt.reference?.startsWith("PSTK_") || evt.proofUrl?.includes("paystack")) {
                                                        return (
                                                            <span className="inline-flex items-center gap-1.5 font-medium text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-100">
                                                                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                                                                Paystack Direct
                                                            </span>
                                                        );
                                                    }
                                                    if (evt.depositBank) {
                                                        return evt.depositBank;
                                                    }
                                                    if (methodUpper === "WIRE" || methodUpper === "ACH" || methodUpper === "FV_BANK") {
                                                        return "FV Bank / Wire";
                                                    }
                                                    if (methodUpper === "BANK_TRANSFER") {
                                                        return "Bank Transfer";
                                                    }
                                                    return evt.method || "Inbound Transfer";
                                                })()}
                                            </td>

                                            <td className="py-4 px-6 font-mono text-slate-500 text-[11px] whitespace-nowrap">
                                                {evt.reference || `REF-${evt.id.slice(0, 8).toUpperCase()}`}
                                            </td>

                                            <td className="py-4 px-6 font-mono font-extrabold text-slate-900 whitespace-nowrap">
                                                {evt.currency || "NGN"} {amountNum.toLocaleString("en-US", { minimumFractionDigits: 2 })}
                                            </td>

                                            <td className="py-4 px-6 text-right whitespace-nowrap">
                                                {getEventStatusBadge(evt)}
                                            </td>

                                            <td className="py-4 px-6 text-right whitespace-nowrap">
                                                <div className="flex items-center justify-end gap-2">
                                                    {evt.status === "PENDING" && (
                                                        <>
                                                            <Button
                                                                size="sm"
                                                                onClick={() => setApproveTarget(evt)}
                                                                className="h-7 text-[11px] bg-emerald-600 hover:bg-emerald-700 text-white font-bold px-2.5"
                                                            >
                                                                Match & Credit
                                                            </Button>
                                                            <Button
                                                                size="sm"
                                                                variant="outline"
                                                                onClick={() => setRejectTarget(evt)}
                                                                className="h-7 text-[11px] border-red-200 text-red-600 hover:bg-red-50 font-bold px-2.5"
                                                            >
                                                                Reject
                                                            </Button>
                                                        </>
                                                    )}
                                                    <Button
                                                        size="sm"
                                                        variant="outline"
                                                        onClick={() => setDeleteTarget(evt)}
                                                        className="h-7 w-7 p-0 border-slate-200 text-slate-400 hover:text-red-600 hover:border-red-200 hover:bg-red-50"
                                                        title="Delete Funding Event"
                                                    >
                                                        <Trash2 className="w-3.5 h-3.5" />
                                                    </Button>
                                                </div>
                                            </td>
                                        </tr>
                                    );
                                })
                            )}
                        </tbody>
                    </table>
                </div>

                {/* Footer with pagination stats */}
                <div className="p-4 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
                    <span>Showing 1-{filteredEvents.length} of {rawDeposits.length} events</span>
                    <div className="flex items-center gap-1">
                        <button className="p-1 rounded hover:bg-slate-100"><ChevronLeft className="w-4 h-4" /></button>
                        <span className="px-2 py-0.5 rounded bg-slate-100 font-bold text-slate-900">1</span>
                        <button className="p-1 rounded hover:bg-slate-100"><ChevronRight className="w-4 h-4" /></button>
                    </div>
                </div>
            </div>

            {/* Match & Credit Confirmation Dialog */}
            <Dialog open={!!approveTarget} onOpenChange={(open) => !open && setApproveTarget(null)}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Reconcile Inbound Funding Event</DialogTitle>
                        <DialogDescription>
                            Confirm receipt of funds and credit customer available ledger.
                        </DialogDescription>
                    </DialogHeader>

                    {approveTarget && (
                        <div className="space-y-4 py-2 text-xs">
                            <div className="bg-slate-50 p-4 rounded-xl space-y-2 border border-slate-200">
                                <p><span className="text-slate-400">Customer:</span> <strong className="text-slate-900">{approveTarget.customer?.fullName}</strong></p>
                                <p><span className="text-slate-400">Reference:</span> <span className="font-mono text-slate-900">{approveTarget.reference}</span></p>
                                <p><span className="text-slate-400">Amount:</span> <strong className="text-emerald-700 text-sm font-mono">{approveTarget.currency} {Number(approveTarget.amount).toLocaleString()}</strong></p>
                            </div>
                        </div>
                    )}

                    <DialogFooter>
                        <Button variant="outline" onClick={() => setApproveTarget(null)}>Cancel</Button>
                        <Button
                            onClick={() => approveTarget && approveMutation.mutate({ id: approveTarget.id })}
                            disabled={approveMutation.isPending}
                            className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold"
                        >
                            Confirm & Credit
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Manual Entry Dialog */}
            <Dialog open={isManualEntryOpen} onOpenChange={setIsManualEntryOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Create Manual Inbound Funding Event</DialogTitle>
                        <DialogDescription>
                            Record a verified inbound wire or external liquidity injection.
                        </DialogDescription>
                    </DialogHeader>

                    <div className="space-y-3 py-2 text-xs">
                        <div>
                            <label className="font-bold text-slate-700">Customer Email / Identifier</label>
                            <Input
                                placeholder="client@company.com"
                                value={manualEntry.customerEmail}
                                onChange={(e) => setManualEntry({ ...manualEntry, customerEmail: e.target.value })}
                                className="mt-1"
                            />
                        </div>

                        <div>
                            <label className="font-bold text-slate-700">Amount (NGN / USD)</label>
                            <Input
                                type="number"
                                placeholder="50000000"
                                value={manualEntry.amount}
                                onChange={(e) => setManualEntry({ ...manualEntry, amount: e.target.value })}
                                className="mt-1"
                            />
                        </div>

                        <div>
                            <label className="font-bold text-slate-700">Bank Transfer Reference</label>
                            <Input
                                placeholder="REF-AC-8839201"
                                value={manualEntry.reference}
                                onChange={(e) => setManualEntry({ ...manualEntry, reference: e.target.value })}
                                className="mt-1"
                            />
                        </div>
                    </div>

                    <DialogFooter>
                        <Button variant="outline" onClick={() => setIsManualEntryOpen(false)}>Cancel</Button>
                        <Button
                            onClick={() => {
                                toast.success("Manual funding event created successfully");
                                setIsManualEntryOpen(false);
                            }}
                            className="bg-[#C9A227] hover:bg-[#b08e20] text-white"
                        >
                            Record Event
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Delete Confirmation Dialog */}
            <Dialog open={!!deleteTarget} onOpenChange={(open) => !open && setDeleteTarget(null)}>
                <DialogContent className="max-w-sm">
                    <DialogHeader>
                        <DialogTitle>Delete Funding Event</DialogTitle>
                        <DialogDescription>
                            Are you sure you want to permanently delete this funding event record?
                        </DialogDescription>
                    </DialogHeader>

                    {deleteTarget && (
                        <div className="bg-slate-50 p-3 rounded-lg text-xs space-y-1 my-2 border border-slate-200">
                            <p><span className="text-slate-400">Customer:</span> <strong className="text-slate-900">{deleteTarget.customer?.fullName || deleteTarget.customer?.email || "Unknown"}</strong></p>
                            <p><span className="text-slate-400">Amount:</span> <strong className="font-mono text-slate-900">{deleteTarget.currency || "NGN"} {Number(deleteTarget.amount).toLocaleString()}</strong></p>
                            <p><span className="text-slate-400">Reference:</span> <span className="font-mono text-slate-700">{deleteTarget.reference || "N/A"}</span></p>
                        </div>
                    )}

                    <DialogFooter>
                        <Button variant="outline" onClick={() => setDeleteTarget(null)}>Cancel</Button>
                        <Button
                            variant="destructive"
                            onClick={() => deleteTarget && deleteMutation.mutate(deleteTarget.id)}
                            disabled={deleteMutation.isPending}
                            className="bg-red-600 hover:bg-red-700 text-white"
                        >
                            {deleteMutation.isPending ? "Deleting..." : "Delete Event"}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}

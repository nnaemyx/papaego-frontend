"use client";

import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { CheckCircle2, XCircle, Clock, ShieldCheck, FileText, AlertTriangle, Loader2 } from "lucide-react";
import type { Customer } from "@/lib/types/customer";
import { formatDate } from "@/lib/formatters";
import { adminCustomersApi } from "@/lib/api/customers";

interface CustomerKycSectionProps {
    customer: Customer;
}

function StatusIcon({ status }: { status: "Verified" | "Pending" | "Failed" }) {
    if (status === "Verified") return <CheckCircle2 className="h-4 w-4" style={{ color: "#27ae60" }} />;
    if (status === "Pending") return <Clock className="h-4 w-4" style={{ color: "#a97600" }} />;
    return <XCircle className="h-4 w-4" style={{ color: "#e05555" }} />;
}

export function CustomerKycSection({ customer }: CustomerKycSectionProps) {
    const queryClient = useQueryClient();
    const [rejectionReason, setRejectionReason] = useState("");
    const [showRejectForm, setShowRejectForm] = useState(false);
    const [errorMessage, setErrorMessage] = useState("");

    const kycStatus = customer.kycStatus || "NOT_SUBMITTED";

    // Mutations for KYC status changes
    const startReviewMutation = useMutation({
        mutationFn: () => adminCustomersApi.startKycReview(customer.id),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["admin-customer", customer.id] });
            setErrorMessage("");
        },
        onError: (err: any) => {
            setErrorMessage(err?.response?.data?.error || "Failed to start KYC review. Please try again.");
        }
    });

    const approveKycMutation = useMutation({
        mutationFn: () => adminCustomersApi.approveKyc(customer.id),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["admin-customer", customer.id] });
            setErrorMessage("");
        },
        onError: (err: any) => {
            setErrorMessage(err?.response?.data?.error || "Failed to approve KYC. Please try again.");
        }
    });

    const rejectKycMutation = useMutation({
        mutationFn: (reason: string) => adminCustomersApi.rejectKyc(customer.id, reason),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["admin-customer", customer.id] });
            setShowRejectForm(false);
            setRejectionReason("");
            setErrorMessage("");
        },
        onError: (err: any) => {
            setErrorMessage(err?.response?.data?.error || "Failed to reject KYC. Please try again.");
        }
    });

    const handleRejectSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!rejectionReason.trim()) {
            setErrorMessage("Please enter a rejection reason.");
            return;
        }
        rejectKycMutation.mutate(rejectionReason.trim());
    };

    // Checklist status mapper
    const checklistStatus = 
        kycStatus === "APPROVED" 
            ? "Verified" as const 
            : (kycStatus === "REJECTED" || kycStatus === "NOT_SUBMITTED" 
                ? "Failed" as const 
                : "Pending" as const);

    const kycItems = [
        { label: "Email Verification", status: "Verified" as const },
        { label: "Phone Verification", status: "Verified" as const },
        { label: "BVN Validation", status: checklistStatus },
        { label: "NIN / Government ID", status: checklistStatus },
        { label: "Proof of Address", status: checklistStatus },
        { label: "Face Verification", status: checklistStatus },
    ];

    const getStatusStyles = () => {
        switch (kycStatus) {
            case "APPROVED":
                return { bg: "#eefbf3", border: "#27ae60", text: "#27ae60", label: "Approved" };
            case "REJECTED":
                return { bg: "#fdf2f2", border: "#e05555", text: "#e05555", label: "Rejected" };
            case "UNDER_REVIEW":
                return { bg: "#fffaf0", border: "#a97600", text: "#a97600", label: "Under Review" };
            case "SUBMITTED":
                return { bg: "#f0f7ff", border: "#1890ff", text: "#1890ff", label: "Submitted" };
            case "RESUBMITTED":
                return { bg: "#f9f0ff", border: "#722ed1", text: "#722ed1", label: "Resubmitted" };
            default:
                return { bg: "#f5f5f5", border: "#d9d9d9", text: "#6b7078", label: "Not Submitted" };
        }
    };

    const statusStyle = getStatusStyles();

    return (
        <div className="space-y-6">
            {/* Error Message Alert */}
            {errorMessage && (
                <div 
                    className="p-4 rounded-xl border flex items-start gap-3"
                    style={{ backgroundColor: "#fdf2f2", borderColor: "#f5c2c2", color: "#e05555" }}
                >
                    <AlertTriangle className="h-5 w-5 flex-shrink-0 mt-0.5" />
                    <div>
                        <h4 className="font-semibold text-sm">Action Failed</h4>
                        <p className="text-xs mt-1">{errorMessage}</p>
                    </div>
                </div>
            )}

            {/* KYC Status & Admin Action Panel */}
            <div
                className="rounded-xl p-6 border shadow-sm"
                style={{ backgroundColor: "white", borderColor: "#e1e3e6" }}
            >
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                    <div className="flex items-start gap-4">
                        <div 
                            className="p-3 rounded-xl flex items-center justify-center flex-shrink-0"
                            style={{ backgroundColor: statusStyle.bg, color: statusStyle.text }}
                        >
                            <ShieldCheck className="h-6 w-6" />
                        </div>
                        <div>
                            <h3 className="font-semibold text-base" style={{ color: "#2b2f33" }}>
                                KYC Identity Verification
                            </h3>
                            <p className="text-sm mt-1" style={{ color: "#6b7078" }}>
                                Current Stage: <span className="font-semibold" style={{ color: statusStyle.text }}>{statusStyle.label}</span>
                            </p>
                            {kycStatus === "REJECTED" && customer.kycRejectionReason && (
                                <div className="mt-3 p-3 rounded-lg border text-sm" style={{ backgroundColor: "#fdf2f2", borderColor: "#f5c2c2", color: "#e05555" }}>
                                    <p className="font-semibold text-xs uppercase tracking-wider">Rejection Reason</p>
                                    <p className="mt-1 font-medium">{customer.kycRejectionReason}</p>
                                </div>
                            )}
                            {kycStatus === "APPROVED" && customer.kycReviewedAt && (
                                <p className="text-xs mt-2" style={{ color: "#9aa0a6" }}>
                                    Approved on {formatDate(customer.kycReviewedAt)}
                                </p>
                            )}
                        </div>
                    </div>

                    {/* Action Buttons based on status */}
                    <div className="flex flex-wrap items-center gap-3">
                        {(kycStatus === "SUBMITTED" || kycStatus === "RESUBMITTED") && (
                            <button
                                onClick={() => startReviewMutation.mutate()}
                                disabled={startReviewMutation.isPending}
                                className="px-5 py-2.5 rounded-lg text-sm font-semibold text-white shadow-sm transition-all hover:opacity-90 flex items-center gap-2"
                                style={{ backgroundColor: "#c9a227" }}
                            >
                                {startReviewMutation.isPending ? (
                                    <>
                                        <Loader2 className="h-4 w-4 animate-spin" />
                                        Updating...
                                    </>
                                ) : (
                                    "Start KYC Review"
                                )}
                            </button>
                        )}

                        {kycStatus === "UNDER_REVIEW" && !showRejectForm && (
                            <>
                                <button
                                    onClick={() => approveKycMutation.mutate()}
                                    disabled={approveKycMutation.isPending}
                                    className="px-5 py-2.5 rounded-lg text-sm font-semibold text-white shadow-sm transition-all hover:bg-green-700 flex items-center gap-2"
                                    style={{ backgroundColor: "#27ae60" }}
                                >
                                    {approveKycMutation.isPending ? (
                                        <>
                                            <Loader2 className="h-4 w-4 animate-spin" />
                                            Approving...
                                        </>
                                    ) : (
                                        "Approve Verification"
                                    )}
                                </button>
                                <button
                                    onClick={() => setShowRejectForm(true)}
                                    className="px-5 py-2.5 rounded-lg text-sm font-semibold text-white shadow-sm transition-all hover:bg-red-700 flex items-center gap-2"
                                    style={{ backgroundColor: "#e05555" }}
                                >
                                    Reject & Request Re-upload
                                </button>
                            </>
                        )}
                    </div>
                </div>

                {/* Inline Rejection Reason Form */}
                {showRejectForm && (
                    <form onSubmit={handleRejectSubmit} className="mt-6 pt-6 border-t" style={{ borderColor: "#e1e3e6" }}>
                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-semibold mb-2" style={{ color: "#2b2f33" }}>
                                    Reason for Rejection / Requested Documents
                                </label>
                                <textarea
                                    value={rejectionReason}
                                    onChange={(e) => setRejectionReason(e.target.value)}
                                    placeholder="Explain why the documents were rejected (e.g. 'Government ID is blurry' or 'Proof of Address is expired'). This message will be sent to the customer so they know what to re-upload."
                                    rows={3}
                                    className="w-full p-3 rounded-lg border text-sm focus:outline-none focus:ring-1 focus:ring-[#c9a227] focus:border-[#c9a227]"
                                    style={{ borderColor: "#d9d9d9" }}
                                    required
                                />
                            </div>
                            <div className="flex items-center gap-3">
                                <button
                                    type="submit"
                                    disabled={rejectKycMutation.isPending}
                                    className="px-5 py-2.5 rounded-lg text-sm font-semibold text-white shadow-sm hover:opacity-90 flex items-center gap-2"
                                    style={{ backgroundColor: "#e05555" }}
                                >
                                    {rejectKycMutation.isPending ? (
                                        <>
                                            <Loader2 className="h-4 w-4 animate-spin" />
                                            Rejecting...
                                        </>
                                    ) : (
                                        "Confirm Rejection"
                                    )}
                                </button>
                                <button
                                    type="button"
                                    onClick={() => {
                                        setShowRejectForm(false);
                                        setRejectionReason("");
                                        setErrorMessage("");
                                    }}
                                    className="px-4 py-2.5 rounded-lg text-sm font-medium border hover:bg-gray-50 transition-colors"
                                    style={{ borderColor: "#d9d9d9", color: "#6b7078", backgroundColor: "white" }}
                                >
                                    Cancel
                                </button>
                            </div>
                        </div>
                    </form>
                )}
            </div>

            {/* KYC Progress Checklist */}
            <div
                className="rounded-xl p-5 border shadow-sm"
                style={{ backgroundColor: "white", borderColor: "#e1e3e6" }}
            >
                <h3 className="font-semibold text-base mb-4" style={{ color: "#2b2f33" }}>
                    Verification Checklist
                </h3>
                <div className="space-y-3">
                    {kycItems.map((item) => (
                        <div
                            key={item.label}
                            className="flex items-center justify-between py-2 border-b"
                            style={{ borderColor: "#f0f0f0" }}
                        >
                            <div className="flex items-center gap-3">
                                <StatusIcon status={item.status} />
                                <span className="text-sm" style={{ color: "#2b2f33" }}>
                                    {item.label}
                                </span>
                            </div>
                            <span
                                className="text-xs font-medium"
                                style={{
                                    color:
                                        item.status === "Verified"
                                            ? "#27ae60"
                                            : item.status === "Pending"
                                                ? "#a97600"
                                                : "#e05555",
                                }}
                            >
                                {item.status}
                            </span>
                        </div>
                    ))}
                </div>
            </div>

            {/* Submitted Documents Viewer */}
            <div
                className="rounded-xl p-5 border shadow-sm"
                style={{ backgroundColor: "white", borderColor: "#e1e3e6" }}
            >
                <h3 className="font-semibold text-base mb-4" style={{ color: "#2b2f33" }}>
                    Submitted Documents
                </h3>
                <div className="space-y-4">
                    {[
                        { 
                            doc: "Government ID", 
                            date: formatDate(customer.dateJoined), 
                            status: customer.governmentIdUrl ? (kycStatus === "APPROVED" ? "Verified" as const : "Pending" as const) : "Missing" as const, 
                            url: customer.governmentIdUrl 
                        },
                        { 
                            doc: "Proof of Address", 
                            date: formatDate(customer.dateJoined), 
                            status: customer.proofOfAddressUrl ? (kycStatus === "APPROVED" ? "Verified" as const : "Pending" as const) : "Missing" as const, 
                            url: customer.proofOfAddressUrl 
                        },
                        { 
                            doc: "Selfie Photo", 
                            date: formatDate(customer.dateJoined), 
                            status: kycStatus === "APPROVED" ? "Verified" as const : "Pending" as const, 
                            url: null 
                        },
                    ].map((item) => (
                        <div
                            key={item.doc}
                            className="flex flex-col sm:flex-row sm:items-center justify-between p-4 rounded-xl gap-4 border"
                            style={{ backgroundColor: "#f9fafb", borderColor: "#f3f4f6" }}
                        >
                            <div className="flex items-start gap-3">
                                <div className="p-2.5 rounded-lg bg-white border flex items-center justify-center text-gray-500 shadow-sm">
                                    <FileText className="h-5 w-5" />
                                </div>
                                <div>
                                    <p className="text-sm font-semibold" style={{ color: "#2b2f33" }}>
                                        {item.doc}
                                    </p>
                                    <p className="text-xs mt-0.5" style={{ color: "#9aa0a6" }}>
                                        {item.url ? `Uploaded: ${item.date}` : "Not uploaded yet"}
                                    </p>
                                </div>
                            </div>
                            <div className="flex items-center gap-4">
                                {item.url && (
                                    <a
                                        href={item.url.startsWith('http') ? item.url : `https://${item.url.replace(/^\/?/, '')}`}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="text-xs font-semibold px-3 py-1.5 rounded-md border bg-white shadow-sm hover:bg-gray-50 transition-colors"
                                        style={{ color: "#c9a227", borderColor: "#e1e3e6" }}
                                    >
                                        View Document
                                    </a>
                                )}
                                <span
                                    className="text-xs font-semibold px-2.5 py-1 rounded-full border"
                                    style={{
                                        backgroundColor:
                                            item.status === "Verified"
                                                ? "#eefbf3"
                                                : item.status === "Pending"
                                                    ? "#fffaf0"
                                                    : "#fdf2f2",
                                        borderColor:
                                            item.status === "Verified"
                                                ? "#a3e635"
                                                : item.status === "Pending"
                                                    ? "#fde047"
                                                    : "#fca5a5",
                                        color:
                                            item.status === "Verified"
                                                ? "#27ae60"
                                                : item.status === "Pending"
                                                    ? "#a97600"
                                                    : "#e05555",
                                    }}
                                >
                                    {item.status}
                                </span>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}

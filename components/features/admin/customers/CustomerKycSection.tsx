"use client";

import { CheckCircle2, XCircle, Clock } from "lucide-react";
import type { Customer } from "@/lib/types/customer";
import { formatDate } from "@/lib/formatters";

interface CustomerKycSectionProps {
    customer: Customer;
}

function StatusIcon({ status }: { status: "Verified" | "Pending" | "Failed" }) {
    if (status === "Verified") return <CheckCircle2 className="h-4 w-4" style={{ color: "#27ae60" }} />;
    if (status === "Pending") return <Clock className="h-4 w-4" style={{ color: "#a97600" }} />;
    return <XCircle className="h-4 w-4" style={{ color: "#e05555" }} />;
}

export function CustomerKycSection({ customer }: CustomerKycSectionProps) {
    const kycItems = [
        { label: "Email Verification", status: "Verified" as const },
        { label: "Phone Verification", status: "Verified" as const },
        { label: "BVN Validation", status: customer.verificationStatus === "Verified" ? "Verified" as const : "Pending" as const },
        { label: "NIN / Government ID", status: customer.verificationStatus === "Verified" ? "Verified" as const : "Pending" as const },
        { label: "Proof of Address", status: customer.verificationStatus === "Verified" ? "Verified" as const : "Pending" as const },
        { label: "Face Verification", status: customer.verificationStatus },
    ];

    return (
        <div className="space-y-6">
            {/* KYC Score */}
            <div
                className="rounded-xl p-5 border"
                style={{ backgroundColor: "white", borderColor: "#e1e3e6" }}
            >
                <div className="flex items-center justify-between mb-4">
                    <h3 className="font-semibold text-base" style={{ color: "#2b2f33" }}>
                        KYC Level
                    </h3>
                    <span
                        className="text-2xl font-bold"
                        style={{
                            color:
                                customer.verificationStatus === "Verified"
                                    ? "#27ae60"
                                    : customer.verificationStatus === "Pending"
                                        ? "#a97600"
                                        : "#e05555",
                        }}
                    >
                        {customer.verificationStatus === "Verified" ? "Completed" : "Incomplete"}
                    </span>
                </div>
                <div className="w-full h-2 rounded-full" style={{ backgroundColor: "#e1e3e6" }}>
                    <div
                        className="h-full rounded-full"
                        style={{
                            width: customer.verificationStatus === "Verified" ? "100%" : "50%",
                            backgroundColor: customer.verificationStatus === "Verified" ? "#27ae60" : "#f0cd00",
                        }}
                    />
                </div>
            </div>

            {/* KYC Checklist */}
            <div
                className="rounded-xl p-5 border"
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

            {/* Submitted Documents */}
            <div
                className="rounded-xl p-5 border"
                style={{ backgroundColor: "white", borderColor: "#e1e3e6" }}
            >
                <div className="flex justify-between items-center mb-4">
                    <h3 className="font-semibold text-base" style={{ color: "#2b2f33" }}>
                        Submitted Documents
                    </h3>
                </div>
                <div className="space-y-3">
                    {[
                        { doc: "Government ID", date: formatDate(customer.dateJoined), status: customer.governmentIdUrl ? customer.verificationStatus : "Missing", url: customer.governmentIdUrl },
                        { doc: "Proof of Address", date: formatDate(customer.dateJoined), status: customer.proofOfAddressUrl ? customer.verificationStatus : "Missing", url: customer.proofOfAddressUrl },
                        { doc: "Selfie Photo", date: formatDate(customer.dateJoined), status: customer.verificationStatus, url: null },
                    ].map((item) => (
                        <div
                            key={item.doc}
                            className="flex flex-col sm:flex-row sm:items-center justify-between p-3 rounded-lg gap-3"
                            style={{ backgroundColor: "#f6f6f6" }}
                        >
                            <div>
                                <p className="text-sm font-medium" style={{ color: "#2b2f33" }}>
                                    {item.doc}
                                </p>
                                <p className="text-xs mt-0.5" style={{ color: "#9aa0a6" }}>
                                    {item.url ? `Uploaded: ${item.date}` : "Not uploaded yet"}
                                </p>
                            </div>
                            <div className="flex items-center gap-4">
                                {item.url && (
                                    <a
                                        href={item.url.startsWith("http") ? item.url : `${process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000"}${item.url}`}
                                        target="_blank"
                                        rel="noreferrer"
                                        className="text-xs font-semibold hover:underline"
                                        style={{ color: "#1890ff" }}
                                    >
                                        View Document
                                    </a>
                                )}
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
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}

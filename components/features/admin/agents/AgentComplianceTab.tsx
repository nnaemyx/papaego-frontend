"use client";

import { CheckCircle2, XCircle, AlertTriangle, Clock } from "lucide-react";
import type { Agent } from "@/lib/types/agent";

interface AgentComplianceTabProps {
    agent: Agent;
}

function StatusIcon({ status }: { status: "pass" | "fail" | "warning" | "pending" }) {
    if (status === "pass") return <CheckCircle2 className="h-4 w-4" style={{ color: "#27ae60" }} />;
    if (status === "fail") return <XCircle className="h-4 w-4" style={{ color: "#e05555" }} />;
    if (status === "warning") return <AlertTriangle className="h-4 w-4" style={{ color: "#f0cd00" }} />;
    return <Clock className="h-4 w-4" style={{ color: "#9aa0a6" }} />;
}

export function AgentComplianceTab({ agent }: AgentComplianceTabProps) {
    const complianceItems = [
        { label: "Identity Verification (NIN)", status: "pass" as const, note: "Verified on 15 Jan 2025" },
        { label: "BVN Validation", status: "pass" as const, note: "Matched successfully" },
        { label: "AML Screening", status: "pass" as const, note: "No watchlist matches found" },
        { label: "PEP Check", status: "pass" as const, note: "Not politically exposed" },
        { label: "High-Value Trade Monitoring", status: "warning" as const, note: "2 trades flagged for manual review" },
        {
            label: "KYC Level",
            status: agent.status === "Pending Verification" ? ("pending" as const) : ("pass" as const),
            note: agent.status === "Pending Verification" ? "Awaiting document review" : "Full KYC completed",
        },
    ];

    const flags = [
        {
            id: "#PE-24098",
            date: "20/12/2025",
            reason: "Trade value exceeded ₦5M threshold",
            severity: "Medium",
            resolved: true,
        },
        {
            id: "#PE-24072",
            date: "05/12/2025",
            reason: "Multiple same-day trades from single customer",
            severity: "Low",
            resolved: true,
        },
    ];

    return (
        <div className="space-y-6">
            {/* Compliance Score */}
            <div
                className="rounded-xl p-5 border"
                style={{ backgroundColor: "white", borderColor: "#e1e3e6" }}
            >
                <div className="flex items-center justify-between mb-4">
                    <h3 className="font-semibold text-base" style={{ color: "#2b2f33" }}>
                        Compliance Score
                    </h3>
                    <span
                        className="text-3xl font-bold"
                        style={{ color: "#27ae60" }}
                    >
                        92/100
                    </span>
                </div>
                <div className="w-full h-2 rounded-full" style={{ backgroundColor: "#e1e3e6" }}>
                    <div
                        className="h-full rounded-full"
                        style={{ width: "92%", backgroundColor: "#27ae60" }}
                    />
                </div>
                <p className="text-xs mt-2" style={{ color: "#6b7078" }}>
                    Agent is compliant with platform standards. Minor flags have been resolved.
                </p>
            </div>

            {/* Compliance Checklist */}
            <div
                className="rounded-xl p-5 border"
                style={{ backgroundColor: "white", borderColor: "#e1e3e6" }}
            >
                <h3 className="font-semibold text-base mb-4" style={{ color: "#2b2f33" }}>
                    Compliance Checklist
                </h3>
                <div className="space-y-3">
                    {complianceItems.map((item) => (
                        <div
                            key={item.label}
                            className="flex items-center justify-between py-2 border-b"
                            style={{ borderColor: "#f0f0f0" }}
                        >
                            <div className="flex items-center gap-3">
                                <StatusIcon status={item.status} />
                                <div>
                                    <p className="text-sm font-medium" style={{ color: "#2b2f33" }}>
                                        {item.label}
                                    </p>
                                    <p className="text-xs" style={{ color: "#9aa0a6" }}>
                                        {item.note}
                                    </p>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Flagged Trades */}
            <div
                className="rounded-xl p-5 border"
                style={{ backgroundColor: "white", borderColor: "#e1e3e6" }}
            >
                <h3 className="font-semibold text-base mb-4" style={{ color: "#2b2f33" }}>
                    Flagged Trades
                </h3>
                {flags.length === 0 ? (
                    <p className="text-sm text-center py-4" style={{ color: "#9aa0a6" }}>
                        No flags on record.
                    </p>
                ) : (
                    <div className="space-y-3">
                        {flags.map((flag) => (
                            <div
                                key={flag.id}
                                className="p-4 rounded-lg border-l-4"
                                style={{
                                    backgroundColor: "#f6f6f6",
                                    borderLeftColor: flag.resolved ? "#27ae60" : "#e05555",
                                }}
                            >
                                <div className="flex items-start justify-between">
                                    <div>
                                        <p className="text-sm font-semibold" style={{ color: "#c9a227" }}>
                                            {flag.id}
                                        </p>
                                        <p className="text-xs mt-1" style={{ color: "#2b2f33" }}>
                                            {flag.reason}
                                        </p>
                                        <p className="text-xs mt-1" style={{ color: "#9aa0a6" }}>
                                            {flag.date} · Severity: {flag.severity}
                                        </p>
                                    </div>
                                    <span
                                        className="text-xs font-medium px-2 py-0.5 rounded-full"
                                        style={{
                                            backgroundColor: flag.resolved ? "#e2fded" : "#ffe5e5",
                                            color: flag.resolved ? "#27ae60" : "#e05555",
                                        }}
                                    >
                                        {flag.resolved ? "Resolved" : "Open"}
                                    </span>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}

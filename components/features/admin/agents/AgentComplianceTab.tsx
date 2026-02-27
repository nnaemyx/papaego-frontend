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
    const isVerified = agent.status === "Active" || agent.status === "Verified";
    const isPending = agent.status === "Pending Verification";

    const complianceItems = [
        {
            label: "Identity Verification",
            status: isVerified ? ("pass" as const) : isPending ? ("pending" as const) : ("fail" as const),
            note: isVerified ? "Successfully verified" : isPending ? "Awaiting manual review" : "Verification failed or not started"
        },
        {
            label: "Document Sufficiency",
            status: agent.agentProfile?.governmentIdUrl ? ("pass" as const) : ("pending" as const),
            note: agent.agentProfile?.governmentIdUrl ? "Documents uploaded" : "Missing core documents"
        },
        {
            label: "AML Screening",
            status: isVerified ? ("pass" as const) : ("pending" as const),
            note: isVerified ? "Clear" : "Review pending"
        },
        {
            label: "Branch Compliance",
            status: agent.branch ? ("pass" as const) : ("warning" as const),
            note: agent.branch ? `Assigned to ${agent.branch}` : "No branch assigned"
        },
    ];

    const flags = agent.statistics?.flaggedTransactions && agent.statistics.flaggedTransactions > 0 ? [
        {
            id: "AUTO-FLAG",
            date: "Recent",
            reason: `${agent.statistics.flaggedTransactions} transactions flagged for threshold violation.`,
            severity: "Medium",
            resolved: false,
        }
    ] : [];

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
                        style={{ color: isVerified ? "#27ae60" : "#f0cd00" }}
                    >
                        {isVerified ? "100/100" : isPending ? "60/100" : "0/100"}
                    </span>
                </div>
                <div className="w-full h-2 rounded-full" style={{ backgroundColor: "#e1e3e6" }}>
                    <div
                        className="h-full rounded-full"
                        style={{ width: isVerified ? "100%" : isPending ? "60%" : "0%", backgroundColor: isVerified ? "#27ae60" : "#f0cd00" }}
                    />
                </div>
                <p className="text-xs mt-2" style={{ color: "#6b7078" }}>
                    {isVerified ? "Agent is fully compliant." : "Agent compliance check in progress."}
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

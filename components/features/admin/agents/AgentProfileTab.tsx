"use client";

import { Badge } from "@/components/ui/badge";
import { CheckCircle2, XCircle, Clock } from "lucide-react";
import type { Agent } from "@/lib/types/agent";

interface AgentProfileTabProps {
    agent: Agent;
}

function VerificationBadge({ status }: { status: string }) {
    if (status === "Verified" || status === "Completed") {
        return (
            <span className="flex items-center gap-1 text-xs font-medium" style={{ color: "#27ae60" }}>
                <CheckCircle2 className="h-3.5 w-3.5" /> {status}
            </span>
        );
    }
    if (status === "Pending") {
        return (
            <span className="flex items-center gap-1 text-xs font-medium" style={{ color: "#a97600" }}>
                <Clock className="h-3.5 w-3.5" /> {status}
            </span>
        );
    }
    return (
        <span className="flex items-center gap-1 text-xs font-medium" style={{ color: "#e05555" }}>
            <XCircle className="h-3.5 w-3.5" /> {status}
        </span>
    );
}

export function AgentProfileTab({ agent }: AgentProfileTabProps) {
    return (
        <div className="space-y-6">
            {/* Personal Details */}
            <div
                className="rounded-xl p-5 border"
                style={{ backgroundColor: "white", borderColor: "#e1e3e6" }}
            >
                <h3 className="font-semibold text-base mb-4" style={{ color: "#2b2f33" }}>
                    Personal Details
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-3">
                    {[
                        { label: "First Name", value: agent.name.split(" ")[0] || "—" },
                        { label: "Last Name", value: agent.name.split(" ")[1] || "—" },
                        { label: "Email Address", value: agent.email },
                        { label: "Phone Number", value: agent.phone || "—" },
                        { label: "Date of Birth", value: "15/03/1992" },
                        { label: "Home Address", value: "12 Adeola Street, Lekki, Lagos" },
                    ].map((item) => (
                        <div key={item.label} className="py-2 border-b" style={{ borderColor: "#f0f0f0" }}>
                            <p className="text-xs mb-1" style={{ color: "#9aa0a6" }}>
                                {item.label}
                            </p>
                            <p className="text-sm font-medium" style={{ color: "#2b2f33" }}>
                                {item.value}
                            </p>
                        </div>
                    ))}
                </div>
            </div>

            {/* Role & Region */}
            <div
                className="rounded-xl p-5 border"
                style={{ backgroundColor: "white", borderColor: "#e1e3e6" }}
            >
                <h3 className="font-semibold text-base mb-4" style={{ color: "#2b2f33" }}>
                    Role & Region
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-3">
                    {[
                        { label: "Assigned Role", value: agent.role },
                        { label: "Region", value: agent.region },
                        { label: "Date Joined", value: new Date(agent.createdAt).toLocaleDateString("en-GB") },
                        { label: "Agent ID", value: agent.agentId },
                    ].map((item) => (
                        <div key={item.label} className="py-2 border-b" style={{ borderColor: "#f0f0f0" }}>
                            <p className="text-xs mb-1" style={{ color: "#9aa0a6" }}>
                                {item.label}
                            </p>
                            <p className="text-sm font-medium" style={{ color: "#2b2f33" }}>
                                {item.value}
                            </p>
                        </div>
                    ))}
                </div>
            </div>

            {/* Onboarding & Verification */}
            <div
                className="rounded-xl p-5 border"
                style={{ backgroundColor: "white", borderColor: "#e1e3e6" }}
            >
                <h3 className="font-semibold text-base mb-4" style={{ color: "#2b2f33" }}>
                    Onboarding & Verification
                </h3>
                <div className="space-y-3">
                    {[
                        { label: "Email Verification", status: "Verified" },
                        { label: "NIN / Government ID", status: "Verified" },
                        { label: "Proof of Address", status: "Verified" },
                        { label: "BVN Check", status: "Verified" },
                        { label: "KYC Completion", status: agent.status === "Pending Verification" ? "Pending" : "Completed" },
                    ].map((item) => (
                        <div
                            key={item.label}
                            className="flex items-center justify-between py-2 border-b"
                            style={{ borderColor: "#f0f0f0" }}
                        >
                            <span className="text-sm" style={{ color: "#6b7078" }}>
                                {item.label}
                            </span>
                            <VerificationBadge status={item.status} />
                        </div>
                    ))}
                </div>
            </div>

            {/* Documents */}
            <div
                className="rounded-xl p-5 border"
                style={{ backgroundColor: "white", borderColor: "#e1e3e6" }}
            >
                <h3 className="font-semibold text-base mb-4" style={{ color: "#2b2f33" }}>
                    Submitted Documents
                </h3>
                <div className="space-y-3">
                    {[
                        { doc: "Government ID (NIN)", uploaded: "15/01/2025", status: "Verified" },
                        { doc: "Utility Bill (Proof of Address)", uploaded: "15/01/2025", status: "Verified" },
                        { doc: "Passport Photograph", uploaded: "15/01/2025", status: "Verified" },
                    ].map((item) => (
                        <div
                            key={item.doc}
                            className="flex items-center justify-between p-3 rounded-lg"
                            style={{ backgroundColor: "#f6f6f6" }}
                        >
                            <div>
                                <p className="text-sm font-medium" style={{ color: "#2b2f33" }}>
                                    {item.doc}
                                </p>
                                <p className="text-xs mt-0.5" style={{ color: "#9aa0a6" }}>
                                    Uploaded: {item.uploaded}
                                </p>
                            </div>
                            <VerificationBadge status={item.status} />
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}

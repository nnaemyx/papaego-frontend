"use client";

import { Badge } from "@/components/ui/badge";
import { CheckCircle2, XCircle, Clock } from "lucide-react";
import type { Agent } from "@/lib/types/agent";

interface AgentProfileTabProps {
    // ...
    /* (I will use multi_replace instead to target exactly) */
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
    const profile = agent.agentProfile;
    const regionParts = agent.region?.split(" - ");
    const state = regionParts?.[0] || agent.region || "—";
    const market = regionParts?.[1] || "—";

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
                        { label: "Last Name", value: agent.name.split(" ").slice(1).join(" ") || "—" },
                        { label: "Email Address", value: agent.email },
                        { label: "Phone Number", value: agent.phone || "—" },
                        { label: "Date of Birth", value: profile?.dateOfBirth || "—" },
                        { label: "Home Address", value: profile?.homeAddress || "—" },
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
                        { label: "State", value: state },
                        { label: "Market", value: market },
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
                        { label: "Onboarding Status", status: profile?.onboardingStatus || "Pending" },
                        { label: "KYC / ID Verification", status: agent.status === "Active" ? "Verified" : "Pending" },
                        { label: "License / ID Number", status: profile?.licenseId || "Not Provided" },
                    ].map((item) => (
                        <div
                            key={item.label}
                            className="flex items-center justify-between py-2 border-b"
                            style={{ borderColor: "#f0f0f0" }}
                        >
                            <span className="text-sm" style={{ color: "#6b7078" }}>
                                {item.label}
                            </span>
                            {item.status === "Verified" || item.status === "Completed" ? (
                                <VerificationBadge status={item.status} />
                            ) : (
                                <span className="text-sm font-medium" style={{ color: "#2b2f33" }}>{item.status}</span>
                            )}
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
                    {profile?.governmentIdUrl ? (
                        <div
                            className="flex items-center justify-between p-3 rounded-lg"
                            style={{ backgroundColor: "#f6f6f6" }}
                        >
                            <div>
                                <p className="text-sm font-medium" style={{ color: "#2b2f33" }}>
                                    Government ID (NIN/International Passport)
                                </p>
                                <a
                                href={profile.governmentIdUrl}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="text-xs mt-0.5"
                                    style={{ color: "#c9a227" }}
                                >
                                    View Document
                                </a>
                            </div>
                            <VerificationBadge status={agent.status === "Active" ? "Verified" : "Pending"} />
                        </div>
                    ) : (
                        <p className="text-sm py-4 text-center" style={{ color: "#6b7078" }}>No government ID submitted.</p>
                    )}

                    {profile?.proofOfAddressUrl ? (
                        <div
                            className="flex items-center justify-between p-3 rounded-lg"
                            style={{ backgroundColor: "#f6f6f6" }}
                        >
                            <div>
                                <p className="text-sm font-medium" style={{ color: "#2b2f33" }}>
                                    Proof of Address (Utility Bill)
                                </p>
                                <a
                                href={profile.proofOfAddressUrl}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="text-xs mt-0.5"
                                    style={{ color: "#c9a227" }}
                                >
                                    View Document
                                </a>
                            </div>
                            <VerificationBadge status={agent.status === "Active" ? "Verified" : "Pending"} />
                        </div>
                    ) : (
                        <p className="text-sm py-4 text-center" style={{ color: "#6b7078" }}>No proof of address submitted.</p>
                    )}
                </div>
            </div>
        </div>
    );
}

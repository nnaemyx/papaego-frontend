"use client";

import type { Agent } from "@/lib/types/agent";

interface AgentActivityTabProps {
    agent: Agent;
}

const timeline = [
    { date: "25 Dec 2025", time: "11:16 AM", event: "Trade #PE-24118 completed — Buy USD ₦3.25M", type: "trade" },
    { date: "25 Dec 2025", time: "10:30 AM", event: "Customer Peter Okafor ID verified", type: "kyc" },
    { date: "24 Dec 2025", time: "03:15 PM", event: "Logged into the platform", type: "login" },
    { date: "24 Dec 2025", time: "02:00 PM", event: "Trade #PE-24111 initiated — Sell GBP £800", type: "trade" },
    { date: "23 Dec 2025", time: "11:00 AM", event: "Commission payout processed — ₦45,000", type: "commission" },
    { date: "22 Dec 2025", time: "09:30 AM", event: "Logged into the platform", type: "login" },
    { date: "20 Dec 2025", time: "04:00 PM", event: "Trade #PE-24098 flagged for high-value monitoring", type: "flag" },
    { date: "15 Dec 2025", time: "01:20 PM", event: "New customer onboarded — Laura Smith", type: "customer" },
];

function getTypeColor(type: string) {
    switch (type) {
        case "trade": return "#1890ff";
        case "kyc": return "#9333ea";
        case "login": return "#27ae60";
        case "commission": return "#c9a227";
        case "flag": return "#e05555";
        case "customer": return "#08a965";
        default: return "#9aa0a6";
    }
}

function getTypeLabel(type: string) {
    switch (type) {
        case "trade": return "Trade";
        case "kyc": return "KYC";
        case "login": return "Login";
        case "commission": return "Commission";
        case "flag": return "Flag";
        case "customer": return "Customer";
        default: return "Event";
    }
}

export function AgentActivityTab({ agent }: AgentActivityTabProps) {
    return (
        <div className="space-y-6">
            {/* Summary stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {[
                    { label: "Logins (30d)", value: "22" },
                    { label: "Trades (30d)", value: "38" },
                    { label: "Customers Served", value: "14" },
                    { label: "Flags Raised", value: "2" },
                ].map((s) => (
                    <div
                        key={s.label}
                        className="rounded-xl p-4 border text-center"
                        style={{ backgroundColor: "white", borderColor: "#e1e3e6" }}
                    >
                        <p className="text-2xl font-bold" style={{ color: "#2b2f33" }}>{s.value}</p>
                        <p className="text-xs mt-1" style={{ color: "#6b7078" }}>{s.label}</p>
                    </div>
                ))}
            </div>

            {/* Timeline */}
            <div
                className="rounded-xl p-5 border"
                style={{ backgroundColor: "white", borderColor: "#e1e3e6" }}
            >
                <h3 className="font-semibold text-base mb-5" style={{ color: "#2b2f33" }}>
                    Activity Timeline
                </h3>
                <div className="relative">
                    {/* Vertical line */}
                    <div
                        className="absolute left-[7px] top-0 bottom-0 w-0.5"
                        style={{ backgroundColor: "#e1e3e6" }}
                    />
                    <div className="space-y-5 pl-6">
                        {timeline.map((item, i) => (
                            <div key={i} className="relative">
                                {/* Dot */}
                                <div
                                    className="absolute -left-6 w-3.5 h-3.5 rounded-full border-2 top-0.5"
                                    style={{
                                        backgroundColor: getTypeColor(item.type),
                                        borderColor: "white",
                                    }}
                                />
                                <div className="flex items-start justify-between gap-4">
                                    <div>
                                        <p className="text-sm" style={{ color: "#2b2f33" }}>
                                            {item.event}
                                        </p>
                                        <p className="text-xs mt-0.5" style={{ color: "#9aa0a6" }}>
                                            {item.date} · {item.time}
                                        </p>
                                    </div>
                                    <span
                                        className="text-xs font-medium px-2 py-0.5 rounded-full whitespace-nowrap flex-shrink-0"
                                        style={{
                                            backgroundColor: `${getTypeColor(item.type)}20`,
                                            color: getTypeColor(item.type),
                                        }}
                                    >
                                        {getTypeLabel(item.type)}
                                    </span>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}

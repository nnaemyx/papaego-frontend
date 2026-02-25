"use client";

import type { Customer } from "@/lib/types/customer";

interface CustomerLinkedAgentsSectionProps {
    customer: Customer;
}

const mockAgents = [
    { name: "Francis James", agentId: "#PE-A0021", role: "Senior Agent", region: "Nigeria", tradesHandled: 12 },
    { name: "Ibrahim Adamu", agentId: "#PE-A0034", role: "Agent", region: "Nigeria", tradesHandled: 3 },
];

export function CustomerLinkedAgentsSection({ customer }: CustomerLinkedAgentsSectionProps) {
    return (
        <div className="space-y-4">
            <div
                className="rounded-xl p-5 border"
                style={{ backgroundColor: "white", borderColor: "#e1e3e6" }}
            >
                <h3 className="font-semibold text-base mb-4" style={{ color: "#2b2f33" }}>
                    Assigned Agents
                </h3>
                <p className="text-sm mb-4" style={{ color: "#6b7078" }}>
                    These agents have handled transactions for {customer.name}.
                </p>
                <div className="space-y-3">
                    {mockAgents.map((agent) => (
                        <div
                            key={agent.agentId}
                            className="flex items-center justify-between p-4 rounded-xl"
                            style={{ backgroundColor: "#f6f6f6" }}
                        >
                            <div className="flex items-center gap-3">
                                <div
                                    className="w-9 h-9 rounded-full flex items-center justify-center text-white text-sm font-bold"
                                    style={{ backgroundColor: "#c9a227" }}
                                >
                                    {agent.name.charAt(0)}
                                </div>
                                <div>
                                    <p className="text-sm font-medium" style={{ color: "#2b2f33" }}>
                                        {agent.name}
                                    </p>
                                    <p className="text-xs" style={{ color: "#9aa0a6" }}>
                                        {agent.agentId} · {agent.role} · {agent.region}
                                    </p>
                                </div>
                            </div>
                            <div className="text-right">
                                <p className="text-sm font-bold" style={{ color: "#2b2f33" }}>
                                    {agent.tradesHandled}
                                </p>
                                <p className="text-xs" style={{ color: "#9aa0a6" }}>
                                    trades handled
                                </p>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}

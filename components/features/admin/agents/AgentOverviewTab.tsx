"use client";

import { Badge } from "@/components/ui/badge";
import { TrendingUp, TrendingDown, Activity, Clock } from "lucide-react";
import type { Agent } from "@/lib/types/agent";
import { getStatusColor } from "@/lib/formatters";

interface AgentOverviewTabProps {
    agent: Agent;
}

const statCards = (agent: Agent) => [
    {
        label: "Total Trades",
        value: agent.statistics?.totalTrades || 0,
        change: "Total",
        isPositive: true,
        icon: Activity,
        iconBg: "#e2fded",
        iconColor: "#27ae60",
    },
    {
        label: "Completed Trades",
        value: agent.statistics?.completedTrades || 0,
        change: "Done",
        isPositive: true,
        icon: Clock,
        iconBg: "#fff8ce",
        iconColor: "#a97600",
    },
    {
        label: "Flagged Transactions",
        value: agent.statistics?.flaggedTransactions || 0,
        change: "Alert",
        isPositive: false,
        icon: Activity,
        iconBg: "#ffe4e4",
        iconColor: "#e05555",
    },
    {
        label: "Active Trades",
        value: agent.statistics?.activeTrades || 0,
        change: "Live",
        isPositive: true,
        icon: Activity,
        iconBg: "#dbeafe",
        iconColor: "#1890ff",
    },
];

export function AgentOverviewTab({ agent }: AgentOverviewTabProps) {
    const cards = statCards(agent);

    // Recent activity mocked for overview but could be merged later
    const recentActivity = [
        { time: "Today", event: "General profile overview active", type: "info" },
        { time: "System", event: `Joined on ${new Date(agent.createdAt).toLocaleDateString()}`, type: "success" },
    ];

    return (
        <div className="space-y-6">
            {/* Stats Row */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                {cards.map((stat) => {
                    const Icon = stat.icon;
                    return (
                        <div
                            key={stat.label}
                            className="rounded-xl p-4 border"
                            style={{ backgroundColor: "white", borderColor: "#e1e3e6" }}
                        >
                            <div className="flex items-center justify-between mb-3">
                                <div
                                    className="w-9 h-9 rounded-lg flex items-center justify-center"
                                    style={{ backgroundColor: stat.iconBg }}
                                >
                                    <Icon className="h-4 w-4" style={{ color: stat.iconColor }} />
                                </div>
                                <span
                                    className="text-xs font-medium flex items-center gap-1"
                                    style={{ color: stat.isPositive ? "#27ae60" : "#e05555" }}
                                >
                                    {stat.isPositive ? (
                                        <TrendingUp className="h-3 w-3" />
                                    ) : (
                                        <TrendingDown className="h-3 w-3" />
                                    )}
                                    {stat.change}
                                </span>
                            </div>
                            <p className="text-2xl font-bold" style={{ color: "#2b2f33" }}>
                                {stat.value}
                            </p>
                            <p className="text-xs mt-1" style={{ color: "#6b7078" }}>
                                {stat.label}
                            </p>
                        </div>
                    );
                })}
            </div>

            {/* Agent Info */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Basic Info */}
                <div
                    className="rounded-xl p-5 border space-y-4"
                    style={{ backgroundColor: "white", borderColor: "#e1e3e6" }}
                >
                    <h3 className="font-semibold text-base" style={{ color: "#2b2f33" }}>
                        Agent Information
                    </h3>
                    <div className="space-y-3">
                        {[
                            { label: "Full Name", value: agent.name },
                            { label: "Email", value: agent.email },
                            { label: "Phone", value: agent.phone || "—" },
                            { label: "Region", value: agent.region },
                            { label: "Classification", value: agent.agentType === "CORPORATE" ? "Corporate Agent" : "Field Agent" },
                            {
                                label: "Status",
                                value: (
                                    <Badge
                                        variant="outline"
                                        className={`text-xs ${getStatusColor(agent.status)}`}
                                    >
                                        {agent.status}
                                    </Badge>
                                ),
                            },
                        ].map((item) => (
                            <div key={item.label} className="flex justify-between items-center py-1 border-b" style={{ borderColor: "#f0f0f0" }}>
                                <span className="text-sm" style={{ color: "#6b7078" }}>
                                    {item.label}
                                </span>
                                <span className="text-sm font-medium" style={{ color: "#2b2f33" }}>
                                    {item.value}
                                </span>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Recent Activity */}
                <div
                    className="rounded-xl p-5 border space-y-4"
                    style={{ backgroundColor: "white", borderColor: "#e1e3e6" }}
                >
                    <h3 className="font-semibold text-base" style={{ color: "#2b2f33" }}>
                        Recent Activity
                    </h3>
                    <div className="space-y-3">
                        {recentActivity.map((item, i) => (
                            <div key={i} className="flex items-start gap-3">
                                <div
                                    className="w-2 h-2 rounded-full mt-1.5 flex-shrink-0"
                                    style={{
                                        backgroundColor:
                                            item.type === "success"
                                                ? "#27ae60"
                                                : item.type === "warning"
                                                    ? "#f0cd00"
                                                    : "#1890ff",
                                    }}
                                />
                                <div className="flex-1">
                                    <p className="text-xs" style={{ color: "#2b2f33" }}>
                                        {item.event}
                                    </p>
                                    <p className="text-xs mt-0.5" style={{ color: "#9aa0a6" }}>
                                        {item.time}
                                    </p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}

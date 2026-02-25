"use client";

import { Badge } from "@/components/ui/badge";
import { TrendingUp, TrendingDown, DollarSign, Activity, Users, Clock } from "lucide-react";
import type { Agent } from "@/lib/types/agent";
import { getStatusColor } from "@/lib/formatters";

interface AgentOverviewTabProps {
    agent: Agent;
}

const statCards = [
    {
        label: "Total Trades",
        value: "248",
        change: "+12%",
        isPositive: true,
        icon: Activity,
        iconBg: "#e2fded",
        iconColor: "#27ae60",
    },
    {
        label: "Total Volume",
        value: "₦124.5M",
        change: "+8.3%",
        isPositive: true,
        icon: DollarSign,
        iconBg: "#dbeafe",
        iconColor: "#1890ff",
    },
    {
        label: "Active Customers",
        value: "64",
        change: "+5",
        isPositive: true,
        icon: Users,
        iconBg: "#f3e8ff",
        iconColor: "#9333ea",
    },
    {
        label: "Avg. Response Time",
        value: "4.2 hrs",
        change: "-0.5 hrs",
        isPositive: true,
        icon: Clock,
        iconBg: "#fff8ce",
        iconColor: "#a97600",
    },
];

export function AgentOverviewTab({ agent }: AgentOverviewTabProps) {
    return (
        <div className="space-y-6">
            {/* Stats Row */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                {statCards.map((stat) => {
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
                            { label: "Role", value: agent.role },
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
                        {[
                            { time: "11:16 AM", event: "Completed trade #PE-24118 (Buy USD)", type: "success" },
                            { time: "10:30 AM", event: "Customer verification for Peter Okafor", type: "info" },
                            { time: "Yesterday", event: "Flagged trade #PE-24097 for review", type: "warning" },
                            { time: "2 days ago", event: "New customer Daniel Foster onboarded", type: "success" },
                            { time: "3 days ago", event: "Commission payout processed ₦45,000", type: "info" },
                        ].map((item, i) => (
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

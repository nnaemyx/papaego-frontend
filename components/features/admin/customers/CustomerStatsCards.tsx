"use client";

import type { CustomerStats } from "@/lib/types/customer";

interface CustomerStatsCardsProps {
    stats: CustomerStats;
    isLoading?: boolean;
}

export function CustomerStatsCards({ stats, isLoading }: CustomerStatsCardsProps) {
    if (isLoading) {
        return (
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                {[1, 2, 3, 4].map((i) => (
                    <div key={i} className="bg-white rounded-xl p-6 border border-gray-200 animate-pulse">
                        <div className="h-4 bg-gray-200 rounded w-1/2 mb-4" />
                        <div className="h-8 bg-gray-200 rounded w-1/3" />
                    </div>
                ))}
            </div>
        );
    }

    const cards = [
        {
            label: "Total Customers",
            value: stats.totalCustomers.toLocaleString(),
            color: "#1890ff",
            bg: "#dbeafe",
        },
        {
            label: "Verified Customers",
            value: stats.verifiedCustomers.toLocaleString(),
            color: "#27ae60",
            bg: "#e2fded",
        },
        {
            label: "High-Value Customers",
            value: stats.highValueCustomers.toLocaleString(),
            color: "#c9a227",
            bg: "#fff8ce",
        },
        {
            label: "Active Today",
            value: stats.activeCustomersToday.toLocaleString(),
            color: "#9333ea",
            bg: "#f3e8ff",
        },
    ];

    return (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {cards.map((card) => (
                <div
                    key={card.label}
                    className="rounded-xl p-5 border"
                    style={{ backgroundColor: "white", borderColor: "#e1e3e6" }}
                >
                    <div
                        className="w-3 h-3 rounded-full mb-3"
                        style={{ backgroundColor: card.color }}
                    />
                    <p
                        className="text-3xl font-bold mb-1"
                        style={{ color: card.color }}
                    >
                        {card.value}
                    </p>
                    <p className="text-sm" style={{ color: "#6b7078" }}>
                        {card.label}
                    </p>
                </div>
            ))}
        </div>
    );
}

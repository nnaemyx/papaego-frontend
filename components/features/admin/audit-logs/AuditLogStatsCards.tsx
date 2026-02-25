"use client";

interface AuditLogStatsCardsProps {
    totalLogs?: number;
    adminActions?: number;
    agentActions?: number;
    systemActions?: number;
    isLoading?: boolean;
}

export function AuditLogStatsCards({
    totalLogs = 0,
    adminActions = 0,
    agentActions = 0,
    systemActions = 0,
    isLoading,
}: AuditLogStatsCardsProps) {
    if (isLoading) {
        return (
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                {[1, 2, 3, 4].map((i) => (
                    <div key={i} className="bg-white rounded-xl p-5 border animate-pulse">
                        <div className="h-4 bg-gray-200 rounded w-1/2 mb-4" />
                        <div className="h-8 bg-gray-200 rounded w-1/3" />
                    </div>
                ))}
            </div>
        );
    }

    const cards = [
        { label: "Total Log Entries", value: totalLogs.toLocaleString(), color: "#2b2f33" },
        { label: "Admin Actions", value: adminActions.toLocaleString(), color: "#c9a227" },
        { label: "Agent Actions", value: agentActions.toLocaleString(), color: "#1890ff" },
        { label: "System Events", value: systemActions.toLocaleString(), color: "#9333ea" },
    ];

    return (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {cards.map((card) => (
                <div
                    key={card.label}
                    className="rounded-xl p-5 border"
                    style={{ backgroundColor: "white", borderColor: "#e1e3e6" }}
                >
                    <p className="text-2xl font-bold" style={{ color: card.color }}>
                        {card.value}
                    </p>
                    <p className="text-sm mt-1" style={{ color: "#6b7078" }}>
                        {card.label}
                    </p>
                </div>
            ))}
        </div>
    );
}

"use client";

interface CommissionStatsCardsProps {
    totalCommissions?: string;
    totalPaid?: string;
    totalPending?: string;
    totalDisputed?: string;
    isLoading?: boolean;
}

export function CommissionStatsCards({
    totalCommissions,
    totalPaid,
    totalPending,
    totalDisputed,
    isLoading,
}: CommissionStatsCardsProps) {
    if (isLoading) {
        return (
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                {[1, 2, 3, 4].map((i) => (
                    <div key={i} className="bg-white rounded-xl p-6 border animate-pulse">
                        <div className="h-4 bg-gray-200 rounded w-1/2 mb-4" />
                        <div className="h-8 bg-gray-200 rounded w-2/3" />
                    </div>
                ))}
            </div>
        );
    }

    const cards = [
        { label: "Total Commissions", value: totalCommissions || "₦0", color: "#c9a227" },
        { label: "Paid Out", value: totalPaid || "₦0", color: "#27ae60" },
        { label: "Pending Payout", value: totalPending || "₦0", color: "#1890ff" },
        { label: "Disputed", value: totalDisputed || "₦0", color: "#e05555" },
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

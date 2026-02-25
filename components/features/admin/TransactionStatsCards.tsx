"use client";

interface TransactionStatsCardsProps {
  totalTransactions: number;
  tradeVolume: string;
  successfulTransactions: number;
  flaggedTransactions: number;
}

export function TransactionStatsCards({
  totalTransactions,
  tradeVolume,
  successfulTransactions,
  flaggedTransactions,
}: TransactionStatsCardsProps) {
  const stats = [
    {
      label: "Total Transactions",
      value: totalTransactions.toLocaleString(),
    },
    {
      label: "Trade Volume",
      value: tradeVolume,
    },
    {
      label: "Successful Transactions",
      value: successfulTransactions.toLocaleString(),
    },
    {
      label: "Flagged Transactions",
      value: flaggedTransactions.toString(),
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
      {stats.map((stat, index) => (
        <div
          key={index}
          className="bg-white rounded-xl border border-gray-200 p-6"
          style={{
            boxShadow: "0px 10px 30px rgba(206, 206, 206, 0.25)",
          }}
        >
          <p className="text-base font-semibold mb-2" style={{ color: "#4a4f55" }}>
            {stat.label}
          </p>
          <p className="text-3xl font-bold" style={{ color: "#2b2f33" }}>
            {stat.value}
          </p>
        </div>
      ))}
    </div>
  );
}

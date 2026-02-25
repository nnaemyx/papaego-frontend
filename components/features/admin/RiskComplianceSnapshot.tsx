"use client";

interface RiskItem {
  label: string;
  value: string;
}

interface RiskComplianceSnapshotProps {
  highValueTrades: string;
  flaggedTrades: string;
  flaggedTradesReview: string;
  flaggedCustomers: string;
}

export function RiskComplianceSnapshot({
  highValueTrades,
  flaggedTrades,
  flaggedTradesReview,
  flaggedCustomers,
}: RiskComplianceSnapshotProps) {
  const items: RiskItem[] = [
    { label: "High-Value Trades", value: highValueTrades },
    { label: "Flagged Trades", value: flaggedTrades },
    { label: "Flagged Trades", value: flaggedTradesReview },
    { label: "Flagged Customers", value: flaggedCustomers },
  ];

  return (
    <div className="bg-white rounded-lg p-6 border border-gray-200">
      <h3 className="text-xl font-bold text-gray-900 mb-6">
        Risk & Compliance Snapshot
      </h3>

      <div className="grid grid-cols-2 gap-6">
        {/* High-Value Trades */}
        <div>
          <p className="text-sm font-semibold text-gray-900 mb-1">
            High-Value Trades
          </p>
          <p className="text-xs text-gray-600">{highValueTrades}</p>
        </div>

        {/* Flagged Trades */}
        <div>
          <p className="text-sm font-semibold text-gray-900 mb-1">
            Flagged Trades
          </p>
          <p className="text-xs text-gray-600">{flaggedTrades}</p>
        </div>

        {/* Flagged Trades Awaiting */}
        <div>
          <p className="text-sm font-semibold text-gray-900 mb-1">
            Flagged Trades
          </p>
          <p className="text-xs text-gray-600">{flaggedTradesReview}</p>
        </div>

        {/* Flagged Customers */}
        <div>
          <p className="text-sm font-semibold text-gray-900 mb-1">
            Flagged Customers
          </p>
          <p className="text-xs text-gray-600">{flaggedCustomers}</p>
        </div>
      </div>
    </div>
  );
}

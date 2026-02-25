"use client";

interface FinancialPerformanceCardProps {
  title: string;
  value: string;
}

export function FinancialPerformanceCard({
  title,
  value,
}: FinancialPerformanceCardProps) {
  return (
    <div
      className="bg-yellow-50 rounded-lg p-6 border-2"
      style={{ borderColor: "var(--brand-primary)" }}
    >
      <p
        className="text-sm font-medium mb-2"
        style={{ color: "var(--brand-primary)" }}
      >
        {title}
      </p>
      <p className="text-2xl font-bold text-gray-900">{value}</p>
    </div>
  );
}

"use client";

interface PlatformMetricCardProps {
  title: string;
  value: string | number;
}

export function PlatformMetricCard({ title, value }: PlatformMetricCardProps) {
  return (
    <div className="bg-green-50 rounded-lg p-6 border-2 border-green-500">
      <p className="text-sm font-medium text-green-700 mb-2">{title}</p>
      <p className="text-2xl font-bold text-gray-900">{value}</p>
    </div>
  );
}

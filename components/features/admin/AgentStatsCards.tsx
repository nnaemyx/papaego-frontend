"use client";

import type { AgentStats } from "@/lib/types/agent";

interface AgentStatsCardsProps {
  stats: AgentStats;
  isLoading?: boolean;
}

export function AgentStatsCards({ stats, isLoading }: AgentStatsCardsProps) {
  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {[1, 2, 3, 4].map((i) => (
          <div
            key={i}
            className="bg-white rounded-lg p-6 border border-gray-200 animate-pulse"
          >
            <div className="h-4 bg-gray-200 rounded w-1/2 mb-4"></div>
            <div className="h-8 bg-gray-200 rounded w-1/3"></div>
          </div>
        ))}
      </div>
    );
  }

  const statsData = [
    {
      label: "Active Agents",
      value: stats.active,
      color: "text-green-600",
      bgColor: "bg-green-50",
    },
    {
      label: "Inactive Agents",
      value: stats.inactive,
      color: "text-gray-600",
      bgColor: "bg-gray-50",
    },
    {
      label: "Pending Verification",
      value: stats.pendingVerification,
      color: "text-yellow-600",
      bgColor: "bg-yellow-50",
    },
    {
      label: "Flagged Agents",
      value: stats.flagged,
      color: "text-red-600",
      bgColor: "bg-red-50",
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      {statsData.map((stat) => (
        <div
          key={stat.label}
          className={`rounded-lg p-6 border ${stat.bgColor}`}
        >
          <p className="text-sm font-medium text-gray-600 mb-2">
            {stat.label}
          </p>
          <p className={`text-3xl font-bold ${stat.color}`}>{stat.value}</p>
        </div>
      ))}
    </div>
  );
}

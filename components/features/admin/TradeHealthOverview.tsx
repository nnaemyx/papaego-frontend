"use client";

interface TradeHealthData {
  completed: number;
  inProgress: number;
  pending: number;
  failed: number;
}

interface TradeHealthOverviewProps {
  data: TradeHealthData;
  improvement?: number;
}

export function TradeHealthOverview({ data, improvement }: TradeHealthOverviewProps) {
  const stats = [
    { label: "Completed", value: data.completed, color: "#27ae60" },
    { label: "In Progress", value: data.inProgress, color: "#3498db" },
    { label: "Pending", value: data.pending, color: "#f39c12" },
    { label: "Failed", value: data.failed, color: "#e74c3c" },
  ];

  return (
    <div className="bg-white rounded-lg p-6 border border-gray-200">
      <h3 className="text-xl font-bold text-gray-900 mb-6">
        Trade Health Overview
      </h3>

      <div className="grid grid-cols-2 gap-6">
        {/* Circular Progress */}
        <div className="flex items-center justify-center">
          <div className="relative w-40 h-40">
            {/* SVG Circle */}
            <svg className="w-full h-full" viewBox="0 0 100 100">
              <circle
                cx="50"
                cy="50"
                r="40"
                fill="none"
                stroke="#e5e7eb"
                strokeWidth="8"
              />
              <circle
                cx="50"
                cy="50"
                r="40"
                fill="none"
                stroke="#27ae60"
                strokeWidth="8"
                strokeDasharray={`${data.completed * 2.51} 251.2`}
                strokeLinecap="round"
                transform="rotate(-90 50 50)"
              />
            </svg>
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="text-center">
                <p className="text-3xl font-bold text-green-600">
                  {data.completed}%
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 gap-4">
          {stats.map((stat) => (
            <div key={stat.label} className="text-center">
              <div
                className="w-16 h-16 rounded-full mx-auto mb-2 flex items-center justify-center"
                style={{ backgroundColor: `${stat.color}15` }}
              >
                <p
                  className="text-2xl font-bold"
                  style={{ color: stat.color }}
                >
                  {stat.value}%
                </p>
              </div>
              <p className="text-xs font-medium text-gray-600">
                {stat.label}
              </p>
            </div>
          ))}
        </div>
      </div>

      {improvement !== undefined && (
        <p className="text-sm text-gray-600 mt-4">
          Trade success rate improved by{" "}
          <span className="font-semibold text-green-600">
            {improvement}%
          </span>{" "}
          this month
        </p>
      )}
    </div>
  );
}

"use client";

import {
  AlertCircle,
  FileText,
  UserX,
  AlertTriangle,
  CheckCircle,
} from "lucide-react";

export interface Alert {
  type: "error" | "warning" | "info" | "success";
  title: string;
  message: string;
  time: string;
}

interface AlertsNotificationsProps {
  alerts: Alert[];
}

const alertIcons = {
  error: AlertCircle,
  warning: AlertTriangle,
  info: FileText,
  success: CheckCircle,
};

const alertColors = {
  error: "text-red-500",
  warning: "text-yellow-500",
  info: "text-blue-500",
  success: "text-green-500",
};

export function AlertsNotifications({ alerts }: AlertsNotificationsProps) {
  return (
    <div className="bg-white rounded-lg border border-gray-200 p-6">
      <h3 className="text-lg font-bold text-gray-900 mb-4">
        Alerts & Notifications
      </h3>

      <div className="space-y-4">
        {alerts.map((alert, index) => {
          const Icon = alertIcons[alert.type];
          const colorClass = alertColors[alert.type];

          return (
            <div key={index} className="flex items-start gap-3">
              <Icon className={`h-5 w-5 flex-shrink-0 mt-0.5 ${colorClass}`} />
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <p className="text-sm font-semibold text-gray-900">
                      {alert.title}
                    </p>
                    <p className="text-xs text-gray-600 mt-1">
                      {alert.message}
                    </p>
                  </div>
                  <span className="text-xs text-gray-500 flex-shrink-0">
                    {alert.time}
                  </span>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

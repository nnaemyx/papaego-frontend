"use client";

import React from "react";
import { BankAccountStatus } from "@/lib/api/banking";

interface BankingStatusWidgetProps {
    status: BankAccountStatus;
    showLabel?: boolean;
    size?: "sm" | "md" | "lg";
}

const statusConfig: Record<BankAccountStatus, { label: string; bg: string; text: string; border: string; dot: string }> = {
    PENDING_CREATION: {
        label: "Pending Provisioning",
        bg: "bg-amber-50",
        text: "text-amber-800",
        border: "border-amber-200",
        dot: "bg-amber-500 animate-pulse"
    },
    CREATING: {
        label: "Provisioning Account...",
        bg: "bg-blue-50",
        text: "text-blue-800",
        border: "border-blue-200",
        dot: "bg-blue-500 animate-spin"
    },
    ACTIVE: {
        label: "Managed Account Active",
        bg: "bg-emerald-50",
        text: "text-emerald-800",
        border: "border-emerald-200",
        dot: "bg-emerald-500"
    },
    RESTRICTED: {
        label: "Account Restricted",
        bg: "bg-orange-50",
        text: "text-orange-800",
        border: "border-orange-200",
        dot: "bg-orange-500"
    },
    SUSPENDED: {
        label: "Account Suspended",
        bg: "bg-red-50",
        text: "text-red-800",
        border: "border-red-200",
        dot: "bg-red-500"
    },
    FROZEN: {
        label: "Account Frozen",
        bg: "bg-purple-50",
        text: "text-purple-800",
        border: "border-purple-200",
        dot: "bg-purple-500"
    },
    CLOSED: {
        label: "Account Closed",
        bg: "bg-gray-100",
        text: "text-gray-700",
        border: "border-gray-300",
        dot: "bg-gray-400"
    }
};

export const BankingStatusWidget: React.FC<BankingStatusWidgetProps> = ({
    status,
    showLabel = true,
    size = "md"
}) => {
    const config = statusConfig[status] || statusConfig.PENDING_CREATION;

    const sizeClasses = {
        sm: "px-2.5 py-1 text-xs",
        md: "px-3 py-1.5 text-xs font-semibold",
        lg: "px-4 py-2 text-sm font-semibold"
    };

    return (
        <div className={`inline-flex items-center gap-2 rounded-full border ${config.bg} ${config.text} ${config.border} ${sizeClasses[size]}`}>
            <span className={`h-2 w-2 rounded-full ${config.dot}`} />
            {showLabel && <span>{config.label}</span>}
        </div>
    );
};

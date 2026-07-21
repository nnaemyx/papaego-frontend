"use client";

import type { VerificationStatus } from "@/lib/api/compliance-kyc-kyb";

const STATUS_CONFIG: Record<VerificationStatus, {
    label: string;
    color: string;
    bg: string;
    ring: string;
    dot: string;
}> = {
    DRAFT: {
        label: "Draft",
        color: "text-gray-600",
        bg: "bg-gray-100",
        ring: "ring-gray-200",
        dot: "bg-gray-400"
    },
    SUBMITTED: {
        label: "Submitted",
        color: "text-blue-700",
        bg: "bg-blue-50",
        ring: "ring-blue-200",
        dot: "bg-blue-500"
    },
    PROCESSING: {
        label: "Processing",
        color: "text-amber-800",
        bg: "bg-[#FFF7E6]",
        ring: "ring-[#F0CD00]",
        dot: "bg-[#C9A227]"
    },
    MANUAL_REVIEW: {
        label: "Manual Review",
        color: "text-purple-700",
        bg: "bg-purple-50",
        ring: "ring-purple-200",
        dot: "bg-purple-500"
    },
    ADDITIONAL_INFO_REQUIRED: {
        label: "Action Required",
        color: "text-orange-700",
        bg: "bg-orange-50",
        ring: "ring-orange-200",
        dot: "bg-orange-500"
    },
    APPROVED: {
        label: "Approved",
        color: "text-emerald-700",
        bg: "bg-emerald-50",
        ring: "ring-emerald-200",
        dot: "bg-emerald-500"
    },
    REJECTED: {
        label: "Rejected",
        color: "text-red-700",
        bg: "bg-red-50",
        ring: "ring-red-200",
        dot: "bg-red-500"
    },
    EXPIRED: {
        label: "Expired",
        color: "text-zinc-600",
        bg: "bg-zinc-100",
        ring: "ring-zinc-200",
        dot: "bg-zinc-400"
    }
};

interface Props {
    status: VerificationStatus;
    size?: "sm" | "md" | "lg";
    showDot?: boolean;
}

export default function ComplianceStatusBadge({ status, size = "md", showDot = true }: Props) {
    const config = STATUS_CONFIG[status] || STATUS_CONFIG.DRAFT;

    const sizeCls = {
        sm: "text-xs px-2 py-0.5 gap-1",
        md: "text-xs px-2.5 py-1 gap-1.5",
        lg: "text-sm px-3 py-1.5 gap-2"
    }[size];

    const dotSizeCls = {
        sm: "w-1.5 h-1.5",
        md: "w-2 h-2",
        lg: "w-2.5 h-2.5"
    }[size];

    return (
        <span className={`inline-flex items-center rounded-full font-semibold ring-1 ${sizeCls} ${config.color} ${config.bg} ${config.ring}`}>
            {showDot && (
                <span className={`rounded-full ${dotSizeCls} ${config.dot} ${
                    ["PROCESSING", "SUBMITTED"].includes(status) ? "animate-pulse" : ""
                }`} />
            )}
            {config.label}
        </span>
    );
}

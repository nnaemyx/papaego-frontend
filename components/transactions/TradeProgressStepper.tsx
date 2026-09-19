"use client";

import { Check, Clock, CircleDot, AlertCircle, RefreshCw, FileText, Landmark, ShieldCheck } from "lucide-react";

export type TradeStage =
    | "PENDING"
    | "POOL"
    | "ASSIGNED"
    | "QUOTED"
    | "REJECTED"
    | "SENT_TO_CUSTOMER"
    | "CUSTOMER_CONFIRMED"
    | "AWAITING_PAYMENT"
    | "PAYMENT_UPLOADED"
    | "PAYMENT_CONFIRMED"
    | "PROCESSING"
    | "PROCESSED"
    | "COMPLETED"
    | "FLAGGED"
    | "CANCELLED";

interface TradeProgressStepperProps {
    currentStatus: TradeStage;
    isTradeRequest?: boolean;
    variant?: "detailed" | "dashboard" | "minimal";
}

// 4-Stage Lifecycle matching the Institutional Corporate Designs
export const FOUR_STAGES = [
    {
        stageNumber: 1,
        label: "Quote Confirmed",
        shortLabel: "Quoted",
        subtext: "Pricing locked in",
        activeSubtext: "Reviewing quote...",
        completedSubtext: "Completed",
        icon: FileText,
        keys: ["PENDING", "POOL", "ASSIGNED", "INITIATED", "CUSTOMER_VERIFIED", "QUOTED", "SENT_TO_CUSTOMER", "CUSTOMER_CONFIRMED"],
    },
    {
        stageNumber: 2,
        label: "Funding Received",
        shortLabel: "Funding",
        subtext: "Processing payment",
        activeSubtext: "Processing payment...",
        completedSubtext: "Funded",
        icon: Landmark,
        keys: ["AWAITING_PAYMENT", "PAYMENT_UPLOADED"],
    },
    {
        stageNumber: 3,
        label: "Route Optimization",
        shortLabel: "Processing",
        subtext: "Pending execution",
        activeSubtext: "Routing & Wires...",
        completedSubtext: "Dispatched",
        icon: RefreshCw,
        keys: ["PAYMENT_CONFIRMED", "PROCESSING", "PROCESSED", "UNDER_REVIEW", "IN_PROGRESS"],
    },
    {
        stageNumber: 4,
        label: "Settlement",
        shortLabel: "Settlement",
        subtext: "Awaiting clearance",
        activeSubtext: "Settling...",
        completedSubtext: "Settled",
        icon: ShieldCheck,
        keys: ["COMPLETED", "SETTLED"],
    },
];

export function getActiveStageIndex(status?: string): number {
    if (!status) return 0;
    const idx = FOUR_STAGES.findIndex((s) => s.keys.includes(status));
    return idx !== -1 ? idx : 0;
}

export function getActiveStageBadge(status?: string): string {
    if (!status) return "Idle";
    if (status === "REJECTED") return "Trade Rejected";
    if (status === "CANCELLED") return "Trade Cancelled";
    if (status === "FLAGGED") return "Trade Flagged";
    const idx = getActiveStageIndex(status);
    const stage = FOUR_STAGES[idx];
    return `${stage.label} (Stage ${stage.stageNumber} of 4)`;
}

export function TradeProgressStepper({ currentStatus, isTradeRequest, variant = "detailed" }: TradeProgressStepperProps) {
    if (currentStatus === "REJECTED" || currentStatus === "CANCELLED") {
        return (
            <div className="bg-red-50 border border-red-200 rounded-2xl p-6 flex flex-col items-center justify-center text-center">
                <AlertCircle className="w-10 h-10 text-red-500 mb-2" />
                <h3 className="text-lg font-bold text-red-700">Trade {currentStatus === "REJECTED" ? "Rejected" : "Cancelled"}</h3>
                <p className="text-xs text-red-600 mt-1">This trade sequence will not proceed to subsequent stages.</p>
            </div>
        );
    }

    if (currentStatus === "FLAGGED") {
        return (
            <div className="bg-amber-50 border border-amber-200 rounded-2xl p-6 flex flex-col items-center justify-center text-center">
                <AlertCircle className="w-10 h-10 text-amber-500 mb-2" />
                <h3 className="text-lg font-bold text-amber-800">Trade Flagged for Review</h3>
                <p className="text-xs text-amber-700 mt-1">Our compliance team is verifying this trade. You will be notified shortly.</p>
            </div>
        );
    }

    // Determine current index based on status using exact stage key matching
    const activeIdx = getActiveStageIndex(currentStatus);

    const progressPercentage = Math.max(0, Math.min(100, (activeIdx / (FOUR_STAGES.length - 1)) * 100));

    return (
        <div className="w-full">
            <div className="relative">
                {/* Background Connecting Line */}
                <div className="absolute top-5 left-[12%] right-[12%] h-[2px] bg-slate-200" />

                {/* Active Gold Line */}
                <div
                    className="absolute top-5 left-[12%] h-[2px] bg-[#C9A227] transition-all duration-500"
                    style={{ width: `calc(${progressPercentage}% * 0.76)` }}
                />

                <div className="flex justify-between relative z-10 w-full">
                    {FOUR_STAGES.map((stage, idx) => {
                        const isCompleted = idx < activeIdx || (idx === 3 && currentStatus === "COMPLETED");
                        const isCurrent = idx === activeIdx && currentStatus !== "COMPLETED";
                        const isFuture = idx > activeIdx;

                        return (
                            <div key={stage.label} className="flex flex-col items-center relative text-center w-1/4 px-1">
                                {/* Node Icon Circle */}
                                <div
                                    className={`w-10 h-10 rounded-full flex items-center justify-center transition-all duration-300 ${
                                        isCompleted
                                            ? "bg-[#C9A227] text-white shadow-sm"
                                            : isCurrent
                                            ? "bg-[#C9A227] text-white ring-4 ring-[#C9A227]/20 shadow-md animate-pulse"
                                            : "bg-white text-slate-400 border border-slate-200"
                                    }`}
                                >
                                    {isCompleted ? (
                                        <Check className="w-5 h-5 stroke-[2.5]" />
                                    ) : isCurrent ? (
                                        <div className="w-3 h-3 rounded-full bg-white" />
                                    ) : (
                                        <span className="text-xs font-semibold text-slate-400">{stage.stageNumber}</span>
                                    )}
                                </div>

                                {/* Title */}
                                <span
                                    className={`text-xs md:text-sm font-bold mt-2.5 transition-colors ${
                                        isCurrent ? "text-[#C9A227]" : isCompleted ? "text-slate-900 font-bold" : "text-slate-400"
                                    }`}
                                >
                                    {variant === "dashboard" ? stage.shortLabel : stage.label}
                                </span>

                                {/* Subtitle */}
                                <span className="text-[10px] md:text-xs mt-0.5 text-slate-400">
                                    {isCompleted
                                        ? stage.completedSubtext
                                        : isCurrent
                                        ? stage.activeSubtext || stage.subtext
                                        : stage.subtext}
                                </span>
                            </div>
                        );
                    })}
                </div>
            </div>
        </div>
    );
}

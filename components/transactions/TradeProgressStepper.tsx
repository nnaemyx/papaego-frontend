"use client";

import { Check, Clock, CircleDot, AlertCircle, RefreshCw } from "lucide-react";

export type TradeStage = "PENDING" | "POOL" | "ASSIGNED" | "QUOTED" | "REJECTED" | 
                         "AWAITING_PAYMENT" | "PAYMENT_UPLOADED" | "PROCESSING" | "COMPLETED" | "FLAGGED" | "CANCELLED";

interface TradeProgressStepperProps {
    currentStatus: TradeStage;
    isTradeRequest?: boolean; 
}

// Normalize all statuses into a clean 5-step flow.
const STEPS = [
    { label: "Submitted", keys: ["PENDING", "POOL"] },
    { label: "Rate Assigned", keys: ["ASSIGNED", "QUOTED"] },
    { label: "Payment Awaiting", keys: ["AWAITING_PAYMENT"] },
    { label: "Payment Received", keys: ["PAYMENT_UPLOADED", "PROCESSING", "PROCESSED"] },
    { label: "Completed", keys: ["COMPLETED"] },
];

export function TradeProgressStepper({ currentStatus, isTradeRequest }: TradeProgressStepperProps) {
    if (currentStatus === "REJECTED" || currentStatus === "CANCELLED") {
        return (
            <div className="bg-red-50 border border-red-200 rounded-2xl p-6 flex flex-col items-center justify-center text-center">
                <AlertCircle className="w-12 h-12 text-red-500 mb-3" />
                <h3 className="text-xl font-bold text-red-700">Trade {currentStatus === "REJECTED" ? "Rejected" : "Cancelled"}</h3>
                <p className="text-sm text-red-600 mt-1">This trade sequence will not proceed to the next stage.</p>
            </div>
        );
    }
    
    if (currentStatus === "FLAGGED") {
        return (
            <div className="bg-orange-50 border border-orange-200 rounded-2xl p-6 flex flex-col items-center justify-center text-center">
                <AlertCircle className="w-12 h-12 text-orange-500 mb-3" />
                <h3 className="text-xl font-bold text-orange-700">Trade Flagged</h3>
                <p className="text-sm text-orange-600 mt-1">This trade has been flagged for review. Please check your messages or contact support.</p>
            </div>
        );
    }

    // Determine current index based on status
    let currentIndex = 0;
    const currentStepIndex = STEPS.findIndex(step => step.keys.includes(currentStatus));
    
    // If it's a Trade Request, it generally maxes out at index 1 before becoming a full Trade
    if (currentStepIndex !== -1) {
        currentIndex = currentStepIndex;
    } else if (!isTradeRequest && !currentStatus) {
        // Fallback for an unknown active trade
        currentIndex = 2; 
    }

    return (
        <div className="bg-white border rounded-2xl p-6 lg:p-8 overflow-hidden w-full relative" style={{ borderColor: "#E1E3E6" }}>
            <h3 className="text-base font-bold mb-6" style={{ color: "var(--text-primary)" }}>
                Transaction Progress
            </h3>

            <div className="relative">
                {/* Background Line */}
                <div className="absolute top-[18px] left-[10%] right-[10%] h-1 bg-gray-100 rounded-full" />
                
                {/* Active Progress Line */}
                <div 
                    className="absolute top-[18px] left-[10%] h-1 bg-[#C9A227] rounded-full transition-all duration-500" 
                    style={{ width: `${(currentIndex / (STEPS.length - 1)) * 80}%` }}
                />

                <div className="flex justify-between relative z-10 w-full">
                    {STEPS.map((step, idx) => {
                        const isCompleted = idx < currentIndex;
                        const isCurrent = idx === currentIndex;
                        const isFuture = idx > currentIndex;

                        let baseColor = "bg-white text-gray-300 border-2 border-gray-200";
                        let Icon = Clock;

                        if (isCompleted) {
                            baseColor = "bg-[#C9A227] text-white border-2 border-[#C9A227]";
                            Icon = Check;
                        } else if (isCurrent) {
                            baseColor = "bg-white text-[#C9A227] border-2 border-[#C9A227] shadow-[0_0_0_4px_rgba(201,162,39,0.1)]";
                            Icon = currentStatus === "PROCESSING" || currentStatus === "ASSIGNED" ? RefreshCw : CircleDot;
                        }

                        return (
                            <div key={step.label} className="flex flex-col items-center relative gap-3 w-1/5">
                                <div 
                                    className={`w-10 h-10 rounded-full flex items-center justify-center transition-all duration-300 z-10 ${baseColor}`}
                                >
                                    <Icon className={`w-5 h-5 ${isCurrent && (currentStatus === "PROCESSING" || currentStatus === "ASSIGNED") ? "animate-spin" : ""}`} />
                                </div>
                                <span 
                                    className={`text-xs font-semibold text-center mt-1 transition-colors duration-300 ${isCurrent ? "text-[#012333]" : isCompleted ? "text-[#C9A227]" : "text-gray-400"}`}
                                >
                                    {step.label}
                                </span>
                            </div>
                        );
                    })}
                </div>
            </div>
        </div>
    );
}

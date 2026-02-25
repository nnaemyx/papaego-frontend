"use client";

import { Badge } from "@/components/ui/badge";
import { ArrowLeft } from "lucide-react";

interface CommissionDetailHeaderProps {
    commissionId: string;
    status: string;
    agentName: string;
    date: string;
    onBack: () => void;
}

function getStatusColor(status: string) {
    switch (status) {
        case "Paid": return "bg-green-100 text-green-700 border-green-300";
        case "Pending": return "bg-yellow-100 text-yellow-700 border-yellow-300";
        case "Disputed": return "bg-red-100 text-red-700 border-red-300";
        case "Processing": return "bg-blue-100 text-blue-700 border-blue-300";
        default: return "bg-gray-100 text-gray-700 border-gray-300";
    }
}

export function CommissionDetailHeader({
    commissionId,
    status,
    agentName,
    date,
    onBack,
}: CommissionDetailHeaderProps) {
    return (
        <div
            className="px-4 md:px-6 lg:px-7 py-5 border-b"
            style={{ backgroundColor: "white", borderColor: "#e1e3e6" }}
        >
            <button
                onClick={onBack}
                className="flex items-center gap-2 text-sm mb-4 hover:opacity-70 transition-opacity"
                style={{ color: "#c9a227" }}
            >
                <ArrowLeft className="h-4 w-4" />
                Back to Commissions
            </button>

            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <div className="flex items-center gap-3">
                        <h1 className="text-2xl font-bold" style={{ color: "#2b2f33" }}>
                            {commissionId}
                        </h1>
                        <Badge variant="outline" className={`text-xs ${getStatusColor(status)}`}>
                            {status}
                        </Badge>
                    </div>
                    <p className="text-sm mt-1" style={{ color: "#6b7078" }}>
                        Agent: <span className="font-medium" style={{ color: "#2b2f33" }}>{agentName}</span>
                        {" · "}
                        {date}
                    </p>
                </div>
            </div>
        </div>
    );
}

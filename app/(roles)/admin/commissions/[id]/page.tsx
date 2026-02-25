"use client";

import { use } from "react";
import { useRouter } from "next/navigation";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft } from "lucide-react";
import { commissionsApi } from "@/lib/api/commissions";

type CommissionStatus = "Paid" | "Pending" | "Disputed" | "Processing";

function getStatusColor(status: string) {
    switch (status) {
        case "PAID":
        case "Paid": return "bg-green-100 text-green-700 border-green-300";
        case "PENDING":
        case "Pending": return "bg-yellow-100 text-yellow-700 border-yellow-300";
        case "DISPUTED":
        case "Disputed": return "bg-red-100 text-red-700 border-red-300";
        case "Processing": return "bg-blue-100 text-blue-700 border-blue-300";
        default: return "bg-gray-100 text-gray-700 border-gray-300";
    }
}

function normalizeStatus(status: string): string {
    const map: Record<string, string> = {
        PAID: "Paid", PENDING: "Pending", DISPUTED: "Disputed",
    };
    return map[status] || status;
}

export default function CommissionDetailPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = use(params);
    const router = useRouter();
    const queryClient = useQueryClient();

    const { data, isLoading, error } = useQuery({
        queryKey: ["commission", id],
        queryFn: () => commissionsApi.getCommission(id),
    });

    const statusMutation = useMutation({
        mutationFn: ({ status, notes }: { status: string; notes?: string }) =>
            commissionsApi.updateCommissionStatus(id, status, notes),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["commission", id] });
            queryClient.invalidateQueries({ queryKey: ["commissions"] });
        },
    });

    if (isLoading) {
        return (
            <div className="p-8 text-center" style={{ color: "#9aa0a6" }}>
                Loading commission details...
            </div>
        );
    }

    if (error || !data) {
        return (
            <div className="p-8 text-center text-red-500">
                Commission not found.{" "}
                <button onClick={() => router.push("/admin/commissions")} className="underline">
                    Go back
                </button>
            </div>
        );
    }

    const displayStatus = normalizeStatus(data.status);
    const agentName = data.agentName ||
        (data.agent?.firstName && data.agent?.lastName
            ? `${data.agent.firstName} ${data.agent.lastName}`
            : data.agent?.email || "—");
    const agentId = data.agentId ? `#PE-${data.agentId.slice(0, 5).toUpperCase()}` : "—";
    const tradeId = data.trade?.id ? `#PE-${data.trade.id.slice(0, 5).toUpperCase()}` : "—";
    const tradeType = data.trade
        ? `${data.trade.sendCurrency || ""} → ${data.trade.receiveCurrency || ""}`
        : data.commissionType || "—";
    const tradeVolume = data.trade?.amount
        ? `₦${Number(data.trade.amount).toLocaleString()}`
        : "—";
    const commissionAmount = data.amount || "—";
    const commissionRef = data.reference || `#CM-${id.slice(0, 5).toUpperCase()}`;
    const date = data.createdAt
        ? new Date(data.createdAt).toLocaleDateString("en-GB")
        : "—";
    const paidAt = data.paidAt
        ? new Date(data.paidAt).toLocaleDateString("en-GB")
        : "—";
    const notes = data.notes || "—";

    return (
        <div style={{ backgroundColor: "#f7f8f9", minHeight: "100%" }}>
            {/* Header */}
            <div
                className="px-4 md:px-6 lg:px-7 py-5 border-b"
                style={{ backgroundColor: "white", borderColor: "#e1e3e6" }}
            >
                <button
                    onClick={() => router.push("/admin/commissions")}
                    className="flex items-center gap-2 text-sm mb-4 hover:opacity-70 transition-opacity"
                    style={{ color: "#c9a227" }}
                >
                    <ArrowLeft className="h-4 w-4" />
                    Back to Commissions
                </button>
                <div className="flex items-center gap-3">
                    <h1 className="text-2xl font-bold" style={{ color: "#2b2f33" }}>
                        {commissionRef}
                    </h1>
                    <Badge variant="outline" className={`text-xs ${getStatusColor(data.status)}`}>
                        {displayStatus}
                    </Badge>
                </div>
                <p className="text-sm mt-1" style={{ color: "#6b7078" }}>
                    Agent: <span className="font-medium" style={{ color: "#2b2f33" }}>{agentName}</span>
                    {" · "}{date}
                </p>
            </div>

            {/* Detail Card */}
            <div className="p-4 md:p-6 lg:px-7 space-y-6">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* Trade Details */}
                    <div className="rounded-xl p-5 border" style={{ backgroundColor: "white", borderColor: "#e1e3e6" }}>
                        <h3 className="font-semibold text-base mb-4" style={{ color: "#2b2f33" }}>Trade Details</h3>
                        <div className="space-y-3">
                            {[
                                { label: "Trade ID", value: tradeId },
                                { label: "Trade Type", value: tradeType },
                                { label: "Trade Volume", value: tradeVolume },
                                { label: "Commission Amount", value: commissionAmount },
                                { label: "Settlement Date", value: date },
                            ].map((item) => (
                                <div key={item.label} className="flex justify-between py-1.5 border-b" style={{ borderColor: "#f0f0f0" }}>
                                    <span className="text-sm" style={{ color: "#6b7078" }}>{item.label}</span>
                                    <span className="text-sm font-medium" style={{ color: "#2b2f33" }}>{item.value}</span>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Agent & Admin Details */}
                    <div className="rounded-xl p-5 border" style={{ backgroundColor: "white", borderColor: "#e1e3e6" }}>
                        <h3 className="font-semibold text-base mb-4" style={{ color: "#2b2f33" }}>Payment Details</h3>
                        <div className="space-y-3">
                            {[
                                { label: "Agent Name", value: agentName },
                                { label: "Agent ID", value: agentId },
                                { label: "Status", value: displayStatus },
                                { label: "Paid At", value: paidAt },
                                { label: "Notes", value: notes },
                            ].map((item) => (
                                <div key={item.label} className="flex justify-between py-1.5 border-b" style={{ borderColor: "#f0f0f0" }}>
                                    <span className="text-sm" style={{ color: "#6b7078" }}>{item.label}</span>
                                    <span className="text-sm font-medium text-right max-w-48" style={{ color: "#2b2f33" }}>{item.value}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Actions */}
                <div className="flex gap-3">
                    {data.status === "PENDING" && (
                        <Button
                            style={{ backgroundColor: "#27ae60", color: "white" }}
                            disabled={statusMutation.isPending}
                            onClick={() => statusMutation.mutate({ status: "PAID" })}
                        >
                            {statusMutation.isPending ? "Updating..." : "Mark as Paid"}
                        </Button>
                    )}
                    {data.status !== "DISPUTED" && (
                        <Button
                            variant="outline"
                            style={{ borderColor: "#e05555", color: "#e05555" }}
                            disabled={statusMutation.isPending}
                            onClick={() => statusMutation.mutate({ status: "DISPUTED" })}
                        >
                            Flag as Disputed
                        </Button>
                    )}
                    <Button variant="outline" onClick={() => router.push("/admin/commissions")}>
                        Close
                    </Button>
                </div>
            </div>
        </div>
    );
}

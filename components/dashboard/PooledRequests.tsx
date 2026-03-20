"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { agentApi } from "@/lib/api/agent";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { Clock, User, ArrowRight } from "lucide-react";
import { format } from "date-fns";

export function PooledRequests() {
    const queryClient = useQueryClient();

    const { data: requests, isLoading } = (useQuery as any)({
        queryKey: ["agent-pool-requests"],
        queryFn: () => agentApi.getTradeRequests("POOL"),
        refetchInterval: 10000, // Poll every 10s
    });

    const claimMutation = useMutation({
        mutationFn: (id: string) => agentApi.claimTradeRequest(id),
        onSuccess: () => {
            toast.success("Request claimed successfully!");
            queryClient.invalidateQueries({ queryKey: ["agent-pool-requests"] });
            queryClient.invalidateQueries({ queryKey: ["agent-recent-trades"] });
        },
        onError: () => {
            toast.error("Failed to claim request. It might have been taken already.");
        }
    });

    if (isLoading) return <div className="h-32 bg-gray-100 animate-pulse rounded-xl" />;
    if (!requests || requests.length === 0) return null;

    return (
        <div className="space-y-4 mb-10">
            <div className="flex items-center justify-between">
                <h2 className="text-xl md:text-2xl font-bold" style={{ color: "var(--text-primary)" }}>
                    Available in Pool
                </h2>
                <Badge variant="outline" className="bg-amber-50 text-amber-600 border-amber-200">
                    {requests.length} New Requests
                </Badge>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {requests.map((req: any) => (
                    <div key={req.id} className="bg-white p-5 rounded-2xl border shadow-sm hover:shadow-md transition-shadow" style={{ borderColor: "#E1E3E6" }}>
                        <div className="flex justify-between items-start mb-4">
                            <div>
                                <p className="text-xs font-bold text-[#9AA0A6] uppercase tracking-wider">
                                    {req.tradeType || "BUY"} REQUEST
                                </p>
                                <h4 className="text-lg font-bold mt-1" style={{ color: "#012333" }}>
                                    {req.amount} {req.sendCurrency} → {req.receiveCurrency}
                                </h4>
                            </div>
                            <div className="w-10 h-10 rounded-full bg-[#f7f8f9] flex items-center justify-center">
                                <User className="w-5 h-5 text-[#6B7078]" />
                            </div>
                        </div>

                        <div className="space-y-2 mb-6">
                            <div className="flex items-center gap-2 text-sm text-[#6B7078]">
                                <Clock className="w-4 h-4" />
                                <span>{format(new Date(req.createdAt), "hh:mm a")}</span>
                            </div>
                            <div className="text-sm">
                                <span className="text-[#9AA0A6]">From:</span>{" "}
                                <span className="font-semibold" style={{ color: "#012333" }}>
                                    {req.customer?.fullName || "Anonymous"}
                                </span>
                            </div>
                        </div>

                        <Button 
                            onClick={() => claimMutation.mutate(req.id)}
                            disabled={claimMutation.isPending}
                            className="w-full bg-[#012333] hover:bg-[#02334d] text-white flex items-center justify-center gap-2 h-11 rounded-xl"
                        >
                            {claimMutation.isPending ? "Claiming..." : "Claim Request"}
                            <ArrowRight className="w-4 h-4" />
                        </Button>
                    </div>
                ))}
            </div>
        </div>
    );
}

"use client";

import { useState, use } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, User } from "lucide-react";
import { agentsApi } from "@/lib/api/agents";
import { getStatusColor } from "@/lib/formatters";
import { AgentOverviewTab } from "@/components/features/admin/agents/AgentOverviewTab";
import { AgentProfileTab } from "@/components/features/admin/agents/AgentProfileTab";
import { AgentTransactionsTab } from "@/components/features/admin/agents/AgentTransactionsTab";
import { AgentComplianceTab } from "@/components/features/admin/agents/AgentComplianceTab";
import { AgentActivityTab } from "@/components/features/admin/agents/AgentActivityTab";
import { AgentAdminControlsTab } from "@/components/features/admin/agents/AgentAdminControlsTab";
import { DeleteAgentDialog } from "@/components/features/admin/DeleteAgentDialog";

const TABS = [
    { id: "overview", label: "Overview" },
    { id: "profile", label: "Profile & Onboarding" },
    { id: "transactions", label: "Transactions" },
    { id: "compliance", label: "Compliance" },
    { id: "activity", label: "Activity" },
    { id: "admin-controls", label: "Admin Controls" },
];

export default function AgentDetailPage({
    params,
}: {
    params: Promise<{ id: string }>;
}) {
    const { id } = use(params);
    const router = useRouter();
    const queryClient = useQueryClient();
    const [activeTab, setActiveTab] = useState("overview");
    const [deleteOpen, setDeleteOpen] = useState(false);

    const { data: agent, isLoading } = useQuery({
        queryKey: ["agent", id],
        queryFn: () => agentsApi.getAgent(id),
    });

    const suspendMutation = useMutation({
        mutationFn: () => agentsApi.suspendAgent(id),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["agent", id] });
        },
    });

    const activateMutation = useMutation({
        mutationFn: () => agentsApi.activateAgent(id),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["agent", id] });
        },
    });

    const verifyMutation = useMutation({
        mutationFn: () => agentsApi.verifyDocuments(id),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["agent", id] });
        },
    });

    const deleteMutation = useMutation({
        mutationFn: () => agentsApi.deleteAgent(id),
        onSuccess: () => {
            setDeleteOpen(false);
            router.push("/admin/agents");
        },
    });

    if (isLoading) {
        return (
            <div className="p-6 space-y-4" style={{ backgroundColor: "#f7f8f9", minHeight: "100%" }}>
                <div className="h-8 bg-gray-200 rounded w-48 animate-pulse" />
                <div className="h-24 bg-gray-200 rounded animate-pulse" />
                <div className="h-64 bg-gray-200 rounded animate-pulse" />
            </div>
        );
    }

    if (!agent) {
        return (
            <div className="p-6 text-center" style={{ backgroundColor: "#f7f8f9", minHeight: "100%" }}>
                <p style={{ color: "#6b7078" }}>Agent not found.</p>
                <Button
                    className="mt-4"
                    variant="outline"
                    onClick={() => router.push("/admin/agents")}
                >
                    Back to Agents
                </Button>
            </div>
        );
    }

    return (
        <div className="space-y-0" style={{ backgroundColor: "#f7f8f9", minHeight: "100%" }}>
            {/* Breadcrumb + Header */}
            <div
                className="px-4 md:px-6 lg:px-7 py-5 border-b"
                style={{ backgroundColor: "white", borderColor: "#e1e3e6" }}
            >
                {/* Back button */}
                <button
                    onClick={() => router.push("/admin/agents")}
                    className="flex items-center gap-2 text-sm mb-4 hover:opacity-70 transition-opacity"
                    style={{ color: "#c9a227" }}
                >
                    <ArrowLeft className="h-4 w-4" />
                    Back to Agents
                </button>

                {/* Agent Header */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div className="flex items-center gap-4">
                        <div
                            className="w-14 h-14 rounded-full flex items-center justify-center text-white text-xl font-bold flex-shrink-0"
                            style={{ backgroundColor: "#c9a227" }}
                        >
                            {agent.name.charAt(0)}
                        </div>
                        <div>
                            <h1
                                className="text-2xl font-bold"
                                style={{ color: "#2b2f33", fontFamily: "var(--font-public-sans)" }}
                            >
                                {agent.name}
                            </h1>
                            <div className="flex items-center gap-2 mt-1 flex-wrap">
                                <span className="text-sm" style={{ color: "#6b7078" }}>
                                    {agent.agentId}
                                </span>
                                <span style={{ color: "#e1e3e6" }}>·</span>
                                <span className="text-sm" style={{ color: "#6b7078" }}>
                                    {agent.role}
                                </span>
                                <span style={{ color: "#e1e3e6" }}>·</span>
                                <span className="text-sm" style={{ color: "#6b7078" }}>
                                    {agent.region}
                                </span>
                                <Badge
                                    variant="outline"
                                    className={`text-xs ${getStatusColor(agent.status)}`}
                                >
                                    {agent.status}
                                </Badge>
                            </div>
                        </div>
                    </div>

                    <div className="flex gap-2">
                        {agent.status === "Active" ? (
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() => suspendMutation.mutate()}
                                disabled={suspendMutation.isPending}
                                style={{ borderColor: "#e05555", color: "#e05555" }}
                            >
                                Suspend
                            </Button>
                        ) : (
                            <Button
                                size="sm"
                                onClick={() => activateMutation.mutate()}
                                disabled={activateMutation.isPending}
                                style={{ backgroundColor: "#27ae60", color: "white" }}
                            >
                                Activate
                            </Button>
                        )}
                    </div>
                </div>

                {/* Tabs */}
                <div className="flex gap-0 mt-5 overflow-x-auto scrollbar-hidden -mb-px">
                    {TABS.map((tab) => (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id)}
                            className="px-4 py-2 text-sm font-medium whitespace-nowrap border-b-2 transition-colors"
                            style={{
                                borderBottomColor:
                                    activeTab === tab.id ? "#c9a227" : "transparent",
                                color: activeTab === tab.id ? "#c9a227" : "#6b7078",
                            }}
                        >
                            {tab.label}
                        </button>
                    ))}
                </div>
            </div>

            {/* Tab Content */}
            <div className="p-4 md:p-6 lg:px-7">
                {activeTab === "overview" && <AgentOverviewTab agent={agent} />}
                {activeTab === "profile" && <AgentProfileTab agent={agent} />}
                {activeTab === "transactions" && <AgentTransactionsTab agent={agent} />}
                {activeTab === "compliance" && <AgentComplianceTab agent={agent} />}
                {activeTab === "activity" && <AgentActivityTab agent={agent} />}
                {activeTab === "admin-controls" && (
                    <AgentAdminControlsTab
                        agent={agent}
                        onSuspend={() => suspendMutation.mutate()}
                        onActivate={() => activateMutation.mutate()}
                        onVerify={() => verifyMutation.mutate()}
                        onDelete={() => setDeleteOpen(true)}
                    />
                )}
            </div>

            {/* Delete Dialog */}
            <DeleteAgentDialog
                open={deleteOpen}
                onOpenChange={setDeleteOpen}
                agentName={agent.name}
                agentId={agent.agentId}
                onConfirm={() => deleteMutation.mutate()}
                isDeleting={deleteMutation.isPending}
            />
        </div>
    );
}

"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Shield, UserX, UserCheck, AlertOctagon, Edit } from "lucide-react";
import type { Agent } from "@/lib/types/agent";
import { getStatusColor } from "@/lib/formatters";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { agentsApi } from "@/lib/api/agents";
import { toast } from "sonner";

interface AgentAdminControlsTabProps {
    agent: Agent;
    onSuspend: () => void;
    onActivate: () => void;
    onVerify: () => void;
    onDelete: () => void;
    onUpdate: (data: { role?: string; region?: string }) => void;
    isUpdating?: boolean;
}

export function AgentAdminControlsTab({
    agent,
    onSuspend,
    onActivate,
    onVerify,
    onDelete,
    onUpdate,
    isUpdating = false,
}: AgentAdminControlsTabProps) {
    const queryClient = useQueryClient();
    const [newRegion, setNewRegion] = useState(agent.region);
    const [newAgentType, setNewAgentType] = useState(agent.agentType || "FIELD");

    const updateMutation = useMutation({
        mutationFn: () =>
            agentsApi.updateAgent(agent.id, {
                region: newRegion,
                agentType: newAgentType,
            } as any),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["agent", agent.id] });
            toast.success("Agent settings updated successfully!");
        },
        onError: () => {
            toast.error("Failed to update agent settings.");
        },
    });

    return (
        <div className="space-y-6">
            {/* Status Control */}
            <div
                className="rounded-xl p-5 border"
                style={{ backgroundColor: "white", borderColor: "#e1e3e6" }}
            >
                <div className="flex items-center justify-between mb-4">
                    <div>
                        <h3 className="font-semibold text-base" style={{ color: "#2b2f33" }}>
                            Account Status Control
                        </h3>
                        <p className="text-sm mt-1" style={{ color: "#6b7078" }}>
                            Current status: <span className="font-semibold" style={{ color: getStatusColor(agent.status).split(' ')[1] }}>{agent.status}</span>
                        </p>
                    </div>
                </div>

                {/* Document Preview for Admin */}
                {agent.agentProfile && (
                    <div className="mb-6 p-4 rounded-lg bg-gray-50 border border-gray-200">
                        <h4 className="text-sm font-semibold mb-3" style={{ color: "#2b2f33" }}>Review Submitted Documents</h4>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div className="space-y-1">
                                <p className="text-xs text-gray-500 uppercase font-medium">Government ID</p>
                                {agent.agentProfile.governmentIdUrl ? (
                                    <a
                                        href={agent.agentProfile.governmentIdUrl}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="text-sm font-medium hover:underline flex items-center gap-1"
                                        style={{ color: "#c9a227" }}
                                    >
                                        View ID Document
                                    </a>
                                ) : (
                                    <p className="text-sm text-gray-400 italic">Not submitted</p>
                                )}
                            </div>
                            <div className="space-y-1">
                                <p className="text-xs text-gray-500 uppercase font-medium">Proof of Address</p>
                                {agent.agentProfile.proofOfAddressUrl ? (
                                    <a
                                        href={agent.agentProfile.proofOfAddressUrl}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="text-sm font-medium hover:underline flex items-center gap-1"
                                        style={{ color: "#c9a227" }}
                                    >
                                        View Proof Document
                                    </a>
                                ) : (
                                    <p className="text-sm text-gray-400 italic">Not submitted</p>
                                )}
                            </div>
                        </div>
                    </div>
                )}

                <div className="flex flex-wrap gap-3">
                    {agent.status !== "Active" && (
                        <>
                            <Button
                                onClick={onVerify}
                                className="gap-2"
                                variant="outline"
                                style={{ borderColor: "#27ae60", color: "#27ae60" }}
                            >
                                <Shield className="h-4 w-4" />
                                Verify Documents
                            </Button>
                            <Button
                                onClick={onActivate}
                                className="gap-2"
                                style={{ backgroundColor: "#27ae60", color: "white" }}
                            >
                                <UserCheck className="h-4 w-4" />
                                Activate Agent
                            </Button>
                        </>
                    )}
                    {agent.status === "Active" && (
                        <Button
                            onClick={onSuspend}
                            variant="outline"
                            className="gap-2"
                            style={{ borderColor: "#e05555", color: "#e05555" }}
                        >
                            <UserX className="h-4 w-4" />
                            Suspend Agent
                        </Button>
                    )}
                    <Button
                        variant="outline"
                        className="gap-2"
                        style={{ borderColor: "#f0cd00", color: "#a97600" }}
                    >
                        <AlertOctagon className="h-4 w-4" />
                        Flag for Review
                    </Button>
                </div>
            </div>

            {/* Role & Region Update */}
            <div
                className="rounded-xl p-5 border"
                style={{ backgroundColor: "white", borderColor: "#e1e3e6" }}
            >
                <h3 className="font-semibold text-base mb-4" style={{ color: "#2b2f33" }}>
                    Update Classification & Region
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
                    
                    <div className="space-y-2">
                        <label className="text-sm" style={{ color: "#6b7078" }}>
                            Agent Classification
                        </label>
                        <Select value={newAgentType} onValueChange={setNewAgentType}>
                            <SelectTrigger>
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="FIELD">Field Agent</SelectItem>
                                <SelectItem value="CORPORATE">Corporate Agent</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>

                    <div className="space-y-2">
                        <label className="text-sm" style={{ color: "#6b7078" }}>
                            Region
                        </label>
                        <Select value={newRegion} onValueChange={setNewRegion}>
                            <SelectTrigger>
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="Nigeria">Nigeria</SelectItem>
                                <SelectItem value="Ghana">Ghana</SelectItem>
                                <SelectItem value="Kenya">Kenya</SelectItem>
                                <SelectItem value="UK">UK</SelectItem>
                                <SelectItem value="USA">USA</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                </div>
                <Button
                    onClick={() => updateMutation.mutate()}
                    disabled={updateMutation.isPending || (newAgentType === agent.agentType && newRegion === agent.region)}
                    className="gap-2"
                    style={{ backgroundColor: "#c9a227", color: "white" }}
                >
                    <Edit className="h-4 w-4" />
                    {updateMutation.isPending ? "Saving..." : "Save Changes"}
                </Button>
            </div>

            {/* Admin Notes */}
            <div
                className="rounded-xl p-5 border"
                style={{ backgroundColor: "white", borderColor: "#e1e3e6" }}
            >
                <h3 className="font-semibold text-base mb-4" style={{ color: "#2b2f33" }}>
                    Admin Notes
                </h3>
                <div className="space-y-3 mb-4">
                    {/* Real notes will be listed here once integrated with backend */}
                    <p className="text-xs text-center py-4 text-gray-400 italic">No admin notes available for this agent.</p>
                </div>
                <textarea
                    className="w-full rounded-lg border p-3 text-sm resize-none focus:outline-none focus:ring-1"
                    style={{ borderColor: "#e1e3e6", minHeight: "80px", color: "#2b2f33" }}
                    placeholder="Add an admin note..."
                />
                <Button
                    className="mt-2 gap-2"
                    variant="outline"
                    style={{ borderColor: "#c9a227", color: "#c9a227" }}
                >
                    <Shield className="h-4 w-4" />
                    Add Note
                </Button>
            </div>

            {/* Danger Zone */}
            <div
                className="rounded-xl p-5 border"
                style={{ backgroundColor: "white", borderColor: "#e05555" }}
            >
                <h3 className="font-semibold text-base mb-2" style={{ color: "#e05555" }}>
                    Danger Zone
                </h3>
                <p className="text-sm mb-4" style={{ color: "#6b7078" }}>
                    Permanently delete this agent. This action cannot be undone and will
                    remove all associated data.
                </p>
                <Button
                    onClick={onDelete}
                    style={{ backgroundColor: "#e05555", color: "white" }}
                >
                    Delete Agent
                </Button>
            </div>
        </div>
    );
}

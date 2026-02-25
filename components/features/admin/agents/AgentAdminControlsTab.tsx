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

interface AgentAdminControlsTabProps {
    agent: Agent;
    onSuspend: () => void;
    onActivate: () => void;
    onDelete: () => void;
}

export function AgentAdminControlsTab({
    agent,
    onSuspend,
    onActivate,
    onDelete,
}: AgentAdminControlsTabProps) {
    const [newRole, setNewRole] = useState(agent.role);
    const [newRegion, setNewRegion] = useState(agent.region);

    return (
        <div className="space-y-6">
            {/* Status Control */}
            <div
                className="rounded-xl p-5 border"
                style={{ backgroundColor: "white", borderColor: "#e1e3e6" }}
            >
                <h3 className="font-semibold text-base mb-2" style={{ color: "#2b2f33" }}>
                    Account Status Control
                </h3>
                <p className="text-sm mb-5" style={{ color: "#6b7078" }}>
                    Current status:{" "}
                    <span className="font-medium" style={{ color: "#2b2f33" }}>
                        {agent.status}
                    </span>
                </p>
                <div className="flex flex-wrap gap-3">
                    {agent.status !== "Active" && (
                        <Button
                            onClick={onActivate}
                            className="gap-2"
                            style={{ backgroundColor: "#27ae60", color: "white" }}
                        >
                            <UserCheck className="h-4 w-4" />
                            Activate Agent
                        </Button>
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
                    Update Role & Region
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                    <div className="space-y-2">
                        <label className="text-sm" style={{ color: "#6b7078" }}>
                            Role
                        </label>
                        <Select value={newRole} onValueChange={setNewRole}>
                            <SelectTrigger>
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="Agent">Agent</SelectItem>
                                <SelectItem value="Senior Agent">Senior Agent</SelectItem>
                                <SelectItem value="Supervisor">Supervisor</SelectItem>
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
                    className="gap-2"
                    style={{ backgroundColor: "#c9a227", color: "white" }}
                >
                    <Edit className="h-4 w-4" />
                    Save Changes
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
                    {[
                        { author: "Super Admin", date: "20/12/2025", note: "Agent performance reviewed. Flagged 2 trades resolved." },
                        { author: "Compliance Team", date: "15/12/2025", note: "KYC documents verified and approved." },
                    ].map((n, i) => (
                        <div
                            key={i}
                            className="p-3 rounded-lg"
                            style={{ backgroundColor: "#f6f6f6" }}
                        >
                            <div className="flex items-center justify-between mb-1">
                                <p className="text-xs font-semibold" style={{ color: "#2b2f33" }}>
                                    {n.author}
                                </p>
                                <p className="text-xs" style={{ color: "#9aa0a6" }}>
                                    {n.date}
                                </p>
                            </div>
                            <p className="text-xs" style={{ color: "#6b7078" }}>
                                {n.note}
                            </p>
                        </div>
                    ))}
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

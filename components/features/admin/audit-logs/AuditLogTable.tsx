"use client";

import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { useState } from "react";

export interface AuditLogEntry {
    id: string;
    logId: string;
    actor: string;
    actorType: "Admin" | "Agent" | "System";
    action: string;
    targetType: string;
    targetId: string;
    ipAddress: string;
    timestamp: string;
    severity: "Info" | "Warning" | "Critical";
}

interface AuditLogTableProps {
    logs: AuditLogEntry[];
    isLoading?: boolean;
    search: string;
    actorTypeFilter: string;
    severityFilter: string;
    onSearchChange: (v: string) => void;
    onActorTypeChange: (v: string) => void;
    onSeverityChange: (v: string) => void;
}

function getSeverityColor(severity: string) {
    switch (severity) {
        case "Critical": return "bg-red-100 text-red-700 border-red-300";
        case "Warning": return "bg-yellow-100 text-yellow-700 border-yellow-300";
        default: return "bg-blue-100 text-blue-700 border-blue-300";
    }
}

function getActorTypeColor(actorType: string) {
    switch (actorType) {
        case "Admin": return "#c9a227";
        case "Agent": return "#1890ff";
        default: return "#9333ea";
    }
}

export function AuditLogTable({
    logs,
    isLoading,
    search,
    actorTypeFilter,
    severityFilter,
    onSearchChange,
    onActorTypeChange,
    onSeverityChange,
}: AuditLogTableProps) {
    return (
        <div className="space-y-4">
            {/* Filters */}
            <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-end">
                <div className="relative flex-1 sm:w-80">
                    <Input
                        placeholder="Search action, actor, or target..."
                        value={search}
                        onChange={(e) => onSearchChange(e.target.value)}
                    />
                </div>

                <div className="flex gap-4">
                    <div className="flex flex-col gap-1">
                        <span className="text-xs font-normal" style={{ color: "#c9a227" }}>Actor Type</span>
                        <Select value={actorTypeFilter} onValueChange={onActorTypeChange}>
                            <SelectTrigger className="w-32">
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="All">All</SelectItem>
                                <SelectItem value="Admin">Admin</SelectItem>
                                <SelectItem value="Agent">Agent</SelectItem>
                                <SelectItem value="System">System</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>

                    <div className="flex flex-col gap-1">
                        <span className="text-xs font-normal" style={{ color: "#c9a227" }}>Severity</span>
                        <Select value={severityFilter} onValueChange={onSeverityChange}>
                            <SelectTrigger className="w-28">
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="All">All</SelectItem>
                                <SelectItem value="Info">Info</SelectItem>
                                <SelectItem value="Warning">Warning</SelectItem>
                                <SelectItem value="Critical">Critical</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                </div>
            </div>

            {/* Table */}
            {isLoading ? (
                <div className="border rounded-lg p-8 text-center" style={{ color: "#9aa0a6" }}>
                    Loading logs...
                </div>
            ) : (
                <div className="border rounded-lg overflow-hidden" style={{ backgroundColor: "#f6f6f6" }}>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead className="text-xs font-medium">Log ID</TableHead>
                                <TableHead className="text-xs font-medium">Timestamp</TableHead>
                                <TableHead className="text-xs font-medium">Actor</TableHead>
                                <TableHead className="text-xs font-medium">Type</TableHead>
                                <TableHead className="text-xs font-medium">Action</TableHead>
                                <TableHead className="text-xs font-medium">Target</TableHead>
                                <TableHead className="text-xs font-medium">IP Address</TableHead>
                                <TableHead className="text-xs font-medium">Severity</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {logs.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={8} className="text-center py-8" style={{ color: "#9aa0a6" }}>
                                        No log entries found.
                                    </TableCell>
                                </TableRow>
                            ) : (
                                logs.map((log) => (
                                    <TableRow key={log.id}>
                                        <TableCell className="text-xs font-medium" style={{ color: "#c9a227" }}>{log.logId}</TableCell>
                                        <TableCell className="text-xs" style={{ color: "#6b7078" }}>{log.timestamp}</TableCell>
                                        <TableCell className="text-xs font-medium" style={{ color: "#2b2f33" }}>{log.actor}</TableCell>
                                        <TableCell>
                                            <span
                                                className="text-xs font-semibold"
                                                style={{ color: getActorTypeColor(log.actorType) }}
                                            >
                                                {log.actorType}
                                            </span>
                                        </TableCell>
                                        <TableCell className="text-xs" style={{ color: "#2b2f33" }}>{log.action}</TableCell>
                                        <TableCell className="text-xs" style={{ color: "#6b7078" }}>
                                            {log.targetType}: {log.targetId}
                                        </TableCell>
                                        <TableCell className="text-xs font-mono" style={{ color: "#9aa0a6" }}>{log.ipAddress}</TableCell>
                                        <TableCell>
                                            <Badge variant="outline" className={`text-xs ${getSeverityColor(log.severity)}`}>
                                                {log.severity}
                                            </Badge>
                                        </TableCell>
                                    </TableRow>
                                ))
                            )}
                        </TableBody>
                    </Table>
                </div>
            )}
        </div>
    );
}

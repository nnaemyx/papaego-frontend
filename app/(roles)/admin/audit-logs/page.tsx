"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Download } from "lucide-react";
import { auditLogsApi, type AuditLogEntry } from "@/lib/api/audit-logs";
import { AuditLogStatsCards } from "@/components/features/admin/audit-logs/AuditLogStatsCards";
import { AuditLogTable } from "@/components/features/admin/audit-logs/AuditLogTable";

export default function AdminAuditLogsPage() {
    const [search, setSearch] = useState("");
    const [actorTypeFilter, setActorTypeFilter] = useState("All");
    const [severityFilter, setSeverityFilter] = useState("All");

    const { data: stats, isLoading: statsLoading } = useQuery({
        queryKey: ["audit-log-stats"],
        queryFn: auditLogsApi.getAuditLogStats,
    });

    const { data: rawLogs = [], isLoading: logsLoading } = useQuery({
        queryKey: ["audit-logs", search, actorTypeFilter],
        queryFn: () =>
            auditLogsApi.getAuditLogs({
                search: search || undefined,
                role: actorTypeFilter !== "All" ? actorTypeFilter.toUpperCase() : undefined,
            }),
    });

    // Client-side severity filter (not a backend param)
    const logs: AuditLogEntry[] = rawLogs.filter((log) => {
        if (severityFilter !== "All" && log.severity !== severityFilter) return false;
        return true;
    });

    const handleExport = async () => {
        try {
            const blob = await auditLogsApi.exportAuditLogs();
            const url = URL.createObjectURL(blob);
            const a = document.createElement("a");
            a.href = url;
            a.download = `audit-logs-${new Date().toISOString().split("T")[0]}.csv`;
            a.click();
            URL.revokeObjectURL(url);
        } catch (error) {
            console.error("Export failed:", error);
        }
    };

    return (
        <div className="space-y-6 p-4 md:p-6 lg:pl-7 lg:pr-6" style={{ backgroundColor: "#f7f8f9" }}>
            {/* Header */}
            <div className="flex items-start justify-between">
                <div className="space-y-2">
                    <h1
                        className="text-4xl font-bold"
                        style={{ color: "var(--text-primary)", fontFamily: "var(--font-public-sans)" }}
                    >
                        Audit Logs
                    </h1>
                    <p className="text-base" style={{ color: "var(--text-secondary)" }}>
                        Full audit trail of all admin, agent, and system actions on the platform
                    </p>
                </div>

                <Button
                    variant="outline"
                    onClick={handleExport}
                    style={{ borderColor: "#27ae60", color: "#27ae60" }}
                >
                    <Download className="h-4 w-4 mr-2" />
                    Export Logs
                </Button>
            </div>

            {/* Stats */}
            <AuditLogStatsCards
                totalLogs={stats?.totalLogs}
                adminActions={stats?.adminActions}
                agentActions={stats?.agentActions}
                systemActions={stats?.systemEvents}
                isLoading={statsLoading}
            />

            {/* Log Table */}
            <div className="space-y-3">
                <h2
                    className="text-2xl font-bold"
                    style={{ color: "var(--text-primary)", fontFamily: "var(--font-public-sans)" }}
                >
                    Log Entries
                </h2>

                <AuditLogTable
                    logs={logs}
                    isLoading={logsLoading}
                    search={search}
                    actorTypeFilter={actorTypeFilter}
                    severityFilter={severityFilter}
                    onSearchChange={setSearch}
                    onActorTypeChange={setActorTypeFilter}
                    onSeverityChange={setSeverityFilter}
                />
            </div>
        </div>
    );
}

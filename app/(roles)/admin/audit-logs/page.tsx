"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Download, Sparkles, TrendingUp, CreditCard, Layers, Settings } from "lucide-react";
import { auditLogsApi, type AuditLogEntry } from "@/lib/api/audit-logs";
import { AuditLogStatsCards } from "@/components/features/admin/audit-logs/AuditLogStatsCards";
import { AuditLogTable } from "@/components/features/admin/audit-logs/AuditLogTable";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";

type ActiveTabType = "general" | "rate-changes" | "negotiations" | "payments" | "trades";

export default function AdminAuditLogsPage() {
    const [activeTab, setActiveTab] = useState<ActiveTabType>("general");
    
    // Search & filters for general logs
    const [search, setSearch] = useState("");
    const [actorTypeFilter, setActorTypeFilter] = useState("All");
    const [severityFilter, setSeverityFilter] = useState("All");

    // General logs query
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
        enabled: activeTab === "general",
    });

    const logs: AuditLogEntry[] = rawLogs.filter((log) => {
        if (severityFilter !== "All" && log.severity !== severityFilter) return false;
        return true;
    });

    // Specialized queries
    const { data: negotiationLogsData, isLoading: negotiationLoading } = useQuery({
        queryKey: ["negotiation-logs"],
        queryFn: () => auditLogsApi.getNegotiationLogs({ limit: 100 }),
        enabled: activeTab === "negotiations",
    });

    const { data: rateChangeLogsData, isLoading: rateChangeLoading } = useQuery({
        queryKey: ["rate-change-logs"],
        queryFn: () => auditLogsApi.getRateChangeLogs({ limit: 100 }),
        enabled: activeTab === "rate-changes",
    });

    const { data: paymentLogsData, isLoading: paymentLoading } = useQuery({
        queryKey: ["payment-logs"],
        queryFn: () => auditLogsApi.getPaymentLogs({ limit: 100 }),
        enabled: activeTab === "payments",
    });

    const { data: tradeLogsData, isLoading: tradeLogsLoading } = useQuery({
        queryKey: ["trade-audit-logs"],
        queryFn: () => auditLogsApi.getTradeAuditLogs({ limit: 100 }),
        enabled: activeTab === "trades",
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

    // Helper to map backend format of specialized trade/payment logs to AuditLogEntry
    const mapSpecializedLogsToEntries = (items: any[] = []): AuditLogEntry[] => {
        return items.map(log => ({
            id: log.id,
            logId: log.logId,
            actor: log.actor || "System",
            actorType: log.role === 'ADMIN' ? 'Admin' : log.role === 'AGENT' ? 'Agent' : 'System',
            action: log.action,
            targetType: 'Trade',
            targetId: log.tradeId || '—',
            ipAddress: log.ipAddress || '—',
            timestamp: new Date(log.timestamp).toLocaleString(),
            severity: log.action.includes('UPLOADED') || log.action.includes('CONFIRMED') ? 'Info' : 'Warning',
            createdAt: log.timestamp
        }));
    };

    return (
        <div className="space-y-6 p-4 md:p-6 lg:pl-7 lg:pr-6" style={{ backgroundColor: "#f7f8f9", minHeight: "100vh" }}>
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
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
                    className="self-start sm:self-auto font-semibold"
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

            {/* Tabbed Navigation */}
            <div className="flex border-b border-gray-200 overflow-x-auto gap-2 scrollbar-none">
                {[
                    { id: "general", label: "General Logs", icon: Settings },
                    { id: "rate-changes", label: "Rate Adjustments", icon: TrendingUp },
                    { id: "negotiations", label: "Preferred Negotiations", icon: Sparkles },
                    { id: "payments", label: "Payment Events", icon: CreditCard },
                    { id: "trades", label: "Trade Lifecycle", icon: Layers }
                ].map((tab) => {
                    const Icon = tab.icon;
                    const isActive = activeTab === tab.id;
                    return (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id as ActiveTabType)}
                            className={`flex items-center gap-2 py-3 px-4 text-sm font-semibold border-b-2 whitespace-nowrap transition-colors outline-none`}
                            style={{
                                borderBottomColor: isActive ? "var(--brand-primary)" : "transparent",
                                color: isActive ? "var(--brand-primary)" : "var(--text-secondary)"
                            }}
                        >
                            <Icon className={`w-4 h-4 ${isActive ? 'animate-pulse' : ''}`} />
                            {tab.label}
                        </button>
                    );
                })}
            </div>

            {/* Log Table */}
            <div className="space-y-3">
                <h2
                    className="text-2xl font-bold"
                    style={{ color: "var(--text-primary)", fontFamily: "var(--font-public-sans)" }}
                >
                    {activeTab === "general" && "General Logs"}
                    {activeTab === "rate-changes" && "Rate Change Trail"}
                    {activeTab === "negotiations" && "Turnover Negotiations"}
                    {activeTab === "payments" && "Payment Audit"}
                    {activeTab === "trades" && "Trade Status Logs"}
                </h2>

                {activeTab === "general" && (
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
                )}

                {activeTab === "rate-changes" && (
                    rateChangeLoading ? (
                        <div className="border rounded-lg p-8 text-center text-gray-500 bg-white">Loading rate change logs...</div>
                    ) : (
                        <div className="border rounded-lg overflow-hidden bg-white">
                            <Table>
                                <TableHeader style={{ backgroundColor: "#f6f6f6" }}>
                                    <TableRow>
                                        <TableHead className="font-bold text-xs">FX Pair</TableHead>
                                        <TableHead className="font-bold text-xs">Prev Rates (Buy/Sell)</TableHead>
                                        <TableHead className="font-bold text-xs">New Rates (Buy/Sell)</TableHead>
                                        <TableHead className="font-bold text-xs">Updated By</TableHead>
                                        <TableHead className="font-bold text-xs">Reason for Change</TableHead>
                                        <TableHead className="font-bold text-xs">Date & Time</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {!rateChangeLogsData?.logs || rateChangeLogsData.logs.length === 0 ? (
                                        <TableRow>
                                            <TableCell colSpan={6} className="text-center py-8 text-gray-500">No rate change logs found.</TableCell>
                                        </TableRow>
                                    ) : (
                                        rateChangeLogsData.logs.map((log: any) => (
                                            <TableRow key={log.id} className="hover:bg-gray-50/50">
                                                <TableCell className="text-xs font-bold text-indigo-700">{log.pair}</TableCell>
                                                <TableCell className="text-xs text-gray-500">
                                                    Buy: {log.previousBuy.toFixed(2)} | Sell: {log.previousSell.toFixed(2)}
                                                </TableCell>
                                                <TableCell className="text-xs font-semibold text-gray-950">
                                                    Buy: {log.newBuy.toFixed(2)} | Sell: {log.newSell.toFixed(2)}
                                                </TableCell>
                                                <TableCell className="text-xs">{log.changedBy}</TableCell>
                                                <TableCell className="text-xs italic text-gray-600">{log.reason || "Manual update"}</TableCell>
                                                <TableCell className="text-xs text-gray-500">{new Date(log.timestamp).toLocaleString()}</TableCell>
                                            </TableRow>
                                        ))
                                    )}
                                </TableBody>
                            </Table>
                        </div>
                    )
                )}

                {activeTab === "negotiations" && (
                    negotiationLoading ? (
                        <div className="border rounded-lg p-8 text-center text-gray-500 bg-white">Loading negotiation logs...</div>
                    ) : (
                        <div className="border rounded-lg overflow-hidden bg-white">
                            <Table>
                                <TableHeader style={{ backgroundColor: "#f6f6f6" }}>
                                    <TableRow>
                                        <TableHead className="font-bold text-xs">Trade ID</TableHead>
                                        <TableHead className="font-bold text-xs">Customer ID</TableHead>
                                        <TableHead className="font-bold text-xs">Original FX Rate</TableHead>
                                        <TableHead className="font-bold text-xs">Preferred FX Rate</TableHead>
                                        <TableHead className="font-bold text-xs">Discount Applied</TableHead>
                                        <TableHead className="font-bold text-xs">Date & Time</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {!negotiationLogsData?.logs || negotiationLogsData.logs.length === 0 ? (
                                        <TableRow>
                                            <TableCell colSpan={6} className="text-center py-8 text-gray-500">No negotiation logs found.</TableCell>
                                        </TableRow>
                                    ) : (
                                        negotiationLogsData.logs.map((log: any) => (
                                            <TableRow key={log.id} className="hover:bg-gray-50/50">
                                                <TableCell className="text-xs font-bold text-purple-700">#{log.tradeId.slice(0, 8).toUpperCase()}</TableCell>
                                                <TableCell className="text-xs">{log.userId}</TableCell>
                                                <TableCell className="text-xs">{log.originalRate.toFixed(4)}</TableCell>
                                                <TableCell className="text-xs font-bold text-green-600">{log.newRate.toFixed(4)}</TableCell>
                                                <TableCell className="text-xs font-semibold text-purple-600">{(log.discount * 100).toFixed(3)}%</TableCell>
                                                <TableCell className="text-xs text-gray-500">{new Date(log.timestamp).toLocaleString()}</TableCell>
                                            </TableRow>
                                        ))
                                    )}
                                </TableBody>
                            </Table>
                        </div>
                    )
                )}

                {activeTab === "payments" && (
                    <AuditLogTable
                        logs={mapSpecializedLogsToEntries(paymentLogsData?.logs)}
                        isLoading={paymentLoading}
                        search=""
                        actorTypeFilter="All"
                        severityFilter="All"
                        onSearchChange={() => {}}
                        onActorTypeChange={() => {}}
                        onSeverityChange={() => {}}
                    />
                )}

                {activeTab === "trades" && (
                    <AuditLogTable
                        logs={mapSpecializedLogsToEntries(tradeLogsData?.logs)}
                        isLoading={tradeLogsLoading}
                        search=""
                        actorTypeFilter="All"
                        severityFilter="All"
                        onSearchChange={() => {}}
                        onActorTypeChange={() => {}}
                        onSeverityChange={() => {}}
                    />
                )}
            </div>
        </div>
    );
}

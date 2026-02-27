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
import { getStatusColor } from "@/lib/formatters";
import type { Agent } from "@/lib/types/agent";
import { useQuery } from "@tanstack/react-query";
import { agentsApi } from "@/lib/api/agents";

interface AgentTransactionsTabProps {
    agent: Agent;
}

export function AgentTransactionsTab({ agent }: AgentTransactionsTabProps) {
    const { data: transactions, isLoading } = useQuery({
        queryKey: ["agent-transactions", agent.id],
        queryFn: () => agentsApi.getAgentTransactions(agent.id),
    });

    const stats = [
        { label: "Total Trades", value: agent.statistics?.totalTrades || 0 },
        { label: "Completed", value: agent.statistics?.completedTrades || 0 },
        { label: "Pending/Active", value: agent.statistics?.activeTrades || 0 },
        { label: "Flagged", value: agent.statistics?.flaggedTransactions || 0 },
    ];

    return (
        <div className="space-y-4">
            {/* Summary Row */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {stats.map((s) => (
                    <div
                        key={s.label}
                        className="rounded-xl p-4 border text-center"
                        style={{ backgroundColor: "white", borderColor: "#e1e3e6" }}
                    >
                        <p className="text-2xl font-bold" style={{ color: "#2b2f33" }}>
                            {s.value}
                        </p>
                        <p className="text-xs mt-1" style={{ color: "#6b7078" }}>
                            {s.label}
                        </p>
                    </div>
                ))}
            </div>

            {/* Table */}
            <div
                className="rounded-xl border overflow-hidden"
                style={{ backgroundColor: "white", borderColor: "#e1e3e6" }}
            >
                <div className="px-5 py-4 border-b" style={{ borderColor: "#f0f0f0" }}>
                    <h3 className="font-semibold text-base" style={{ color: "#2b2f33" }}>
                        Transaction History
                    </h3>
                </div>
                {isLoading ? (
                    <div className="p-10 text-center text-sm" style={{ color: "#6b7078" }}>
                        Loading transactions...
                    </div>
                ) : (
                    <Table>
                        <TableHeader>
                            <TableRow style={{ backgroundColor: "#f6f6f6" }}>
                                <TableHead className="text-xs font-medium">Trade ID</TableHead>
                                <TableHead className="text-xs font-medium">Date & Time</TableHead>
                                <TableHead className="text-xs font-medium">Type</TableHead>
                                <TableHead className="text-xs font-medium">Amount</TableHead>
                                <TableHead className="text-xs font-medium">Status</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {transactions && transactions.length > 0 ? (
                                transactions.map((tx: any) => (
                                    <TableRow key={tx.id}>
                                        <TableCell className="text-xs font-medium" style={{ color: "#c9a227" }}>
                                            {tx.tradeId}
                                        </TableCell>
                                        <TableCell className="text-xs">
                                            <div style={{ color: "#2b2f33" }}>{tx.date}</div>
                                            <div style={{ color: "#9aa0a6" }}>{tx.time}</div>
                                        </TableCell>
                                        <TableCell className="text-xs" style={{ color: "#6b7078" }}>
                                            {tx.transaction}
                                        </TableCell>
                                        <TableCell className="text-xs font-medium" style={{ color: "#2b2f33" }}>
                                            {tx.amount}
                                        </TableCell>
                                        <TableCell>
                                            <Badge
                                                variant="outline"
                                                className={`text-xs ${getStatusColor(tx.status)}`}
                                            >
                                                {tx.status}
                                            </Badge>
                                        </TableCell>
                                    </TableRow>
                                ))
                            ) : (
                                <TableRow>
                                    <TableCell colSpan={5} className="text-center py-10" style={{ color: "#6b7078" }}>
                                        No transactions found for this agent.
                                    </TableCell>
                                </TableRow>
                            )}
                        </TableBody>
                    </Table>
                )}
            </div>
        </div>
    );
}

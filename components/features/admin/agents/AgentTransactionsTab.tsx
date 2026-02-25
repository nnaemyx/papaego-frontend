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

interface AgentTransactionsTabProps {
    agent: Agent;
}

const mockTransactions = [
    {
        id: "#PE-24118",
        date: "25/12/2025",
        time: "11:16 AM",
        customer: "Peter Okafor",
        type: "Buy USD (NGN → USD)",
        amount: "₦3,250,000",
        status: "In Progress",
    },
    {
        id: "#PE-24117",
        date: "25/12/2025",
        time: "03:23 PM",
        customer: "Daniel Foster",
        type: "Sell USD (USD → NGN)",
        amount: "$2,400",
        status: "Completed",
    },
    {
        id: "#PE-24116",
        date: "23/12/2025",
        time: "01:48 AM",
        customer: "John Peterson",
        type: "Sell GBP (GBP → NGN)",
        amount: "£1,100",
        status: "Pending",
    },
    {
        id: "#PE-24115",
        date: "22/12/2025",
        time: "12:37 PM",
        customer: "Samuel Adeyemi",
        type: "Buy CAD (NGN → CAD)",
        amount: "₦890,000",
        status: "In Progress",
    },
    {
        id: "#PE-24114",
        date: "19/12/2025",
        time: "10:05 AM",
        customer: "Laura Smith",
        type: "Buy GBP (NGN → GBP)",
        amount: "₦1,540,000",
        status: "Cancelled",
    },
];

export function AgentTransactionsTab({ agent }: AgentTransactionsTabProps) {
    return (
        <div className="space-y-4">
            {/* Summary Row */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {[
                    { label: "Total Trades", value: "248" },
                    { label: "Completed", value: "231" },
                    { label: "In Progress", value: "12" },
                    { label: "Cancelled", value: "5" },
                ].map((s) => (
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
                <Table>
                    <TableHeader>
                        <TableRow style={{ backgroundColor: "#f6f6f6" }}>
                            <TableHead className="text-xs font-medium">Trade ID</TableHead>
                            <TableHead className="text-xs font-medium">Date & Time</TableHead>
                            <TableHead className="text-xs font-medium">Customer</TableHead>
                            <TableHead className="text-xs font-medium">Type</TableHead>
                            <TableHead className="text-xs font-medium">Amount</TableHead>
                            <TableHead className="text-xs font-medium">Status</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {mockTransactions.map((tx) => (
                            <TableRow key={tx.id}>
                                <TableCell className="text-xs font-medium" style={{ color: "#c9a227" }}>
                                    {tx.id}
                                </TableCell>
                                <TableCell className="text-xs">
                                    <div style={{ color: "#2b2f33" }}>{tx.date}</div>
                                    <div style={{ color: "#9aa0a6" }}>{tx.time}</div>
                                </TableCell>
                                <TableCell className="text-xs" style={{ color: "#2b2f33" }}>
                                    {tx.customer}
                                </TableCell>
                                <TableCell className="text-xs" style={{ color: "#6b7078" }}>
                                    {tx.type}
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
                        ))}
                    </TableBody>
                </Table>
            </div>
        </div>
    );
}

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
import type { Customer } from "@/lib/types/customer";

interface CustomerTransactionsSectionProps {
    customer: Customer;
}

// Removed mock transactions

export function CustomerTransactionsSection({ customer }: CustomerTransactionsSectionProps) {
    const transactions = customer.recentTrades || [];

    return (
        <div className="space-y-4">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {[
                    { label: "Total Trades", value: customer.totalTransactions || 0 },
                    { label: "Completed", value: transactions.filter(t => t.status === 'COMPLETED').length },
                    { label: "Pending", value: transactions.filter(t => ['INITIATED', 'QUOTED', 'SENT_TO_CUSTOMER', 'AWAITING_PAYMENT'].includes(t.status)).length },
                    { label: "Cancelled", value: transactions.filter(t => t.status === 'CANCELLED').length },
                ].map((s) => (
                    <div
                        key={s.label}
                        className="rounded-xl p-4 border text-center"
                        style={{ backgroundColor: "white", borderColor: "#e1e3e6" }}
                    >
                        <p className="text-2xl font-bold" style={{ color: "#2b2f33" }}>{s.value}</p>
                        <p className="text-xs mt-1" style={{ color: "#6b7078" }}>{s.label}</p>
                    </div>
                ))}
            </div>

            <div className="rounded-xl border overflow-hidden" style={{ backgroundColor: "white", borderColor: "#e1e3e6" }}>
                <div className="px-5 py-4 border-b" style={{ borderColor: "#f0f0f0" }}>
                    <h3 className="font-semibold text-base" style={{ color: "#2b2f33" }}>Transaction History</h3>
                </div>
                <Table>
                    <TableHeader>
                        <TableRow style={{ backgroundColor: "#f6f6f6" }}>
                            <TableHead className="text-xs font-medium">Trade ID</TableHead>
                            <TableHead className="text-xs font-medium">Date</TableHead>
                            <TableHead className="text-xs font-medium">Type</TableHead>
                            <TableHead className="text-xs font-medium">Amount</TableHead>
                            <TableHead className="text-xs font-medium">Agent</TableHead>
                            <TableHead className="text-xs font-medium">Status</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {transactions.length > 0 ? (
                            transactions.map((tx) => (
                                <TableRow key={tx.id}>
                                    <TableCell className="text-xs font-medium" style={{ color: "#c9a227" }}>{tx.tradeId}</TableCell>
                                    <TableCell className="text-xs" style={{ color: "#6b7078" }}>{tx.date}</TableCell>
                                    <TableCell className="text-xs" style={{ color: "#2b2f33" }}>{tx.transaction}</TableCell>
                                    <TableCell className="text-xs font-medium" style={{ color: "#2b2f33" }}>{tx.amount}</TableCell>
                                    <TableCell className="text-xs" style={{ color: "#6b7078" }}>{tx.agent}</TableCell>
                                    <TableCell>
                                        <Badge variant="outline" className={`text-xs ${getStatusColor(tx.status)}`}>
                                            {tx.status}
                                        </Badge>
                                    </TableCell>
                                </TableRow>
                            ))
                        ) : (
                            <TableRow>
                                <TableCell colSpan={6} className="text-center py-8 text-sm text-gray-500">
                                    No transaction records found.
                                </TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
            </div>
        </div>
    );
}

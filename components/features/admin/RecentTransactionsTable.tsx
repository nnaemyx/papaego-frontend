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
import { MoreHorizontal } from "lucide-react";
import { getStatusColor } from "@/lib/formatters";

export interface Transaction {
  id: string;
  date: string;
  time: string;
  customer: string;
  agent: string;
  transaction: string;
  amount: string;
  status: "In Progress" | "Completed" | "Pending" | "Cancelled";
}

interface RecentTransactionsTableProps {
  transactions: Transaction[];
}

export function RecentTransactionsTable({
  transactions,
}: RecentTransactionsTableProps) {
  return (
    <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="font-medium text-xs">Trade ID</TableHead>
            <TableHead className="font-medium text-xs">Date</TableHead>
            <TableHead className="font-medium text-xs">Time</TableHead>
            <TableHead className="font-medium text-xs">Customer</TableHead>
            <TableHead className="font-medium text-xs">Agent</TableHead>
            <TableHead className="font-medium text-xs">Transaction</TableHead>
            <TableHead className="font-medium text-xs">Amount</TableHead>
            <TableHead className="font-medium text-xs">Status</TableHead>
            <TableHead className="font-medium text-xs">Action</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {transactions.map((tx) => (
            <TableRow key={tx.id}>
              <TableCell className="text-xs font-medium">{tx.id}</TableCell>
              <TableCell className="text-xs">{tx.date}</TableCell>
              <TableCell className="text-xs">{tx.time}</TableCell>
              <TableCell className="text-xs text-green-600">
                {tx.customer}
              </TableCell>
              <TableCell className="text-xs">{tx.agent}</TableCell>
              <TableCell className="text-xs">{tx.transaction}</TableCell>
              <TableCell className="text-xs font-medium">{tx.amount}</TableCell>
              <TableCell>
                <Badge
                  variant="outline"
                  className={`text-xs ${getStatusColor(tx.status)}`}
                >
                  {tx.status}
                </Badge>
              </TableCell>
              <TableCell>
                <button className="focus:outline-none">
                  <MoreHorizontal className="h-4 w-4 text-gray-400" />
                </button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}

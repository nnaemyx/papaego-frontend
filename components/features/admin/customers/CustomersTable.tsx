"use client";

import { useState } from "react";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { MoreHorizontal } from "lucide-react";
import type { Customer } from "@/lib/types/customer";
import { formatDate } from "@/lib/formatters";

interface CustomersTableProps {
    customers: Customer[];
    isLoading?: boolean;
    onViewDetails?: (id: string) => void;
}

function getVerificationColor(status: string) {
    switch (status) {
        case "Verified":
            return "bg-green-100 text-green-700 border-green-300";
        case "Pending":
            return "bg-yellow-100 text-yellow-700 border-yellow-300";
        case "Failed":
            return "bg-red-100 text-red-700 border-red-300";
        default:
            return "bg-gray-100 text-gray-700 border-gray-300";
    }
}

export function CustomersTable({
    customers,
    isLoading,
    onViewDetails,
}: CustomersTableProps) {
    const [selected, setSelected] = useState<string[]>([]);

    const toggle = (id: string) => {
        setSelected((prev) =>
            prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
        );
    };

    const toggleAll = () => {
        setSelected(selected.length === customers.length ? [] : customers.map((c) => c.id));
    };

    if (isLoading) {
        return (
            <div className="border rounded-lg p-8 text-center text-gray-500">
                Loading customers...
            </div>
        );
    }

    if (customers.length === 0) {
        return (
            <div className="border rounded-lg p-8 text-center" style={{ color: "#9aa0a6" }}>
                No customers found.
            </div>
        );
    }

    return (
        <div className="border rounded-lg overflow-hidden" style={{ backgroundColor: "#f6f6f6" }}>
            <Table>
                <TableHeader>
                    <TableRow>
                        <TableHead className="w-12">
                            <Checkbox
                                checked={customers.length > 0 && selected.length === customers.length}
                                onCheckedChange={toggleAll}
                            />
                        </TableHead>
                        <TableHead className="text-xs font-medium">Customer ID</TableHead>
                        <TableHead className="text-xs font-medium">Name</TableHead>
                        <TableHead className="text-xs font-medium">Email</TableHead>
                        <TableHead className="text-xs font-medium">Phone</TableHead>
                        <TableHead className="text-xs font-medium">Total Trades</TableHead>
                        <TableHead className="text-xs font-medium">Last Trade</TableHead>
                        <TableHead className="text-xs font-medium">Verification</TableHead>
                        <TableHead className="text-xs font-medium">Action</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {customers.map((customer) => (
                        <TableRow key={customer.id}>
                            <TableCell>
                                <Checkbox
                                    checked={selected.includes(customer.id)}
                                    onCheckedChange={() => toggle(customer.id)}
                                />
                            </TableCell>
                            <TableCell className="text-xs font-medium" style={{ color: "#c9a227" }}>
                                {customer.customerId}
                            </TableCell>
                            <TableCell className="text-xs font-medium" style={{ color: "#2b2f33" }}>
                                {customer.name}
                            </TableCell>
                            <TableCell className="text-xs" style={{ color: "#6b7078" }}>
                                {customer.email}
                            </TableCell>
                            <TableCell className="text-xs" style={{ color: "#6b7078" }}>
                                {customer.phone}
                            </TableCell>
                            <TableCell className="text-xs font-medium" style={{ color: "#2b2f33" }}>
                                {customer.totalTransactions}
                            </TableCell>
                            <TableCell className="text-xs" style={{ color: "#6b7078" }}>
                                {formatDate(customer.lastTrade)}
                            </TableCell>
                            <TableCell>
                                <Badge
                                    variant="outline"
                                    className={`text-xs ${getVerificationColor(customer.verificationStatus)}`}
                                >
                                    {customer.verificationStatus}
                                </Badge>
                            </TableCell>
                            <TableCell>
                                <DropdownMenu>
                                    <DropdownMenuTrigger className="focus:outline-none">
                                        <MoreHorizontal className="h-4 w-4" />
                                    </DropdownMenuTrigger>
                                    <DropdownMenuContent align="end">
                                        <DropdownMenuItem onClick={() => onViewDetails?.(customer.id)}>
                                            View Details
                                        </DropdownMenuItem>
                                        <DropdownMenuItem>Send Message</DropdownMenuItem>
                                        <DropdownMenuItem className="text-red-600">
                                            Restrict Account
                                        </DropdownMenuItem>
                                    </DropdownMenuContent>
                                </DropdownMenu>
                            </TableCell>
                        </TableRow>
                    ))}
                </TableBody>
            </Table>
        </div>
    );
}

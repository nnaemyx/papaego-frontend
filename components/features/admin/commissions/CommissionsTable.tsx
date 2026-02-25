"use client";

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
import { useState } from "react";

export interface CommissionRow {
    id: string;
    commissionId: string;
    agentName: string;
    agentId: string;
    tradeId: string;
    tradeType: string;
    tradeVolume: string;
    commissionRate: string;
    commissionAmount: string;
    status: "Paid" | "Pending" | "Disputed" | "Processing";
    date: string;
}

interface CommissionsTableProps {
    commissions: CommissionRow[];
    isLoading?: boolean;
    onViewDetails?: (id: string) => void;
}

function getStatusColor(status: string) {
    switch (status) {
        case "Paid": return "bg-green-100 text-green-700 border-green-300";
        case "Pending": return "bg-yellow-100 text-yellow-700 border-yellow-300";
        case "Disputed": return "bg-red-100 text-red-700 border-red-300";
        case "Processing": return "bg-blue-100 text-blue-700 border-blue-300";
        default: return "bg-gray-100 text-gray-700 border-gray-300";
    }
}

export function CommissionsTable({ commissions, isLoading, onViewDetails }: CommissionsTableProps) {
    const [selected, setSelected] = useState<string[]>([]);

    const toggle = (id: string) =>
        setSelected((prev) => prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]);
    const toggleAll = () =>
        setSelected(selected.length === commissions.length ? [] : commissions.map((c) => c.id));

    if (isLoading) {
        return (
            <div className="border rounded-lg p-8 text-center" style={{ color: "#9aa0a6" }}>
                Loading commissions...
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
                                checked={commissions.length > 0 && selected.length === commissions.length}
                                onCheckedChange={toggleAll}
                            />
                        </TableHead>
                        <TableHead className="text-xs font-medium">Commission ID</TableHead>
                        <TableHead className="text-xs font-medium">Agent</TableHead>
                        <TableHead className="text-xs font-medium">Trade ID</TableHead>
                        <TableHead className="text-xs font-medium">Trade Type</TableHead>
                        <TableHead className="text-xs font-medium">Volume</TableHead>
                        <TableHead className="text-xs font-medium">Rate</TableHead>
                        <TableHead className="text-xs font-medium">Amount</TableHead>
                        <TableHead className="text-xs font-medium">Date</TableHead>
                        <TableHead className="text-xs font-medium">Status</TableHead>
                        <TableHead className="text-xs font-medium">Action</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {commissions.map((c) => (
                        <TableRow key={c.id}>
                            <TableCell>
                                <Checkbox
                                    checked={selected.includes(c.id)}
                                    onCheckedChange={() => toggle(c.id)}
                                />
                            </TableCell>
                            <TableCell className="text-xs font-medium" style={{ color: "#c9a227" }}>
                                {c.commissionId}
                            </TableCell>
                            <TableCell>
                                <div className="text-xs font-medium" style={{ color: "#2b2f33" }}>{c.agentName}</div>
                                <div className="text-xs" style={{ color: "#9aa0a6" }}>{c.agentId}</div>
                            </TableCell>
                            <TableCell className="text-xs" style={{ color: "#6b7078" }}>{c.tradeId}</TableCell>
                            <TableCell className="text-xs" style={{ color: "#6b7078" }}>{c.tradeType}</TableCell>
                            <TableCell className="text-xs font-medium" style={{ color: "#2b2f33" }}>{c.tradeVolume}</TableCell>
                            <TableCell className="text-xs" style={{ color: "#6b7078" }}>{c.commissionRate}</TableCell>
                            <TableCell className="text-xs font-bold" style={{ color: "#c9a227" }}>{c.commissionAmount}</TableCell>
                            <TableCell className="text-xs" style={{ color: "#6b7078" }}>{c.date}</TableCell>
                            <TableCell>
                                <Badge variant="outline" className={`text-xs ${getStatusColor(c.status)}`}>
                                    {c.status}
                                </Badge>
                            </TableCell>
                            <TableCell>
                                <DropdownMenu>
                                    <DropdownMenuTrigger className="focus:outline-none">
                                        <MoreHorizontal className="h-4 w-4" />
                                    </DropdownMenuTrigger>
                                    <DropdownMenuContent align="end">
                                        <DropdownMenuItem onClick={() => onViewDetails?.(c.id)}>
                                            View Details
                                        </DropdownMenuItem>
                                        <DropdownMenuItem>Mark as Paid</DropdownMenuItem>
                                        <DropdownMenuItem className="text-red-600">Flag as Disputed</DropdownMenuItem>
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

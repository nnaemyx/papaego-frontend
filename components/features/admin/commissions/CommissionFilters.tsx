"use client";

import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";

interface CommissionFiltersProps {
    statusFilter: string;
    typeFilter: string;
    dateFilter: string;
    onStatusChange: (v: string) => void;
    onTypeChange: (v: string) => void;
    onDateChange: (v: string) => void;
}

export function CommissionFilters({
    statusFilter,
    typeFilter,
    dateFilter,
    onStatusChange,
    onTypeChange,
    onDateChange,
}: CommissionFiltersProps) {
    return (
        <div className="flex gap-4 flex-wrap">
            <div className="flex flex-col gap-1">
                <span className="text-xs font-normal" style={{ color: "#c9a227" }}>
                    Status
                </span>
                <Select value={statusFilter} onValueChange={onStatusChange}>
                    <SelectTrigger className="w-36">
                        <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="All">All</SelectItem>
                        <SelectItem value="Paid">Paid</SelectItem>
                        <SelectItem value="Pending">Pending</SelectItem>
                        <SelectItem value="Processing">Processing</SelectItem>
                        <SelectItem value="Disputed">Disputed</SelectItem>
                    </SelectContent>
                </Select>
            </div>

            <div className="flex flex-col gap-1">
                <span className="text-xs font-normal" style={{ color: "#c9a227" }}>
                    Trade Type
                </span>
                <Select value={typeFilter} onValueChange={onTypeChange}>
                    <SelectTrigger className="w-32">
                        <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="All">All</SelectItem>
                        <SelectItem value="Buy">Buy</SelectItem>
                        <SelectItem value="Sell">Sell</SelectItem>
                    </SelectContent>
                </Select>
            </div>

            <div className="flex flex-col gap-1">
                <span className="text-xs font-normal" style={{ color: "#c9a227" }}>
                    Date Range
                </span>
                <Select value={dateFilter} onValueChange={onDateChange}>
                    <SelectTrigger className="w-36">
                        <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="All">All Time</SelectItem>
                        <SelectItem value="Today">Today</SelectItem>
                        <SelectItem value="Week">This Week</SelectItem>
                        <SelectItem value="Month">This Month</SelectItem>
                    </SelectContent>
                </Select>
            </div>
        </div>
    );
}

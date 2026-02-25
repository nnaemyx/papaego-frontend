"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search, Download } from "lucide-react";
import { commissionsApi, type CommissionRecord } from "@/lib/api/commissions";
import { CommissionStatsCards } from "@/components/features/admin/commissions/CommissionStatsCards";
import { CommissionsTable } from "@/components/features/admin/commissions/CommissionsTable";
import { CommissionFilters } from "@/components/features/admin/commissions/CommissionFilters";
import type { CommissionRow } from "@/components/features/admin/commissions/CommissionsTable";

// Map backend CommissionRecord to CommissionsTable's CommissionRow shape
function toTableRow(c: CommissionRecord): CommissionRow {
    return {
        id: c.id,
        commissionId: c.reference || `#CM-${c.id.slice(0, 5).toUpperCase()}`,
        agentName: c.agent,
        agentId: `#PE-${c.agentId.slice(0, 5).toUpperCase()}`,
        tradeId: `#PE-${c.id.slice(0, 5).toUpperCase()}`,
        tradeType: c.commissionType,
        tradeVolume: "—",
        commissionRate: "—",
        commissionAmount: c.amount,
        status: c.status as CommissionRow["status"],
        date: c.date,
    };
}

export default function AdminCommissionsPage() {
    const router = useRouter();
    const [search, setSearch] = useState("");
    const [statusFilter, setStatusFilter] = useState("All");
    const [typeFilter, setTypeFilter] = useState("All");
    const [dateFilter, setDateFilter] = useState("All");

    const { data: stats, isLoading: statsLoading } = useQuery({
        queryKey: ["commission-stats"],
        queryFn: commissionsApi.getCommissionStats,
    });

    const { data: rawCommissions = [], isLoading: tableLoading } = useQuery({
        queryKey: ["commissions", search, statusFilter, typeFilter],
        queryFn: () =>
            commissionsApi.getCommissions({
                search: search || undefined,
                status: statusFilter !== "All" ? statusFilter.toUpperCase() : undefined,
                type: typeFilter !== "All" ? typeFilter : undefined,
            }),
    });

    const commissions: CommissionRow[] = rawCommissions.map(toTableRow);

    const handleExport = async () => {
        try {
            const blob = await commissionsApi.exportCommissions();
            const url = URL.createObjectURL(blob);
            const a = document.createElement("a");
            a.href = url;
            a.download = `commissions-${new Date().toISOString().split("T")[0]}.csv`;
            a.click();
            URL.revokeObjectURL(url);
        } catch (error) {
            console.error("Export failed:", error);
        }
    };

    return (
        <div className="space-y-6 p-4 md:p-6 lg:pl-7 lg:pr-6" style={{ backgroundColor: "#f7f8f9" }}>
            {/* Header */}
            <div className="space-y-2">
                <h1
                    className="text-4xl font-bold"
                    style={{ color: "var(--text-primary)", fontFamily: "var(--font-public-sans)" }}
                >
                    Commissions
                </h1>
                <p className="text-base" style={{ color: "var(--text-secondary)" }}>
                    Monitor agent commissions, payout statuses, and dispute management
                </p>
            </div>

            {/* Stats */}
            <CommissionStatsCards
                totalCommissions={stats?.totalCommissions}
                totalPaid={stats?.totalPaid}
                totalPending={stats?.pendingPayouts}
                totalDisputed={stats?.disputedCommissions}
                isLoading={statsLoading}
            />

            {/* Table Section */}
            <div className="space-y-4">
                <h2
                    className="text-2xl font-bold"
                    style={{ color: "var(--text-primary)", fontFamily: "var(--font-public-sans)" }}
                >
                    Commission Records
                </h2>

                <div className="flex flex-col lg:flex-row gap-4 items-start lg:items-end justify-between">
                    <div className="space-y-4">
                        <div className="relative w-full sm:w-80">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                            <Input
                                placeholder="Search agent or commission ID"
                                className="pl-10"
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                            />
                        </div>
                        <CommissionFilters
                            statusFilter={statusFilter}
                            typeFilter={typeFilter}
                            dateFilter={dateFilter}
                            onStatusChange={setStatusFilter}
                            onTypeChange={setTypeFilter}
                            onDateChange={setDateFilter}
                        />
                    </div>

                    <Button
                        variant="outline"
                        onClick={handleExport}
                        style={{ borderColor: "#27ae60", color: "#27ae60" }}
                    >
                        <Download className="h-4 w-4 mr-2" />
                        Export
                    </Button>
                </div>

                <CommissionsTable
                    commissions={commissions}
                    isLoading={tableLoading}
                    onViewDetails={(id) => router.push(`/admin/commissions/${id}`)}
                />
            </div>
        </div>
    );
}

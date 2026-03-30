"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search, Download } from "lucide-react";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { adminCustomersApi } from "@/lib/api/customers";
import { CustomerStatsCards } from "@/components/features/admin/customers/CustomerStatsCards";
import { CustomersTable } from "@/components/features/admin/customers/CustomersTable";
import { NIGERIAN_SECTORS } from "@/lib/api/customer";

export default function AdminCustomersPage() {
    const router = useRouter();
    const [search, setSearch] = useState("");
    const [statusFilter, setStatusFilter] = useState("All");
    const [typeFilter, setTypeFilter] = useState("All");
    const [sectorFilter, setSectorFilter] = useState("All");

    const { data: customers = [], isLoading: customersLoading } = useQuery({
        queryKey: ["admin-customers", search, statusFilter, typeFilter, sectorFilter],
        queryFn: () =>
            adminCustomersApi.getCustomers({
                search,
                status: statusFilter as any,
                customerType: typeFilter as any,
                sector: sectorFilter,
            }),
    });

    const { data: stats, isLoading: statsLoading } = useQuery({
        queryKey: ["admin-customer-stats"],
        queryFn: adminCustomersApi.getCustomerStats,
    });

    const queryClient = useQueryClient();

    const approveMutation = useMutation({
        mutationFn: (id: string) => adminCustomersApi.approveCustomer(id),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["admin-customers"] });
            queryClient.invalidateQueries({ queryKey: ["admin-customer-stats"] });
        },
    });

    const deleteMutation = useMutation({
        mutationFn: (id: string) => adminCustomersApi.deleteCustomer(id),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["admin-customers"] });
            queryClient.invalidateQueries({ queryKey: ["admin-customer-stats"] });
        },
    });

    const restrictMutation = useMutation({
        mutationFn: (id: string) => adminCustomersApi.restrictCustomer(id),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["admin-customers"] });
        },
    });

    const messageMutation = useMutation({
        mutationFn: ({ id, payload }: { id: string; payload: { subject: string; message: string } }) =>
            adminCustomersApi.sendMessage(id, payload),
        onSuccess: () => {
            // Optional: could show a toast success message here
        },
    });

    const handleExport = async () => {
        try {
            const blob = await adminCustomersApi.exportCustomers();
            const url = URL.createObjectURL(blob);
            const a = document.createElement("a");
            a.href = url;
            a.download = `customers-${new Date().toISOString().split("T")[0]}.csv`;
            a.click();
            URL.revokeObjectURL(url);
        } catch (error) {
            console.error("Export failed:", error);
        }
    };

    return (
        <div
            className="space-y-6 p-4 md:p-6 lg:pl-7 lg:pr-6"
            style={{ backgroundColor: "#f7f8f9" }}
        >
            {/* Header */}
            <div className="space-y-2">
                <h1
                    className="text-4xl font-bold"
                    style={{ color: "var(--text-primary)", fontFamily: "var(--font-public-sans)" }}
                >
                    Customers
                </h1>
                <p className="text-base" style={{ color: "var(--text-secondary)" }}>
                    View and manage all customer accounts, KYC status, and trade histories
                </p>
            </div>

            {/* Stats Cards */}
            {stats && <CustomerStatsCards stats={stats} isLoading={statsLoading} />}

            {/* All Customers Section */}
            <div className="space-y-4">
                <h2
                    className="text-2xl font-bold"
                    style={{ color: "var(--text-primary)", fontFamily: "var(--font-public-sans)" }}
                >
                    All Customers
                </h2>

                {/* Filters */}
                <div className="flex flex-col lg:flex-row gap-4 items-start lg:items-center justify-between">
                    <div className="flex flex-col sm:flex-row gap-4 w-full lg:w-auto">
                        <div className="relative flex-1 sm:w-80">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                            <Input
                                placeholder="Search by name, email, or ID"
                                className="pl-10"
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                            />
                        </div>

                        <div className="flex gap-4">
                            <div className="flex flex-col gap-1">
                                <span className="text-xs font-normal" style={{ color: "#c9a227" }}>
                                    Status
                                </span>
                                <Select value={statusFilter} onValueChange={setStatusFilter}>
                                    <SelectTrigger className="w-32">
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="All">All</SelectItem>
                                        <SelectItem value="Verified">Verified</SelectItem>
                                        <SelectItem value="Pending">Pending</SelectItem>
                                        <SelectItem value="Failed">Failed</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>

                            <div className="flex flex-col gap-1">
                                <span className="text-xs font-normal" style={{ color: "#c9a227" }}>
                                    Type
                                </span>
                                <Select value={typeFilter} onValueChange={setTypeFilter}>
                                    <SelectTrigger className="w-36">
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="All">All</SelectItem>
                                        <SelectItem value="Individual">Individual</SelectItem>
                                        <SelectItem value="Business">Business</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>

                            <div className="flex flex-col gap-1">
                                <span className="text-xs font-normal" style={{ color: "#c9a227" }}>
                                    Sector (Business)
                                </span>
                                <Select value={sectorFilter} onValueChange={setSectorFilter} disabled={typeFilter === "Individual"}>
                                    <SelectTrigger className="w-40">
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="All">All Sectors</SelectItem>
                                        {NIGERIAN_SECTORS.map(s => (
                                            <SelectItem key={s} value={s}>{s}</SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>
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

                {/* Table */}
                <CustomersTable
                    customers={customers}
                    isLoading={customersLoading}
                    onViewDetails={(id) => router.push(`/admin/customers/${id}`)}
                    onApprove={(id) => approveMutation.mutate(id)}
                    onDelete={(id) => deleteMutation.mutate(id)}
                    onRestrict={(id) => restrictMutation.mutate(id)}
                    onSendMessage={(id, payload) => messageMutation.mutate({ id, payload })}
                />
            </div>
        </div>
    );
}

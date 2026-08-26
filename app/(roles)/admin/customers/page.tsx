"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import {
    Search,
    Download,
    Filter,
    Wallet,
    Users,
    Lock,
    TrendingUp,
    ChevronRight,
    ChevronLeft,
    Building2,
    SlidersHorizontal,
    X,
} from "lucide-react";
import { adminCustomersApi } from "@/lib/api/customers";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import Link from "next/link";

export default function AdminCustomerLedgersPage() {
    const router = useRouter();
    const [search, setSearch] = useState("");
    const [statusFilter, setStatusFilter] = useState("All");
    const [showFilterDropdown, setShowFilterDropdown] = useState(false);
    const [page, setPage] = useState(1);
    const pageSize = 10;

    const { data: rawCustomers = [], isLoading: customersLoading } = useQuery({
        queryKey: ["admin-customers", search, statusFilter],
        queryFn: () =>
            adminCustomersApi.getCustomers({
                search,
                status: statusFilter as any,
            }),
    });

    const { data: stats, isLoading: statsLoading } = useQuery({
        queryKey: ["admin-customer-stats"],
        queryFn: adminCustomersApi.getCustomerStats,
    });

    const handleExport = async () => {
        try {
            toast.info("Exporting customer ledgers...");
            const blob = await adminCustomersApi.exportCustomers();
            const url = URL.createObjectURL(blob);
            const a = document.createElement("a");
            a.href = url;
            a.download = `customer-ledgers-${new Date().toISOString().split("T")[0]}.csv`;
            a.click();
            URL.revokeObjectURL(url);
            toast.success("Ledgers exported successfully!");
        } catch (error) {
            console.error("Export failed:", error);
            toast.error("Export failed.");
        }
    };

    // Filter customers
    const filteredCustomers = rawCustomers.filter((c: any) => {
        if (!search) return true;
        const q = search.toLowerCase();
        const name = (c.name || c.companyName || "").toLowerCase();
        const id = (c.customerId || c.id || "").toLowerCase();
        const email = (c.email || "").toLowerCase();
        return name.includes(q) || id.includes(q) || email.includes(q);
    });

    const totalEntries = filteredCustomers.length;
    const totalPages = Math.ceil(totalEntries / pageSize) || 1;
    const startIndex = (page - 1) * pageSize;
    const paginatedCustomers = filteredCustomers.slice(startIndex, startIndex + pageSize);

    // Compute metrics
    const totalAum = stats?.totalAum ?? rawCustomers.reduce((sum: number, c: any) => sum + (c.totalBalance || 0), 0);
    const activeCustomersCount = stats?.activeCustomers ?? rawCustomers.length;
    const totalReserved = stats?.totalReservedFunds ?? rawCustomers.reduce((sum: number, c: any) => sum + (c.reservedBalance || 0), 0);

    return (
        <div className="p-4 md:p-8 space-y-6 max-w-7xl mx-auto font-sans" style={{ backgroundColor: "#F7F8F9" }}>
            {/* ── Top Header & Actions ── */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b pb-4" style={{ borderColor: "#E1E3E6" }}>
                <div>
                    <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight text-slate-900">
                        Customer Ledgers
                    </h1>
                    <p className="text-xs md:text-sm text-slate-500 mt-1">
                        Manage and view detailed institutional customer balances.
                    </p>
                </div>

                <div className="flex items-center gap-3">
                    <div className="relative">
                        <Button
                            variant="outline"
                            onClick={() => setShowFilterDropdown(!showFilterDropdown)}
                            className="bg-white border-slate-200 text-slate-700 text-xs font-bold px-4 py-2.5 h-auto rounded-lg shadow-sm gap-2 hover:bg-slate-50"
                        >
                            <Filter className="w-4 h-4 text-slate-500" />
                            Filter
                            {statusFilter !== "All" && (
                                <span className="w-2 h-2 rounded-full bg-[#C9A227]" />
                            )}
                        </Button>

                        {showFilterDropdown && (
                            <div className="absolute right-0 mt-2 w-48 bg-white rounded-xl shadow-xl border border-slate-200 p-3 z-30 space-y-2">
                                <div className="flex items-center justify-between text-xs font-bold text-slate-700 border-b pb-1.5">
                                    <span>Filter Status</span>
                                    <button onClick={() => setShowFilterDropdown(false)} className="text-slate-400 hover:text-slate-600">
                                        <X className="w-3.5 h-3.5" />
                                    </button>
                                </div>
                                <div className="space-y-1 text-xs">
                                    {["All", "Active", "Review", "Pending"].map((st) => (
                                        <button
                                            key={st}
                                            onClick={() => {
                                                setStatusFilter(st);
                                                setShowFilterDropdown(false);
                                            }}
                                            className={`w-full text-left px-2.5 py-1.5 rounded-lg font-medium transition-colors ${
                                                statusFilter === st
                                                    ? "bg-amber-50 text-[#C9A227] font-bold"
                                                    : "text-slate-700 hover:bg-slate-50"
                                            }`}
                                        >
                                            {st}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>

                    <Button
                        onClick={handleExport}
                        className="bg-[#C9A227] hover:bg-[#b08e20] text-white text-xs font-bold px-4 py-2.5 h-auto rounded-lg shadow-sm gap-2"
                    >
                        <Download className="w-4 h-4" />
                        Export
                    </Button>
                </div>
            </div>

            {/* ── Top 3 Metric Cards matching Design ── */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                {/* Card 1: TOTAL AUM */}
                <div className="bg-white p-6 rounded-2xl border shadow-sm flex flex-col justify-between" style={{ borderColor: "#E1E3E6" }}>
                    <div className="flex items-center justify-between">
                        <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                            TOTAL AUM
                        </span>
                        <div className="w-8 h-8 rounded-lg bg-amber-50 text-[#C9A227] flex items-center justify-center">
                            <Wallet className="w-4 h-4" />
                        </div>
                    </div>
                    <div className="mt-4">
                        <p className="text-3xl font-extrabold text-slate-900 tracking-tight">
                            ₦{Number(totalAum).toLocaleString("en-US", { maximumFractionDigits: 0 })}
                        </p>
                        <div className="flex items-center gap-1.5 mt-2">
                            <span className="text-[11px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-md flex items-center gap-0.5">
                                <TrendingUp className="w-3.5 h-3.5" />
                                +4.2%
                            </span>
                            <span className="text-[11px] text-slate-400">vs last month</span>
                        </div>
                    </div>
                </div>

                {/* Card 2: ACTIVE CUSTOMERS */}
                <div className="bg-white p-6 rounded-2xl border shadow-sm flex flex-col justify-between" style={{ borderColor: "#E1E3E6" }}>
                    <div className="flex items-center justify-between">
                        <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                            ACTIVE CUSTOMERS
                        </span>
                        <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
                            <Users className="w-4 h-4" />
                        </div>
                    </div>
                    <div className="mt-4">
                        <p className="text-3xl font-extrabold text-slate-900 tracking-tight">
                            {Number(activeCustomersCount).toLocaleString("en-US")}
                        </p>
                        <div className="flex items-center gap-1.5 mt-2">
                            <span className="text-[11px] font-bold text-slate-500 bg-slate-100 px-2 py-0.5 rounded-md">
                                — 0%
                            </span>
                            <span className="text-[11px] text-slate-400">growth stable</span>
                        </div>
                    </div>
                </div>

                {/* Card 3: TOTAL RESERVED FUNDS */}
                <div className="bg-white p-6 rounded-2xl border shadow-sm flex flex-col justify-between" style={{ borderColor: "#E1E3E6" }}>
                    <div className="flex items-center justify-between">
                        <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                            TOTAL RESERVED FUNDS
                        </span>
                        <div className="w-8 h-8 rounded-lg bg-red-50 text-red-500 flex items-center justify-center">
                            <Lock className="w-4 h-4" />
                        </div>
                    </div>
                    <div className="mt-4">
                        <p className="text-3xl font-extrabold text-slate-900 tracking-tight">
                            ₦{Number(totalReserved).toLocaleString("en-US", { maximumFractionDigits: 0 })}
                        </p>
                        <div className="flex items-center gap-1.5 mt-2">
                            <span className="text-[11px] font-bold text-red-600 bg-red-50 px-2 py-0.5 rounded-md flex items-center gap-0.5">
                                <TrendingUp className="w-3.5 h-3.5" />
                                +1.1%
                            </span>
                            <span className="text-[11px] text-slate-400">in-flight trades</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* ── Search Bar ── */}
            <div className="relative">
                <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                    type="text"
                    placeholder="Search by Organization or ID..."
                    value={search}
                    onChange={(e) => {
                        setSearch(e.target.value);
                        setPage(1);
                    }}
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 bg-white text-xs font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#C9A227]/40 focus:border-[#C9A227] shadow-sm"
                />
            </div>

            {/* ── Customer Ledgers Table matching Design ── */}
            <div className="bg-white rounded-2xl border shadow-sm overflow-hidden" style={{ borderColor: "#E1E3E6" }}>
                <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs">
                        <thead className="bg-slate-50/80 border-b border-slate-200 text-slate-400 uppercase tracking-wider text-[10px] font-bold">
                            <tr>
                                <th className="py-3.5 px-6">Customer Name</th>
                                <th className="py-3.5 px-4">Cur</th>
                                <th className="py-3.5 px-4 font-mono">Total Balance</th>
                                <th className="py-3.5 px-4 font-mono text-[#C9A227]">Available</th>
                                <th className="py-3.5 px-4 font-mono">Reserved</th>
                                <th className="py-3.5 px-4">Status</th>
                                <th className="py-3.5 px-6 text-right">Action</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {customersLoading ? (
                                <tr>
                                    <td colSpan={7} className="py-12 text-center text-slate-400 text-xs">
                                        Loading customer ledgers...
                                    </td>
                                </tr>
                            ) : paginatedCustomers.length === 0 ? (
                                <tr>
                                    <td colSpan={7} className="py-12 text-center text-slate-400 text-xs">
                                        No customer ledgers found.
                                    </td>
                                </tr>
                            ) : (
                                paginatedCustomers.map((cust: any) => {
                                    const isVerified = cust.status === "Active" || cust.verificationStatus === "Active" || cust.verified;
                                    const isReview = cust.status === "Review" || cust.verificationStatus === "Review";
                                    const totalBal = cust.totalBalance ?? (Number(cust.availableBalance || 0) + Number(cust.reservedBalance || 0));
                                    const availBal = cust.availableBalance ?? 0;
                                    const resBal = cust.reservedBalance ?? 0;
                                    const cur = cust.currency || "NGN";

                                    return (
                                        <tr
                                            key={cust.id}
                                            onClick={() => router.push(`/admin/customers/${cust.id}`)}
                                            className="hover:bg-slate-50/70 transition-colors cursor-pointer"
                                        >
                                            <td className="py-4 px-6">
                                                <p className="font-bold text-slate-900 text-xs">
                                                    {cust.name || cust.companyName || "Corporate Account"}
                                                </p>
                                                <p className="text-[10px] font-mono text-slate-400 mt-0.5">
                                                    ID: {cust.customerId || `CUST-${cust.id.slice(0, 5).toUpperCase()}`}
                                                </p>
                                            </td>

                                            <td className="py-4 px-4 font-bold text-slate-600">
                                                {cur}
                                            </td>

                                            <td className="py-4 px-4 font-mono font-bold text-slate-900">
                                                {cur === "USD" ? "$" : cur === "EUR" ? "€" : "₦"}
                                                {Number(totalBal).toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                                            </td>

                                            <td className="py-4 px-4 font-mono font-bold text-[#C9A227]">
                                                {cur === "USD" ? "$" : cur === "EUR" ? "€" : "₦"}
                                                {Number(availBal).toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                                            </td>

                                            <td className="py-4 px-4 font-mono font-medium text-slate-600">
                                                {cur === "USD" ? "$" : cur === "EUR" ? "€" : "₦"}
                                                {Number(resBal).toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                                            </td>

                                            <td className="py-4 px-4">
                                                <span
                                                    className={`inline-flex items-center px-2.5 py-0.5 rounded-md text-[10px] font-bold border ${
                                                        isVerified
                                                            ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                                                            : isReview
                                                            ? "bg-amber-50 text-amber-700 border-amber-200"
                                                            : "bg-slate-100 text-slate-600 border-slate-200"
                                                    }`}
                                                >
                                                    {isVerified ? "Active" : isReview ? "Review" : "Pending"}
                                                </span>
                                            </td>

                                            <td className="py-4 px-6 text-right">
                                                <button
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        router.push(`/admin/customers/${cust.id}`);
                                                    }}
                                                    className="text-xs font-bold text-slate-400 hover:text-slate-900 transition-colors inline-flex items-center gap-1"
                                                >
                                                    View <ChevronRight className="w-3.5 h-3.5" />
                                                </button>
                                            </td>
                                        </tr>
                                    );
                                })
                            )}
                        </tbody>
                    </table>
                </div>

                {/* ── Table Footer Pagination ── */}
                <div className="p-4 border-t border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs text-slate-500">
                    <p>
                        Showing {totalEntries > 0 ? startIndex + 1 : 0} to{" "}
                        {Math.min(startIndex + pageSize, totalEntries)} of{" "}
                        {totalEntries.toLocaleString()} entries
                    </p>

                    <div className="flex items-center gap-2">
                        <Button
                            variant="outline"
                            size="sm"
                            disabled={page <= 1}
                            onClick={() => setPage((p) => Math.max(1, p - 1))}
                            className="h-8 text-xs font-medium bg-white border-slate-200 hover:bg-slate-50 text-slate-700 disabled:opacity-40"
                        >
                            <ChevronLeft className="w-3.5 h-3.5 mr-1" />
                            Previous
                        </Button>
                        <Button
                            variant="outline"
                            size="sm"
                            disabled={page >= totalPages}
                            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                            className="h-8 text-xs font-medium bg-white border-slate-200 hover:bg-slate-50 text-slate-700 disabled:opacity-40"
                        >
                            Next
                            <ChevronRight className="w-3.5 h-3.5 ml-1" />
                        </Button>
                    </div>
                </div>
            </div>
        </div>
    );
}

"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { TransactionStatsCards } from "@/components/features/admin/TransactionStatsCards";
import { AdminTransactionsTable } from "@/components/features/admin/AdminTransactionsTable";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import Image from "next/image";
import { transactionsApi } from "@/lib/api/transactions";
import type { Transaction } from "@/lib/types/transaction";

const PAGE_SIZE = 7;

export default function AdminTransactionsPage() {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [page, setPage] = useState(1);

  const { data, isLoading } = useQuery({
    queryKey: ["admin-transactions", search, statusFilter, page],
    queryFn: () =>
      transactionsApi.getTransactions({
        search: search || undefined,
        status: statusFilter !== "All" ? statusFilter : undefined,
        page,
        limit: PAGE_SIZE,
      }),
    staleTime: 30_000,
  });

  const { data: stats } = useQuery({
    queryKey: ["dashboard-stats"],
    queryFn: transactionsApi.getDashboardStats,
    staleTime: 60_000,
  });

  const rawTransactions = data?.trades ?? [];
  const total = data?.total ?? 0;
  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));

  // Map backend shape to the Transaction type expected by AdminTransactionsTable
  const transactions: Transaction[] = rawTransactions.map((t) => ({
    id: t.id,
    tradeId: t.tradeId,
    date: t.date,
    time: t.time,
    customer: t.customer,
    agent: t.agent,
    transaction: t.transaction,
    amount: t.amount,
    status: t.status as any,
    verification: t.verification as any,
  }));

  const handleExport = () => {
    const csv = [
      ["Trade ID", "Date", "Time", "Customer", "Agent", "Transaction", "Amount", "Status"].join(","),
      ...rawTransactions.map((t) =>
        [t.tradeId, t.date, t.time, t.customer, t.agent, t.transaction, t.amount, t.status].join(",")
      ),
    ].join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "transactions.csv";
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6 p-4 md:p-6 lg:pl-7 lg:pr-6" style={{ backgroundColor: "#f7f8f9" }}>
      {/* Header */}
      <div className="space-y-2">
        <h1 className="text-3xl font-bold" style={{ color: "#2b2f33" }}>
          Transactions
        </h1>
        <p className="text-base" style={{ color: "#6b7078" }}>
          View and monitor all platform transactions across agents, customers, and currencies
        </p>
      </div>

      {/* Stats Cards */}
      <TransactionStatsCards
        totalTransactions={stats?.totalTransactions ?? 0}
        tradeVolume={
          stats?.tradeVolume
            ? stats.tradeVolume >= 1_000_000_000
              ? `₦${(stats.tradeVolume / 1_000_000_000).toFixed(2)}B`
              : stats.tradeVolume >= 1_000_000
                ? `₦${(stats.tradeVolume / 1_000_000).toFixed(1)}M`
                : `₦${stats.tradeVolume.toLocaleString()}`
            : "₦0"
        }
        successfulTransactions={stats?.totalTransactions ?? 0}
        flaggedTransactions={stats?.pendingReviews ?? 0}
      />

      {/* All Transactions Section */}
      <div className="space-y-4">
        <h2 className="text-2xl font-bold" style={{ color: "#2b2f33" }}>
          All Transactions
        </h2>

        {/* Filters and Actions */}
        <div className="flex flex-col lg:flex-row gap-4 items-start lg:items-center justify-between">
          {/* Search and Filters */}
          <div className="flex flex-col sm:flex-row gap-4 w-full lg:w-auto">
            {/* Search */}
            <div className="relative flex-1 sm:w-80">
              <Image
                src="/assets/icons/search-icon.svg"
                alt=""
                width={21}
                height={22}
                className="absolute left-3 top-1/2 -translate-y-1/2"
                style={{ filter: "brightness(0) saturate(100%) invert(63%) sepia(7%) saturate(327%) hue-rotate(180deg) brightness(93%) contrast(84%)" }}
              />
              <Input
                placeholder="Search by name, ID, or reference"
                className="pl-10"
                value={search}
                onChange={(e) => { setSearch(e.target.value); setPage(1); }}
                style={{ color: "#9aa0a6" }}
              />
            </div>

            {/* Filters */}
            <div className="flex gap-4">
              <div className="flex flex-col gap-1">
                <span className="text-xs font-normal" style={{ color: "#c9a227" }}>Status</span>
                <Select value={statusFilter} onValueChange={(v) => { setStatusFilter(v); setPage(1); }}>
                  <SelectTrigger className="w-36">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="All">All</SelectItem>
                    <SelectItem value="COMPLETED">Completed</SelectItem>
                    <SelectItem value="AWAITING_PAYMENT">Pending</SelectItem>
                    <SelectItem value="PAYMENT_CONFIRMED">In Progress</SelectItem>
                    <SelectItem value="CANCELLED">Cancelled</SelectItem>
                    <SelectItem value="FLAGGED">Flagged</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-2">
            <Button
              variant="outline"
              className="border-2"
              onClick={handleExport}
              style={{ borderColor: "#27ae60", color: "#27ae60" }}
            >
              <Image
                src="/assets/icons/export-icon.svg"
                alt=""
                width={22}
                height={22}
                className="mr-2"
                style={{ filter: "brightness(0) saturate(100%) invert(60%) sepia(39%) saturate(1155%) hue-rotate(91deg) brightness(93%) contrast(83%)" }}
              />
              Export
            </Button>
          </div>
        </div>

        {/* Transactions Table */}
        <AdminTransactionsTable transactions={transactions} isLoading={isLoading} />

        {/* Pagination */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mt-4">
          <div className="flex items-center gap-2 flex-wrap">
            <Button
              variant="ghost"
              size="sm"
              disabled={page <= 1}
              onClick={() => setPage((p) => Math.max(1, p - 1))}
            >
              <Image src="/assets/icons/arrow-left.svg" alt="Previous" width={6} height={10} />
            </Button>

            {Array.from({ length: Math.min(totalPages, 7) }, (_, i) => i + 1).map((p) => (
              <Button
                key={p}
                variant="ghost"
                size="sm"
                onClick={() => setPage(p)}
                style={{
                  color: p === page ? "#c9a227" : "#2b2f33",
                  fontWeight: p === page ? 700 : 400,
                }}
              >
                {p}
              </Button>
            ))}

            <Button
              variant="ghost"
              size="sm"
              disabled={page >= totalPages}
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
            >
              <Image src="/assets/icons/arrow-right.svg" alt="Next" width={6} height={10} />
            </Button>
          </div>

          <div className="text-sm" style={{ color: "#6b7078" }}>
            Showing {rawTransactions.length} of {total} transactions
          </div>
        </div>
      </div>
    </div>
  );
}

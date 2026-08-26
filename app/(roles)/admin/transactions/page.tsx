"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Plus,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { transactionsApi, type AdminTransaction } from "@/lib/api/transactions";

const PAGE_SIZE = 10;

export default function AdminPaymentObligationsPage() {
  const router = useRouter();
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [currencyFilter, setCurrencyFilter] = useState("ALL");
  const [page, setPage] = useState(1);

  const { data, isLoading } = useQuery({
    queryKey: ["admin-transactions", search, statusFilter, page],
    queryFn: () =>
      transactionsApi.getTransactions({
        search: search || undefined,
        status: statusFilter !== "ALL" ? statusFilter : undefined,
        page,
        limit: PAGE_SIZE,
      }),
    staleTime: 30_000,
  });

  const rawTransactions: AdminTransaction[] = data?.trades ?? [];
  const total = data?.total ?? rawTransactions.length;
  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));

  const filtered = rawTransactions.filter((t: any) => {
    const cur = t.receiveCurrency || t.sendCurrency || (t.transaction ? t.transaction.split("→")[1]?.trim() : "");
    if (currencyFilter !== "ALL" && !cur?.includes(currencyFilter)) {
      return false;
    }
    return true;
  });

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "COMPLETED":
        return <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-blue-50 text-blue-700 border border-blue-200">• COMPLETED</span>;
      case "PAYMENT_CONFIRMED":
      case "PROCESSING":
      case "PROCESSED":
        return <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-slate-100 text-slate-700">• READY_FOR_ROUTING</span>;
      case "AWAITING_PAYMENT":
      case "SENT_TO_CUSTOMER":
      case "QUOTED":
        return <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-amber-50 text-amber-800 border border-amber-200">• PENDING_APPROVAL</span>;
      case "FAILED":
      case "REJECTED":
      case "CANCELLED":
        return <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-red-50 text-red-700 border border-red-200">• FAILED</span>;
      default:
        return <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-slate-100 text-slate-700">• READY_FOR_ROUTING</span>;
    }
  };

  const getRecommendedRoute = (sendCur?: string, recvCur?: string) => {
    if (recvCur === "EUR" || sendCur === "EUR") return "SEPA - DB";
    if (recvCur === "GBP" || sendCur === "GBP") return "CHAPS - BARC";
    if (recvCur === "USD" || sendCur === "USD") return "SWIFT - JPM";
    return "FASTER_PAYMENTS";
  };

  return (
    <div className="p-4 md:p-8 space-y-6 max-w-7xl mx-auto font-sans" style={{ backgroundColor: "#F7F8F9" }}>
      {/* ── Top Header ── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b pb-4" style={{ borderColor: "#E1E3E6" }}>
        <div>
          <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-slate-900">
            Payment Obligations
          </h1>
          <p className="text-xs md:text-sm text-slate-500 mt-1">
            Manage and monitor pending payment instructions.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-32 h-9 text-xs font-semibold bg-white border-slate-200">
              <SelectValue placeholder="All Statuses" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ALL">All Statuses</SelectItem>
              <SelectItem value="AWAITING_PAYMENT">Pending</SelectItem>
              <SelectItem value="PROCESSING">Processing</SelectItem>
              <SelectItem value="COMPLETED">Completed</SelectItem>
              <SelectItem value="FAILED">Failed</SelectItem>
            </SelectContent>
          </Select>

          <Select value={currencyFilter} onValueChange={setCurrencyFilter}>
            <SelectTrigger className="w-32 h-9 text-xs font-semibold bg-white border-slate-200">
              <SelectValue placeholder="All Currencies" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ALL">All Currencies</SelectItem>
              <SelectItem value="USD">USD</SelectItem>
              <SelectItem value="EUR">EUR</SelectItem>
              <SelectItem value="GBP">GBP</SelectItem>
              <SelectItem value="NGN">NGN</SelectItem>
            </SelectContent>
          </Select>

          <div className="w-48 sm:w-60">
            <Input
              placeholder="Search ID or Customer..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="h-9 text-xs bg-white border-slate-200"
            />
          </div>

          <Button
            onClick={() => router.push("/admin/transactions")}
            className="bg-[#C9A227] hover:bg-[#b08e20] text-white text-xs font-bold px-4 py-2 h-9 rounded-lg shadow-sm gap-1.5"
          >
            <Plus className="w-4 h-4" />
            New Payment
          </Button>
        </div>
      </div>

      {/* ── Table Card ── */}
      <div className="bg-white rounded-2xl border shadow-sm overflow-hidden" style={{ borderColor: "#E1E3E6" }}>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50/80 border-b border-slate-100 text-slate-500 uppercase tracking-wider text-[10px] font-bold">
              <tr>
                <th className="py-4 px-6">Payment ID</th>
                <th className="py-4 px-6">Customer</th>
                <th className="py-4 px-6">Supplier</th>
                <th className="py-4 px-6 text-right">Amount</th>
                <th className="py-4 px-6">Ccy</th>
                <th className="py-4 px-6 text-center">Status</th>
                <th className="py-4 px-6">Due Date</th>
                <th className="py-4 px-6">Rec. Route</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
              {isLoading ? (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-slate-400">
                    Loading payment obligations...
                  </td>
                </tr>
              ) : filtered.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-slate-400">
                    No payment obligations found.
                  </td>
                </tr>
              ) : (
                filtered.map((t: AdminTransaction) => {
                  const paymentId = t.tradeId || `PO-${t.id.slice(0, 6).toUpperCase()}`;
                  const amountNum = parseFloat(t.amount) || 0;
                  const ccy = t.receiveCurrency || t.sendCurrency || (t.transaction ? t.transaction.split("→")[1]?.trim() : "USD");
                  const dueDate = t.date || (t.createdAt ? new Date(t.createdAt).toISOString().slice(0, 10) : "2026-08-26");
                  const recRoute = getRecommendedRoute(t.sendCurrency || "", t.receiveCurrency || "");
                  const rawCust: unknown = t.customer;
                  const custName = typeof rawCust === "string" ? rawCust : ((rawCust as any)?.fullName || (rawCust as any)?.name || "Acme Corp");
                  const recipient = t.recipientName || "Global Logistics Inc.";

                  return (
                    <tr
                      key={t.id}
                      onClick={() => router.push(`/admin/transactions/${t.id}`)}
                      className="hover:bg-slate-50/60 cursor-pointer transition-colors"
                    >
                      <td className="py-4 px-6 font-mono font-bold text-[#C9A227] whitespace-nowrap">
                        {paymentId}
                      </td>

                      <td className="py-4 px-6 font-bold text-slate-900 whitespace-nowrap">
                        {custName}
                      </td>

                      <td className="py-4 px-6 text-slate-600 whitespace-nowrap">
                        {recipient}
                      </td>

                      <td className="py-4 px-6 text-right font-mono font-bold text-slate-900 whitespace-nowrap">
                        {amountNum.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                      </td>

                      <td className="py-4 px-6 font-bold text-slate-700 whitespace-nowrap">
                        {ccy}
                      </td>

                      <td className="py-4 px-6 text-center whitespace-nowrap">
                        {getStatusBadge(t.status)}
                      </td>

                      <td className="py-4 px-6 text-slate-500 font-mono whitespace-nowrap">
                        {dueDate}
                      </td>

                      <td className="py-4 px-6 font-mono text-[11px] text-slate-500 whitespace-nowrap">
                        {recRoute}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Footer with Pagination */}
        <div className="p-4 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
          <span>Showing 1 to {filtered.length} of {total} obligations</span>
          <div className="flex items-center gap-1.5">
            <button
              disabled={page === 1}
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              className="p-1 rounded hover:bg-slate-100 disabled:opacity-40"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <span className="px-2.5 py-0.5 rounded bg-[#C9A227] text-white font-bold">{page}</span>
            <button
              disabled={page >= totalPages}
              onClick={() => setPage((p) => p + 1)}
              className="p-1 rounded hover:bg-slate-100 disabled:opacity-40"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

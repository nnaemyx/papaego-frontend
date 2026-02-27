"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
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
import { Button } from "@/components/ui/button";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { transactionsApi } from "@/lib/api/transactions";
import { Eye, Trash2 } from "lucide-react";
import Image from "next/image";
import type { Transaction } from "@/lib/types/transaction";

interface AdminTransactionsTableProps {
  transactions: Transaction[];
  isLoading?: boolean;
}

export function AdminTransactionsTable({
  transactions,
  isLoading,
}: AdminTransactionsTableProps) {
  const router = useRouter();
  const queryClient = useQueryClient();
  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  // Mutation to delete transaction
  const deleteMutation = useMutation({
    mutationFn: (id: string) => transactionsApi.deleteTransaction(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-transactions"] });
      queryClient.invalidateQueries({ queryKey: ["dashboard-stats"] });
    },
    onError: (error) => {
      console.error("Failed to delete transaction", error);
      alert("Failed to delete transaction. Ensure you have permissions.");
    }
  });

  const handleDelete = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    if (confirm("Are you sure you want to permanently delete this transaction? This action cannot be undone.")) {
      deleteMutation.mutate(id);
    }
  };

  const toggleSelect = (id: string) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const toggleSelectAll = () => {
    setSelectedIds(
      selectedIds.length === transactions.length
        ? []
        : transactions.map((t) => t.id)
    );
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "In Progress":
        return "bg-blue-100 text-blue-700 border-blue-300";
      case "Completed":
        return "bg-green-100 text-green-700 border-green-300";
      case "Pending":
        return "bg-yellow-100 text-yellow-700 border-yellow-300";
      case "Cancelled":
      case "Failed":
        return "bg-red-100 text-red-700 border-red-300";
      default:
        return "bg-gray-100 text-gray-700 border-gray-300";
    }
  };

  const getVerificationBadge = (status: string) => {
    switch (status) {
      case "Verified":
        return (
          <div
            className="flex items-center gap-2 px-3 py-1 rounded border"
            style={{
              backgroundColor: "#fff4d1",
              borderColor: "#c9a227",
            }}
          >
            <Image
              src="/assets/icons/checkmark-verified.svg"
              alt=""
              width={10}
              height={10}
              style={{ filter: "brightness(0) saturate(100%) invert(63%) sepia(71%) saturate(489%) hue-rotate(359deg) brightness(90%) contrast(88%)" }}
            />
            <span className="text-xs font-normal" style={{ color: "#c9a227" }}>
              Verified
            </span>
          </div>
        );
      case "Pending":
        return (
          <div
            className="flex items-center gap-2 px-3 py-1 rounded border"
            style={{
              backgroundColor: "#fff8ce",
              borderColor: "#f0cd00",
            }}
          >
            <Image
              src="/assets/icons/warning-pending.svg"
              alt=""
              width={10}
              height={10}
              style={{ filter: "brightness(0) saturate(100%) invert(83%) sepia(93%) saturate(1392%) hue-rotate(351deg) brightness(103%) contrast(106%)" }}
            />
            <span className="text-xs font-normal" style={{ color: "#f0cd00" }}>
              Pending
            </span>
          </div>
        );
      case "Failed":
        return (
          <div
            className="flex items-center gap-2 px-3 py-1 rounded border"
            style={{
              backgroundColor: "#ffeeee",
              borderColor: "#e05555",
            }}
          >
            <Image
              src="/assets/icons/cross-failed.svg"
              alt=""
              width={10}
              height={10}
              style={{ filter: "brightness(0) saturate(100%) invert(44%) sepia(76%) saturate(1571%) hue-rotate(329deg) brightness(94%) contrast(87%)" }}
            />
            <span className="text-xs font-normal" style={{ color: "#e05555" }}>
              Failed
            </span>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div
      className="bg-white rounded-lg border border-gray-200 overflow-hidden"
      style={{ backgroundColor: "#f6f6f6" }}
    >
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-12">
              <Checkbox
                checked={selectedIds.length === transactions.length}
                onCheckedChange={toggleSelectAll}
              />
            </TableHead>
            <TableHead className="text-xs font-medium" style={{ color: "#2b2f33" }}>
              <div className="flex items-center gap-2">
                Trade ID
                <Image
                  src="/assets/icons/sort-arrows.svg"
                  alt=""
                  width={8}
                  height={14}
                />
              </div>
            </TableHead>
            <TableHead className="text-xs font-medium" style={{ color: "#2b2f33" }}>
              <div className="flex items-center gap-2">
                Date
                <Image
                  src="/assets/icons/sort-arrows.svg"
                  alt=""
                  width={8}
                  height={14}
                />
              </div>
            </TableHead>
            <TableHead className="text-xs font-medium" style={{ color: "#2b2f33" }}>
              <div className="flex items-center gap-2">
                Time
                <Image
                  src="/assets/icons/sort-arrows.svg"
                  alt=""
                  width={8}
                  height={14}
                />
              </div>
            </TableHead>
            <TableHead className="text-xs font-medium" style={{ color: "#2b2f33" }}>
              <div className="flex items-center gap-2">
                Customer
                <Image
                  src="/assets/icons/sort-arrows.svg"
                  alt=""
                  width={8}
                  height={14}
                />
              </div>
            </TableHead>
            <TableHead className="text-xs font-medium" style={{ color: "#2b2f33" }}>
              <div className="flex items-center gap-2">
                Agent
                <Image
                  src="/assets/icons/sort-arrows.svg"
                  alt=""
                  width={8}
                  height={14}
                />
              </div>
            </TableHead>
            <TableHead className="text-xs font-medium" style={{ color: "#2b2f33" }}>
              <div className="flex items-center gap-2">
                Transaction
                <Image
                  src="/assets/icons/sort-arrows.svg"
                  alt=""
                  width={8}
                  height={14}
                />
              </div>
            </TableHead>
            <TableHead className="text-xs font-medium" style={{ color: "#2b2f33" }}>
              <div className="flex items-center gap-2">
                Amount
                <Image
                  src="/assets/icons/sort-arrows.svg"
                  alt=""
                  width={8}
                  height={14}
                />
              </div>
            </TableHead>
            <TableHead className="text-xs font-medium" style={{ color: "#2b2f33" }}>
              <div className="flex items-center gap-2">
                Status
                <Image
                  src="/assets/icons/sort-arrows.svg"
                  alt=""
                  width={8}
                  height={14}
                />
              </div>
            </TableHead>
            <TableHead className="text-xs font-medium" style={{ color: "#2b2f33" }}>
              <div className="flex items-center gap-2">
                Verification
                <Image
                  src="/assets/icons/sort-arrows.svg"
                  alt=""
                  width={8}
                  height={14}
                />
              </div>
            </TableHead>
            <TableHead className="text-xs font-medium" style={{ color: "#2b2f33" }}>
              <div className="flex items-center gap-2">
                Action
                <Image
                  src="/assets/icons/sort-arrows.svg"
                  alt=""
                  width={8}
                  height={14}
                />
              </div>
            </TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {isLoading
            ? Array.from({ length: 5 }).map((_, i) => (
              <TableRow key={i}>
                {Array.from({ length: 11 }).map((__, j) => (
                  <TableCell key={j}>
                    <div className="h-4 bg-gray-200 rounded animate-pulse w-20" />
                  </TableCell>
                ))}
              </TableRow>
            ))
            : transactions.map((transaction) => (
              <TableRow
                key={transaction.id}
                className="cursor-pointer hover:bg-gray-50"
                onClick={() => router.push(`/admin/transactions/${transaction.id}`)}
              >
                <TableCell onClick={(e) => e.stopPropagation()}>
                  <Checkbox
                    checked={selectedIds.includes(transaction.id)}
                    onCheckedChange={() => toggleSelect(transaction.id)}
                  />
                </TableCell>
                <TableCell className="text-xs font-normal" style={{ color: "#2b2f33" }}>
                  {transaction.tradeId}
                </TableCell>
                <TableCell className="text-xs font-normal" style={{ color: "#2b2f33" }}>
                  {transaction.date}
                </TableCell>
                <TableCell className="text-xs font-normal" style={{ color: "#2b2f33" }}>
                  {transaction.time}
                </TableCell>
                <TableCell className="text-xs font-normal" style={{ color: "#27ae60" }}>
                  {transaction.customer}
                </TableCell>
                <TableCell className="text-xs font-normal" style={{ color: "#27ae60" }}>
                  {transaction.agent}
                </TableCell>
                <TableCell className="text-xs font-normal" style={{ color: "#2b2f33" }}>
                  {transaction.transaction}
                </TableCell>
                <TableCell className="text-xs font-normal" style={{ color: "#2b2f33" }}>
                  {transaction.amount}
                </TableCell>
                <TableCell>
                  <span className="text-xs font-normal" style={{
                    color: transaction.status === "In Progress" ? "#1890ff" :
                      transaction.status === "Completed" ? "#27ae60" :
                        transaction.status === "Pending" ? "#f0cd00" :
                          transaction.status === "Cancelled" || transaction.status === "Failed" ? "#e05555" : "#2b2f33"
                  }}>
                    {transaction.status}
                  </span>
                </TableCell>
                <TableCell>
                  {getVerificationBadge(transaction.verification)}
                </TableCell>
                <TableCell>
                  <div className="flex gap-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation();
                        router.push(`/admin/transactions/${transaction.id}`);
                      }}
                      title="View Details"
                    >
                      <Eye className="w-4 h-4 text-blue-600" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={(e) => handleDelete(e, transaction.id)}
                      disabled={deleteMutation.isPending}
                      title="Delete Transaction"
                    >
                      <Trash2 className="w-4 h-4 text-red-600" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
        </TableBody>
      </Table>
    </div>
  );
}

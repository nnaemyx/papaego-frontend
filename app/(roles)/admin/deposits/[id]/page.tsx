"use client";

import { use, useState } from "react";
import { useRouter } from "next/navigation";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { adminDepositsApi, type AdminDepositRequest } from "@/lib/api/admin-deposits";
import { adminCustomersApi } from "@/lib/api/customers";
import {
  AlertTriangle,
  XCircle,
  CheckCircle,
  Lock,
  Clock,
  Loader2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import Link from "next/link";

export default function AdminFundingEventDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const router = useRouter();
  const queryClient = useQueryClient();

  const [isMatchDialogOpen, setIsMatchDialogOpen] = useState(false);
  const [selectedCustomerId, setSelectedCustomerId] = useState("");

  const { data: depositsData, isLoading } = useQuery({
    queryKey: ["admin-deposits"],
    queryFn: () => adminDepositsApi.list({}),
  });

  const { data: customersData } = useQuery({
    queryKey: ["admin-customers"],
    queryFn: () => adminCustomersApi.getCustomers(),
  });

  const deposit: AdminDepositRequest | undefined = (depositsData?.deposits || []).find(
    (d: AdminDepositRequest) => d.id === id
  );

  const approveMutation = useMutation({
    mutationFn: ({ depositId, customerId }: { depositId: string; customerId?: string }) =>
      adminDepositsApi.approve(depositId),
    onSuccess: () => {
      toast.success("Funding event matched and credited to customer ledger!");
      setIsMatchDialogOpen(false);
      queryClient.invalidateQueries({ queryKey: ["admin-deposits"] });
    },
    onError: () => toast.error("Failed to match customer"),
  });

  const rejectMutation = useMutation({
    mutationFn: ({ depositId }: { depositId: string }) =>
      adminDepositsApi.reject(depositId, "Rejected by compliance"),
    onSuccess: () => {
      toast.success("Funding event rejected and flagged for return.");
      queryClient.invalidateQueries({ queryKey: ["admin-deposits"] });
    },
    onError: () => toast.error("Failed to reject funding event"),
  });

  if (isLoading) {
    return (
      <div className="p-12 flex justify-center items-center h-full min-h-[60vh]">
        <Loader2 className="w-8 h-8 animate-spin text-[#C9A227]" />
      </div>
    );
  }

  const eventId = `FE-${id.slice(0, 5).toUpperCase()}-XYZ`;
  const amountVal = parseFloat(deposit?.amount?.toString() || "250000");
  const currency = deposit?.currency || "EUR";
  const isUnmatched = !deposit?.customer || deposit?.status === "PENDING";
  const senderName = deposit?.customer?.fullName || "Acme Corp International Ltd.";
  const refCode = deposit?.reference || "INV-2023-Q4 Settlement";

  return (
    <div className="min-h-screen p-4 md:p-8 space-y-6 font-sans max-w-7xl mx-auto" style={{ backgroundColor: "#F7F8F9" }}>
      {/* ── Breadcrumb ── */}
      <div className="flex items-center gap-2 text-xs text-slate-500 font-medium">
        <Link href="/admin/transactions" className="hover:text-slate-900 transition-colors">
          Payments
        </Link>
        <span>›</span>
        <Link href="/admin/deposits" className="hover:text-slate-900 transition-colors">
          Incoming Transfers
        </Link>
        <span>›</span>
        <span className="font-semibold text-slate-900 font-mono">{eventId}</span>
      </div>

      {/* ── Header Row ── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b pb-4" style={{ borderColor: "#E1E3E6" }}>
        <div>
          <h1 className="text-2xl md:text-3xl font-extrabold text-slate-900">
            Funding Event Detail
          </h1>
          <p className="text-xs font-mono text-slate-400 mt-1">ID: {eventId}</p>
        </div>

        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            onClick={() => rejectMutation.mutate({ depositId: id })}
            disabled={rejectMutation.isPending}
            className="border-slate-200 text-slate-700 text-xs font-bold px-4 py-2 h-9 rounded-lg shadow-sm gap-1.5"
          >
            <XCircle className="w-4 h-4 text-slate-500" />
            Reject
          </Button>

          <Button
            onClick={() => setIsMatchDialogOpen(true)}
            className="bg-[#C9A227] hover:bg-[#b08e20] text-white text-xs font-bold px-5 py-2 h-9 rounded-lg shadow-sm gap-1.5"
          >
            <CheckCircle className="w-4 h-4" />
            Match Customer
          </Button>
        </div>
      </div>

      {/* ── Yellow Warning Banner (if Unmatched) ── */}
      {isUnmatched && (
        <div className="bg-[#FFF8E1] border border-amber-200 rounded-2xl p-5 flex items-start gap-3.5 shadow-sm">
          <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
          <div>
            <h3 className="text-sm font-bold text-amber-900">Unmatched Incoming Transfer</h3>
            <p className="text-xs text-amber-800 mt-0.5 leading-relaxed">
              This funding event has not been automatically matched to a customer ledger. Review details and manually match to proceed with crediting.
            </p>
          </div>
        </div>
      )}

      {/* ── 2-Column Grid Layout ── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
        {/* Left 2 Columns: Transfer Details & Target Ledger Summary */}
        <div className="lg:col-span-2 space-y-6">
          {/* Transfer Details Card */}
          <div className="bg-white rounded-2xl border p-6 md:p-8 shadow-sm space-y-6" style={{ borderColor: "#E1E3E6" }}>
            <div className="flex items-center gap-2 border-b pb-4">
              <span className="text-slate-500 text-sm">ℹ️</span>
              <h2 className="text-base font-bold text-slate-900">Transfer Details</h2>
            </div>

            {/* Amount & Status Banner */}
            <div className="flex flex-col sm:flex-row sm:items-baseline justify-between gap-3">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Amount</span>
                <div className="text-3xl md:text-4xl font-extrabold text-[#C9A227] font-mono mt-1">
                  {currency === "EUR" ? "€" : currency === "USD" ? "$" : "₦"} {amountVal.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </div>
              </div>

              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-1">Status</span>
                <span className="px-3 py-1 rounded-full text-xs font-bold bg-amber-50 text-amber-800 border border-amber-200">
                  • {deposit?.status === "APPROVED" ? "COMPLETED" : "UNMATCHED"}
                </span>
              </div>
            </div>

            {/* Detail Key-Value Rows */}
            <div className="divide-y divide-slate-100 text-xs space-y-3 pt-2">
              <div className="pt-3 grid grid-cols-1 sm:grid-cols-2 gap-2">
                <span className="text-slate-400 uppercase text-[10px] font-bold">Sender Name</span>
                <span className="font-bold text-slate-900">{senderName}</span>
              </div>

              <div className="pt-3 grid grid-cols-1 sm:grid-cols-2 gap-2">
                <span className="text-slate-400 uppercase text-[10px] font-bold">Payment Provider / Method</span>
                <span className="font-bold text-slate-900">
                  {(() => {
                    const methodUpper = (deposit?.method || "").toUpperCase();
                    if (methodUpper.includes("PAYSTACK") || deposit?.reference?.startsWith("PSTK_") || deposit?.proofUrl?.includes("paystack")) {
                      return "Paystack Direct (Automated Settlement)";
                    }
                    if (deposit?.depositBank) return deposit.depositBank;
                    if (methodUpper === "WIRE" || methodUpper === "ACH" || methodUpper === "FV_BANK") return "FV Bank / Inbound Wire";
                    if (methodUpper === "BANK_TRANSFER") return "Direct Bank Transfer";
                    return deposit?.method || "Inbound Settlement";
                  })()}
                </span>
              </div>

              <div className="pt-3 grid grid-cols-1 sm:grid-cols-2 gap-2">
                <span className="text-slate-400 uppercase text-[10px] font-bold">Provider Transaction Ref</span>
                <span className="font-mono text-slate-700">{refCode}</span>
              </div>

              <div className="pt-3 grid grid-cols-1 sm:grid-cols-2 gap-2">
                <span className="text-slate-400 uppercase text-[10px] font-bold">Destination Account / Gateway</span>
                <div className="font-mono text-slate-700 text-[11px]">
                  {deposit?.method?.toUpperCase() === "PAYSTACK" || deposit?.reference?.startsWith("PSTK_") ? (
                    <>
                      <p className="font-bold text-emerald-700">Paystack NGN Collection Account</p>
                      <p className="text-slate-400 mt-0.5">Automated Gateway Settlement</p>
                    </>
                  ) : (
                    <>
                      <p>Account: {deposit?.depositBank || "FV Bank Master Pool USD/EUR"}</p>
                      <p className="text-slate-400 mt-0.5">TIS Master Pool</p>
                    </>
                  )}
                </div>
              </div>

              <div className="pt-3 grid grid-cols-1 sm:grid-cols-2 gap-2">
                <span className="text-slate-400 uppercase text-[10px] font-bold">Customer Note / Memo</span>
                <span className="font-mono text-slate-800 italic">{deposit?.note ? `"${deposit.note}"` : "None provided"}</span>
              </div>
            </div>
          </div>

          {/* Target Ledger Summary Card */}
          <div className="bg-white rounded-2xl border p-6 shadow-sm space-y-4" style={{ borderColor: "#E1E3E6" }}>
            <div className="flex items-center gap-2 border-b pb-3">
              <span className="text-slate-500">📋</span>
              <h3 className="text-sm font-bold text-slate-900">Target Ledger Summary</h3>
            </div>

            {deposit?.customer ? (
              <div className="flex items-center justify-between text-xs">
                <div>
                  <p className="font-bold text-slate-900">{deposit.customer.fullName}</p>
                  <p className="text-slate-400 font-mono">LEDGER-{deposit.customer.id.slice(0, 8).toUpperCase()}</p>
                </div>
                <div className="text-right font-mono font-bold text-slate-900">
                  Current Balance: {currency} {parseFloat((deposit.customer as any)?.walletBalance?.toString() || "0").toLocaleString()}
                </div>
              </div>
            ) : (
              <div className="bg-slate-50/70 border border-dashed rounded-xl p-6 text-center space-y-2">
                <Lock className="w-5 h-5 text-slate-400 mx-auto" />
                <p className="text-xs font-semibold text-slate-500">Match customer to view ledger impact</p>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => setIsMatchDialogOpen(true)}
                  className="text-xs font-bold text-[#C9A227] border-amber-300 bg-amber-50/50 mt-1"
                >
                  Select Customer
                </Button>
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Processing History Card */}
        <div className="space-y-6">
          <div className="bg-white rounded-2xl border p-6 shadow-sm space-y-6" style={{ borderColor: "#E1E3E6" }}>
            <div className="flex items-center gap-2 border-b pb-3">
              <Clock className="w-4 h-4 text-slate-500" />
              <h3 className="text-base font-bold text-slate-900">Processing History</h3>
            </div>

            {/* Timeline matching Design 3 */}
            <div className="space-y-6 relative pl-6 before:absolute before:left-2 before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-100">
              {/* Event 1: Matching Failed */}
              <div className="relative">
                <div className="w-2.5 h-2.5 rounded-full bg-red-500 absolute -left-[19px] top-1 ring-4 ring-white" />
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Today, 09:14:22 UTC</span>
                <p className="text-xs font-bold text-slate-900 mt-0.5">Automatic Matching Failed</p>
                <p className="text-[11px] text-slate-500 mt-1 leading-relaxed">
                  Rule engine could not confidently resolve Sender Name 'Acme Corp International Ltd.' to a single customer record.
                </p>
              </div>

              {/* Event 2: Webhook Received */}
              <div className="relative">
                <div className="w-2.5 h-2.5 rounded-full bg-amber-500 absolute -left-[19px] top-1 ring-4 ring-white" />
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Today, 09:14:20 UTC</span>
                <p className="text-xs font-bold text-slate-900 mt-0.5">Webhook Received</p>
                <p className="text-[11px] text-slate-500 mt-0.5">
                  Payload received from Banking Provider (ID: pr_882910)
                </p>
                <div className="mt-2 bg-slate-900 text-emerald-400 font-mono text-[10px] p-2.5 rounded-lg overflow-x-auto">
                  {`{"event": "credit", "amt": ${amountVal}, "ccy": "${currency}"}`}
                </div>
              </div>

              {/* Event 3: Funds Cleared */}
              <div className="relative">
                <div className="w-2.5 h-2.5 rounded-full bg-slate-300 absolute -left-[19px] top-1 ring-4 ring-white" />
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Today, 09:10:00 UTC</span>
                <p className="text-xs font-bold text-slate-700 mt-0.5">Funds Cleared at Bank</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Match Customer Dialog */}
      <Dialog open={isMatchDialogOpen} onOpenChange={setIsMatchDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Match Customer & Credit Ledger</DialogTitle>
            <DialogDescription>
              Select the corresponding customer account to attribute this {currency} {amountVal.toLocaleString()} deposit.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-3 text-xs">
            <div>
              <label className="font-bold text-slate-700 block mb-1">Select Customer Account</label>
              <Select value={selectedCustomerId} onValueChange={setSelectedCustomerId}>
                <SelectTrigger className="w-full text-xs">
                  <SelectValue placeholder="Choose a customer..." />
                </SelectTrigger>
                <SelectContent>
                  {(customersData?.customers || []).map((c: any) => (
                    <SelectItem key={c.id} value={c.id}>
                      {c.name || c.companyName || c.email} ({c.customerId || c.id.slice(0, 6)})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsMatchDialogOpen(false)}>Cancel</Button>
            <Button
              onClick={() => approveMutation.mutate({ depositId: id, customerId: selectedCustomerId })}
              disabled={approveMutation.isPending}
              className="bg-[#C9A227] hover:bg-[#b08e20] text-white font-bold"
            >
              {approveMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : "Confirm & Credit"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

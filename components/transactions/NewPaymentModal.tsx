"use client";

import React, { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { X, Globe2, Building2, ShieldCheck, ArrowRight, Loader2, Calendar } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { adminCustomersApi } from "@/lib/api/customers";
import { transactionsApi } from "@/lib/api/transactions";
import { toast } from "sonner";

interface NewPaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

const SUPPORTED_CURRENCIES = ["USD", "EUR", "GBP", "CAD", "CNY", "NGN"];

const PAYMENT_ROUTES = [
  { id: "FV_BANK_GMA", label: "FV Bank GMA Corporate Rail (USD Transit)", desc: "Internal treasury settlement rail (Sandbox-ready)" },
  { id: "SWIFT_WIRE", label: "SWIFT Wire (International Cross-Border)", desc: "Standard global correspondent banking network" },
  { id: "SEPA", label: "SEPA Instant / Credit Rail (EUR)", desc: "European single payments area" },
  { id: "FASTER_PAYMENTS", label: "Faster Payments / CHAPS (GBP)", desc: "UK clearing clearinghouse rail" },
];

export function NewPaymentModal({ isOpen, onClose, onSuccess }: NewPaymentModalProps) {
  const [customerId, setCustomerId] = useState("");
  const [recipientName, setRecipientName] = useState("");
  const [supplierBankName, setSupplierBankName] = useState("");
  const [supplierAccountNumber, setSupplierAccountNumber] = useState("");
  const [swiftBic, setSwiftBic] = useState("");
  const [destinationCountry, setDestinationCountry] = useState("United States");
  const [receiveCurrency, setReceiveCurrency] = useState("USD");
  const [sendCurrency, setSendCurrency] = useState("NGN");
  const [amount, setAmount] = useState("");
  const [fxRate, setFxRate] = useState("1550");
  const [route, setRoute] = useState("FV_BANK_GMA");
  const [status, setStatus] = useState("AWAITING_PAYMENT");
  const [dueDate, setDueDate] = useState(() => new Date().toISOString().slice(0, 10));
  const [purpose, setPurpose] = useState("Cross-border commercial invoice settlement");
  const [submitting, setSubmitting] = useState(false);

  const { data: customersData, isLoading: loadingCustomers } = useQuery({
    queryKey: ["admin-customers-list"],
    queryFn: () => adminCustomersApi.getCustomers(),
    enabled: isOpen,
  });

  const customers = Array.isArray(customersData?.customers)
    ? customersData.customers
    : Array.isArray(customersData)
    ? customersData
    : [];

  if (!isOpen) return null;

  const parsedAmount = parseFloat(amount) || 0;
  const parsedRate = parseFloat(fxRate) || 0;
  const estimatedNgnFunding = parsedAmount * parsedRate;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!customerId) {
      toast.error("Please select a customer.");
      return;
    }
    if (!amount || parsedAmount <= 0) {
      toast.error("Please enter a valid payout amount.");
      return;
    }
    if (!recipientName.trim()) {
      toast.error("Please enter the beneficiary / supplier name.");
      return;
    }

    setSubmitting(true);
    try {
      await transactionsApi.createTransaction({
        customerId,
        recipientName: recipientName.trim(),
        supplierBankName: supplierBankName.trim() || undefined,
        supplierAccountNumber: supplierAccountNumber.trim() || undefined,
        swiftBic: swiftBic.trim() || undefined,
        destinationCountry,
        sendCurrency,
        receiveCurrency,
        amount: parsedAmount,
        payoutAmount: parsedAmount,
        fxRate: parsedRate > 0 ? parsedRate : undefined,
        route,
        status,
        dueDate,
        purpose,
      });

      toast.success("Payment obligation created successfully!");
      onSuccess();
      onClose();
    } catch (err: any) {
      console.error("Error creating payment obligation:", err);
      toast.error(err?.response?.data?.error || "Failed to create payment obligation.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in font-sans overflow-y-auto">
      <div className="bg-white rounded-2xl max-w-2xl w-full p-6 shadow-2xl border border-slate-200 space-y-6 my-8">
        {/* Modal Header */}
        <div className="flex items-center justify-between border-b pb-4 border-slate-100">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-50 border border-amber-200 text-[#C9A227] flex items-center justify-center">
              <Globe2 className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-900">New Payment Obligation</h2>
              <p className="text-xs text-slate-500">
                Register a cross-border payout instruction for settlement and routing.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Section 1: Customer Selection */}
          <div className="space-y-1.5">
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-600">
              Customer / Corporate Account <span className="text-red-500">*</span>
            </label>
            <Select value={customerId} onValueChange={setCustomerId}>
              <SelectTrigger className="h-10 text-xs bg-slate-50/60 border-slate-200">
                <SelectValue placeholder={loadingCustomers ? "Loading customers..." : "Select customer"} />
              </SelectTrigger>
              <SelectContent>
                {customers.map((c: any) => (
                  <SelectItem key={c.id} value={c.id}>
                    {c.fullName || c.name || c.companyName || c.email} {c.companyName ? `(${c.companyName})` : ""}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Section 2: Payout Currency & Amounts */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="space-y-1.5">
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-600">
                Payout Ccy
              </label>
              <Select value={receiveCurrency} onValueChange={setReceiveCurrency}>
                <SelectTrigger className="h-10 text-xs bg-slate-50/60 border-slate-200">
                  <SelectValue placeholder="Currency" />
                </SelectTrigger>
                <SelectContent>
                  {SUPPORTED_CURRENCIES.map((cur) => (
                    <SelectItem key={cur} value={cur}>
                      {cur}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-1.5">
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-600">
                Amount ({receiveCurrency}) <span className="text-red-500">*</span>
              </label>
              <Input
                type="number"
                step="any"
                placeholder="25000.00"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="h-10 text-xs bg-slate-50/60 border-slate-200 font-mono"
                required
              />
            </div>

            <div className="space-y-1.5">
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-600">
                FX Rate (NGN/{receiveCurrency})
              </label>
              <Input
                type="number"
                step="any"
                placeholder="1550"
                value={fxRate}
                onChange={(e) => setFxRate(e.target.value)}
                className="h-10 text-xs bg-slate-50/60 border-slate-200 font-mono"
              />
            </div>
          </div>

          {/* Estimated Funding Preview */}
          {parsedAmount > 0 && parsedRate > 0 && (
            <div className="p-3 bg-amber-50/60 border border-amber-200/70 rounded-xl flex items-center justify-between text-xs">
              <span className="text-amber-900 font-medium">Estimated Treasury NGN Funding:</span>
              <span className="font-mono font-bold text-amber-950">
                ₦{estimatedNgnFunding.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </span>
            </div>
          )}

          {/* Section 3: Beneficiary (Supplier) Details */}
          <div className="space-y-3 pt-1">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center gap-1.5 border-b pb-1 border-slate-100">
              <Building2 className="w-3.5 h-3.5 text-[#C9A227]" /> Beneficiary & Banking Details
            </h4>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="block text-[11px] font-semibold text-slate-600">
                  Beneficiary Name <span className="text-red-500">*</span>
                </label>
                <Input
                  placeholder="e.g. Apex Global Logistics Ltd"
                  value={recipientName}
                  onChange={(e) => setRecipientName(e.target.value)}
                  className="h-9 text-xs bg-slate-50/60 border-slate-200"
                  required
                />
              </div>

              <div className="space-y-1.5">
                <label className="block text-[11px] font-semibold text-slate-600">
                  Beneficiary Bank Name
                </label>
                <Input
                  placeholder="e.g. JPMorgan Chase Bank, N.A."
                  value={supplierBankName}
                  onChange={(e) => setSupplierBankName(e.target.value)}
                  className="h-9 text-xs bg-slate-50/60 border-slate-200"
                />
              </div>

              <div className="space-y-1.5">
                <label className="block text-[11px] font-semibold text-slate-600">
                  Account Number / IBAN
                </label>
                <Input
                  placeholder="e.g. 021000021 / US34..."
                  value={supplierAccountNumber}
                  onChange={(e) => setSupplierAccountNumber(e.target.value)}
                  className="h-9 text-xs bg-slate-50/60 border-slate-200 font-mono"
                />
              </div>

              <div className="space-y-1.5">
                <label className="block text-[11px] font-semibold text-slate-600">
                  SWIFT / BIC Code
                </label>
                <Input
                  placeholder="e.g. CHASUS33"
                  value={swiftBic}
                  onChange={(e) => setSwiftBic(e.target.value)}
                  className="h-9 text-xs bg-slate-50/60 border-slate-200 font-mono"
                />
              </div>
            </div>
          </div>

          {/* Section 4: Routing Rail & Timing */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1">
            <div className="space-y-1.5">
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-600">
                Recommended Execution Rail
              </label>
              <Select value={route} onValueChange={setRoute}>
                <SelectTrigger className="h-10 text-xs bg-slate-50/60 border-slate-200">
                  <SelectValue placeholder="Select Route" />
                </SelectTrigger>
                <SelectContent>
                  {PAYMENT_ROUTES.map((r) => (
                    <SelectItem key={r.id} value={r.id}>
                      {r.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-1.5">
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-600">
                Initial Status
              </label>
              <Select value={status} onValueChange={setStatus}>
                <SelectTrigger className="h-10 text-xs bg-slate-50/60 border-slate-200">
                  <SelectValue placeholder="Select Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="AWAITING_PAYMENT">PENDING_APPROVAL (Pending Settlement)</SelectItem>
                  <SelectItem value="READY_FOR_ROUTING">READY_FOR_ROUTING (Payment Confirmed)</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-1.5">
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-600">
                Due Date / Value Date
              </label>
              <Input
                type="date"
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
                className="h-9 text-xs bg-slate-50/60 border-slate-200"
              />
            </div>

            <div className="space-y-1.5">
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-600">
                Purpose / Reference Note
              </label>
              <Input
                placeholder="Invoice reference or commercial purpose"
                value={purpose}
                onChange={(e) => setPurpose(e.target.value)}
                className="h-9 text-xs bg-slate-50/60 border-slate-200"
              />
            </div>
          </div>

          {/* Modal Actions */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              className="text-xs h-10 px-4 border-slate-200"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={submitting || !customerId || !amount}
              className="bg-[#C9A227] hover:bg-[#b08e20] text-white text-xs font-bold h-10 px-6 gap-2"
            >
              {submitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Creating Obligation...
                </>
              ) : (
                <>
                  Create Payment Obligation
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}

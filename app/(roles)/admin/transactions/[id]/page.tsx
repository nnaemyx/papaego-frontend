"use client";

import { use, useState, useRef } from "react";
import { useRouter } from "next/navigation";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { ChevronLeft, CircleDot, CheckCircle, Clock, XCircle, Building2, Hash, MapPin, Upload, Paperclip, X, Loader2, Link2 } from "lucide-react";
import Image from "next/image";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { transactionsApi } from "@/lib/api/transactions";
import { suppliersApi } from "@/lib/api/suppliers";
import { format } from "date-fns";
import { TransactionChat } from "@/components/transactions/TransactionChat";
import { toast } from "sonner";
import { ShieldAlert, ShieldCheck } from "lucide-react";

export default function TransactionDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const router = useRouter();
  const queryClient = useQueryClient();
  const [notes, setNotes] = useState("");
  const [defaultAccordion, setDefaultAccordion] = useState("customer");
  const [uploadingReceipt, setUploadingReceipt] = useState(false);
  const [receiptFile, setReceiptFile] = useState<File | null>(null);
  const receiptInputRef = useRef<HTMLInputElement>(null);

  // Unwrap params promise (Next.js 16)
  const { id } = use(params);

  const { data: rawTransaction, isLoading } = useQuery({
    queryKey: ["admin-transaction", id],
    queryFn: () => transactionsApi.getTransaction(id),
  });

  const handleReceiptUpload = async (file: File) => {
    setUploadingReceipt(true);
    try {
      await transactionsApi.uploadReceipt(id, file);
      setReceiptFile(file);
      toast.success("Receipt uploaded and sent to customer successfully");
    } catch {
      toast.error("Failed to upload receipt");
    } finally {
      setUploadingReceipt(false);
    }
  };

  const freezeMutation = useMutation({
    mutationFn: () => transactionsApi.freezeTrade(id),
    onSuccess: () => {
        toast.success("Commission FROZEN successfully");
        queryClient.invalidateQueries({ queryKey: ["admin-transaction", id] });
    },
    onError: () => toast.error("Failed to freeze commission")
  });

  const unfreezeMutation = useMutation({
    mutationFn: () => transactionsApi.unfreezeTrade(id),
    onSuccess: () => {
        toast.success("Commission UN-FROZEN successfully");
        queryClient.invalidateQueries({ queryKey: ["admin-transaction", id] });
    },
    onError: () => toast.error("Failed to unfreeze commission")
  });

  if (isLoading) {
    return (
      <div className="p-8 flex justify-center items-center h-full">
        <p className="text-gray-500 animate-pulse">Loading transaction details...</p>
      </div>
    );
  }

  if (!rawTransaction) {
    return (
      <div className="p-8 flex justify-center items-center h-full flex-col">
        <p className="text-red-500 mb-4 font-bold">Transaction not found</p>
        <Button onClick={() => router.back()} variant="outline">Go Back</Button>
      </div>
    );
  }

  const transaction = {
    id: rawTransaction.id,
    tradeId: rawTransaction.tradeId || rawTransaction.id.split('-')[0].toUpperCase(),
    transactionType: `${rawTransaction.sendCurrency} → ${rawTransaction.receiveCurrency}`,
    amount: `${rawTransaction.sendCurrency} ${Number(rawTransaction.amount).toLocaleString()}`,
    dateTime: format(new Date(rawTransaction.createdAt), "dd MMM yyyy - hh:mm a"),
    verificationStatus: "Verified",
    status: rawTransaction.status,

    customer: {
      name: rawTransaction.customer?.fullName || "Unknown",
      customerId: rawTransaction.customer?.customerRef || "N/A",
      mobileNumber: rawTransaction.customer?.phone || "N/A",
      email: rawTransaction.customer?.email || "N/A",
      kycStatus: rawTransaction.customer?.kycStatus || "Pending",
      kycLevel: rawTransaction.customer?.kycLevel || "Basic",
    },

    tradeDetails: {
      tradeType: rawTransaction.sendCurrency === 'NGN' ? 'Buy USD' : 'Sell USD',
      fromCurrency: rawTransaction.sendCurrency,
      toCurrency: rawTransaction.receiveCurrency,
      exchangeRate: rawTransaction.fxRate ? `1 ${rawTransaction.sendCurrency} = ${rawTransaction.fxRate} ${rawTransaction.receiveCurrency}` : 'N/A',
      localAmountPaid: `${rawTransaction.sendCurrency} ${Number(rawTransaction.amount).toLocaleString()}`,
      foreignAmountSent: rawTransaction.fxRate
        ? `${rawTransaction.receiveCurrency} ${(Number(rawTransaction.amount) / Number(rawTransaction.fxRate)).toFixed(2)}`
        : 'Pending',
      payoutAmount: rawTransaction.payoutAmount || "N/A",
      serviceFee: "₦0.00",
      totalCharged: `${rawTransaction.sendCurrency} ${Number(rawTransaction.amount).toLocaleString()}`,
    },

    paymentMethod: {
      method: rawTransaction.paymentMethod || "Bank Transfer",
      source: rawTransaction.paymentSource || "N/A",
      senderBank: "N/A",
      accountName: rawTransaction.customer?.fullName || "N/A",
      accountNumber: "N/A",
      paymentProof: rawTransaction.paymentProofUrl
    },

    deliveryDetails: {
      method: rawTransaction.payoutMethod || "Bank Account",
      currency: rawTransaction.receiveCurrency,
      recipientBank: "N/A",
      accountName: rawTransaction.recipientName || "N/A",
      accountNumber: rawTransaction.recipientDetails || "N/A",
      routingNumber: "N/A",
      swiftCode: "N/A",
      accountType: "N/A",
      recipientCountry: "N/A",
      bankAddress: "N/A",
      notes: "-",
    },

    timeline: [
      {
        event: "Trade Created",
        dateTime: format(new Date(rawTransaction.createdAt), "dd/MM/yyyy hh:mm a"),
        status: "Completed",
        description: "Trade was initiated"
      }
    ],

    agentNotes: [] as Array<{ time: string, note: string, verified: boolean }>,

    handledBy: rawTransaction.agent ? `${rawTransaction.agent.firstName || ''} ${rawTransaction.agent.lastName || ''}`.trim() || 'Agent' : "System",
  };

  const getTimelineIcon = (status: string) => {
    switch (status) {
      case "Completed":
        return <CheckCircle className="h-5 w-5" style={{ color: "#27ae60" }} />;
      case "Pending":
        return <Clock className="h-5 w-5" style={{ color: "#f0cd00" }} />;
      case "Failed":
        return <XCircle className="h-5 w-5" style={{ color: "#e05555" }} />;
      default:
        return <CircleDot className="h-5 w-5" style={{ color: "#9aa0a6" }} />;
    }
  };

  return (
    <div className="p-4 md:p-6 lg:pl-7 lg:pr-6 space-y-6" style={{ backgroundColor: "#f7f8f9" }}>
      {/* Back Button */}
      <button
        onClick={() => router.back()}
        className="flex items-center gap-2 text-sm font-semibold hover:underline"
        style={{ color: "#2b2f33" }}
      >
        <ChevronLeft className="h-4 w-4" />
        Back to Transactions
      </button>

      {/* Page Header */}
      <div>
        <h1 className="text-3xl font-bold mb-2" style={{ color: "#2b2f33" }}>
          Transaction Details
        </h1>
        <p className="text-base" style={{ color: "#6b7078" }}>
          {transaction.customer.name} - {transaction.tradeId}
        </p>
      </div>

      {/* Transaction Overview - Always Visible */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <div className="flex items-start justify-between mb-6">
          <h2 className="text-xl font-bold" style={{ color: "#2b2f33" }}>
            Transaction Overview
          </h2>
          <Badge
            variant="outline"
            className="text-sm px-3 py-1"
            style={{
              backgroundColor: "#e3f2fd",
              borderColor: "#1890ff",
              color: "#1890ff",
            }}
          >
            {transaction.status}
          </Badge>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <div>
            <p className="text-sm mb-1" style={{ color: "#6b7078" }}>Transaction ID</p>
            <p className="text-base font-semibold" style={{ color: "#2b2f33" }}>{transaction.tradeId}</p>
          </div>
          <div>
            <p className="text-sm mb-1" style={{ color: "#6b7078" }}>Transaction Type</p>
            <p className="text-base font-semibold" style={{ color: "#2b2f33" }}>{transaction.transactionType}</p>
          </div>
          <div>
            <p className="text-sm mb-1" style={{ color: "#6b7078" }}>Amount</p>
            <p className="text-base font-semibold" style={{ color: "#2b2f33" }}>{transaction.amount}</p>
          </div>
          <div>
            <p className="text-sm mb-1" style={{ color: "#6b7078" }}>Verification Status</p>
            <Badge
              variant="outline"
              className="text-sm"
              style={{
                backgroundColor: "#fff4d1",
                borderColor: "#c9a227",
                color: "#c9a227",
              }}
            >
              {transaction.verificationStatus}
            </Badge>
          </div>
          <div>
            <p className="text-sm mb-1" style={{ color: "#6b7078" }}>Date & Time</p>
            <p className="text-base font-semibold" style={{ color: "#2b2f33" }}>{transaction.dateTime}</p>
          </div>
          <div>
            <p className="text-sm mb-1" style={{ color: "#6b7078" }}>Handled By</p>
            <p className="text-base font-semibold" style={{ color: "#c9a227" }}>{transaction.handledBy}</p>
          </div>
        </div>

        <div className="mt-6 p-4 rounded-lg flex items-start gap-3" style={{ backgroundColor: "#e3f2fd", border: "1px solid #90caf9" }}>
          <div className="w-5 h-5 mt-0.5 rounded-full flex items-center justify-center shrink-0" style={{ backgroundColor: "#1890ff" }}>
            <span className="text-white text-xs font-bold">i</span>
          </div>
          <p className="text-sm" style={{ color: "#1565c0" }}>
            This transaction is currently being processed. Funds have been received and verified. Awaiting USD delivery confirmation.
          </p>
        </div>
      </div>

      {/* Accordion Sections */}
      <Accordion type="single" collapsible defaultValue={defaultAccordion} className="space-y-4">
        {/* Customer Information */}
        <AccordionItem
          value="customer"
          className="bg-white rounded-lg border border-gray-200 px-6"
        >
          <AccordionTrigger className="hover:no-underline">
            <h3 className="text-lg font-bold" style={{ color: "#2b2f33" }}>
              Customer Information
            </h3>
          </AccordionTrigger>
          <AccordionContent>
            <div className="space-y-4 pt-4">
              <div className="flex justify-between items-start">
                <span className="text-sm" style={{ color: "#6b7078" }}>Customer Name</span>
                <span className="text-sm font-semibold text-right" style={{ color: "#27ae60" }}>
                  {transaction.customer.name}
                </span>
              </div>
              <div className="flex justify-between items-start">
                <span className="text-sm" style={{ color: "#6b7078" }}>Customer ID</span>
                <span className="text-sm font-semibold text-right" style={{ color: "#2b2f33" }}>
                  {transaction.customer.customerId}
                </span>
              </div>
              <div className="flex justify-between items-start">
                <span className="text-sm" style={{ color: "#6b7078" }}>Mobile Number</span>
                <span className="text-sm font-semibold text-right" style={{ color: "#2b2f33" }}>
                  {transaction.customer.mobileNumber}
                </span>
              </div>
              <div className="flex justify-between items-start">
                <span className="text-sm" style={{ color: "#6b7078" }}>Email Address</span>
                <span className="text-sm font-semibold text-right" style={{ color: "#2b2f33" }}>
                  {transaction.customer.email}
                </span>
              </div>
              <div className="flex justify-between items-start">
                <span className="text-sm" style={{ color: "#6b7078" }}>KYC Status</span>
                <Badge
                  variant="outline"
                  className="text-sm"
                  style={{
                    backgroundColor: "#d4f4dd",
                    borderColor: "#27ae60",
                    color: "#27ae60",
                  }}
                >
                  {transaction.customer.kycStatus}
                </Badge>
              </div>
              <div className="flex justify-between items-start">
                <span className="text-sm" style={{ color: "#6b7078" }}>KYC Level</span>
                <span className="text-sm font-semibold text-right" style={{ color: "#2b2f33" }}>
                  {transaction.customer.kycLevel}
                </span>
              </div>
            </div>

            <div className="mt-4 p-4 rounded-lg flex items-start gap-3" style={{ backgroundColor: "#e3f2fd", border: "1px solid #90caf9" }}>
              <div className="w-5 h-5 mt-0.5 rounded-full flex items-center justify-center shrink-0" style={{ backgroundColor: "#1890ff" }}>
                <span className="text-white text-xs font-bold">i</span>
              </div>
              <p className="text-sm" style={{ color: "#1565c0" }}>
                Customer identity and KYC documents have been successfully verified
              </p>
            </div>
          </AccordionContent>
        </AccordionItem>

        {/* Trade Details */}
        <AccordionItem
          value="trade"
          className="bg-white rounded-lg border border-gray-200 px-6"
        >
          <AccordionTrigger className="hover:no-underline">
            <h3 className="text-lg font-bold" style={{ color: "#2b2f33" }}>
              Trade Details
            </h3>
          </AccordionTrigger>
          <AccordionContent>
            <div className="space-y-4 pt-4">
              <div className="flex justify-between items-start">
                <span className="text-sm" style={{ color: "#6b7078" }}>Trade Type</span>
                <span className="text-sm font-semibold text-right" style={{ color: "#2b2f33" }}>
                  {transaction.tradeDetails.tradeType}
                </span>
              </div>
              <div className="flex justify-between items-start">
                <span className="text-sm" style={{ color: "#6b7078" }}>From Currency</span>
                <span className="text-sm font-semibold text-right" style={{ color: "#2b2f33" }}>
                  {transaction.tradeDetails.fromCurrency}
                </span>
              </div>
              <div className="flex justify-between items-start">
                <span className="text-sm" style={{ color: "#6b7078" }}>To Currency</span>
                <span className="text-sm font-semibold text-right" style={{ color: "#2b2f33" }}>
                  {transaction.tradeDetails.toCurrency}
                </span>
              </div>
              <div className="flex justify-between items-start">
                <span className="text-sm" style={{ color: "#6b7078" }}>Exchange Rate</span>
                <span className="text-sm font-semibold text-right" style={{ color: "#2b2f33" }}>
                  {transaction.tradeDetails.exchangeRate}
                </span>
              </div>
              <div className="h-px bg-gray-200 my-2"></div>
              <div className="flex justify-between items-start">
                <span className="text-sm font-medium" style={{ color: "#6b7078" }}>Local Amount Paid (NGN)</span>
                <span className="text-base font-bold text-right" style={{ color: "#2b2f33" }}>
                  {transaction.tradeDetails.localAmountPaid}
                </span>
              </div>
              <div className="flex justify-between items-start">
                <span className="text-sm font-medium" style={{ color: "#6b7078" }}>Foreign Amount Sent (USD)</span>
                <span className="text-base font-bold text-right" style={{ color: "#2b2f33" }}>
                  {transaction.tradeDetails.foreignAmountSent}
                </span>
              </div>
              <div className="flex justify-between items-start">
                <span className="text-sm" style={{ color: "#6b7078" }}>Service Fee</span>
                <span className="text-sm font-semibold text-right" style={{ color: "#2b2f33" }}>
                  {transaction.tradeDetails.serviceFee}
                </span>
              </div>
              <div className="h-px bg-gray-200 my-2"></div>
              <div className="flex justify-between items-start">
                <span className="text-sm font-bold" style={{ color: "#6b7078" }}>Total Charged</span>
                <span className="text-lg font-bold text-right" style={{ color: "#c9a227" }}>
                  {transaction.tradeDetails.totalCharged}
                </span>
              </div>
            </div>

            <div className="mt-4 p-4 rounded-lg flex items-start gap-3" style={{ backgroundColor: "#fff8e1", border: "1px solid #ffd54f" }}>
              <div className="w-5 h-5 mt-0.5 rounded-full flex items-center justify-center shrink-0" style={{ backgroundColor: "#f0cd00" }}>
                <span className="text-white text-xs font-bold">i</span>
              </div>
              <p className="text-sm" style={{ color: "#f57f17" }}>
                Exchange rate was locked at the time of trade creation
              </p>
            </div>
          </AccordionContent>
        </AccordionItem>

        {/* Payment Method & Source */}
        <AccordionItem
          value="payment"
          className="bg-white rounded-lg border border-gray-200 px-6"
        >
          <AccordionTrigger className="hover:no-underline">
            <h3 className="text-lg font-bold" style={{ color: "#2b2f33" }}>
              Payment Method & Source
            </h3>
          </AccordionTrigger>
          <AccordionContent>
            <div className="space-y-4 pt-4">
              <div className="flex justify-between items-start">
                <span className="text-sm" style={{ color: "#6b7078" }}>Payment Method</span>
                <span className="text-sm font-semibold text-right" style={{ color: "#2b2f33" }}>
                  {transaction.paymentMethod.method}
                </span>
              </div>
              <div className="flex justify-between items-start">
                <span className="text-sm" style={{ color: "#6b7078" }}>Payment Source</span>
                <span className="text-sm font-semibold text-right" style={{ color: "#2b2f33" }}>
                  {transaction.paymentMethod.source}
                </span>
              </div>
              <div className="h-px bg-gray-200 my-2"></div>
              <div className="flex justify-between items-start">
                <span className="text-sm font-medium" style={{ color: "#6b7078" }}>Sender Bank</span>
                <span className="text-sm font-semibold text-right" style={{ color: "#2b2f33" }}>
                  {transaction.paymentMethod.senderBank}
                </span>
              </div>
              <div className="flex justify-between items-start">
                <span className="text-sm" style={{ color: "#6b7078" }}>Account Name</span>
                <span className="text-sm font-semibold text-right" style={{ color: "#2b2f33" }}>
                  {transaction.paymentMethod.accountName}
                </span>
              </div>
              <div className="flex justify-between items-start">
                <span className="text-sm" style={{ color: "#6b7078" }}>Account Number</span>
                <span className="text-sm font-semibold text-right" style={{ color: "#2b2f33" }}>
                  {transaction.paymentMethod.accountNumber}
                </span>
              </div>
            </div>
          </AccordionContent>
        </AccordionItem>

        {/* Delivery Details */}
        <AccordionItem
          value="delivery"
          className="bg-white rounded-lg border border-gray-200 px-6"
        >
          <AccordionTrigger className="hover:no-underline">
            <h3 className="text-lg font-bold" style={{ color: "#2b2f33" }}>
              Delivery Details
            </h3>
          </AccordionTrigger>
          <AccordionContent>
            <div className="space-y-4 pt-4">
              <div className="flex justify-between items-start">
                <span className="text-sm" style={{ color: "#6b7078" }}>Delivery Method</span>
                <span className="text-sm font-semibold text-right" style={{ color: "#2b2f33" }}>
                  {transaction.deliveryDetails.method}
                </span>
              </div>
              <div className="flex justify-between items-start">
                <span className="text-sm" style={{ color: "#6b7078" }}>Currency</span>
                <span className="text-sm font-semibold text-right" style={{ color: "#2b2f33" }}>
                  {transaction.deliveryDetails.currency}
                </span>
              </div>
              <div className="h-px bg-gray-200 my-2"></div>
              <div className="flex justify-between items-start">
                <span className="text-sm font-medium" style={{ color: "#6b7078" }}>Recipient Bank</span>
                <span className="text-sm font-semibold text-right" style={{ color: "#2b2f33" }}>
                  {transaction.deliveryDetails.recipientBank}
                </span>
              </div>
              <div className="flex justify-between items-start">
                <span className="text-sm" style={{ color: "#6b7078" }}>Account Name</span>
                <span className="text-sm font-semibold text-right" style={{ color: "#2b2f33" }}>
                  {transaction.deliveryDetails.accountName}
                </span>
              </div>
              <div className="flex justify-between items-start">
                <span className="text-sm" style={{ color: "#6b7078" }}>Routing Number</span>
                <span className="text-sm font-semibold text-right" style={{ color: "#2b2f33" }}>
                  {transaction.deliveryDetails.routingNumber}
                </span>
              </div>
              <div className="flex justify-between items-start">
                <span className="text-sm" style={{ color: "#6b7078" }}>SWIFT Code</span>
                <span className="text-sm font-semibold text-right" style={{ color: "#2b2f33" }}>
                  {transaction.deliveryDetails.swiftCode}
                </span>
              </div>
              <div className="flex justify-between items-start">
                <span className="text-sm" style={{ color: "#6b7078" }}>Account Type</span>
                <span className="text-sm font-semibold text-right" style={{ color: "#2b2f33" }}>
                  {transaction.deliveryDetails.accountType}
                </span>
              </div>
              <div className="flex justify-between items-start">
                <span className="text-sm" style={{ color: "#6b7078" }}>Recipient Country</span>
                <span className="text-sm font-semibold text-right" style={{ color: "#2b2f33" }}>
                  {transaction.deliveryDetails.recipientCountry}
                </span>
              </div>
              <div className="flex justify-between items-start">
                <span className="text-sm" style={{ color: "#6b7078" }}>Bank Address</span>
                <span className="text-sm font-semibold text-right" style={{ color: "#2b2f33" }}>
                  {transaction.deliveryDetails.bankAddress}
                </span>
              </div>
              <div className="flex justify-between items-start">
                <span className="text-sm" style={{ color: "#6b7078" }}>Additional Notes</span>
                <span className="text-sm font-semibold text-right" style={{ color: "#6b7078" }}>
                  {transaction.deliveryDetails.notes}
                </span>
              </div>
            </div>
          </AccordionContent>
        </AccordionItem>

        {/* Transaction Timeline */}
        <AccordionItem
          value="timeline"
          className="bg-white rounded-lg border border-gray-200 px-6"
        >
          <AccordionTrigger className="hover:no-underline">
            <h3 className="text-lg font-bold" style={{ color: "#2b2f33" }}>
              Transaction Timeline
            </h3>
          </AccordionTrigger>
          <AccordionContent>
            <div className="pt-4 space-y-4">
              {transaction.timeline.map((item, index) => (
                <div key={index} className="flex gap-4">
                  <div className="flex flex-col items-center">
                    {getTimelineIcon(item.status)}
                    {index < transaction.timeline.length - 1 && (
                      <div className="w-0.5 h-12 mt-2" style={{ backgroundColor: "#d9d9d9" }}></div>
                    )}
                  </div>
                  <div className="flex-1 pb-2">
                    <div className="flex justify-between items-start mb-1">
                      <p className="text-sm font-semibold" style={{ color: "#2b2f33" }}>
                        {item.event}
                      </p>
                      <p className="text-xs" style={{ color: "#6b7078" }}>
                        {item.dateTime}
                      </p>
                    </div>
                    <p className="text-xs" style={{ color: "#9aa0a6" }}>
                      {item.description}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </AccordionContent>
        </AccordionItem>

        {/* Customer Supplier Details */}
        <AccordionItem
          value="supplier"
          className="bg-white rounded-lg border border-gray-200 px-6"
        >
          <AccordionTrigger className="hover:no-underline">
            <h3 className="text-lg font-bold flex items-center gap-2" style={{ color: "#2b2f33" }}>
              <Building2 className="w-5 h-5" style={{ color: "#C9A227" }} />
              Customer Supplier Details
            </h3>
          </AccordionTrigger>
          <AccordionContent>
            <div className="pt-4 space-y-4">
              <div className="p-4 rounded-lg" style={{ backgroundColor: "#FFFBEB", border: "1px solid #FDE68A" }}>
                <p className="text-xs font-semibold mb-3" style={{ color: "#B45309" }}>
                  Submitted by customer for this trade
                </p>
                {[
                  { icon: Building2, label: "Business Name", val: (rawTransaction as any)?.supplierBusinessName || "Not provided" },
                  { icon: Hash, label: "Bank Name", val: (rawTransaction as any)?.supplierBankName || "Not provided" },
                  { icon: Hash, label: "Account Number", val: (rawTransaction as any)?.supplierAccountNumber || "Not provided" },
                  { icon: Building2, label: "Sector", val: (rawTransaction as any)?.supplierSector || "Not provided" },
                  { icon: MapPin, label: "Address", val: (rawTransaction as any)?.supplierAddress || "Not provided" },
                ].map(({ icon: Icon, label, val }) => (
                  <div key={label} className="flex justify-between items-start py-2 border-b last:border-0" style={{ borderColor: "#FDE68A" }}>
                    <div className="flex items-center gap-2">
                      <Icon className="w-4 h-4 shrink-0" style={{ color: "#D97706" }} />
                      <span className="text-sm" style={{ color: "#92400E" }}>{label}</span>
                    </div>
                    <span className="text-sm font-semibold text-right" style={{ color: "#78350F" }}>{val}</span>
                  </div>
                ))}
              </div>

              <div className="flex gap-3">
                <Button
                  variant="outline"
                  className="flex-1"
                  style={{ borderColor: "#C9A227", color: "#C9A227" }}
                  onClick={() => window.open("/admin/suppliers", "_blank")}
                >
                  <Link2 className="w-4 h-4 mr-2" />
                  Save to Supplier Database
                </Button>
              </div>
            </div>
          </AccordionContent>
        </AccordionItem>

        {/* Admin Invoice & Receipt */}
        <AccordionItem
          value="invoice"
          className="bg-white rounded-lg border border-gray-200 px-6"
        >
          <AccordionTrigger className="hover:no-underline">
            <h3 className="text-lg font-bold flex items-center gap-2" style={{ color: "#2b2f33" }}>
              <Upload className="w-5 h-5" style={{ color: "#27AE60" }} />
              Admin Invoice &amp; Receipt
            </h3>
          </AccordionTrigger>
          <AccordionContent>
            <div className="pt-4 space-y-4">
              <div className="p-4 rounded-lg" style={{ backgroundColor: "#E3F2FD", border: "1px solid #90CAF9" }}>
                <p className="text-sm" style={{ color: "#1565C0" }}>
                  Upload a receipt or invoice here. Once uploaded, it will be sent to
                  the customer to confirm the trade is complete.
                </p>
              </div>

              {receiptFile ? (
                <div
                  className="flex items-center justify-between p-4 rounded-lg"
                  style={{ backgroundColor: "#E2FDED", border: "1px solid #A7F3D0" }}
                >
                  <div className="flex items-center gap-3">
                    <Paperclip className="w-5 h-5" style={{ color: "#27AE60" }} />
                    <span className="text-sm font-semibold" style={{ color: "#27AE60" }}>
                      {receiptFile.name} — Sent to customer
                    </span>
                  </div>
                  <button
                    onClick={() => setReceiptFile(null)}
                    className="p-1 hover:bg-green-100 rounded"
                  >
                    <X className="w-4 h-4" style={{ color: "#27AE60" }} />
                  </button>
                </div>
              ) : (
                <label
                  className="flex flex-col items-center justify-center gap-3 border-2 border-dashed rounded-xl p-8 cursor-pointer hover:border-green-400 transition-colors"
                  style={{ borderColor: "#E1E3E6", backgroundColor: "#F7F8F9" }}
                >
                  <div
                    className="w-12 h-12 rounded-full flex items-center justify-center"
                    style={{ backgroundColor: "#E2FDED" }}
                  >
                    {uploadingReceipt ? (
                      <Loader2 className="w-6 h-6 animate-spin" style={{ color: "#27AE60" }} />
                    ) : (
                      <Upload className="w-6 h-6" style={{ color: "#27AE60" }} />
                    )}
                  </div>
                  <div className="text-center">
                    <p className="text-sm font-bold" style={{ color: "#2b2f33" }}>
                      {uploadingReceipt ? "Uploading receipt…" : "Upload receipt / invoice for customer"}
                    </p>
                    <p className="text-xs mt-1" style={{ color: "#9AA0A6" }}>
                      JPG, PNG, PDF · Max 10MB
                    </p>
                  </div>
                  <input
                    ref={receiptInputRef}
                    type="file"
                    className="hidden"
                    accept=".jpg,.jpeg,.png,.pdf"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) handleReceiptUpload(file);
                    }}
                  />
                </label>
              )}
            </div>
          </AccordionContent>
        </AccordionItem>

        {/* Agent Notes */}
        <AccordionItem
          value="notes"
          className="bg-white rounded-lg border border-gray-200 px-6"
        >
          <AccordionTrigger className="hover:no-underline">
            <h3 className="text-lg font-bold" style={{ color: "#2b2f33" }}>
              Agent Notes
            </h3>
          </AccordionTrigger>
          <AccordionContent>
            <div className="pt-4 space-y-3">
              {transaction.agentNotes.map((note, index) => (
                <div
                  key={index}
                  className="flex gap-3 p-3 rounded-lg"
                  style={{ backgroundColor: note.verified ? "#f0f9ff" : "#f9fafb", border: "1px solid #e5e7eb" }}
                >
                  <div className="flex-1">
                    <div className="flex items-start gap-2 mb-1">
                      <span className="text-xs font-semibold" style={{ color: "#6b7078" }}>
                        {note.time}
                      </span>
                      {note.verified && (
                        <CheckCircle className="h-3 w-3 mt-0.5" style={{ color: "#27ae60" }} />
                      )}
                    </div>
                    <p className="text-sm" style={{ color: "#2b2f33" }}>
                      {note.note}
                    </p>
                  </div>
                </div>
              ))}

              <div className="pt-4 space-y-2">
                <label className="text-sm font-semibold" style={{ color: "#2b2f33" }}>
                  Add New Note
                </label>
                <Textarea
                  placeholder="Type your note here..."
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="min-h-[100px]"
                  style={{ color: "#2b2f33" }}
                />
                <div className="flex justify-end">
                  <Button
                    size="sm"
                    style={{
                      backgroundColor: "#c9a227",
                      color: "#ffffff",
                    }}
                    onClick={() => {
                      // Add note logic here
                      setNotes("");
                    }}
                  >
                    Add Note
                  </Button>
                </div>
              </div>
            </div>
          </AccordionContent>
        </AccordionItem>

        {/* SuperAdmin Controls */}
        <AccordionItem
          value="controls"
          className="bg-white rounded-lg border border-gray-200 px-6"
        >
          <AccordionTrigger className="hover:no-underline">
            <h3 className="text-lg font-bold" style={{ color: "#2b2f33" }}>
              SuperAdmin Controls
            </h3>
          </AccordionTrigger>
          <AccordionContent>
            <div className="pt-4 space-y-4">
              <div className="p-4 rounded-lg" style={{ backgroundColor: "#fff8e1", border: "1px solid #ffd54f" }}>
                <p className="text-sm font-semibold mb-2" style={{ color: "#f57f17" }}>
                  ⚠️ Administrative Actions
                </p>
                <p className="text-xs" style={{ color: "#6b7078" }}>
                  These actions can significantly impact the transaction. Use with caution and ensure proper authorization.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {rawTransaction.isCommissionFrozen ? (
                   <Button
                    onClick={() => unfreezeMutation.mutate()}
                    disabled={unfreezeMutation.isPending}
                    variant="outline"
                    className="w-full"
                    style={{
                        borderColor: "#27ae60",
                        color: "#27ae60",
                    }}
                    >
                    <ShieldCheck className="w-4 h-4 mr-2" />
                    Unfreeze Commission
                    </Button>
                ) : (
                    <Button
                    onClick={() => freezeMutation.mutate()}
                    disabled={freezeMutation.isPending}
                    variant="outline"
                    className="w-full"
                    style={{
                        borderColor: "#e05555",
                        color: "#e05555",
                    }}
                    >
                    <ShieldAlert className="w-4 h-4 mr-2" />
                    Freeze Commission (Escrow)
                    </Button>
                )}
                
                <Button
                  variant="outline"
                  className="w-full"
                  style={{
                    borderColor: "#e05555",
                    color: "#e05555",
                  }}
                >
                  Flag Transaction
                </Button>
                <Button
                  variant="outline"
                  className="w-full"
                  style={{
                    borderColor: "#f0cd00",
                    color: "#f0cd00",
                  }}
                >
                  Request Verification
                </Button>
                <Button
                  variant="outline"
                  className="w-full"
                  style={{
                    borderColor: "#27ae60",
                    color: "#27ae60",
                  }}
                >
                  Mark as Complete
                </Button>
              </div>
            </div>
          </AccordionContent>
        </AccordionItem>

        {/* Chat Section */}
        <AccordionItem
          value="chat"
          className="bg-white rounded-lg border border-gray-200 px-6"
        >
          <AccordionTrigger className="hover:no-underline">
            <h3 className="text-lg font-bold" style={{ color: "#2b2f33" }}>
              Transaction Chat
            </h3>
          </AccordionTrigger>
          <AccordionContent>
            <div className="pt-4 h-[450px]">
                <TransactionChat tradeId={id} />
            </div>
          </AccordionContent>
        </AccordionItem>
      </Accordion>

      {/* Bottom Actions */}
      <div className="flex flex-col sm:flex-row justify-between gap-4 pt-4">
        <Button
          variant="outline"
          onClick={() => router.back()}
        >
          Back to List
        </Button>
        <div className="flex gap-2">
          <Button
            variant="outline"
            style={{
              borderColor: "#27ae60",
              color: "#27ae60",
            }}
          >
            Export PDF
          </Button>
          <Button
            style={{
              backgroundColor: "#c9a227",
              color: "#ffffff",
            }}
          >
            Save Changes
          </Button>
        </div>
      </div>
    </div>
  );
}

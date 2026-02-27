"use client";

import React, { use } from 'react';
import Link from 'next/link';
import { ChevronLeft, Loader2 } from 'lucide-react';
import { TransactionOverview } from '@/components/transactions/TransactionOverview';
import { CustomerInfo } from '@/components/transactions/CustomerInfo';
import { TradeDetails } from '@/components/transactions/TradeDetails';
import { PaymentMethod } from '@/components/transactions/PaymentMethod';
import { DeliveryDetails } from '@/components/transactions/DeliveryDetails';
import { Timeline } from '@/components/transactions/Timeline';
import { AgentNotes } from '@/components/transactions/AgentNotes';
import { useQuery } from '@tanstack/react-query';
import { agentApi } from '@/lib/api/agent';
import { format } from 'date-fns';

interface TransactionDetailsPageProps {
  params: Promise<{
    id: string;
  }>;
}

export default function TransactionDetailsPage({ params }: TransactionDetailsPageProps) {
  const { id: transactionId } = use(params);

  const { data: rawTransaction, isLoading, error } = useQuery({
    queryKey: ['agent-transaction', transactionId],
    queryFn: () => agentApi.getTrade(transactionId),
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="w-8 h-8 animate-spin text-(--brand-primary)" />
      </div>
    );
  }

  if (error || !rawTransaction) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen p-4">
        <h1 className="text-2xl font-bold mb-4">Transaction Not Found</h1>
        <p className="text-gray-500 mb-8">We couldn't find the transaction you're looking for.</p>
        <Link
          href="/agent/transactions"
          className="px-6 py-2 bg-(--brand-primary) text-white rounded-lg font-bold"
        >
          Back to Transactions
        </Link>
      </div>
    );
  }

  // Map backend transaction to frontend components
  const details = {
    transactionId: rawTransaction.tradeId || rawTransaction.id.split('-')[0].toUpperCase(),
    status: rawTransaction.status,
    verificationStatus: "Verified", // Fallback for now
    customer: rawTransaction.customerDetails?.fullName || "Unknown Customer",
    handledBy: "You",
    transactionType: `${rawTransaction.sendCurrency} → ${rawTransaction.receiveCurrency}`,
    amountPaid: `${rawTransaction.sendCurrency} ${Number(rawTransaction.amount).toLocaleString()}`,
    dateTime: format(new Date(rawTransaction.createdAt), 'dd MMM yyyy - hh:mm a'),
    overviewMessage: "This transaction is currently being processed.",

    customerDetails: {
      fullName: rawTransaction.customerDetails?.fullName || "N/A",
      customerId: `C-${rawTransaction.customerId?.split('-')[0].toUpperCase()}`,
      phoneNumber: rawTransaction.customerDetails?.phone || "N/A",
      emailAddress: rawTransaction.customerDetails?.email || "N/A",
      bvnStatus: rawTransaction.customerDetails?.verified ? "Verified" : "Pending",
      kycLevel: "Level 1",
      customerMessage: "Identity verified successfully."
    },

    tradeDetails: {
      tradeType: "Regular",
      fromCurrency: rawTransaction.sendCurrency,
      toCurrency: rawTransaction.receiveCurrency,
      exchangeRate: rawTransaction.fxRate ? `1 ${rawTransaction.sendCurrency} = ${rawTransaction.fxRate} ${rawTransaction.receiveCurrency}` : "N/A",
      amountPaidNGN: rawTransaction.sendCurrency === 'NGN' ? `${rawTransaction.amount}` : "N/A",
      amountPaidUSD: rawTransaction.sendCurrency === 'USD' ? `${rawTransaction.amount}` : "N/A",
      amountPaidGBP: rawTransaction.sendCurrency === 'GBP' ? `${rawTransaction.amount}` : "N/A",
      amountPaidCAD: rawTransaction.sendCurrency === 'CAD' ? `${rawTransaction.amount}` : "N/A",
      amountToReceiveUSD: rawTransaction.receiveCurrency === 'USD' ? `${rawTransaction.payoutAmount || 'N/A'}` : "N/A",
      amountToReceiveNGN: rawTransaction.receiveCurrency === 'NGN' ? `${rawTransaction.payoutAmount || 'N/A'}` : "N/A",
      amountToReceiveGBP: rawTransaction.receiveCurrency === 'GBP' ? `${rawTransaction.payoutAmount || 'N/A'}` : "N/A",
      amountToReceiveCAD: rawTransaction.receiveCurrency === 'CAD' ? `${rawTransaction.payoutAmount || 'N/A'}` : "N/A",
      serviceFee: "₦0.00",
      totalCharged: `${rawTransaction.sendCurrency} ${rawTransaction.amount}`,
      tradeMessage: "Exchange rate was locked at initiation."
    },

    paymentDetails: {
      paymentMethod: rawTransaction.paymentMethod || "Bank Transfer",
      paymentSource: rawTransaction.paymentSource || "N/A",
      senderBank: "N/A",
      accountName: rawTransaction.customerDetails?.fullName || "N/A",
      accountNumber: "N/A",
      paymentProof: rawTransaction.paymentProofUrl || null,
      paymentMessage: "Payment verified by finance team."
    },

    deliveryDetails: {
      deliveryMethod: rawTransaction.payoutMethod || "Bank Account",
      currency: rawTransaction.receiveCurrency,
      recipientBank: "N/A",
      recipientName: rawTransaction.recipientName || "N/A",
      accountNumber: rawTransaction.recipientDetails || "N/A",
      routingNumber: "N/A",
      swiftCode: "N/A",
      accountType: "N/A",
      recipientCountry: "N/A",
      bankAddress: "N/A",
      status: rawTransaction.status === 'COMPLETED' ? 'Delivered' : 'In Progress',
      deliveryMessage: "Funds will be delivered to the recipient account."
    },

    timeline: [
      {
        label: "Trade Created",
        status: "completed" as const,
        dateTime: format(new Date(rawTransaction.createdAt), 'dd/MM/yyyy hh:mm a'),
        description: "Trade initiated by agent"
      }
    ],

    notes: [] as any[]
  };

  return (
    <div className="bg-(--light-bg) min-h-full">
      {/* Custom Header */}
      <div className="h-16 flex items-center px-8 z-10 w-full ">
        <div className="flex items-center gap-3 text-sm font-medium">
          <Link
            href="/agent/transactions"
            className="text-[#c9a227] hover:text-[#b08d1f] transition-colors flex items-center gap-2"
          >
            <ChevronLeft className="w-4 h-4" />
            {details.customer}
          </Link>
          <span className="text-[#6b7078]">|</span>
          <span className="text-[#9aa0a6]">Transaction Details</span>
        </div>
      </div>

      {/* Page Content */}
      <main className="p-8">
        <div className="max-w-[1400px] mx-auto space-y-5">
          <TransactionOverview
            transactionId={details.transactionId}
            status={details.status}
            verificationStatus={details.verificationStatus}
            customer={details.customer}
            handledBy={details.handledBy}
            transactionType={details.transactionType}
            amountPaid={details.amountPaid}
            dateTime={details.dateTime}
            message={details.overviewMessage}
          />

          <div className="grid grid-cols-2 gap-5">
            <CustomerInfo
              fullName={details.customerDetails.fullName}
              customerId={details.customerDetails.customerId}
              phoneNumber={details.customerDetails.phoneNumber}
              emailAddress={details.customerDetails.emailAddress}
              bvnStatus={details.customerDetails.bvnStatus}
              kycLevel={details.customerDetails.kycLevel}
              message={details.customerDetails.customerMessage}
            />
            <TradeDetails
              tradeType={details.tradeDetails.tradeType}
              fromCurrency={details.tradeDetails.fromCurrency}
              toCurrency={details.tradeDetails.toCurrency}
              exchangeRate={details.tradeDetails.exchangeRate}
              amountPaidNGN={details.tradeDetails.amountPaidNGN}
              amountPaidUSD={details.tradeDetails.amountPaidUSD}
              amountPaidGBP={details.tradeDetails.amountPaidGBP}
              amountPaidCAD={details.tradeDetails.amountPaidCAD}
              amountToReceiveUSD={details.tradeDetails.amountToReceiveUSD}
              amountToReceiveNGN={details.tradeDetails.amountToReceiveNGN}
              amountToReceiveGBP={details.tradeDetails.amountToReceiveGBP}
              amountToReceiveCAD={details.tradeDetails.amountToReceiveCAD}
              serviceFee={details.tradeDetails.serviceFee}
              totalCharged={details.tradeDetails.totalCharged}
              message={details.tradeDetails.tradeMessage}
            />
          </div>

          <div className="grid grid-cols-2 gap-5">
            <PaymentMethod
              paymentMethod={details.paymentDetails.paymentMethod}
              paymentSource={details.paymentDetails.paymentSource}
              senderBank={details.paymentDetails.senderBank}
              accountName={details.paymentDetails.accountName}
              accountNumber={details.paymentDetails.accountNumber}
              paymentProof={details.paymentDetails.paymentProof}
              message={details.paymentDetails.paymentMessage}
            />
            <DeliveryDetails
              deliveryMethod={details.deliveryDetails.deliveryMethod}
              currency={details.deliveryDetails.currency}
              recipientBank={details.deliveryDetails.recipientBank}
              recipientName={details.deliveryDetails.recipientName}
              accountNumber={details.deliveryDetails.accountNumber}
              routingNumber={details.deliveryDetails.routingNumber}
              swiftCode={details.deliveryDetails.swiftCode}
              accountType={details.deliveryDetails.accountType}
              recipientCountry={details.deliveryDetails.recipientCountry}
              bankAddress={details.deliveryDetails.bankAddress}
              status={details.deliveryDetails.status}
              message={details.deliveryDetails.deliveryMessage}
            />
          </div>

          <div className="grid grid-cols-2 gap-5">
            <Timeline events={details.timeline} />
            <AgentNotes notes={details.notes} />
          </div>
        </div>
      </main>
    </div>
  );
}

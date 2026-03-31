"use client";

import React, { use } from 'react';
import Link from 'next/link';
import { ChevronLeft, Loader2, CheckCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { useQueryClient, useMutation, useQuery } from '@tanstack/react-query';
import { TransactionOverview } from '@/components/transactions/TransactionOverview';
import { TradeDetails } from '@/components/transactions/TradeDetails';
import { PaymentMethod } from '@/components/transactions/PaymentMethod';
import { Timeline } from '@/components/transactions/Timeline';
import { AgentNotes } from '@/components/transactions/AgentNotes';
import { agentApi } from '@/lib/api/agent';
import { format } from 'date-fns';
import { ShieldAlert } from 'lucide-react';

interface TransactionDetailsPageProps {
  params: Promise<{
    id: string;
  }>;
}

export default function TransactionDetailsPage({ params }: TransactionDetailsPageProps) {
  const { id: transactionId } = use(params);

  const queryClient = useQueryClient();

  const { data: rawTransaction, isLoading, error } = useQuery({
    queryKey: ['agent-transaction', transactionId],
    queryFn: () => agentApi.getTrade(transactionId),
  });

  const confirmMutation = useMutation({
    mutationFn: (id: string) => agentApi.confirmPayout(id),
    onSuccess: () => {
      toast.success('Trade confirmed as completed!');
      queryClient.invalidateQueries({ queryKey: ['agent-transaction', transactionId] });
      queryClient.invalidateQueries({ queryKey: ['agent-dashboard-stats'] });
      queryClient.invalidateQueries({ queryKey: ['agent-trades'] });
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.error || 'Failed to confirm payout');
    },
  });

  const handleConfirm = () => {
    if (window.confirm('Are you sure you want to mark this trade as COMPLETED? This will notify the customer.')) {
      confirmMutation.mutate(transactionId);
    }
  };

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

  const customerName = rawTransaction.customerDetails?.fullName || 'Unknown Customer';

  const details = {
    transactionId: rawTransaction.tradeId || rawTransaction.id.split('-')[0].toUpperCase(),
    status: rawTransaction.status,
    verificationStatus: 'Verified',
    customer: customerName,
    handledBy: 'You',
    transactionType: `${rawTransaction.sendCurrency} → ${rawTransaction.receiveCurrency}`,
    amountPaid: `${rawTransaction.sendCurrency} ${Number(rawTransaction.amount).toLocaleString()}`,
    dateTime: format(new Date(rawTransaction.createdAt), 'dd MMM yyyy - hh:mm a'),
    overviewMessage: 'This transaction is currently being processed.',

    tradeDetails: {
      fromCurrency: rawTransaction.sendCurrency,
      toCurrency: rawTransaction.receiveCurrency,
      exchangeRate: rawTransaction.fxRate
        ? `1 ${rawTransaction.sendCurrency} = ${rawTransaction.fxRate} ${rawTransaction.receiveCurrency}`
        : 'N/A',
      amountPaidNGN: rawTransaction.sendCurrency === 'NGN' ? `₦${Number(rawTransaction.amount).toLocaleString()}` : 'N/A',
      amountPaidUSD: rawTransaction.sendCurrency === 'USD' ? `$${Number(rawTransaction.amount).toLocaleString()}` : 'N/A',
      amountPaidGBP: rawTransaction.sendCurrency === 'GBP' ? `£${Number(rawTransaction.amount).toLocaleString()}` : 'N/A',
      amountPaidCAD: rawTransaction.sendCurrency === 'CAD' ? `C$${Number(rawTransaction.amount).toLocaleString()}` : 'N/A',
      amountToReceiveUSD: rawTransaction.receiveCurrency === 'USD' ? `$${Number(rawTransaction.payoutAmount || 0).toLocaleString()}` : 'N/A',
      amountToReceiveNGN: rawTransaction.receiveCurrency === 'NGN' ? `₦${Number(rawTransaction.payoutAmount || 0).toLocaleString()}` : 'N/A',
      amountToReceiveGBP: rawTransaction.receiveCurrency === 'GBP' ? `£${Number(rawTransaction.payoutAmount || 0).toLocaleString()}` : 'N/A',
      amountToReceiveCAD: rawTransaction.receiveCurrency === 'CAD' ? `C$${Number(rawTransaction.payoutAmount || 0).toLocaleString()}` : 'N/A',
      serviceFee: '₦0.00',
      totalCharged: `${rawTransaction.sendCurrency} ${Number(rawTransaction.amount).toLocaleString()}`,
      tradeMessage: 'Exchange rate was locked at initiation.',
    },

    paymentDetails: {
      paymentMethod: rawTransaction.paymentMethod || 'Bank Transfer',
      paymentSource: rawTransaction.paymentSource || 'N/A',
      senderBank: 'N/A',
      accountName: customerName,
      accountNumber: 'N/A',
      paymentProof: rawTransaction.paymentProofUrl || null,
      paymentMessage: rawTransaction.paymentProofUrl
        ? 'Payment proof uploaded by customer.'
        : 'Waiting for payment proof.',
    },

    timeline: [
      {
        label: 'Trade Created',
        status: 'completed' as const,
        dateTime: format(new Date(rawTransaction.createdAt), 'dd/MM/yyyy hh:mm a'),
        description: 'Trade initiated by agent',
      },
    ],

    notes: [] as any[],
  };

  return (
    <div className="bg-(--light-bg) min-h-full">
      {/* Custom Header */}
      <div className="h-16 flex items-center px-8 z-10 w-full">
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
          {/* Action Area */}
          <div className="flex justify-between items-center bg-white p-4 rounded-xl border border-(--border-light) shadow-sm">
            <div>
              <h3 className="font-bold text-lg">Transaction Actions</h3>
              <p className="text-sm text-gray-500">Update the status of this trade as you process it.</p>
            </div>
            <div className="flex gap-3">
              {rawTransaction.status === 'PAYMENT_CONFIRMED' && (
                <Button
                  onClick={handleConfirm}
                  disabled={confirmMutation.isPending}
                  className="bg-green-600 hover:bg-green-700 text-white flex gap-2"
                >
                  {confirmMutation.isPending ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <CheckCircle className="w-4 h-4" />
                  )}
                  Confirm Payout (Complete)
                </Button>
              )}
            </div>
          </div>

          {rawTransaction.isCommissionFrozen && (
            <div className="bg-red-50 border border-red-200 p-4 rounded-xl flex items-start gap-3">
              <ShieldAlert className="w-5 h-5 text-red-600 mt-0.5" />
              <div>
                <h4 className="font-bold text-red-800">Administrator Hold (Escrow)</h4>
                <p className="text-sm text-red-700">
                  The commission for this trade has been frozen by an administrator. Please contact support before
                  proceeding with the payout.
                </p>
              </div>
            </div>
          )}

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

          {/* Trade Details — full width */}
          <TradeDetails
            tradeType={rawTransaction.tradeType || 'BUY'}
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

          {/* Payment Method — full width */}
          <PaymentMethod
            paymentMethod={details.paymentDetails.paymentMethod}
            paymentSource={details.paymentDetails.paymentSource}
            senderBank={details.paymentDetails.senderBank}
            accountName={details.paymentDetails.accountName}
            accountNumber={details.paymentDetails.accountNumber}
            paymentProof={details.paymentDetails.paymentProof}
            message={details.paymentDetails.paymentMessage}
          />

          <div className="grid grid-cols-1 gap-5">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <Timeline events={details.timeline} />
              <AgentNotes notes={details.notes} />
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

import React from 'react';
import Link from 'next/link';
import { ChevronLeft } from 'lucide-react';
import { TransactionOverview } from '@/components/transactions/TransactionOverview';
import { CustomerInfo } from '@/components/transactions/CustomerInfo';
import { TradeDetails } from '@/components/transactions/TradeDetails';
import { PaymentMethod } from '@/components/transactions/PaymentMethod';
import { DeliveryDetails } from '@/components/transactions/DeliveryDetails';
import { Timeline } from '@/components/transactions/Timeline';
import { AgentNotes } from '@/components/transactions/AgentNotes';
import { recentTrades, transactionDetailsMap } from '@/lib/mock-data';
import { notFound } from 'next/navigation';

interface TransactionDetailsPageProps {
  params: Promise<{
    id: string;
  }>;
}

export default async function TransactionDetailsPage({ params }: TransactionDetailsPageProps) {
  // Await params in Next.js 15+
  const { id } = await params;

  // Decode the ID in case it has URL encoding
  const transactionId = id;

  // Find the transaction in the recentTrades array
  const transaction = recentTrades.find(t => t.id === transactionId);

  // Get extended details from the map
  const details = transactionDetailsMap[transactionId];

  // If transaction doesn't exist, show 404
  if (!transaction || !details) {
    notFound();
  }

  return (
    <div className="bg-(--light-bg) min-h-full">
      {/* Custom Header from Figma Design */}
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
          {/* Transaction Overview - Full Width */}
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

          {/* Two Column Layout */}
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

          {/* Two Column Layout */}
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

          {/* Two Column Layout */}
          <div className="grid grid-cols-2 gap-5">
            <Timeline events={details.timeline} />
            <AgentNotes notes={details.notes} />
          </div>
        </div>
      </main>
    </div>
  );
}

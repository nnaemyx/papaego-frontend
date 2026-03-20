import React from 'react';
import { StatusBadge } from '@/components/shared/StatusBadge';
import { InfoAlert } from '@/components/shared/InfoAlert';
import { DetailRow } from '@/components/shared/DetailRow';

interface TransactionOverviewProps {
  transactionId: string;
  status: string;
  verificationStatus: string;
  customer: string;
  handledBy: string;
  transactionType: string;
  amountPaid: string;
  dateTime: string;
  message?: string;
}

export function TransactionOverview({
  transactionId,
  status,
  verificationStatus,
  customer,
  handledBy,
  transactionType,
  amountPaid,
  dateTime,
  message,
}: TransactionOverviewProps) {
  return (
    <section className="bg-white rounded-xl p-6 shadow-sm border border-(--border-light)">
      <h2 className="text-xl font-bold text-(--text-primary) mb-6">Transaction Overview</h2>
      
      <div className="grid grid-cols-2 gap-x-12 gap-y-4 mb-4">
        <DetailRow 
          label="Transaction ID:" 
          value={<span className="font-semibold">{transactionId}</span>} 
        />
        <DetailRow 
          label="Transaction Type:" 
          value={<span className="font-semibold">{transactionType}</span>} 
        />
        
        <DetailRow 
          label="Status:" 
          value={
            <StatusBadge variant={
              status === 'COMPLETED' ? 'completed' : 
              status === 'CANCELLED' ? 'error' : 
              status === 'PAYMENT_CONFIRMED' ? 'verified' : 
              'in-progress'
            }>
              {status}
            </StatusBadge>
          } 
        />
        <DetailRow 
          label="Amount Paid:" 
          value={<span className="font-bold">{amountPaid}</span>} 
        />
        
        <DetailRow 
          label="Verification Status:" 
          value={
            <StatusBadge variant="verified" icon={<span className="text-yellow-600">●</span>}>
              {verificationStatus}
            </StatusBadge>
          } 
        />
        <DetailRow 
          label="Date & Time:" 
          value={dateTime} 
        />
        
        <DetailRow 
          label="Customer:" 
          value={<span className="text-(--brand-primary) font-medium">{customer}</span>} 
        />
        <DetailRow 
          label="Handled By:" 
          value={<span className="text-(--brand-primary) font-medium">{handledBy}</span>} 
        />
      </div>

      {message && (
        <InfoAlert className="mt-4">
          {message}
        </InfoAlert>
      )}
    </section>
  );
}

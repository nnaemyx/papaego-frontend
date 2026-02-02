import React from 'react';
import { InfoAlert } from '@/components/shared/InfoAlert';
import { DetailRow } from '@/components/shared/DetailRow';
import { FileDown } from 'lucide-react';

interface PaymentMethodProps {
  paymentMethod: string;
  paymentSource: string;
  senderBank: string;
  accountName: string;
  accountNumber: string;
  paymentProof?: string;
  message?: string;
}

export function PaymentMethod({
  paymentMethod,
  paymentSource,
  senderBank,
  accountName,
  accountNumber,
  paymentProof,
  message,
}: PaymentMethodProps) {
  return (
    <section className="bg-white rounded-xl p-6 shadow-sm border border-(--border-light)">
      <h2 className="text-lg font-bold text-(--text-primary) mb-6">Payment Method & Source</h2>
      
      <div className="space-y-3">
        <DetailRow 
          label="Payment Method:" 
          value={<span className="font-semibold">{paymentMethod}</span>} 
        />
        <DetailRow 
          label="Payment Source:" 
          value={<span className="font-semibold">{paymentSource}</span>} 
        />
        <div className="h-px bg-(--border-light) my-4"></div>
        <DetailRow 
          label="Sender Bank:" 
          value={<span className="font-semibold">{senderBank}</span>} 
        />
        <DetailRow 
          label="Account Name:" 
          value={<span className="font-semibold">{accountName}</span>} 
        />
        <DetailRow 
          label="Account Number:" 
          value={<span className="font-mono font-semibold">{accountNumber}</span>} 
        />
        
        {paymentProof && (
          <>
            <div className="h-px bg-(--border-light) my-4"></div>
            <div className="flex justify-between items-center py-2">
              <span className="text-sm text-(--text-secondary)">Payment Proof:</span>
              <a 
                href={paymentProof}
                download
                className="flex items-center gap-2 text-sm font-medium text-(--brand-primary) hover:underline"
              >
                <FileDown className="w-4 h-4" />
                Bank Transfer Receipt.png
              </a>
            </div>
          </>
        )}
      </div>

      {message && (
        <InfoAlert className="mt-4">
          {message}
        </InfoAlert>
      )}
    </section>
  );
}

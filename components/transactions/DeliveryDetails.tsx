import React from 'react';
import { StatusBadge } from '@/components/shared/StatusBadge';
import { InfoAlert } from '@/components/shared/InfoAlert';
import { DetailRow } from '@/components/shared/DetailRow';

interface DeliveryDetailsProps {
  deliveryMethod: string;
  currency: string;
  recipientBank: string;
  recipientName: string;
  accountNumber: string;
  routingNumber?: string;
  swiftCode?: string;
  accountType?: string;
  recipientCountry: string;
  bankAddress: string;
  status: string;
  message?: string;
  onVerify?: () => void;
  isVerifying?: boolean;
}

export function DeliveryDetails({
  deliveryMethod,
  currency,
  recipientBank,
  recipientName,
  accountNumber,
  routingNumber,
  swiftCode,
  accountType,
  recipientCountry,
  bankAddress,
  status,
  message,
  onVerify,
  isVerifying,
}: DeliveryDetailsProps) {
  return (
    <section className="bg-white rounded-xl p-6 shadow-sm border border-(--border-light)">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-lg font-bold text-(--text-primary)">Delivery Details</h2>
        {onVerify && (
          <button
            onClick={onVerify}
            disabled={isVerifying}
            className="text-xs font-bold text-[#C9A227] hover:underline flex items-center gap-1 disabled:opacity-50"
          >
            {isVerifying ? "Verifying..." : "Verify Account"}
          </button>
        )}
      </div>

      <div className="space-y-3">
        <DetailRow
          label="Delivery Method:"
          value={<span className="font-semibold">{deliveryMethod}</span>}
        />
        <DetailRow
          label="Currency:"
          value={<span className="font-semibold">{currency}</span>}
        />
        <div className="h-px bg-(--border-light) my-4"></div>
        <DetailRow
          label="Recipient Bank:"
          value={<span className="font-semibold">{recipientBank}</span>}
        />
        <DetailRow
          label="Recipient Name:"
          value={<span className="font-semibold">{recipientName}</span>}
        />
        <DetailRow
          label="Account Number:"
          value={<span className="font-mono font-semibold">{accountNumber}</span>}
        />
        {routingNumber && (
          <DetailRow
            label="Routing Number (ACH):"
            value={<span className="font-mono">{routingNumber}</span>}
          />
        )}
        {swiftCode && (
          <DetailRow
            label="SWIFT Code:"
            value={<span className="font-mono">{swiftCode}</span>}
          />
        )}
        {accountType && (
          <DetailRow
            label="Account Type:"
            value={accountType}
          />
        )}
        <DetailRow
          label="Recipient Country:"
          value={recipientCountry}
        />
        <DetailRow
          label="Bank Address:"
          value={bankAddress}
        />
        <div className="h-px bg-(--border-light) my-4"></div>
        <DetailRow
          label="Status:"
          value={
            <StatusBadge variant="in-progress">
              {status}
            </StatusBadge>
          }
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

import React from 'react';
import { StatusBadge } from '@/components/shared/StatusBadge';
import { InfoAlert } from '@/components/shared/InfoAlert';
import { DetailRow } from '@/components/shared/DetailRow';

interface CustomerInfoProps {
  fullName: string;
  customerId: string;
  phoneNumber: string;
  emailAddress: string;
  bvnStatus: string;
  kycLevel: string;
  message?: string;
}

export function CustomerInfo({
  fullName,
  customerId,
  phoneNumber,
  emailAddress,
  bvnStatus,
  kycLevel,
  message,
}: CustomerInfoProps) {
  return (
    <section className="bg-white rounded-xl p-6 shadow-sm border border-(--border-light)">
      <h2 className="text-lg font-bold text-(--text-primary) mb-6">Customer Information</h2>
      
      <div className="space-y-3">
        <DetailRow 
          label="Full Name:" 
          value={<span className="text-(--brand-primary) font-medium">{fullName}</span>} 
        />
        <DetailRow 
          label="Customer ID:" 
          value={<span className="text-(--brand-primary) font-medium">{customerId}</span>} 
        />
        <DetailRow 
          label="Phone Number:" 
          value={phoneNumber} 
        />
        <DetailRow 
          label="Email Address:" 
          value={<span className="text-(--brand-primary)">{emailAddress}</span>} 
        />
        <DetailRow 
          label="BVN Status:" 
          value={
            <StatusBadge variant="verified" icon={<span className="text-green-600">●</span>}>
              {bvnStatus}
            </StatusBadge>
          } 
        />
        <DetailRow 
          label="KYC Level:" 
          value={
            <StatusBadge variant="completed" icon={<span className="text-green-600">●</span>}>
              {kycLevel}
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

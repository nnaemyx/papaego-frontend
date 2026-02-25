'use client';

import { Customer } from '@/lib/types/customer';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Mail, Phone, MapPin, Calendar, TrendingUp, FileText, X } from 'lucide-react';
import { formatDate } from '@/lib/formatters';

interface CustomerProfileSheetProps {
  customer: Customer | null;
  open: boolean;
  onClose: () => void;
}

const getStatusBadgeStyles = (status: Customer['verificationStatus']) => {
  switch (status) {
    case 'Verified':
      return { backgroundColor: '#e2fded', color: '#27ae60' };
    case 'Pending':
      return { backgroundColor: '#fff4e5', color: '#f39c12' };
    case 'Failed':
      return { backgroundColor: '#ffe5e5', color: '#e05555' };
  }
};

export function CustomerProfileSheet({ customer, open, onClose }: CustomerProfileSheetProps) {
  if (!customer) return null;

  return (
    <Sheet open={open} onOpenChange={onClose}>
      <SheetContent className="w-full sm:max-w-[540px] overflow-y-auto">
        <SheetHeader className="mb-6">
          <div className="flex items-start justify-between">
            <SheetTitle className="text-2xl font-bold" style={{ color: 'var(--text-primary)' }}>
              Customer Profile
            </SheetTitle>
          </div>
        </SheetHeader>

        {/* Customer Info Card */}
        <div className="mb-6 p-6 rounded-xl border border-(--border-custom) bg-gray-50">
          <div className="flex items-start gap-4 mb-4">
            <div className="w-16 h-16 rounded-full bg-gray-200 flex items-center justify-center shrink-0">
              <img
                src={`https://i.pravatar.cc/64?u=${customer.email}`}
                alt={customer.name}
                className="w-full h-full rounded-full object-cover"
              />
            </div>
            <div className="flex-1">
              <h3 className="text-xl font-bold mb-1" style={{ color: 'var(--text-primary)' }}>
                {customer.name}
              </h3>
              <p className="text-sm mb-2" style={{ color: 'var(--text-secondary)' }}>
                {customer.customerId}
              </p>
              <Badge
                className="font-medium px-3 py-1"
                style={getStatusBadgeStyles(customer.verificationStatus)}
              >
                {customer.verificationStatus}
              </Badge>
            </div>
          </div>

          <Separator className="my-4" />

          {/* Contact Information */}
          <div className="space-y-3">
            <div className="flex items-center gap-3">
              <Mail size={18} style={{ color: 'var(--text-secondary)' }} />
              <span className="text-sm" style={{ color: 'var(--text-secondary)' }}>
                {customer.email}
              </span>
            </div>
            <div className="flex items-center gap-3">
              <Phone size={18} style={{ color: 'var(--text-secondary)' }} />
              <span className="text-sm" style={{ color: 'var(--text-secondary)' }}>
                {customer.phone}
              </span>
            </div>
            {customer.address && (
              <div className="flex items-start gap-3">
                <MapPin size={18} className="mt-0.5" style={{ color: 'var(--text-secondary)' }} />
                <span className="text-sm" style={{ color: 'var(--text-secondary)' }}>
                  {customer.address}
                </span>
              </div>
            )}
            <div className="flex items-center gap-3">
              <Calendar size={18} style={{ color: 'var(--text-secondary)' }} />
              <span className="text-sm" style={{ color: 'var(--text-secondary)' }}>
                Joined {formatDate(customer.dateJoined)}
              </span>
            </div>
          </div>
        </div>

        {/* Statistics */}
        <div className="grid grid-cols-2 gap-4 mb-6">
          <div className="p-4 rounded-xl border border-(--border-custom) bg-white">
            <div className="flex items-center gap-2 mb-2">
              <TrendingUp size={20} style={{ color: 'var(--brand-primary)' }} />
              <p className="text-xs" style={{ color: 'var(--text-secondary)' }}>
                Total Transactions
              </p>
            </div>
            <p className="text-2xl font-bold" style={{ color: 'var(--text-primary)' }}>
              {customer.totalTransactions}
            </p>
          </div>
          <div className="p-4 rounded-xl border border-(--border-custom) bg-white">
            <div className="flex items-center gap-2 mb-2">
              <FileText size={20} style={{ color: 'var(--status-success)' }} />
              <p className="text-xs" style={{ color: 'var(--text-secondary)' }}>
                Activity Level
              </p>
            </div>
            <p className="text-2xl font-bold" style={{ color: 'var(--text-primary)' }}>
              {customer.activityLevel || 'N/A'}
            </p>
          </div>
        </div>

        {/* Recent Transactions Section */}
        <div className="mb-6">
          <h4 className="text-lg font-bold mb-4" style={{ color: 'var(--text-primary)' }}>
            Recent Transactions
          </h4>
          <div className="p-6 rounded-xl border border-(--border-custom) bg-gray-50 text-center">
            <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
              No recent transactions
            </p>
          </div>
        </div>

        {/* Notes Section */}
        <div className="mb-6">
          <h4 className="text-lg font-bold mb-4" style={{ color: 'var(--text-primary)' }}>
            Notes
          </h4>
          <div className="p-6 rounded-xl border border-(--border-custom) bg-gray-50">
            <p className="text-sm mb-4" style={{ color: 'var(--text-secondary)' }}>
              Add notes about this customer...
            </p>
            <Button
              className="w-full"
              style={{
                backgroundColor: 'var(--brand-primary)',
                color: '#ffffff',
              }}
            >
              Add Note
            </Button>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-3">
          <Button
            variant="outline"
            className="flex-1"
            onClick={onClose}
          >
            Close
          </Button>
          <Button
            className="flex-1"
            style={{
              backgroundColor: 'var(--brand-primary)',
              color: '#ffffff',
            }}
          >
            View Full History
          </Button>
        </div>
      </SheetContent>
    </Sheet>
  );
}

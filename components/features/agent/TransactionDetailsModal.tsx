'use client';

import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { User, Calendar, CreditCard, TrendingUp, FileText } from 'lucide-react';
import { formatDate } from '@/lib/formatters';
import type { AgentTrade } from '@/lib/types/agent';

interface TransactionDetailsModalProps {
  transaction: AgentTrade | null;
  open: boolean;
  onClose: () => void;
}

const getStatusBadgeStyles = (status: string) => {
  switch (status) {
    case 'Completed':
      return { backgroundColor: '#e2fded', color: '#27ae60' };
    case 'In Progress':
      return { backgroundColor: '#fff4e5', color: '#f39c12' };
    case 'Pending':
      return { backgroundColor: '#e5f3ff', color: '#3498db' };
    case 'Cancelled':
      return { backgroundColor: '#ffe5e5', color: '#e05555' };
    default:
      return { backgroundColor: '#f0f0f0', color: '#6b7078' };
  }
};

export function TransactionDetailsModal({ transaction, open, onClose }: TransactionDetailsModalProps) {
  if (!transaction) return null;

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold" style={{ color: 'var(--text-primary)' }}>
            Transaction Details
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Transaction Header */}
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm mb-1" style={{ color: 'var(--text-secondary)' }}>
                Transaction ID
              </p>
              <p className="text-xl font-bold" style={{ color: 'var(--text-primary)' }}>
                {transaction.tradeId}
              </p>
            </div>
            <Badge
              className="font-medium px-4 py-2"
              style={getStatusBadgeStyles(transaction.status)}
            >
              {transaction.status}
            </Badge>
          </div>

          <Separator />

          {/* Transaction Info Grid */}
          <div className="grid md:grid-cols-2 gap-6">
            <div className="flex items-start gap-3">
              <User size={20} className="mt-0.5" style={{ color: 'var(--text-secondary)' }} />
              <div>
                <p className="text-xs mb-1" style={{ color: 'var(--text-secondary)' }}>
                  Customer
                </p>
                <p className="font-semibold" style={{ color: 'var(--text-primary)' }}>
                  {transaction.customer}
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <Calendar size={20} className="mt-0.5" style={{ color: 'var(--text-secondary)' }} />
              <div>
                <p className="text-xs mb-1" style={{ color: 'var(--text-secondary)' }}>
                  Transaction Date
                </p>
                <p className="font-semibold" style={{ color: 'var(--text-primary)' }}>
                  {formatDate(transaction.date)}
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <TrendingUp size={20} className="mt-0.5" style={{ color: 'var(--text-secondary)' }} />
              <div>
                <p className="text-xs mb-1" style={{ color: 'var(--text-secondary)' }}>
                  Transaction Type
                </p>
                <p className="font-semibold" style={{ color: 'var(--text-primary)' }}>
                  {transaction.transaction}
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <CreditCard size={20} className="mt-0.5" style={{ color: 'var(--text-secondary)' }} />
              <div>
                <p className="text-xs mb-1" style={{ color: 'var(--text-secondary)' }}>
                  Payment Method
                </p>
                <p className="font-semibold" style={{ color: 'var(--text-primary)' }}>
                  {transaction.paymentMethod || 'Bank Transfer'}
                </p>
              </div>
            </div>
          </div>

          <Separator />

          {/* Amount Breakdown */}
          <div className="p-6 rounded-xl bg-gray-50">
            <h3 className="font-bold mb-4" style={{ color: 'var(--text-primary)' }}>
              Amount Breakdown
            </h3>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span style={{ color: 'var(--text-secondary)' }}>Transaction Amount</span>
                <span className="font-semibold text-lg" style={{ color: 'var(--text-primary)' }}>
                  {transaction.amount}
                </span>
              </div>
              {transaction.commission && (
                <>
                  <div className="flex justify-between items-center">
                    <span style={{ color: 'var(--text-secondary)' }}>Your Commission (2.5%)</span>
                    <span className="font-semibold" style={{ color: 'var(--status-success)' }}>
                      {transaction.commission}
                    </span>
                  </div>
                  <Separator />
                  <div className="flex justify-between items-center">
                    <span className="font-bold" style={{ color: 'var(--text-primary)' }}>
                      Total Earnings
                    </span>
                    <span className="font-bold text-xl" style={{ color: 'var(--brand-primary)' }}>
                      {transaction.commission}
                    </span>
                  </div>
                </>
              )}
            </div>
          </div>

          {/* Status Timeline */}
          <div>
            <h3 className="font-bold mb-4" style={{ color: 'var(--text-primary)' }}>
              Status Timeline
            </h3>
            <div className="space-y-3">
              <div className="flex items-start gap-3">
                <div
                  className="w-8 h-8 rounded-full flex items-center justify-center shrink-0"
                  style={{ backgroundColor: 'var(--status-success)' }}
                >
                  <FileText size={16} color="#ffffff" />
                </div>
                <div>
                  <p className="font-medium" style={{ color: 'var(--text-primary)' }}>
                    Transaction Initiated
                  </p>
                  <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
                    {formatDate(transaction.date)}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

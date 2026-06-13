'use client';

import { useQuery } from '@tanstack/react-query';
import { Customer } from '@/lib/types/customer';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Skeleton } from '@/components/ui/skeleton';
import { Mail, Phone, MapPin, Calendar, TrendingUp, FileText, ArrowUpRight } from 'lucide-react';
import { formatDate } from '@/lib/formatters';
import { customersApi } from '@/lib/api/customers';

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

const TRADE_STATUS_COLORS: Record<string, { bg: string; color: string }> = {
  COMPLETED:         { bg: '#E2FDED', color: '#27AE60' },
  AWAITING_PAYMENT:  { bg: '#FFF8E1', color: '#F59E0B' },
  PAYMENT_CONFIRMED: { bg: '#EFF6FF', color: '#3B82F6' },
  FLAGGED:           { bg: '#FFE5E5', color: '#E05555' },
  CANCELLED:         { bg: '#FFE5E5', color: '#E05555' },
  INITIATED:         { bg: '#F6F6F6', color: '#6B7078' },
};

export function CustomerProfileSheet({ customer, open, onClose }: CustomerProfileSheetProps) {
  // Fetch full customer details when sheet opens
  const { data: fullCustomer, isLoading: isLoadingFull } = useQuery({
    queryKey: ['agent-customer-detail', customer?.id],
    queryFn: () => customersApi.getCustomer(customer!.id),
    enabled: open && !!customer?.id,
    staleTime: 30_000,
  });

  if (!customer) return null;

  // Prefer full data, fall back to list-level data while loading
  const data = fullCustomer || customer;

  return (
    <Sheet open={open} onOpenChange={onClose}>
      <SheetContent className="w-full sm:max-w-[560px] overflow-y-auto">
        <SheetHeader className="mb-6">
          <SheetTitle className="text-2xl font-bold" style={{ color: 'var(--text-primary)' }}>
            Customer Profile
          </SheetTitle>
        </SheetHeader>

        {/* Customer Info Card */}
        <div className="mb-6 p-6 rounded-xl border border-(--border-custom) bg-gray-50">
          <div className="flex items-start gap-4 mb-4">
            <div className="w-16 h-16 rounded-full bg-gray-200 flex items-center justify-center shrink-0 overflow-hidden">
              <img
                src={`https://i.pravatar.cc/64?u=${customer.email}`}
                alt={customer.name}
                className="w-full h-full rounded-full object-cover"
              />
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="text-xl font-bold mb-1 truncate" style={{ color: 'var(--text-primary)' }}>
                {data.name}
              </h3>
              <p className="text-sm mb-2 font-mono" style={{ color: 'var(--text-secondary)' }}>
                {data.customerId}
              </p>
              <Badge
                className="font-medium px-3 py-1"
                style={getStatusBadgeStyles(data.verificationStatus)}
              >
                {data.verificationStatus}
              </Badge>
            </div>
          </div>

          <Separator className="my-4" />

          {/* Contact Information */}
          {isLoadingFull && !fullCustomer ? (
            <div className="space-y-3">
              {[1, 2, 3, 4].map((i) => (
                <Skeleton key={i} className="h-5 w-full" />
              ))}
            </div>
          ) : (
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <Mail size={18} style={{ color: 'var(--text-secondary)' }} />
                <span className="text-sm" style={{ color: 'var(--text-secondary)' }}>
                  {data.email}
                </span>
              </div>
              <div className="flex items-center gap-3">
                <Phone size={18} style={{ color: 'var(--text-secondary)' }} />
                <span className="text-sm" style={{ color: 'var(--text-secondary)' }}>
                  {data.phone || '—'}
                </span>
              </div>
              {data.address && (
                <div className="flex items-start gap-3">
                  <MapPin size={18} className="mt-0.5 shrink-0" style={{ color: 'var(--text-secondary)' }} />
                  <span className="text-sm" style={{ color: 'var(--text-secondary)' }}>
                    {data.address}
                  </span>
                </div>
              )}
              <div className="flex items-center gap-3">
                <Calendar size={18} style={{ color: 'var(--text-secondary)' }} />
                <span className="text-sm" style={{ color: 'var(--text-secondary)' }}>
                  Joined {formatDate(data.dateJoined)}
                </span>
              </div>
            </div>
          )}
        </div>

        {/* Statistics */}
        {isLoadingFull && !fullCustomer ? (
          <div className="grid grid-cols-3 gap-4 mb-6">
            <Skeleton className="h-24 rounded-xl" />
            <Skeleton className="h-24 rounded-xl" />
            <Skeleton className="h-24 rounded-xl" />
          </div>
        ) : (
          <div className="grid grid-cols-3 gap-3 mb-6">
            <div className="p-3.5 rounded-xl border border-(--border-custom) bg-white flex flex-col justify-between min-h-[90px]">
              <div className="flex items-center gap-1.5 mb-1">
                <TrendingUp size={16} style={{ color: 'var(--brand-primary)' }} />
                <p className="text-[10px] font-bold uppercase tracking-wider" style={{ color: 'var(--text-secondary)' }}>
                  Total Trades
                </p>
              </div>
              <p className="text-xl font-bold" style={{ color: 'var(--text-primary)' }}>
                {data.totalTrades ?? data.totalTransactions ?? 0}
              </p>
            </div>
            
            <div className="p-3.5 rounded-xl border border-(--border-custom) bg-white flex flex-col justify-between min-h-[90px]">
              <div className="flex items-center gap-1.5 mb-1">
                <FileText size={16} style={{ color: 'var(--status-success)' }} />
                <p className="text-[10px] font-bold uppercase tracking-wider" style={{ color: 'var(--text-secondary)' }}>
                  Activity
                </p>
              </div>
              <div>
                <span
                  className="inline-block px-2 py-0.5 rounded text-xs font-bold"
                  style={
                    data.activityStatus === 'Active'
                      ? { backgroundColor: '#e2fded', color: '#27ae60' }
                      : data.activityStatus === 'Inactive'
                      ? { backgroundColor: '#fff4e5', color: '#f39c12' }
                      : { backgroundColor: '#f1f3f4', color: '#5f6368' }
                  }
                >
                  {data.activityStatus || 'Dormant'}
                </span>
              </div>
            </div>

            <div className="p-3.5 rounded-xl border border-(--border-custom) bg-white flex flex-col justify-between min-h-[90px]">
              <div className="flex items-center gap-1.5 mb-1">
                <Calendar size={16} style={{ color: 'var(--text-secondary)' }} />
                <p className="text-[10px] font-bold uppercase tracking-wider" style={{ color: 'var(--text-secondary)' }}>
                  Last Active
                </p>
              </div>
              <p className="text-xs font-bold truncate" style={{ color: 'var(--text-primary)' }}>
                {data.lastActive || 'Never'}
              </p>
            </div>
          </div>
        )}

        {/* Recent Transactions Section */}
        <div className="mb-6">
          <h4 className="text-lg font-bold mb-4" style={{ color: 'var(--text-primary)' }}>
            Recent Transactions
          </h4>
          {isLoadingFull && !fullCustomer ? (
            <div className="space-y-2">
              {[1, 2, 3].map((i) => (
                <Skeleton key={i} className="h-14 rounded-xl" />
              ))}
            </div>
          ) : data.recentTrades && data.recentTrades.length > 0 ? (
            <div className="space-y-2">
              {data.recentTrades.slice(0, 5).map((trade: any) => {
                const tradeStatus = TRADE_STATUS_COLORS[trade.status] || { bg: '#F6F6F6', color: '#6B7078' };
                return (
                  <div
                    key={trade.id}
                    className="flex items-center justify-between p-3 rounded-xl border border-(--border-custom) bg-white"
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0"
                        style={{ backgroundColor: tradeStatus.bg }}
                      >
                        <ArrowUpRight className="w-4 h-4" style={{ color: tradeStatus.color }} />
                      </div>
                      <div>
                        <p className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>
                          {trade.amount ? `${trade.amount} ` : ''}{trade.sendCurrency} → {trade.receiveCurrency}
                        </p>
                        <p className="text-xs" style={{ color: 'var(--text-tertiary)' }}>
                          {trade.createdAt ? new Date(trade.createdAt).toLocaleDateString('en-NG', { day: '2-digit', month: 'short', year: 'numeric' }) : '—'}
                        </p>
                      </div>
                    </div>
                    <span
                      className="text-xs font-semibold px-2 py-1 rounded-full"
                      style={{ backgroundColor: tradeStatus.bg, color: tradeStatus.color }}
                    >
                      {trade.status?.replace(/_/g, ' ')}
                    </span>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="p-6 rounded-xl border border-(--border-custom) bg-gray-50 text-center">
              <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
                No recent transactions
              </p>
            </div>
          )}
        </div>

        {/* Action Buttons */}
        <div className="flex gap-3">
          <Button variant="outline" className="flex-1" onClick={onClose}>
            Close
          </Button>
        </div>
      </SheetContent>
    </Sheet>
  );
}

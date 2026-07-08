'use client';

import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { PooledRequests } from '@/components/dashboard/PooledRequests';
import { agentApi } from '@/lib/api/agent';
import { customerApi } from '@/lib/api/customer';
import { useAuthStore } from '@/store/auth-store';
import { commissionsApi } from '@/lib/api/commissions';
import {
  Users, TrendingUp, Wallet, Activity, UserCheck,
  RefreshCw, ArrowRight, CheckCircle, Clock,
  Link2, BarChart3, UserPlus,
} from 'lucide-react';
import Link from 'next/link';

// ─── KPI Card ───────────────────────────────────────────────────────────────
function KpiCard({
  title, value, subtitle, icon: Icon, color,
}: {
  title: string; value: string; subtitle: string;
  icon: React.ElementType; color: string;
}) {
  return (
    <div className="rounded-xl border bg-white p-5 shadow-[0px_10px_30px_rgba(206,206,206,0.25)]" style={{ borderColor: 'var(--border-custom)' }}>
      <div className="flex items-center justify-between mb-3">
        <p className="text-sm font-semibold" style={{ color: 'var(--text-secondary)' }}>{title}</p>
        <div className="w-9 h-9 rounded-lg flex items-center justify-center" style={{ backgroundColor: `${color}20` }}>
          <Icon size={18} style={{ color }} />
        </div>
      </div>
      <p className="text-2xl font-bold mb-0.5" style={{ color: 'var(--text-primary)' }}>{value}</p>
      <p className="text-xs" style={{ color: 'var(--text-tertiary)' }}>{subtitle}</p>
    </div>
  );
}

// ─── Activity Pill ───────────────────────────────────────────────────────────
function ActivityPill({
  label, count, total, color, bg,
}: {
  label: string; count: number; total: number; color: string; bg: string;
}) {
  const pct = total > 0 ? Math.round((count / total) * 100) : 0;
  return (
    <div className="flex flex-col gap-2 p-4 rounded-xl" style={{ backgroundColor: bg }}>
      <div className="flex items-center justify-between">
        <span className="text-xs font-bold uppercase tracking-wider" style={{ color }}>{label}</span>
        <span className="text-sm font-bold" style={{ color: 'var(--text-primary)' }}>{count}</span>
      </div>
      <div className="w-full h-1.5 rounded-full bg-white/60">
        <div
          className="h-1.5 rounded-full transition-all duration-500"
          style={{ width: `${pct}%`, backgroundColor: color }}
        />
      </div>
      <span className="text-[10px] font-medium" style={{ color }}>{pct}% of customers</span>
    </div>
  );
}

// ─── Status badge map ────────────────────────────────────────────────────────
const STATUS_STYLE: Record<string, { bg: string; text: string }> = {
  'Completed':   { bg: '#E2FDED', text: '#27AE60' },
  'In Progress': { bg: '#EFF6FF', text: '#3B82F6' },
  'Pending':     { bg: '#FFF8E1', text: '#F59E0B' },
  'Cancelled':   { bg: '#FEE2E2', text: '#EB5757' },
};

const CASHOUT_STATUS_STYLE: Record<string, { bg: string; text: string }> = {
  'PENDING':   { bg: '#FFF8E1', text: '#F59E0B' },
  'APPROVED':  { bg: '#EFF6FF', text: '#3B82F6' },
  'PAID':      { bg: '#E2FDED', text: '#27AE60' },
  'REJECTED':  { bg: '#FEE2E2', text: '#EB5757' },
};

// ─── Dashboard ───────────────────────────────────────────────────────────────
export default function AgentDashboard() {
  const user = useAuthStore((s) => s.user);
  const agentName = user?.firstName || user?.email?.split('@')[0] || 'Agent';

  const { data: dashboardStats, isLoading: statsLoading } = useQuery({
    queryKey: ['agent-dashboard-stats'],
    queryFn: agentApi.getDashboardStats,
  });

  const { data: customerMetrics, isLoading: metricsLoading } = useQuery({
    queryKey: ['agent-customer-metrics'],
    queryFn: agentApi.getCustomerMetrics,
  });

  const { data: tradesData, isLoading: tradesLoading } = useQuery({
    queryKey: ['agent-recent-trades'],
    queryFn: () => agentApi.getTrades({ limit: 50, page: 1 }),
  });

  const { data: commissions = [], isLoading: commissionsLoading, refetch: refetchCommissions } = useQuery({
    queryKey: ['agent-commissions'],
    queryFn: agentApi.getCommissions,
  });

  const { data: ratesData, isLoading: ratesLoading, refetch: refetchRates } = useQuery({
    queryKey: ['agent-fx-rates'],
    queryFn: agentApi.getFxRates,
    staleTime: 60_000,
  });

  // Cashout State & Queries
  const [isSubmittingCashout, setIsSubmittingCashout] = useState(false);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [toastMessage, setToastMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const { data: cashoutStatus, refetch: refetchCashoutStatus } = useQuery({
    queryKey: ['agent-cashout-status'],
    queryFn: agentApi.getCashoutStatus,
  });

  useEffect(() => {
    if (toastMessage) {
      const timer = setTimeout(() => {
        setToastMessage(null);
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [toastMessage]);

  const isFriday = new Date().getDay() === 5;
  const bypassFriday = process.env.NEXT_PUBLIC_BYPASS_FRIDAY_CHECK === 'true' || process.env.NODE_ENV === 'development';
  const canRequest = isFriday || bypassFriday;
  const activeRequest = cashoutStatus?.lastRequest && ['PENDING', 'APPROVED'].includes(cashoutStatus.lastRequest.status);

  const handleConfirmCashout = async () => {
    setIsSubmittingCashout(true);
    try {
      await agentApi.requestCashout();
      setToastMessage({
        type: 'success',
        text: 'Cashout request submitted successfully. Your request is awaiting review.'
      });
      setShowConfirmModal(false);
      refetchCashoutStatus();
      refetchCommissions();
    } catch (err: any) {
      const errMsg = err?.response?.data?.error || err?.message || 'Failed to submit cashout request';
      setToastMessage({
        type: 'error',
        text: errMsg
      });
    } finally {
      setIsSubmittingCashout(false);
    }
  };

  const trades = tradesData?.trades || [];

  const parseAmt = (v: any) =>
    parseFloat(String(v || '0').replace(/[₦,]/g, '')) || 0;

  const now = new Date();
  const commissionITD = (commissions as any[])
    .filter((c) => c.status === 'PAID')
    .reduce((s, c) => s + parseAmt(c.amount), 0);

  const commissionThisMonth = (commissions as any[])
    .filter((c) => {
      const d = new Date(c.createdAt || c.date || '');
      return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
    })
    .reduce((s, c) => s + parseAmt(c.amount), 0);

  const commissionPending = (commissions as any[])
    .filter((c) => c.status === 'PENDING')
    .reduce((s, c) => s + parseAmt(c.amount), 0);

  const rates = ratesData || [];

  // Customer metrics
  const totalCustomers = dashboardStats?.totalCustomers ?? customerMetrics?.totalCustomers ?? 0;
  const activeCustomers = dashboardStats?.activeCustomers ?? customerMetrics?.activeCustomers ?? 0;
  const referredCustomers = dashboardStats?.referredCustomers ?? customerMetrics?.referredCustomers ?? 0;
  const inactiveCustomers = customerMetrics?.inactiveCustomers ?? 0;
  const dormantCustomers = customerMetrics?.dormantCustomers ?? 0;

  return (
    <div className="p-4 md:p-6 lg:pl-7 lg:pr-6 space-y-8" style={{ backgroundColor: '#f7f8f9', minHeight: '100%' }}>
      {/* Welcome */}
      <div>
        <h1 className="text-2xl md:text-3xl lg:text-4xl font-bold mb-1.5" style={{ color: 'var(--text-primary)' }}>
          Hello, {agentName}!
        </h1>
        <p className="text-sm md:text-base" style={{ color: 'var(--text-secondary)' }}>
          Here&apos;s your performance overview — customers, commissions, and live rates
        </p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <KpiCard
          title="Total Customers"
          value={(statsLoading || metricsLoading) ? '—' : totalCustomers.toLocaleString()}
          subtitle="Referred &amp; traded customers"
          icon={Users}
          color="#3B82F6"
        />
        <KpiCard
          title="Active Customers"
          value={(statsLoading || metricsLoading) ? '—' : activeCustomers.toLocaleString()}
          subtitle="Traded in last 30 days"
          icon={Activity}
          color="#27AE60"
        />
        <KpiCard
          title="Commission Earned"
          value={commissionsLoading ? '—' : `₦${commissionITD.toLocaleString()}`}
          subtitle="Inception to date (paid)"
          icon={Wallet}
          color="#C9A227"
        />
        <KpiCard
          title="This Month"
          value={commissionsLoading ? '—' : `₦${commissionThisMonth.toLocaleString()}`}
          subtitle={`Commission — ${now.toLocaleString('default', { month: 'long' })}`}
          icon={TrendingUp}
          color="#8B5CF6"
        />
      </div>

      {/* Customer Activity Overview + Referred */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Activity Breakdown */}
        <div className="lg:col-span-2 bg-white rounded-xl border shadow-sm p-6" style={{ borderColor: 'var(--border-custom)' }}>
          <div className="flex items-center justify-between mb-5">
            <div>
              <h2 className="font-bold text-base" style={{ color: 'var(--text-primary)' }}>Customer Activity Overview</h2>
              <p className="text-xs mt-0.5" style={{ color: 'var(--text-tertiary)' }}>Active (≤30d) · Inactive (31–90d) · Dormant (90d+)</p>
            </div>
            <Link href="/agent/customers" className="flex items-center gap-1 text-xs font-semibold px-3 py-1.5 rounded-lg" style={{ color: 'var(--brand-primary)', backgroundColor: '#FBF4DC' }}>
              All Customers <ArrowRight size={12} />
            </Link>
          </div>

          {(metricsLoading || statsLoading) ? (
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-20 bg-gray-100 rounded-xl animate-pulse" />
              ))}
            </div>
          ) : totalCustomers === 0 ? (
            <div className="flex flex-col items-center justify-center py-10 text-center">
              <Users size={36} className="mb-3 opacity-20" style={{ color: 'var(--text-tertiary)' }} />
              <p className="font-medium text-sm" style={{ color: 'var(--text-secondary)' }}>No customers yet</p>
              <p className="text-xs mt-1" style={{ color: 'var(--text-tertiary)' }}>Share your referral link or execute a trade to add customers</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <ActivityPill
                label="Active"
                count={activeCustomers}
                total={totalCustomers}
                color="#27AE60"
                bg="#E2FDED"
              />
              <ActivityPill
                label="Inactive"
                count={inactiveCustomers}
                total={totalCustomers}
                color="#F59E0B"
                bg="#FFF8E1"
              />
              <ActivityPill
                label="Dormant"
                count={dormantCustomers}
                total={totalCustomers}
                color="#9CA3AF"
                bg="#F1F3F4"
              />
            </div>
          )}

          {/* Total row */}
          {!metricsLoading && !statsLoading && totalCustomers > 0 && (
            <div className="mt-4 flex items-center justify-between px-4 py-3 rounded-xl" style={{ backgroundColor: '#F7F8F9' }}>
              <div className="flex items-center gap-2">
                <BarChart3 size={16} style={{ color: 'var(--brand-primary)' }} />
                <span className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>Total Customers</span>
              </div>
              <span className="text-sm font-bold" style={{ color: 'var(--text-primary)' }}>{totalCustomers}</span>
            </div>
          )}
        </div>

        {/* Referral Stats */}
        <div className="bg-white rounded-xl border shadow-sm p-6 flex flex-col" style={{ borderColor: 'var(--border-custom)' }}>
          <div className="mb-5">
            <h2 className="font-bold text-base" style={{ color: 'var(--text-primary)' }}>Referral Performance</h2>
            <p className="text-xs mt-0.5" style={{ color: 'var(--text-tertiary)' }}>Customers from your referral link</p>
          </div>

          <div className="flex-1 flex flex-col gap-4">
            {/* Referred count */}
            <div className="rounded-xl p-4 flex items-center gap-4" style={{ background: 'linear-gradient(135deg, #EFF6FF 0%, #F5F8FF 100%)' }}>
              <div className="w-11 h-11 rounded-xl flex items-center justify-center shrink-0" style={{ backgroundColor: '#3B82F6' }}>
                <UserPlus size={20} className="text-white" />
              </div>
              <div>
                <p className="text-xs font-semibold mb-0.5" style={{ color: '#1D4ED8' }}>Referred Customers</p>
                <p className="text-2xl font-bold" style={{ color: 'var(--text-primary)' }}>
                  {(statsLoading || metricsLoading) ? '—' : referredCustomers}
                </p>
                <p className="text-xs" style={{ color: 'var(--text-secondary)' }}>via your referral link</p>
              </div>
            </div>

            {/* Verification rate */}
            {!metricsLoading && totalCustomers > 0 && (
              <div className="rounded-xl p-4 flex items-center gap-4" style={{ background: 'linear-gradient(135deg, #E2FDED 0%, #F0FDF4 100%)' }}>
                <div className="w-11 h-11 rounded-xl flex items-center justify-center shrink-0" style={{ backgroundColor: '#27AE60' }}>
                  <UserCheck size={20} className="text-white" />
                </div>
                <div>
                  <p className="text-xs font-semibold mb-0.5" style={{ color: '#27AE60' }}>Verified Customers</p>
                  <p className="text-2xl font-bold" style={{ color: 'var(--text-primary)' }}>
                    {customerMetrics?.verifiedCustomers ?? 0}
                  </p>
                  <p className="text-xs" style={{ color: 'var(--text-secondary)' }}>KYC approved</p>
                </div>
              </div>
            )}

            <Link
              href="/agent/customers"
              className="mt-auto flex items-center justify-center gap-2 text-sm font-semibold py-2.5 rounded-xl border-2 transition-colors hover:bg-opacity-80"
              style={{ borderColor: 'var(--brand-primary)', color: 'var(--brand-primary)', backgroundColor: '#FBF4DC' }}
            >
              <Link2 size={14} /> View All Customers
            </Link>
          </div>
        </div>
      </div>

      {/* Main grid — Trades + Rates */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Customer Transactions Table */}
        <div className="lg:col-span-2 bg-white rounded-xl border shadow-sm overflow-hidden" style={{ borderColor: 'var(--border-custom)' }}>
          <div className="flex items-center justify-between px-6 py-4 border-b" style={{ borderColor: 'var(--border-light)' }}>
            <div>
              <h2 className="font-bold text-base" style={{ color: 'var(--text-primary)' }}>Recent Transactions</h2>
              <p className="text-xs mt-0.5" style={{ color: 'var(--text-tertiary)' }}>View-only summary of trades under your account</p>
            </div>
            <Link href="/agent/transactions" className="flex items-center gap-1 text-xs font-semibold px-3 py-1.5 rounded-lg" style={{ color: 'var(--brand-primary)', backgroundColor: '#FBF4DC' }}>
              View All <ArrowRight size={12} />
            </Link>
          </div>

          {tradesLoading ? (
            <div className="p-6 space-y-3">
              {Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="h-11 bg-gray-100 rounded-lg animate-pulse" />
              ))}
            </div>
          ) : trades.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 px-6 text-center">
              <Activity size={40} className="mb-3 opacity-20" style={{ color: 'var(--text-tertiary)' }} />
              <p className="font-medium" style={{ color: 'var(--text-secondary)' }}>No transactions yet</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr style={{ backgroundColor: '#F7F8F9' }}>
                    {['Customer', 'Transaction', 'Amount', 'Date', 'Status'].map((h) => (
                      <th key={h} className="px-5 py-3 text-xs font-bold uppercase tracking-wider" style={{ color: 'var(--text-tertiary)' }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {trades.slice(0, 10).map((trade: any) => {
                    const s = STATUS_STYLE[trade.status] || { bg: '#F2F4F7', text: '#667085' };
                    return (
                      <tr key={trade.id} className="border-t hover:bg-gray-50/50 transition-colors" style={{ borderColor: 'var(--border-light)' }}>
                        <td className="px-5 py-3.5 text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>{trade.customer}</td>
                        <td className="px-5 py-3.5 text-sm" style={{ color: 'var(--text-secondary)' }}>{trade.transaction}</td>
                        <td className="px-5 py-3.5 text-sm font-bold" style={{ color: 'var(--text-primary)' }}>{trade.amount}</td>
                        <td className="px-5 py-3.5 text-xs" style={{ color: 'var(--text-tertiary)' }}>{trade.date}</td>
                        <td className="px-5 py-3.5">
                          <span className="text-xs font-bold px-2.5 py-1 rounded-full" style={{ backgroundColor: s.bg, color: s.text }}>{trade.status}</span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Mini Rates Panel */}
        <div className="bg-white rounded-xl border shadow-sm overflow-hidden flex flex-col" style={{ borderColor: 'var(--border-custom)' }}>
          <div className="flex items-center justify-between px-4 py-4 border-b" style={{ borderColor: 'var(--border-light)' }}>
            <div>
              <h2 className="font-bold text-base" style={{ color: 'var(--text-primary)' }}>Live Rates</h2>
              <p className="text-xs mt-0.5" style={{ color: 'var(--text-tertiary)' }}>Admin-set exchange rates</p>
            </div>
            <div className="flex items-center gap-2">
              <button onClick={() => refetchRates()} className="p-1.5 rounded-lg hover:bg-gray-50 transition-colors">
                <RefreshCw size={14} style={{ color: 'var(--brand-primary)' }} />
              </button>
              <Link href="/agent/rates" className="text-xs font-semibold px-2.5 py-1.5 rounded-lg" style={{ color: 'var(--brand-primary)', backgroundColor: '#FBF4DC' }}>
                See All
              </Link>
            </div>
          </div>

          <div className="p-4 space-y-3 flex-1">
            {ratesLoading ? (
              Array.from({ length: 5 }).map((_, i) => (
                <div key={i} className="h-12 bg-gray-100 rounded-lg animate-pulse" />
              ))
            ) : rates.length === 0 ? (
              <div className="py-8 text-center">
                <p className="text-sm" style={{ color: 'var(--text-tertiary)' }}>Rates unavailable</p>
              </div>
            ) : (
              rates.slice(0, 5).map((rate: any) => {
                const [from] = rate.pair.split('/');
                return (
                  <div key={rate.pair} className="flex items-center justify-between p-3 rounded-lg" style={{ backgroundColor: '#F7F8F9' }}>
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold shrink-0" style={{ backgroundColor: '#012333', color: '#C9A227' }}>
                        {from}
                      </div>
                      <span className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>{rate.pair}</span>
                    </div>
                    <div className="text-right">
                      <p className="text-xs font-bold" style={{ color: '#27AE60' }}>₦{rate.buy.toLocaleString()}</p>
                      <p className="text-[10px]" style={{ color: 'var(--text-tertiary)' }}>Buy</p>
                    </div>
                  </div>
                );
              })
            )}
          </div>

          <div className="px-4 pb-4">
            <p className="text-xs p-2.5 rounded-lg" style={{ backgroundColor: '#FFF8E1', color: '#A97600' }}>
              💡 Rates are set and managed by administrators.
            </p>
          </div>
        </div>
      </div>

      {/* Commission Breakdown & Cashout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Commission Cards */}
        <div className="lg:col-span-2 bg-white rounded-xl border shadow-sm p-6" style={{ borderColor: 'var(--border-custom)' }}>
          <div className="flex items-center justify-between mb-5">
            <div>
              <h2 className="font-bold text-base" style={{ color: 'var(--text-primary)' }}>Commission Breakdown</h2>
              <p className="text-xs mt-0.5" style={{ color: 'var(--text-tertiary)' }}>Your earnings summary and payout status</p>
            </div>
            <Link href="/agent/commissions" className="flex items-center gap-1 text-xs font-semibold px-3 py-1.5 rounded-lg" style={{ color: 'var(--brand-primary)', backgroundColor: '#FBF4DC' }}>
              Full Report <ArrowRight size={12} />
            </Link>
          </div>

          {commissionsLoading ? (
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="h-24 bg-gray-100 rounded-xl animate-pulse" />
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="rounded-xl p-4 flex items-center gap-4" style={{ background: 'linear-gradient(135deg, #E2FDED 0%, #F0FDF4 100%)' }}>
                <div className="w-11 h-11 rounded-xl flex items-center justify-center shrink-0" style={{ backgroundColor: '#27AE60' }}>
                  <CheckCircle size={20} className="text-white" />
                </div>
                <div>
                  <p className="text-xs font-semibold mb-0.5" style={{ color: '#27AE60' }}>Total Earned (ITD)</p>
                  <p className="text-xl font-bold" style={{ color: 'var(--text-primary)' }}>₦{commissionITD.toLocaleString()}</p>
                  <p className="text-xs" style={{ color: 'var(--text-secondary)' }}>Paid commissions</p>
                </div>
              </div>

              <div className="rounded-xl p-4 flex items-center gap-4" style={{ background: 'linear-gradient(135deg, #FFF8E1 0%, #FFFDF0 100%)' }}>
                <div className="w-11 h-11 rounded-xl flex items-center justify-center shrink-0" style={{ backgroundColor: '#C9A227' }}>
                  <TrendingUp size={20} className="text-white" />
                </div>
                <div>
                  <p className="text-xs font-semibold mb-0.5" style={{ color: '#A97600' }}>This Month</p>
                  <p className="text-xl font-bold" style={{ color: 'var(--text-primary)' }}>₦{commissionThisMonth.toLocaleString()}</p>
                  <p className="text-xs" style={{ color: 'var(--text-secondary)' }}>{now.toLocaleString('default', { month: 'long', year: 'numeric' })}</p>
                </div>
              </div>

              <div className="rounded-xl p-4 flex items-center gap-4" style={{ background: 'linear-gradient(135deg, #EFF6FF 0%, #F5F8FF 100%)' }}>
                <div className="w-11 h-11 rounded-xl flex items-center justify-center shrink-0" style={{ backgroundColor: '#3B82F6' }}>
                  <Clock size={20} className="text-white" />
                </div>
                <div>
                  <p className="text-xs font-semibold mb-0.5" style={{ color: '#1D4ED8' }}>Pending Payout</p>
                  <p className="text-xl font-bold" style={{ color: 'var(--text-primary)' }}>₦{commissionPending.toLocaleString()}</p>
                  <p className="text-xs" style={{ color: 'var(--text-secondary)' }}>Awaiting approval</p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Cashout Request Widget */}
        <div className="bg-white rounded-xl border shadow-sm p-6 flex flex-col justify-between" style={{ borderColor: 'var(--border-custom)' }}>
          <div>
            <h2 className="font-bold text-base mb-1" style={{ color: 'var(--text-primary)' }}>Request Cashout</h2>
            <p className="text-xs" style={{ color: 'var(--text-tertiary)' }}>Withdraw your available commission balance</p>
          </div>

          <div className="my-4 space-y-3">
            {/* Available Balance display */}
            <div className="rounded-xl p-4 flex flex-col justify-between" style={{ background: 'linear-gradient(135deg, #EFF6FF 0%, #F5F8FF 100%)' }}>
              <span className="text-xs font-semibold" style={{ color: '#1D4ED8' }}>Available Balance</span>
              <span className="text-2xl font-bold mt-1" style={{ color: 'var(--text-primary)' }}>₦{commissionPending.toLocaleString()}</span>
            </div>

            {/* Last request status if exists */}
            {cashoutStatus?.lastRequest && (
              <div className="rounded-xl p-3 border border-gray-100 bg-gray-50/50 space-y-2">
                <div className="flex justify-between items-center text-xs">
                  <span className="font-semibold text-gray-500">Last Request:</span>
                  <span className="font-bold text-gray-700">₦{Number(cashoutStatus.lastRequest.amount).toLocaleString()}</span>
                </div>
                <div className="flex justify-between items-center text-xs">
                  <span className="text-gray-400">{new Date(cashoutStatus.lastRequest.createdAt).toLocaleDateString('en-GB')}</span>
                  <span className="px-2 py-0.5 rounded-full font-bold text-[10px]" style={{
                    backgroundColor: CASHOUT_STATUS_STYLE[cashoutStatus.lastRequest.status]?.bg || '#F3F4F6',
                    color: CASHOUT_STATUS_STYLE[cashoutStatus.lastRequest.status]?.text || '#374151'
                  }}>
                    {cashoutStatus.lastRequest.status}
                  </span>
                </div>
                {cashoutStatus.lastRequest.notes && (
                  <p className="text-[10px] text-gray-500 italic mt-1 border-t pt-1 border-gray-100">
                    Note: {cashoutStatus.lastRequest.notes}
                  </p>
                )}
              </div>
            )}

            {/* Alerts / Explanatory notices */}
            {activeRequest ? (
              <p className="text-xs text-amber-600 font-medium bg-amber-50 p-2.5 rounded-lg flex items-start gap-1.5">
                <span>⚠️</span>
                <span>You already have an active request awaiting review.</span>
              </p>
            ) : commissionPending <= 0 ? (
              <p className="text-xs text-gray-500 font-medium bg-gray-50 p-2.5 rounded-lg flex items-start gap-1.5">
                <span>💡</span>
                <span>No pending commission available to cash out.</span>
              </p>
            ) : !canRequest ? (
              <p className="text-xs text-amber-600 font-medium bg-amber-50 p-2.5 rounded-lg flex items-start gap-1.5">
                <span>📅</span>
                <span>Cashout requests are only available on Fridays.</span>
              </p>
            ) : null}
          </div>

          <button
            onClick={() => setShowConfirmModal(true)}
            disabled={activeRequest || commissionPending <= 0 || !canRequest || isSubmittingCashout}
            className="w-full text-center text-sm font-semibold py-2.5 rounded-xl transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed text-white hover:bg-opacity-95"
            style={{ backgroundColor: 'var(--brand-primary)' }}
          >
            {isSubmittingCashout ? 'Submitting...' : 'Request Cashout'}
          </button>
        </div>
      </div>

      {/* Confirmation Modal */}
      {showConfirmModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-xl border border-gray-100 animate-in fade-in zoom-in duration-200">
            <h3 className="text-lg font-bold mb-2 text-gray-900">Confirm Cashout</h3>
            <p className="text-sm text-gray-600 mb-6">
              You are about to request withdrawal of your available commission balance. 
              Amount: <span className="font-bold text-gray-900">₦{commissionPending.toLocaleString()}</span>. 
              Do you want to continue?
            </p>
            <div className="flex gap-3 justify-end">
              <button
                onClick={() => setShowConfirmModal(false)}
                disabled={isSubmittingCashout}
                className="px-4 py-2 rounded-xl text-sm font-semibold border border-gray-300 hover:bg-gray-50 transition-colors disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmCashout}
                disabled={isSubmittingCashout}
                className="px-4 py-2 rounded-xl text-sm font-semibold text-white transition-all disabled:opacity-50"
                style={{ backgroundColor: 'var(--brand-primary)' }}
              >
                {isSubmittingCashout ? 'Processing...' : 'Confirm Request'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Toast Alert */}
      {toastMessage && (
        <div className={`fixed bottom-4 right-4 z-50 px-4 py-3 rounded-xl shadow-lg border text-sm font-semibold transition-all duration-300 animate-in fade-in slide-in-from-bottom-5 ${
          toastMessage.type === 'success'
            ? 'bg-green-50 text-green-800 border-green-200'
            : 'bg-red-50 text-red-800 border-red-200'
        }`}>
          {toastMessage.text}
        </div>
      )}

      {/* Pooled Requests */}
      <PooledRequests />
    </div>
  );
}

'use client';

import { useQuery } from '@tanstack/react-query';
import { PooledRequests } from '@/components/dashboard/PooledRequests';
import { agentApi } from '@/lib/api/agent';
import { customerApi } from '@/lib/api/customer';
import { useAuthStore } from '@/store/auth-store';
import { commissionsApi } from '@/lib/api/commissions';
import {
  Users, TrendingUp, Wallet, Activity,
  RefreshCw, ArrowRight, CheckCircle, Clock, AlertCircle,
} from 'lucide-react';
import Link from 'next/link';

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

const STATUS_STYLE: Record<string, { bg: string; text: string }> = {
  'Completed':   { bg: '#E2FDED', text: '#27AE60' },
  'In Progress': { bg: '#EFF6FF', text: '#3B82F6' },
  'Pending':     { bg: '#FFF8E1', text: '#F59E0B' },
  'Cancelled':   { bg: '#FEE2E2', text: '#EB5757' },
};

export default function AgentDashboard() {
  const user = useAuthStore((s) => s.user);
  const agentName = user?.firstName || user?.email?.split('@')[0] || 'Agent';

  const { data: tradesData, isLoading: tradesLoading } = useQuery({
    queryKey: ['agent-recent-trades'],
    queryFn: () => agentApi.getTrades({ limit: 50, page: 1 }),
  });

  const { data: commissions = [], isLoading: commissionsLoading } = useQuery({
    queryKey: ['agent-commissions'],
    queryFn: agentApi.getCommissions,
  });

  const { data: fxRatesData, isLoading: ratesLoading, refetch: refetchRates } = useQuery({
    queryKey: ['fx-rates'],
    queryFn: customerApi.getFxRates,
    staleTime: 60_000,
  });

  const trades = tradesData?.trades || [];
  const txnCount = trades.length;
  const txnVolume = trades.reduce((sum: number, t: any) => {
    const raw = String(t.amount || '0').replace(/[₦$£€,]/g, '');
    return sum + (parseFloat(raw) || 0);
  }, 0);

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

  const rates = fxRatesData?.rates || [];

  return (
    <div className="p-4 md:p-6 lg:pl-7 lg:pr-6 space-y-8" style={{ backgroundColor: '#f7f8f9', minHeight: '100%' }}>
      {/* Welcome */}
      <div>
        <h1 className="text-2xl md:text-3xl lg:text-4xl font-bold mb-1.5" style={{ color: 'var(--text-primary)' }}>
          Hello, {agentName}!
        </h1>
        <p className="text-sm md:text-base" style={{ color: 'var(--text-secondary)' }}>
          Here&apos;s your dashboard — customer transactions, commissions, and live rates
        </p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <KpiCard
          title="Customer Transactions"
          value={tradesLoading ? '—' : txnCount.toLocaleString()}
          subtitle="Total trade count"
          icon={Users}
          color="#3B82F6"
        />
        <KpiCard
          title="Transaction Volume"
          value={tradesLoading ? '—' : `₦${txnVolume.toLocaleString()}`}
          subtitle="Total amount processed"
          icon={Activity}
          color="#8B5CF6"
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
          color="#27AE60"
        />
      </div>

      {/* Main grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Customer Transactions Table */}
        <div className="lg:col-span-2 bg-white rounded-xl border shadow-sm overflow-hidden" style={{ borderColor: 'var(--border-custom)' }}>
          <div className="flex items-center justify-between px-6 py-4 border-b" style={{ borderColor: 'var(--border-light)' }}>
            <div>
              <h2 className="font-bold text-base" style={{ color: 'var(--text-primary)' }}>Customer Transactions</h2>
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

      {/* Commission Breakdown */}
      <div className="bg-white rounded-xl border shadow-sm p-6" style={{ borderColor: 'var(--border-custom)' }}>
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

      {/* Pooled Requests */}
      <PooledRequests />
    </div>
  );
}

'use client';

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { apiClient } from '@/lib/api/client';
import {
  BarChart2,
  TrendingUp,
  DollarSign,
  Calendar,
  Download,
  RefreshCw,
  CheckCircle,
  Clock,
  XCircle,
  ArrowUpRight,
} from 'lucide-react';

interface AgentStats {
  activeTrades: number;
  completedTrades: number;
  totalCommissions: string;
  monthlyCommissions: string;
  pendingDocuments: number;
  totalTrades: number;
}

interface Commission {
  id: string;
  reference: string;
  date: string;
  amount: string;
  status: string;
  tradeAmount: string;
  createdAt: string;
}

interface Trade {
  id: string;
  tradeId: string;
  date: string;
  time: string;
  customer: string;
  transaction: string;
  amount: string;
  status: string;
}

type Tab = 'overview' | 'trades' | 'commissions';

const STATUS_COLOR: Record<string, { bg: string; text: string }> = {
  Completed: { bg: '#E2FDED', text: '#27AE60' },
  'In Progress': { bg: '#E8F4FD', text: '#2196F3' },
  Pending: { bg: '#FFF8E1', text: '#F59E0B' },
  Cancelled: { bg: '#FEE2E2', text: '#EB5757' },
  PAID: { bg: '#E2FDED', text: '#27AE60' },
  PENDING: { bg: '#FFF8E1', text: '#F59E0B' },
  DISPUTED: { bg: '#FEE2E2', text: '#EB5757' },
};

export default function AgentReportsPage() {
  const [activeTab, setActiveTab] = useState<Tab>('overview');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  const { data: stats, isLoading: statsLoading, refetch: refetchStats } = useQuery<AgentStats>({
    queryKey: ['agent-dashboard-stats'],
    queryFn: () => apiClient.get<AgentStats>('/agent/dashboard/stats'),
  });

  const { data: tradesData, isLoading: tradesLoading } = useQuery<{ trades: Trade[]; total: number }>({
    queryKey: ['agent-trades-report'],
    queryFn: () => apiClient.get<{ trades: Trade[]; total: number }>('/agent/trades?limit=100'),
  });

  const { data: commissions, isLoading: commissionsLoading } = useQuery<Commission[]>({
    queryKey: ['agent-commissions-report'],
    queryFn: () => apiClient.get<Commission[]>('/agent/commissions'),
  });

  const trades = tradesData?.trades ?? [];
  const allCommissions = commissions ?? [];

  // Filter by date if set
  const filteredTrades = trades.filter(t => {
    if (!startDate && !endDate) return true;
    const td = t.date.split('/').reverse().join('-'); // dd/mm/yyyy => yyyy-mm-dd
    if (startDate && td < startDate) return false;
    if (endDate && td > endDate) return false;
    return true;
  });

  // Metrics
  const completedCount = trades.filter(t => t.status === 'Completed').length;
  const pendingCount = trades.filter(t => t.status === 'Pending').length;
  const cancelledCount = trades.filter(t => t.status === 'Cancelled').length;
  const successRate = trades.length > 0 ? Math.round((completedCount / trades.length) * 100) : 0;

  const downloadCSV = (type: 'trades' | 'commissions') => {
    if (type === 'trades') {
      const rows = [
        ['Trade ID', 'Date', 'Customer', 'Transaction', 'Amount', 'Status'],
        ...filteredTrades.map(t => [t.tradeId, t.date, t.customer, t.transaction, t.amount, t.status]),
      ];
      const csv = rows.map(r => r.join(',')).join('\n');
      const blob = new Blob([csv], { type: 'text/csv' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `my-trades-${new Date().toISOString().slice(0, 10)}.csv`;
      a.click();
    } else {
      const rows = [
        ['Reference', 'Date', 'Trade Amount', 'Commission', 'Status'],
        ...allCommissions.map(c => [c.reference, c.date, c.tradeAmount, c.amount, c.status]),
      ];
      const csv = rows.map(r => r.join(',')).join('\n');
      const blob = new Blob([csv], { type: 'text/csv' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `my-commissions-${new Date().toISOString().slice(0, 10)}.csv`;
      a.click();
    }
  };

  const TABS: { id: Tab; label: string; icon: React.ElementType }[] = [
    { id: 'overview', label: 'Overview', icon: BarChart2 },
    { id: 'trades', label: 'My Trades', icon: TrendingUp },
    { id: 'commissions', label: 'My Commissions', icon: DollarSign },
  ];

  return (
    <div className="p-4 md:p-6 lg:pl-7 lg:pr-6 space-y-6" style={{ backgroundColor: '#f7f8f9', minHeight: '100%' }}>
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl lg:text-4xl font-bold mb-1" style={{ color: 'var(--text-primary)' }}>
            My Reports
          </h1>
          <p className="text-sm md:text-base" style={{ color: 'var(--text-secondary)' }}>
            Your personal performance metrics and transaction history
          </p>
        </div>
        <button
          onClick={() => refetchStats()}
          className="w-10 h-10 rounded-full border bg-white flex items-center justify-center shadow-sm hover:bg-gray-50 transition-colors"
          style={{ borderColor: 'var(--border-custom)' }}
        >
          <RefreshCw className="w-4 h-4" style={{ color: 'var(--brand-primary)' }} />
        </button>
      </div>

      {/* Tab Bar */}
      <div className="overflow-x-auto">
        <div className="flex gap-1 border-b min-w-max" style={{ borderColor: 'var(--border-custom)' }}>
          {TABS.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className="flex items-center gap-2 px-4 py-3 text-sm font-bold transition-all border-b-2 whitespace-nowrap"
                style={{
                  borderColor: isActive ? 'var(--brand-primary)' : 'transparent',
                  color: isActive ? '#012333' : '#9AA0A6',
                }}
              >
                <Icon size={15} />
                {tab.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* ── OVERVIEW TAB ── */}
      {activeTab === 'overview' && (
        <div className="space-y-6">
          {/* Summary Cards */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              {
                label: 'Total Trades',
                value: statsLoading ? '—' : `${stats?.totalTrades ?? 0}`,
                icon: TrendingUp,
                color: '#012333',
                bg: '#E2FDED',
              },
              {
                label: 'Completed',
                value: statsLoading ? '—' : `${stats?.completedTrades ?? 0}`,
                icon: CheckCircle,
                color: '#27AE60',
                bg: '#E2FDED',
              },
              {
                label: 'Active Trades',
                value: statsLoading ? '—' : `${stats?.activeTrades ?? 0}`,
                icon: Clock,
                color: '#2196F3',
                bg: '#E8F4FD',
              },
              {
                label: 'Monthly Earnings',
                value: statsLoading ? '—' : stats?.monthlyCommissions ?? '₦0',
                icon: DollarSign,
                color: '#C9A227',
                bg: '#FBF4DC',
              },
            ].map(({ label, value, icon: Icon, color, bg }) => (
              <div key={label} className="bg-white rounded-2xl border p-5 shadow-sm" style={{ borderColor: 'var(--border-custom)' }}>
                <div className="flex items-center justify-between mb-3">
                  <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ backgroundColor: bg }}>
                    <Icon className="w-5 h-5" style={{ color }} />
                  </div>
                  <ArrowUpRight className="w-4 h-4 opacity-30" style={{ color: 'var(--text-tertiary)' }} />
                </div>
                <p className="text-xs font-medium mb-1" style={{ color: 'var(--text-tertiary)' }}>{label}</p>
                <p className="text-xl font-bold" style={{ color: 'var(--text-primary)' }}>{value}</p>
              </div>
            ))}
          </div>

          {/* Trade Breakdown */}
          <div className="bg-white rounded-2xl border shadow-sm p-6" style={{ borderColor: 'var(--border-custom)' }}>
            <h2 className="font-bold mb-5" style={{ color: 'var(--text-primary)' }}>Trade Breakdown</h2>
            <div className="grid grid-cols-3 gap-4 mb-6">
              {[
                { label: 'Completed', count: completedCount, color: '#27AE60', bg: '#E2FDED', icon: CheckCircle },
                { label: 'Pending', count: pendingCount, color: '#F59E0B', bg: '#FFF8E1', icon: Clock },
                { label: 'Cancelled', count: cancelledCount, color: '#EB5757', bg: '#FEE2E2', icon: XCircle },
              ].map(({ label, count, color, bg, icon: Icon }) => (
                <div key={label} className="rounded-xl p-4 text-center" style={{ backgroundColor: bg }}>
                  <Icon className="w-5 h-5 mx-auto mb-2" style={{ color }} />
                  <p className="text-2xl font-bold" style={{ color }}>{count}</p>
                  <p className="text-xs font-medium mt-0.5" style={{ color }}>{label}</p>
                </div>
              ))}
            </div>
            {/* Success rate bar */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <p className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>Success Rate</p>
                <p className="text-sm font-bold" style={{ color: '#27AE60' }}>{successRate}%</p>
              </div>
              <div className="h-2.5 rounded-full overflow-hidden" style={{ backgroundColor: '#F3F4F6' }}>
                <div
                  className="h-full rounded-full transition-all"
                  style={{ width: `${successRate}%`, backgroundColor: '#27AE60' }}
                />
              </div>
            </div>
          </div>

          {/* Total Earnings Card */}
          <div className="rounded-2xl p-6 text-white" style={{ background: 'linear-gradient(135deg, #012333 0%, #023a50 100%)' }}>
            <p className="text-xs font-bold uppercase tracking-widest mb-1" style={{ color: '#C9A227' }}>Total Earnings</p>
            <p className="text-3xl font-bold mb-0.5">{statsLoading ? '—' : stats?.totalCommissions ?? '₦0'}</p>
            <p className="text-xs" style={{ color: '#9AA0A6' }}>Cumulative commissions earned across all completed trades</p>
          </div>
        </div>
      )}

      {/* ── TRADES TAB ── */}
      {activeTab === 'trades' && (
        <div className="space-y-4">
          {/* Filters */}
          <div className="bg-white rounded-xl border p-4 flex flex-wrap items-end gap-4 justify-between" style={{ borderColor: 'var(--border-custom)' }}>
            <div className="flex flex-wrap items-end gap-4">
              {[
                { label: 'Start Date', value: startDate, setter: setStartDate },
                { label: 'End Date', value: endDate, setter: setEndDate },
              ].map(({ label, value, setter }) => (
                <div key={label}>
                  <label className="text-xs font-semibold mb-1.5 flex items-center gap-1" style={{ color: 'var(--text-secondary)' }}>
                    <Calendar size={12} /> {label}
                  </label>
                  <input
                    type="date"
                    value={value}
                    onChange={(e) => setter(e.target.value)}
                    className="h-9 px-3 text-sm rounded-lg border outline-none"
                    style={{ borderColor: 'var(--border-custom)' }}
                  />
                </div>
              ))}
              {(startDate || endDate) && (
                <button
                  onClick={() => { setStartDate(''); setEndDate(''); }}
                  className="text-xs px-3 py-2 rounded-lg self-end"
                  style={{ color: '#EB5757', backgroundColor: '#FEE2E2' }}
                >
                  Clear
                </button>
              )}
            </div>
            <button
              onClick={() => downloadCSV('trades')}
              className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold transition-colors"
              style={{ backgroundColor: 'var(--brand-primary)', color: '#fff' }}
            >
              <Download size={14} /> Export CSV
            </button>
          </div>

          {/* Trades Table */}
          <div className="bg-white rounded-2xl border shadow-sm overflow-hidden" style={{ borderColor: 'var(--border-custom)' }}>
            <div className="px-6 py-4 border-b flex items-center justify-between" style={{ borderColor: 'var(--border-custom)' }}>
              <h2 className="font-bold" style={{ color: 'var(--text-primary)' }}>
                Trades ({filteredTrades.length})
              </h2>
            </div>
            {tradesLoading ? (
              <div className="p-6 space-y-3">
                {Array.from({ length: 5 }).map((_, i) => (
                  <div key={i} className="h-14 rounded-xl animate-pulse" style={{ backgroundColor: '#F3F4F6' }} />
                ))}
              </div>
            ) : filteredTrades.length === 0 ? (
              <div className="py-16 text-center">
                <TrendingUp className="w-12 h-12 mx-auto mb-3 opacity-20" style={{ color: 'var(--text-tertiary)' }} />
                <p className="font-semibold" style={{ color: 'var(--text-secondary)' }}>No trades found</p>
                <p className="text-sm mt-1" style={{ color: 'var(--text-tertiary)' }}>
                  {startDate || endDate ? 'No trades match your date filter.' : 'You have not processed any trades yet.'}
                </p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left">
                  <thead>
                    <tr className="text-xs font-semibold uppercase tracking-wider" style={{ backgroundColor: '#F9FAFB', color: 'var(--text-tertiary)' }}>
                      <th className="px-6 py-3">Trade ID</th>
                      <th className="px-6 py-3">Date</th>
                      <th className="px-6 py-3">Customer</th>
                      <th className="px-6 py-3">Transaction</th>
                      <th className="px-6 py-3">Amount</th>
                      <th className="px-6 py-3">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y" style={{ borderColor: 'var(--border-light)' }}>
                    {filteredTrades.map(trade => {
                      const sc = STATUS_COLOR[trade.status] ?? { bg: '#F3F4F6', text: '#6B7280' };
                      return (
                        <tr key={trade.id} className="hover:bg-gray-50/50 transition-colors">
                          <td className="px-6 py-4">
                            <span className="text-sm font-mono font-semibold" style={{ color: 'var(--brand-primary)' }}>{trade.tradeId}</span>
                          </td>
                          <td className="px-6 py-4">
                            <p className="text-sm" style={{ color: 'var(--text-primary)' }}>{trade.date}</p>
                            <p className="text-xs" style={{ color: 'var(--text-tertiary)' }}>{trade.time}</p>
                          </td>
                          <td className="px-6 py-4">
                            <p className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>{trade.customer}</p>
                          </td>
                          <td className="px-6 py-4">
                            <span className="text-sm" style={{ color: 'var(--text-secondary)' }}>{trade.transaction}</span>
                          </td>
                          <td className="px-6 py-4">
                            <span className="text-sm font-bold" style={{ color: 'var(--text-primary)' }}>{trade.amount}</span>
                          </td>
                          <td className="px-6 py-4">
                            <span className="text-xs px-2.5 py-1 rounded-full font-semibold" style={{ backgroundColor: sc.bg, color: sc.text }}>
                              {trade.status}
                            </span>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ── COMMISSIONS TAB ── */}
      {activeTab === 'commissions' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
              Your complete commission history
            </p>
            <button
              onClick={() => downloadCSV('commissions')}
              className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold"
              style={{ backgroundColor: 'var(--brand-primary)', color: '#fff' }}
            >
              <Download size={14} /> Export CSV
            </button>
          </div>

          <div className="bg-white rounded-2xl border shadow-sm overflow-hidden" style={{ borderColor: 'var(--border-custom)' }}>
            <div className="px-6 py-4 border-b flex items-center justify-between" style={{ borderColor: 'var(--border-custom)' }}>
              <h2 className="font-bold" style={{ color: 'var(--text-primary)' }}>
                Commissions ({allCommissions.length})
              </h2>
            </div>

            {commissionsLoading ? (
              <div className="p-6 space-y-3">
                {Array.from({ length: 5 }).map((_, i) => (
                  <div key={i} className="h-14 rounded-xl animate-pulse" style={{ backgroundColor: '#F3F4F6' }} />
                ))}
              </div>
            ) : allCommissions.length === 0 ? (
              <div className="py-16 text-center">
                <DollarSign className="w-12 h-12 mx-auto mb-3 opacity-20" style={{ color: 'var(--text-tertiary)' }} />
                <p className="font-semibold" style={{ color: 'var(--text-secondary)' }}>No commissions yet</p>
                <p className="text-sm mt-1" style={{ color: 'var(--text-tertiary)' }}>
                  Commissions are earned on completed trades.
                </p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left">
                  <thead>
                    <tr className="text-xs font-semibold uppercase tracking-wider" style={{ backgroundColor: '#F9FAFB', color: 'var(--text-tertiary)' }}>
                      <th className="px-6 py-3">Reference</th>
                      <th className="px-6 py-3">Date</th>
                      <th className="px-6 py-3">Trade Amount</th>
                      <th className="px-6 py-3">Commission</th>
                      <th className="px-6 py-3">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y" style={{ borderColor: 'var(--border-light)' }}>
                    {allCommissions.map(comm => {
                      const sc = STATUS_COLOR[comm.status] ?? { bg: '#F3F4F6', text: '#6B7280' };
                      return (
                        <tr key={comm.id} className="hover:bg-gray-50/50 transition-colors">
                          <td className="px-6 py-4">
                            <span className="text-sm font-mono font-semibold" style={{ color: 'var(--brand-primary)' }}>{comm.reference}</span>
                          </td>
                          <td className="px-6 py-4">
                            <span className="text-sm" style={{ color: 'var(--text-primary)' }}>{comm.date}</span>
                          </td>
                          <td className="px-6 py-4">
                            <span className="text-sm" style={{ color: 'var(--text-secondary)' }}>{comm.tradeAmount}</span>
                          </td>
                          <td className="px-6 py-4">
                            <span className="text-sm font-bold" style={{ color: '#27AE60' }}>{comm.amount}</span>
                          </td>
                          <td className="px-6 py-4">
                            <span className="text-xs px-2.5 py-1 rounded-full font-semibold" style={{ backgroundColor: sc.bg, color: sc.text }}>
                              {comm.status}
                            </span>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

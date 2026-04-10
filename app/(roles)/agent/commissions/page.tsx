'use client';

import { useState, useEffect } from 'react';
import { agentApi } from '@/lib/api/agent';
import { referralApi, type ReferredCustomer } from '@/lib/api/referral';
import { Wallet, TrendingUp, Clock, CheckCircle, AlertCircle, Search, Filter, Users, Copy, ExternalLink } from 'lucide-react';
import { formatCurrency } from '@/lib/formatters';

type ActiveTab = 'earnings' | 'referrals';

export default function AgentCommissionsPage() {
  const [activeTab, setActiveTab] = useState<ActiveTab>('earnings');

  // Earnings state
  const [commissions, setCommissions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Referrals state
  const [referredCustomers, setReferredCustomers] = useState<ReferredCustomer[]>([]);
  const [referralStats, setReferralStats] = useState({ totalReferred: 0, commissionFromReferrals: '₦0' });
  const [referralsLoading, setReferralsLoading] = useState(false);

  useEffect(() => {
    async function loadCommissions() {
      try {
        const data = await agentApi.getCommissions();
        setCommissions(data);
      } catch (err) {
        console.error('Failed to load commissions:', err);
        setError('Failed to load your commissions. Please try again later.');
      } finally {
        setLoading(false);
      }
    }
    loadCommissions();
  }, []);

  useEffect(() => {
    if (activeTab === 'referrals') {
      setReferralsLoading(true);
      referralApi.getAgentReferralInfo()
        .then((info) => {
          setReferredCustomers(info.referredCustomers);
          setReferralStats({ totalReferred: info.totalReferred, commissionFromReferrals: info.commissionFromReferrals });
        })
        .catch(() => {
          setReferredCustomers([]);
        })
        .finally(() => setReferralsLoading(false));
    }
  }, [activeTab]);

  const getStatusStyle = (status: string) => {
    switch (status) {
      case 'PAID': return { bg: '#E2FDED', text: '#27AE60', icon: CheckCircle };
      case 'PENDING': return { bg: '#FFF8E1', text: '#F2994A', icon: Clock };
      case 'DISPUTED': return { bg: '#FEE2E2', text: '#EB5757', icon: AlertCircle };
      default: return { bg: '#F2F4F7', text: '#667085', icon: Clock };
    }
  };

  const parseAmount = (amount: string | number) => {
    if (typeof amount === 'number') return amount;
    if (!amount) return 0;
    return parseFloat(amount.toString().replace(/₦/g, '').replace(/,/g, '')) || 0;
  };

  const totalEarned = commissions.filter(c => c.status === 'PAID').reduce((sum, c) => sum + parseAmount(c.amount), 0);
  const pendingPayout = commissions.filter(c => c.status === 'PENDING').reduce((sum, c) => sum + parseAmount(c.amount), 0);

  return (
    <div className="p-6 lg:p-8 max-w-7xl mx-auto space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">My Commissions</h1>
          <p className="text-slate-500 mt-1">Track your earnings, payout status, and customers you've referred.</p>
        </div>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-blue-50 flex items-center justify-center text-blue-600">
            <TrendingUp size={24} />
          </div>
          <div>
            <p className="text-sm font-medium text-slate-500">Total Earned</p>
            <p className="text-2xl font-bold text-slate-900">₦{totalEarned.toLocaleString()}</p>
          </div>
        </div>
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-amber-50 flex items-center justify-center text-amber-600">
            <Clock size={24} />
          </div>
          <div>
            <p className="text-sm font-medium text-slate-500">Pending Payout</p>
            <p className="text-2xl font-bold text-slate-900">₦{pendingPayout.toLocaleString()}</p>
          </div>
        </div>
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-purple-50 flex items-center justify-center text-purple-600">
            <Wallet size={24} />
          </div>
          <div>
            <p className="text-sm font-medium text-slate-500">Available Balance</p>
            <p className="text-2xl font-bold text-slate-900">₦0.00</p>
          </div>
        </div>
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-green-50 flex items-center justify-center text-green-600">
            <Users size={24} />
          </div>
          <div>
            <p className="text-sm font-medium text-slate-500">Referred Customers</p>
            <p className="text-2xl font-bold text-slate-900">{referralStats.totalReferred}</p>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 border-b" style={{ borderColor: '#E1E3E6' }}>
        {[
          { id: 'earnings' as ActiveTab, label: 'Earnings History' },
          { id: 'referrals' as ActiveTab, label: 'Referred Customers' },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className="px-5 py-3 text-sm font-bold transition-all border-b-2 whitespace-nowrap"
            style={{
              borderColor: activeTab === tab.id ? 'var(--brand-primary)' : 'transparent',
              color: activeTab === tab.id ? '#012333' : '#9AA0A6',
            }}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* ── Earnings History ── */}
      {activeTab === 'earnings' && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b border-slate-100 flex flex-col md:flex-row md:items-center justify-between gap-4">
            <h2 className="font-bold text-slate-800">Earnings History</h2>
            <div className="flex items-center gap-2">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                <input
                  type="text"
                  placeholder="Search reference..."
                  className="pl-9 pr-4 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 w-full md:w-64"
                />
              </div>
              <button className="p-2 border border-slate-200 rounded-lg hover:bg-slate-50 text-slate-600 transition-colors">
                <Filter size={18} />
              </button>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="bg-slate-50/50 text-slate-500 text-xs font-semibold uppercase tracking-wider">
                  <th className="px-6 py-4">Reference</th>
                  <th className="px-6 py-4">Date</th>
                  <th className="px-6 py-4">Trade Amount</th>
                  <th className="px-6 py-4">Commission</th>
                  <th className="px-6 py-4 text-center">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {loading ? (
                  Array.from({ length: 5 }).map((_, i) => (
                    <tr key={i} className="animate-pulse">
                      <td className="px-6 py-4"><div className="h-4 bg-slate-100 rounded w-24"></div></td>
                      <td className="px-6 py-4"><div className="h-4 bg-slate-100 rounded w-20"></div></td>
                      <td className="px-6 py-4"><div className="h-4 bg-slate-100 rounded w-28"></div></td>
                      <td className="px-6 py-4"><div className="h-4 bg-slate-100 rounded w-24"></div></td>
                      <td className="px-6 py-4"><div className="h-8 bg-slate-100 rounded-full w-20 mx-auto"></div></td>
                    </tr>
                  ))
                ) : commissions.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-6 py-12 text-center">
                      <div className="flex flex-col items-center justify-center text-slate-400">
                        <TrendingUp size={48} className="mb-4 opacity-20" />
                        <p>No commissions recorded yet.</p>
                      </div>
                    </td>
                  </tr>
                ) : (
                  commissions.map((c) => {
                    const status = getStatusStyle(c.status);
                    const StatusIcon = status.icon;
                    return (
                      <tr key={c.id} className="hover:bg-slate-50/50 transition-colors">
                        <td className="px-6 py-4 font-medium text-slate-900">{c.reference}</td>
                        <td className="px-6 py-4 text-slate-600 text-sm">{c.date}</td>
                        <td className="px-6 py-4 text-slate-600 text-sm font-medium">{c.tradeAmount}</td>
                        <td className="px-6 py-4 text-slate-900 font-bold">{c.amount}</td>
                        <td className="px-6 py-4">
                          <div
                            className="flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold w-fit mx-auto"
                            style={{ backgroundColor: status.bg, color: status.text }}
                          >
                            <StatusIcon size={14} />
                            {c.status}
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ── Referred Customers ── */}
      {activeTab === 'referrals' && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b border-slate-100 flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <h2 className="font-bold text-slate-800">Customers You Referred</h2>
              <p className="text-xs text-slate-500 mt-0.5">Customers who signed up using your referral code or link</p>
            </div>
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-semibold"
              style={{ backgroundColor: '#E2FDED', color: '#27AE60' }}>
              <Users size={14} />
              {referralStats.totalReferred} total · {referralStats.commissionFromReferrals} earned
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="bg-slate-50/50 text-slate-500 text-xs font-semibold uppercase tracking-wider">
                  <th className="px-6 py-4">Customer</th>
                  <th className="px-6 py-4">Joined</th>
                  <th className="px-6 py-4">Total Trades</th>
                  <th className="px-6 py-4">Trade Volume</th>
                  <th className="px-6 py-4">Commission Earned</th>
                  <th className="px-6 py-4 text-center">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {referralsLoading ? (
                  Array.from({ length: 4 }).map((_, i) => (
                    <tr key={i} className="animate-pulse">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-slate-100"></div>
                          <div className="space-y-1.5">
                            <div className="h-3 bg-slate-100 rounded w-28"></div>
                            <div className="h-3 bg-slate-100 rounded w-20"></div>
                          </div>
                        </div>
                      </td>
                      {Array.from({ length: 5 }).map((__, j) => (
                        <td key={j} className="px-6 py-4"><div className="h-4 bg-slate-100 rounded w-20"></div></td>
                      ))}
                    </tr>
                  ))
                ) : referredCustomers.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-6 py-16 text-center">
                      <div className="flex flex-col items-center gap-3">
                        <div className="w-16 h-16 rounded-full flex items-center justify-center" style={{ backgroundColor: '#F7F8F9' }}>
                          <Users size={28} className="opacity-30 text-slate-400" />
                        </div>
                        <p className="font-semibold text-slate-600">No referred customers yet</p>
                        <p className="text-sm text-slate-400 max-w-xs">
                          Share your referral link or code with potential customers. When they sign up using your code, they'll appear here.
                        </p>
                      </div>
                    </td>
                  </tr>
                ) : (
                  referredCustomers.map((c) => (
                    <tr key={c.id} className="hover:bg-slate-50/50 transition-colors">
                      <td className="px-6 py-4">
                        <div>
                          <p className="text-sm font-semibold text-slate-900">{c.name}</p>
                          <p className="text-xs text-slate-500">{c.email}</p>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-slate-600 text-sm">
                        {new Date(c.joinedDate).toLocaleDateString('en-NG', { day: 'numeric', month: 'short', year: 'numeric' })}
                      </td>
                      <td className="px-6 py-4 text-slate-900 font-medium text-sm">{c.totalTrades}</td>
                      <td className="px-6 py-4 text-slate-700 text-sm font-medium">{c.totalVolume}</td>
                      <td className="px-6 py-4 text-slate-900 font-bold text-sm">{c.commissionEarned}</td>
                      <td className="px-6 py-4 text-center">
                        <span
                          className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold"
                          style={{
                            backgroundColor: c.status === 'Active' ? '#E2FDED' : '#F3F4F6',
                            color: c.status === 'Active' ? '#27AE60' : '#6B7280',
                          }}
                        >
                          {c.status}
                        </span>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}

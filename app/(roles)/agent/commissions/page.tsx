'use client';

import { useState, useEffect } from 'react';
import { agentApi } from '@/lib/api/agent';
import { Wallet, TrendingUp, Clock, CheckCircle, AlertCircle, Search, Filter } from 'lucide-react';
import { formatCurrency } from '@/lib/formatters';

export default function AgentCommissionsPage() {
  const [commissions, setCommissions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

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

  const getStatusStyle = (status: string) => {
    switch (status) {
      case 'PAID':
        return { bg: '#E2FDED', text: '#27AE60', icon: CheckCircle };
      case 'PENDING':
        return { bg: '#FFF8E1', text: '#F2994A', icon: Clock };
      case 'DISPUTED':
        return { bg: '#FEE2E2', text: '#EB5757', icon: AlertCircle };
      default:
        return { bg: '#F2F4F7', text: '#667085', icon: Clock };
    }
  };

  const parseAmount = (amount: string | number) => {
    if (typeof amount === 'number') return amount;
    if (!amount) return 0;
    return parseFloat(amount.toString().replace(/₦/g, '').replace(/,/g, '')) || 0;
  };

  const totalEarned = commissions
    .filter(c => c.status === 'PAID')
    .reduce((sum, c) => sum + parseAmount(c.amount), 0);

  const pendingPayout = commissions
    .filter(c => c.status === 'PENDING')
    .reduce((sum, c) => sum + parseAmount(c.amount), 0);

  return (
    <div className="p-6 lg:p-8 max-w-7xl mx-auto space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">My Commissions</h1>
          <p className="text-slate-500 mt-1">Track your earnings and payout status from completed trades.</p>
        </div>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
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
      </div>

      {/* Commissions Table */}
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
    </div>
  );
}

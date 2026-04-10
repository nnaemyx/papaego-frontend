'use client';

import { useQuery } from '@tanstack/react-query';
import { reportsApi, ReportFilters } from '@/lib/api/reports';
import { Download, Users, TrendingUp, Activity } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface Props { filters: ReportFilters; }

export function ProductivityReport({ filters }: Props) {
  const { data = [], isLoading } = useQuery({
    queryKey: ['report-productivity', filters],
    queryFn: () => reportsApi.getProductivityReport(filters),
  });

  const totalCustomers = data.reduce((s, r) => s + r.customersOnboarded, 0);
  const totalTxns = data.reduce((s, r) => s + r.transactionCount, 0);
  const totalVolume = data.reduce((s, r) => s + r.transactionVolume, 0);

  const handleExport = async () => {
    const blob = await reportsApi.exportReport('productivity', filters);
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = 'productivity-report.csv'; a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-5">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {[
          { icon: Users, label: 'Total Customers Onboarded', value: totalCustomers.toLocaleString(), color: '#3B82F6' },
          { icon: Activity, label: 'Total Transactions', value: totalTxns.toLocaleString(), color: '#8B5CF6' },
          { icon: TrendingUp, label: 'Total Volume', value: `₦${totalVolume.toLocaleString()}`, color: '#C9A227' },
        ].map(({ icon: Icon, label, value, color }) => (
          <div key={label} className="bg-white rounded-xl border p-4 flex items-center gap-4" style={{ borderColor: 'var(--border-custom)' }}>
            <div className="w-10 h-10 rounded-lg flex items-center justify-center shrink-0" style={{ backgroundColor: `${color}20` }}>
              <Icon size={18} style={{ color }} />
            </div>
            <div>
              <p className="text-xs" style={{ color: 'var(--text-tertiary)' }}>{label}</p>
              <p className="text-lg font-bold" style={{ color: 'var(--text-primary)' }}>{value}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl border shadow-sm overflow-hidden" style={{ borderColor: 'var(--border-custom)' }}>
        <div className="flex items-center justify-between px-5 py-4 border-b" style={{ borderColor: 'var(--border-light)' }}>
          <h3 className="font-bold text-sm" style={{ color: 'var(--text-primary)' }}>Agent Productivity Details</h3>
          <Button variant="outline" size="sm" onClick={handleExport} className="flex items-center gap-1.5 text-xs h-8">
            <Download size={13} /> Export CSV
          </Button>
        </div>

        {isLoading ? (
          <div className="p-6 space-y-3">{Array.from({ length: 5 }).map((_, i) => <div key={i} className="h-10 bg-gray-100 rounded animate-pulse" />)}</div>
        ) : data.length === 0 ? (
          <div className="py-16 text-center">
            <Activity size={40} className="mx-auto mb-3 opacity-20" style={{ color: 'var(--text-tertiary)' }} />
            <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>No data available for selected filters</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr style={{ backgroundColor: '#F7F8F9' }}>
                  {['Agent', 'Region', 'Customers Onboarded', 'Transaction Count', 'Volume', 'Commission', 'Status'].map((h) => (
                    <th key={h} className="px-5 py-3 text-xs font-bold uppercase tracking-wider whitespace-nowrap" style={{ color: 'var(--text-tertiary)' }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {data.map((r, i) => (
                  <tr key={i} className="border-t hover:bg-gray-50/50 transition-colors" style={{ borderColor: 'var(--border-light)' }}>
                    <td className="px-5 py-3.5">
                      <p className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>{r.agentName}</p>
                      <p className="text-xs" style={{ color: 'var(--text-tertiary)' }}>{r.email}</p>
                    </td>
                    <td className="px-5 py-3.5 text-sm" style={{ color: 'var(--text-secondary)' }}>{r.region}</td>
                    <td className="px-5 py-3.5 text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>{r.customersOnboarded}</td>
                    <td className="px-5 py-3.5 text-sm" style={{ color: 'var(--text-secondary)' }}>{r.transactionCount}</td>
                    <td className="px-5 py-3.5 text-sm font-bold" style={{ color: 'var(--text-primary)' }}>₦{r.transactionVolume.toLocaleString()}</td>
                    <td className="px-5 py-3.5 text-sm font-bold" style={{ color: '#27AE60' }}>{r.commissionEarned}</td>
                    <td className="px-5 py-3.5">
                      <span className="text-xs font-bold px-2.5 py-1 rounded-full" style={{ backgroundColor: r.status === 'Active' ? '#E2FDED' : '#F0F0F0', color: r.status === 'Active' ? '#27AE60' : '#6B7078' }}>
                        {r.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

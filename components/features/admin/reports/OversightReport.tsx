'use client';

import { useQuery } from '@tanstack/react-query';
import { reportsApi, ReportFilters } from '@/lib/api/reports';
import { Download, AlertTriangle, Clock, CheckCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface Props { filters: ReportFilters; }

export function OversightReport({ filters }: Props) {
  const { data = [], isLoading } = useQuery({
    queryKey: ['report-oversight', filters],
    queryFn: () => reportsApi.getOversightReport(filters),
  });

  const handleExport = async () => {
    const blob = await reportsApi.exportReport('oversight', filters);
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = 'oversight-report.csv'; a.click();
    URL.revokeObjectURL(url);
  };

  const overdueCount = data.filter((r) => r.isOverdue).length;
  const aged3Plus = data.filter((r) => r.ageInDays >= 3).length;
  const healthy = data.filter((r) => r.ageInDays < 1).length;

  return (
    <div className="space-y-5">
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {[
          { icon: AlertTriangle, label: 'Overdue Transactions', value: overdueCount.toLocaleString(), color: '#EB5757' },
          { icon: Clock, label: 'Aged 3+ Days', value: aged3Plus.toLocaleString(), color: '#F59E0B' },
          { icon: CheckCircle, label: 'On Track (< 24h)', value: healthy.toLocaleString(), color: '#27AE60' },
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

      {/* Overdue warning banner */}
      {overdueCount > 0 && (
        <div className="flex items-start gap-3 p-4 rounded-xl border" style={{ backgroundColor: '#FEF2F2', borderColor: '#FECACA' }}>
          <AlertTriangle className="w-5 h-5 shrink-0 mt-0.5" style={{ color: '#EB5757' }} />
          <p className="text-sm" style={{ color: '#991B1B' }}>
            <span className="font-bold">{overdueCount} transaction{overdueCount !== 1 ? 's' : ''}</span> {overdueCount !== 1 ? 'are' : 'is'} overdue and may require immediate attention. Review and contact the assigned agents.
          </p>
        </div>
      )}

      <div className="bg-white rounded-xl border shadow-sm overflow-hidden" style={{ borderColor: 'var(--border-custom)' }}>
        <div className="flex items-center justify-between px-5 py-4 border-b" style={{ borderColor: 'var(--border-light)' }}>
          <h3 className="font-bold text-sm" style={{ color: 'var(--text-primary)' }}>Transaction Oversight — Aged / In-Progress</h3>
          <Button variant="outline" size="sm" onClick={handleExport} className="flex items-center gap-1.5 text-xs h-8">
            <Download size={13} /> Export CSV
          </Button>
        </div>

        {isLoading ? (
          <div className="p-6 space-y-3">{Array.from({ length: 5 }).map((_, i) => <div key={i} className="h-10 bg-gray-100 rounded animate-pulse" />)}</div>
        ) : data.length === 0 ? (
          <div className="py-16 text-center">
            <CheckCircle size={40} className="mx-auto mb-3 opacity-20" style={{ color: '#27AE60' }} />
            <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>All transactions are on track — no aged items found</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr style={{ backgroundColor: '#F7F8F9' }}>
                  {['Trade ID', 'Customer', 'Agent', 'Amount', 'Status', 'Age (Days)', 'Last Update', 'Overdue?'].map((h) => (
                    <th key={h} className="px-5 py-3 text-xs font-bold uppercase tracking-wider whitespace-nowrap" style={{ color: 'var(--text-tertiary)' }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {data.map((r, i) => (
                  <tr key={i} className="border-t hover:bg-gray-50/50 transition-colors" style={{ borderColor: 'var(--border-light)', backgroundColor: r.isOverdue ? '#FEF2F2' : 'transparent' }}>
                    <td className="px-5 py-3.5 text-xs font-mono font-semibold" style={{ color: 'var(--text-primary)' }}>#{r.tradeId.slice(0, 10).toUpperCase()}</td>
                    <td className="px-5 py-3.5 text-sm" style={{ color: 'var(--text-secondary)' }}>{r.customer}</td>
                    <td className="px-5 py-3.5 text-sm" style={{ color: 'var(--text-secondary)' }}>{r.agent}</td>
                    <td className="px-5 py-3.5 text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>{r.amount} {r.currency}</td>
                    <td className="px-5 py-3.5 text-sm" style={{ color: 'var(--text-secondary)' }}>{r.status}</td>
                    <td className="px-5 py-3.5">
                      <span className="text-sm font-bold" style={{ color: r.ageInDays >= 3 ? '#EB5757' : r.ageInDays >= 1 ? '#F59E0B' : '#27AE60' }}>
                        {r.ageInDays}d
                      </span>
                    </td>
                    <td className="px-5 py-3.5 text-xs" style={{ color: 'var(--text-tertiary)' }}>{r.lastUpdate ? new Date(r.lastUpdate).toLocaleString() : '—'}</td>
                    <td className="px-5 py-3.5">
                      {r.isOverdue ? (
                        <span className="flex items-center gap-1 text-xs font-bold" style={{ color: '#EB5757' }}>
                          <AlertTriangle size={12} /> Yes
                        </span>
                      ) : (
                        <span className="text-xs" style={{ color: '#27AE60' }}>No</span>
                      )}
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

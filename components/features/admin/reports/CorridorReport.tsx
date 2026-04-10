'use client';

import { useQuery } from '@tanstack/react-query';
import { reportsApi, ReportFilters } from '@/lib/api/reports';
import { Download, ArrowRight, TrendingUp } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface Props { filters: ReportFilters; }

const CURRENCY_COLORS: Record<string, string> = {
  USD: '#3B82F6', GBP: '#8B5CF6', EUR: '#F59E0B', NGN: '#27AE60', CAD: '#EC4899', AED: '#06B6D4',
};

export function CorridorReport({ filters }: Props) {
  const { data = [], isLoading } = useQuery({
    queryKey: ['report-corridor', filters],
    queryFn: () => reportsApi.getCorridorReport(filters),
  });

  const handleExport = async () => {
    const blob = await reportsApi.exportReport('corridors', filters);
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = 'corridor-report.csv'; a.click();
    URL.revokeObjectURL(url);
  };

  const totalVolume = data.reduce((s, r) => s + r.totalVolume, 0);
  const totalTxns = data.reduce((s, r) => s + r.totalCount, 0);

  return (
    <div className="space-y-5">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {[
          { label: 'Total Corridors', value: data.length.toLocaleString(), color: '#3B82F6' },
          { label: 'Total Transactions', value: totalTxns.toLocaleString(), color: '#8B5CF6' },
        ].map(({ label, value, color }) => (
          <div key={label} className="bg-white rounded-xl border p-4 flex items-center gap-4" style={{ borderColor: 'var(--border-custom)' }}>
            <div className="w-10 h-10 rounded-lg flex items-center justify-center shrink-0" style={{ backgroundColor: `${color}20` }}>
              <TrendingUp size={18} style={{ color }} />
            </div>
            <div>
              <p className="text-xs" style={{ color: 'var(--text-tertiary)' }}>{label}</p>
              <p className="text-lg font-bold" style={{ color: 'var(--text-primary)' }}>{value}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Corridor Volume Bar Chart */}
      {data.length > 0 && (
        <div className="bg-white rounded-xl border p-5 shadow-sm" style={{ borderColor: 'var(--border-custom)' }}>
          <h3 className="font-bold text-sm mb-4" style={{ color: 'var(--text-primary)' }}>Volume Distribution by Corridor</h3>
          <div className="space-y-3">
            {data.slice(0, 8).map((r) => {
              const pct = totalVolume > 0 ? (r.totalVolume / totalVolume) * 100 : 0;
              const fromColor = CURRENCY_COLORS[r.sendCurrency] || '#C9A227';
              return (
                <div key={r.corridor}>
                  <div className="flex items-center justify-between mb-1">
                    <div className="flex items-center gap-2 text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>
                      <span style={{ color: fromColor }}>{r.sendCurrency}</span>
                      <ArrowRight size={12} style={{ color: 'var(--text-tertiary)' }} />
                      <span>{r.receiveCurrency}</span>
                    </div>
                    <span className="text-xs font-bold" style={{ color: 'var(--text-secondary)' }}>
                      ₦{r.totalVolume.toLocaleString()} · {pct.toFixed(1)}%
                    </span>
                  </div>
                  <div className="h-2 rounded-full" style={{ backgroundColor: '#F0F0F0' }}>
                    <div className="h-2 rounded-full transition-all" style={{ width: `${pct}%`, backgroundColor: fromColor }} />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      <div className="bg-white rounded-xl border shadow-sm overflow-hidden" style={{ borderColor: 'var(--border-custom)' }}>
        <div className="flex items-center justify-between px-5 py-4 border-b" style={{ borderColor: 'var(--border-light)' }}>
          <h3 className="font-bold text-sm" style={{ color: 'var(--text-primary)' }}>Transaction Corridors Detail</h3>
          <Button variant="outline" size="sm" onClick={handleExport} className="flex items-center gap-1.5 text-xs h-8">
            <Download size={13} /> Export CSV
          </Button>
        </div>

        {isLoading ? (
          <div className="p-6 space-y-3">{Array.from({ length: 5 }).map((_, i) => <div key={i} className="h-10 bg-gray-100 rounded animate-pulse" />)}</div>
        ) : data.length === 0 ? (
          <div className="py-16 text-center">
            <ArrowRight size={40} className="mx-auto mb-3 opacity-20" style={{ color: 'var(--text-tertiary)' }} />
            <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>No corridor data available</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr style={{ backgroundColor: '#F7F8F9' }}>
                  {['Corridor', 'Total Trades', 'Total Volume', '% Share', 'Avg Trade Size', 'Last Trade'].map((h) => (
                    <th key={h} className="px-5 py-3 text-xs font-bold uppercase tracking-wider whitespace-nowrap" style={{ color: 'var(--text-tertiary)' }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {data.map((r, i) => (
                  <tr key={i} className="border-t hover:bg-gray-50/50 transition-colors" style={{ borderColor: 'var(--border-light)' }}>
                    <td className="px-5 py-3.5">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-bold" style={{ color: CURRENCY_COLORS[r.sendCurrency] || '#C9A227' }}>{r.sendCurrency}</span>
                        <ArrowRight size={12} style={{ color: 'var(--text-tertiary)' }} />
                        <span className="text-sm font-bold" style={{ color: 'var(--text-primary)' }}>{r.receiveCurrency}</span>
                      </div>
                    </td>
                    <td className="px-5 py-3.5 text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>{r.totalCount.toLocaleString()}</td>
                    <td className="px-5 py-3.5 text-sm font-bold" style={{ color: 'var(--text-primary)' }}>₦{r.totalVolume.toLocaleString()}</td>
                    <td className="px-5 py-3.5 text-sm font-semibold" style={{ color: '#C9A227' }}>{r.percentShare.toFixed(1)}%</td>
                    <td className="px-5 py-3.5 text-sm" style={{ color: 'var(--text-secondary)' }}>₦{Math.round(r.avgAmount).toLocaleString()}</td>
                    <td className="px-5 py-3.5 text-xs" style={{ color: 'var(--text-tertiary)' }}>{r.lastTrade ? new Date(r.lastTrade).toLocaleDateString() : '—'}</td>
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

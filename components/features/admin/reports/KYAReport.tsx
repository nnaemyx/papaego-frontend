'use client';

import { useQuery } from '@tanstack/react-query';
import { reportsApi, ReportFilters } from '@/lib/api/reports';
import { Download, ShieldCheck, Users } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface Props { filters: ReportFilters; }

const KYC_STYLE: Record<string, { bg: string; text: string }> = {
  COMPLETED: { bg: '#E2FDED', text: '#27AE60' },
  PENDING:   { bg: '#FFF8E1', text: '#F59E0B' },
  FAILED:    { bg: '#FEE2E2', text: '#EB5757' },
};

export function KYAReport({ filters }: Props) {
  const { data = [], isLoading } = useQuery({
    queryKey: ['report-kya', filters],
    queryFn: () => reportsApi.getKYAReport(filters),
  });

  const handleExport = async () => {
    const blob = await reportsApi.exportReport('kya', filters);
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = 'kya-report.csv'; a.click();
    URL.revokeObjectURL(url);
  };

  const activeCount = data.filter((r) => r.status === 'Active').length;
  const verifiedCount = data.filter((r) => r.kycStatus === 'COMPLETED').length;

  return (
    <div className="space-y-5">
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {[
          { icon: Users, label: 'Total Agents', value: data.length.toLocaleString(), color: '#3B82F6' },
          { icon: ShieldCheck, label: 'Verified Agents', value: verifiedCount.toLocaleString(), color: '#27AE60' },
          { icon: Users, label: 'Active Agents', value: activeCount.toLocaleString(), color: '#C9A227' },
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

      <div className="bg-white rounded-xl border shadow-sm overflow-hidden" style={{ borderColor: 'var(--border-custom)' }}>
        <div className="flex items-center justify-between px-5 py-4 border-b" style={{ borderColor: 'var(--border-light)' }}>
          <h3 className="font-bold text-sm" style={{ color: 'var(--text-primary)' }}>Know Your Agents (KYA) Summary</h3>
          <Button variant="outline" size="sm" onClick={handleExport} className="flex items-center gap-1.5 text-xs h-8">
            <Download size={13} /> Export CSV
          </Button>
        </div>

        {isLoading ? (
          <div className="p-6 space-y-3">{Array.from({ length: 5 }).map((_, i) => <div key={i} className="h-10 bg-gray-100 rounded animate-pulse" />)}</div>
        ) : data.length === 0 ? (
          <div className="py-16 text-center">
            <Users size={40} className="mx-auto mb-3 opacity-20" style={{ color: 'var(--text-tertiary)' }} />
            <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>No agent data available</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr style={{ backgroundColor: '#F7F8F9' }}>
                  {['Agent', 'License ID', 'Region', 'Phone', 'KYC Status', 'Onboarding', 'Active Trades', 'Joined', 'Status'].map((h) => (
                    <th key={h} className="px-5 py-3 text-xs font-bold uppercase tracking-wider whitespace-nowrap" style={{ color: 'var(--text-tertiary)' }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {data.map((r, i) => {
                  const kycS = KYC_STYLE[r.kycStatus] || { bg: '#F0F0F0', text: '#6B7078' };
                  return (
                    <tr key={i} className="border-t hover:bg-gray-50/50 transition-colors" style={{ borderColor: 'var(--border-light)' }}>
                      <td className="px-5 py-3.5">
                        <p className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>{r.agentName}</p>
                        <p className="text-xs" style={{ color: 'var(--text-tertiary)' }}>{r.email}</p>
                      </td>
                      <td className="px-5 py-3.5 text-sm font-mono" style={{ color: 'var(--text-secondary)' }}>{r.licenseId}</td>
                      <td className="px-5 py-3.5 text-sm" style={{ color: 'var(--text-secondary)' }}>{r.region}</td>
                      <td className="px-5 py-3.5 text-sm" style={{ color: 'var(--text-secondary)' }}>{r.phone || '—'}</td>
                      <td className="px-5 py-3.5">
                        <span className="text-xs font-bold px-2.5 py-1 rounded-full" style={{ backgroundColor: kycS.bg, color: kycS.text }}>{r.kycStatus}</span>
                      </td>
                      <td className="px-5 py-3.5 text-sm" style={{ color: 'var(--text-secondary)' }}>{r.onboardingStatus}</td>
                      <td className="px-5 py-3.5 text-sm font-semibold text-center" style={{ color: 'var(--text-primary)' }}>{r.activeTrades}</td>
                      <td className="px-5 py-3.5 text-xs" style={{ color: 'var(--text-tertiary)' }}>{r.joinedDate ? new Date(r.joinedDate).toLocaleDateString() : '—'}</td>
                      <td className="px-5 py-3.5">
                        <span className="text-xs font-bold px-2.5 py-1 rounded-full" style={{ backgroundColor: r.status === 'Active' ? '#E2FDED' : '#F0F0F0', color: r.status === 'Active' ? '#27AE60' : '#6B7078' }}>{r.status}</span>
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
  );
}

'use client';

import { useState } from 'react';
import { BarChart2, Users, Eye, ArrowRight, Settings, Calendar, Filter } from 'lucide-react';
import { ProductivityReport } from '@/components/features/admin/reports/ProductivityReport';
import { KYAReport } from '@/components/features/admin/reports/KYAReport';
import { OversightReport } from '@/components/features/admin/reports/OversightReport';
import { CorridorReport } from '@/components/features/admin/reports/CorridorReport';
import { AdhocReport } from '@/components/features/admin/reports/AdhocReport';
import type { ReportFilters } from '@/lib/api/reports';

type Tab = 'productivity' | 'kya' | 'oversight' | 'corridor' | 'adhoc';

const TABS: { id: Tab; label: string; icon: React.ElementType; description: string }[] = [
  { id: 'productivity', label: 'Productivity', icon: BarChart2, description: 'Agent performance & customer onboarding metrics' },
  { id: 'kya', label: 'KYA', icon: Users, description: 'Know Your Agents — identity & compliance data' },
  { id: 'oversight', label: 'Oversight', icon: Eye, description: 'Aged/overdue transactions requiring attention' },
  { id: 'corridor', label: 'Transaction Corridor', icon: ArrowRight, description: 'FX pair volume distribution & trends' },
  { id: 'adhoc', label: 'Adhoc', icon: Settings, description: 'Custom user-generated reports with flexible filters' },
];

export default function AdminReportsPage() {
  const [activeTab, setActiveTab] = useState<Tab>('productivity');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [showFilters, setShowFilters] = useState(false);

  const filters: ReportFilters = {
    ...(startDate && { startDate }),
    ...(endDate && { endDate }),
  };

  const activeTabInfo = TABS.find((t) => t.id === activeTab)!;

  return (
    <div className="p-4 md:p-6 lg:pl-7 lg:pr-6 space-y-6" style={{ backgroundColor: '#f7f8f9', minHeight: '100%' }}>
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl lg:text-4xl font-bold mb-1" style={{ color: 'var(--text-primary)' }}>
            Reports
          </h1>
          <p className="text-sm md:text-base" style={{ color: 'var(--text-secondary)' }}>
            Generate and export platform analytics reports
          </p>
        </div>
        {activeTab !== 'adhoc' && (
          <button
            onClick={() => setShowFilters((v) => !v)}
            className="flex items-center gap-2 px-4 py-2 rounded-xl border text-sm font-semibold transition-colors"
            style={{
              borderColor: showFilters ? 'var(--brand-primary)' : 'var(--border-custom)',
              color: showFilters ? 'var(--brand-primary)' : 'var(--text-secondary)',
              backgroundColor: showFilters ? '#FBF4DC' : 'white',
            }}
          >
            <Filter size={15} />
            {showFilters ? 'Hide Filters' : 'Filters'}
          </button>
        )}
      </div>

      {/* Date Filters */}
      {showFilters && activeTab !== 'adhoc' && (
        <div className="bg-white rounded-xl border p-4 flex flex-wrap items-end gap-4" style={{ borderColor: 'var(--border-custom)' }}>
          <div>
            <label className="text-xs font-semibold mb-1.5 flex items-center gap-1" style={{ color: 'var(--text-secondary)' }}>
              <Calendar size={12} /> Start Date
            </label>
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="h-9 px-3 text-sm rounded-lg border outline-none focus:ring-2"
              style={{ borderColor: 'var(--border-custom)' }}
            />
          </div>
          <div>
            <label className="text-xs font-semibold mb-1.5 flex items-center gap-1" style={{ color: 'var(--text-secondary)' }}>
              <Calendar size={12} /> End Date
            </label>
            <input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="h-9 px-3 text-sm rounded-lg border outline-none focus:ring-2"
              style={{ borderColor: 'var(--border-custom)' }}
            />
          </div>
          {(startDate || endDate) && (
            <button
              onClick={() => { setStartDate(''); setEndDate(''); }}
              className="text-xs px-3 py-2 rounded-lg"
              style={{ color: '#EB5757', backgroundColor: '#FEE2E2' }}
            >
              Clear
            </button>
          )}
        </div>
      )}

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

      {/* Active Tab Description */}
      <div className="flex items-center gap-2">
        <activeTabInfo.icon size={16} style={{ color: 'var(--brand-primary)' }} />
        <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>{activeTabInfo.description}</p>
      </div>

      {/* Report Content */}
      {activeTab === 'productivity' && <ProductivityReport filters={filters} />}
      {activeTab === 'kya' && <KYAReport filters={filters} />}
      {activeTab === 'oversight' && <OversightReport filters={filters} />}
      {activeTab === 'corridor' && <CorridorReport filters={filters} />}
      {activeTab === 'adhoc' && <AdhocReport />}
    </div>
  );
}

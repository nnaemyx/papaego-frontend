'use client';

import { useState } from 'react';
import { Download, Filter, FileText } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { reportsApi } from '@/lib/api/reports';
import { toast } from 'sonner';

const REPORT_TYPES = [
  { value: 'productivity', label: 'Productivity — Agent performance & customer onboarding' },
  { value: 'kya', label: 'KYA — Know Your Agents summary' },
  { value: 'oversight', label: 'Oversight — Aged / overdue transactions' },
  { value: 'corridors', label: 'Transaction Corridors — FX pair breakdown' },
];

const STATUS_OPTIONS = [
  { value: 'all', label: 'All Statuses' },
  { value: 'PENDING', label: 'Pending' },
  { value: 'ASSIGNED', label: 'Assigned' },
  { value: 'PROCESSED', label: 'Processed' },
  { value: 'COMPLETED', label: 'Completed' },
  { value: 'CANCELLED', label: 'Cancelled' },
  { value: 'REJECTED', label: 'Rejected' },
];
const REGION_OPTIONS = [
  { value: 'all', label: 'All Regions' },
  { value: 'Nigeria', label: 'Nigeria' },
  { value: 'Ghana', label: 'Ghana' },
  { value: 'Kenya', label: 'Kenya' },
  { value: 'UK', label: 'UK' },
  { value: 'USA', label: 'USA' },
];

export function AdhocReport() {
  const [reportType, setReportType] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [status, setStatus] = useState('all');
  const [region, setRegion] = useState('all');
  const [agentId, setAgentId] = useState('');
  const [isExporting, setIsExporting] = useState(false);

  const handleExport = async () => {
    if (!reportType) { toast.error('Please select a report type'); return; }
    setIsExporting(true);
    try {
      const filters = {
        ...(startDate && { startDate }),
        ...(endDate && { endDate }),
        ...(status && status !== 'all' && { status }),
        ...(region && region !== 'all' && { region }),
        ...(agentId && { agentId }),
      };
      const blob = await reportsApi.exportReport(reportType, filters);
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `papaego-${reportType}-${new Date().toISOString().split('T')[0]}.csv`;
      a.click();
      URL.revokeObjectURL(url);
      toast.success('Report exported successfully!');
    } catch {
      toast.error('Export failed. Please try again.');
    } finally {
      setIsExporting(false);
    }
  };

  const hasFilters = startDate || endDate || (status && status !== 'all') || (region && region !== 'all') || agentId;

  return (
    <div className="space-y-6">
      {/* Info Banner */}
      <div className="flex items-start gap-3 p-4 rounded-xl border" style={{ backgroundColor: '#EFF6FF', borderColor: '#BFDBFE' }}>
        <FileText className="w-5 h-5 shrink-0 mt-0.5" style={{ color: '#3B82F6' }} />
        <div>
          <p className="text-sm font-semibold" style={{ color: '#1E40AF' }}>Custom Report Builder</p>
          <p className="text-xs mt-0.5" style={{ color: '#3B82F6' }}>
            Generate custom reports by selecting a report type and applying filters. Download results as CSV for further analysis.
          </p>
        </div>
      </div>

      <div className="bg-white rounded-xl border shadow-sm p-6" style={{ borderColor: 'var(--border-custom)' }}>
        <div className="flex items-center gap-2 mb-5">
          <Filter size={16} style={{ color: 'var(--brand-primary)' }} />
          <h3 className="font-bold text-sm" style={{ color: 'var(--text-primary)' }}>Report Configuration</h3>
        </div>

        <div className="grid md:grid-cols-2 gap-5">
          {/* Report Type */}
          <div className="md:col-span-2">
            <Label className="text-sm mb-2 block" style={{ color: 'var(--text-primary)' }}>Report Type <span style={{ color: '#EB5757' }}>*</span></Label>
            <Select value={reportType} onValueChange={setReportType}>
              <SelectTrigger className="h-11">
                <SelectValue placeholder="Select report type…" />
              </SelectTrigger>
              <SelectContent>
                {REPORT_TYPES.map((r) => (
                  <SelectItem key={r.value} value={r.value}>{r.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Date Range */}
          <div>
            <Label htmlFor="startDate" className="text-sm mb-2 block" style={{ color: 'var(--text-primary)' }}>Start Date</Label>
            <Input id="startDate" type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} className="h-11" />
          </div>
          <div>
            <Label htmlFor="endDate" className="text-sm mb-2 block" style={{ color: 'var(--text-primary)' }}>End Date</Label>
            <Input id="endDate" type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} className="h-11" />
          </div>

          {/* Status */}
          <div>
            <Label className="text-sm mb-2 block" style={{ color: 'var(--text-primary)' }}>Status Filter</Label>
            <Select value={status} onValueChange={setStatus}>
              <SelectTrigger className="h-11">
                <SelectValue placeholder="All statuses" />
              </SelectTrigger>
              <SelectContent>
                {STATUS_OPTIONS.map((s) => (
                  <SelectItem key={s.value} value={s.value}>{s.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Region */}
          <div>
            <Label className="text-sm mb-2 block" style={{ color: 'var(--text-primary)' }}>Region</Label>
            <Select value={region} onValueChange={setRegion}>
              <SelectTrigger className="h-11">
                <SelectValue placeholder="All regions" />
              </SelectTrigger>
              <SelectContent>
                {REGION_OPTIONS.map((r) => (
                  <SelectItem key={r.value} value={r.value}>{r.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Agent ID */}
          <div className="md:col-span-2">
            <Label htmlFor="agentId" className="text-sm mb-2 block" style={{ color: 'var(--text-primary)' }}>Agent ID (optional)</Label>
            <Input
              id="agentId"
              placeholder="Filter by specific agent ID…"
              value={agentId}
              onChange={(e) => setAgentId(e.target.value)}
              className="h-11"
            />
          </div>
        </div>

        {/* Active Filters Summary */}
        {hasFilters && (
          <div className="flex flex-wrap gap-2 mt-4 pt-4 border-t" style={{ borderColor: 'var(--border-light)' }}>
            <span className="text-xs" style={{ color: 'var(--text-tertiary)' }}>Active filters:</span>
            {startDate && <span className="text-xs px-2 py-0.5 rounded-full" style={{ backgroundColor: '#E2FDED', color: '#27AE60' }}>From: {startDate}</span>}
            {endDate && <span className="text-xs px-2 py-0.5 rounded-full" style={{ backgroundColor: '#E2FDED', color: '#27AE60' }}>To: {endDate}</span>}
            {status && status !== 'all' && <span className="text-xs px-2 py-0.5 rounded-full" style={{ backgroundColor: '#EFF6FF', color: '#3B82F6' }}>Status: {status}</span>}
            {region && region !== 'all' && <span className="text-xs px-2 py-0.5 rounded-full" style={{ backgroundColor: '#FFF8E1', color: '#C9A227' }}>Region: {region}</span>}
            {agentId && <span className="text-xs px-2 py-0.5 rounded-full" style={{ backgroundColor: '#F5F3FF', color: '#7C3AED' }}>Agent: {agentId}</span>}
          </div>
        )}

        <div className="flex gap-3 mt-6">
          <Button
            onClick={handleExport}
            disabled={!reportType || isExporting}
            className="h-11 px-6 flex items-center gap-2"
            style={{ backgroundColor: 'var(--brand-primary)', color: '#fff' }}
          >
            <Download size={16} />
            {isExporting ? 'Generating…' : 'Generate & Export CSV'}
          </Button>
          <Button
            variant="outline"
            className="h-11 px-4"
            onClick={() => { setStartDate(''); setEndDate(''); setStatus('all'); setRegion('all'); setAgentId(''); setReportType(''); }}
          >
            Reset
          </Button>
        </div>
      </div>

      {/* Quick Export Cards */}
      <div>
        <h3 className="font-bold text-sm mb-3" style={{ color: 'var(--text-primary)' }}>Quick Reports</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {REPORT_TYPES.map((r) => (
            <button
              key={r.value}
              onClick={() => { setReportType(r.value); }}
              className="text-left p-4 rounded-xl border bg-white hover:shadow-sm transition-all hover:border-[#C9A227]"
              style={{ borderColor: reportType === r.value ? '#C9A227' : 'var(--border-custom)', backgroundColor: reportType === r.value ? '#FBF4DC' : 'white' }}
            >
              <FileText size={20} className="mb-2" style={{ color: reportType === r.value ? '#C9A227' : 'var(--text-tertiary)' }} />
              <p className="text-sm font-bold" style={{ color: 'var(--text-primary)' }}>
                {r.label.split('—')[0].trim()}
              </p>
              <p className="text-xs mt-0.5" style={{ color: 'var(--text-tertiary)' }}>
                {r.label.split('—')[1]?.trim()}
              </p>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

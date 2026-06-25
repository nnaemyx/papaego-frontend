'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import { agentApplicationsApi, AgentApplication } from '@/lib/api/agent-applications';
import { Search, Eye, ChevronLeft, ChevronRight } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';

const STATUS_OPTIONS = ['ALL', 'PENDING', 'REVIEWED', 'APPROVED', 'REJECTED'];

const STATUS_STYLES: Record<string, { bg: string; color: string }> = {
  PENDING: { bg: '#fff8ce', color: '#a97600' },
  REVIEWED: { bg: '#dbeafe', color: '#1248a6' },
  APPROVED: { bg: '#e2fded', color: '#27ae60' },
  REJECTED: { bg: '#ffe5e5', color: '#e05555' },
};

function StatusBadge({ status }: { status: string }) {
  const s = STATUS_STYLES[status] || { bg: '#f0f0f0', color: '#666' };
  return (
    <span
      className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold"
      style={{ backgroundColor: s.bg, color: s.color }}
    >
      {status}
    </span>
  );
}

export default function AgentApplicationsPage() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [page, setPage] = useState(1);
  const LIMIT = 15;

  const { data, isLoading } = useQuery({
    queryKey: ['agent-applications', search, statusFilter, page],
    queryFn: () =>
      agentApplicationsApi.getAll({
        search: search || undefined,
        status: statusFilter !== 'ALL' ? statusFilter : undefined,
        page,
        limit: LIMIT,
      }),
    placeholderData: (prev) => prev,
  });

  const { data: stats } = useQuery({
    queryKey: ['agent-application-stats'],
    queryFn: agentApplicationsApi.getStats,
  });

  const applications = data?.applications ?? [];
  const totalPages = data?.totalPages ?? 1;
  const total = data?.total ?? 0;

  return (
    <div className="space-y-6 p-4 md:p-6 lg:pl-7 lg:pr-6" style={{ backgroundColor: '#f7f8f9', minHeight: '100vh' }}>
      {/* Header */}
      <div className="space-y-1">
        <h1
          className="text-4xl font-bold"
          style={{ color: 'var(--text-primary)', fontFamily: 'var(--font-public-sans)' }}
        >
          Agent Applications
        </h1>
        <p style={{ color: 'var(--text-secondary)', fontFamily: 'var(--font-public-sans)' }}>
          Review and manage inbound agent sign-up applications from the public page.
        </p>
      </div>

      {/* Stats row */}
      {stats && (
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-4">
          {[
            { label: 'Total', value: stats.total, color: 'var(--text-primary)' },
            { label: 'Pending', value: stats.pending, color: '#a97600' },
            { label: 'Reviewed', value: stats.reviewed, color: '#1248a6' },
            { label: 'Approved', value: stats.approved, color: '#27ae60' },
            { label: 'Rejected', value: stats.rejected, color: '#e05555' },
          ].map((s) => (
            <div
              key={s.label}
              className="rounded-xl p-4 flex flex-col gap-1"
              style={{ backgroundColor: '#fff', border: '1px solid var(--border-light)' }}
            >
              <span className="text-2xl font-bold" style={{ color: s.color, fontFamily: 'var(--font-public-sans)' }}>
                {s.value}
              </span>
              <span className="text-xs text-gray-500 font-medium">{s.label}</span>
            </div>
          ))}
        </div>
      )}

      {/* Filter bar */}
      <div className="flex flex-col md:flex-row gap-4 items-start md:items-center justify-between">
        <div className="flex flex-wrap gap-2">
          {STATUS_OPTIONS.map((s) => (
            <button
              key={s}
              onClick={() => { setStatusFilter(s); setPage(1); }}
              className="px-4 py-2 rounded-lg text-sm font-semibold transition-all"
              style={{
                backgroundColor: statusFilter === s ? 'var(--brand-primary)' : '#fff',
                color: statusFilter === s ? '#fff' : 'var(--text-secondary)',
                border: '1.5px solid',
                borderColor: statusFilter === s ? 'var(--brand-primary)' : 'var(--border-custom)',
                fontFamily: 'var(--font-public-sans)',
              }}
            >
              {s}
            </button>
          ))}
        </div>

        <div className="relative w-full md:w-72">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            placeholder="Search by name, email, country…"
            className="pl-10"
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1); }}
          />
        </div>
      </div>

      {/* Table */}
      <div
        className="rounded-xl overflow-hidden"
        style={{ border: '1px solid var(--border-custom)', backgroundColor: '#fff' }}
      >
        {isLoading ? (
          <div className="flex items-center justify-center py-20">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2" style={{ borderColor: 'var(--brand-primary)' }} />
          </div>
        ) : applications.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 gap-2">
            <p className="text-base font-medium" style={{ color: 'var(--text-secondary)' }}>No applications found</p>
            <p className="text-sm" style={{ color: 'var(--text-tertiary)' }}>
              {statusFilter !== 'ALL' || search ? 'Try adjusting your filters.' : 'Applications submitted from the public page will appear here.'}
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr style={{ borderBottom: '1px solid var(--border-light)', backgroundColor: '#f7f8f9' }}>
                  {['Full Name', 'Email', 'Phone', 'Country', 'Occupation', 'Status', 'Applied', 'Action'].map((h) => (
                    <th
                      key={h}
                      className="px-5 py-3 text-left text-xs font-bold uppercase tracking-wider"
                      style={{ color: 'var(--text-tertiary)', fontFamily: 'var(--font-public-sans)' }}
                    >
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {applications.map((app: AgentApplication, idx: number) => (
                  <tr
                    key={app.id}
                    className="transition-colors hover:bg-amber-50/40 cursor-pointer"
                    style={{ borderBottom: idx < applications.length - 1 ? '1px solid var(--border-light)' : 'none' }}
                    onClick={() => router.push(`/admin/agent-applications/${app.id}`)}
                  >
                    <td className="px-5 py-4">
                      <span className="font-semibold text-sm" style={{ color: 'var(--text-primary)', fontFamily: 'var(--font-public-sans)' }}>
                        {app.fullName}
                      </span>
                    </td>
                    <td className="px-5 py-4">
                      <span className="text-sm" style={{ color: 'var(--text-secondary)' }}>{app.email}</span>
                    </td>
                    <td className="px-5 py-4">
                      <span className="text-sm" style={{ color: 'var(--text-secondary)' }}>{app.phone}</span>
                    </td>
                    <td className="px-5 py-4">
                      <span className="text-sm" style={{ color: 'var(--text-secondary)' }}>{app.country}</span>
                    </td>
                    <td className="px-5 py-4">
                      <span className="text-sm" style={{ color: 'var(--text-secondary)' }}>{app.occupation}</span>
                    </td>
                    <td className="px-5 py-4">
                      <StatusBadge status={app.status} />
                    </td>
                    <td className="px-5 py-4">
                      <span className="text-xs" style={{ color: 'var(--text-tertiary)' }}>
                        {new Date(app.createdAt).toLocaleDateString('en-GB', {
                          day: '2-digit', month: 'short', year: 'numeric',
                        })}
                      </span>
                    </td>
                    <td className="px-5 py-4">
                      <button
                        onClick={(e) => { e.stopPropagation(); router.push(`/admin/agent-applications/${app.id}`); }}
                        className="flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-lg transition-all hover:opacity-80"
                        style={{ backgroundColor: '#fef9ec', color: 'var(--brand-primary)', border: '1px solid var(--brand-primary)' }}
                      >
                        <Eye className="w-3.5 h-3.5" />
                        View
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between">
          <p className="text-sm" style={{ color: 'var(--text-tertiary)' }}>
            Showing {(page - 1) * LIMIT + 1}–{Math.min(page * LIMIT, total)} of {total} applications
          </p>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page === 1}
            >
              <ChevronLeft className="w-4 h-4" />
            </Button>
            <span className="text-sm font-medium px-2" style={{ color: 'var(--text-primary)' }}>
              {page} / {totalPages}
            </span>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={page === totalPages}
            >
              <ChevronRight className="w-4 h-4" />
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}

'use client';

import { useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { agentApplicationsApi } from '@/lib/api/agent-applications';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import {
  ArrowLeft, User, Mail, Phone, Globe, MapPin, Briefcase,
  Linkedin, MessageSquare, Building2, Users, Loader2, CheckCircle, XCircle, Clock,
} from 'lucide-react';

const STATUS_OPTIONS = ['PENDING', 'REVIEWED', 'APPROVED', 'REJECTED'];

const STATUS_META: Record<string, { icon: typeof CheckCircle; color: string; bg: string }> = {
  PENDING: { icon: Clock, color: '#a97600', bg: '#fff8ce' },
  REVIEWED: { icon: Clock, color: '#1248a6', bg: '#dbeafe' },
  APPROVED: { icon: CheckCircle, color: '#27ae60', bg: '#e2fded' },
  REJECTED: { icon: XCircle, color: '#e05555', bg: '#ffe5e5' },
};

function InfoRow({ icon: Icon, label, value }: { icon: typeof User; label: string; value: string | null | undefined | boolean }) {
  if (value === null || value === undefined || value === '') return null;
  const display = typeof value === 'boolean' ? (value ? 'Yes' : 'No') : value;
  return (
    <div className="flex items-start gap-3 py-3" style={{ borderBottom: '1px solid var(--border-light)' }}>
      <div
        className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5"
        style={{ backgroundColor: '#fef9ec' }}
      >
        <Icon className="w-4 h-4" style={{ color: 'var(--brand-primary)' }} />
      </div>
      <div>
        <p className="text-xs font-semibold uppercase tracking-wider mb-0.5" style={{ color: 'var(--text-tertiary)', fontFamily: 'var(--font-public-sans)' }}>
          {label}
        </p>
        <p className="text-sm font-medium" style={{ color: 'var(--text-primary)', fontFamily: 'var(--font-public-sans)' }}>
          {display}
        </p>
      </div>
    </div>
  );
}

export default function AgentApplicationDetailPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const queryClient = useQueryClient();
  const [newStatus, setNewStatus] = useState('');
  const [adminNotes, setAdminNotes] = useState('');

  const { data: application, isLoading } = useQuery({
    queryKey: ['agent-application', id],
    queryFn: () => agentApplicationsApi.getOne(id),
    enabled: !!id,
  });

  const updateMutation = useMutation({
    mutationFn: ({ status, notes }: { status: string; notes: string }) =>
      agentApplicationsApi.updateStatus(id, status, notes),
    onSuccess: (data) => {
      toast.success('Application status updated successfully.');
      queryClient.invalidateQueries({ queryKey: ['agent-application', id] });
      queryClient.invalidateQueries({ queryKey: ['agent-applications'] });
      queryClient.invalidateQueries({ queryKey: ['agent-application-stats'] });
      setNewStatus('');
      setAdminNotes('');
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.error || 'Failed to update status.');
    },
  });

  const handleUpdateStatus = () => {
    if (!newStatus) {
      toast.error('Please select a new status.');
      return;
    }
    updateMutation.mutate({ status: newStatus, notes: adminNotes });
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2" style={{ borderColor: 'var(--brand-primary)' }} />
      </div>
    );
  }

  if (!application) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p style={{ color: 'var(--text-secondary)' }}>Application not found.</p>
      </div>
    );
  }

  const statusMeta = STATUS_META[application.status] || STATUS_META.PENDING;
  const StatusIcon = statusMeta.icon;

  return (
    <div className="p-4 md:p-6 lg:pl-7 lg:pr-6 space-y-6" style={{ backgroundColor: '#f7f8f9', minHeight: '100vh' }}>
      {/* Back button + header */}
      <div className="flex items-center gap-4">
        <button
          onClick={() => router.back()}
          className="flex items-center gap-2 text-sm font-medium px-3 py-2 rounded-lg transition-all hover:bg-white"
          style={{ color: 'var(--text-secondary)', fontFamily: 'var(--font-public-sans)' }}
        >
          <ArrowLeft className="w-4 h-4" />
          Back
        </button>
        <div className="flex-1">
          <h1
            className="text-2xl font-bold"
            style={{ color: 'var(--text-primary)', fontFamily: 'var(--font-public-sans)' }}
          >
            {application.fullName}
          </h1>
          <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
            Submitted{' '}
            {new Date(application.createdAt).toLocaleDateString('en-GB', {
              weekday: 'long', day: '2-digit', month: 'long', year: 'numeric',
            })}
          </p>
        </div>
        {/* Current status badge */}
        <span
          className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-bold"
          style={{ backgroundColor: statusMeta.bg, color: statusMeta.color }}
        >
          <StatusIcon className="w-4 h-4" />
          {application.status}
        </span>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left: applicant details */}
        <div className="lg:col-span-2 space-y-6">
          {/* Personal info */}
          <div
            className="rounded-xl p-6"
            style={{ backgroundColor: '#fff', border: '1px solid var(--border-custom)' }}
          >
            <h2
              className="text-base font-bold mb-4"
              style={{ color: 'var(--text-primary)', fontFamily: 'var(--font-public-sans)' }}
            >
              Personal Information
            </h2>
            <InfoRow icon={User} label="Full Name" value={application.fullName} />
            <InfoRow icon={Mail} label="Email Address" value={application.email} />
            <InfoRow icon={Phone} label="Phone Number" value={application.phone} />
            <InfoRow icon={Globe} label="Country" value={application.country} />
            <InfoRow icon={MapPin} label="State / City" value={application.stateCity} />
            <InfoRow icon={Briefcase} label="Occupation" value={application.occupation} />
            {application.linkedIn && (
              <InfoRow icon={Linkedin} label="LinkedIn Profile" value={application.linkedIn} />
            )}
          </div>

          {/* Application details */}
          <div
            className="rounded-xl p-6"
            style={{ backgroundColor: '#fff', border: '1px solid var(--border-custom)' }}
          >
            <h2
              className="text-base font-bold mb-4"
              style={{ color: 'var(--text-primary)', fontFamily: 'var(--font-public-sans)' }}
            >
              Application Details
            </h2>
            <InfoRow icon={MessageSquare} label="How They Heard About PapaEgo" value={application.hearAboutUs} />
            <InfoRow icon={Building2} label="Owns or Operates a Business" value={application.ownsOrOperatesBusiness} />
            {application.networkSize && (
              <InfoRow icon={Users} label="Estimated Network Size" value={application.networkSize} />
            )}

            <div className="pt-4">
              <p className="text-xs font-semibold uppercase tracking-wider mb-2" style={{ color: 'var(--text-tertiary)', fontFamily: 'var(--font-public-sans)' }}>
                Why They Want to Be an Agent
              </p>
              <p
                className="text-sm leading-relaxed p-4 rounded-lg"
                style={{ backgroundColor: '#f7f8f9', color: 'var(--text-primary)', fontFamily: 'var(--font-public-sans)' }}
              >
                {application.whyAgent}
              </p>
            </div>
          </div>
        </div>

        {/* Right: status management */}
        <div className="space-y-4">
          <div
            className="rounded-xl p-6 space-y-4"
            style={{ backgroundColor: '#fff', border: '1px solid var(--border-custom)' }}
          >
            <h2
              className="text-base font-bold"
              style={{ color: 'var(--text-primary)', fontFamily: 'var(--font-public-sans)' }}
            >
              Update Status
            </h2>

            <div className="space-y-2">
              <label className="text-xs font-semibold uppercase tracking-wider" style={{ color: 'var(--text-tertiary)' }}>
                New Status
              </label>
              <select
                value={newStatus}
                onChange={(e) => setNewStatus(e.target.value)}
                className="w-full px-3 py-2.5 rounded-lg text-sm border outline-none"
                style={{
                  borderColor: 'var(--border-custom)',
                  color: 'var(--text-primary)',
                  fontFamily: 'var(--font-public-sans)',
                }}
              >
                <option value="">— Select status —</option>
                {STATUS_OPTIONS.filter((s) => s !== application.status).map((s) => (
                  <option key={s} value={s}>{s}</option>
                ))}
              </select>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-semibold uppercase tracking-wider" style={{ color: 'var(--text-tertiary)' }}>
                Admin Notes (optional)
              </label>
              <textarea
                rows={4}
                value={adminNotes}
                onChange={(e) => setAdminNotes(e.target.value)}
                placeholder="Internal notes about this applicant…"
                className="w-full px-3 py-2.5 rounded-lg text-sm border outline-none resize-none"
                style={{
                  borderColor: 'var(--border-custom)',
                  color: 'var(--text-primary)',
                  fontFamily: 'var(--font-public-sans)',
                }}
              />
            </div>

            <Button
              onClick={handleUpdateStatus}
              disabled={!newStatus || updateMutation.isPending}
              className="w-full font-semibold"
              style={{
                backgroundColor: 'var(--brand-primary)',
                color: '#fff',
                fontFamily: 'var(--font-public-sans)',
              }}
            >
              {updateMutation.isPending ? (
                <span className="flex items-center gap-2">
                  <Loader2 className="w-4 h-4 animate-spin" /> Updating…
                </span>
              ) : (
                'Update Status'
              )}
            </Button>
          </div>

          {/* Admin notes display */}
          {application.adminNotes && (
            <div
              className="rounded-xl p-5"
              style={{ backgroundColor: '#fff', border: '1px solid var(--border-custom)' }}
            >
              <h3
                className="text-sm font-bold mb-2"
                style={{ color: 'var(--text-primary)', fontFamily: 'var(--font-public-sans)' }}
              >
                Previous Admin Notes
              </h3>
              <p className="text-sm leading-relaxed" style={{ color: 'var(--text-secondary)', fontFamily: 'var(--font-public-sans)' }}>
                {application.adminNotes}
              </p>
            </div>
          )}

          {/* Quick info */}
          <div
            className="rounded-xl p-5 space-y-3"
            style={{ backgroundColor: '#fef9ec', border: '1px solid rgba(201,162,39,0.3)' }}
          >
            <p className="text-xs font-bold uppercase tracking-wider" style={{ color: 'var(--brand-primary)' }}>
              Quick Info
            </p>
            <div className="space-y-1.5">
              <p className="text-xs" style={{ color: 'var(--text-secondary)' }}>
                <span className="font-semibold">Applied:</span>{' '}
                {new Date(application.createdAt).toLocaleString('en-GB')}
              </p>
              <p className="text-xs" style={{ color: 'var(--text-secondary)' }}>
                <span className="font-semibold">Last Updated:</span>{' '}
                {new Date(application.updatedAt).toLocaleString('en-GB')}
              </p>
              <p className="text-xs" style={{ color: 'var(--text-secondary)' }}>
                <span className="font-semibold">Application ID:</span>{' '}
                <span className="font-mono">{application.id}</span>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

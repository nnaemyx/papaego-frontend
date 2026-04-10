'use client';

import { useState, useEffect, useRef } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { agentProfileApi } from '@/lib/api/agent-profile';
import { referralApi } from '@/lib/api/referral';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { User, Upload, MapPin, Phone, Mail, CreditCard, Calendar, Hash, Building2, Shield, Copy, Check, Link2, Users, TrendingUp } from 'lucide-react';
import { toast } from 'sonner';
import { formatDate } from '@/lib/formatters';

export default function AgentProfilePage() {
  const queryClient = useQueryClient();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const [isUploadingAvatar, setIsUploadingAvatar] = useState(false);
  const [copiedCode, setCopiedCode] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);

  const { data: profile, isLoading } = useQuery({
    queryKey: ['agent-profile'],
    queryFn: agentProfileApi.getProfile,
  });

  const { data: referralInfo } = useQuery({
    queryKey: ['agent-referral-info'],
    queryFn: referralApi.getAgentReferralInfo,
  });

  useEffect(() => {
    if (profile) {
      setFirstName(profile.firstName || '');
      setLastName(profile.lastName || '');
      setPhone(profile.phone || '');
      setAddress(profile.agentProfile?.homeAddress || '');
      if (profile.agentProfile?.governmentIdUrl?.startsWith('/uploads/')) {
        setAvatarPreview(profile.agentProfile.governmentIdUrl);
      }
    }
  }, [profile]);

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setAvatarPreview(URL.createObjectURL(file));
    setIsUploadingAvatar(true);
    try {
      const result = await agentProfileApi.uploadAvatar(file);
      setAvatarPreview(result.avatarUrl);
      toast.success('Profile photo updated!');
      queryClient.invalidateQueries({ queryKey: ['agent-profile'] });
    } catch {
      toast.error('Failed to upload photo. Please try again.');
      setAvatarPreview(null);
    } finally {
      setIsUploadingAvatar(false);
    }
  };

  const updateMutation = useMutation({
    mutationFn: () => agentProfileApi.updateProfile({ firstName, lastName, phone, address }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['agent-profile'] });
      toast.success('Profile updated successfully!');
    },
    onError: () => toast.error('Failed to update profile.'),
  });

  const copyText = (text: string, type: 'code' | 'link') => {
    navigator.clipboard.writeText(text).then(() => {
      if (type === 'code') { setCopiedCode(true); setTimeout(() => setCopiedCode(false), 2000); }
      else { setCopiedLink(true); setTimeout(() => setCopiedLink(false), 2000); }
    });
  };

  const handleSave = () => {
    if (!firstName || !lastName || !phone) {
      toast.error('First Name, Last Name, and Phone are required.');
      return;
    }
    updateMutation.mutate();
  };

  if (isLoading) {
    return (
      <div className="p-8">
        <div className="space-y-4">
          <div className="h-8 bg-gray-200 rounded-xl w-48 animate-pulse" />
          <div className="h-64 bg-gray-100 rounded-2xl animate-pulse" />
        </div>
      </div>
    );
  }

  const ap = profile?.agentProfile;
  const statusColor = ap?.onboardingStatus === 'COMPLETED' ? { bg: '#E2FDED', text: '#27AE60' } : { bg: '#FFF8E1', text: '#F59E0B' };

  return (
    <div className="p-4 md:p-6 lg:p-8 space-y-8" style={{ backgroundColor: '#f7f8f9', minHeight: '100%' }}>
      {/* Header */}
      <div>
        <h1 className="text-2xl md:text-3xl lg:text-4xl font-bold mb-1.5" style={{ color: 'var(--text-primary)' }}>
          My Profile
        </h1>
        <p className="text-sm md:text-base" style={{ color: 'var(--text-secondary)' }}>
          Manage your personal information and agent details
        </p>
      </div>

      {/* Profile Hero Card */}
      <div className="bg-white rounded-2xl border shadow-sm overflow-hidden" style={{ borderColor: 'var(--border-custom)' }}>
        {/* Banner */}
        <div className="h-24 w-full" style={{ background: 'linear-gradient(135deg, #012333 0%, #C9A227 100%)' }} />
        <div className="px-6 pb-6">
          {/* Avatar + Name Row */}
          <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4 -mt-12 mb-6">
            <div className="flex items-end gap-4">
              <div className="relative">
                <div className="w-24 h-24 rounded-full border-4 border-white bg-gray-100 flex items-center justify-center overflow-hidden shadow-md">
                  {avatarPreview ? (
                    <img src={avatarPreview} alt="Avatar" className="w-full h-full object-cover" />
                  ) : (
                    <User className="w-10 h-10 text-gray-400" />
                  )}
                </div>
                <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handleAvatarUpload} />
                <button
                  onClick={() => fileInputRef.current?.click()}
                  disabled={isUploadingAvatar}
                  className="absolute bottom-0 right-0 w-7 h-7 rounded-full border-2 border-white flex items-center justify-center shadow-sm"
                  style={{ backgroundColor: 'var(--brand-primary)' }}
                >
                  <Upload className="w-3.5 h-3.5 text-white" />
                </button>
              </div>
              <div className="mb-1">
                <h2 className="text-xl font-bold" style={{ color: 'var(--text-primary)' }}>
                  {profile?.firstName || ''} {profile?.lastName || '—'}
                </h2>
                <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>{profile?.email}</p>
              </div>
            </div>
            <div className="flex items-center gap-2 mb-1">
              <Badge className="text-xs font-bold px-2.5 py-1" style={{ backgroundColor: statusColor.bg, color: statusColor.text, border: 'none' }}>
                {ap?.onboardingStatus || 'PENDING'}
              </Badge>
              {profile?.isActive && (
                <Badge className="text-xs font-bold px-2.5 py-1" style={{ backgroundColor: '#E2FDED', color: '#27AE60', border: 'none' }}>
                  Active
                </Badge>
              )}
            </div>
          </div>

          {/* Agent Info Pills */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
            {[
              { icon: Hash, label: 'License ID', value: ap?.licenseId || '—' },
              { icon: Building2, label: 'Region', value: ap?.region || '—' },
              { icon: MapPin, label: 'LGA', value: ap?.lga || '—' },
              { icon: Shield, label: 'Role', value: profile?.role || '—' },
            ].map(({ icon: Icon, label, value }) => (
              <div key={label} className="p-3 rounded-xl" style={{ backgroundColor: '#F7F8F9' }}>
                <div className="flex items-center gap-1.5 mb-1">
                  <Icon size={12} style={{ color: 'var(--brand-primary)' }} />
                  <p className="text-[10px] font-bold uppercase tracking-wider" style={{ color: 'var(--text-tertiary)' }}>{label}</p>
                </div>
                <p className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>{value}</p>
              </div>
            ))}
          </div>

          {/* Trade Limits */}
          <div className="grid grid-cols-2 gap-3 mb-6">
            {[
              { label: 'Daily Limit', value: ap?.dailyLimit ? `₦${Number(ap.dailyLimit).toLocaleString()}` : '—' },
              { label: 'Monthly Limit', value: ap?.monthlyLimit ? `₦${Number(ap.monthlyLimit).toLocaleString()}` : '—' },
            ].map(({ label, value }) => (
              <div key={label} className="p-4 rounded-xl border" style={{ borderColor: 'var(--border-custom)' }}>
                <p className="text-xs" style={{ color: 'var(--text-tertiary)' }}>{label}</p>
                <p className="text-lg font-bold mt-0.5" style={{ color: 'var(--brand-primary)' }}>{value}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Edit Personal Info */}
      <Card className="p-6 border shadow-sm rounded-2xl" style={{ borderColor: 'var(--border-custom)' }}>
        <h2 className="text-lg font-bold mb-6" style={{ color: 'var(--text-primary)' }}>
          Personal Information
        </h2>

        <div className="grid md:grid-cols-2 gap-5">
          <div>
            <Label htmlFor="firstName" className="text-sm mb-2 block" style={{ color: 'var(--text-primary)' }}>First Name</Label>
            <Input id="firstName" value={firstName} onChange={(e) => setFirstName(e.target.value)} className="h-12" />
          </div>
          <div>
            <Label htmlFor="lastName" className="text-sm mb-2 block" style={{ color: 'var(--text-primary)' }}>Last Name</Label>
            <Input id="lastName" value={lastName} onChange={(e) => setLastName(e.target.value)} className="h-12" />
          </div>
          <div>
            <Label htmlFor="email" className="text-sm mb-2 block flex items-center gap-2" style={{ color: 'var(--text-primary)' }}>
              <Mail size={14} /> Email Address <span className="text-xs text-gray-400 font-normal">(Read-only)</span>
            </Label>
            <Input id="email" type="email" value={profile?.email || ''} disabled className="h-12 bg-gray-50" />
          </div>
          <div>
            <Label htmlFor="phone" className="text-sm mb-2 block flex items-center gap-2" style={{ color: 'var(--text-primary)' }}>
              <Phone size={14} /> Phone Number
            </Label>
            <Input id="phone" value={phone} onChange={(e) => setPhone(e.target.value)} className="h-12" />
          </div>
          <div className="md:col-span-2">
            <Label htmlFor="address" className="text-sm mb-2 block flex items-center gap-2" style={{ color: 'var(--text-primary)' }}>
              <MapPin size={14} /> Home Address
            </Label>
            <Input id="address" value={address} onChange={(e) => setAddress(e.target.value)} placeholder="Street Address, City, Region" className="h-12" />
          </div>
        </div>

        <Separator className="my-6" />

        {/* Read-only Agent Details */}
        <h3 className="text-sm font-bold mb-4" style={{ color: 'var(--text-primary)' }}>Agent Details (Read-only)</h3>
        <div className="grid md:grid-cols-2 gap-5">
          <div>
            <Label className="text-sm mb-2 block flex items-center gap-2" style={{ color: 'var(--text-secondary)' }}>
              <Calendar size={14} /> Date of Birth
            </Label>
            <Input
              value={ap?.dateOfBirth ? formatDate(ap.dateOfBirth) : '—'}
              disabled className="h-12 bg-gray-50"
            />
          </div>
          <div>
            <Label className="text-sm mb-2 block flex items-center gap-2" style={{ color: 'var(--text-secondary)' }}>
              <CreditCard size={14} /> License ID
            </Label>
            <Input value={ap?.licenseId || '—'} disabled className="h-12 bg-gray-50" />
          </div>
          <div>
            <Label className="text-sm mb-2 block" style={{ color: 'var(--text-secondary)' }}>Region</Label>
            <Input value={ap?.region || '—'} disabled className="h-12 bg-gray-50" />
          </div>
          <div>
            <Label className="text-sm mb-2 block" style={{ color: 'var(--text-secondary)' }}>LGA</Label>
            <Input value={ap?.lga || '—'} disabled className="h-12 bg-gray-50" />
          </div>
        </div>

        <p className="text-xs mt-4" style={{ color: 'var(--text-tertiary)' }}>
          Agent-specific details (license, region, limits) can only be updated by administrators.
        </p>

        <div className="flex gap-4 mt-6">
          <Button
            onClick={handleSave}
            disabled={updateMutation.isPending}
            className="h-12 px-8"
            style={{ backgroundColor: 'var(--brand-primary)', color: '#ffffff' }}
          >
            {updateMutation.isPending ? 'Saving...' : 'Save Changes'}
          </Button>
        </div>
      </Card>

      {/* Referral Card */}
      <Card className="p-6 border shadow-sm rounded-2xl overflow-hidden" style={{ borderColor: 'var(--border-custom)' }}>
        {/* Header bar */}
        <div className="flex items-center gap-3 mb-5">
          <div className="w-10 h-10 rounded-xl flex items-center justify-center"
            style={{ background: 'linear-gradient(135deg, #012333 0%, #C9A227 100%)' }}>
            <Link2 className="w-5 h-5 text-white" />
          </div>
          <div>
            <h2 className="text-lg font-bold" style={{ color: 'var(--text-primary)' }}>My Referral Link</h2>
            <p className="text-xs" style={{ color: 'var(--text-secondary)' }}>
              Share your code or link — earn commissions when referred customers trade
            </p>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 gap-3 mb-5">
          <div className="rounded-xl p-4 flex items-center gap-3" style={{ backgroundColor: '#F7F8F9' }}>
            <div className="w-9 h-9 rounded-lg flex items-center justify-center" style={{ backgroundColor: '#E2FDED' }}>
              <Users className="w-5 h-5" style={{ color: '#27AE60' }} />
            </div>
            <div>
              <p className="text-xs font-medium" style={{ color: 'var(--text-tertiary)' }}>Total Referred</p>
              <p className="text-xl font-bold" style={{ color: 'var(--text-primary)' }}>{referralInfo?.totalReferred ?? 0}</p>
            </div>
          </div>
          <div className="rounded-xl p-4 flex items-center gap-3" style={{ backgroundColor: '#F7F8F9' }}>
            <div className="w-9 h-9 rounded-lg flex items-center justify-center" style={{ backgroundColor: '#FBF4DC' }}>
              <TrendingUp className="w-5 h-5" style={{ color: 'var(--brand-primary)' }} />
            </div>
            <div>
              <p className="text-xs font-medium" style={{ color: 'var(--text-tertiary)' }}>Referral Earnings</p>
              <p className="text-xl font-bold" style={{ color: 'var(--text-primary)' }}>{referralInfo?.commissionFromReferrals ?? '₦0'}</p>
            </div>
          </div>
        </div>

        {/* Referral Code */}
        <div className="space-y-3">
          <div>
            <label className="text-xs font-semibold mb-1.5 block" style={{ color: 'var(--text-secondary)' }}>
              Referral Code
            </label>
            <div className="flex items-center gap-2 border rounded-xl px-4 py-3" style={{ borderColor: 'var(--border-custom)', backgroundColor: '#FAFAFA' }}>
              <span className="flex-1 text-sm font-mono font-bold" style={{ color: 'var(--text-primary)' }}>
                {referralInfo?.referralCode || '—'}
              </span>
              <button
                onClick={() => referralInfo?.referralCode && copyText(referralInfo.referralCode, 'code')}
                disabled={!referralInfo?.referralCode}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors disabled:opacity-40"
                style={{
                  backgroundColor: copiedCode ? '#E2FDED' : '#FBF4DC',
                  color: copiedCode ? '#27AE60' : 'var(--brand-primary)',
                }}
              >
                {copiedCode ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                {copiedCode ? 'Copied!' : 'Copy'}
              </button>
            </div>
          </div>

          <div>
            <label className="text-xs font-semibold mb-1.5 block" style={{ color: 'var(--text-secondary)' }}>
              Referral Link
            </label>
            <div className="flex items-center gap-2 border rounded-xl px-4 py-3" style={{ borderColor: 'var(--border-custom)', backgroundColor: '#FAFAFA' }}>
              <span className="flex-1 text-sm truncate" style={{ color: 'var(--text-secondary)' }}>
                {referralInfo?.referralLink || '—'}
              </span>
              <button
                onClick={() => referralInfo?.referralLink && copyText(referralInfo.referralLink, 'link')}
                disabled={!referralInfo?.referralLink}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors disabled:opacity-40 shrink-0"
                style={{
                  backgroundColor: copiedLink ? '#E2FDED' : '#FBF4DC',
                  color: copiedLink ? '#27AE60' : 'var(--brand-primary)',
                }}
              >
                {copiedLink ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                {copiedLink ? 'Copied!' : 'Copy Link'}
              </button>
            </div>
          </div>

          <p className="text-xs" style={{ color: 'var(--text-tertiary)' }}>
            Customers who sign up using your code or link will be linked to your account. You earn a commission on every trade they complete.
          </p>
        </div>
      </Card>

      {/* Documents */}
      {(ap?.governmentIdUrl || ap?.proofOfAddressUrl) && (
        <Card className="p-6 border shadow-sm rounded-2xl" style={{ borderColor: 'var(--border-custom)' }}>
          <h2 className="text-lg font-bold mb-4" style={{ color: 'var(--text-primary)' }}>Uploaded Documents</h2>
          <div className="grid sm:grid-cols-2 gap-4">
            {ap.governmentIdUrl && (
              <a href={ap.governmentIdUrl} target="_blank" rel="noopener noreferrer"
                className="flex items-center gap-3 p-4 rounded-xl border hover:shadow-sm transition-shadow"
                style={{ borderColor: 'var(--border-custom)' }}>
                <CreditCard size={20} style={{ color: 'var(--brand-primary)' }} />
                <div>
                  <p className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>Government ID</p>
                  <p className="text-xs" style={{ color: 'var(--text-tertiary)' }}>Click to view document</p>
                </div>
              </a>
            )}
            {ap.proofOfAddressUrl && (
              <a href={ap.proofOfAddressUrl} target="_blank" rel="noopener noreferrer"
                className="flex items-center gap-3 p-4 rounded-xl border hover:shadow-sm transition-shadow"
                style={{ borderColor: 'var(--border-custom)' }}>
                <MapPin size={20} style={{ color: 'var(--brand-primary)' }} />
                <div>
                  <p className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>Proof of Address</p>
                  <p className="text-xs" style={{ color: 'var(--text-tertiary)' }}>Click to view document</p>
                </div>
              </a>
            )}
          </div>
        </Card>
      )}
    </div>
  );
}

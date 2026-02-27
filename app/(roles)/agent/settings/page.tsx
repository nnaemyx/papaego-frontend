'use client';

import { useState, useEffect, useRef } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { agentProfileApi } from '@/lib/api/agent-profile';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Separator } from '@/components/ui/separator';
import { User, Lock, CreditCard, Bell, Upload, AlertCircle } from 'lucide-react';
import { toast } from 'sonner';

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState('profile');
  const queryClient = useQueryClient();

  // Profile Form State
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');

  // Avatar state
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const [isUploadingAvatar, setIsUploadingAvatar] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Password Form State
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  // Fetch Profile Data
  const { data: profile, isLoading } = useQuery({
    queryKey: ['agent-profile'],
    queryFn: () => agentProfileApi.getProfile(),
  });

  // Populate form fields on load
  useEffect(() => {
    if (profile) {
      setFirstName(profile.firstName || '');
      setLastName(profile.lastName || '');
      // phone lives directly on User model – always populated from onboarding
      setPhone(profile.phone || '');
      setAddress(profile.agentProfile?.homeAddress || '');
      // If there's an existing avatar stored (governmentIdUrl used as avatar placeholder)
      if (profile.agentProfile?.governmentIdUrl && profile.agentProfile.governmentIdUrl.startsWith('/uploads/')) {
        setAvatarPreview(profile.agentProfile.governmentIdUrl);
      }
    }
  }, [profile]);

  // Handle avatar file selection and upload
  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Show preview immediately
    const previewUrl = URL.createObjectURL(file);
    setAvatarPreview(previewUrl);

    setIsUploadingAvatar(true);
    try {
      const result = await agentProfileApi.uploadAvatar(file);
      // Replace blob URL with server URL
      setAvatarPreview(result.avatarUrl);
      toast.success('Profile photo updated!');
      queryClient.invalidateQueries({ queryKey: ['agent-profile'] });
    } catch (err) {
      toast.error('Failed to upload photo. Please try again.');
      setAvatarPreview(null); // revert preview
    } finally {
      setIsUploadingAvatar(false);
    }
  };

  const handleRemoveAvatar = () => {
    setAvatarPreview(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  // Mutations
  const updateProfileMutation = useMutation({
    mutationFn: () => agentProfileApi.updateProfile({ firstName, lastName, phone, address }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['agent-profile'] });
      alert('Profile updated successfully!');
    },
    onError: () => alert('Failed to update profile.')
  });

  const updatePasswordMutation = useMutation({
    mutationFn: () => agentProfileApi.updatePassword({ currentPassword, newPassword }),
    onSuccess: () => {
      alert('Password updated successfully!');
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    },
    onError: (err: any) => alert(err?.response?.data?.error || 'Failed to update password.')
  });

  const handleProfileSave = () => {
    if (!firstName || !lastName || !phone) {
      return alert("First Name, Last Name, and Phone are required.");
    }
    updateProfileMutation.mutate();
  };

  const handlePasswordSave = () => {
    if (!currentPassword || !newPassword || !confirmPassword) {
      return alert("All password fields are required.");
    }
    if (newPassword !== confirmPassword) {
      return alert("New passwords do not match.");
    }
    updatePasswordMutation.mutate();
  };

  if (isLoading) {
    return <div className="p-8"><p className="animate-pulse">Loading settings...</p></div>;
  }

  return (
    <div className="p-4 md:p-6 lg:p-8">
      {/* Page Header */}
      <div className="mb-6 lg:mb-8">
        <h1 className="text-2xl md:text-3xl lg:text-4xl font-bold mb-2" style={{ color: 'var(--text-primary)' }}>
          Settings
        </h1>
        <p className="text-sm md:text-base" style={{ color: 'var(--text-secondary)' }}>
          Manage your account settings and preferences
        </p>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-2 lg:grid-cols-4 mb-8 h-auto gap-2">
          <TabsTrigger value="profile" className="flex items-center gap-2 py-3">
            <User size={18} />
            <span className="hidden sm:inline">Profile</span>
          </TabsTrigger>
          <TabsTrigger value="security" className="flex items-center gap-2 py-3">
            <Lock size={18} />
            <span className="hidden sm:inline">Security</span>
          </TabsTrigger>
          <TabsTrigger value="payouts" className="flex items-center gap-2 py-3">
            <CreditCard size={18} />
            <span className="hidden sm:inline">Payouts</span>
          </TabsTrigger>
          <TabsTrigger value="notifications" className="flex items-center gap-2 py-3">
            <Bell size={18} />
            <span className="hidden sm:inline">Notifications</span>
          </TabsTrigger>
        </TabsList>

        {/* Profile Tab */}
        <TabsContent value="profile">
          <Card className="p-6 border border-gray-200 bg-white rounded-xl shadow-sm">
            <h2 className="text-xl font-bold mb-6" style={{ color: 'var(--text-primary)' }}>
              Profile Information
            </h2>

            {/* Avatar Upload */}
            <div className="mb-8">
              <Label className="text-sm mb-3 block" style={{ color: 'var(--text-primary)' }}>
                Profile Picture
              </Label>
              <div className="flex items-center gap-6">
                <div className="w-24 h-24 rounded-full bg-gray-100 border border-gray-200 flex items-center justify-center overflow-hidden">
                  {avatarPreview ? (
                    <img
                      src={avatarPreview}
                      alt="Profile"
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <User className="w-10 h-10 text-gray-400" />
                  )}
                </div>
                <div className="flex gap-3">
                  {/* Hidden real file input */}
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/jpeg,image/png,image/jpg,image/webp"
                    className="hidden"
                    onChange={handleAvatarUpload}
                    id="avatar-upload-input"
                  />
                  <Button
                    variant="outline"
                    className="border-2"
                    disabled={isUploadingAvatar}
                    onClick={() => fileInputRef.current?.click()}
                    type="button"
                    style={{
                      borderColor: 'var(--brand-primary)',
                      color: 'var(--brand-primary)',
                    }}
                  >
                    <Upload className="w-4 h-4 mr-2" />
                    {isUploadingAvatar ? 'Uploading...' : 'Upload New'}
                  </Button>
                  <Button variant="outline" type="button" onClick={handleRemoveAvatar}>
                    Remove
                  </Button>
                </div>
              </div>
            </div>

            <Separator className="my-6" />

            {/* Form Fields */}
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <Label htmlFor="firstName" className="text-sm mb-2 block" style={{ color: 'var(--text-primary)' }}>
                  First Name
                </Label>
                <Input
                  id="firstName"
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  className="h-12"
                />
              </div>
              <div>
                <Label htmlFor="lastName" className="text-sm mb-2 block" style={{ color: 'var(--text-primary)' }}>
                  Last Name
                </Label>
                <Input
                  id="lastName"
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  className="h-12"
                />
              </div>
              <div>
                <Label htmlFor="email" className="text-sm mb-2 block" style={{ color: 'var(--text-primary)' }}>
                  Email Address <span className="text-gray-400 font-normal">(Read-only)</span>
                </Label>
                <Input
                  id="email"
                  type="email"
                  value={profile?.email || ''}
                  disabled
                  className="h-12 bg-gray-50"
                />
              </div>
              <div>
                <Label htmlFor="phone" className="text-sm mb-2 block" style={{ color: 'var(--text-primary)' }}>
                  Phone Number
                </Label>
                <Input
                  id="phone"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="h-12"
                />
              </div>
              <div className="md:col-span-2">
                <Label htmlFor="address" className="text-sm mb-2 block" style={{ color: 'var(--text-primary)' }}>
                  Home Address
                </Label>
                <Input
                  id="address"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  placeholder="Street Address, City, Region"
                  className="h-12"
                />
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-4 mt-8">
              <Button
                onClick={handleProfileSave}
                disabled={updateProfileMutation.isPending}
                className="h-12 px-8"
                style={{
                  backgroundColor: 'var(--brand-primary)',
                  color: '#ffffff',
                }}
              >
                {updateProfileMutation.isPending ? 'Saving...' : 'Save Changes'}
              </Button>
            </div>
          </Card>
        </TabsContent>

        {/* Security Tab */}
        <TabsContent value="security">
          <Card className="p-6 border border-gray-200 bg-white rounded-xl shadow-sm">
            <h2 className="text-xl font-bold mb-6" style={{ color: 'var(--text-primary)' }}>
              Security Settings
            </h2>

            {/* Password Change */}
            <div className="space-y-6">
              <div>
                <Label htmlFor="currentPassword" className="text-sm mb-2 block" style={{ color: 'var(--text-primary)' }}>
                  Current Password
                </Label>
                <Input
                  id="currentPassword"
                  type="password"
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  className="h-12"
                  placeholder="Enter current password"
                />
              </div>
              <div>
                <Label htmlFor="newPassword" className="text-sm mb-2 block" style={{ color: 'var(--text-primary)' }}>
                  New Password
                </Label>
                <Input
                  id="newPassword"
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="h-12"
                  placeholder="Enter new password"
                />
              </div>
              <div>
                <Label htmlFor="confirmPassword" className="text-sm mb-2 block" style={{ color: 'var(--text-primary)' }}>
                  Confirm New Password
                </Label>
                <Input
                  id="confirmPassword"
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="h-12"
                  placeholder="Confirm new password"
                />
              </div>

              {/* Password Requirements */}
              <div className="p-4 rounded-lg bg-gray-50 border border-gray-100">
                <p className="text-sm font-medium mb-3" style={{ color: 'var(--text-primary)' }}>
                  Password Requirements:
                </p>
                <ul className="space-y-2 text-sm" style={{ color: 'var(--text-secondary)' }}>
                  <li>• At least 8 characters long</li>
                  <li>• Contains at least one uppercase letter</li>
                  <li>• Contains at least one number</li>
                  <li>• Contains at least one special character</li>
                </ul>
              </div>
            </div>

            <Separator className="my-6" />

            {/* Two-Factor Authentication */}
            <div>
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="font-semibold mb-1" style={{ color: 'var(--text-primary)' }}>
                    Two-Factor Authentication
                  </h3>
                  <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
                    Add an extra layer of security to your account
                  </p>
                </div>
                <Switch disabled />
              </div>
              <p className="text-xs text-blue-600 bg-blue-50 border border-blue-200 p-2 rounded inline-block mt-2">
                2FA functionality is currently managed globally by administrators.
              </p>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-4 mt-8">
              <Button
                onClick={handlePasswordSave}
                disabled={updatePasswordMutation.isPending}
                className="h-12 px-8"
                style={{
                  backgroundColor: 'var(--brand-primary)',
                  color: '#ffffff',
                }}
              >
                {updatePasswordMutation.isPending ? 'Updating...' : 'Update Password'}
              </Button>
            </div>
          </Card>
        </TabsContent>

        {/* Payouts Tab */}
        <TabsContent value="payouts">
          <Card className="p-6 border border-gray-200 bg-white rounded-xl shadow-sm">
            <h2 className="text-xl font-bold mb-4" style={{ color: 'var(--text-primary)' }}>
              Payout Settings
            </h2>

            <div className="p-4 rounded-lg mb-6 flex items-start gap-3" style={{ backgroundColor: "#fff8e1", border: "1px solid #ffd54f", color: "#f57f17" }}>
              <AlertCircle className="w-5 h-5 mt-0.5 shrink-0" />
              <div>
                <p className="font-semibold text-sm">Transactional Payouts Enabled</p>
                <p className="text-sm mt-1">
                  PapaEgo specifies bank payout destination on a <strong>per-transaction basis</strong> entirely. You will not need to manage distinct global bank details here. Ensure your withdrawal requests contain up-to-date NGN payment limits.
                </p>
              </div>
            </div>

            <Separator className="my-6" />

            {/* Commission Rate */}
            <div className="p-6 rounded-lg bg-gray-50 border border-gray-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-semibold mb-1 text-lg" style={{ color: 'var(--text-primary)' }}>
                    Current Commission Rate
                  </p>
                  <p className="text-sm text-gray-500">
                    Your dynamic global earnings margin parameter.
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-3xl font-bold" style={{ color: 'var(--brand-primary)' }}>
                    Variable
                  </p>
                  <p className="text-xs text-gray-400 mt-1">Assigned on trade</p>
                </div>
              </div>
            </div>
          </Card>
        </TabsContent>

        {/* Notifications Tab */}
        <TabsContent value="notifications">
          <Card className="p-6 border border-gray-200 bg-white rounded-xl shadow-sm">
            <h2 className="text-xl font-bold mb-4" style={{ color: 'var(--text-primary)' }}>
              Notification Preferences
            </h2>

            <div className="p-4 rounded-lg mb-6 flex items-start gap-3" style={{ backgroundColor: "#f0f9ff", border: "1px solid #bae6fd", color: "#0369a1" }}>
              <AlertCircle className="w-5 h-5 mt-0.5 shrink-0" />
              <div>
                <p className="font-semibold text-sm">Automated Event Triggers</p>
                <p className="text-sm mt-1">
                  Notification triggers are inherently tied to your Active Agent permissions. Mandatory compliance reports, trade completions, and payout updates will be sent to <strong>{profile?.email || 'your email'}</strong> automatically.
                </p>
              </div>
            </div>

            <div className="space-y-6 opacity-60 pointer-events-none grayscale">
              {/* Email Notifications Segment */}
              <div>
                <h3 className="font-semibold mb-4" style={{ color: 'var(--text-primary)' }}>
                  Email Presets (Locked)
                </h3>
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-4 rounded-lg border border-gray-200 bg-white">
                    <div>
                      <p className="font-medium mb-1">Transaction Updates</p>
                      <p className="text-sm text-gray-500">Get notified about new transactions</p>
                    </div>
                    <Switch checked={true} />
                  </div>
                  <div className="flex items-center justify-between p-4 rounded-lg border border-gray-200 bg-white">
                    <div>
                      <p className="font-medium mb-1">Customer Verification</p>
                      <p className="text-sm text-gray-500">Alerts when customers pass KYC</p>
                    </div>
                    <Switch checked={true} />
                  </div>
                </div>
              </div>
            </div>
          </Card>
        </TabsContent>

      </Tabs>
    </div>
  );
}

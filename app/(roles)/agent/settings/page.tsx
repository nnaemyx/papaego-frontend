'use client';

import { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Separator } from '@/components/ui/separator';
import { User, Lock, CreditCard, Bell, Upload } from 'lucide-react';

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState('profile');

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
          <Card className="p-6 border border-(--border-custom) bg-white rounded-xl">
            <h2 className="text-xl font-bold mb-6" style={{ color: 'var(--text-primary)' }}>
              Profile Information
            </h2>

            {/* Avatar Upload */}
            <div className="mb-8">
              <Label className="text-sm mb-3 block" style={{ color: 'var(--text-primary)' }}>
                Profile Picture
              </Label>
              <div className="flex items-center gap-6">
                <div className="w-24 h-24 rounded-full bg-gray-200 flex items-center justify-center overflow-hidden">
                  <img
                    src="https://i.pravatar.cc/96?u=michael"
                    alt="Profile"
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="flex gap-3">
                  <Button
                    variant="outline"
                    className="border-2"
                    style={{
                      borderColor: 'var(--brand-primary)',
                      color: 'var(--brand-primary)',
                    }}
                  >
                    <Upload className="w-4 h-4 mr-2" />
                    Upload New
                  </Button>
                  <Button variant="outline">Remove</Button>
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
                  defaultValue="Michael"
                  className="h-12"
                />
              </div>
              <div>
                <Label htmlFor="lastName" className="text-sm mb-2 block" style={{ color: 'var(--text-primary)' }}>
                  Last Name
                </Label>
                <Input
                  id="lastName"
                  defaultValue="Thomas"
                  className="h-12"
                />
              </div>
              <div>
                <Label htmlFor="email" className="text-sm mb-2 block" style={{ color: 'var(--text-primary)' }}>
                  Email Address
                </Label>
                <Input
                  id="email"
                  type="email"
                  defaultValue="michael.thomas@papaego.com"
                  className="h-12"
                />
              </div>
              <div>
                <Label htmlFor="phone" className="text-sm mb-2 block" style={{ color: 'var(--text-primary)' }}>
                  Phone Number
                </Label>
                <Input
                  id="phone"
                  defaultValue="+234 801 234 5678"
                  className="h-12"
                />
              </div>
              <div className="md:col-span-2">
                <Label htmlFor="address" className="text-sm mb-2 block" style={{ color: 'var(--text-primary)' }}>
                  Address
                </Label>
                <Input
                  id="address"
                  defaultValue="123 Lagos Street, Victoria Island, Lagos, Nigeria"
                  className="h-12"
                />
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-4 mt-8">
              <Button variant="outline" className="flex-1 md:flex-none h-12 px-8">
                Cancel
              </Button>
              <Button
                className="flex-1 md:flex-none h-12 px-8"
                style={{
                  backgroundColor: 'var(--brand-primary)',
                  color: '#ffffff',
                }}
              >
                Save Changes
              </Button>
            </div>
          </Card>
        </TabsContent>

        {/* Security Tab */}
        <TabsContent value="security">
          <Card className="p-6 border border-(--border-custom) bg-white rounded-xl">
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
                  className="h-12"
                  placeholder="Confirm new password"
                />
              </div>

              {/* Password Requirements */}
              <div className="p-4 rounded-lg bg-gray-50">
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
                <Switch />
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-4 mt-8">
              <Button variant="outline" className="flex-1 md:flex-none h-12 px-8">
                Cancel
              </Button>
              <Button
                className="flex-1 md:flex-none h-12 px-8"
                style={{
                  backgroundColor: 'var(--brand-primary)',
                  color: '#ffffff',
                }}
              >
                Update Password
              </Button>
            </div>
          </Card>
        </TabsContent>

        {/* Payouts Tab */}
        <TabsContent value="payouts">
          <Card className="p-6 border border-(--border-custom) bg-white rounded-xl">
            <h2 className="text-xl font-bold mb-6" style={{ color: 'var(--text-primary)' }}>
              Payout Settings
            </h2>

            {/* Bank Details */}
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <Label htmlFor="bankName" className="text-sm mb-2 block" style={{ color: 'var(--text-primary)' }}>
                  Bank Name
                </Label>
                <Input
                  id="bankName"
                  defaultValue="First Bank of Nigeria"
                  className="h-12"
                />
              </div>
              <div>
                <Label htmlFor="accountNumber" className="text-sm mb-2 block" style={{ color: 'var(--text-primary)' }}>
                  Account Number
                </Label>
                <Input
                  id="accountNumber"
                  defaultValue="0123456789"
                  className="h-12"
                />
              </div>
              <div>
                <Label htmlFor="accountName" className="text-sm mb-2 block" style={{ color: 'var(--text-primary)' }}>
                  Account Name
                </Label>
                <Input
                  id="accountName"
                  defaultValue="Michael Thomas"
                  className="h-12"
                />
              </div>
              <div>
                <Label htmlFor="routingNumber" className="text-sm mb-2 block" style={{ color: 'var(--text-primary)' }}>
                  Routing Number
                </Label>
                <Input
                  id="routingNumber"
                  defaultValue="011000015"
                  className="h-12"
                />
              </div>
            </div>

            <Separator className="my-6" />

            {/* Commission Rate */}
            <div className="p-4 rounded-lg bg-gray-50">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-semibold mb-1" style={{ color: 'var(--text-primary)' }}>
                    Current Commission Rate
                  </p>
                  <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
                    Your earnings per transaction
                  </p>
                </div>
                <p className="text-3xl font-bold" style={{ color: 'var(--brand-primary)' }}>
                  2.5%
                </p>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-4 mt-8">
              <Button variant="outline" className="flex-1 md:flex-none h-12 px-8">
                Cancel
              </Button>
              <Button
                className="flex-1 md:flex-none h-12 px-8"
                style={{
                  backgroundColor: 'var(--brand-primary)',
                  color: '#ffffff',
                }}
              >
                Save Changes
              </Button>
            </div>
          </Card>
        </TabsContent>

        {/* Notifications Tab */}
        <TabsContent value="notifications">
          <Card className="p-6 border border-(--border-custom) bg-white rounded-xl">
            <h2 className="text-xl font-bold mb-6" style={{ color: 'var(--text-primary)' }}>
              Notification Preferences
            </h2>

            <div className="space-y-6">
              {/* Email Notifications */}
              <div>
                <h3 className="font-semibold mb-4" style={{ color: 'var(--text-primary)' }}>
                  Email Notifications
                </h3>
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-4 rounded-lg border border-(--border-custom)">
                    <div>
                      <p className="font-medium mb-1" style={{ color: 'var(--text-primary)' }}>
                        Transaction Updates
                      </p>
                      <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
                        Get notified about new transactions
                      </p>
                    </div>
                    <Switch defaultChecked />
                  </div>
                  <div className="flex items-center justify-between p-4 rounded-lg border border-(--border-custom)">
                    <div>
                      <p className="font-medium mb-1" style={{ color: 'var(--text-primary)' }}>
                        Customer Activity
                      </p>
                      <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
                        Get notified about customer actions
                      </p>
                    </div>
                    <Switch defaultChecked />
                  </div>
                  <div className="flex items-center justify-between p-4 rounded-lg border border-(--border-custom)">
                    <div>
                      <p className="font-medium mb-1" style={{ color: 'var(--text-primary)' }}>
                        Weekly Reports
                      </p>
                      <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
                        Receive weekly performance summaries
                      </p>
                    </div>
                    <Switch />
                  </div>
                </div>
              </div>

              <Separator />

              {/* SMS Notifications */}
              <div>
                <h3 className="font-semibold mb-4" style={{ color: 'var(--text-primary)' }}>
                  SMS Notifications
                </h3>
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-4 rounded-lg border border-(--border-custom)">
                    <div>
                      <p className="font-medium mb-1" style={{ color: 'var(--text-primary)' }}>
                        Critical Alerts
                      </p>
                      <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
                        Important security and account alerts
                      </p>
                    </div>
                    <Switch defaultChecked />
                  </div>
                  <div className="flex items-center justify-between p-4 rounded-lg border border-(--border-custom)">
                    <div>
                      <p className="font-medium mb-1" style={{ color: 'var(--text-primary)' }}>
                        Transaction Confirmations
                      </p>
                      <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
                        SMS confirmation for each transaction
                      </p>
                    </div>
                    <Switch />
                  </div>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-4 mt-8">
              <Button variant="outline" className="flex-1 md:flex-none h-12 px-8">
                Cancel
              </Button>
              <Button
                className="flex-1 md:flex-none h-12 px-8"
                style={{
                  backgroundColor: 'var(--brand-primary)',
                  color: '#ffffff',
                }}
              >
                Save Preferences
              </Button>
            </div>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}

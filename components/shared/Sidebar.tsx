'use client';

import Link from 'next/link';
import Image from 'next/image';
import { usePathname, useRouter } from 'next/navigation';
import { Home, Wallet, Users, Settings, LogOut, ShieldAlert, FileText, X, TrendingUp, UserCircle, Building2, BarChart2, User, ClipboardList, Database, DollarSign, ArrowDownToLine } from 'lucide-react';
import { useAuthStore } from '@/store/auth-store';
import { useState, useEffect } from 'react';


const roleNavigation = {
  AGENT: [
    { name: 'Home', href: '/agent/dashboard', icon: Home },
    { name: 'Transactions', href: '/agent/transactions', icon: Wallet },
    { name: 'Customers', href: '/agent/customers', icon: Users },
    { name: 'Commissions', href: '/agent/commissions', icon: TrendingUp },
    { name: 'Rates', href: '/agent/rates', icon: BarChart2 },
    { name: 'Reports', href: '/agent/reports', icon: FileText },
    { name: 'Profile', href: '/agent/profile', icon: User },
  ],
  CUSTOMER: [
    { name: 'Dashboard', href: '/customer/dashboard', icon: Home },
    { name: 'Wallet', href: '/customer/wallet', icon: Wallet },
    { name: 'My Trades', href: '/customer/trades', icon: TrendingUp },
    // { name: 'Trade Requests', href: '/customer/trade-requests', icon: FileText },
    { name: 'Suppliers', href: '/customer/suppliers', icon: Building2 },
    { name: 'Exchange Rates', href: '/customer/rates', icon: TrendingUp },
    { name: 'Managed Banking', href: '/customer/banking', icon: Database },
    { name: 'Profile', href: '/customer/profile', icon: Users },
  ],
  ORG_OWNER: [
    { name: 'Dashboard', href: '/customer/dashboard', icon: Home },
    { name: 'Wallet', href: '/customer/wallet', icon: Wallet },
    { name: 'My Trades', href: '/customer/trades', icon: TrendingUp },
    // { name: 'Trade Requests', href: '/customer/trade-requests', icon: FileText },
    { name: 'Suppliers', href: '/customer/suppliers', icon: Building2 },
    { name: 'Exchange Rates', href: '/customer/rates', icon: TrendingUp },
    { name: 'Managed Banking', href: '/customer/banking', icon: Database },
    { name: 'Profile', href: '/customer/profile', icon: Users },
  ],
  ORG_ADMIN: [
    { name: 'Dashboard', href: '/customer/dashboard', icon: Home },
    { name: 'Wallet', href: '/customer/wallet', icon: Wallet },
    { name: 'My Trades', href: '/customer/trades', icon: TrendingUp },
    { name: 'Trade Requests', href: '/customer/trade-requests', icon: FileText },
    { name: 'Suppliers', href: '/customer/suppliers', icon: Building2 },
    { name: 'Exchange Rates', href: '/customer/rates', icon: TrendingUp },
    { name: 'Managed Banking', href: '/customer/banking', icon: Database },
    { name: 'Profile', href: '/customer/profile', icon: Users },
  ],
  ADMIN: [
    { name: 'Home', href: '/admin/dashboard', icon: Home },
    { name: 'Business Onboarding', href: '/admin/organizations', icon: Building2 },
    { name: 'Trade Requests', href: '/admin/trade-requests', icon: FileText },
    { name: 'Transactions', href: '/admin/transactions', icon: TrendingUp },
    { name: 'Suppliers', href: '/admin/suppliers', icon: Building2 },
    { name: 'Agents', href: '/admin/agents', icon: Users },
    { name: 'Agent Applications', href: '/admin/agent-applications', icon: ClipboardList },
    { name: 'Customers', href: '/admin/customers', icon: UserCircle },
    { name: 'Deposits', href: '/admin/deposits', icon: ArrowDownToLine },
    { name: 'Commissions', href: '/admin/commissions', icon: Wallet },
    { name: 'Rates', href: '/admin/rates', icon: BarChart2 },
    { name: 'Treasury', href: '/admin/treasury', icon: Database },
    { name: 'Exchange Rates', href: '/admin/exchange-rates', icon: DollarSign },
    { name: 'Audit Logs', href: '/admin/audit-logs', icon: FileText },
    { name: 'Settings', href: '/admin/settings', icon: Settings },
  ],
  COMPLIANCE: [
    { name: 'Dashboard', href: '/compliance/dashboard', icon: Home },
    { name: 'Reports', href: '/compliance/reports', icon: FileText },
    { name: 'Flags', href: '/compliance/flags', icon: ShieldAlert },
  ],
};

interface SidebarProps {
  isOpen?: boolean;
  onClose?: () => void;
}

export function Sidebar({ isOpen = true, onClose }: SidebarProps) {
  const pathname = usePathname();
  const router = useRouter();
  const { user, logout } = useAuthStore();

  // Get user role from auth store
  const userRole = user?.role || 'AGENT'; // Default to AGENT if not logged in
  const navigation = roleNavigation[userRole] || roleNavigation.AGENT;

  const handleLogout = () => {
    logout();
    router.push('/login');
  };

  return (
    <>
      {/* Mobile Overlay */}
      {isOpen && onClose && (
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={onClose}
        />
      )}

      {/* Sidebar */}
      <div
        className={`
          fixed lg:static inset-y-0 left-0 z-50
          w-[260px] h-screen flex flex-col
          transform transition-transform duration-300 ease-in-out
          ${isOpen ? 'translate-x-0' : '-translate-x-full'}
          lg:translate-x-0
        `}
        style={{ backgroundColor: 'var(--brand-sidebar-bg)' }}
      >
        {/* Close button for mobile */}
        {/* Close button for mobile */}
        {onClose && (
          <button
            onClick={onClose}
            className="lg:hidden absolute top-4 right-4 p-2 hover:bg-white/10 rounded-lg"
          >
            <X size={20} style={{ color: '#c4c7cc' }} />
          </button>
        )}

        {/* Logo */}
        <div className="px-6 py-10">
          <Image src="/logo.png" alt="PapaEgo" width={151} height={34} priority />
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-6 space-y-5 overflow-y-auto">
          {navigation.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href || pathname?.startsWith(item.href + '/');

            return (
              <Link
                key={item.name}
                href={item.href}
                className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-all ${isActive
                  ? 'shadow-[0px_5px_10px_rgba(0,0,0,0.5)]'
                  : ''
                  }`}
                style={{
                  backgroundColor: isActive ? 'var(--brand-primary)' : 'transparent',
                }}
              >
                <Icon
                  size={20}
                  style={{ color: isActive ? '#ffffff' : '#c4c7cc' }}
                />
                <span
                  className="text-base font-bold"
                  style={{ color: isActive ? '#ffffff' : '#c4c7cc' }}
                >
                  {item.name}
                </span>
              </Link>
            );
          })}
        </nav>

        {/* Logout */}
        <div className="px-6 pb-12">
          <button
            onClick={handleLogout}
            className="flex items-center w-full gap-3 px-4 py-3 rounded-lg transition-colors hover:bg-white/5"
          >
            <LogOut size={21} style={{ color: 'var(--status-error)' }} />
            <span className="text-base font-normal" style={{ color: 'var(--status-error)' }}>
              Logout
            </span>
          </button>
        </div>
      </div>
    </>
  );
}
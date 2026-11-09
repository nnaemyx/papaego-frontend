'use client';

import Link from 'next/link';
import Image from 'next/image';
import { usePathname, useRouter } from 'next/navigation';
import {
  Home, Wallet, Users, Settings, LogOut, ShieldAlert, FileText, X,
  TrendingUp, UserCircle, Building2, BarChart2, User, ClipboardList,
  Database, DollarSign, ArrowDownToLine, Landmark, ExternalLink
} from 'lucide-react';
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
    { name: 'Overview', href: '/customer/dashboard', icon: Home },
    { name: 'Transfers', href: '/customer/trades', icon: TrendingUp },
    { name: 'Transactions', href: '/customer/wallet', icon: Wallet },
    { name: 'Suppliers', href: '/customer/suppliers', icon: Building2 },
    { name: 'Exchange Rates', href: '/customer/rates', icon: DollarSign },
    { name: 'Profile', href: '/customer/profile', icon: Users },
  ],
  ORG_OWNER: [
    { name: 'Overview', href: '/customer/dashboard', icon: Home },
    { name: 'Transfers', href: '/customer/trades', icon: TrendingUp },
    { name: 'Transactions', href: '/customer/wallet', icon: Wallet },
    { name: 'Suppliers', href: '/customer/suppliers', icon: Building2 },
    { name: 'Exchange Rates', href: '/customer/rates', icon: DollarSign },
    { name: 'Profile', href: '/customer/profile', icon: Users },
  ],
  ORG_ADMIN: [
    { name: 'Overview', href: '/customer/dashboard', icon: Home },
    { name: 'Transfers', href: '/customer/trades', icon: TrendingUp },
    { name: 'Transactions', href: '/customer/wallet', icon: Wallet },
    { name: 'Suppliers', href: '/customer/suppliers', icon: Building2 },
    { name: 'Exchange Rates', href: '/customer/rates', icon: DollarSign },
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

/** External portal links — only shown to ADMIN, never to customers */
const FV_BANK_LINKS = [
  {
    name: 'FV Bank Sandbox',
    href: 'https://sandbox.gma-portal.fvbank.us',
    icon: Landmark,
    badge: 'UAT',
    description: 'Open FV Bank portal to perform test transactions',
  },
];

interface SidebarProps {
  isOpen?: boolean;
  onClose?: () => void;
}

export function Sidebar({ isOpen = true, onClose }: SidebarProps) {
  const pathname = usePathname();
  const router = useRouter();
  const { user, logout } = useAuthStore();

  const userRole = user?.role || 'AGENT';
  const navigation = roleNavigation[userRole] || roleNavigation.AGENT;
  const isAdmin = userRole === 'ADMIN';

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
          w-[300px] h-screen flex flex-col
          transform transition-transform duration-300 ease-in-out
          ${isOpen ? 'translate-x-0' : '-translate-x-full'}
          lg:translate-x-0
        `}
        style={{ backgroundColor: 'var(--brand-sidebar-bg)' }}
      >
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
        <nav className="flex-1 px-6 space-y-5 overflow-y-auto pb-4">
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

          {/* ── FV Bank Portal Links (Admin only) ───────────────────────── */}
          {isAdmin && (
            <div className="pt-3 mt-2 border-t border-white/10">
              <p className="text-[9px] font-bold uppercase tracking-widest text-white/30 px-4 mb-2">
                Banking Portal
              </p>
              {FV_BANK_LINKS.map((item) => {
                const Icon = item.icon;
                return (
                  <a
                    key={item.name}
                    href={item.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    title={item.description}
                    className="flex items-center gap-3 px-4 py-3 rounded-lg transition-all hover:bg-[#C9A227]/10 group cursor-pointer"
                  >
                    <Icon size={20} className="text-[#C9A227] flex-shrink-0" />
                    <span className="text-base font-bold text-[#C9A227] flex-1 truncate">
                      {item.name}
                    </span>
                    <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-[#C9A227]/20 text-[#C9A227] border border-[#C9A227]/30 tracking-wider flex-shrink-0">
                      {item.badge}
                    </span>
                    <ExternalLink size={12} className="text-[#C9A227]/50 group-hover:text-[#C9A227] transition-colors flex-shrink-0" />
                  </a>
                );
              })}
            </div>
          )}
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

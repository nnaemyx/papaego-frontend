'use client';

import Link from 'next/link';
import Image from 'next/image';
import { usePathname, useRouter } from 'next/navigation';
import { Home, PlusCircle, Wallet, Users, FolderOpen, Settings, LogOut, ShieldAlert, FileText, X, TrendingUp, UserCircle } from 'lucide-react';
import { useAuthStore } from '@/store/auth-store';
import { useState, useEffect } from 'react';

const roleNavigation = {
  AGENT: [
    { name: 'Home', href: '/agent/dashboard', icon: Home },
    { name: 'Trade Requests', href: '/agent/trade-requests', icon: FileText },
    { name: 'New Trade', href: '/agent/trades/new', icon: PlusCircle },
    { name: 'Transactions', href: '/agent/transactions', icon: Wallet },
    { name: 'Customers', href: '/agent/customers', icon: Users },
    { name: 'Documents', href: '/agent/documents', icon: FolderOpen },
    { name: 'Settings', href: '/agent/settings', icon: Settings },
  ],
  CUSTOMER: [
    { name: 'Home', href: '/customer/dashboard', icon: Home },
    { name: 'My Trades', href: '/customer/trades', icon: Wallet },
    { name: 'Rates', href: '/customer/rates', icon: TrendingUp },
    { name: 'Profile', href: '/customer/profile', icon: Users },
  ],
  ADMIN: [
    { name: 'Home', href: '/admin/dashboard', icon: Home },
    { name: 'Transactions', href: '/admin/transactions', icon: TrendingUp },
    { name: 'Agents', href: '/admin/agents', icon: Users },
    { name: 'Customers', href: '/admin/customers', icon: UserCircle },
    { name: 'Commissions', href: '/admin/commissions', icon: Wallet },
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
  const navigation = roleNavigation[userRole];

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
        <nav className="flex-1 px-6 space-y-5">
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
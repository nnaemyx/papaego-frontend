'use client';

import Image from 'next/image';
import { Search, Bell, ChevronDown, Menu, User, Settings as SettingsIcon, HelpCircle, LogOut } from 'lucide-react';
import { useAuthStore } from '@/store/auth-store';
import { useState } from 'react';
import { useRouter } from 'next/navigation';

export interface HeaderProps {
  onMenuClick?: () => void;
}

export function Header({ onMenuClick }: HeaderProps) {
  const { user, logout } = useAuthStore();
  const router = useRouter();
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [showMobileSearch, setShowMobileSearch] = useState(false);

  const handleLogout = () => {
    logout();
    router.push('/login');
  };

  return (
    <>
      <header className="h-16 lg:h-[108px] border-b border-(--border-custom) bg-white px-4 lg:px-8 flex items-center justify-between gap-4">
        {/* Mobile Menu Button */}
        {onMenuClick && (
          <button
            onClick={onMenuClick}
            className="lg:hidden p-2 hover:bg-gray-100 rounded-lg shrink-0"
          >
            <Menu size={24} style={{ color: 'var(--text-primary)' }} />
          </button>
        )}

        {/* Desktop Search */}
        <div className="hidden md:flex items-center gap-2 px-4 py-3 border border-(--border-custom) rounded-lg w-full md:w-[360px]">
          <Search size={21} style={{ color: 'var(--text-tertiary)' }} />
          <input
            type="text"
            placeholder="Search ..."
            className="flex-1 outline-none text-base"
            style={{ color: 'var(--text-tertiary)' }}
          />
        </div>

        {/* Mobile Search - Expandable */}
        <div className="md:hidden flex-1 flex items-center justify-center">
          {showMobileSearch ? (
            <div className="flex items-center gap-2 px-3 py-2 border border-(--border-custom) rounded-lg w-full max-w-[280px]">
              <Search size={18} style={{ color: 'var(--text-tertiary)' }} />
              <input
                type="text"
                placeholder="Search ..."
                className="flex-1 outline-none text-sm"
                style={{ color: 'var(--text-tertiary)' }}
                autoFocus
                onBlur={() => setShowMobileSearch(false)}
              />
            </div>
          ) : (
            <button
              onClick={() => setShowMobileSearch(true)}
              className="p-2 hover:bg-gray-100 rounded-lg"
            >
              <Search size={20} style={{ color: 'var(--text-tertiary)' }} />
            </button>
          )}
        </div>

        {/* User Section */}
        <div className="flex items-center gap-3 lg:gap-6 shrink-0">
          {/* Notifications */}
          <button className="relative p-2 hover:bg-gray-100 rounded-lg">
            <Bell size={20} style={{ color: 'var(--text-primary)' }} />
            <span className="absolute top-1 right-1 w-2 h-2 bg-(--status-error) rounded-full"></span>
          </button>

          {/* Profile Dropdown Trigger */}
          <button
            onClick={() => setShowUserMenu(!showUserMenu)}
            className="flex items-center gap-2 lg:gap-3 hover:bg-gray-50 rounded-lg p-1 transition-colors"
          >
            <div className="text-right hidden lg:block">
              <p className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>
                {user?.email || "Michael Thomas"}
              </p>
              <p className="text-xs" style={{ color: 'var(--text-secondary)' }}>
                {user?.role || "Agent"}
              </p>
            </div>
            <div className="w-11 h-11 rounded-full overflow-hidden bg-gray-200 flex items-center justify-center shrink-0">
              <img
                src="https://i.pravatar.cc/44?u=michael"
                alt="User avatar"
                className="w-full h-full object-cover"
              />
            </div>
            <ChevronDown
              size={17}
              className="hidden lg:block"
              style={{
                color: 'var(--text-primary)',
                border: '1.5px solid var(--text-primary)',
                borderRadius: '2px',
                padding: '2px'
              }}
            />
          </button>
        </div>
      </header>

      {/* User Dropdown Menu */}
      {showUserMenu && (
        <>
          {/* Overlay */}
          <div
            className="fixed inset-0 bg-black/20 z-40"
            onClick={() => setShowUserMenu(false)}
          />

          {/* Dropdown Card */}
          <div
            className="fixed top-20 lg:top-24 right-4 lg:right-8 z-50 w-[339px] bg-white rounded-xl border border-(--border-custom) shadow-[0px_10px_30px_rgba(177,177,177,0.2)]"
          >
            {/* User Info Section */}
            <div className="p-5 border-b border-(--border-custom)">
              <div className="flex items-start gap-3">
                <div className="w-11 h-11 rounded-full overflow-hidden bg-gray-200 shrink-0">
                  <img
                    src="https://i.pravatar.cc/44?u=michael"
                    alt="User avatar"
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="text-base font-bold" style={{ color: 'var(--text-primary)' }}>
                      Michael Thomas
                    </h3>
                    <span
                      className="text-xs font-normal px-2 py-0.5 rounded"
                      style={{
                        backgroundColor: 'var(--brand-primary)',
                        color: '#ffffff'
                      }}
                    >
                      Agent
                    </span>
                  </div>
                  <p className="text-xs" style={{ color: 'var(--text-secondary)' }}>
                    michael.thomas@papaego.com
                  </p>
                </div>
              </div>
            </div>

            {/* Menu Items */}
            <div className="p-4">
              <div className="space-y-4">
                {/* View Profile */}
                <button
                  className="flex items-center gap-4 w-full text-left hover:bg-gray-50 p-2 rounded-lg transition-colors"
                  onClick={() => {
                    setShowUserMenu(false);
                    router.push('/agent/settings');
                  }}
                >
                  <User size={20} style={{ color: 'var(--text-primary)' }} />
                  <span className="text-base" style={{ color: 'var(--text-primary)' }}>
                    View Profile
                  </span>
                </button>

                <div className="border-t border-(--border-custom)" />

                {/* Settings */}
                <button
                  className="flex items-center gap-4 w-full text-left hover:bg-gray-50 p-2 rounded-lg transition-colors"
                  onClick={() => {
                    setShowUserMenu(false);
                    router.push('/agent/settings');
                  }}
                >
                  <SettingsIcon size={20} style={{ color: 'var(--text-primary)' }} />
                  <span className="text-base" style={{ color: 'var(--text-primary)' }}>
                    Settings
                  </span>
                </button>

                <div className="border-t border-(--border-custom)" />

                {/* Help & Support */}
                <button
                  className="flex items-center gap-4 w-full text-left hover:bg-gray-50 p-2 rounded-lg transition-colors"
                  onClick={() => {
                    setShowUserMenu(false);
                  }}
                >
                  <HelpCircle size={20} style={{ color: 'var(--text-primary)' }} />
                  <span className="text-base" style={{ color: 'var(--text-primary)' }}>
                    Help & Support
                  </span>
                </button>

                <div className="border-t border-(--border-custom)" />

                {/* Logout */}
                <button
                  className="flex items-center gap-4 w-full text-left hover:bg-red-50 p-2 rounded-lg transition-colors"
                  onClick={() => {
                    setShowUserMenu(false);
                    handleLogout();
                  }}
                >
                  <LogOut size={20} style={{ color: 'var(--status-error)' }} />
                  <span className="text-base" style={{ color: 'var(--status-error)' }}>
                    Logout
                  </span>
                </button>
              </div>
            </div>
          </div>
        </>
      )}
    </>
  );
}
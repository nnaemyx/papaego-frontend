'use client';

import Image from 'next/image';
import { Search, Bell, ChevronDown, Menu, User, Settings as SettingsIcon, HelpCircle, LogOut, Check, CheckCheck } from 'lucide-react';
import { useAuthStore } from '@/store/auth-store';
import { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { notificationApi, Notification } from '@/lib/api/notifications';
import { formatDistanceToNow } from 'date-fns';

export interface HeaderProps {
  onMenuClick?: () => void;
}

export function Header({ onMenuClick }: HeaderProps) {
  const { user, logout } = useAuthStore();
  const router = useRouter();
  const queryClient = useQueryClient();
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [showMobileSearch, setShowMobileSearch] = useState(false);
  const notificationRef = useRef<HTMLDivElement>(null);

  // Fetch notifications
  const { data: notifications = [] } = useQuery({
    queryKey: ['notifications'],
    queryFn: () => notificationApi.getNotifications(),
    refetchInterval: 30000, // Refetch every 30 seconds
  });

  const unreadCount = notifications.filter(n => !n.isRead).length;

  const markAsReadMutation = useMutation({
    mutationFn: (id: string) => notificationApi.markAsRead(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
    },
  });

  const markAllReadMutation = useMutation({
    mutationFn: () => notificationApi.markAllAsRead(),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
    },
  });

  const handleLogout = () => {
    logout();
    router.push('/login');
  };

  // Close menus on click outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (notificationRef.current && !notificationRef.current.contains(event.target as Node)) {
        setShowNotifications(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <>
      <header className="h-16 lg:h-[108px] border-b border-(--border-custom) bg-white px-4 lg:px-8 flex items-center justify-between gap-4 relative z-40">
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
          <div className="relative" ref={notificationRef}>
            <button
              onClick={() => setShowNotifications(!showNotifications)}
              className={`relative p-2 rounded-lg transition-colors ${showNotifications ? 'bg-gray-100' : 'hover:bg-gray-100'}`}
            >
              <Bell size={20} style={{ color: 'var(--text-primary)' }} />
              {unreadCount > 0 && (
                <span className="absolute top-1 right-1 w-4 h-4 bg-(--status-error) text-white text-[10px] flex items-center justify-center rounded-full font-bold">
                  {unreadCount > 9 ? '9+' : unreadCount}
                </span>
              )}
            </button>

            {/* Notifications Dropdown */}
            {showNotifications && (
              <div className="absolute top-full right-0 mt-3 w-80 md:w-96 bg-white rounded-xl border border-(--border-custom) shadow-2xl overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200">
                <div className="p-4 border-b border-(--border-custom) flex items-center justify-between bg-gray-50/50">
                  <h3 className="font-bold text-sm" style={{ color: 'var(--text-primary)' }}>Notifications</h3>
                  {unreadCount > 0 && (
                    <button
                      onClick={() => markAllReadMutation.mutate()}
                      className="text-xs font-medium hover:underline flex items-center gap-1"
                      style={{ color: 'var(--brand-primary)' }}
                    >
                      <CheckCheck size={14} />
                      Mark all as read
                    </button>
                  )}
                </div>

                <div className="max-h-[400px] overflow-y-auto">
                  {notifications.length > 0 ? (
                    notifications.map((n) => (
                      <div
                        key={n.id}
                        onClick={() => {
                          if (!n.isRead) markAsReadMutation.mutate(n.id);
                        }}
                        className={`p-4 border-b border-(--border-custom) last:border-0 hover:bg-gray-50 transition-colors cursor-pointer ${!n.isRead ? 'bg-blue-50/30' : ''}`}
                      >
                        <div className="flex gap-3 items-start">
                          <div className={`w-2 h-2 rounded-full mt-2 shrink-0 ${!n.isRead ? 'bg-blue-500' : 'bg-transparent'}`} />
                          <div className="flex-1 min-w-0">
                            <div className="flex justify-between items-start gap-2">
                              <h4 className={`text-sm font-semibold truncate ${!n.isRead ? 'text-black' : 'text-gray-600'}`}>
                                {n.title}
                              </h4>
                              <div className="flex items-center gap-1.5 shrink-0">
                                <span className="text-[10px] whitespace-nowrap text-gray-400">
                                  {formatDistanceToNow(new Date(n.createdAt), { addSuffix: true })}
                                </span>
                                {!n.isRead && (
                                  <button
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      markAsReadMutation.mutate(n.id);
                                    }}
                                    className="p-1 hover:bg-white rounded border border-green-200 shadow-sm transition-all"
                                    title="Mark as read"
                                  >
                                    <Check size={11} className="text-green-600" />
                                  </button>
                                )}
                              </div>
                            </div>
                            <p className="text-xs text-gray-500 mt-1 line-clamp-2 leading-relaxed">
                              {n.message}
                            </p>
                          </div>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="p-10 text-center">
                      <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-3">
                        <Bell size={20} className="text-gray-400" />
                      </div>
                      <p className="text-sm text-gray-500">No notifications yet</p>
                    </div>
                  )}
                </div>

                {notifications.length > 0 && (
                  <button
                    className="w-full py-3 text-center text-xs font-semibold border-t border-(--border-custom) hover:bg-gray-50 transition-colors"
                    style={{ color: 'var(--brand-primary)' }}
                  >
                    View All Notifications
                  </button>
                )}
              </div>
            )}
          </div>

          {/* Profile Dropdown Trigger */}
          <div className="relative">
            <button
              onClick={() => setShowUserMenu(!showUserMenu)}
              className="flex items-center gap-2 lg:gap-3 hover:bg-gray-50 rounded-lg p-1 transition-colors"
            >
              <div className="text-right hidden lg:block">
                <p className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>
                  {user?.firstName ? `${user.firstName} ${user.lastName || ''}`.trim() : user?.email || "Michael Thomas"}
                </p>
                <p className="text-xs" style={{ color: 'var(--text-secondary)' }}>
                  {user?.role || "Agent"}
                </p>
              </div>
              <div className="w-11 h-11 rounded-full overflow-hidden bg-gray-200 flex items-center justify-center shrink-0 border-2 border-white shadow-sm font-bold text-gray-600">
                {user?.firstName ? user.firstName.charAt(0) : <User size={20} />}
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

            {/* User Dropdown Menu */}
            {showUserMenu && (
              <>
                {/* Overlay */}
                <div
                  className="fixed inset-0 z-40"
                  onClick={() => setShowUserMenu(false)}
                />

                {/* Dropdown Card */}
                <div
                  className="absolute top-full right-0 mt-3 z-50 w-[280px] bg-white rounded-xl border border-(--border-custom) shadow-2xl animate-in fade-in slide-in-from-top-2 duration-200"
                >
                  {/* User Info Section */}
                  <div className="p-4 border-b border-(--border-custom) bg-gray-50/50 rounded-t-xl">
                    <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">Account</p>
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-(--brand-primary) flex items-center justify-center text-white font-bold shadow-md">
                        {user?.firstName ? user.firstName.charAt(0) : 'U'}
                      </div>
                      <div className="min-w-0">
                        <p className="text-sm font-bold truncate" style={{ color: 'var(--text-primary)' }}>
                          {user?.firstName ? `${user.firstName} ${user.lastName || ''}`.trim() : user?.email}
                        </p>
                        <p className="text-[10px] truncate" style={{ color: 'var(--text-secondary)' }}>
                          {user?.email}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Menu Items */}
                  <div className="p-2">
                    <button
                      className="flex items-center gap-3 w-full text-left hover:bg-gray-50 p-2.5 rounded-lg transition-colors group"
                      onClick={() => {
                        setShowUserMenu(false);
                        router.push(`/${user?.role?.toLowerCase()}/settings`);
                      }}
                    >
                      <User size={18} className="text-gray-400 group-hover:text-(--brand-primary)" />
                      <span className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>
                        Profile Settings
                      </span>
                    </button>

                    <button
                      className="flex items-center gap-3 w-full text-left hover:bg-gray-50 p-2.5 rounded-lg transition-colors group"
                      onClick={() => {
                        setShowUserMenu(false);
                      }}
                    >
                      <HelpCircle size={18} className="text-gray-400 group-hover:text-(--brand-primary)" />
                      <span className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>
                        Help & Support
                      </span>
                    </button>

                    <div className="my-2 border-t border-(--border-custom)" />

                    <button
                      className="flex items-center gap-3 w-full text-left hover:bg-red-50 p-2.5 rounded-lg transition-colors group"
                      onClick={() => {
                        setShowUserMenu(false);
                        handleLogout();
                      }}
                    >
                      <LogOut size={18} className="text-(--status-error)" />
                      <span className="text-sm font-bold" style={{ color: 'var(--status-error)' }}>
                        Logout
                      </span>
                    </button>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      </header>
    </>
  );
}
'use client';

import { useQuery } from '@tanstack/react-query';
import { StatCard } from '@/components/dashboard/StatCard';
import { QuickActionCard } from '@/components/dashboard/QuickActionCard';
import { TradesTable } from '@/components/dashboard/TradesTable';
import { PooledRequests } from '@/components/dashboard/PooledRequests';
import { quickActions } from '@/lib/mock-data';
import { agentApi } from '@/lib/api/agent';
import { useAuthStore } from '@/store/auth-store';

export default function AgentDashboard() {
  const user = useAuthStore((state) => state.user);

  // Fetch dashboard stats
  const { data: stats, isLoading: statsLoading } = useQuery({
    queryKey: ['agent-dashboard-stats'],
    queryFn: agentApi.getDashboardStats,
  });

  // Fetch recent trades
  const { data: tradesData, isLoading: tradesLoading } = useQuery({
    queryKey: ['agent-recent-trades'],
    queryFn: () => agentApi.getTrades({ limit: 10, page: 1 }),
  });

  // Map API stats to dashboard format
  const dashboardStats = stats ? [
    {
      title: 'Active Trades',
      value: stats.activeTrades,
      trend: { value: '20%', isPositive: true },
      description: `${stats.totalTrades} total trades`,
    },
    {
      title: 'Completed Trades',
      value: stats.completedTrades,
      trend: { value: '16%', isPositive: true },
      description: 'Successfully completed',
    },
    {
      title: 'Total Commissions',
      value: stats.totalCommissions,
      trend: { value: '10%', isPositive: true },
      description: `${stats.monthlyCommissions} this month`,
    },
    {
      title: 'Pending Documents',
      value: stats.pendingDocuments,
      trend: { value: '17%', isPositive: false },
      description: 'Awaiting review',
    },
  ] : [];

  const agentName = user?.firstName || user?.email?.split('@')[0] || 'Agent';

  return (
    <div className="p-4 md:p-6 lg:pl-7 lg:pr-6">
      {/* Welcome Section */}
      <div className="mb-6 lg:mb-8">
        <h1 className="text-2xl md:text-3xl lg:text-4xl font-bold mb-2" style={{ color: 'var(--text-primary)' }}>
          Hello, {agentName}!
        </h1>
        <p className="text-sm md:text-base" style={{ color: 'var(--text-secondary)' }}>
          Here&apos;s your dashboard at a glance — active trades, commissions, and alerts
        </p>
      </div>

      {/* Dashboard Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6 mb-8 lg:mb-10">
        {statsLoading ? (
          // Loading skeleton
          Array.from({ length: 4 }).map((_, index) => (
            <div key={index} className="h-32 bg-gray-200 rounded-xl animate-pulse" />
          ))
        ) : (
          dashboardStats.map((stat, index) => (
            <StatCard key={index} stat={stat} />
          ))
        )}
      </div>

      {/* Available Requests in Pool */}
      <PooledRequests />

      {/* Quick Actions */}
      <div className="mb-8 lg:mb-10">
        <h2 className="text-xl md:text-2xl font-bold mb-4 md:mb-6" style={{ color: 'var(--text-primary)' }}>
          Quick Actions
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
          {quickActions.map((action, index) => (
            <QuickActionCard key={index} action={action} />
          ))}
        </div>
      </div>

      {/* Recent Trades */}
      <div>
        <h2 className="text-xl md:text-2xl font-bold mb-4 md:mb-6" style={{ color: 'var(--text-primary)' }}>
          Recent Trades
        </h2>
        {tradesLoading ? (
          <div className="h-64 bg-gray-200 rounded-xl animate-pulse" />
        ) : (
          <div className="overflow-x-auto">
            <TradesTable trades={tradesData?.trades || []} />
          </div>
        )}
      </div>
    </div>
  );
}
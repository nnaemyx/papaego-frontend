import { StatCard } from '@/components/dashboard/StatCard';
import { QuickActionCard } from '@/components/dashboard/QuickActionCard';
import { TradesTable } from '@/components/dashboard/TradesTable';
import { dashboardStats, quickActions, recentTrades } from '@/lib/mock-data';

export default function AgentDashboard() {
  return (
    <div className="p-4 md:p-6 lg:pl-7 lg:pr-6">
      {/* Welcome Section */}
      <div className="mb-6 lg:mb-8">
        <h1 className="text-2xl md:text-3xl lg:text-4xl font-bold mb-2" style={{ color: 'var(--text-primary)' }}>
          Hello, Michael!
        </h1>
        <p className="text-sm md:text-base" style={{ color: 'var(--text-secondary)' }}>
          Here&apos;s your dashboard at a glance — active trades, commissions, and alerts
        </p>
      </div>

      {/* Dashboard Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6 mb-8 lg:mb-10">
        {dashboardStats.map((stat, index) => (
          <StatCard key={index} stat={stat} />
        ))}
      </div>

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
        <div className="overflow-x-auto">
          <TradesTable trades={recentTrades} />
        </div>
      </div>
    </div>
  );
}
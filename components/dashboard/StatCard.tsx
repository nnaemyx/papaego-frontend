import { DashboardStat } from '@/lib/types';
import { TrendingUp, TrendingDown } from 'lucide-react';

interface StatCardProps {
  stat: DashboardStat;
}

export function StatCard({ stat }: StatCardProps) {
  const TrendIcon = stat.trend.isPositive ? TrendingUp : TrendingDown;
  const trendColor = stat.trend.isPositive ? 'var(--status-success)' : 'var(--status-error)';
  const trendBg = stat.trend.isPositive ? 'var(--status-success-bg)' : 'var(--status-error-bg)';
  
  return (
    <div className="rounded-xl border border-(--border-custom) bg-white p-5 shadow-[0px_10px_30px_rgba(206,206,206,0.25)]">
      <h3 className="heading-card mb-2">{stat.title}</h3>
      <div className="flex items-center gap-2 mb-3">
        <span className="heading-l">{stat.value}</span>
        <div 
          className="flex items-center gap-1 rounded px-2 py-1"
          style={{ backgroundColor: trendBg }}
        >
          <TrendIcon size={12} style={{ color: trendColor }} />
          <span 
            className="caption font-normal"
            style={{ color: trendColor }}
          >
            {stat.trend.value}
          </span>
        </div>
      </div>
      <p className="body-secondary">{stat.description}</p>
    </div>
  );
}
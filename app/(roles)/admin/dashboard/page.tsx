"use client";

import { useQuery } from "@tanstack/react-query";
import { DashboardStatsCard } from "@/components/features/admin/DashboardStatsCard";
import { TradeHealthOverview } from "@/components/features/admin/TradeHealthOverview";
import { RiskComplianceSnapshot } from "@/components/features/admin/RiskComplianceSnapshot";
import { FinancialPerformanceCard } from "@/components/features/admin/FinancialPerformanceCard";
import { PlatformMetricCard } from "@/components/features/admin/PlatformMetricCard";
import { RecentTransactionsTable } from "@/components/features/admin/RecentTransactionsTable";
import { AgentActivityTable } from "@/components/features/admin/AgentActivityTable";
import { AlertsNotifications } from "@/components/features/admin/AlertsNotifications";
import { Button } from "@/components/ui/button";
import type { Alert } from "@/components/features/admin/AlertsNotifications";
import { transactionsApi } from "@/lib/api/transactions";
import { agentsApi } from "@/lib/api/agents";
import { commissionsApi } from "@/lib/api/commissions";
import { adminTradeRequestsApi } from "@/lib/api/admin-trade-requests";
import { useRouter } from "next/navigation";

const staticAlerts: Alert[] = [
  {
    type: "success",
    title: "System Update",
    message: "Daily reconciliation completed\nAll payment records have been successfully reconciled",
    time: "Yesterday",
  },
];

function formatVolume(n: number): string {
  if (n >= 1_000_000_000) return `₦${(n / 1_000_000_000).toFixed(2)}B`;
  if (n >= 1_000_000) return `₦${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `₦${(n / 1_000).toFixed(0)}K`;
  return `₦${n.toLocaleString()}`;
}

export default function AdminDashboardPage() {
  const router = useRouter();

  const { data: stats } = useQuery({
    queryKey: ["dashboard-stats"],
    queryFn: transactionsApi.getDashboardStats,
    staleTime: 60_000,
  });

  const { data: recentData } = useQuery({
    queryKey: ["recent-transactions"],
    queryFn: () => transactionsApi.getTransactions({ limit: 5, page: 1 }),
    staleTime: 30_000,
  });

  const { data: agentList } = useQuery({
    queryKey: ["agents"],
    queryFn: () => agentsApi.getAgents(),
    staleTime: 60_000,
  });

  const { data: commissionStats } = useQuery({
    queryKey: ["commission-stats"],
    queryFn: commissionsApi.getCommissionStats,
    staleTime: 60_000,
  });

  const { data: customerCount } = useQuery({
    queryKey: ["customer-count"],
    queryFn: async () => {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api"}/admin/customers`);
      const data = await res.json();
      return Array.isArray(data) ? data.length : 0;
    },
    staleTime: 60_000,
  });

  const { data: pendingRequests } = useQuery({
    queryKey: ["admin-trade-requests-pending"],
    queryFn: () => adminTradeRequestsApi.getTradeRequests("PENDING"),
    staleTime: 30_000,
    refetchInterval: 30_000,
  });

  const recentTransactions = (recentData?.trades ?? []).map((t) => ({
    id: t.tradeId,
    date: t.date,
    time: t.time,
    customer: t.customer,
    agent: t.agent,
    transaction: t.transaction,
    amount: t.amount,
    status: t.status as any,
  }));

  const agentActivity = (agentList ?? []).slice(0, 7).map((a: any) => ({
    agent: a.name || a.email || "Agent",
    trades: a.activeTrades || 0,
    volume: "₦0",
    status: (a.status === "Active" ? "Active" : "Inactive") as "Active" | "Inactive",
  }));

  const activeAgents = agentList?.filter((a: any) => a.status === "Active").length ?? 0;

  return (
    <div className="space-y-6 p-4 md:p-6 lg:pl-7 lg:pr-6" style={{ backgroundColor: '#f7f8f9' }}>
      {/* Header */}
      <div className="space-y-2">
        <h1 className="text-4xl font-bold text-gray-900">Hello, SuperAdmin!</h1>
        <p className="text-base text-gray-600">
          Monitor overall platform activity, performance, and risk in one place
        </p>
      </div>

      {/* Top Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <DashboardStatsCard
          title="Total Transactions"
          value={stats ? stats.totalTransactions.toLocaleString() : "—"}
          change={4.8}
          subtitle="All-time platform trades"
        />
        <DashboardStatsCard
          title="Trade Volume"
          value={stats ? formatVolume(stats.tradeVolume) : "—"}
          change={9.9}
          subtitle="Total transaction value"
        />
        <DashboardStatsCard
          title="Active Agents"
          value={stats ? stats.activeAgents.toString() : "—"}
          change={2.5}
          subtitle={`${activeAgents} currently active`}
        />
        <DashboardStatsCard
          title="Pending Reviews"
          value={stats ? stats.pendingReviews.toString() : "—"}
          change={-3.4}
          subtitle="Flagged items today"
        />
      </div>

      {/* Trade Health & Risk Compliance */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <TradeHealthOverview
          data={{
            completed: stats?.tradeHealth?.completed ?? 0,
            inProgress: stats?.tradeHealth?.inProgress ?? 0,
            pending: stats?.tradeHealth?.pending ?? 0,
            failed: stats?.tradeHealth?.failed ?? 0,
          }}
        />
        <RiskComplianceSnapshot
          highValueTrades={`${stats?.risk?.highValueTradesCount ?? 0} trades`}
          flaggedTrades={`${stats?.risk?.flaggedTodayCount ?? 0} today`}
          flaggedTradesReview={`${stats?.risk?.flaggedUnderReview ?? 0} under review`}
          flaggedCustomers={`${stats?.risk?.flaggedCustomersCount ?? 0} customers`}
        />
      </div>

      {/* Financial Performance */}
      <div>
        <h2 className="text-2xl font-bold text-gray-900 mb-4">Financial Performance</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <FinancialPerformanceCard
            title="Platform Revenue"
            value={commissionStats?.totalCommissions ?? "—"}
          />
          <FinancialPerformanceCard
            title="Agent Commissions Paid"
            value={commissionStats?.totalPaid ?? "—"}
          />
          <FinancialPerformanceCard 
            title="Most Traded Currency" 
            value={stats?.financial?.mostTradedCurrency ?? "N/A"} 
          />
          <FinancialPerformanceCard 
            title="Avg Trade Processing Time" 
            value={stats?.financial?.avgProcessingMinutes ? `${stats.financial.avgProcessingMinutes}m` : "—"} 
          />
        </div>
      </div>

      {/* Platform Metrics */}
      <div>
        <h2 className="text-2xl font-bold text-gray-900 mb-4">Platform Metrics</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <PlatformMetricCard title="Total Customers" value={customerCount?.toString() ?? "—"} />
          <PlatformMetricCard title="Total Agents" value={(agentList?.length ?? 0).toString()} />
          <PlatformMetricCard title="Supported Currencies" value="6" />
          <PlatformMetricCard title="Active Regions" value="12" />
        </div>
      </div>

      {/* Recent Transactions */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-2xl font-bold text-gray-900">Recent Transactions (All Agents)</h2>
        </div>
        <RecentTransactionsTable transactions={recentTransactions} />
        <div className="mt-4">
          <Button
            onClick={() => router.push("/admin/transactions")}
            style={{ backgroundColor: "var(--brand-primary)", color: "white" }}
          >
            View All Transactions
          </Button>
        </div>
      </div>

      {/* Agent Activity & Alerts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Agent Activity Snapshot</h2>
          <AgentActivityTable agents={agentActivity} />
        </div>
        <div>
          <AlertsNotifications alerts={[
            ...(pendingRequests?.requests && pendingRequests.requests.length > 0 ? [{
              type: "warning" as const,
              title: `${pendingRequests.requests.length} Pending Trade Request${pendingRequests.requests.length !== 1 ? "s" : ""}`,
              message: `You have ${pendingRequests.requests.length} customer trade request${pendingRequests.requests.length !== 1 ? "s" : ""} awaiting review and action.`,
              time: "Now",
            }] : []),
            ...staticAlerts,
          ]} />
        </div>
      </div>
    </div>
  );
}

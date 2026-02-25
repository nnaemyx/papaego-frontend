'use client';

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { TradesTable } from '@/components/dashboard/TradesTable';
import { TransactionDetailsModal } from '@/components/features/agent/TransactionDetailsModal';
import type { AgentTrade } from '@/lib/types/agent';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Search, Download, Plus } from 'lucide-react';
import Link from 'next/link';
import { agentApi } from '@/lib/api/agent';

export default function TransactionsPage() {
  const [selectedTransaction, setSelectedTransaction] = useState<AgentTrade | null>(null);
  const [statusFilter, setStatusFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');

  // Fetch trades
  const { data: tradesData, isLoading } = useQuery({
    queryKey: ['agent-transactions', statusFilter],
    queryFn: () => agentApi.getTrades({
      status: statusFilter === 'all' ? undefined : statusFilter,
      limit: 100,
      page: 1
    }),
  });

  const trades = tradesData?.trades || [];

  // Calculate stats from real data
  const transactionStats = [
    { label: 'Total Transactions', value: tradesData?.total?.toString() || '0' },
    {
      label: 'Successful Transactions',
      value: trades.filter((t: AgentTrade) => t.status === 'Completed').length.toString()
    },
    {
      label: 'Pending Transactions',
      value: trades.filter((t: AgentTrade) => t.status === 'Pending' || t.status === 'In Progress').length.toString()
    },
    {
      label: 'Failed Transactions',
      value: trades.filter((t: AgentTrade) => t.status === 'Cancelled').length.toString()
    },
  ];

  // Filter trades by search query
  const filteredTrades = trades.filter((trade: AgentTrade) => {
    if (!searchQuery) return true;
    const query = searchQuery.toLowerCase();
    return (
      trade.tradeId.toLowerCase().includes(query) ||
      trade.customer.toLowerCase().includes(query) ||
      trade.transaction.toLowerCase().includes(query)
    );
  });

  return (
    <div className="p-4 md:p-6 lg:p-8">
      {/* Page Header */}
      <div className="mb-6 lg:mb-8">
        <h1 className="text-2xl md:text-3xl lg:text-4xl font-bold mb-2" style={{ color: 'var(--text-primary)' }}>
          Transactions
        </h1>
        <p className="text-sm md:text-base" style={{ color: 'var(--text-secondary)' }}>
          View and manage all trades you&apos;ve handled, with full details, status updates, and actions in one place
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6 mb-8">
        {isLoading ? (
          Array.from({ length: 4 }).map((_, index) => (
            <div key={index} className="h-28 bg-gray-200 rounded-xl animate-pulse" />
          ))
        ) : (
          transactionStats.map((stat, index) => (
            <Card key={index} className="p-6 border border-(--border-custom) bg-white rounded-xl">
              <p className="text-sm mb-2" style={{ color: 'var(--text-secondary)' }}>
                {stat.label}
              </p>
              <p className="text-3xl font-bold" style={{ color: 'var(--text-primary)' }}>
                {stat.value}
              </p>
            </Card>
          ))
        )}
      </div>

      {/* All Transactions Section */}
      <div className="mb-6">
        <h2 className="text-xl md:text-2xl font-bold mb-6" style={{ color: 'var(--text-primary)' }}>
          All Transactions
        </h2>

        {/* Filters */}
        <div className="flex flex-col lg:flex-row gap-4 mb-6">
          {/* Search */}
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5" style={{ color: 'var(--text-tertiary)' }} />
            <Input
              placeholder="Search by name, ID, or reference"
              className="pl-10 h-12"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          {/* Filter Dropdowns */}
          <div className="flex flex-col sm:flex-row gap-4">
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-full sm:w-[160px] h-12">
                <div className="text-left">
                  <div className="text-xs" style={{ color: 'var(--text-tertiary)' }}>Status</div>
                  <SelectValue />
                </div>
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All</SelectItem>
                <SelectItem value="In Progress">In Progress</SelectItem>
                <SelectItem value="Completed">Completed</SelectItem>
                <SelectItem value="Pending">Pending</SelectItem>
                <SelectItem value="Cancelled">Cancelled</SelectItem>
              </SelectContent>
            </Select>

            <Select defaultValue="all">
              <SelectTrigger className="w-full sm:w-[160px] h-12">
                <div className="text-left">
                  <div className="text-xs" style={{ color: 'var(--text-tertiary)' }}>Trade Type</div>
                  <SelectValue />
                </div>
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All</SelectItem>
                <SelectItem value="buy">Buy</SelectItem>
                <SelectItem value="sell">Sell</SelectItem>
              </SelectContent>
            </Select>

            <Select defaultValue="all">
              <SelectTrigger className="w-full sm:w-[160px] h-12">
                <div className="text-left">
                  <div className="text-xs" style={{ color: 'var(--text-tertiary)' }}>Date Range</div>
                  <SelectValue />
                </div>
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All</SelectItem>
                <SelectItem value="today">Today</SelectItem>
                <SelectItem value="week">This Week</SelectItem>
                <SelectItem value="month">This Month</SelectItem>
                <SelectItem value="custom">Custom Range</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-4 sm:ml-auto">
            <Button
              variant="outline"
              className="h-12 px-6 border-2"
              style={{
                borderColor: 'var(--status-success)',
                color: 'var(--status-success)',
              }}
            >
              <Download className="w-4 h-4 mr-2" />
              Export
            </Button>
            <Link href="/agent/trades/new">
              <Button
                className="h-12 px-6"
                style={{
                  backgroundColor: 'var(--brand-primary)',
                  color: '#ffffff',
                }}
              >
                <Plus className="w-4 h-4 mr-2" />
                New Trade
              </Button>
            </Link>
          </div>
        </div>
      </div>

      {/* Trades Table */}
      {isLoading ? (
        <div className="h-96 bg-gray-200 rounded-xl animate-pulse" />
      ) : (
        <div className="overflow-x-auto">
          <TradesTable trades={filteredTrades} />
        </div>
      )}

      {/* Transaction Details Modal */}
      <TransactionDetailsModal
        transaction={selectedTransaction}
        open={!!selectedTransaction}
        onClose={() => setSelectedTransaction(null)}
      />
    </div>
  );
}

import { TradesTable } from '@/components/dashboard/TradesTable';
import { recentTrades } from '@/lib/mock-data';
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

const transactionStats = [
  { label: 'Total Transactions', value: '146' },
  { label: 'Successful Transactions', value: '129' },
  { label: 'Pending Transactions', value: '11' },
  { label: 'Failed Transactions', value: '6' },
];

export default function TransactionsPage() {
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
        {transactionStats.map((stat, index) => (
          <Card key={index} className="p-6 border border-(--border-custom) bg-white rounded-xl">
            <p className="text-sm mb-2" style={{ color: 'var(--text-secondary)' }}>
              {stat.label}
            </p>
            <p className="text-3xl font-bold" style={{ color: 'var(--text-primary)' }}>
              {stat.value}
            </p>
          </Card>
        ))}
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
            />
          </div>

          {/* Filter Dropdowns */}
          <div className="flex flex-col sm:flex-row gap-4">
            <Select defaultValue="all">
              <SelectTrigger className="w-full sm:w-[160px] h-12">
                <div className="text-left">
                  <div className="text-xs" style={{ color: 'var(--text-tertiary)' }}>Status</div>
                  <SelectValue />
                </div>
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All</SelectItem>
                <SelectItem value="in-progress">In Progress</SelectItem>
                <SelectItem value="completed">Completed</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="cancelled">Cancelled</SelectItem>
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
      <div className="overflow-x-auto">
        <TradesTable trades={recentTrades} />
      </div>
    </div>
  );
}
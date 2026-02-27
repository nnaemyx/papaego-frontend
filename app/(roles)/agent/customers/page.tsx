'use client';

import { useState } from 'react';
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
import { Search, Download } from 'lucide-react';
import { CustomersTable } from '@/components/features/agent/CustomersTable';
import { CustomerProfileSheet } from '@/components/features/agent/CustomerProfileSheet';
import { customersApi } from '@/lib/api/customers';
import type { Customer } from '@/lib/types/customer';
import { useQuery } from '@tanstack/react-query';

export default function CustomersPage() {
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'All' | 'Verified' | 'Pending' | 'Failed'>('All');

  const { data: customers = [], isLoading: isLoadingCustomers } = useQuery({
    queryKey: ['agent-customers', { search: searchQuery, status: statusFilter }],
    queryFn: () => customersApi.getCustomers({ search: searchQuery, status: statusFilter }),
  });

  const { data: stats, isLoading: isLoadingStats } = useQuery({
    queryKey: ['agent-customers-stats'],
    queryFn: customersApi.getCustomerStats,
  });

  return (
    <div className="p-4 md:p-6 lg:p-8">
      {/* Page Header */}
      <div className="mb-6 lg:mb-8">
        <h1 className="text-2xl md:text-3xl lg:text-4xl font-bold mb-2" style={{ color: 'var(--text-primary)' }}>
          Customers
        </h1>
        <p className="text-sm md:text-base" style={{ color: 'var(--text-secondary)' }}>
          Manage and view all your customers in one place
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6 mb-8">
        <Card className="p-6 border border-(--border-custom) bg-white rounded-xl">
          <p className="text-sm mb-2" style={{ color: 'var(--text-secondary)' }}>
            Total Customers
          </p>
          <p className="text-3xl font-bold" style={{ color: 'var(--text-primary)' }}>
            {isLoadingStats ? '...' : stats?.totalCustomers || 0}
          </p>
        </Card>
        <Card className="p-6 border border-(--border-custom) bg-white rounded-xl">
          <p className="text-sm mb-2" style={{ color: 'var(--text-secondary)' }}>
            Verified Customers
          </p>
          <p className="text-3xl font-bold" style={{ color: 'var(--status-success)' }}>
            {isLoadingStats ? '...' : stats?.verifiedCustomers || 0}
          </p>
        </Card>
        <Card className="p-6 border border-(--border-custom) bg-white rounded-xl">
          <p className="text-sm mb-2" style={{ color: 'var(--text-secondary)' }}>
            High Value Customers
          </p>
          <p className="text-3xl font-bold" style={{ color: 'var(--brand-primary)' }}>
            {isLoadingStats ? '...' : stats?.highValueCustomers || 0}
          </p>
        </Card>
        <Card className="p-6 border border-(--border-custom) bg-white rounded-xl">
          <p className="text-sm mb-2" style={{ color: 'var(--text-secondary)' }}>
            Active Today
          </p>
          <p className="text-3xl font-bold" style={{ color: 'var(--text-primary)' }}>
            {isLoadingStats ? '...' : stats?.activeCustomersToday || 0}
          </p>
        </Card>
      </div>

      {/* Filters and Actions */}
      <div className="mb-6">
        <div className="flex flex-col lg:flex-row gap-4">
          {/* Search */}
          <div className="relative flex-1 max-w-md">
            <Search
              className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5"
              style={{ color: 'var(--text-tertiary)' }}
            />
            <Input
              placeholder="Search by name, email, or ID"
              className="pl-10 h-12"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          {/* Filters */}
          <div className="flex flex-col sm:flex-row gap-4">
            <Select value={statusFilter} onValueChange={(val) => setStatusFilter(val as any)}>
              <SelectTrigger className="w-full sm:w-[160px] h-12">
                <div className="text-left">
                  <div className="text-xs" style={{ color: 'var(--text-tertiary)' }}>
                    Status
                  </div>
                  <SelectValue />
                </div>
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="All">All</SelectItem>
                <SelectItem value="Verified">Verified</SelectItem>
                <SelectItem value="Pending">Pending</SelectItem>
                <SelectItem value="Failed">Failed</SelectItem>
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
          </div>
        </div>
      </div>

      {/* Customers Table */}
      {isLoadingCustomers ? (
        <div className="flex justify-center p-8">Loading customers...</div>
      ) : customers.length === 0 ? (
        <div className="flex justify-center p-8 text-gray-500">No customers found. Execute a trade to add customers.</div>
      ) : (
        <CustomersTable
          customers={customers}
          onViewCustomer={setSelectedCustomer}
        />
      )}

      {/* Customer Profile Sheet */}
      <CustomerProfileSheet
        customer={selectedCustomer}
        open={!!selectedCustomer}
        onClose={() => setSelectedCustomer(null)}
      />
    </div>
  );
}

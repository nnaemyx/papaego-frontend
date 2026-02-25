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
import { Search, Download, UserPlus } from 'lucide-react';
import { CustomersTable } from '@/components/features/agent/CustomersTable';
import { CustomerProfileSheet } from '@/components/features/agent/CustomerProfileSheet';
import { mockCustomers, mockCustomerStats } from '@/lib/mock-data/customers';
import type { Customer } from '@/lib/types/customer';

export default function CustomersPage() {
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');

  const filteredCustomers = mockCustomers.filter((customer) => {
    const matchesSearch = 
      customer.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      customer.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      customer.customerId.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesStatus = statusFilter === 'All' || customer.verificationStatus === statusFilter;
    
    return matchesSearch && matchesStatus;
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
            {mockCustomerStats.totalCustomers}
          </p>
        </Card>
        <Card className="p-6 border border-(--border-custom) bg-white rounded-xl">
          <p className="text-sm mb-2" style={{ color: 'var(--text-secondary)' }}>
            Verified Customers
          </p>
          <p className="text-3xl font-bold" style={{ color: 'var(--status-success)' }}>
            {mockCustomerStats.verifiedCustomers}
          </p>
        </Card>
        <Card className="p-6 border border-(--border-custom) bg-white rounded-xl">
          <p className="text-sm mb-2" style={{ color: 'var(--text-secondary)' }}>
            High Value Customers
          </p>
          <p className="text-3xl font-bold" style={{ color: 'var(--brand-primary)' }}>
            {mockCustomerStats.highValueCustomers}
          </p>
        </Card>
        <Card className="p-6 border border-(--border-custom) bg-white rounded-xl">
          <p className="text-sm mb-2" style={{ color: 'var(--text-secondary)' }}>
            Active Today
          </p>
          <p className="text-3xl font-bold" style={{ color: 'var(--text-primary)' }}>
            {mockCustomerStats.activeCustomersToday}
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
            <Select value={statusFilter} onValueChange={setStatusFilter}>
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
            <Button
              className="h-12 px-6"
              style={{
                backgroundColor: 'var(--brand-primary)',
                color: '#ffffff',
              }}
            >
              <UserPlus className="w-4 h-4 mr-2" />
              Add Customer
            </Button>
          </div>
        </div>
      </div>

      {/* Customers Table */}
      <CustomersTable
        customers={filteredCustomers}
        onViewCustomer={setSelectedCustomer}
      />

      {/* Customer Profile Sheet */}
      <CustomerProfileSheet
        customer={selectedCustomer}
        open={!!selectedCustomer}
        onClose={() => setSelectedCustomer(null)}
      />
    </div>
  );
}

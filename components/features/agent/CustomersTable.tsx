'use client';

import { useState } from 'react';
import { Customer } from '@/lib/types/customer';
import { Badge } from '@/components/ui/badge';
import { formatDate } from '@/lib/formatters';
import { Eye, MoreHorizontal, Mail, Phone } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';

interface CustomersTableProps {
  customers: Customer[];
  onViewCustomer: (customer: Customer) => void;
}

const getStatusBadgeStyles = (status: Customer['verificationStatus']) => {
  switch (status) {
    case 'Verified':
      return { backgroundColor: '#e2fded', color: '#27ae60' };
    case 'Pending':
      return { backgroundColor: '#fff4e5', color: '#f39c12' };
    case 'Failed':
      return { backgroundColor: '#ffe5e5', color: '#e05555' };
  }
};

const getActivityBadgeStyles = (status: Customer['activityStatus']) => {
  switch (status) {
    case 'Active':
      return { backgroundColor: '#e2fded', color: '#27ae60' };
    case 'Inactive':
      return { backgroundColor: '#fff4e5', color: '#f39c12' };
    case 'Dormant':
      return { backgroundColor: '#f1f3f4', color: '#5f6368' };
    default:
      return { backgroundColor: '#f1f3f4', color: '#5f6368' };
  }
};

export function CustomersTable({ customers, onViewCustomer }: CustomersTableProps) {
  return (
    <div className="rounded-xl border border-(--border-custom) overflow-hidden bg-white">
      <Table>
        <TableHeader>
          <TableRow className="hover:bg-transparent" style={{ backgroundColor: '#f6f6f6' }}>
            <TableHead className="font-bold" style={{ color: 'var(--text-primary)' }}>
              Customer ID
            </TableHead>
            <TableHead className="font-bold" style={{ color: 'var(--text-primary)' }}>
              Name
            </TableHead>
            <TableHead className="font-bold" style={{ color: 'var(--text-primary)' }}>
              Contact
            </TableHead>
            <TableHead className="font-bold" style={{ color: 'var(--text-primary)' }}>
              Total Trades
            </TableHead>
            <TableHead className="font-bold" style={{ color: 'var(--text-primary)' }}>
              Last Active
            </TableHead>
            <TableHead className="font-bold" style={{ color: 'var(--text-primary)' }}>
              Activity Status
            </TableHead>
            <TableHead className="font-bold" style={{ color: 'var(--text-primary)' }}>
              Verification
            </TableHead>
            <TableHead className="font-bold text-right" style={{ color: 'var(--text-primary)' }}>
              Actions
            </TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {customers.map((customer) => (
            <TableRow
              key={customer.id}
              className="cursor-pointer hover:bg-gray-50"
              onClick={() => onViewCustomer(customer)}
            >
              <TableCell className="font-medium" style={{ color: 'var(--text-primary)' }}>
                {customer.customerId}
              </TableCell>
              <TableCell>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center shrink-0">
                    <img
                      src={`https://i.pravatar.cc/40?u=${customer.email}`}
                      alt={customer.name}
                      className="w-full h-full rounded-full object-cover"
                    />
                  </div>
                  <span className="font-medium" style={{ color: 'var(--text-primary)' }}>
                    {customer.name}
                  </span>
                </div>
              </TableCell>
              <TableCell>
                <div className="space-y-1">
                  <div className="flex items-center gap-2 text-sm" style={{ color: 'var(--text-secondary)' }}>
                    <Mail size={14} />
                    {customer.email}
                  </div>
                  <div className="flex items-center gap-2 text-sm" style={{ color: 'var(--text-secondary)' }}>
                    <Phone size={14} />
                    {customer.phone}
                  </div>
                </div>
              </TableCell>
              <TableCell className="font-semibold" style={{ color: 'var(--text-primary)' }}>
                {customer.totalTrades ?? customer.totalTransactions}
              </TableCell>
              <TableCell className="text-sm font-medium" style={{ color: 'var(--text-secondary)' }}>
                {customer.lastActive || 'Never'}
              </TableCell>
              <TableCell>
                <Badge
                  className="font-medium px-3 py-1"
                  style={getActivityBadgeStyles(customer.activityStatus)}
                >
                  {customer.activityStatus || 'Dormant'}
                </Badge>
              </TableCell>
              <TableCell>
                <Badge
                  className="font-medium px-3 py-1"
                  style={getStatusBadgeStyles(customer.verificationStatus)}
                >
                  {customer.verificationStatus}
                </Badge>
              </TableCell>
              <TableCell className="text-right">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={(e) => {
                    e.stopPropagation();
                    onViewCustomer(customer);
                  }}
                >
                  <Eye size={16} style={{ color: 'var(--text-primary)' }} />
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}

'use client';

import { useState } from 'react';
import { Trade, TradeStatus, VerificationStatus } from '@/lib/types';
import { Checkbox } from '@/components/ui/checkbox';
import { MoreHorizontal, ArrowUpDown, CheckCircle2, Clock, XCircle, Eye, Upload, FileDown } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from '@/components/ui/pagination';
import Link from 'next/link';

interface TradesTableProps {
  trades: Trade[];
}

const statusStyles: Record<TradeStatus, { bg: string; text: string }> = {
  'In Progress': { bg: 'bg-blue-50', text: 'text-(--status-info)' },
  'Completed': { bg: 'bg-green-50', text: 'text-(--status-success)' },
  'Pending': { bg: 'bg-yellow-50', text: 'text-(--status-warning)' },
  'Cancelled': { bg: 'bg-red-50', text: 'text-(--status-error)' },
};

const verificationConfig: Record<VerificationStatus, { icon: any; color: string; bg: string; border: string }> = {
  'Verified': {
    icon: CheckCircle2,
    color: 'var(--brand-primary)',
    bg: '#fff4d1',
    border: 'var(--brand-primary)',
  },
  'Pending': {
    icon: Clock,
    color: 'var(--status-warning)',
    bg: 'var(--status-warning-bg)',
    border: 'var(--status-warning)',
  },
  'Failed': {
    icon: XCircle,
    color: 'var(--status-error)',
    bg: 'var(--status-error-bg)',
    border: 'var(--status-error)',
  },
};

export function TradesTable({ trades }: TradesTableProps) {
  const [selectedRows, setSelectedRows] = useState<string[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  const toggleRow = (id: string) => {
    setSelectedRows(prev =>
      prev.includes(id) ? prev.filter(rowId => rowId !== id) : [...prev, id]
    );
  };

  const toggleAll = () => {
    setSelectedRows(prev =>
      prev.length === paginatedTrades.length ? [] : paginatedTrades.map(t => t.id)
    );
  };

  // Pagination logic
  const totalPages = Math.ceil(trades.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedTrades = trades.slice(startIndex, endIndex);

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    setSelectedRows([]);
  };

  return (
    <div className="rounded-xl border border-(--border-custom) bg-white overflow-hidden">
      <div className="bg-(--bg-muted) border-b border-(--border-light) lg:overflow-x-hidden overflow-x-auto">
        <div className="grid grid-cols-[40px_100px_120px_120px_200px_140px_140px_120px_100px_80px] items-center h-12.5 px-3 min-w-300">
          <div className="flex items-center justify-center">
            <Checkbox
              checked={selectedRows.length === trades.length}
              onCheckedChange={toggleAll}
              className="border-2 border-gray-300"
            />
          </div>
          <TableHeader label="Trade ID" />
          <TableHeader label="Date" />
          <TableHeader label="Time" />
          <TableHeader label="Customer" />
          <TableHeader label="Transaction" />
          <TableHeader label="Transaction" />
          <TableHeader label="Status" />
          <TableHeader label="Verification" />
          <TableHeader label="Action" />
        </div>
      </div>

      <div className="divide-y divide-(--border-light) lg:overflow-x-hidden overflow-x-auto">
        {paginatedTrades.map((trade) => {
          const verificationStyle = verificationConfig[trade.verification];
          const VerificationIcon = verificationStyle.icon;

          return (
            <div
              key={trade.id}
              className="grid grid-cols-[40px_100px_120px_120px_200px_140px_140px_120px_100px_80px] items-center h-12.5 px-3 hover:bg-gray-50 min-w-300"
            >
              <div className="flex items-center justify-center">
                <Checkbox
                  checked={selectedRows.includes(trade.id)}
                  onCheckedChange={() => toggleRow(trade.id)}
                  className="border-2 border-gray-300"
                />
              </div>
              <span className="caption">{trade.id}</span>
              <span className="caption">{trade.date}</span>
              <span className="caption">{trade.time}</span>
              <span className="caption" style={{ color: 'var(--status-success)' }}>
                {trade.customer}
              </span>
              <span className="caption">{trade.transaction}</span>
              <span className="caption">{trade.amount}</span>
              <span className={`caption ${statusStyles[trade.status].text}`}>
                {trade.status}
              </span>
              <div className="flex items-center">
                <span
                  className="inline-flex items-center gap-1.5 rounded px-2 py-1 caption"
                  style={{
                    backgroundColor: verificationStyle.bg,
                    color: verificationStyle.color,
                    border: `1px solid ${verificationStyle.border}`,
                  }}
                >
                  <VerificationIcon size={10} style={{ color: verificationStyle.color }} />
                  {trade.verification}
                </span>
              </div>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button className="flex items-center justify-center hover:bg-gray-100 rounded p-1">
                    <MoreHorizontal className="w-4 h-4" style={{ color: 'var(--status-success)' }} />
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-40">
                  <Link href={`/agent/transactions/${trade.id}`}>
                    <DropdownMenuItem className="gap-2">
                      <Eye className="w-4 h-4" style={{ color: 'var(--status-success)' }} />
                      <span style={{ color: 'var(--status-success)' }}>View</span>
                    </DropdownMenuItem>
                  </Link>
                  <DropdownMenuItem className="gap-2">
                    <Upload className="w-4 h-4" />
                    <span>Upload Doc</span>
                  </DropdownMenuItem>
                  <DropdownMenuItem className="gap-2">
                    <FileDown className="w-4 h-4" />
                    <span>Export</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          );
        })}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="border-t border-(--border-light) p-4">
          <Pagination>
            <PaginationContent>
              <PaginationItem>
                <PaginationPrevious
                  onClick={() => handlePageChange(Math.max(1, currentPage - 1))}
                  className={currentPage === 1 ? 'pointer-events-none opacity-50' : 'cursor-pointer'}
                />
              </PaginationItem>

              {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                <PaginationItem key={page}>
                  <PaginationLink
                    onClick={() => handlePageChange(page)}
                    isActive={currentPage === page}
                    className="cursor-pointer"
                  >
                    {page}
                  </PaginationLink>
                </PaginationItem>
              ))}

              <PaginationItem>
                <PaginationNext
                  onClick={() => handlePageChange(Math.min(totalPages, currentPage + 1))}
                  className={currentPage === totalPages ? 'pointer-events-none opacity-50' : 'cursor-pointer'}
                />
              </PaginationItem>
            </PaginationContent>
          </Pagination>
        </div>
      )}
    </div>
  );
}

function TableHeader({ label }: { label: string }) {
  return (
    <div className="flex items-center gap-2">
      <span className="caption font-medium" style={{ color: 'var(--text-primary)' }}>
        {label}
      </span>
      <ArrowUpDown size={14} style={{ color: 'var(--text-primary)' }} />
    </div>
  );
}
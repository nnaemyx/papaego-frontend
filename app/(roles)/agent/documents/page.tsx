'use client';

import { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Search, Download, Upload } from 'lucide-react';
import { DocumentsTable } from '@/components/features/agent/DocumentsTable';
import { DocumentPreviewModal } from '@/components/features/agent/DocumentPreviewModal';
import { mockDocuments } from '@/lib/mock-data/documents';
import type { Document } from '@/lib/types/document';

export default function DocumentsPage() {
  const [selectedDocument, setSelectedDocument] = useState<Document | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [typeFilter, setTypeFilter] = useState('All');

  const filteredDocuments = mockDocuments.filter((doc) => {
    const matchesSearch = 
      doc.customerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      doc.customerId.toLowerCase().includes(searchQuery.toLowerCase()) ||
      doc.documentType.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesStatus = statusFilter === 'All' || doc.status === statusFilter;
    const matchesType = typeFilter === 'All' || doc.documentType === typeFilter;
    
    return matchesSearch && matchesStatus && matchesType;
  });

  const stats = {
    total: mockDocuments.length,
    pending: mockDocuments.filter(d => d.status === 'Pending Review').length,
    approved: mockDocuments.filter(d => d.status === 'Approved').length,
    rejected: mockDocuments.filter(d => d.status === 'Rejected').length,
  };

  return (
    <div className="p-4 md:p-6 lg:p-8">
      {/* Page Header */}
      <div className="mb-6 lg:mb-8">
        <h1 className="text-2xl md:text-3xl lg:text-4xl font-bold mb-2" style={{ color: 'var(--text-primary)' }}>
          Documents
        </h1>
        <p className="text-sm md:text-base" style={{ color: 'var(--text-secondary)' }}>
          Review and manage customer documents
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6 mb-8">
        <div className="p-6 border border-(--border-custom) bg-white rounded-xl">
          <p className="text-sm mb-2" style={{ color: 'var(--text-secondary)' }}>
            Total Documents
          </p>
          <p className="text-3xl font-bold" style={{ color: 'var(--text-primary)' }}>
            {stats.total}
          </p>
        </div>
        <div className="p-6 border border-(--border-custom) bg-white rounded-xl">
          <p className="text-sm mb-2" style={{ color: 'var(--text-secondary)' }}>
            Pending Review
          </p>
          <p className="text-3xl font-bold" style={{ color: '#f39c12' }}>
            {stats.pending}
          </p>
        </div>
        <div className="p-6 border border-(--border-custom) bg-white rounded-xl">
          <p className="text-sm mb-2" style={{ color: 'var(--text-secondary)' }}>
            Approved
          </p>
          <p className="text-3xl font-bold" style={{ color: 'var(--status-success)' }}>
            {stats.approved}
          </p>
        </div>
        <div className="p-6 border border-(--border-custom) bg-white rounded-xl">
          <p className="text-sm mb-2" style={{ color: 'var(--text-secondary)' }}>
            Rejected
          </p>
          <p className="text-3xl font-bold" style={{ color: 'var(--status-error)' }}>
            {stats.rejected}
          </p>
        </div>
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
              placeholder="Search by customer or document type"
              className="pl-10 h-12"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          {/* Filters */}
          <div className="flex flex-col sm:flex-row gap-4">
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-full sm:w-[180px] h-12">
                <div className="text-left">
                  <div className="text-xs" style={{ color: 'var(--text-tertiary)' }}>
                    Status
                  </div>
                  <SelectValue />
                </div>
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="All">All</SelectItem>
                <SelectItem value="Pending Review">Pending Review</SelectItem>
                <SelectItem value="Approved">Approved</SelectItem>
                <SelectItem value="Rejected">Rejected</SelectItem>
                <SelectItem value="Expired">Expired</SelectItem>
              </SelectContent>
            </Select>

            <Select value={typeFilter} onValueChange={setTypeFilter}>
              <SelectTrigger className="w-full sm:w-[200px] h-12">
                <div className="text-left">
                  <div className="text-xs" style={{ color: 'var(--text-tertiary)' }}>
                    Document Type
                  </div>
                  <SelectValue />
                </div>
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="All">All Types</SelectItem>
                <SelectItem value="Government ID">Government ID</SelectItem>
                <SelectItem value="Proof of Address">Proof of Address</SelectItem>
                <SelectItem value="Bank Statement">Bank Statement</SelectItem>
                <SelectItem value="Tax Document">Tax Document</SelectItem>
                <SelectItem value="Business License">Business License</SelectItem>
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
              <Upload className="w-4 h-4 mr-2" />
              Upload Document
            </Button>
          </div>
        </div>
      </div>

      {/* Documents Table */}
      <DocumentsTable
        documents={filteredDocuments}
        onPreview={setSelectedDocument}
      />

      {/* Document Preview Modal */}
      <DocumentPreviewModal
        document={selectedDocument}
        open={!!selectedDocument}
        onClose={() => setSelectedDocument(null)}
      />
    </div>
  );
}

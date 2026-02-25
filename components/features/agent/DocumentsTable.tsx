'use client';

import { Document } from '@/lib/types/document';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { formatDate } from '@/lib/formatters';
import { Eye, Download, CheckCircle, XCircle } from 'lucide-react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';

interface DocumentsTableProps {
  documents: Document[];
  onPreview: (document: Document) => void;
}

const getStatusBadgeStyles = (status: Document['status']) => {
  switch (status) {
    case 'Approved':
      return { backgroundColor: '#e2fded', color: '#27ae60' };
    case 'Pending Review':
      return { backgroundColor: '#fff4e5', color: '#f39c12' };
    case 'Rejected':
      return { backgroundColor: '#ffe5e5', color: '#e05555' };
    case 'Expired':
      return { backgroundColor: '#f0f0f0', color: '#6b7078' };
  }
};

const formatFileSize = (bytes: number) => {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
};

export function DocumentsTable({ documents, onPreview }: DocumentsTableProps) {
  return (
    <div className="rounded-xl border border-(--border-custom) overflow-hidden bg-white">
      <Table>
        <TableHeader>
          <TableRow className="hover:bg-transparent" style={{ backgroundColor: '#f6f6f6' }}>
            <TableHead className="font-bold" style={{ color: 'var(--text-primary)' }}>
              Document Type
            </TableHead>
            <TableHead className="font-bold" style={{ color: 'var(--text-primary)' }}>
              Customer
            </TableHead>
            <TableHead className="font-bold" style={{ color: 'var(--text-primary)' }}>
              Upload Date
            </TableHead>
            <TableHead className="font-bold" style={{ color: 'var(--text-primary)' }}>
              File Size
            </TableHead>
            <TableHead className="font-bold" style={{ color: 'var(--text-primary)' }}>
              Status
            </TableHead>
            <TableHead className="font-bold text-right" style={{ color: 'var(--text-primary)' }}>
              Actions
            </TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {documents.map((document) => (
            <TableRow
              key={document.id}
              className="cursor-pointer hover:bg-gray-50"
            >
              <TableCell className="font-medium" style={{ color: 'var(--text-primary)' }}>
                {document.documentType}
              </TableCell>
              <TableCell>
                <div>
                  <p className="font-medium" style={{ color: 'var(--text-primary)' }}>
                    {document.customerName}
                  </p>
                  <p className="text-xs" style={{ color: 'var(--text-secondary)' }}>
                    {document.customerId}
                  </p>
                </div>
              </TableCell>
              <TableCell className="text-sm" style={{ color: 'var(--text-secondary)' }}>
                {formatDate(document.uploadDate)}
              </TableCell>
              <TableCell className="text-sm" style={{ color: 'var(--text-secondary)' }}>
                {formatFileSize(document.fileSize)}
              </TableCell>
              <TableCell>
                <Badge
                  className="font-medium px-3 py-1"
                  style={getStatusBadgeStyles(document.status)}
                >
                  {document.status}
                </Badge>
              </TableCell>
              <TableCell className="text-right">
                <div className="flex items-center justify-end gap-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => onPreview(document)}
                  >
                    <Eye size={16} style={{ color: 'var(--text-primary)' }} />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => window.open(document.fileUrl, '_blank')}
                  >
                    <Download size={16} style={{ color: 'var(--text-primary)' }} />
                  </Button>
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}

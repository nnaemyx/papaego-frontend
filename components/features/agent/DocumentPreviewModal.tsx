'use client';

import { Document } from '@/lib/types/document';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { FileText, Download, CheckCircle, XCircle, Calendar, User } from 'lucide-react';
import { formatDate } from '@/lib/formatters';

interface DocumentPreviewModalProps {
  document: Document | null;
  open: boolean;
  onClose: () => void;
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

export function DocumentPreviewModal({ document, open, onClose }: DocumentPreviewModalProps) {
  if (!document) return null;

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold" style={{ color: 'var(--text-primary)' }}>
            Document Preview
          </DialogTitle>
        </DialogHeader>

        <div className="grid md:grid-cols-2 gap-6">
          {/* Document Preview */}
          <div className="rounded-xl border border-(--border-custom) overflow-hidden bg-gray-50">
            <img
              src={document.fileUrl}
              alt={document.fileName}
              className="w-full h-auto"
            />
          </div>

          {/* Document Details */}
          <div>
            <div className="mb-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xl font-bold" style={{ color: 'var(--text-primary)' }}>
                  {document.documentType}
                </h3>
                <Badge
                  className="font-medium px-3 py-1"
                  style={getStatusBadgeStyles(document.status)}
                >
                  {document.status}
                </Badge>
              </div>

              <Separator className="my-4" />

              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <User size={18} className="mt-0.5" style={{ color: 'var(--text-secondary)' }} />
                  <div>
                    <p className="text-xs mb-1" style={{ color: 'var(--text-secondary)' }}>
                      Customer
                    </p>
                    <p className="font-medium" style={{ color: 'var(--text-primary)' }}>
                      {document.customerName}
                    </p>
                    <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
                      {document.customerId}
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <Calendar size={18} className="mt-0.5" style={{ color: 'var(--text-secondary)' }} />
                  <div>
                    <p className="text-xs mb-1" style={{ color: 'var(--text-secondary)' }}>
                      Upload Date
                    </p>
                    <p className="font-medium" style={{ color: 'var(--text-primary)' }}>
                      {formatDate(document.uploadDate)}
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <FileText size={18} className="mt-0.5" style={{ color: 'var(--text-secondary)' }} />
                  <div>
                    <p className="text-xs mb-1" style={{ color: 'var(--text-secondary)' }}>
                      File Name
                    </p>
                    <p className="font-medium" style={{ color: 'var(--text-primary)' }}>
                      {document.fileName}
                    </p>
                  </div>
                </div>

                {document.reviewedBy && (
                  <>
                    <Separator className="my-4" />
                    <div>
                      <p className="text-xs mb-2" style={{ color: 'var(--text-secondary)' }}>
                        Reviewed By
                      </p>
                      <p className="font-medium mb-1" style={{ color: 'var(--text-primary)' }}>
                        {document.reviewedBy}
                      </p>
                      {document.reviewedAt && (
                        <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
                          {formatDate(document.reviewedAt)}
                        </p>
                      )}
                    </div>
                  </>
                )}

                {document.notes && (
                  <>
                    <Separator className="my-4" />
                    <div>
                      <p className="text-xs mb-2" style={{ color: 'var(--text-secondary)' }}>
                        Notes
                      </p>
                      <p className="text-sm" style={{ color: 'var(--text-primary)' }}>
                        {document.notes}
                      </p>
                    </div>
                  </>
                )}
              </div>
            </div>

            {/* Actions */}
            <div className="space-y-3">
              <Button
                className="w-full"
                variant="outline"
                onClick={() => window.open(document.fileUrl, '_blank')}
              >
                <Download className="w-4 h-4 mr-2" />
                Download Document
              </Button>

              {document.status === 'Pending Review' && (
                <>
                  <Button
                    className="w-full"
                    style={{
                      backgroundColor: 'var(--status-success)',
                      color: '#ffffff',
                    }}
                  >
                    <CheckCircle className="w-4 h-4 mr-2" />
                    Approve Document
                  </Button>
                  <Button
                    className="w-full"
                    variant="outline"
                    style={{
                      borderColor: 'var(--status-error)',
                      color: 'var(--status-error)',
                    }}
                  >
                    <XCircle className="w-4 h-4 mr-2" />
                    Reject Document
                  </Button>
                </>
              )}
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

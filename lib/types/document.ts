export type DocumentType = 
  | 'Government ID'
  | 'Proof of Address'
  | 'Bank Statement'
  | 'Tax Document'
  | 'Business License'
  | 'Other';

export type DocumentStatus = 
  | 'Pending Review'
  | 'Approved'
  | 'Rejected'
  | 'Expired';

export interface Document {
  id: string;
  documentType: DocumentType;
  customerName: string;
  customerId: string;
  uploadDate: string; // ISO date string
  status: DocumentStatus;
  fileUrl: string;
  fileName: string;
  fileSize: number; // in bytes
  notes?: string;
  reviewedBy?: string;
  reviewedAt?: string;
}

export interface DocumentFilters {
  search?: string;
  status?: 'All' | DocumentStatus;
  type?: 'All' | DocumentType;
}

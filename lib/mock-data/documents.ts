import type { Document } from '@/lib/types/document';

export const mockDocuments: Document[] = [
  {
    id: '1',
    documentType: 'Government ID',
    customerName: 'Peter Okafor',
    customerId: 'PE-000522',
    uploadDate: '2025-12-20T10:30:00Z',
    status: 'Approved',
    fileUrl: 'https://picsum.photos/800/1000',
    fileName: 'government_id_peter.pdf',
    fileSize: 2048576, // 2MB
    reviewedBy: 'Admin',
    reviewedAt: '2025-12-20T14:00:00Z',
  },
  {
    id: '2',
    documentType: 'Proof of Address',
    customerName: 'Daniel Foster',
    customerId: 'PE-000523',
    uploadDate: '2025-12-22T09:15:00Z',
    status: 'Pending Review',
    fileUrl: 'https://picsum.photos/800/1001',
    fileName: 'proof_of_address_daniel.pdf',
    fileSize: 1536000, // 1.5MB
  },
  {
    id: '3',
    documentType: 'Bank Statement',
    customerName: 'Samuel Adeyemi',
    customerId: 'PE-000525',
    uploadDate: '2025-12-23T11:00:00Z',
    status: 'Approved',
    fileUrl: 'https://picsum.photos/800/1002',
    fileName: 'bank_statement_samuel.pdf',
    fileSize: 3072000, // 3MB
    reviewedBy: 'Admin',
    reviewedAt: '2025-12-23T16:30:00Z',
  },
  {
    id: '4',
    documentType: 'Government ID',
    customerName: 'Laura Smith',
    customerId: 'PE-000526',
    uploadDate: '2025-12-24T13:20:00Z',
    status: 'Rejected',
    fileUrl: 'https://picsum.photos/800/1003',
    fileName: 'government_id_laura.pdf',
    fileSize: 2560000, // 2.5MB
    notes: 'Document quality is poor. Please upload a clearer image.',
    reviewedBy: 'Admin',
    reviewedAt: '2025-12-24T15:00:00Z',
  },
  {
    id: '5',
    documentType: 'Business License',
    customerName: 'Fatimah Ibrahim',
    customerId: 'PE-000527',
    uploadDate: '2025-12-25T08:45:00Z',
    status: 'Pending Review',
    fileUrl: 'https://picsum.photos/800/1004',
    fileName: 'business_license_fatimah.pdf',
    fileSize: 4096000, // 4MB
  },
  {
    id: '6',
    documentType: 'Proof of Address',
    customerName: 'Linda Johnson',
    customerId: 'PE-000528',
    uploadDate: '2025-12-25T10:00:00Z',
    status: 'Expired',
    fileUrl: 'https://picsum.photos/800/1005',
    fileName: 'proof_of_address_linda.pdf',
    fileSize: 1024000, // 1MB
    notes: 'Document has expired. Please upload a recent version.',
  },
];

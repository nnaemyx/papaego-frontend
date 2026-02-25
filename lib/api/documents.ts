import api, { apiClient } from './client';
import type { Document, DocumentFilters } from '@/lib/types/document';

export const documentsApi = {
  // Get all documents with optional filters
  getDocuments: async (filters?: DocumentFilters): Promise<Document[]> => {
    const params = new URLSearchParams();
    if (filters?.search) params.append('search', filters.search);
    if (filters?.status && filters.status !== 'All') params.append('status', filters.status);
    if (filters?.type && filters.type !== 'All') params.append('type', filters.type);

    const queryString = params.toString();
    const url = `/agent/documents${queryString ? `?${queryString}` : ''}`;

    return apiClient.get<Document[]>(url);
  },

  // Get single document
  getDocument: async (id: string): Promise<Document> => {
    return apiClient.get<Document>(`/agent/documents/${id}`);
  },

  // Upload document — uses raw axios to support FormData
  uploadDocument: async (formData: FormData): Promise<Document> => {
    const response = await api.post<Document>('/agent/documents', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },

  // Update document status
  updateDocumentStatus: async (
    id: string,
    status: 'Approved' | 'Rejected',
    notes?: string
  ): Promise<Document> => {
    return apiClient.patch<Document>(`/agent/documents/${id}`, { status, notes });
  },

  // Delete document
  deleteDocument: async (id: string): Promise<void> => {
    return apiClient.delete(`/agent/documents/${id}`);
  },
};

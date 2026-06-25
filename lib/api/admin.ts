import { apiClient } from './client';

export interface CashoutRequest {
  id: string;
  agentId: string;
  agentName: string;
  amount: number;
  status: 'PENDING' | 'APPROVED' | 'PAID' | 'REJECTED';
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export const adminApi = {
  // List all cashout requests
  listCashoutRequests: async (): Promise<CashoutRequest[]> => {
    return apiClient.get<CashoutRequest[]>('/admin/cashouts');
  },

  // Update cashout request status
  updateCashoutStatus: async (
    id: string,
    status: 'APPROVED' | 'PAID' | 'REJECTED',
    notes?: string
  ): Promise<CashoutRequest> => {
    return apiClient.patch<CashoutRequest>(`/admin/cashouts/${id}/status`, { status, notes });
  },
};

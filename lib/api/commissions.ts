import api, { apiClient } from "./client";

export interface CommissionFilters {
  status?: string;
  type?: string;
  dateRange?: string;
  search?: string;
  page?: number;
  limit?: number;
}

export interface CommissionStats {
  totalCommissions: string;
  totalPaid: string;
  pendingPayouts: string;
  disputedCommissions: string;
}

export interface CommissionRecord {
  id: string;
  reference: string;
  date: string;
  agent: string;
  agentId: string;
  commissionType: string;
  amount: string;
  status: string;
  createdAt: string;
}

export interface CommissionDetail {
  id: string;
  reference: string;
  status: string;
  amount: string;
  commissionType: string;
  createdAt: string;
  paidAt: string | null;
  notes: string | null;
  agentName: string;
  agentId: string;
  agent: {
    id: string;
    firstName: string | null;
    lastName: string | null;
    email: string | null;
    phone: string | null;
    agentProfile?: {
      region: string;
      licenseId: string;
    } | null;
  };
  trade: {
    id: string;
    sendCurrency: string;
    receiveCurrency: string;
    amount: string;
    status: string;
    createdAt: string;
  } | null;
  activities?: Array<{
    id: string;
    action: string;
    description: string;
    createdAt: string;
  }>;
}

export const commissionsApi = {
  // Get all commissions with optional filters
  getCommissions: async (filters?: CommissionFilters): Promise<CommissionRecord[]> => {
    return apiClient.get<CommissionRecord[]>("/admin/commissions", { params: filters });
  },

  // Get commission statistics
  getCommissionStats: async (): Promise<CommissionStats> => {
    return apiClient.get<CommissionStats>("/admin/commissions/stats");
  },

  // Get single commission details
  getCommission: async (id: string): Promise<CommissionDetail> => {
    return apiClient.get<CommissionDetail>(`/admin/commissions/${id}`);
  },

  // Update commission status
  updateCommissionStatus: async (id: string, status: string, notes?: string) => {
    return apiClient.patch(`/admin/commissions/${id}/status`, { status, notes });
  },

  // Add commission note
  addCommissionNote: async (id: string, content: string) => {
    return apiClient.post(`/admin/commissions/${id}/notes`, { content });
  },

  // Export commissions to CSV
  exportCommissions: async (): Promise<Blob> => {
    const response = await api.get("/admin/commissions/export", { responseType: "blob" });
    return response.data;
  },
  // Get commissions for the authenticated agent
  getAgentCommissions: async (): Promise<any[]> => {
    return apiClient.get<any[]>("/admin/commissions/my-commissions");
  },
};

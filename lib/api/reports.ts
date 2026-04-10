import { apiClient } from './client';

export interface ProductivityRecord {
  agentId: string;
  agentName: string;
  email: string;
  region: string;
  customersOnboarded: number;
  transactionCount: number;
  transactionVolume: number;
  commissionEarned: string;
  status: string;
}

export interface KYARecord {
  agentId: string;
  agentName: string;
  email: string;
  phone: string;
  region: string;
  licenseId: string;
  kycStatus: string;
  onboardingStatus: string;
  activeTrades: number;
  joinedDate: string;
  status: string;
}

export interface OversightRecord {
  tradeId: string;
  customer: string;
  agent: string;
  amount: string;
  currency: string;
  status: string;
  createdAt: string;
  ageInDays: number;
  isOverdue: boolean;
  lastUpdate: string;
}

export interface CorridorRecord {
  corridor: string;
  sendCurrency: string;
  receiveCurrency: string;
  totalCount: number;
  totalVolume: number;
  percentShare: number;
  avgAmount: number;
  lastTrade: string;
}

export interface ReportFilters {
  startDate?: string;
  endDate?: string;
  agentId?: string;
  status?: string;
  region?: string;
}

export const reportsApi = {
  getProductivityReport: async (filters?: ReportFilters): Promise<ProductivityRecord[]> => {
    try {
      return await apiClient.get<ProductivityRecord[]>('/admin/reports/productivity', { params: filters });
    } catch {
      return [];
    }
  },

  getKYAReport: async (filters?: ReportFilters): Promise<KYARecord[]> => {
    try {
      return await apiClient.get<KYARecord[]>('/admin/reports/kya', { params: filters });
    } catch {
      return [];
    }
  },

  getOversightReport: async (filters?: ReportFilters): Promise<OversightRecord[]> => {
    try {
      return await apiClient.get<OversightRecord[]>('/admin/reports/oversight', { params: filters });
    } catch {
      return [];
    }
  },

  getCorridorReport: async (filters?: ReportFilters): Promise<CorridorRecord[]> => {
    try {
      return await apiClient.get<CorridorRecord[]>('/admin/reports/corridors', { params: filters });
    } catch {
      return [];
    }
  },

  exportReport: async (type: string, filters?: ReportFilters): Promise<Blob> => {
    const params = new URLSearchParams({ type });
    if (filters) {
      Object.entries(filters).forEach(([k, v]) => { if (v) params.append(k, v); });
    }
    const token = typeof window !== 'undefined'
      ? (() => { try { return JSON.parse(localStorage.getItem('auth-storage') || '{}')?.state?.token || ''; } catch { return ''; } })()
      : '';
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api'}/admin/reports/export?${params}`,
      { headers: { Authorization: `Bearer ${token}` } }
    );
    return response.blob();
  },
};

import { apiClient } from './client';
import type { AgentDashboardStats, AgentTradesResponse } from '@/lib/types/agent';

export const agentApi = {
    // Get dashboard statistics
    getDashboardStats: async (): Promise<AgentDashboardStats> => {
        return apiClient.get<AgentDashboardStats>('/agent/dashboard/stats');
    },

    // Get agent's trades
    getTrades: async (params?: {
        status?: string;
        limit?: number;
        page?: number;
    }): Promise<AgentTradesResponse> => {
        const queryParams = new URLSearchParams();
        if (params?.status) queryParams.append('status', params.status);
        if (params?.limit) queryParams.append('limit', params.limit.toString());
        if (params?.page) queryParams.append('page', params.page.toString());

        const queryString = queryParams.toString();
        const url = `/agent/trades${queryString ? `?${queryString}` : ''}`;

        return apiClient.get<AgentTradesResponse>(url);
    },

    // Get single trade
    getTrade: async (id: string): Promise<any> => {
        return apiClient.get(`/agent/trades/${id}`);
    },

    // Trade Requests Section
    getTradeRequests: async (status: string = 'PENDING'): Promise<any[]> => {
        return apiClient.get(`/agent/trade-requests?status=${status}`);
    },

    rejectTradeRequest: async (id: string): Promise<any> => {
        return apiClient.patch(`/agent/trade-requests/${id}/reject`, {});
    },

    claimTradeRequest: async (id: string): Promise<any> => {
        return apiClient.patch(`/agent/trade-requests/${id}/claim`, {});
    },

    setTradeRequestRate: async (id: string, fxRate: string, payoutAmount: string): Promise<any> => {
        return apiClient.patch(`/agent/trade-requests/${id}/set-rate`, { fxRate, payoutAmount });
    },

    // Create a new trade (can be linked to a TradeRequest)
    createTrade: async (data: {
        customerId: string;
        amount: number;
        sendCurrency: string;
        receiveCurrency: string;
        fxRate?: string;
        paymentMethod?: string;
        paymentSource?: string;
        payoutMethod?: string;
        recipientName?: string;
        recipientDetails?: string;
        payoutAmount?: string;
        tradeRequestId?: string; // Link to request
        paymentProofFile?: File | null;
    }) => {
        const { paymentProofFile, ...rest } = data;

        // Use FormData for Cloudinary upload
        const formData = new FormData();
        Object.entries(rest).forEach(([key, value]) => {
            if (value !== undefined && value !== null) {
                formData.append(key, String(value));
            }
        });

        if (paymentProofFile) {
            formData.append('paymentProof', paymentProofFile, paymentProofFile.name);
        }

        const response = await import('./client').then(m => m.apiClient).then(api =>
            api.post<any>('/agent/trades', formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            })
        );
        return response;
    },

    // Update trade status lifecycle
    verifyCustomer: async (id: string) => {
        return apiClient.post(`/agent/trades/${id}/verify-customer`);
    },

    quoteTrade: async (id: string) => {
        return apiClient.post(`/agent/trades/${id}/quote`);
    },

    sendToCustomer: async (id: string) => {
        return apiClient.post(`/agent/trades/${id}/send`);
    },

    confirmPayout: async (id: string) => {
        return apiClient.post(`/agent/trades/${id}/confirm-payout`);
    },

    cancelTrade: async (id: string, reason?: string) => {
        return apiClient.post(`/agent/trades/${id}/cancel`, { reason });
    },

    // Get FX rate
    getExchangeRate: async (base: string, quote: string, countryId: string): Promise<{ rate: number }> => {
        return apiClient.get<{ rate: number }>(`/fx/rate?base=${base}&quote=${quote}&countryId=${countryId}`);
    },
};

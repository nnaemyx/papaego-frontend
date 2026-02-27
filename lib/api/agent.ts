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

    // Create a new trade (sends customer details; backend will find-or-create the customer)
    createTrade: async (data: {
        customerName: string;
        customerEmail: string;
        customerPhone: string;
        customerCountry?: string;
        amount: number;
        sendCurrency: string;
        receiveCurrency: string;
        paymentMethod?: string;
        paymentSource?: string;
        payoutMethod?: string;
        recipientName?: string;
        recipientDetails?: string;
        payoutAmount?: string;
        paymentProofFile?: File | null;
    }) => {
        const { paymentProofFile, ...rest } = data;

        if (paymentProofFile) {
            // Use FormData so we can attach the file
            const formData = new FormData();
            Object.entries(rest).forEach(([key, value]) => {
                if (value !== undefined && value !== null) {
                    formData.append(key, String(value));
                }
            });
            formData.append('paymentProof', paymentProofFile, paymentProofFile.name);

            const response = await import('./client').then(m => m.default).then(api =>
                api.post('/agent/trades', formData, {
                    headers: { 'Content-Type': 'multipart/form-data' }
                })
            );
            return response.data;
        }

        // No file – plain JSON
        const apiModule = await import('./client');
        const response = await apiModule.default.post('/agent/trades', rest);
        return response.data;
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

    // Get FX rate
    getExchangeRate: async (base: string, quote: string, countryId: string): Promise<{ rate: number }> => {
        return apiClient.get<{ rate: number }>(`/fx/rate?base=${base}&quote=${quote}&countryId=${countryId}`);
    },
};

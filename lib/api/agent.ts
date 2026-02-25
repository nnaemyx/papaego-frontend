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
    getTrade: async (id: string) => {
        return apiClient.get(`/agent/trades/${id}`);
    },
};

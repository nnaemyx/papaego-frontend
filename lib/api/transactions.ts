import api from "./client";

export interface AdminTransaction {
    id: string;
    tradeId: string;
    date: string;
    time: string;
    customer: string;
    agent: string;
    agentId: string;
    transaction: string;
    amount: string;
    status: string;
    verification: string;
    createdAt: string;
}

export interface TransactionFilters {
    status?: string;
    search?: string;
    page?: number;
    limit?: number;
}

export interface TransactionListResponse {
    trades: AdminTransaction[];
    total: number;
    page: number;
    limit: number;
}

export interface DashboardStats {
    totalTransactions: number;
    tradeVolume: number;
    activeAgents: number;
    pendingReviews: number;
    tradeHealth?: {
        completed: number;
        inProgress: number;
        pending: number;
        failed: number;
    };
    risk?: {
        highValueTradesCount: number;
        flaggedTodayCount: number;
        flaggedUnderReview: number;
        flaggedCustomersCount: number;
    };
    financial?: {
        mostTradedCurrency: string;
        avgProcessingMinutes: number;
    };
}

export interface AgentActivity {
    agent: string;
    trades: number;
    volume: string;
    status: "Active" | "Inactive";
}

export const transactionsApi = {
    getTransactions: async (filters?: TransactionFilters): Promise<TransactionListResponse> => {
        const response = await api.get("/admin/transactions", { params: filters });
        return response.data;
    },

    getDashboardStats: async (): Promise<DashboardStats> => {
        const response = await api.get("/admin/dashboard/stats");
        return response.data;
    },

    getAgentActivity: async (): Promise<AgentActivity[]> => {
        // Derived from agents list — top agents by trade count
        const response = await api.get("/admin/agents");
        const agents = Array.isArray(response.data) ? response.data : [];
        return agents.slice(0, 7).map((a: any) => ({
            agent: a.name || a.email || "Agent",
            trades: a.activeTrades || 0,
            volume: "₦0",
            status: a.status === "Active" ? "Active" : "Inactive",
        }));
    },

    deleteTransaction: async (id: string): Promise<void> => {
        await api.delete(`/admin/transactions/${id}`);
    },

    getTransaction: async (id: string) => {
        const response = await api.get(`/admin/transactions/${id}`);
        return response.data;
    },

    freezeTrade: async (id: string) => {
        const response = await api.patch(`/admin/transactions/${id}/freeze`, {});
        return response.data;
    },

    unfreezeTrade: async (id: string) => {
        const response = await api.patch(`/admin/transactions/${id}/unfreeze`, {});
        return response.data;
    },

    uploadReceipt: async (id: string, file: File): Promise<any> => {
        const formData = new FormData();
        formData.append("receipt", file);
        const response = await api.patch(
            `/admin/transactions/${id}/receipt`,
            formData,
            { headers: { "Content-Type": "multipart/form-data" } }
        );
        return response.data;
    },

    approveNegotiation: async (id: string): Promise<any> => {
        const response = await api.post(`/admin/transactions/${id}/negotiate/approve`, {});
        return response.data;
    },

    rejectNegotiation: async (id: string): Promise<any> => {
        const response = await api.post(`/admin/transactions/${id}/negotiate/reject`, {});
        return response.data;
    },
};

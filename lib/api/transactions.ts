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
};

import api from "./client";

export interface AdminTradeRequest {
    id: string;
    amount: string;
    sendCurrency: string;
    receiveCurrency: string;
    purpose?: string;
    tradeType?: string;
    status: "PENDING" | "PROCESSED" | "REJECTED" | "ASSIGNED";
    createdAt: string;
    customer: {
        id: string;
        firstName: string;
        lastName: string;
        email: string;
        phone?: string;
    };
    assignedAgent?: {
        id: string;
        firstName: string;
        lastName: string;
        email: string;
    };
    supplierDetails?: {
        businessName?: string;
        bankName?: string;
        accountNumber?: string;
        sector?: string;
        address?: string;
    };
    /** Populated by backend when the linked trade has a rate set */
    linkedTradeStatus?: string;
    linkedTradeFxRate?: string | null;
}

export interface AdminTradeRequestDetail extends AdminTradeRequest {
    linkedTrade: {
        id: string;
        status: string;
        fxRate: string | null;
        payoutAmount: string | null;
        receiptUrl: string | null;
        createdAt: string;
        agent: { id: string; firstName: string; lastName: string } | null;
    } | null;
}

export const adminTradeRequestsApi = {
    getTradeRequests: async (status?: string): Promise<AdminTradeRequest[]> => {
        const params = (status && status !== "ALL") ? { status } : {};
        const response = await api.get("/admin/trade-requests", { params });
        return response.data;
    },

    getTradeRequest: async (id: string): Promise<AdminTradeRequestDetail> => {
        const response = await api.get(`/admin/trade-requests/${id}`);
        return response.data;
    },

    assignAgent: async (
        id: string,
        agentId: string
    ): Promise<AdminTradeRequest> => {
        const response = await api.patch(`/admin/trade-requests/${id}/assign`, {
            agentId,
        });
        return response.data;
    },

    approveRequest: async (id: string): Promise<AdminTradeRequest> => {
        const response = await api.patch(
            `/admin/trade-requests/${id}/approve`,
            {}
        );
        return response.data;
    },

    rejectRequest: async (
        id: string,
        reason?: string
    ): Promise<AdminTradeRequest> => {
        const response = await api.patch(`/admin/trade-requests/${id}/reject`, {
            reason,
        });
        return response.data;
    },

    processRequest: async (id: string): Promise<any> => {
        const response = await api.patch(
            `/admin/trade-requests/${id}/process`,
            {}
        );
        return response.data;
    },
};

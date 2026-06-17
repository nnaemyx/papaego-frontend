import api from "./client";

export interface AdminTradeRequest {
    id: string;
    amount: string;
    sendCurrency: string;
    receiveCurrency: string;
    purpose?: string;
    tradeType?: string;
    status: "PENDING" | "PROCESSED" | "REJECTED" | "ASSIGNED" | "QUOTED" | "POOL";
    createdAt: string;
    fxRate?: string | null;
    payoutAmount?: string | null;
    quotedAt?: string;
    receiptUrl?: string;
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
        invoiceUrl?: string;
    };
    /** Populated by backend when the linked trade has a rate set */
    linkedTradeStatus?: string;
    linkedTradeFxRate?: string | null;
    negotiatedRate?: string | null;
    originalFxRate?: string | null;
    negotiationUsed?: boolean;
}

export interface AdminTradeRequestDetail extends AdminTradeRequest {
    linkedTrade: {
        id: string;
        status: string;
        fxRate: string | null;
        payoutAmount: string | null;
        receiptUrl: string | null;
        paymentProofUrl: string | null;
        createdAt: string;
        agent: { id: string; firstName: string; lastName: string } | null;
    } | null;
}

export interface AdminTradeRequestsResponse {
    requests: AdminTradeRequest[];
    total: number;
    page: number;
    limit: number;
}

export const adminTradeRequestsApi = {
    getTradeRequests: async (status?: string, page: number = 1, limit: number = 20, search?: string): Promise<AdminTradeRequestsResponse> => {
        const params: any = { page, limit };
        if (status && status !== "ALL") {
            params.status = status;
        }
        if (search) {
            params.search = search;
        }
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

    processRequest: async (
        id: string,
        paymentDetails?: {
            paymentAccountName: string;
            paymentAccountNumber: string;
            paymentBankName: string;
            paymentAmount: string;
        }
    ): Promise<any> => {
        const response = await api.patch(
            `/admin/trade-requests/${id}/process`,
            paymentDetails || {}
        );
        return response.data;
    },

    deleteRequest: async (id: string): Promise<{ success: boolean; message: string }> => {
        const response = await api.delete(`/admin/trade-requests/${id}`);
        return response.data;
    },

    /** Admin sets the FX rate for a trade request (rate-fixing moved from agents to admin) */
    setRate: async (id: string, fxRate: string, payoutAmount: string): Promise<AdminTradeRequest> => {
        const response = await api.patch(`/admin/trade-requests/${id}/set-rate`, { fxRate, payoutAmount });
        return response.data;
    },
};

import { apiClient } from "./client";
import type { DepositStatus } from "./wallet";

/**
 * Admin-facing deposit request. Mirrors the backend DepositRequest model,
 * with the related customer eagerly loaded for the review table.
 */
export interface AdminDepositRequest {
    id: string;
    customerId: string;
    amount: string;
    currency: string;
    method: string;
    reference?: string | null;
    depositBank?: string | null;
    proofUrl?: string | null;
    note?: string | null;
    status: DepositStatus;
    reviewedBy?: string | null;
    reviewedAt?: string | null;
    rejectionReason?: string | null;
    creditedAmount?: string | null;
    createdAt: string;
    updatedAt: string;
    customer?: {
        id: string;
        fullName?: string | null;
        email?: string | null;
    } | null;
}

export interface AdminDepositsResponse {
    deposits: AdminDepositRequest[];
    total: number;
    page: number;
    limit: number;
}

export const adminDepositsApi = {
    /**
     * List deposit requests, optionally filtered by status.
     */
    list: async (params?: {
        status?: string;
        page?: number;
        limit?: number;
    }): Promise<AdminDepositsResponse> => {
        const query = new URLSearchParams();
        if (params?.status) query.set("status", params.status);
        if (params?.page) query.set("page", String(params.page));
        if (params?.limit) query.set("limit", String(params.limit));
        const qs = query.toString();
        return apiClient.get<AdminDepositsResponse>(`/admin/deposits${qs ? `?${qs}` : ""}`);
    },

    /**
     * Approve a deposit. Credits the customer's wallet atomically on the backend.
     * An optional correctedAmount lets the admin credit a different figure than requested.
     */
    approve: async (
        id: string,
        creditedAmount?: number
    ): Promise<{ success: boolean; deposit: AdminDepositRequest }> => {
        return apiClient.patch<{ success: boolean; deposit: AdminDepositRequest }>(
            `/admin/deposits/${id}/approve`,
            creditedAmount !== undefined ? { creditedAmount } : {}
        );
    },

    /**
     * Reject a deposit. No funds are credited. A reason may be supplied.
     */
    reject: async (
        id: string,
        reason?: string
    ): Promise<{ success: boolean; deposit: AdminDepositRequest }> => {
        return apiClient.patch<{ success: boolean; deposit: AdminDepositRequest }>(
            `/admin/deposits/${id}/reject`,
            reason ? { reason } : {}
        );
    },

    /**
     * Permanently delete a deposit request / funding event.
     */
    delete: async (
        id: string
    ): Promise<{ success: boolean; message: string }> => {
        return apiClient.delete<{ success: boolean; message: string }>(
            `/admin/deposits/${id}`
        );
    },
};

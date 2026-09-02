import { apiClient } from "./client";

export type WalletTransactionType =
    | "DEPOSIT"
    | "TRADE_DEBIT"
    | "TRADE_REFUND"
    | "ADJUSTMENT_CREDIT"
    | "ADJUSTMENT_DEBIT";

export type DepositStatus =
    | "PENDING"
    | "APPROVED"
    | "REJECTED"
    | "CANCELLED";

export interface WalletTransaction {
    id: string;
    type: WalletTransactionType;
    amount: string;
    currency: string;
    balanceAfter: string;
    description?: string | null;
    depositRequestId?: string | null;
    tradeId?: string | null;
    tradeRequestId?: string | null;
    createdAt: string;
}

export interface Wallet {
    id: string;
    customerId: string;
    availableBalance: string;
    reservedBalance: string;
    totalDeposited: string;
    currency: string;
    createdAt: string;
    updatedAt: string;
}

export interface WalletQueryParams {
    page?: number;
    limit?: number;
    type?: WalletTransactionType | "ALL";
    startDate?: string;
    endDate?: string;
    minAmount?: number;
    maxAmount?: number;
    search?: string;
}

/**
 * The wallet endpoint returns balances at the top level (flat), alongside the
 * transactions and pagination metadata.
 */
export interface WalletSummary {
    id: string;
    currency: string;
    availableBalance: string;
    reservedBalance: string;
    totalDeposited: string;
    transactions: WalletTransaction[];
    totalCount?: number;
    totalPages?: number;
    page?: number;
    limit?: number;
}

export interface DepositRequest {
    id: string;
    customerId: string;
    amount: string;
    currency: string;
    reference?: string | null;
    proofUrl?: string | null;
    status: DepositStatus;
    reviewedBy?: string | null;
    reviewNote?: string | null;
    createdAt: string;
    updatedAt: string;
}

/**
 * Fetch the authenticated customer's wallet balance and filtered/paginated transactions.
 */
export async function getMyWallet(params?: WalletQueryParams): Promise<WalletSummary> {
    const query: any = {};
    if (params?.page) query.page = params.page;
    if (params?.limit) query.limit = params.limit;
    if (params?.type && params.type !== "ALL") query.type = params.type;
    if (params?.startDate) query.startDate = params.startDate;
    if (params?.endDate) query.endDate = params.endDate;
    if (params?.minAmount != null) query.minAmount = params.minAmount;
    if (params?.maxAmount != null) query.maxAmount = params.maxAmount;
    if (params?.search) query.search = params.search;

    return apiClient.get<WalletSummary>("/customer/portal/wallet", { params: query });
}

/**
 * Fetch the customer's deposit requests.
 */
export async function getMyDeposits(): Promise<{ deposits: DepositRequest[] }> {
    return apiClient.get<{ deposits: DepositRequest[] }>("/customer/portal/wallet/deposits");
}

/**
 * Submit a new deposit request. A proof-of-payment file may be attached.
 */
export async function createDepositRequest(input: {
    amount: number;
    reference?: string;
    proof?: File | null;
}): Promise<DepositRequest> {
    const form = new FormData();
    form.append("amount", String(input.amount));
    if (input.reference) form.append("reference", input.reference);
    if (input.proof) form.append("proof", input.proof);
    return apiClient.post<DepositRequest>("/customer/portal/wallet/deposits", form, {
        headers: { "Content-Type": "multipart/form-data" },
    });
}

/**
 * Cancel a pending deposit request.
 */
export async function cancelDepositRequest(id: string): Promise<DepositRequest> {
    return apiClient.patch<DepositRequest>(`/customer/portal/wallet/deposits/${id}/cancel`, {});
}

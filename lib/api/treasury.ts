import api from "./client";

// ─── Types ────────────────────────────────────────────────────────────────────

export type AccountType = "BANK" | "WALLET" | "EXCHANGE" | "LIQUIDITY_PROVIDER";
export type AccountStatus = "ACTIVE" | "INACTIVE" | "SUSPENDED";
export type LedgerEntryType = "DEPOSIT" | "WITHDRAWAL" | "RESERVATION" | "RELEASE" | "SETTLEMENT" | "FEE" | "SYNC_ADJUSTMENT";
export type SyncStatus = "SUCCESS" | "FAILED" | "PARTIAL";

export interface TreasuryAccount {
    id: string;
    accountName: string;
    provider: string;
    currency: string;
    accountType: AccountType;
    status: AccountStatus;
    metadata?: Record<string, unknown>;
    createdAt: string;
    updatedAt: string;
    balances: TreasuryBalance[];
}

export interface TreasuryBalance {
    id: string;
    accountId: string;
    currency: string;
    availableBalance: string;
    reservedBalance: string;
    totalBalance: string;
    lastUpdated: string;
    account?: Pick<TreasuryAccount, "id" | "accountName" | "provider" | "accountType" | "status">;
}

export interface AggregatedBalance {
    currency: string;
    totalAvailable: string;
    totalReserved: string;
    totalBalance: string;
    accounts: TreasuryBalance[];
}

export interface LedgerEntry {
    id: string;
    reference: string;
    transactionType: LedgerEntryType;
    debitAccountId: string | null;
    creditAccountId: string | null;
    amount: string;
    currency: string;
    description: string;
    metadata?: Record<string, unknown>;
    createdAt: string;
    debitAccount?: Pick<TreasuryAccount, "id" | "accountName" | "provider" | "accountType"> | null;
    creditAccount?: Pick<TreasuryAccount, "id" | "accountName" | "provider" | "accountType"> | null;
}

export interface LedgerEntriesResponse {
    entries: LedgerEntry[];
    total: number;
    page: number;
    limit: number;
}

export interface BalanceSyncLog {
    id: string;
    provider: string;
    accountId: string;
    currency: string;
    syncedBalance: string | null;
    previousBalance: string | null;
    status: SyncStatus;
    errorMessage: string | null;
    syncedAt: string;
    account?: Pick<TreasuryAccount, "id" | "accountName" | "provider" | "accountType">;
}

export interface SyncSummary {
    synced: number;
    failed: number;
    skipped: number;
    results: Array<{
        accountId: string;
        provider: string;
        status: "SUCCESS" | "FAILED" | "SKIPPED";
        currency?: string;
        previousBalance?: number;
        newBalance?: number;
        adjustment?: number;
        error?: string;
    }>;
}

// ─── API Client ───────────────────────────────────────────────────────────────

export const treasuryApi = {
    // ── Balances ──────────────────────────────────────────────────────────────

    /** Get all balances aggregated by currency */
    getAllBalances: async (): Promise<{ balances: AggregatedBalance[] }> => {
        const res = await api.get("/treasury/balances");
        return res.data;
    },

    /** Get balance for a specific currency */
    getBalanceByCurrency: async (currency: string): Promise<AggregatedBalance> => {
        const res = await api.get(`/treasury/balance/${currency}`);
        return res.data;
    },

    // ── Accounts ──────────────────────────────────────────────────────────────

    /** Get all treasury accounts */
    getAccounts: async (params?: {
        status?: AccountStatus;
        accountType?: AccountType;
        currency?: string;
    }): Promise<{ accounts: TreasuryAccount[] }> => {
        const res = await api.get("/treasury/accounts", { params });
        return res.data;
    },

    /** Create a new treasury account */
    createAccount: async (data: {
        accountName: string;
        provider: string;
        currency: string;
        accountType: AccountType;
        initialBalance?: number | string;
        accountNumber?: string;
        metadata?: Record<string, unknown>;
    }): Promise<{ account: TreasuryAccount }> => {
        const res = await api.post("/treasury/accounts", data);
        return res.data;
    },

    /** Update a treasury account */
    updateAccount: async (
        id: string,
        data: { accountName?: string; provider?: string; status?: AccountStatus }
    ): Promise<{ account: TreasuryAccount }> => {
        const res = await api.patch(`/treasury/accounts/${id}`, data);
        return res.data;
    },

    /** Delete a treasury account and its balances */
    deleteAccount: async (id: string): Promise<{ success: boolean; message: string }> => {
        const res = await api.delete(`/treasury/accounts/${id}`);
        return res.data;
    },

    // ── Fund Movements ────────────────────────────────────────────────────────

    /** Record a deposit to a treasury account */
    deposit: async (data: {
        accountId: string;
        currency: string;
        amount: number;
        description: string;
        metadata?: Record<string, unknown>;
    }) => {
        const res = await api.post("/treasury/deposit", data);
        return res.data;
    },

    /** Reserve funds (prevents double-spending) */
    reserve: async (data: {
        accountId: string;
        currency: string;
        amount: number;
        description: string;
        metadata?: Record<string, unknown>;
    }) => {
        const res = await api.post("/treasury/reserve", data);
        return res.data;
    },

    /** Release reserved funds (on settlement failure) */
    release: async (data: {
        accountId: string;
        currency: string;
        amount: number;
        description: string;
        metadata?: Record<string, unknown>;
    }) => {
        const res = await api.post("/treasury/release", data);
        return res.data;
    },

    /** Complete settlement (deduct from reserved + total) */
    settle: async (data: {
        accountId: string;
        currency: string;
        amount: number;
        description: string;
        metadata?: Record<string, unknown>;
    }) => {
        const res = await api.post("/treasury/settle", data);
        return res.data;
    },

    // ── Sync ──────────────────────────────────────────────────────────────────

    /** Trigger sync for all accounts */
    syncAll: async (): Promise<{ success: boolean; summary: SyncSummary }> => {
        const res = await api.post("/treasury/sync", {});
        return res.data;
    },

    /** Sync a specific account */
    syncAccount: async (accountId: string): Promise<{ success: boolean; result: SyncSummary["results"][0] }> => {
        const res = await api.post("/treasury/sync", { accountId });
        return res.data;
    },

    /** Manual balance override */
    manualSync: async (data: {
        accountId: string;
        currency: string;
        balance: number;
    }): Promise<{ success: boolean; result: SyncSummary["results"][0] }> => {
        const res = await api.post("/treasury/sync", { ...data, manual: true });
        return res.data;
    },

    /** Get sync logs */
    getSyncLogs: async (params?: {
        accountId?: string;
        provider?: string;
        limit?: number;
    }): Promise<{ logs: BalanceSyncLog[] }> => {
        const res = await api.get("/treasury/sync/logs", { params });
        return res.data;
    },

    /** Get available sync providers */
    getProviders: async (): Promise<{ providers: string[] }> => {
        const res = await api.get("/treasury/providers");
        return res.data;
    },

    // ── Ledger ────────────────────────────────────────────────────────────────

    /** Get paginated ledger entries */
    getLedgerEntries: async (params?: {
        currency?: string;
        transactionType?: LedgerEntryType;
        accountId?: string;
        startDate?: string;
        endDate?: string;
        page?: number;
        limit?: number;
    }): Promise<LedgerEntriesResponse> => {
        const res = await api.get("/ledger/entries", { params });
        return res.data;
    },
};

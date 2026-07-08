import api from "./client";

// ─── Types ────────────────────────────────────────────────────────────────────

export type MarkupType = "FIXED" | "PERCENTAGE";

export interface CustomerRate {
    pair: string;
    customerRate: number;
    markupType: string;
    createdAt: string;
}

export interface ProviderRateDetail {
    pair: string;
    providerRate: number;
    providerName: string;
    fetchedAt: string;
    markupType: string;
    markupValue: number;
    customerRate: number;
}

export interface MarkupConfig {
    id: string;
    baseCurrency: string;
    quoteCurrency: string;
    markupType: MarkupType;
    markupValue: string;
    isActive: boolean;
    updatedBy: string | null;
    updatedAt: string;
    createdAt: string;
}

export interface ExchangeRateLog {
    id: string;
    providerName: string;
    baseCurrency: string;
    quoteCurrency: string;
    providerRate: string;
    markupType: string;
    markupApplied: string;
    customerRate: string;
    requestedBy: string | null;
    createdAt: string;
}

export interface RateLogsResponse {
    logs: ExchangeRateLog[];
    total: number;
    page: number;
    limit: number;
}

export interface ProviderRateHistory {
    id: string;
    providerName: string;
    baseCurrency: string;
    quoteCurrency: string;
    providerRate: string;
    fetchedAt: string;
}

// ─── API Client ───────────────────────────────────────────────────────────────

export const exchangeRatesApi = {
    // ── Customer Rates (all authenticated users) ──────────────────────────────

    /** Get customer rate for all pairs or a specific pair */
    getCustomerRates: async (params?: {
        base?: string;
        quote?: string;
    }): Promise<{ rates: CustomerRate[] } | { rate: CustomerRate }> => {
        const res = await api.get("/exchange-rate", { params });
        return res.data;
    },

    /** Get a single customer rate */
    getCustomerRate: async (base: string, quote: string): Promise<{ rate: CustomerRate }> => {
        const res = await api.get("/exchange-rate", { params: { base, quote } });
        return res.data;
    },

    // ── Provider Rates (admin only) ────────────────────────────────────────────

    /** Get all provider rates with markup details */
    getAllProviderRates: async (): Promise<{ rates: ProviderRateDetail[] }> => {
        const res = await api.get("/exchange-rate/provider");
        return res.data;
    },

    /** Get provider rate for a specific pair */
    getProviderRate: async (base: string, quote: string): Promise<{ rate: ProviderRateDetail }> => {
        const res = await api.get("/exchange-rate/provider", { params: { base, quote } });
        return res.data;
    },

    /** Get historical provider rates for a pair */
    getProviderHistory: async (
        base: string,
        quote: string,
        limit = 50
    ): Promise<{ history: ProviderRateHistory[] }> => {
        const res = await api.get("/exchange-rate/provider/history", { params: { base, quote, limit } });
        return res.data;
    },

    /** Ingest a new provider rate (admin / webhook) */
    ingestRate: async (data: {
        providerName: string;
        baseCurrency: string;
        quoteCurrency: string;
        providerRate: number;
    }): Promise<{ success: boolean; rate: { id: string; pair: string; providerRate: number; fetchedAt: string } }> => {
        const res = await api.post("/exchange-rate/ingest", data);
        return res.data;
    },

    // ── Markup Configuration (admin only) ─────────────────────────────────────

    /** Get all markup configs or a specific pair */
    getMarkupConfigs: async (params?: {
        base?: string;
        quote?: string;
    }): Promise<{ markups: MarkupConfig[] } | { markup: MarkupConfig | null }> => {
        const res = await api.get("/exchange-rate/markup", { params });
        return res.data;
    },

    /** Create or update markup config — takes effect immediately */
    setMarkup: async (data: {
        baseCurrency: string;
        quoteCurrency: string;
        markupType: MarkupType;
        markupValue: number;
    }): Promise<{ success: boolean; markup: MarkupConfig }> => {
        const res = await api.post("/exchange-rate/markup", data);
        return res.data;
    },

    /** Deactivate markup for a pair */
    removeMarkup: async (data: {
        baseCurrency: string;
        quoteCurrency: string;
    }): Promise<{ success: boolean; message: string }> => {
        const res = await api.delete("/exchange-rate/markup", { data });
        return res.data;
    },

    // ── Rate Audit Logs (admin only) ───────────────────────────────────────────

    /** Get full audit trail of all generated quotes */
    getRateLogs: async (params?: {
        base?: string;
        quote?: string;
        startDate?: string;
        endDate?: string;
        page?: number;
        limit?: number;
    }): Promise<RateLogsResponse> => {
        const res = await api.get("/exchange-rate/logs", { params });
        return res.data;
    },
};

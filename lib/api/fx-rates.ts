import api from "./client";
import { apiClient } from "./client";

export interface FxRate {
  id?: string;
  pair: string;
  baseCurrency: string;
  quoteCurrency: string;
  buy: number;
  sell: number;
  lastUpdated: string;
  isActive?: boolean;
}

export interface UpsertFxRatePayload {
  pair: string;
  baseCurrency: string;
  quoteCurrency: string;
  buy: number;
  sell: number;
}

export const adminRatesApi = {
  /** Get all FX rates (admin view with full edit controls) */
  getRates: async (): Promise<FxRate[]> => {
    const response = await api.get("/admin/fx-rates");
    return Array.isArray(response.data) ? response.data : [];
  },

  /** Create or update a single FX rate pair */
  upsertRate: async (payload: UpsertFxRatePayload): Promise<FxRate> => {
    const response = await api.post("/admin/fx-rates", payload);
    return response.data;
  },

  /** Update an existing rate by pair */
  updateRate: async (pair: string, payload: Partial<UpsertFxRatePayload>): Promise<FxRate> => {
    const response = await api.patch(`/admin/fx-rates/${encodeURIComponent(pair)}`, payload);
    return response.data;
  },

  /** Delete / deactivate a rate pair */
  deleteRate: async (pair: string): Promise<void> => {
    await api.delete(`/admin/fx-rates/${encodeURIComponent(pair)}`);
  },
};

/** Agent read-only view of admin-set rates */
export const agentRatesApi = {
  getRates: async (): Promise<FxRate[]> => {
    try {
      return await apiClient.get<FxRate[]>('/agent/fx-rates');
    } catch {
      return [];
    }
  },
};


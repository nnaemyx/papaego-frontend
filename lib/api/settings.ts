import api from "./client";

export interface FxMarginResponse {
    countryId: string;
    margin: number;
}

export const settingsApi = {
    getFxMargin: async (countryId: string = "NGA"): Promise<FxMarginResponse> => {
        const response = await api.get("/admin/fx-margins", { params: { countryId } });
        return response.data;
    },

    setFxMargin: async (countryId: string, margin: number): Promise<{ updated: boolean }> => {
        const response = await api.post("/admin/fx-margins", { countryId, margin });
        return response.data;
    },

    getNegotiationConfig: async (): Promise<{ turnoverThreshold: number; maxDiscountPct: number; enabled: boolean }> => {
        const response = await api.get("/admin/negotiation/config");
        return response.data;
    },

    updateNegotiationConfig: async (config: { turnoverThreshold: number; maxDiscountPct: number; enabled: boolean }): Promise<{ success: boolean; config: any }> => {
        const response = await api.patch("/admin/negotiation/config", config);
        return response.data;
    },

    getTurnoverStats: async (): Promise<{
        currentTurnover: number;
        targetTurnover: number;
        turnoverMet: boolean;
        featureEnabled: boolean;
        turnoverProgress: number;
    }> => {
        const response = await api.get("/admin/turnover/today");
        return response.data;
    },

    updateTurnoverConfig: async (payload: { target?: number; enabled?: boolean }): Promise<{
        success: boolean;
        target: number;
        enabled: boolean;
    }> => {
        const response = await api.post("/admin/turnover/config", payload);
        return response.data;
    }
};

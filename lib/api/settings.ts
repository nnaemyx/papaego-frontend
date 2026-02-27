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
    }
};

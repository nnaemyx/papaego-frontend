import api from "./client";

export interface AgentProfileData {
    id: string;
    email: string;
    phone: string;
    firstName: string | null;
    lastName: string | null;
    isActive: boolean;
    role: string;
    createdAt: string;
    agentProfile?: {
        userId: string;
        region: string;
        lga: string;
        licenseId: string;
        dailyLimit: string | number;
        monthlyLimit: string | number;
        homeAddress: string | null;
        dateOfBirth: string | null;
        governmentIdUrl: string | null;
        proofOfAddressUrl: string | null;
        onboardingStatus: string;
    };
}

export const agentProfileApi = {
    getProfile: async (): Promise<AgentProfileData> => {
        const response = await api.get("/agent/profile");
        return response.data;
    },

    updateProfile: async (data: { firstName: string, lastName: string, phone: string, address: string }) => {
        const response = await api.put("/agent/profile", data);
        return response.data;
    },

    updatePassword: async (data: { currentPassword: string, newPassword: string }) => {
        const response = await api.put("/agent/profile/password", data);
        return response.data;
    },

    uploadAvatar: async (file: File): Promise<{ avatarUrl: string }> => {
        const formData = new FormData();
        formData.append("avatar", file);
        const response = await api.post("/agent/profile/avatar", formData, {
            headers: { "Content-Type": "multipart/form-data" }
        });
        return response.data;
    }
};

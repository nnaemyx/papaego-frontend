import api from "./client";

export interface OnboardingData {
  token: string;
  firstName: string;
  lastName: string;
  password: string;
  dateOfBirth: string;
  homeAddress: string;
  governmentIdUrl?: string;
  proofOfAddressUrl?: string;
}

export const onboardingApi = {
  // Verify onboarding token
  verifyToken: async (token: string) => {
    const response = await api.get("/agent/onboarding/verify-token", {
      params: { token },
    });
    return response.data;
  },

  // Complete onboarding (all steps combined)
  completeOnboarding: async (data: OnboardingData) => {
    const response = await api.post("/agent/onboarding/complete-onboarding", data);
    return response.data;
  },

  // Upload documents to cloud storage (if needed)
  // This would be used before calling completeOnboarding
  uploadDocument: async (file: File, type: "governmentId" | "proofOfAddress") => {
    const formData = new FormData();
    formData.append("file", file);
    formData.append("type", type);
    
    // TODO: Replace with actual upload endpoint (e.g., to S3 or Cloudinary)
    // For now, return a mock URL
    return {
      url: `https://storage.papaego.com/${type}/${Date.now()}-${file.name}`,
    };
  },
};

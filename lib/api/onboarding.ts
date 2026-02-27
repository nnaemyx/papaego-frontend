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

  // Upload documents to backend storage
  uploadDocument: async (file: File, type: "governmentId" | "proofOfAddress") => {
    const formData = new FormData();
    formData.append("file", file);
    formData.append("type", type);

    // Uploads file to backend via multer, expecting { url: '/uploads/filename.ext' }
    const response = await api.post("/agent/onboarding/upload", formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    });

    return response.data; // { url: string }
  },
};

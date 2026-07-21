import api from "./client";
import { useAuthStore } from "@/store/auth-store";

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface LoginResponse {
  user: {
    id: string;
    email: string;
    firstName?: string;
    lastName?: string;
    role: "AGENT" | "CUSTOMER" | "ADMIN" | "COMPLIANCE" | "ORG_OWNER" | "ORG_ADMIN";
    isActive: boolean;
  };
  token: string;
}

export interface ResetPasswordPayload {
  token: string;
  password: string;
}

export const authApi = {
  // Login
  login: async (credentials: LoginCredentials): Promise<LoginResponse> => {
    const response = await api.post("/auth/login", credentials);
    const { user, token } = response.data;
    useAuthStore.getState().login(user, token);
    return response.data;
  },

  // Signup
  signup: async (data: {
    email: string;
    password: string;
    phone?: string;
    firstName?: string;
    lastName?: string;
    role?: string;
  }): Promise<LoginResponse> => {
    const response = await api.post("/auth/signup", data);
    return response.data;
  },

  // Logout
  logout: () => {
    useAuthStore.getState().logout();
  },

  // Check if user is authenticated
  isAuthenticated: (): boolean => {
    return useAuthStore.getState().isAuthenticated;
  },

  // Get current user
  getCurrentUser: () => {
    return useAuthStore.getState().user;
  },

  // Forgot password – send reset email
  forgotPassword: async (email: string): Promise<{ message: string }> => {
    const response = await api.post("/auth/forgot-password", { email });
    return response.data;
  },

  // Reset password – set new password with token
  resetPassword: async (payload: ResetPasswordPayload): Promise<{ message: string }> => {
    const response = await api.post("/auth/reset-password", payload);
    return response.data;
  },

  // Verify email OTP
  verifyEmail: async (email: string, otp: string): Promise<{ message: string }> => {
    const response = await api.post("/auth/verify-email", { email, otp });
    return response.data;
  },

  // Resend OTP
  resendOtp: async (email: string): Promise<{ message: string }> => {
    const response = await api.post("/auth/resend-otp", { email });
    return response.data;
  },
};

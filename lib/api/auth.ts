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
    role: "AGENT" | "CUSTOMER" | "ADMIN" | "COMPLIANCE";
    isActive: boolean;
  };
  token: string;
}

export const authApi = {
  // Login
  login: async (credentials: LoginCredentials): Promise<LoginResponse> => {
    const response = await api.post("/auth/login", credentials);
    
    // Save to auth store
    const { user, token } = response.data;
    useAuthStore.getState().login(user, token);
    
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
};

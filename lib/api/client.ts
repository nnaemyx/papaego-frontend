import axios, { AxiosRequestConfig } from "axios";
import { useAuthStore } from "@/store/auth-store";

const API_ENPOINT = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api";
export const API_BASE_URL = API_ENPOINT.replace("/api", "");

const api = axios.create({
    baseURL: API_ENPOINT,
    headers: {
        "Content-Type": "application/json",
    },
});

api.interceptors.request.use((config) => {
    const token = useAuthStore.getState().token;
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

api.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response?.status === 401) {
            useAuthStore.getState().logout();
        }
        return Promise.reject(error);
    }
);

// Generic API client wrapper for type safety
export const apiClient = {
    get: async <T>(url: string, config?: AxiosRequestConfig): Promise<T> => {
        const response = await api.get<T>(url, config);
        return response.data;
    },
    post: async <T>(url: string, data?: Record<string, unknown> | FormData | any, config?: AxiosRequestConfig): Promise<T> => {
        const response = await api.post<T>(url, data, config);
        return response.data;
    },
    patch: async <T>(url: string, data?: Record<string, unknown>, config?: AxiosRequestConfig): Promise<T> => {
        const response = await api.patch<T>(url, data, config);
        return response.data;
    },
    put: async <T>(url: string, data?: Record<string, unknown> | FormData | any, config?: AxiosRequestConfig): Promise<T> => {
        const response = await api.put<T>(url, data, config);
        return response.data;
    },
    delete: async <T = void>(url: string, config?: AxiosRequestConfig): Promise<T> => {
        const response = await api.delete<T>(url, config);
        return response.data;
    },
};

export default api;

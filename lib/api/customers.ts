import { apiClient } from './client';
import api from './client';
import type { Customer, CustomerStats, CustomerFilters, CustomerNote } from '@/lib/types/customer';

export const customersApi = {
  // Get all customers with optional filters
  getCustomers: async (filters?: CustomerFilters): Promise<Customer[]> => {
    const params = new URLSearchParams();
    if (filters?.search) params.append('search', filters.search);
    if (filters?.status && filters.status !== 'All') params.append('status', filters.status);
    if (filters?.customerType && filters.customerType !== 'All') params.append('type', filters.customerType);
    if (filters?.activityLevel && filters.activityLevel !== 'All') params.append('activity', filters.activityLevel);
    if (filters?.dateJoined) params.append('dateJoined', filters.dateJoined);

    const queryString = params.toString();
    const url = `/agent/customers${queryString ? `?${queryString}` : ''}`;

    return apiClient.get<Customer[]>(url);
  },

  // Get single customer details
  getCustomer: async (id: string): Promise<Customer> => {
    return apiClient.get<Customer>(`/agent/customers/${id}`);
  },

  // Get customer statistics
  getCustomerStats: async (): Promise<CustomerStats> => {
    return apiClient.get<CustomerStats>('/agent/customers/stats');
  },

  // Add note to customer
  addCustomerNote: async (customerId: string, note: string): Promise<CustomerNote> => {
    return apiClient.post<CustomerNote>(`/agent/customers/${customerId}/notes`, { content: note });
  },

  // Get customer notes
  getCustomerNotes: async (customerId: string): Promise<CustomerNote[]> => {
    return apiClient.get<CustomerNote[]>(`/agent/customers/${customerId}/notes`);
  },
};

// Admin customers API
export const adminCustomersApi = {
  // Get all customers with optional filters
  getCustomers: async (filters?: CustomerFilters) => {
    const params = new URLSearchParams();
    if (filters?.search) params.append('search', filters.search);
    if (filters?.status && filters.status !== 'All') params.append('status', filters.status.toLowerCase());
    if (filters?.customerType && filters.customerType !== 'All') params.append('type', filters.customerType);
    if (filters?.activityLevel && filters.activityLevel !== 'All') params.append('activity', filters.activityLevel);

    const response = await api.get(`/admin/customers?${params.toString()}`);
    return response.data;
  },

  // Get customer statistics
  getCustomerStats: async () => {
    const response = await api.get("/admin/customers/stats");
    return response.data;
  },

  // Get single customer details
  getCustomer: async (id: string) => {
    const response = await api.get(`/admin/customers/${id}`);
    return response.data;
  },

  // Get customer transactions
  getCustomerTransactions: async (id: string) => {
    const response = await api.get(`/admin/customers/${id}/transactions`);
    return response.data;
  },

  // Add customer note
  addCustomerNote: async (id: string, content: string) => {
    const response = await api.post(`/admin/customers/${id}/notes`, { content });
    return response.data;
  },

  // Export customers to CSV
  exportCustomers: async () => {
    const response = await api.get("/admin/customers/export", {
      responseType: 'blob'
    });
    return response.data;
  },

  // Approve customer
  approveCustomer: async (id: string) => {
    const response = await api.patch(`/admin/customers/${id}/approve`);
    return response.data;
  },
};

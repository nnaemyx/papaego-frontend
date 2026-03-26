import api from "./client";

export interface Supplier {
    id: string;
    businessName: string;
    bankName: string;
    accountNumber: string;
    sector: string;
    address: string;
    linkedCustomers: Array<{ id: string; fullName: string; email: string }>;
    createdAt: string;
    updatedAt: string;
}

export interface CreateSupplierPayload {
    businessName: string;
    bankName: string;
    accountNumber: string;
    sector: string;
    address: string;
    customerIds?: string[];
}

export const suppliersApi = {
    getSuppliers: async (params?: {
        search?: string;
        sector?: string;
        page?: number;
        limit?: number;
    }): Promise<{ suppliers: Supplier[]; total: number }> => {
        const response = await api.get("/admin/suppliers", { params });
        return response.data;
    },

    getSupplier: async (id: string): Promise<Supplier> => {
        const response = await api.get(`/admin/suppliers/${id}`);
        return response.data;
    },

    createSupplier: async (payload: CreateSupplierPayload): Promise<Supplier> => {
        const response = await api.post("/admin/suppliers", payload);
        return response.data;
    },

    updateSupplier: async (
        id: string,
        payload: Partial<CreateSupplierPayload>
    ): Promise<Supplier> => {
        const response = await api.patch(`/admin/suppliers/${id}`, payload);
        return response.data;
    },

    deleteSupplier: async (id: string): Promise<void> => {
        await api.delete(`/admin/suppliers/${id}`);
    },

    linkCustomer: async (supplierId: string, customerId: string): Promise<void> => {
        await api.post(`/admin/suppliers/${supplierId}/link-customer`, { customerId });
    },

    unlinkCustomer: async (supplierId: string, customerId: string): Promise<void> => {
        await api.delete(`/admin/suppliers/${supplierId}/link-customer/${customerId}`);
    },

    getSuppliersByCustomer: async (customerId: string): Promise<Supplier[]> => {
        const response = await api.get(`/admin/suppliers/by-customer/${customerId}`);
        return response.data;
    },
};

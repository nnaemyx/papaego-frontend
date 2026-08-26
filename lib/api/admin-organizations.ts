import api from "./client";

export interface OrganizationListItem {
    id: string;
    businessName: string;
    businessType: string;
    countryOfRegistration: string;
    registrationNumber?: string;
    industry: string;
    contactEmail: string;
    contactPhone: string;
    authorizedRepName: string;
    status: "DRAFT" | "ACTIVE" | "SUSPENDED" | "REJECTED";
    createdAt: string;
    owner: {
        id: string;
        email: string;
        firstName?: string;
        lastName?: string;
        phone?: string;
    };
    qualificationOutcome: string;
    kycStatus: string;
    kybStatus: string;
    hasBankAccount: boolean;
    bankAccountStatus?: string | null;
}

export interface OrganizationFullDetail {
    id: string;
    ownerId: string;
    businessName: string;
    businessType: string;
    countryOfRegistration: string;
    registrationNumber?: string;
    industry: string;
    businessAddress: string;
    city: string;
    state?: string;
    postalCode?: string;
    country: string;
    contactEmail: string;
    contactPhone: string;
    website?: string;
    authorizedRepName: string;
    authorizedRepTitle: string;
    status: "DRAFT" | "ACTIVE" | "SUSPENDED" | "REJECTED";
    createdAt: string;
    updatedAt: string;
    owner: {
        id: string;
        email: string;
        firstName?: string;
        lastName?: string;
        phone?: string;
        role: string;
    };
    qualification?: {
        id: string;
        outcome: string;
        riskScore: number;
        answers: Record<string, any>;
        createdAt: string;
    } | null;
    kycRequests: Array<{
        id: string;
        status: string;
        rejectionReason?: string;
        additionalInfoNote?: string;
        createdAt: string;
        reviewedAt?: string;
        documents: Array<{
            id: string;
            documentType: string;
            fileUrl: string;
            fileName: string;
            fileSize: number;
            mimeType: string;
        }>;
    }>;
    kybRequest?: {
        id: string;
        status: string;
        rejectionReason?: string;
        additionalInfoNote?: string;
        directors: Array<{
            fullName: string;
            nationality: string;
            isPEP: boolean;
        }>;
        ubos: Array<{
            fullName: string;
            ownershipPercentage: number;
            nationality: string;
        }>;
        createdAt: string;
        reviewedAt?: string;
        documents: Array<{
            id: string;
            documentType: string;
            fileUrl: string;
            fileName: string;
            fileSize: number;
            mimeType: string;
        }>;
    } | null;
    documents: Array<{
        id: string;
        documentType: string;
        fileUrl: string;
        fileName: string;
        fileSize: number;
        mimeType: string;
    }>;
    statusHistory: Array<{
        id: string;
        entityType: string;
        fromStatus?: string | null;
        toStatus: string;
        reason?: string;
        createdAt: string;
    }>;
    bankAccount?: {
        id: string;
        bankName: string;
        accountHolder: string;
        accountNumber: string;
        routingNumber: string;
        currency: string;
        status: string;
        createdAt: string;
        events: Array<{
            id: string;
            eventType: string;
            description: string;
            createdAt: string;
        }>;
    } | null;
    bankingProfile?: {
        id: string;
        status: string;
        currency: string;
        fvAccountId?: string;
    } | null;
}

export const adminOrganizationsApi = {
    getOrganizations: async (params?: { status?: string; search?: string }): Promise<{ organizations: OrganizationListItem[]; total: number }> => {
        const queryParams = new URLSearchParams();
        if (params?.status) queryParams.append("status", params.status);
        if (params?.search) queryParams.append("search", params.search);
        const res = await api.get(`/admin/organizations?${queryParams.toString()}`);
        return res.data;
    },

    getOrganizationDetail: async (id: string): Promise<{ organization: OrganizationFullDetail }> => {
        const res = await api.get(`/admin/organizations/${id}`);
        return res.data;
    },

    updateKycStatus: async (id: string, payload: { kycRequestId: string; status: string; reason?: string; note?: string }) => {
        const res = await api.post(`/admin/organizations/${id}/kyc/status`, payload);
        return res.data;
    },

    updateKybStatus: async (id: string, payload: { kybRequestId: string; status: string; reason?: string; note?: string }) => {
        const res = await api.post(`/admin/organizations/${id}/kyb/status`, payload);
        return res.data;
    },

    updateOrganizationStatus: async (id: string, payload: { status: string; reason?: string }) => {
        const res = await api.post(`/admin/organizations/${id}/status`, payload);
        return res.data;
    },

    provisionBank: async (id: string) => {
        const res = await api.post(`/admin/organizations/${id}/provision-bank`);
        return res.data;
    },

    deleteOrganization: async (id: string): Promise<{ success: boolean; message: string }> => {
        const res = await api.delete(`/admin/organizations/${id}`);
        return res.data;
    }
};

import { apiClient } from "./client";

export interface Organization {
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
}

export interface CreateOrganizationPayload {
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
}

export interface OrganizationMember {
    id: string;
    organizationId: string;
    userId: string;
    role: string;
    createdAt: string;
    user: {
        id: string;
        email: string;
        firstName?: string;
        lastName?: string;
        role: string;
        isActive: boolean;
    };
}

export const organizationsApi = {
    create: (data: CreateOrganizationPayload) =>
        apiClient.post<{ organization: Organization }>("/organizations", data),

    getById: (id: string) =>
        apiClient.get<{ organization: Organization }>(`/organizations/${id}`),

    getMyOrganization: () =>
        apiClient.get<{ organization: Organization }>("/organizations/me"),

    update: (id: string, data: Partial<CreateOrganizationPayload>) =>
        apiClient.patch<{ organization: Organization }>(`/organizations/${id}`, data),

    getMembers: (id: string) =>
        apiClient.get<{ members: OrganizationMember[] }>(`/organizations/${id}/members`),

    inviteMember: (id: string, email: string, role: string = "MEMBER") =>
        apiClient.post<{ member: OrganizationMember }>(`/organizations/${id}/members`, { email, role })
};

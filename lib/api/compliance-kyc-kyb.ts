import { apiClient } from "./client";
import api from "./client";

export type VerificationStatus =
    | "DRAFT"
    | "SUBMITTED"
    | "PROCESSING"
    | "MANUAL_REVIEW"
    | "ADDITIONAL_INFO_REQUIRED"
    | "APPROVED"
    | "REJECTED"
    | "EXPIRED";

export interface KycRequest {
    id: string;
    organizationId: string;
    userId: string;
    fvBankApplicationId?: string;
    fullName: string;
    dateOfBirth: string;
    nationality: string;
    residentialAddress: string;
    phone: string;
    email: string;
    idType: string;
    status: VerificationStatus;
    rejectionReason?: string;
    additionalInfoNote?: string;
    submittedAt?: string;
    reviewedAt?: string;
    expiresAt?: string;
    createdAt: string;
    documents?: VerificationDocument[];
}

export interface KybRequest {
    id: string;
    organizationId: string;
    fvBankApplicationId?: string;
    companyName: string;
    registrationNumber: string;
    countryOfIncorporation: string;
    businessAddress: string;
    taxIdentification?: string;
    directors?: Director[];
    ubos?: UBO[];
    status: VerificationStatus;
    rejectionReason?: string;
    additionalInfoNote?: string;
    submittedAt?: string;
    reviewedAt?: string;
    documents?: VerificationDocument[];
}

export interface Director {
    name: string;
    role: string;
    dateOfBirth?: string;
    nationality?: string;
}

export interface UBO {
    name: string;
    ownershipPercentage: number;
    nationality?: string;
    dateOfBirth?: string;
}

export interface VerificationDocument {
    id: string;
    organizationId: string;
    kycRequestId?: string;
    kybRequestId?: string;
    documentType: string;
    fileUrl: string;
    fileName: string;
    fileSize: number;
    mimeType: string;
    createdAt: string;
}

export interface ComplianceStatus {
    organization: { id: string; businessName: string; status: string };
    kyc: {
        id: string;
        status: VerificationStatus;
        submittedAt?: string;
        rejectionReason?: string;
        additionalInfoNote?: string;
    } | null;
    kyb: {
        id: string;
        status: VerificationStatus;
        submittedAt?: string;
        rejectionReason?: string;
        additionalInfoNote?: string;
    } | null;
    isFullyApproved: boolean;
    canProceedToManagedAccount: boolean;
    history: StatusHistoryEntry[];
}

export interface StatusHistoryEntry {
    id: string;
    entityType: string;
    fromStatus?: string;
    toStatus: string;
    changedBy?: string;
    reason?: string;
    createdAt: string;
}

export interface KycSubmitPayload {
    organizationId: string;
    fullName: string;
    dateOfBirth: string;
    nationality: string;
    residentialAddress: string;
    phone: string;
    email: string;
    idType: "PASSPORT" | "NATIONAL_ID" | "DRIVERS_LICENSE";
}

export interface KybSubmitPayload {
    organizationId: string;
    companyName: string;
    registrationNumber: string;
    countryOfIncorporation: string;
    businessAddress: string;
    taxIdentification?: string;
    directors: Director[];
    ubos?: UBO[];
}

export const complianceApi = {
    // KYC
    submitKyc: (data: KycSubmitPayload) =>
        apiClient.post<{ kyc: KycRequest; fvBankApplicationId: string }>("/compliance/kyc", data),

    getKycStatus: (organizationId: string) =>
        apiClient.get<{ kyc: KycRequest }>(`/compliance/kyc/status?organizationId=${organizationId}`),

    // KYB
    submitKyb: (data: KybSubmitPayload) =>
        apiClient.post<{ kyb: KybRequest; fvBankApplicationId: string }>("/compliance/kyb", data),

    getKybStatus: (organizationId: string) =>
        apiClient.get<{ kyb: KybRequest }>(`/compliance/kyb/status?organizationId=${organizationId}`),

    // Documents
    uploadDocument: (formData: FormData) =>
        api.post("/compliance/documents", formData, {
            headers: { "Content-Type": "multipart/form-data" }
        }).then(r => r.data as { document: VerificationDocument }),

    // Status & History
    getStatus: (organizationId: string) =>
        apiClient.get<ComplianceStatus>(`/compliance/status?organizationId=${organizationId}`),

    getHistory: (organizationId: string) =>
        apiClient.get<{ history: StatusHistoryEntry[] }>(`/compliance/history?organizationId=${organizationId}`)
};

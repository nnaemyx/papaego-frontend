import { apiClient } from "./client";

export type BankAccountStatus =
    | "PENDING_CREATION"
    | "CREATING"
    | "ACTIVE"
    | "RESTRICTED"
    | "SUSPENDED"
    | "FROZEN"
    | "CLOSED";

export interface BankingEligibilityResponse {
    isEligible: boolean;
    reasons: string[];
    details: {
        organizationExists: boolean;
        organizationActive: boolean;
        qualificationCompleted: boolean;
        kycApproved: boolean;
        kybApproved: boolean;
        notSuspended: boolean;
        noExistingActiveAccount: boolean;
    };
}

export interface BankAccountEvent {
    id: string;
    event: string;
    source: string;
    statusFrom?: BankAccountStatus;
    statusTo?: BankAccountStatus;
    details?: string;
    createdAt: string;
}

export interface BankingProfile {
    id: string;
    organizationId: string;
    bankAccountId: string;
    bankName: string;
    accountHolder: string;
    accountNumber: string;
    maskedAccountNumber: string;
    routingNumber: string;
    currency: string;
    country: string;
    swiftBic: string;
    status: BankAccountStatus;
    createdAt: string;
    updatedAt: string;
    recentEvents?: BankAccountEvent[];
}

export interface BankingStatusResponse {
    hasAccount: boolean;
    status: BankAccountStatus;
    isEligible?: boolean;
    reasons?: string[];
    accountNumber?: string;
    routingNumber?: string;
    bankName?: string;
    currency?: string;
    createdAt?: string;
}

export async function getBankingEligibility(organizationId?: string): Promise<BankingEligibilityResponse> {
    const url = organizationId ? `/banking/eligibility?organizationId=${organizationId}` : "/banking/eligibility";
    return apiClient.get<BankingEligibilityResponse>(url);
}

export async function provisionManagedAccount(organizationId?: string): Promise<{ bankAccount: any; bankingProfile: BankingProfile }> {
    return apiClient.post<{ bankAccount: any; bankingProfile: BankingProfile }>("/banking/account", {
        organizationId
    });
}

export async function getBankingProfile(organizationId?: string): Promise<{ profile: BankingProfile }> {
    const url = organizationId ? `/banking/account?organizationId=${organizationId}` : "/banking/account";
    return apiClient.get<{ profile: BankingProfile }>(url);
}

export async function getBankingStatus(organizationId?: string): Promise<BankingStatusResponse> {
    const url = organizationId ? `/banking/account/status?organizationId=${organizationId}` : "/banking/account/status";
    return apiClient.get<BankingStatusResponse>(url);
}

export async function syncBankAccount(organizationId?: string): Promise<{ synced: boolean; message: string; hasStatusChanged: boolean; currentStatus: BankAccountStatus }> {
    return apiClient.post<{ synced: boolean; message: string; hasStatusChanged: boolean; currentStatus: BankAccountStatus }>("/banking/sync", {
        organizationId
    });
}

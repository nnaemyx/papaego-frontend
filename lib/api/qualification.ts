import { apiClient } from "./client";

export interface QualificationAssessment {
    id: string;
    organizationId: string;
    hasInternationalPayments: boolean;
    expectedMonthlyVolume?: number;
    supplierPaymentFrequency?: string;
    countriesOfOperation: string[];
    primaryUseCase?: string;
    additionalContext?: string;
    outcome?: "QUALIFIED" | "MANUAL_REVIEW" | "NOT_QUALIFIED";
    reviewNotes?: string;
    reviewedAt?: string;
    createdAt: string;
    updatedAt: string;
}

export interface QualificationPayload {
    organizationId: string;
    hasInternationalPayments: boolean;
    expectedMonthlyVolume?: number;
    supplierPaymentFrequency?: "WEEKLY" | "MONTHLY" | "QUARTERLY" | "AD_HOC";
    countriesOfOperation: string[];
    primaryUseCase?: string;
    additionalContext?: string;
}

export const qualificationApi = {
    submit: (data: QualificationPayload) =>
        apiClient.post<{ assessment: QualificationAssessment; outcome: string; notes: string }>("/qualification", data),

    getStatus: (organizationId: string) =>
        apiClient.get<{ assessment: QualificationAssessment }>(`/qualification/status?organizationId=${organizationId}`)
};

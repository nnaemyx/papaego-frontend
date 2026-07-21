import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { Organization, CreateOrganizationPayload } from "@/lib/api/organizations";
import type { QualificationPayload } from "@/lib/api/qualification";
import type { KycSubmitPayload, KybSubmitPayload, Director, UBO } from "@/lib/api/compliance-kyc-kyb";

export type OnboardingStep =
    | "org-details"
    | "qualification"
    | "kyc"
    | "kyb"
    | "review";

export interface OnboardingState {
    currentStep: OnboardingStep;
    completedSteps: OnboardingStep[];

    // Step 1: Organization details (draft — not yet saved)
    orgDraft: Partial<CreateOrganizationPayload>;

    // Step 2: Qualification draft
    qualificationDraft: Partial<QualificationPayload>;

    // Step 3: KYC draft
    kycDraft: Partial<KycSubmitPayload>;

    // Step 4: KYB draft
    kybDraft: Partial<KybSubmitPayload>;
    directors: Director[];
    ubos: UBO[];

    // Saved entities after API calls
    savedOrgId: string | null;
    savedOrg: Organization | null;

    // Actions
    setStep: (step: OnboardingStep) => void;
    markStepComplete: (step: OnboardingStep) => void;
    setOrgDraft: (data: Partial<CreateOrganizationPayload>) => void;
    setQualificationDraft: (data: Partial<QualificationPayload>) => void;
    setKycDraft: (data: Partial<KycSubmitPayload>) => void;
    setKybDraft: (data: Partial<KybSubmitPayload>) => void;
    setDirectors: (directors: Director[]) => void;
    setUbos: (ubos: UBO[]) => void;
    setSavedOrg: (org: Organization) => void;
    reset: () => void;
}

const initialState = {
    currentStep: "org-details" as OnboardingStep,
    completedSteps: [] as OnboardingStep[],
    orgDraft: {} as Partial<CreateOrganizationPayload>,
    qualificationDraft: {} as Partial<QualificationPayload>,
    kycDraft: {} as Partial<KycSubmitPayload>,
    kybDraft: {} as Partial<KybSubmitPayload>,
    directors: [] as Director[],
    ubos: [] as UBO[],
    savedOrgId: null as string | null,
    savedOrg: null as Organization | null,
};

export const useOnboardingStore = create<OnboardingState>()(
    persist(
        (set) => ({
            ...initialState,

            setStep: (step) => set({ currentStep: step }),

            markStepComplete: (step) =>
                set((state) => ({
                    completedSteps: state.completedSteps.includes(step)
                        ? state.completedSteps
                        : [...state.completedSteps, step]
                })),

            setOrgDraft: (data) =>
                set((state) => ({ orgDraft: { ...state.orgDraft, ...data } })),

            setQualificationDraft: (data) =>
                set((state) => ({ qualificationDraft: { ...state.qualificationDraft, ...data } })),

            setKycDraft: (data) =>
                set((state) => ({ kycDraft: { ...state.kycDraft, ...data } })),

            setKybDraft: (data) =>
                set((state) => ({ kybDraft: { ...state.kybDraft, ...data } })),

            setDirectors: (directors) => set({ directors }),

            setUbos: (ubos) => set({ ubos }),

            setSavedOrg: (org) => set({ savedOrg: org, savedOrgId: org.id }),

            reset: () => set(initialState),
        }),
        {
            name: "onboarding-storage",
            // Only persist draft data and completed steps (not sensitive data)
            partialize: (state) => ({
                currentStep: state.currentStep,
                completedSteps: state.completedSteps,
                orgDraft: state.orgDraft,
                qualificationDraft: state.qualificationDraft,
                kycDraft: state.kycDraft,
                kybDraft: state.kybDraft,
                directors: state.directors,
                ubos: state.ubos,
                savedOrgId: state.savedOrgId,
                savedOrg: state.savedOrg
            })
        }
    )
);

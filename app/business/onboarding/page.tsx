"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { useAuthStore } from "@/store/auth-store";
import { useOnboardingStore, type OnboardingStep } from "@/store/onboarding-store";
import OnboardingWizard from "@/components/business/OnboardingWizard";
import OrgDetailsForm from "@/components/business/OrgDetailsForm";
import QualificationForm from "@/components/business/QualificationForm";
import KycForm from "@/components/business/KycForm";
import KybForm from "@/components/business/KybForm";
import VerificationReview from "@/components/business/VerificationReview";

const STEP_ORDER: OnboardingStep[] = ["org-details", "qualification", "kyc", "kyb", "review"];

export default function OnboardingPage() {
    const router = useRouter();
    const { isAuthenticated } = useAuthStore();
    const { currentStep, completedSteps, setStep, markStepComplete, savedOrgId, setSavedOrg, reset } = useOnboardingStore();

    // Auth guard & User Org Sync
    useEffect(() => {
        if (!isAuthenticated) {
            router.push("/business/auth/signin");
            return;
        }

        // Fetch organization for the currently authenticated user
        import("@/lib/api/organizations").then(({ organizationsApi }) => {
            organizationsApi.getMyOrganization()
                .then((res) => {
                    if (res?.organization) {
                        setSavedOrg(res.organization);
                        if (res.organization.id) markStepComplete("org-details");
                        if (res.organization.qualification) markStepComplete("qualification");
                        if (res.organization.kycRequests && res.organization.kycRequests.length > 0) markStepComplete("kyc");
                        if (res.organization.kybRequest) markStepComplete("kyb");
                    }
                })
                .catch(() => {
                    // New user with no organization draft yet — proceed to Step 1
                });
        });
    }, [isAuthenticated, router, setSavedOrg, markStepComplete]);

    const goToNext = () => {
        const idx = STEP_ORDER.indexOf(currentStep);
        if (idx < STEP_ORDER.length - 1) {
            setStep(STEP_ORDER[idx + 1]);
        }
    };

    const goToPrev = () => {
        const idx = STEP_ORDER.indexOf(currentStep);
        if (idx > 0) {
            setStep(STEP_ORDER[idx - 1]);
        }
    };

    const handleFinalSubmit = () => {
        markStepComplete("review");
        toast.success("Onboarding complete!", {
            description: "Your KYC and KYB applications have been submitted to FV Bank. We'll notify you as verification progresses.",
            duration: 6000
        });
        router.push("/customer/dashboard");
    };

    if (!isAuthenticated) return null;

    return (
        <OnboardingWizard currentStep={currentStep} completedSteps={completedSteps}>
            {currentStep === "org-details" && (
                <OrgDetailsForm onNext={goToNext} />
            )}
            {currentStep === "qualification" && (
                <QualificationForm onNext={goToNext} onBack={goToPrev} />
            )}
            {currentStep === "kyc" && (
                <KycForm onNext={goToNext} onBack={goToPrev} />
            )}
            {currentStep === "kyb" && (
                <KybForm onNext={goToNext} onBack={goToPrev} />
            )}
            {currentStep === "review" && (
                <VerificationReview
                    onSubmit={handleFinalSubmit}
                    onBack={goToPrev}
                />
            )}
        </OnboardingWizard>
    );
}

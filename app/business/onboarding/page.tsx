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
    const { user, isAuthenticated } = useAuthStore();
    const { currentStep, completedSteps, setStep, markStepComplete, savedOrgId } = useOnboardingStore();

    // Auth guard
    useEffect(() => {
        if (!isAuthenticated) {
            router.push("/business/auth/signin");
        }
    }, [isAuthenticated, router]);

    // If org already active, redirect to dashboard
    useEffect(() => {
        if (savedOrgId && completedSteps.length === STEP_ORDER.length - 1) {
            // All steps done — redirect to status dashboard
        }
    }, [savedOrgId, completedSteps]);

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
        router.push("/business/dashboard");
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

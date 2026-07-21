"use client";

import { CheckCircle2, Building2, BarChart3, User, Building, ChevronRight, Loader2, Shield } from "lucide-react";
import { useOnboardingStore } from "@/store/onboarding-store";
import ComplianceStatusBadge from "./ComplianceStatusBadge";

interface Props {
    onSubmit: () => void;
    onBack: () => void;
    isLoading?: boolean;
}

export default function VerificationReview({ onSubmit, onBack, isLoading }: Props) {
    const { orgDraft, qualificationDraft, kycDraft, kybDraft, completedSteps } = useOnboardingStore();

    const steps = [
        {
            id: "org-details",
            icon: <Building2 className="w-4 h-4" />,
            label: "Organization Details",
            summary: orgDraft.businessName
                ? `${orgDraft.businessName} · ${orgDraft.businessType} · ${orgDraft.country}`
                : "Not completed"
        },
        {
            id: "qualification",
            icon: <BarChart3 className="w-4 h-4" />,
            label: "Business Qualification",
            summary: qualificationDraft.hasInternationalPayments !== undefined
                ? `International payments: ${qualificationDraft.hasInternationalPayments ? "Yes" : "No"} · Countries: ${(qualificationDraft.countriesOfOperation || []).slice(0, 3).join(", ")}${(qualificationDraft.countriesOfOperation || []).length > 3 ? "..." : ""}`
                : "Not completed"
        },
        {
            id: "kyc",
            icon: <User className="w-4 h-4" />,
            label: "Identity Verification (KYC)",
            summary: kycDraft.fullName
                ? `${kycDraft.fullName} · ${kycDraft.nationality} · ${kycDraft.idType?.replace(/_/g, " ")}`
                : "Not completed"
        },
        {
            id: "kyb",
            icon: <Building className="w-4 h-4" />,
            label: "Company Verification (KYB)",
            summary: kybDraft.companyName
                ? `${kybDraft.companyName} · ${kybDraft.registrationNumber} · ${kybDraft.countryOfIncorporation}`
                : "Not completed"
        }
    ] as const;

    const allComplete = ["org-details", "qualification", "kyc", "kyb"].every(
        step => completedSteps.includes(step as any)
    );

    return (
        <div className="space-y-8">
            {/* Hero banner */}
            <div className="flex flex-col items-center text-center py-4">
                <div className="w-14 h-14 rounded-2xl flex items-center justify-center mb-3 shadow-md"
                    style={{ backgroundColor: "#C9A227", color: "white" }}>
                    <Shield className="w-7 h-7" />
                </div>
                <h2 className="text-xl font-bold" style={{ color: "#012333" }}>Ready to Submit?</h2>
                <p className="text-sm mt-1 max-w-sm" style={{ color: "#6B7078" }}>
                    Please review your information below. Once submitted, FV Bank will begin the compliance verification process.
                </p>
            </div>

            {/* Step summaries */}
            <div className="space-y-3">
                {steps.map((step) => {
                    const isComplete = completedSteps.includes(step.id as any);
                    return (
                        <div key={step.id} className={`flex items-center gap-4 p-4 rounded-xl border transition-all ${
                            isComplete
                                ? "bg-emerald-50 border-emerald-200"
                                : "bg-red-50 border-red-200"
                        }`}>
                            <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${
                                isComplete ? "bg-emerald-100 text-emerald-700" : "bg-red-100 text-red-700"
                            }`}>
                                {isComplete ? <CheckCircle2 className="w-4 h-4" /> : step.icon}
                            </div>
                            <div className="flex-1 min-w-0">
                                <p className={`text-sm font-semibold ${isComplete ? "text-emerald-900" : "text-red-900"}`}>
                                    {step.label}
                                </p>
                                <p className={`text-xs mt-0.5 truncate ${isComplete ? "text-emerald-700" : "text-red-700"}`}>
                                    {step.summary}
                                </p>
                            </div>
                            <ComplianceStatusBadge
                                status={isComplete ? "SUBMITTED" : "DRAFT"}
                                size="sm"
                                showDot={false}
                            />
                        </div>
                    );
                })}
            </div>

            {/* Legal disclaimer */}
            <div className="p-4 rounded-xl text-xs leading-relaxed"
                style={{ backgroundColor: "#FFF7E6", border: "1px solid #F0CD00", color: "#856404" }}>
                By submitting, you confirm that all information provided is accurate and complete. PapaEgo will transmit your KYC and KYB data to FV Bank for regulatory compliance verification. The final approval decision rests solely with FV Bank.
            </div>

            {!allComplete && (
                <div className="flex gap-2 p-4 rounded-xl text-sm bg-amber-50 border border-amber-200 text-amber-800">
                    <span>⚠️</span>
                    <span>Please complete all steps before submitting. Some sections are still incomplete.</span>
                </div>
            )}

            <div className="flex justify-between pt-4 border-t" style={{ borderColor: "#E1E3E6" }}>
                <button onClick={onBack}
                    className="flex items-center gap-2 px-5 py-3 rounded-xl border border-[#E1E3E6] text-sm font-semibold text-[#6B7078] hover:bg-gray-50 transition-all">
                    ← Back
                </button>
                {allComplete && (
                    <button onClick={onSubmit} disabled={isLoading}
                        className="flex items-center gap-2 font-semibold px-8 py-3 rounded-xl text-white transition-all hover:opacity-95 disabled:opacity-60 shadow-md"
                        style={{ backgroundColor: "#10B981" }}>
                        {isLoading && <Loader2 className="w-4 h-4 animate-spin" />}
                        {isLoading ? "Submitting..." : "Complete Submission"}
                        {!isLoading && <ChevronRight className="w-4 h-4" />}
                    </button>
                )}
            </div>
        </div>
    );
}

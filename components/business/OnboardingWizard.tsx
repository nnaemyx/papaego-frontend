"use client";

import React from "react";
import Image from "next/image";
import Link from "next/link";
import { Check, ChevronRight, Building2 } from "lucide-react";
import type { OnboardingStep } from "@/store/onboarding-store";

const STEPS: { id: OnboardingStep; label: string; description: string }[] = [
    { id: "org-details", label: "Organization", description: "Business details" },
    { id: "qualification", label: "Qualification", description: "Business assessment" },
    { id: "kyc", label: "Identity (KYC)", description: "Personal verification" },
    { id: "kyb", label: "Company (KYB)", description: "Corporate verification" },
    { id: "review", label: "Review", description: "Submit & confirm" }
];

interface Props {
    currentStep: OnboardingStep;
    completedSteps: OnboardingStep[];
    children: React.ReactNode;
}

export default function OnboardingWizard({ currentStep, completedSteps, children }: Props) {
    const currentIndex = STEPS.findIndex(s => s.id === currentStep);

    return (
        <div className="min-h-screen flex flex-col font-sans" style={{ backgroundColor: "#F7F8F9" }}>
            {/* Top Navigation Bar */}
            <header className="bg-white border-b sticky top-0 z-40" style={{ borderColor: "#E1E3E6" }}>
                <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
                    <Link href="/">
                        <Image
                            src="/images/logo.png"
                            alt="PapaEgo"
                            width={160}
                            height={36}
                            className="h-8 w-auto"
                            priority
                        />
                    </Link>
                    <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold"
                        style={{ backgroundColor: "#FFF7E6", color: "#C9A227", border: "1px solid #F0CD00" }}>
                        <Building2 className="w-3.5 h-3.5" />
                        Business Onboarding
                    </div>
                </div>
            </header>

            <div className="flex flex-1 max-w-7xl mx-auto w-full px-6 py-10 gap-10">
                {/* Sidebar Stepper */}
                <aside className="w-64 shrink-0 hidden lg:block">
                    <div className="sticky top-24 bg-white border rounded-2xl p-6 shadow-sm" style={{ borderColor: "#E1E3E6" }}>
                        <p className="text-xs font-bold uppercase tracking-wider mb-6" style={{ color: "#6B7078" }}>
                            Onboarding Progress
                        </p>
                        <ol className="relative space-y-6">
                            {STEPS.map((step, index) => {
                                const isCompleted = completedSteps.includes(step.id);
                                const isCurrent = step.id === currentStep;

                                return (
                                    <li key={step.id} className="flex gap-4 items-start relative">
                                        {/* Indicator circle */}
                                        <div className={`
                                            w-8 h-8 rounded-full flex items-center justify-center shrink-0 font-bold text-xs transition-all duration-200
                                            ${isCompleted ? "bg-[#10B981] text-white" : ""}
                                            ${isCurrent ? "bg-[#C9A227] text-white ring-4 ring-[#C9A227]/20" : ""}
                                            ${!isCompleted && !isCurrent ? "bg-gray-100 text-gray-400 border border-gray-200" : ""}
                                        `}>
                                            {isCompleted ? <Check className="w-4 h-4" /> : index + 1}
                                        </div>

                                        <div className="pt-0.5">
                                            <p className={`text-sm font-semibold transition-colors ${
                                                isCurrent ? "text-[#C9A227]" : isCompleted ? "text-[#012333]" : "text-gray-400"
                                            }`}>
                                                {step.label}
                                            </p>
                                            <p className="text-xs mt-0.5" style={{ color: "#6B7078" }}>{step.description}</p>
                                        </div>
                                    </li>
                                );
                            })}
                        </ol>
                    </div>
                </aside>

                {/* Mobile Stepper */}
                <div className="lg:hidden flex items-center gap-2 w-full mb-6 overflow-x-auto pb-2">
                    {STEPS.map((step, index) => {
                        const isCompleted = completedSteps.includes(step.id);
                        const isCurrent = step.id === currentStep;
                        return (
                            <React.Fragment key={step.id}>
                                <div className={`
                                    w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold shrink-0 transition-all
                                    ${isCompleted ? "bg-[#10B981] text-white" : ""}
                                    ${isCurrent ? "bg-[#C9A227] text-white" : ""}
                                    ${!isCompleted && !isCurrent ? "bg-gray-200 text-gray-400" : ""}
                                `}>
                                    {isCompleted ? <Check className="w-3.5 h-3.5" /> : index + 1}
                                </div>
                                {index < STEPS.length - 1 && (
                                    <ChevronRight className="w-3 h-3 text-gray-300 shrink-0" />
                                )}
                            </React.Fragment>
                        );
                    })}
                </div>

                {/* Main Content Card */}
                <main className="flex-1 min-w-0">
                    {/* Step Header */}
                    <div className="mb-6">
                        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-600 mb-3">
                            Step {currentIndex + 1} of {STEPS.length}
                        </div>
                        <h1 className="text-2xl font-bold" style={{ color: "#012333" }}>
                            {STEPS[currentIndex]?.label}
                        </h1>
                        <p className="text-sm mt-1" style={{ color: "#6B7078" }}>{STEPS[currentIndex]?.description}</p>
                    </div>

                    {/* Step Form Card */}
                    <div className="bg-white border rounded-2xl p-8 shadow-sm" style={{ borderColor: "#E1E3E6" }}>
                        {children}
                    </div>
                </main>
            </div>
        </div>
    );
}

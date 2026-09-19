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
                <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3 sm:py-4 flex items-center justify-between">
                    <Link href="/">
                        <Image
                            src="/images/logo.png"
                            alt="PapaEgo"
                            width={160}
                            height={36}
                            className="h-7 sm:h-8 w-auto"
                            priority
                        />
                    </Link>
                    <div className="inline-flex items-center gap-1.5 px-2.5 sm:px-3 py-1 rounded-full text-[11px] sm:text-xs font-semibold"
                        style={{ backgroundColor: "#FFF7E6", color: "#C9A227", border: "1px solid #F0CD00" }}>
                        <Building2 className="w-3.5 h-3.5 shrink-0" />
                        <span>Business Onboarding</span>
                    </div>
                </div>
            </header>

            <div className="flex flex-col lg:flex-row flex-1 max-w-7xl mx-auto w-full px-3.5 sm:px-6 py-5 sm:py-10 gap-6 lg:gap-10">
                {/* Sidebar Stepper (Desktop only) */}
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

                {/* Main Content Area & Mobile Stepper */}
                <main className="flex-1 min-w-0">
                    {/* Mobile Stepper Card (Visible on mobile & tablet) */}
                    <div className="lg:hidden mb-5 bg-white border rounded-xl sm:rounded-2xl p-4 shadow-sm" style={{ borderColor: "#E1E3E6" }}>
                        <div className="flex items-center justify-between mb-2">
                            <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
                                Step {currentIndex + 1} of {STEPS.length}
                            </span>
                            <span className="text-xs font-bold text-[#C9A227]">
                                {STEPS[currentIndex]?.label}
                            </span>
                        </div>

                        {/* Progress Bar */}
                        <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden mb-3">
                            <div
                                className="h-full bg-[#C9A227] transition-all duration-300 rounded-full"
                                style={{ width: `${((currentIndex + 1) / STEPS.length) * 100}%` }}
                            />
                        </div>

                        {/* Step circles */}
                        <div className="flex items-center justify-between gap-1 overflow-x-auto pb-1 scrollbar-hidden">
                            {STEPS.map((step, index) => {
                                const isCompleted = completedSteps.includes(step.id);
                                const isCurrent = step.id === currentStep;
                                return (
                                    <div
                                        key={step.id}
                                        className="flex flex-col items-center flex-1 min-w-[54px] text-center"
                                    >
                                        <div className={`
                                            w-6 h-6 rounded-full flex items-center justify-center text-[11px] font-bold transition-all mb-1
                                            ${isCompleted ? "bg-[#10B981] text-white" : ""}
                                            ${isCurrent ? "bg-[#C9A227] text-white ring-2 ring-[#C9A227]/30 font-extrabold" : ""}
                                            ${!isCompleted && !isCurrent ? "bg-slate-100 text-slate-400 border border-slate-200" : ""}
                                        `}>
                                            {isCompleted ? <Check className="w-3.5 h-3.5 stroke-[2.5]" /> : index + 1}
                                        </div>
                                        <span className={`text-[10px] font-medium leading-tight truncate max-w-[64px] ${
                                            isCurrent ? "text-[#C9A227] font-bold" : isCompleted ? "text-slate-700" : "text-slate-400"
                                        }`}>
                                            {step.label.split(" ")[0]}
                                        </span>
                                    </div>
                                );
                            })}
                        </div>
                    </div>

                    {/* Step Header */}
                    <div className="mb-4 sm:mb-6">
                        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-600 mb-2 sm:mb-3">
                            Step {currentIndex + 1} of {STEPS.length}
                        </div>
                        <h1 className="text-xl sm:text-2xl font-bold" style={{ color: "#012333" }}>
                            {STEPS[currentIndex]?.label}
                        </h1>
                        <p className="text-xs sm:text-sm mt-1" style={{ color: "#6B7078" }}>{STEPS[currentIndex]?.description}</p>
                    </div>

                    {/* Step Form Card */}
                    <div className="bg-white border rounded-xl sm:rounded-2xl p-4 sm:p-6 md:p-8 shadow-sm" style={{ borderColor: "#E1E3E6" }}>
                        {children}
                    </div>
                </main>
            </div>
        </div>
    );
}

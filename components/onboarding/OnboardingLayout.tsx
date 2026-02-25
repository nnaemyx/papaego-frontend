"use client";

import Image from "next/image";
import { Check } from "lucide-react";

interface OnboardingLayoutProps {
  children: React.ReactNode;
  currentStep: 1 | 2 | 3 | 4;
  title: string;
  subtitle: string;
}

const steps = [
  { number: 1, label: "Account Setup" },
  { number: 2, label: "Personal Details" },
  { number: 3, label: "Identity & Compliance" },
  { number: 4, label: "Role & Region" },
];

export function OnboardingLayout({
  children,
  currentStep,
  title,
  subtitle,
}: OnboardingLayoutProps) {
  const getStepStatus = (stepNumber: number) => {
    if (stepNumber < currentStep) return "completed";
    if (stepNumber === currentStep) return "active";
    return "inactive";
  };

  const getStepColor = (status: string) => {
    switch (status) {
      case "completed":
        return "#27ae60";
      case "active":
        return "#1890ff";
      default:
        return "#e6e7ea";
    }
  };

  const getTextColor = (status: string) => {
    switch (status) {
      case "completed":
        return "#27ae60";
      case "active":
        return "#1890ff";
      default:
        return "#9aa0a6";
    }
  };

  return (
    <div className="min-h-screen" style={{ backgroundColor: "#ffffff" }}>
      {/* Logo */}
      <div className="px-4 md:px-20 py-10">
        <Image src="/logo.png" alt="PapaEgo" width={151} height={34} priority />
      </div>

      {/* Header */}
      <div className="max-w-[974px] mx-auto px-4 mb-8">
        <div className="text-center mb-2">
          <h1 className="text-3xl font-bold mb-2" style={{ color: "#2b2f33" }}>
            {title}
          </h1>
          <p className="text-base" style={{ color: "#6b7078" }}>
            {subtitle}
          </p>
        </div>
      </div>

      {/* Step Indicator */}
      <div className="max-w-[974px] mx-auto px-4 mb-8">
        <div
          className="flex items-center justify-between p-6 rounded-lg border"
          style={{ backgroundColor: "#f8f8f8", borderColor: "#e1e3e6" }}
        >
          {steps.map((step, index) => {
            const status = getStepStatus(step.number);
            const stepColor = getStepColor(status);
            const textColor = getTextColor(status);

            return (
              <div key={step.number} className="flex items-center flex-1">
                <div className="flex items-center gap-2">
                  <div
                    className="w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold"
                    style={{
                      backgroundColor: stepColor,
                      color: "#ffffff",
                    }}
                  >
                    {status === "completed" ? (
                      <Check className="w-4 h-4" />
                    ) : (
                      step.number
                    )}
                  </div>
                  <span
                    className="text-base font-bold hidden md:block"
                    style={{ color: textColor }}
                  >
                    {step.label}
                  </span>
                </div>
                {index < steps.length - 1 && (
                  <div
                    className="flex-1 h-0.5 mx-4"
                    style={{ backgroundColor: stepColor }}
                  />
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Content */}
      <div className="max-w-[974px] mx-auto px-4 pb-12">{children}</div>
    </div>
  );
}

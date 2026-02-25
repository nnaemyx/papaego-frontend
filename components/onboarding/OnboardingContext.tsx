"use client";

import { createContext, useContext, useState, ReactNode } from "react";

export interface OnboardingFormData {
  // Step 1: Account Setup
  password?: string;
  confirmPassword?: string;

  // Step 2: Personal Details
  firstName?: string;
  lastName?: string;
  homeAddress?: string;
  phoneNumber?: string;
  dateOfBirth?: string;

  // Step 3: Documents
  governmentIdFile?: File;
  proofOfAddressFile?: File;
  governmentIdUrl?: string;
  proofOfAddressUrl?: string;

  // Token
  token?: string;
}

interface OnboardingContextType {
  formData: OnboardingFormData;
  updateFormData: (data: Partial<OnboardingFormData>) => void;
  resetFormData: () => void;
}

const OnboardingContext = createContext<OnboardingContextType | undefined>(undefined);

export function OnboardingProvider({ children }: { children: ReactNode }) {
  const [formData, setFormData] = useState<OnboardingFormData>({});

  const updateFormData = (data: Partial<OnboardingFormData>) => {
    setFormData((prev) => ({ ...prev, ...data }));
  };

  const resetFormData = () => {
    setFormData({});
  };

  return (
    <OnboardingContext.Provider value={{ formData, updateFormData, resetFormData }}>
      {children}
    </OnboardingContext.Provider>
  );
}

export function useOnboarding() {
  const context = useContext(OnboardingContext);
  if (context === undefined) {
    throw new Error("useOnboarding must be used within OnboardingProvider");
  }
  return context;
}

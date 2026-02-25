"use client";

import { OnboardingProvider } from "@/components/onboarding/OnboardingContext";

export default function OnboardingTokenLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <OnboardingProvider>{children}</OnboardingProvider>;
}

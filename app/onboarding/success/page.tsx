"use client";

import Image from "next/image";
import { CheckCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";

export default function OnboardingSuccessPage() {
  return (
    <div className="min-h-screen" style={{ backgroundColor: "#ffffff" }}>
      {/* Logo */}
      <div className="px-4 md:px-20 py-10">
        <Image src="/logo.png" alt="PapaEgo" width={151} height={34} priority />
      </div>

      {/* Success Message */}
      <div className="flex flex-col items-center justify-center min-h-[60vh] px-4">
        <div className="text-center max-w-2xl">
          <div className="mb-6 flex justify-center">
            <CheckCircle className="w-24 h-24" style={{ color: "#27ae60" }} />
          </div>
          <h1 className="text-3xl font-bold mb-4" style={{ color: "#27ae60" }}>
            Onboarding Submitted
          </h1>
          <p className="text-base mb-2" style={{ color: "#6b7078" }}>
            Your onboarding details have been successfully submitted.
          </p>
          <p className="text-base mb-8" style={{ color: "#6b7078" }}>
            Our team will review your information and notify you once your
            account is approved.
          </p>
          <Link href="/agent/login">
            <Button
              className="h-12 px-8 text-base font-semibold"
              style={{
                backgroundColor: "#c9a227",
                color: "#ffffff",
              }}
            >
              Login to Continue
            </Button>
          </Link>
          <p className="text-sm mt-6" style={{ color: "#9aa0a6" }}>
            You will receive an email once your account is approved and activated.
          </p>
        </div>
      </div>
    </div>
  );
}

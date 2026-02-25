"use client";

import { use, useState } from "react";
import { useRouter } from "next/navigation";
import { OnboardingLayout } from "@/components/onboarding/OnboardingLayout";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { useOnboarding } from "@/components/onboarding/OnboardingContext";
import { onboardingApi } from "@/lib/api/onboarding";
import { useMutation } from "@tanstack/react-query";

export default function RoleRegionPage({
  params,
}: {
  params: Promise<{ token: string }>;
}) {
  const { token } = use(params);
  const router = useRouter();
  const { formData } = useOnboarding();
  const [confirmed, setConfirmed] = useState(false);
  const [submitError, setSubmitError] = useState("");

  // Mock data - would come from invitation
  const assignedRole = "Agent";
  const assignedRegion = "Nigeria";

  const submitMutation = useMutation({
    mutationFn: onboardingApi.completeOnboarding,
    onSuccess: () => {
      router.push("/onboarding/success");
    },
    onError: (error: any) => {
      setSubmitError(
        error.response?.data?.error || "Failed to submit onboarding. Please try again."
      );
    },
  });

  const handleSubmit = async () => {
    if (!confirmed) {
      alert("Please confirm the information is correct");
      return;
    }

    if (!formData.firstName || !formData.lastName || !formData.password) {
      alert("Please complete all previous steps");
      return;
    }

    setSubmitError("");

    // Upload documents first (if needed)
    let governmentIdUrl = formData.governmentIdUrl;
    let proofOfAddressUrl = formData.proofOfAddressUrl;

    if (formData.governmentIdFile) {
      const result = await onboardingApi.uploadDocument(formData.governmentIdFile, "governmentId");
      governmentIdUrl = result.url;
    }

    if (formData.proofOfAddressFile) {
      const result = await onboardingApi.uploadDocument(formData.proofOfAddressFile, "proofOfAddress");
      proofOfAddressUrl = result.url;
    }

    // Submit complete onboarding
    submitMutation.mutate({
      token,
      firstName: formData.firstName!,
      lastName: formData.lastName!,
      password: formData.password!,
      dateOfBirth: formData.dateOfBirth!,
      homeAddress: formData.homeAddress!,
      governmentIdUrl,
      proofOfAddressUrl,
    });
  };

  return (
    <OnboardingLayout
      currentStep={4}
      title="Welcome to PapaEgo"
      subtitle="Complete your onboarding to gain access to the PapaEgo platform. This process helps us meet compliance and operational requirements"
    >
      <div
        className="bg-white rounded-lg border p-8"
        style={{ borderColor: "#e1e3e6" }}
      >
        <div className="mb-8">
          <h2 className="text-2xl font-bold mb-2" style={{ color: "#2b2f33" }}>
            Your Assigned Role
          </h2>
          <p className="text-base" style={{ color: "#6b7078" }}>
            These details were assigned by a SuperAdmin and determine your
            access level
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <div
            className="p-6 rounded-lg border"
            style={{
              backgroundColor: "#fff6da",
              borderColor: "#c9a227",
            }}
          >
            <div className="flex items-center justify-between">
              <span
                className="text-base font-bold"
                style={{ color: "#2b2f33" }}
              >
                Role:
              </span>
              <span
                className="text-base font-bold"
                style={{ color: "#c9a227" }}
              >
                {assignedRole}
              </span>
            </div>
          </div>

          <div
            className="p-6 rounded-lg border"
            style={{
              backgroundColor: "#effaf4",
              borderColor: "#27ae60",
            }}
          >
            <div className="flex items-center justify-between">
              <span
                className="text-base font-bold"
                style={{ color: "#2b2f33" }}
              >
                Region
              </span>
              <span
                className="text-base font-bold"
                style={{ color: "#27ae60" }}
              >
                {assignedRegion}
              </span>
            </div>
          </div>
        </div>

        {submitError && (
          <div
            className="p-4 rounded-lg mb-6"
            style={{
              backgroundColor: "#ffeeee",
              color: "#e05555",
            }}
          >
            {submitError}
          </div>
        )}

        <div className="flex items-center gap-2 mb-8">
          <Checkbox
            id="confirm"
            checked={confirmed}
            onCheckedChange={(checked) => setConfirmed(checked as boolean)}
          />
          <label
            htmlFor="confirm"
            className="text-sm cursor-pointer"
            style={{ color: "#2b2f33" }}
          >
            I confirm that this information is correct
          </label>
        </div>

        <div className="flex justify-between">
          <Button
            type="button"
            variant="outline"
            onClick={() => router.back()}
            disabled={submitMutation.isPending}
            style={{
              borderColor: "#c9a227",
              color: "#c9a227",
            }}
          >
            Back
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={!confirmed || submitMutation.isPending}
            style={{
              backgroundColor: "#c9a227",
              color: "#ffffff",
            }}
          >
            {submitMutation.isPending ? "Submitting..." : "Submit for Review"}
          </Button>
        </div>
      </div>
    </OnboardingLayout>
  );
}

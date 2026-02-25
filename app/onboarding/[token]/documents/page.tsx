"use client";

import { use, useState } from "react";
import { useRouter } from "next/navigation";
import { OnboardingLayout } from "@/components/onboarding/OnboardingLayout";
import { Button } from "@/components/ui/button";
import Image from "next/image";
import { Upload } from "lucide-react";
import { useOnboarding } from "@/components/onboarding/OnboardingContext";

export default function DocumentsPage({
  params,
}: {
  params: Promise<{ token: string }>;
}) {
  const { token } = use(params);
  const router = useRouter();
  const { updateFormData } = useOnboarding();
  const [governmentId, setGovernmentId] = useState<File | null>(null);
  const [proofOfAddress, setProofOfAddress] = useState<File | null>(null);

  const handleFileChange = (
    e: React.ChangeEvent<HTMLInputElement>,
    type: "id" | "address"
  ) => {
    const file = e.target.files?.[0];
    if (file) {
      if (type === "id") {
        setGovernmentId(file);
      } else {
        setProofOfAddress(file);
      }
    }
  };

  const handleSubmit = async () => {
    if (!governmentId || !proofOfAddress) {
      alert("Please upload both documents");
      return;
    }

    // Save files to context and proceed
    updateFormData({
      governmentIdFile: governmentId,
      proofOfAddressFile: proofOfAddress,
    });

    router.push(`/onboarding/${token}/role-region`);
  };

  const FileUploadBox = ({
    label,
    file,
    onChange,
  }: {
    label: string;
    file: File | null;
    onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  }) => (
    <div>
      <h3 className="text-xl font-bold mb-2" style={{ color: "#2b2f33" }}>
        {label}
      </h3>
      <p className="text-base mb-4" style={{ color: "#6b7078" }}>
        {label.includes("Government")
          ? "(Passport, National ID, or Driver's License)"
          : "(Utility bill or bank statement - issued within last 3 months)"}
      </p>
      <label
        className="flex flex-col items-center justify-center p-8 rounded-xl border cursor-pointer hover:bg-gray-50 transition-colors"
        style={{
          backgroundColor: "#fafafa",
          borderColor: "#d9d9d9",
        }}
      >
        <input
          type="file"
          className="hidden"
          accept=".jpg,.jpeg,.png,.pdf"
          onChange={onChange}
        />
        <Upload className="w-10 h-10 mb-3" style={{ color: "#c9a227" }} />
        <div className="text-center">
          <p className="text-base font-semibold mb-1" style={{ color: "#2b2f33" }}>
            {file ? file.name : "Click to upload or drag and drop a file here"}
          </p>
          <p className="text-sm" style={{ color: "#9aa0a6" }}>
            JPG, PNG, or PDF · Max size 5MB
          </p>
        </div>
      </label>
    </div>
  );

  return (
    <OnboardingLayout
      currentStep={3}
      title="Welcome to PapaEgo"
      subtitle="Complete your onboarding to gain access to the PapaEgo platform. This process helps us meet compliance and operational requirements"
    >
      <div
        className="bg-white rounded-lg border p-8"
        style={{ borderColor: "#e1e3e6" }}
      >
        <div className="mb-8">
          <h2 className="text-2xl font-bold mb-2" style={{ color: "#2b2f33" }}>
            Identity Verification
          </h2>
          <p className="text-base" style={{ color: "#6b7078" }}>
            Upload valid documents to verify your identity. This is required
            before account activation
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <FileUploadBox
            label="Government-Issued ID"
            file={governmentId}
            onChange={(e) => handleFileChange(e, "id")}
          />
          <FileUploadBox
            label="Proof of Address"
            file={proofOfAddress}
            onChange={(e) => handleFileChange(e, "address")}
          />
        </div>

        <div
          className="flex items-start gap-3 p-4 rounded-lg mt-8"
          style={{
            backgroundColor: "#e3f2fd",
            border: "1px solid #90caf9",
          }}
        >
          <Image
            src="/assets/icons/info-icon.svg"
            alt=""
            width={14}
            height={14}
            style={{
              filter:
                "brightness(0) saturate(100%) invert(44%) sepia(99%) saturate(1791%) hue-rotate(189deg) brightness(98%) contrast(101%)",
            }}
          />
          <p className="text-sm" style={{ color: "rgba(0, 0, 0, 0.85)" }}>
            Your documents are securely stored and reviewed by the compliance
            team
          </p>
        </div>

        <div className="flex justify-between pt-8">
          <Button
            type="button"
            variant="outline"
            onClick={() => router.back()}
            style={{
              borderColor: "#c9a227",
              color: "#c9a227",
            }}
          >
            Back
          </Button>
          <Button
            onClick={handleSubmit}
            style={{
              backgroundColor: "#c9a227",
              color: "#ffffff",
            }}
          >
            Next
          </Button>
        </div>
      </div>
    </OnboardingLayout>
  );
}

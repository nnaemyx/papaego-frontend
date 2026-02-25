"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { AlertCircle, CheckCircle2, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { useMutation } from "@tanstack/react-query";
import { onboardingApi } from "@/lib/api/onboarding";

export default function OnboardingLandingPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [agentInfo, setAgentInfo] = useState<any>(null);
  const [error, setError] = useState("");

  const tokenFromUrl = searchParams.get("token");

  const verifyTokenMutation = useMutation({
    mutationFn: (tokenValue: string) => onboardingApi.verifyToken(tokenValue),
    onSuccess: (data) => {
      if (data.valid) {
        setAgentInfo(data.agent);
      }
    },
    onError: (err: any) => {
      setError(err.response?.data?.error || "Invalid or expired token");
    },
  });

  useEffect(() => {
    if (tokenFromUrl) {
      verifyTokenMutation.mutate(tokenFromUrl);
    } else {
      setError("No token provided. Please use the link from your invitation email.");
    }
  }, [tokenFromUrl]);

  const handleStartOnboarding = () => {
    router.push(`/onboarding/${tokenFromUrl}/account-setup`);
  };

  if (!tokenFromUrl) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4" style={{ backgroundColor: "#F7F8F9" }}>
        <Card className="w-full max-w-2xl">
          <CardHeader className="text-center">
            <h1 className="text-4xl font-bold mb-2" style={{ color: "#C9A227" }}>
              PapaEgo
            </h1>
            <CardTitle className="text-2xl font-bold" style={{ color: "#012333" }}>
              Missing Onboarding Token
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-start gap-3 p-4 rounded-lg" style={{ backgroundColor: "#FFF5F5", border: "1px solid #FED7D7" }}>
              <AlertCircle className="w-5 h-5 mt-0.5" style={{ color: "#E05555" }} />
              <div>
                <p className="font-medium" style={{ color: "#E05555" }}>
                  No Token Found
                </p>
                <p className="text-sm mt-1" style={{ color: "#C53030" }}>
                  Please use the onboarding link from your invitation email to access this page.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (verifyTokenMutation.isPending) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4" style={{ backgroundColor: "#F7F8F9" }}>
        <Card className="w-full max-w-2xl">
          <CardContent className="p-12">
            <div className="flex flex-col items-center gap-4">
              <Loader2 className="w-12 h-12 animate-spin" style={{ color: "#C9A227" }} />
              <p className="text-lg" style={{ color: "#383838" }}>
                Verifying your invitation...
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4" style={{ backgroundColor: "#F7F8F9" }}>
        <Card className="w-full max-w-2xl">
          <CardHeader className="text-center">
            <h1 className="text-4xl font-bold mb-2" style={{ color: "#C9A227" }}>
              PapaEgo
            </h1>
            <CardTitle className="text-2xl font-bold" style={{ color: "#012333" }}>
              Verification Failed
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-start gap-3 p-4 rounded-lg" style={{ backgroundColor: "#FFF5F5", border: "1px solid #FED7D7" }}>
              <AlertCircle className="w-5 h-5 mt-0.5" style={{ color: "#E05555" }} />
              <div>
                <p className="font-medium" style={{ color: "#E05555" }}>
                  Invalid or Expired Token
                </p>
                <p className="text-sm mt-1" style={{ color: "#C53030" }}>
                  {error}
                </p>
              </div>
            </div>
            <div className="mt-6 text-center">
              <p className="text-sm" style={{ color: "#6B7078" }}>
                Please contact your admin to receive a new invitation.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4" style={{ backgroundColor: "#F7F8F9" }}>
      <Card className="w-full max-w-2xl">
        <CardHeader className="text-center">
          <div className="mb-4">
            <h1 className="text-4xl font-bold mb-2" style={{ color: "#C9A227" }}>
              PapaEgo
            </h1>
          </div>
          <CardTitle className="text-2xl font-bold" style={{ color: "#012333" }}>
            Agent Onboarding
          </CardTitle>
          <CardDescription className="text-base" style={{ color: "#383838" }}>
            Complete your onboarding to gain access to the PapaEgo platform
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex items-start gap-3 p-4 rounded-lg" style={{ backgroundColor: "#F0FFF4", border: "1px solid #C6F6D5" }}>
            <CheckCircle2 className="w-5 h-5 mt-0.5" style={{ color: "#27AE60" }} />
            <div className="flex-1">
              <p className="font-medium" style={{ color: "#27AE60" }}>
                Invitation Verified Successfully
              </p>
              <p className="text-sm mt-1" style={{ color: "#22543D" }}>
                Your invitation has been verified. Click below to start your onboarding process.
              </p>
            </div>
          </div>

          <div className="space-y-4">
            <h3 className="font-semibold text-lg" style={{ color: "#012333" }}>
              Your Agent Information
            </h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label className="text-xs" style={{ color: "#6B7078" }}>
                  Email
                </Label>
                <p className="font-medium mt-1" style={{ color: "#012333" }}>
                  {agentInfo?.email || "N/A"}
                </p>
              </div>
              <div>
                <Label className="text-xs" style={{ color: "#6B7078" }}>
                  License ID
                </Label>
                <p className="font-medium mt-1" style={{ color: "#012333" }}>
                  {agentInfo?.licenseId || "N/A"}
                </p>
              </div>
              <div className="col-span-2">
                <Label className="text-xs" style={{ color: "#6B7078" }}>
                  Region
                </Label>
                <p className="font-medium mt-1" style={{ color: "#012333" }}>
                  {agentInfo?.region || "N/A"}
                </p>
              </div>
            </div>
          </div>

          <div className="pt-4">
            <Button
              onClick={handleStartOnboarding}
              className="w-full h-12 text-base font-semibold"
              style={{ backgroundColor: "#C9A227", color: "white" }}
            >
              Start Onboarding
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

"use client";

import { use, useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { OnboardingLayout } from "@/components/onboarding/OnboardingLayout";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Eye, EyeOff } from "lucide-react";
import Image from "next/image";
import { useOnboarding } from "@/components/onboarding/OnboardingContext";
import { onboardingApi } from "@/lib/api/onboarding";

interface AccountSetupData {
  email: string;
  password: string;
  confirmPassword: string;
}

export default function AccountSetupPage({
  params,
}: {
  params: Promise<{ token: string }>;
}) {
  const { token } = use(params);
  const router = useRouter();
  const { updateFormData } = useOnboarding();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [agentEmail, setAgentEmail] = useState("");

  // Fetch agent email from token
  useEffect(() => {
    const fetchAgentInfo = async () => {
      try {
        const data = await onboardingApi.verifyToken(token);
        if (data.valid && data.agent?.email) {
          setAgentEmail(data.agent.email);
          form.setValue("email", data.agent.email);
        }
      } catch (error) {
        console.error("Error fetching agent info:", error);
      }
    };
    fetchAgentInfo();
  }, [token]);

  const form = useForm<AccountSetupData>({
    defaultValues: {
      email: "",
      password: "",
      confirmPassword: "",
    },
  });

  const onSubmit = async (data: AccountSetupData) => {
    if (data.password !== data.confirmPassword) {
      form.setError("confirmPassword", {
        message: "Passwords do not match",
      });
      return;
    }

    // Save to context and proceed
    updateFormData({
      password: data.password,
      confirmPassword: data.confirmPassword,
      token,
    });

    router.push(`/onboarding/${token}/personal-details`);
  };

  return (
    <OnboardingLayout
      currentStep={1}
      title="Welcome to PapaEgo"
      subtitle="Complete your onboarding to gain access to the PapaEgo platform. This process helps us meet compliance and operational requirements"
    >
      <div
        className="bg-white rounded-lg border p-8"
        style={{ borderColor: "#e1e3e6" }}
      >
        <div className="mb-8">
          <h2 className="text-2xl font-bold mb-2" style={{ color: "#2b2f33" }}>
            Set Up Your Account
          </h2>
          <p className="text-base" style={{ color: "#6b7078" }}>
            Create your login credentials to get started
          </p>
        </div>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel
                    className="text-xs font-normal"
                    style={{ color: "#c4c7cc" }}
                  >
                    Work Email
                  </FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      disabled
                      className="h-12 border"
                      style={{
                        borderColor: "#ccd1d7",
                        color: "#c4c7cc",
                      }}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <FormField
                control={form.control}
                name="password"
                rules={{
                  required: "Password is required",
                  minLength: {
                    value: 8,
                    message: "Password must be at least 8 characters",
                  },
                }}
                render={({ field }) => (
                  <FormItem>
                    <FormControl>
                      <div className="relative">
                        <Input
                          {...field}
                          type={showPassword ? "text" : "password"}
                          placeholder="Create Password"
                          className="h-12 pr-10"
                          style={{
                            borderColor: "#ccd1d7",
                            color: "#9aa0a6",
                          }}
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="absolute right-3 top-1/2 -translate-y-1/2"
                        >
                          {showPassword ? (
                            <EyeOff className="w-5 h-5" style={{ color: "#9aa0a6" }} />
                          ) : (
                            <Eye className="w-5 h-5" style={{ color: "#9aa0a6" }} />
                          )}
                        </button>
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="confirmPassword"
                rules={{
                  required: "Please confirm your password",
                }}
                render={({ field }) => (
                  <FormItem>
                    <FormControl>
                      <div className="relative">
                        <Input
                          {...field}
                          type={showConfirmPassword ? "text" : "password"}
                          placeholder="Confirm Password"
                          className="h-12 pr-10"
                          style={{
                            borderColor: "#ccd1d7",
                            color: "#9aa0a6",
                          }}
                        />
                        <button
                          type="button"
                          onClick={() =>
                            setShowConfirmPassword(!showConfirmPassword)
                          }
                          className="absolute right-3 top-1/2 -translate-y-1/2"
                        >
                          {showConfirmPassword ? (
                            <EyeOff className="w-5 h-5" style={{ color: "#9aa0a6" }} />
                          ) : (
                            <Eye className="w-5 h-5" style={{ color: "#9aa0a6" }} />
                          )}
                        </button>
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div
              className="flex items-start gap-3 p-3 rounded-lg"
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
                Use at least 8 characters with a mix of letters, numbers, and
                symbols
              </p>
            </div>

            <div className="flex justify-end">
              <Button
                type="submit"
                className="px-8 h-12"
                style={{
                  backgroundColor: "#c9a227",
                  color: "#ffffff",
                }}
              >
                Next
              </Button>
            </div>
          </form>
        </Form>
      </div>
    </OnboardingLayout>
  );
}

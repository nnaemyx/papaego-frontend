"use client";

import { use } from "react";
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
import { useOnboarding } from "@/components/onboarding/OnboardingContext";

interface PersonalDetailsData {
  firstName: string;
  lastName: string;
  homeAddress: string;
  phoneNumber: string;
  dateOfBirth: string;
}

export default function PersonalDetailsPage({
  params,
}: {
  params: Promise<{ token: string }>;
}) {
  const { token } = use(params);
  const router = useRouter();
  const { updateFormData } = useOnboarding();

  const form = useForm<PersonalDetailsData>({
    defaultValues: {
      firstName: "",
      lastName: "",
      homeAddress: "",
      phoneNumber: "",
      dateOfBirth: "",
    },
  });

  const onSubmit = async (data: PersonalDetailsData) => {
    // Save to context and proceed
    updateFormData({
      firstName: data.firstName,
      lastName: data.lastName,
      homeAddress: data.homeAddress,
      phoneNumber: data.phoneNumber,
      dateOfBirth: data.dateOfBirth,
    });

    router.push(`/onboarding/${token}/documents`);
  };

  return (
    <OnboardingLayout
      currentStep={2}
      title="Welcome to PapaEgo"
      subtitle="Complete your onboarding to gain access to the PapaEgo platform. This process helps us meet compliance and operational requirements"
    >
      <div
        className="bg-white rounded-lg border p-8"
        style={{ borderColor: "#e1e3e6" }}
      >
        <div className="mb-8">
          <h2 className="text-2xl font-bold mb-2" style={{ color: "#2b2f33" }}>
            Personal Information
          </h2>
          <p className="text-base" style={{ color: "#6b7078" }}>
            Tell us a bit about yourself. This information is used for
            identification and internal records
          </p>
        </div>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <FormField
                control={form.control}
                name="firstName"
                rules={{ required: "First name is required" }}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel style={{ color: "#9aa0a6" }}>
                      First Name
                    </FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        className="h-12"
                        style={{ borderColor: "#ccd1d7" }}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="lastName"
                rules={{ required: "Last name is required" }}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel style={{ color: "#9aa0a6" }}>
                      Last Name
                    </FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        className="h-12"
                        style={{ borderColor: "#ccd1d7" }}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="homeAddress"
              rules={{ required: "Home address is required" }}
              render={({ field }) => (
                <FormItem>
                  <FormLabel style={{ color: "#9aa0a6" }}>
                    Home Address
                  </FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      className="h-12"
                      style={{ borderColor: "#ccd1d7" }}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <FormField
                control={form.control}
                name="phoneNumber"
                rules={{ required: "Phone number is required" }}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel style={{ color: "#9aa0a6" }}>
                      Phone Number
                    </FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        className="h-12"
                        style={{ borderColor: "#ccd1d7" }}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="dateOfBirth"
                rules={{ required: "Date of birth is required" }}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel style={{ color: "#9aa0a6" }}>
                      Date of Birth
                    </FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        type="date"
                        className="h-12"
                        style={{ borderColor: "#ccd1d7" }}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="flex justify-between pt-4">
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
                type="submit"
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

"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetFooter,
} from "@/components/ui/sheet";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { XIcon, Info } from "lucide-react";
import { useMutation } from "@tanstack/react-query";
import { agentsApi } from "@/lib/api/agents";
import type { InviteAgentFormData } from "@/lib/types/agent";

interface InviteAgentSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: (email: string) => void;
}

export function InviteAgentSheet({
  open,
  onOpenChange,
  onSuccess,
}: InviteAgentSheetProps) {
  const form = useForm<InviteAgentFormData>();
  const [error, setError] = useState("");

  const inviteMutation = useMutation({
    mutationFn: agentsApi.inviteAgent,
    onSuccess: (data, variables) => {
      form.reset();
      onOpenChange(false);
      onSuccess(variables.email);
    },
    onError: (err: any) => {
      setError(err.response?.data?.error || "Failed to send invitation");
    },
  });

  const onSubmit = (data: InviteAgentFormData) => {
    setError("");
    inviteMutation.mutate(data);
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        side="right"
        className="w-full sm:max-w-[500px] overflow-y-auto"
        style={{ borderTopLeftRadius: "40px", borderBottomLeftRadius: "40px" }}
      >
        <SheetHeader className="mb-6">
          <div className="flex items-start justify-between">
            <div>
              <SheetTitle className="text-3xl font-bold mb-2">
                Invite New Agent
              </SheetTitle>
              <p className="text-base text-gray-600">
                Send an invitation for a new agent to join the platform and
                complete onboarding
              </p>
            </div>
          </div>
        </SheetHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            {error && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-md text-red-600 text-sm">
                {error}
              </div>
            )}

            <FormField
              control={form.control}
              name="firstName"
              rules={{ required: "First name is required" }}
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-gray-500">First Name</FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      className="border-gray-300"
                      placeholder="Enter first name"
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
                  <FormLabel className="text-gray-500">Last Name</FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      className="border-gray-300"
                      placeholder="Enter last name"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="email"
              rules={{
                required: "Email is required",
                pattern: {
                  value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                  message: "Invalid email address",
                },
              }}
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-gray-500">Work Email</FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      type="email"
                      className="border-gray-300"
                      placeholder="Enter work email"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="role"
              rules={{ required: "Role is required" }}
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-gray-500">Select Role</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger className="border-gray-300">
                        <SelectValue placeholder="Select role" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="Agent">Agent</SelectItem>
                      <SelectItem value="Senior Agent">Senior Agent</SelectItem>
                      <SelectItem value="Supervisor">Supervisor</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="region"
              rules={{ required: "Region is required" }}
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-gray-500">Select Region</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger className="border-gray-300">
                        <SelectValue placeholder="Select region" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="Nigeria">Nigeria</SelectItem>
                      <SelectItem value="Ghana">Ghana</SelectItem>
                      <SelectItem value="Kenya">Kenya</SelectItem>
                      <SelectItem value="UK">UK</SelectItem>
                      <SelectItem value="USA">USA</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="notes"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-gray-500">
                    Notes (optional)
                  </FormLabel>
                  <FormControl>
                    <Textarea
                      {...field}
                      className="border-gray-300 min-h-[100px]"
                      placeholder="Add any additional notes"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="flex items-start gap-2 p-3 bg-blue-50 border border-blue-200 rounded-md">
              <Info className="h-4 w-4 text-blue-600 mt-0.5 flex-shrink-0" />
              <p className="text-sm text-gray-800">
                The agent will receive an email to complete onboarding and
                verification
              </p>
            </div>

            <SheetFooter>
              <Button
                type="submit"
                className="w-full h-12"
                style={{
                  backgroundColor: "var(--brand-primary)",
                  color: "white",
                }}
                disabled={inviteMutation.isPending}
              >
                {inviteMutation.isPending ? "Sending..." : "Send Invite"}
              </Button>
            </SheetFooter>
          </form>
        </Form>
      </SheetContent>
    </Sheet>
  );
}

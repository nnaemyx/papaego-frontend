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
import { NIGERIAN_MARKETS } from "@/lib/constants/nigerian-markets";

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
  const form = useForm<InviteAgentFormData & { state: string; market: string }>();
  const [error, setError] = useState("");
  const selectedState = form.watch("state");

  const [availableMarkets, setAvailableMarkets] = useState<string[]>([]);

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

  const onSubmit = (data: InviteAgentFormData & { state: string; market: string }) => {
    setError("");
    const formattedData: InviteAgentFormData = {
      firstName: data.firstName,
      lastName: data.lastName,
      email: data.email,
      role: data.role,
      region: `${data.state} - ${data.market}`,
      notes: data.notes,
    };
    inviteMutation.mutate(formattedData);
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
                      <SelectItem value="Field Agent">Field Agent</SelectItem>
                      <SelectItem value="Corporate Agent">Corporate Agent</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="state"
              rules={{ required: "State is required" }}
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-gray-500">Select State</FormLabel>
                  <Select 
                    onValueChange={(val) => {
                        field.onChange(val);
                        const stateObj = NIGERIAN_MARKETS.find(m => m.state === val);
                        setAvailableMarkets(stateObj ? stateObj.markets : []);
                        form.setValue("market", "");
                    }} 
                    value={field.value}
                  >
                    <FormControl>
                      <SelectTrigger className="border-gray-300">
                        <SelectValue placeholder="Select state in Nigeria" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {NIGERIAN_MARKETS.map((m) => (
                          <SelectItem key={m.state} value={m.state}>{m.state}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="market"
              rules={{ required: "Market is required" }}
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-gray-500">Select Market</FormLabel>
                  <Select 
                    onValueChange={field.onChange} 
                    value={field.value}
                    disabled={!selectedState}
                  >
                    <FormControl>
                      <SelectTrigger className="border-gray-300">
                        <SelectValue placeholder={selectedState ? "Select market" : "Select state first"} />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {availableMarkets.map((market) => (
                          <SelectItem key={market} value={market}>{market}</SelectItem>
                      ))}
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

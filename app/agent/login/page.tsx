"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormMessage,
} from "@/components/ui/form";
import { Eye, EyeOff } from "lucide-react";
import { authApi, LoginCredentials } from "@/lib/api/auth";
import { useMutation } from "@tanstack/react-query";

export default function AgentLoginPage() {
  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");

  const form = useForm<LoginCredentials>({
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const loginMutation = useMutation({
    mutationFn: authApi.login,
    onSuccess: (data) => {
      if (data.user.role !== "AGENT") {
        setError("Invalid credentials");
        authApi.logout();
        return;
      }
      router.push("/agent/dashboard");
    },
    onError: (err: any) => {
      setError(err.response?.data?.error || "Login failed. Please try again.");
    },
  });

  const onSubmit = (data: LoginCredentials) => {
    setError("");
    loginMutation.mutate(data);
  };

  return (
    <div className="min-h-screen flex flex-col" style={{ backgroundColor: "#ffffff" }}>
      {/* Logo */}
      <div className="px-4 md:px-20 py-10">
        <Image src="/logo.png" alt="PapaEgo" width={151} height={34} priority />
      </div>

      {/* Login Form */}
      <div className="flex-1 flex items-center justify-center px-4">
        <div className="w-full max-w-[500px]">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold mb-2" style={{ color: "#2b2f33" }}>
              Welcome Back!
            </h1>
            <p className="text-base" style={{ color: "#6b7078" }}>
              Sign in to access the PapaEgo platform
            </p>
          </div>

          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              {error && (
                <div
                  className="p-3 rounded-lg text-sm text-center"
                  style={{
                    backgroundColor: "#ffeeee",
                    color: "#e05555",
                  }}
                >
                  {error}
                </div>
              )}

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
                    <FormControl>
                      <Input
                        {...field}
                        type="email"
                        placeholder="Work Email Address"
                        className="h-12"
                        style={{
                          borderColor: "#ccd1d7",
                          color: "#9aa0a6",
                        }}
                        disabled={loginMutation.isPending}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="password"
                rules={{
                  required: "Password is required",
                }}
                render={({ field }) => (
                  <FormItem>
                    <FormControl>
                      <div className="relative">
                        <Input
                          {...field}
                          type={showPassword ? "text" : "password"}
                          placeholder="Password"
                          className="h-12 pr-10"
                          style={{
                            borderColor: "#ccd1d7",
                            color: "#9aa0a6",
                          }}
                          disabled={loginMutation.isPending}
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

              <div className="flex items-center gap-2">
                <Checkbox id="remember" />
                <label
                  htmlFor="remember"
                  className="text-sm cursor-pointer"
                  style={{ color: "#2b2f33" }}
                >
                  Keep me Signed In
                </label>
              </div>

              <Button
                type="submit"
                className="w-full h-12"
                style={{
                  backgroundColor: "#c9a227",
                  color: "#ffffff",
                }}
                disabled={loginMutation.isPending}
              >
                {loginMutation.isPending ? "Signing In..." : "Sign In"}
              </Button>

              <div className="text-center">
                <button
                  type="button"
                  className="text-base font-medium hover:underline"
                  style={{ color: "#e05555" }}
                >
                  Forgot Password?
                </button>
              </div>
            </form>
          </Form>
        </div>
      </div>
    </div>
  );
}

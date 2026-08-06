"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { Eye, EyeOff, Loader2, AlertCircle, Building2, ArrowRight } from "lucide-react";
import { toast } from "sonner";
import { useAuthStore } from "@/store/auth-store";
import { authApi } from "@/lib/api/auth";

const schema = z.object({
    email: z.string().email("Enter a valid email address"),
    password: z.string().min(1, "Password is required"),
});

type FormData = z.infer<typeof schema>;

export default function BusinessSignInPage() {
    const router = useRouter();
    const { login } = useAuthStore();
    const [showPw, setShowPw] = useState(false);
    const [isLoading, setIsLoading] = useState(false);

    const { register, handleSubmit, formState: { errors } } = useForm<FormData>({
        resolver: zodResolver(schema),
    });

    const onSubmit = async (data: FormData) => {
        setIsLoading(true);
        try {
            const res = await authApi.login({ email: data.email, password: data.password });
            const user = res.user;

            if (!["ORG_OWNER", "ORG_ADMIN"].includes(user.role)) {
                toast.error("This login is for business accounts only.", {
                    description: "Please use the correct portal for your account type."
                });
                return;
            }

            login(user, res.token);
            toast.success(`Welcome back, ${user.firstName || user.email}!`);
            router.push("/customer/dashboard");
        } catch (err: any) {
            const msg = err?.response?.data?.error || "Invalid email or password";
            toast.error(msg);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex flex-col items-center justify-center p-4" style={{ backgroundColor: "#F7F8F9" }}>
            {/* Logo Header */}
            <div className="mb-8 text-center flex flex-col items-center">
                <Link href="/">
                    <Image
                        src="/images/logo.png"
                        alt="PapaEgo"
                        width={180}
                        height={40}
                        className="h-10 w-auto mb-2"
                        priority
                    />
                </Link>
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold"
                    style={{ backgroundColor: "#FFF7E6", color: "#C9A227", border: "1px solid #F0CD00" }}>
                    <Building2 className="w-3.5 h-3.5" />
                    Business Portal
                </div>
            </div>

            {/* Card */}
            <div className="w-full max-w-md bg-white rounded-2xl shadow-sm border p-8" style={{ borderColor: "#E1E3E6" }}>
                <h2 className="text-2xl font-bold text-center mb-1" style={{ color: "#012333" }}>
                    Business Sign In
                </h2>
                <p className="text-sm text-center mb-8" style={{ color: "#6B7078" }}>
                    Sign in to access your business account & compliance portal
                </p>

                <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
                    <div>
                        <label className="block text-xs font-semibold uppercase tracking-wider mb-2" style={{ color: "#6B7078" }}>
                            Business Email
                        </label>
                        <div className="border rounded-xl px-4 py-3 bg-white transition-all focus-within:border-[#C9A227] focus-within:ring-1 focus-within:ring-[#C9A227]/30"
                            style={{ borderColor: "#E1E3E6" }}>
                            <input
                                {...register("email")}
                                type="email"
                                autoComplete="email"
                                placeholder="you@company.com"
                                className="w-full text-sm bg-transparent outline-none"
                                style={{ color: "#012333" }}
                            />
                        </div>
                        {errors.email && <FieldError msg={errors.email.message!} />}
                    </div>

                    <div>
                        <label className="block text-xs font-semibold uppercase tracking-wider mb-2" style={{ color: "#6B7078" }}>
                            Password
                        </label>
                        <div className="border rounded-xl px-4 py-3 flex items-center gap-2 bg-white transition-all focus-within:border-[#C9A227] focus-within:ring-1 focus-within:ring-[#C9A227]/30"
                            style={{ borderColor: "#E1E3E6" }}>
                            <input
                                {...register("password")}
                                type={showPw ? "text" : "password"}
                                autoComplete="current-password"
                                placeholder="••••••••"
                                className="flex-1 text-sm bg-transparent outline-none"
                                style={{ color: "#012333" }}
                            />
                            <button type="button" onClick={() => setShowPw(p => !p)} className="text-gray-400 hover:text-gray-600">
                                {showPw ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                            </button>
                        </div>
                        {errors.password && <FieldError msg={errors.password.message!} />}
                        <div className="mt-2 text-right">
                            <Link href="/customer-auth/forgot-password" className="text-xs font-medium hover:underline" style={{ color: "#C9A227" }}>
                                Forgot password?
                            </Link>
                        </div>
                    </div>

                    <button
                        type="submit"
                        disabled={isLoading}
                        className="w-full h-12 rounded-xl font-semibold text-white flex items-center justify-center gap-2 transition-all hover:opacity-95 disabled:opacity-60 shadow-sm"
                        style={{ backgroundColor: "#C9A227" }}
                    >
                        {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <ArrowRight className="w-4 h-4" />}
                        {isLoading ? "Signing in..." : "Sign In to Business Account"}
                    </button>
                </form>

                <p className="text-center text-sm mt-8" style={{ color: "#6B7078" }}>
                    Don&apos;t have a business account?{" "}
                    <Link href="/business/auth/signup" className="font-semibold hover:underline" style={{ color: "#C9A227" }}>
                        Register your business
                    </Link>
                </p>
            </div>
        </div>
    );
}

function FieldError({ msg }: { msg: string }) {
    return (
        <div className="flex items-center gap-1.5 mt-1.5">
            <AlertCircle className="w-3.5 h-3.5 text-red-500 shrink-0" />
            <p className="text-xs text-red-500">{msg}</p>
        </div>
    );
}

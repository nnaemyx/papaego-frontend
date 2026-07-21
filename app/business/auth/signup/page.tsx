"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { Eye, EyeOff, Loader2, AlertCircle, ArrowRight, Shield, RefreshCw, CheckCircle2, Building2 } from "lucide-react";
import { toast } from "sonner";
import { useAuthStore } from "@/store/auth-store";
import { authApi } from "@/lib/api/auth";

// ─── Schemas ──────────────────────────────────────────
const signupSchema = z.object({
    firstName: z.string().min(2, "First name required"),
    lastName: z.string().min(2, "Last name required"),
    email: z.string().email("Valid email required"),
    phone: z.string().min(7, "Phone number required"),
    password: z.string()
        .min(8, "At least 8 characters")
        .regex(/[A-Z]/, "One uppercase letter required")
        .regex(/[a-z]/, "One lowercase letter required")
        .regex(/[0-9]/, "One number required")
        .regex(/[^A-Za-z0-9]/, "One special character required"),
    confirmPassword: z.string(),
}).refine(d => d.password === d.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"]
});

const otpSchema = z.object({
    otp: z.string().length(6, "Enter the 6-digit code")
});

type SignupData = z.infer<typeof signupSchema>;
type OtpData = z.infer<typeof otpSchema>;

type Step = "register" | "verify";

export default function BusinessSignUpPage() {
    const router = useRouter();
    const { login } = useAuthStore();
    const [step, setStep] = useState<Step>("register");
    const [savedEmail, setSavedEmail] = useState("");
    const [showPw, setShowPw] = useState(false);
    const [showConfirmPw, setShowConfirmPw] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [isResending, setIsResending] = useState(false);
    const [registeredUser, setRegisteredUser] = useState<{ user: any; token: string } | null>(null);

    // Register form
    const { register, handleSubmit, formState: { errors } } = useForm<SignupData>({
        resolver: zodResolver(signupSchema),
    });

    // OTP form
    const otpForm = useForm<OtpData>({
        resolver: zodResolver(otpSchema),
    });

    // ── Step 1: Register ──────────────────────────
    const handleRegister = async (data: SignupData) => {
        setIsLoading(true);
        try {
            const res = await authApi.signup({
                email: data.email,
                password: data.password,
                phone: data.phone,
                firstName: data.firstName,
                lastName: data.lastName,
                role: "ORG_OWNER"
            });
            setRegisteredUser(res);
            setSavedEmail(data.email);

            const devOtp = (res as any).devOtp;
            if (devOtp) {
                toast.success(`Account created! Test OTP: ${devOtp}`, { duration: 15000 });
                otpForm.setValue("otp", devOtp);
            } else {
                toast.success("Account created! Check your email for a verification code.");
            }
            setStep("verify");
        } catch (err: any) {
            const msg = err?.response?.data?.error || "Registration failed. Please try again.";
            toast.error(msg);
        } finally {
            setIsLoading(false);
        }
    };

    // ── Step 2: Verify OTP ────────────────────────
    const handleVerify = async (data: OtpData) => {
        setIsLoading(true);
        try {
            await authApi.verifyEmail(savedEmail, data.otp);
            if (registeredUser) {
                login(registeredUser.user, registeredUser.token);
            }
            toast.success("Email verified! Let's set up your organization.");
            router.push("/business/onboarding");
        } catch (err: any) {
            const msg = err?.response?.data?.error || "Invalid code. Please try again.";
            toast.error(msg);
        } finally {
            setIsLoading(false);
        }
    };

    const handleResendOtp = async () => {
        setIsResending(true);
        try {
            const res = await authApi.resendOtp(savedEmail);
            const devOtp = (res as any).devOtp;
            if (devOtp) {
                toast.success(`New verification code: ${devOtp}`, { duration: 15000 });
                otpForm.setValue("otp", devOtp);
            } else {
                toast.success("New verification code sent!");
            }
        } catch (err: any) {
            toast.error(err?.response?.data?.error || "Could not resend code.");
        } finally {
            setIsResending(false);
        }
    };

    return (
        <div className="min-h-screen flex flex-col items-center justify-center p-4 py-12" style={{ backgroundColor: "#F7F8F9" }}>
            {/* Header Logo */}
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
                    Business Registration
                </div>
            </div>

            {/* Card */}
            <div className="w-full max-w-[480px] bg-white rounded-2xl shadow-sm border p-8" style={{ borderColor: "#E1E3E6" }}>
                {step === "register" ? (
                    <>
                        <div className="mb-7 text-center">
                            <h1 className="text-2xl font-bold mb-1" style={{ color: "#012333" }}>Register Your Business</h1>
                            <p className="text-sm" style={{ color: "#6B7078" }}>Create your account to start business onboarding</p>
                        </div>

                        <form onSubmit={handleSubmit(handleRegister)} className="space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-xs font-semibold uppercase tracking-wider mb-1.5" style={{ color: "#6B7078" }}>First Name *</label>
                                    <div className="border rounded-xl px-4 py-2.5 bg-white transition-all focus-within:border-[#C9A227] focus-within:ring-1 focus-within:ring-[#C9A227]/30" style={{ borderColor: "#E1E3E6" }}>
                                        <input {...register("firstName")} className="w-full text-sm bg-transparent outline-none" style={{ color: "#012333" }} placeholder="John" />
                                    </div>
                                    {errors.firstName && <FieldError msg={errors.firstName.message!} />}
                                </div>
                                <div>
                                    <label className="block text-xs font-semibold uppercase tracking-wider mb-1.5" style={{ color: "#6B7078" }}>Last Name *</label>
                                    <div className="border rounded-xl px-4 py-2.5 bg-white transition-all focus-within:border-[#C9A227] focus-within:ring-1 focus-within:ring-[#C9A227]/30" style={{ borderColor: "#E1E3E6" }}>
                                        <input {...register("lastName")} className="w-full text-sm bg-transparent outline-none" style={{ color: "#012333" }} placeholder="Doe" />
                                    </div>
                                    {errors.lastName && <FieldError msg={errors.lastName.message!} />}
                                </div>
                            </div>

                            <div>
                                <label className="block text-xs font-semibold uppercase tracking-wider mb-1.5" style={{ color: "#6B7078" }}>Work Email *</label>
                                <div className="border rounded-xl px-4 py-2.5 bg-white transition-all focus-within:border-[#C9A227] focus-within:ring-1 focus-within:ring-[#C9A227]/30" style={{ borderColor: "#E1E3E6" }}>
                                    <input {...register("email")} type="email" className="w-full text-sm bg-transparent outline-none" style={{ color: "#012333" }} placeholder="you@company.com" />
                                </div>
                                {errors.email && <FieldError msg={errors.email.message!} />}
                            </div>

                            <div>
                                <label className="block text-xs font-semibold uppercase tracking-wider mb-1.5" style={{ color: "#6B7078" }}>Phone Number *</label>
                                <div className="border rounded-xl px-4 py-2.5 bg-white transition-all focus-within:border-[#C9A227] focus-within:ring-1 focus-within:ring-[#C9A227]/30" style={{ borderColor: "#E1E3E6" }}>
                                    <input {...register("phone")} className="w-full text-sm bg-transparent outline-none" style={{ color: "#012333" }} placeholder="+234 800 000 0000" />
                                </div>
                                {errors.phone && <FieldError msg={errors.phone.message!} />}
                            </div>

                            <div>
                                <label className="block text-xs font-semibold uppercase tracking-wider mb-1.5" style={{ color: "#6B7078" }}>Password *</label>
                                <div className="border rounded-xl px-4 py-2.5 flex items-center gap-2 bg-white transition-all focus-within:border-[#C9A227] focus-within:ring-1 focus-within:ring-[#C9A227]/30" style={{ borderColor: "#E1E3E6" }}>
                                    <input {...register("password")} type={showPw ? "text" : "password"} className="flex-1 text-sm bg-transparent outline-none" style={{ color: "#012333" }} placeholder="Min. 8 characters" />
                                    <button type="button" onClick={() => setShowPw(p => !p)} className="text-gray-400 hover:text-gray-600">
                                        {showPw ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                                    </button>
                                </div>
                                {errors.password && <FieldError msg={errors.password.message!} />}
                            </div>

                            <div>
                                <label className="block text-xs font-semibold uppercase tracking-wider mb-1.5" style={{ color: "#6B7078" }}>Confirm Password *</label>
                                <div className="border rounded-xl px-4 py-2.5 flex items-center gap-2 bg-white transition-all focus-within:border-[#C9A227] focus-within:ring-1 focus-within:ring-[#C9A227]/30" style={{ borderColor: "#E1E3E6" }}>
                                    <input {...register("confirmPassword")} type={showConfirmPw ? "text" : "password"} className="flex-1 text-sm bg-transparent outline-none" style={{ color: "#012333" }} placeholder="Repeat password" />
                                    <button type="button" onClick={() => setShowConfirmPw(p => !p)} className="text-gray-400 hover:text-gray-600">
                                        {showConfirmPw ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                                    </button>
                                </div>
                                {errors.confirmPassword && <FieldError msg={errors.confirmPassword.message!} />}
                            </div>

                            {/* Password strength hint */}
                            <div className="flex items-center gap-2 text-xs p-3 rounded-xl" style={{ backgroundColor: "#FFF7E6", color: "#856404", border: "1px solid #FFEBAA" }}>
                                <Shield className="w-4 h-4 shrink-0 text-[#C9A227]" />
                                <span>Password must contain uppercase, lowercase, a number & special character</span>
                            </div>

                            <button type="submit" disabled={isLoading}
                                className="w-full h-12 rounded-xl font-semibold text-white flex items-center justify-center gap-2 transition-all hover:opacity-95 disabled:opacity-60 shadow-sm mt-2"
                                style={{ backgroundColor: "#C9A227" }}>
                                {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <ArrowRight className="w-4 h-4" />}
                                {isLoading ? "Creating account..." : "Continue Registration"}
                            </button>
                        </form>

                        <p className="text-center text-sm mt-6" style={{ color: "#6B7078" }}>
                            Already have a business account?{" "}
                            <Link href="/business/auth/signin" className="font-semibold hover:underline" style={{ color: "#C9A227" }}>
                                Sign in
                            </Link>
                        </p>
                    </>
                ) : (
                    <>
                        {/* OTP Verification Step */}
                        <div className="flex flex-col items-center text-center mb-7">
                            <div className="w-14 h-14 rounded-2xl flex items-center justify-center mb-4"
                                style={{ backgroundColor: "#FFF7E6", border: "1px solid #F0CD00" }}>
                                <CheckCircle2 className="w-7 h-7 text-[#C9A227]" />
                            </div>
                            <h2 className="text-xl font-bold mb-1" style={{ color: "#012333" }}>Verify Your Email</h2>
                            <p className="text-sm max-w-xs" style={{ color: "#6B7078" }}>
                                Enter the 6-digit verification code sent to{" "}
                                <span className="font-semibold" style={{ color: "#C9A227" }}>{savedEmail}</span>
                            </p>
                        </div>

                        <form onSubmit={otpForm.handleSubmit(handleVerify)} className="space-y-5">
                            <div>
                                <label className="block text-xs font-semibold uppercase tracking-wider mb-2 text-center" style={{ color: "#6B7078" }}>
                                    Verification Code
                                </label>
                                <div className="border rounded-xl px-4 py-3 bg-white focus-within:border-[#C9A227] focus-within:ring-1 focus-within:ring-[#C9A227]/30" style={{ borderColor: "#E1E3E6" }}>
                                    <input
                                        {...otpForm.register("otp")}
                                        className="w-full text-center text-2xl font-bold tracking-[0.4em] bg-transparent outline-none"
                                        style={{ color: "#012333" }}
                                        placeholder="• • • • • •"
                                        maxLength={6}
                                        inputMode="numeric"
                                    />
                                </div>
                                {otpForm.formState.errors.otp && (
                                    <FieldError msg={otpForm.formState.errors.otp.message!} />
                                )}
                            </div>

                            <button type="submit" disabled={isLoading}
                                className="w-full h-12 rounded-xl font-semibold text-white flex items-center justify-center gap-2 transition-all hover:opacity-95 disabled:opacity-60 shadow-sm"
                                style={{ backgroundColor: "#C9A227" }}>
                                {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle2 className="w-4 h-4" />}
                                {isLoading ? "Verifying..." : "Verify & Continue"}
                            </button>

                            <div className="flex items-center justify-center gap-2 text-sm" style={{ color: "#6B7078" }}>
                                <span>Didn&apos;t receive the code?</span>
                                <button type="button" onClick={handleResendOtp} disabled={isResending}
                                    className="flex items-center gap-1 font-semibold hover:underline disabled:opacity-50"
                                    style={{ color: "#C9A227" }}>
                                    {isResending && <RefreshCw className="w-3 h-3 animate-spin" />}
                                    Resend Code
                                </button>
                            </div>
                        </form>

                        <button onClick={() => setStep("register")}
                            className="w-full mt-4 text-xs font-medium text-center transition-colors hover:underline"
                            style={{ color: "#6B7078" }}>
                            ← Back to registration
                        </button>
                    </>
                )}
            </div>

            {/* Footer */}
            <p className="text-center text-xs mt-6" style={{ color: "#6B7078" }}>
                By creating an account, you agree to PapaEgo&apos;s{" "}
                <Link href="/legal/terms" className="underline font-medium" style={{ color: "#C9A227" }}>Terms</Link>
                {" & "}
                <Link href="/legal/privacy" className="underline font-medium" style={{ color: "#C9A227" }}>Privacy Policy</Link>
            </p>
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

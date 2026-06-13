"use client";

import { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Eye, EyeOff, Lock, CheckCircle, ArrowLeft, AlertCircle } from "lucide-react";
import { authApi } from "@/lib/api/auth";
import Link from "next/link";

function ResetPasswordPageInner() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get("token") || "";

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  // Password strength checks (mirroring signup page)
  const hasMinLength = password.length >= 8;
  const hasUppercase = /[A-Z]/.test(password);
  const hasLowercase = /[a-z]/.test(password);
  const hasNumber = /[0-9]/.test(password);
  const hasSpecial = /[^A-Za-z0-9]/.test(password);

  const passwordStrength = [
    hasMinLength,
    hasUppercase,
    hasLowercase,
    hasNumber,
    hasSpecial
  ].filter(Boolean).length;

  const isPasswordValid = hasMinLength && hasUppercase && hasLowercase && hasNumber && hasSpecial;
  const passwordsMatch = password === confirmPassword && confirmPassword.length > 0;
  const canSubmit = isPasswordValid && passwordsMatch;

  const strengthLabel = passwordStrength <= 2 ? "Weak" : passwordStrength === 3 ? "Fair" : passwordStrength === 4 ? "Good" : "Strong";
  const strengthColor = passwordStrength <= 2 ? "#EB5757" : passwordStrength === 3 ? "#F2994A" : passwordStrength === 4 ? "#2F80ED" : "#27AE60";

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!canSubmit) return;
    setError("");
    setLoading(true);
    try {
      await authApi.resetPassword({ token, password });
      setSuccess(true);
    } catch (err: any) {
      setError(err?.response?.data?.error || "Failed to reset password. The link may have expired.");
    } finally {
      setLoading(false);
    }
  };

  // No token – show error
  if (!token) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-4" style={{ backgroundColor: "#F7F8F9" }}>
        <div className="mb-10 text-center">
          <h1 className="text-3xl font-bold" style={{ color: "#C9A227" }}>PapaEgo</h1>
        </div>
        <div className="w-full max-w-md bg-white rounded-2xl shadow-sm border p-8 text-center" style={{ borderColor: "#E1E3E6" }}>
          <div className="mx-auto w-16 h-16 rounded-full flex items-center justify-center mb-6"
            style={{ backgroundColor: "#FFE5E5" }}>
            <AlertCircle className="w-8 h-8" style={{ color: "#E05555" }} />
          </div>
          <h2 className="text-2xl font-bold mb-2" style={{ color: "#012333" }}>Invalid Reset Link</h2>
          <p className="text-sm mb-6" style={{ color: "#6B7078" }}>
            This password reset link is invalid or missing. Please request a new one.
          </p>
          <Link
            href="/customer-auth/forgot-password"
            className="inline-block w-full h-12 leading-[48px] rounded-lg font-semibold text-white text-center"
            style={{ backgroundColor: "#C9A227" }}
          >
            Request New Link
          </Link>
        </div>
      </div>
    );
  }

  // Success state
  if (success) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-4" style={{ backgroundColor: "#F7F8F9" }}>
        <div className="mb-10 text-center">
          <h1 className="text-3xl font-bold" style={{ color: "#C9A227" }}>PapaEgo</h1>
        </div>
        <div className="w-full max-w-md bg-white rounded-2xl shadow-sm border p-8 text-center" style={{ borderColor: "#E1E3E6" }}>
          <div className="mx-auto w-16 h-16 rounded-full flex items-center justify-center mb-6"
            style={{ backgroundColor: "#E2FDED" }}>
            <CheckCircle className="w-8 h-8" style={{ color: "#27AE60" }} />
          </div>
          <h2 className="text-2xl font-bold mb-2" style={{ color: "#012333" }}>Password Reset!</h2>
          <p className="text-sm mb-6" style={{ color: "#6B7078" }}>
            Your password has been updated successfully. You can now sign in with your new password.
          </p>
          <button
            onClick={() => router.push("/customer-auth/signin")}
            className="w-full h-12 rounded-lg font-semibold text-white"
            style={{ backgroundColor: "#C9A227" }}
          >
            Sign In Now
          </button>
        </div>
      </div>
    );
  }

  // Reset password form
  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4" style={{ backgroundColor: "#F7F8F9" }}>
      {/* Logo */}
      <div className="mb-10 text-center">
        <h1 className="text-3xl font-bold" style={{ color: "#C9A227" }}>PapaEgo</h1>
      </div>

      {/* Card */}
      <div className="w-full max-w-md bg-white rounded-2xl shadow-sm border p-8" style={{ borderColor: "#E1E3E6" }}>
        {/* Icon */}
        <div
          className="mx-auto w-16 h-16 rounded-full flex items-center justify-center mb-6"
          style={{ backgroundColor: "#FFF8E1" }}
        >
          <Lock className="w-8 h-8" style={{ color: "#C9A227" }} />
        </div>

        <h2 className="text-2xl font-bold text-center mb-1" style={{ color: "#012333" }}>Set New Password</h2>
        <p className="text-sm text-center mb-8" style={{ color: "#6B7078" }}>
          Create a strong password for your PapaEgo account.
        </p>

        {error && (
          <div className="mb-4 p-3 rounded-lg text-sm" style={{ backgroundColor: "#FFE5E5", color: "#E05555" }}>
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* New Password */}
          <div>
            <label className="block text-xs font-medium mb-1.5" style={{ color: "#6B7078" }}>
              New Password
            </label>
            <div className="border rounded-lg px-4 py-3 flex items-center gap-2" style={{ borderColor: "#E1E3E6" }}>
              <input
                id="reset-password-new"
                type={showPassword ? "text" : "password"}
                placeholder="Enter new password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="flex-1 text-sm bg-transparent outline-none"
                style={{ color: "#012333" }}
              />
              <button type="button" onClick={() => setShowPassword(!showPassword)} className="text-gray-400 hover:text-gray-600">
                {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
              </button>
            </div>
          </div>

          {/* Password Strength Meter */}
          {password && (
            <div className="bg-white p-4 rounded-xl border" style={{ borderColor: "#E1E3E6" }}>
              <div className="flex justify-between items-center mb-2">
                <span className="text-xs font-semibold" style={{ color: "#6B7078" }}>Password Strength:</span>
                <span className="text-xs font-bold font-mono" style={{ color: strengthColor }}>
                  {strengthLabel}
                </span>
              </div>

              {/* Visual strength bar */}
              <div className="grid grid-cols-5 gap-1.5 mb-3">
                {[1, 2, 3, 4, 5].map((level) => (
                  <div
                    key={level}
                    className="h-1.5 rounded-full transition-all"
                    style={{
                      backgroundColor: level <= passwordStrength ? strengthColor : "#E1E3E6"
                    }}
                  />
                ))}
              </div>

              {/* Checklist */}
              <div className="space-y-1.5">
                {[
                  { label: "At least 8 characters", met: hasMinLength },
                  { label: "At least one uppercase letter (A-Z)", met: hasUppercase },
                  { label: "At least one lowercase letter (a-z)", met: hasLowercase },
                  { label: "At least one number (0-9)", met: hasNumber },
                  { label: "At least one special character (e.g. @$!%*?&)", met: hasSpecial },
                ].map((item, idx) => (
                  <div key={idx} className="flex items-center gap-2 text-xs">
                    <div className="w-4 h-4 rounded-full flex items-center justify-center border transition-colors shrink-0"
                      style={{
                        borderColor: item.met ? "#27AE60" : "#E1E3E6",
                        backgroundColor: item.met ? "#E2FDED" : "transparent"
                      }}
                    >
                      {item.met ? (
                        <span className="text-[10px] font-bold" style={{ color: "#27AE60" }}>✓</span>
                      ) : (
                        <span className="w-1 h-1 rounded-full bg-gray-300" />
                      )}
                    </div>
                    <span style={{ color: item.met ? "#27AE60" : "#9AA0A6" }}>{item.label}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Confirm Password */}
          <div>
            <label className="block text-xs font-medium mb-1.5" style={{ color: "#6B7078" }}>
              Confirm Password
            </label>
            <div className="border rounded-lg px-4 py-3 flex items-center gap-2" style={{ borderColor: "#E1E3E6" }}>
              <input
                id="reset-password-confirm"
                type={showConfirm ? "text" : "password"}
                placeholder="Re-enter new password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
                className="flex-1 text-sm bg-transparent outline-none"
                style={{ color: "#012333" }}
              />
              <button type="button" onClick={() => setShowConfirm(!showConfirm)} className="text-gray-400 hover:text-gray-600">
                {showConfirm ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
              </button>
            </div>
            {confirmPassword && !passwordsMatch && (
              <p className="text-xs mt-1.5" style={{ color: "#E05555" }}>Passwords do not match</p>
            )}
            {passwordsMatch && (
              <p className="text-xs mt-1.5 flex items-center gap-1" style={{ color: "#27AE60" }}>
                <CheckCircle className="w-3 h-3" /> Passwords match
              </p>
            )}
          </div>

          {/* Submit */}
          <button
            id="reset-password-submit"
            type="submit"
            disabled={!canSubmit || loading}
            className="w-full h-12 rounded-lg font-semibold text-white disabled:opacity-60 transition-opacity"
            style={{ backgroundColor: "#C9A227" }}
          >
            {loading ? "Resetting…" : "Reset Password"}
          </button>
        </form>

        {/* Back to login */}
        <p className="text-center mt-6">
          <Link
            href="/customer-auth/signin"
            className="inline-flex items-center gap-2 text-sm font-medium"
            style={{ color: "#C9A227" }}
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Sign In
          </Link>
        </p>
      </div>
    </div>
  );
}

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: "#F7F8F9" }}>
        <div className="text-center">
          <h1 className="text-3xl font-bold mb-4" style={{ color: "#C9A227" }}>PapaEgo</h1>
          <p className="text-sm" style={{ color: "#6B7078" }}>Loading...</p>
        </div>
      </div>
    }>
      <ResetPasswordPageInner />
    </Suspense>
  );
}

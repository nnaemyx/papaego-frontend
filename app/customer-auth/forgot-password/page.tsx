"use client";

import { useState } from "react";
import { Mail, ArrowLeft, CheckCircle } from "lucide-react";
import { authApi } from "@/lib/api/auth";
import Link from "next/link";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await authApi.forgotPassword(email);
      setSubmitted(true);
    } catch (err: any) {
      setError(err?.response?.data?.error || "Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // Success state — check your email
  if (submitted) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-4" style={{ backgroundColor: "#F7F8F9" }}>
        <div className="mb-10 text-center">
          <h1 className="text-3xl font-bold" style={{ color: "#C9A227" }}>PapaEgo</h1>
        </div>

        <div className="w-full max-w-md bg-white rounded-2xl shadow-sm border p-8 text-center" style={{ borderColor: "#E1E3E6" }}>
          {/* Success Icon */}
          <div
            className="mx-auto w-16 h-16 rounded-full flex items-center justify-center mb-6"
            style={{ backgroundColor: "#E2FDED" }}
          >
            <CheckCircle className="w-8 h-8" style={{ color: "#27AE60" }} />
          </div>

          <h2 className="text-2xl font-bold mb-2" style={{ color: "#012333" }}>Check Your Email</h2>
          <p className="text-sm mb-6" style={{ color: "#6B7078" }}>
            We've sent a password reset link to <strong style={{ color: "#012333" }}>{email}</strong>.
            Please check your inbox and follow the instructions.
          </p>

          {/* Info callout */}
          <div
            className="rounded-lg p-4 mb-6 text-left"
            style={{ backgroundColor: "#FFF8E1", borderLeft: "4px solid #C9A227" }}
          >
            <p className="text-xs" style={{ color: "#6B7078" }}>
              ⏰ The link will expire in <strong>1 hour</strong>. If you don't see the email, check your spam folder.
            </p>
          </div>

          <button
            onClick={() => { setSubmitted(false); setEmail(""); }}
            className="w-full h-12 rounded-lg font-semibold text-white mb-4"
            style={{ backgroundColor: "#C9A227" }}
          >
            Try Another Email
          </button>

          <Link
            href="/customer-auth/signin"
            className="inline-flex items-center gap-2 text-sm font-medium"
            style={{ color: "#C9A227" }}
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Sign In
          </Link>
        </div>
      </div>
    );
  }

  // Default state — enter email form
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
          <Mail className="w-8 h-8" style={{ color: "#C9A227" }} />
        </div>

        <h2 className="text-2xl font-bold text-center mb-1" style={{ color: "#012333" }}>Forgot Password?</h2>
        <p className="text-sm text-center mb-8" style={{ color: "#6B7078" }}>
          No worries! Enter your email address and we'll send you a link to reset your password.
        </p>

        {error && (
          <div className="mb-4 p-3 rounded-lg text-sm" style={{ backgroundColor: "#FFE5E5", color: "#E05555" }}>
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Email */}
          <div>
            <label className="block text-xs font-medium mb-1.5" style={{ color: "#6B7078" }}>
              Email Address
            </label>
            <div className="border rounded-lg px-4 py-3" style={{ borderColor: "#E1E3E6" }}>
              <input
                id="forgot-password-email"
                type="email"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full text-sm bg-transparent outline-none"
                style={{ color: "#012333" }}
              />
            </div>
          </div>

          {/* Submit */}
          <button
            id="forgot-password-submit"
            type="submit"
            disabled={loading}
            className="w-full h-12 rounded-lg font-semibold text-white disabled:opacity-60 transition-opacity"
            style={{ backgroundColor: "#C9A227" }}
          >
            {loading ? "Sending…" : "Send Reset Link"}
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

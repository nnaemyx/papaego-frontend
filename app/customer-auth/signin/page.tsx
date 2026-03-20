"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Eye, EyeOff } from "lucide-react";
import { authApi } from "@/lib/api/auth";
import Link from "next/link";

export default function CustomerSigninPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPw, setShowPw] = useState(false);
  const [keepSigned, setKeepSigned] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const data = await authApi.login({ email, password });
      if (data.user.role !== "CUSTOMER") {
        setError("This login is for customer accounts only.");
        return;
      }
      router.push("/customer/dashboard");
    } catch (err: any) {
      setError(err?.response?.data?.error || "Invalid email or password");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4" style={{ backgroundColor: "#F7F8F9" }}>
      {/* Logo */}
      <div className="mb-10 text-center">
        <h1 className="text-3xl font-bold" style={{ color: "#C9A227" }}>PapaEgo</h1>
      </div>

      {/* Card */}
      <div className="w-full max-w-md bg-white rounded-2xl shadow-sm border p-8" style={{ borderColor: "#E1E3E6" }}>
        <h2 className="text-2xl font-bold text-center mb-1" style={{ color: "#012333" }}>Welcome Back!</h2>
        <p className="text-sm text-center mb-8" style={{ color: "#6B7078" }}>Sign in to access your PapaEgo account</p>

        {error && (
          <div className="mb-4 p-3 rounded-lg text-sm" style={{ backgroundColor: "#FFE5E5", color: "#E05555" }}>
            {error}
          </div>
        )}

        <form onSubmit={handleLogin} className="space-y-4">
          {/* Email */}
          <div className="border rounded-lg px-4 py-3" style={{ borderColor: "#E1E3E6" }}>
            <input
              type="email"
              placeholder="Email Address"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full text-sm bg-transparent outline-none"
              style={{ color: "#012333" }}
            />
          </div>

          {/* Password */}
          <div className="border rounded-lg px-4 py-3 flex items-center gap-2" style={{ borderColor: "#E1E3E6" }}>
            <input
              type={showPw ? "text" : "password"}
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="flex-1 text-sm bg-transparent outline-none"
              style={{ color: "#012333" }}
            />
            <button type="button" onClick={() => setShowPw(!showPw)} className="text-gray-400 hover:text-gray-600">
              {showPw ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
            </button>
          </div>

          {/* Keep signed in */}
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={keepSigned}
              onChange={(e) => setKeepSigned(e.target.checked)}
              className="w-4 h-4 rounded"
            />
            <span className="text-sm" style={{ color: "#383838" }}>Keep me Signed In</span>
          </label>

          {/* Submit */}
          <button
            type="submit"
            disabled={loading}
            className="w-full h-12 rounded-lg font-semibold text-white disabled:opacity-60"
            style={{ backgroundColor: "#C9A227" }}>
            {loading ? "Signing in…" : "Sign In"}
          </button>
        </form>

        {/* Forgot / Signup */}
        <p className="text-center mt-4">
          <Link href="/customer-auth/forgot-password" className="text-sm font-medium" style={{ color: "#E05555" }}>
            Forgot Password?
          </Link>
        </p>
        <p className="text-center mt-3 text-sm" style={{ color: "#6B7078" }}>
          Don't have an account?{" "}
          <Link href="/customer-auth/signup" className="font-semibold" style={{ color: "#C9A227" }}>
            Create New Account
          </Link>
        </p>
      </div>
    </div>
  );
}

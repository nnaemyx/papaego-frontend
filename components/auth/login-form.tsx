"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/store/auth-store";
import api from "@/lib/api/client";
import Link from "next/link";

export default function LoginForm() {
    const router = useRouter();
    const login = useAuthStore((state) => state.login);
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");
    const [isLoading, setIsLoading] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        setError("");

        try {
            const res = await api.post("/auth/login", { email, password });
            const { user, token } = res.data;

            login(user, token);

            // Redirect based on role
            switch (user.role) {
                case "AGENT":
                    router.push("/agent/dashboard");
                    break;
                case "CUSTOMER":
                    router.push("/customer/dashboard");
                    break;
                case "ADMIN":
                    router.push("/admin/dashboard");
                    break;
                case "COMPLIANCE":
                    router.push("/compliance/dashboard");
                    break;
                default:
                    router.push("/");
            }
        } catch (err: any) {
            setError(err.response?.data?.error || "Login failed");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="w-full max-w-md p-8 space-y-6 bg-white rounded-lg shadow-md">
            <h2 className="text-2xl font-bold text-center text-gray-900">
                Sign in to your account
            </h2>

            {error && (
                <div className="p-3 text-sm text-red-500 bg-red-50 rounded-md">
                    {error}
                </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                    <label className="block text-sm font-medium text-gray-700">
                        Email
                    </label>
                    <input
                        type="email"
                        required
                        className="w-full px-3 py-2 mt-1 border rounded-md focus:ring-blue-500 focus:border-blue-500"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                    />
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700">
                        Password
                    </label>
                    <input
                        type="password"
                        required
                        className="w-full px-3 py-2 mt-1 border rounded-md focus:ring-blue-500 focus:border-blue-500"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                    />
                </div>

                <button
                    type="submit"
                    disabled={isLoading}
                    className="w-full px-4 py-2 text-white bg-blue-600 rounded-md hover:bg-blue-700 disabled:opacity-50"
                >
                    {isLoading ? "Signing in..." : "Sign in"}
                </button>
            </form>

            <div className="text-sm text-center">
                <span className="text-gray-600">Don't have an account? </span>
                <Link href="/signup" className="text-blue-600 hover:underline">
                    Sign up
                </Link>
            </div>
        </div>
    );
}

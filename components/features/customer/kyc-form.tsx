"use client";

import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import api from "@/lib/api/client";

export default function KycForm() {
    const queryClient = useQueryClient();
    const [bvn, setBvn] = useState("");
    const [success, setSuccess] = useState(false);
    const [error, setError] = useState("");

    const kycMutation = useMutation({
        mutationFn: async (data: any) => {
            const res = await api.post("/customers/kyc/start", data);
            return res.data;
        },
        onSuccess: () => {
            setSuccess(true);
            setError("");
            // Maybe refetch user status or customer list
        },
        onError: (err: any) => {
            setError(err.response?.data?.error || "KYC submission failed");
        },
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        kycMutation.mutate({ bvn });
    };

    if (success) {
        return (
            <div className="p-4 bg-green-50 text-green-700 rounded-md">
                KYC Submitted Successfully! Your verification is in progress.
            </div>
        );
    }

    return (
        <div className="p-6 bg-white rounded-lg shadow-sm border border-gray-100">
            <h3 className="text-lg font-bold mb-4">Identity Verification</h3>

            {error && (
                <div className="p-3 mb-4 text-sm text-red-500 bg-red-50 rounded-md">
                    {error}
                </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                    <label className="block text-sm font-medium text-gray-700">
                        Bank Verification Number (BVN)
                    </label>
                    <input
                        type="text"
                        value={bvn}
                        onChange={(e) => setBvn(e.target.value)}
                        className="w-full mt-1 border rounded-md p-2"
                        maxLength={11}
                        required
                        placeholder="12345678901"
                    />
                    <p className="mt-1 text-xs text-gray-500">
                        Enter your 11-digit BVN for verification.
                    </p>
                </div>

                <button
                    type="submit"
                    disabled={kycMutation.isPending}
                    className="w-full px-4 py-2 text-white bg-blue-600 rounded-md hover:bg-blue-700 disabled:opacity-50"
                >
                    {kycMutation.isPending ? "Verifying..." : "Submit Verification"}
                </button>
            </form>
        </div>
    );
}

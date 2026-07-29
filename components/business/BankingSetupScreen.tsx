"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { getBankingEligibility, provisionManagedAccount, BankingEligibilityResponse } from "@/lib/api/banking";
import { BankingStatusWidget } from "./BankingStatusWidget";

export const BankingSetupScreen: React.FC = () => {
    const router = useRouter();
    const [loading, setLoading] = useState(true);
    const [provisioning, setProvisioning] = useState(false);
    const [eligibility, setEligibility] = useState<BankingEligibilityResponse | null>(null);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        loadEligibility();
    }, []);

    const loadEligibility = async () => {
        try {
            setLoading(true);
            setError(null);
            const data = await getBankingEligibility();
            setEligibility(data);
        } catch (err: any) {
            console.error("Failed to load banking eligibility:", err);
            setError(err.response?.data?.error || err.message || "Failed to load eligibility status.");
        } finally {
            setLoading(false);
        }
    };

    const handleProvisionAccount = async () => {
        try {
            setProvisioning(true);
            setError(null);
            await provisionManagedAccount();
            router.push("/business/banking");
        } catch (err: any) {
            console.error("Failed to provision managed bank account:", err);
            setError(err.response?.data?.error || err.message || "Provisioning request failed.");
        } finally {
            setProvisioning(false);
        }
    };

    if (loading) {
        return (
            <div className="min-h-[60vh] flex flex-col items-center justify-center p-8 bg-[#F7F8F9]">
                <div className="w-12 h-12 border-4 border-[#C9A227] border-t-transparent rounded-full animate-spin mb-4" />
                <p className="text-[#6B7078] text-sm font-medium">Checking banking eligibility...</p>
            </div>
        );
    }

    return (
        <div className="max-w-4xl mx-auto p-6 md:p-10 space-y-8 bg-[#F7F8F9] min-h-screen">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-[#E1E3E6] pb-6">
                <div>
                    <h1 className="text-2xl font-bold text-[#012333]">Managed Bank Account Setup</h1>
                    <p className="text-sm text-[#6B7078] mt-1">
                        Provision your dedicated U.S. bank account through FV Bank for cross-border settlements.
                    </p>
                </div>
                <div>
                    <BankingStatusWidget status="PENDING_CREATION" />
                </div>
            </div>

            {/* Error Banner */}
            {error && (
                <div className="p-4 bg-red-50 border border-red-200 rounded-xl text-red-700 text-sm font-medium">
                    ⚠️ {error}
                </div>
            )}

            {/* Main Setup Card */}
            <div className="bg-white rounded-2xl p-8 border border-[#E1E3E6] shadow-sm space-y-6">
                <div className="flex items-start gap-4">
                    <div className="w-12 h-12 rounded-2xl bg-[#FFF7E6] border border-[#F0CD00] flex items-center justify-center text-2xl flex-shrink-0">
                        🏦
                    </div>
                    <div>
                        <h2 className="text-lg font-bold text-[#012333]">FV Bank Dedicated U.S. Account</h2>
                        <p className="text-sm text-[#6B7078] mt-1">
                            Your organization qualifies for a unique U.S. Routing and Account Number. Deposits are automatically recognized and reconciled in real-time.
                        </p>
                    </div>
                </div>

                {/* Eligibility Verification Checklist */}
                <div className="bg-[#F7F8F9] rounded-xl p-6 border border-[#E1E3E6] space-y-4">
                    <h3 className="text-xs font-bold uppercase tracking-wider text-[#6B7078]">Compliance & Verification Checklist</h3>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
                        <div className="flex items-center gap-2">
                            <span>{eligibility?.details.organizationActive ? "✅" : "❌"}</span>
                            <span className={eligibility?.details.organizationActive ? "text-[#012333] font-medium" : "text-red-600"}>
                                Active Organization Profile
                            </span>
                        </div>

                        <div className="flex items-center gap-2">
                            <span>{eligibility?.details.qualificationCompleted ? "✅" : "❌"}</span>
                            <span className={eligibility?.details.qualificationCompleted ? "text-[#012333] font-medium" : "text-red-600"}>
                                Business Qualification Passed
                            </span>
                        </div>

                        <div className="flex items-center gap-2">
                            <span>{eligibility?.details.kycApproved ? "✅" : "❌"}</span>
                            <span className={eligibility?.details.kycApproved ? "text-[#012333] font-medium" : "text-red-600"}>
                                Identity Verification (KYC) Approved
                            </span>
                        </div>

                        <div className="flex items-center gap-2">
                            <span>{eligibility?.details.kybApproved ? "✅" : "❌"}</span>
                            <span className={eligibility?.details.kybApproved ? "text-[#012333] font-medium" : "text-red-600"}>
                                Corporate Verification (KYB) Approved
                            </span>
                        </div>
                    </div>
                </div>

                {/* Eligibility Output / Failure Reasons */}
                {!eligibility?.isEligible ? (
                    <div className="p-5 bg-amber-50 border border-amber-200 rounded-xl space-y-3">
                        <h4 className="text-sm font-bold text-amber-900">Provisioning Requirements Pending</h4>
                        <ul className="list-disc list-inside text-xs text-amber-800 space-y-1">
                            {eligibility?.reasons.map((r, i) => (
                                <li key={i}>{r}</li>
                            ))}
                        </ul>
                        <div className="pt-2 flex gap-3">
                            <button
                                onClick={() => router.push("/business/onboarding")}
                                className="text-xs font-semibold px-4 py-2 bg-amber-700 text-white rounded-lg hover:bg-amber-800 transition-all"
                            >
                                Complete Onboarding & Compliance
                            </button>
                            <button
                                onClick={loadEligibility}
                                className="text-xs font-semibold px-4 py-2 border border-amber-300 text-amber-900 rounded-lg hover:bg-amber-100 transition-all"
                            >
                                Re-check Status
                            </button>
                        </div>
                    </div>
                ) : (
                    <div className="space-y-4 pt-2">
                        <div className="flex items-center justify-between p-4 bg-emerald-50 border border-emerald-200 rounded-xl">
                            <div className="flex items-center gap-3">
                                <span className="text-xl">✨</span>
                                <div>
                                    <p className="text-sm font-bold text-emerald-900">Organization Fully Eligible!</p>
                                    <p className="text-xs text-emerald-700">All compliance requirements met. Ready for instant provisioning.</p>
                                </div>
                            </div>
                            <span className="text-xs font-semibold text-emerald-800 bg-emerald-100 px-3 py-1 rounded-full">
                                ~ Instant (0-30s)
                            </span>
                        </div>

                        <button
                            onClick={handleProvisionAccount}
                            disabled={provisioning}
                            className="w-full py-4 bg-[#C9A227] hover:bg-[#b08d20] text-[#012333] font-bold rounded-xl shadow-md transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                        >
                            {provisioning ? (
                                <>
                                    <div className="w-5 h-5 border-2 border-[#012333] border-t-transparent rounded-full animate-spin" />
                                    <span>Provisioning Bank Account...</span>
                                </>
                            ) : (
                                <span>Provision Dedicated Managed U.S. Account →</span>
                            )}
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
};

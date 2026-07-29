"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { getBankingProfile, syncBankAccount, BankingProfile } from "@/lib/api/banking";
import { BankingStatusWidget } from "./BankingStatusWidget";

export const BankingDetailsPage: React.FC = () => {
    const router = useRouter();
    const [loading, setLoading] = useState(true);
    const [syncing, setSyncing] = useState(false);
    const [profile, setProfile] = useState<BankingProfile | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [copiedField, setCopiedField] = useState<string | null>(null);

    useEffect(() => {
        loadProfile();
    }, []);

    const loadProfile = async () => {
        try {
            setLoading(true);
            setError(null);
            const data = await getBankingProfile();
            setProfile(data.profile);
        } catch (err: any) {
            console.error("Failed to load banking profile:", err);
            if (err.response?.status === 404) {
                router.push("/business/banking/setup");
                return;
            }
            setError(err.response?.data?.error || err.message || "Failed to load banking details.");
        } finally {
            setLoading(false);
        }
    };

    const handleSync = async () => {
        try {
            setSyncing(true);
            await syncBankAccount();
            await loadProfile();
        } catch (err: any) {
            console.error("Sync error:", err);
            alert("Sync failed: " + (err.response?.data?.error || err.message));
        } finally {
            setSyncing(false);
        }
    };

    const copyToClipboard = (text: string, fieldName: string) => {
        navigator.clipboard.writeText(text);
        setCopiedField(fieldName);
        setTimeout(() => setCopiedField(null), 2500);
    };

    if (loading) {
        return (
            <div className="min-h-[60vh] flex flex-col items-center justify-center p-8 bg-[#F7F8F9]">
                <div className="w-12 h-12 border-4 border-[#C9A227] border-t-transparent rounded-full animate-spin mb-4" />
                <p className="text-[#6B7078] text-sm font-medium">Loading banking details...</p>
            </div>
        );
    }

    if (!profile) {
        return null;
    }

    return (
        <div className="max-w-5xl mx-auto p-6 md:p-10 space-y-8 bg-[#F7F8F9] min-h-screen">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-[#E1E3E6] pb-6">
                <div>
                    <h1 className="text-2xl font-bold text-[#012333]">Managed Banking Account</h1>
                    <p className="text-sm text-[#6B7078] mt-1">
                        Your dedicated U.S. bank account provisioned through FV Bank.
                    </p>
                </div>
                <div className="flex items-center gap-3">
                    <BankingStatusWidget status={profile.status} />
                    <button
                        onClick={handleSync}
                        disabled={syncing}
                        className="px-4 py-2 bg-white border border-[#E1E3E6] rounded-xl text-xs font-semibold text-[#012333] hover:bg-[#F7F8F9] transition-all flex items-center gap-2 disabled:opacity-50"
                    >
                        {syncing ? (
                            <div className="w-3.5 h-3.5 border-2 border-[#012333] border-t-transparent rounded-full animate-spin" />
                        ) : (
                            <span>🔄</span>
                        )}
                        <span>Sync with Bank</span>
                    </button>
                </div>
            </div>

            {/* Error banner */}
            {error && (
                <div className="p-4 bg-red-50 border border-red-200 rounded-xl text-red-700 text-sm font-medium">
                    ⚠️ {error}
                </div>
            )}

            {/* Main Account Details Card */}
            <div className="bg-white rounded-2xl border border-[#E1E3E6] shadow-sm overflow-hidden">
                <div className="bg-[#012333] text-white p-8 relative">
                    <div className="flex justify-between items-start">
                        <div>
                            <span className="text-xs uppercase tracking-widest text-[#C9A227] font-semibold">Dedicated U.S. Banking</span>
                            <h2 className="text-2xl font-bold mt-1">{profile.bankName}</h2>
                        </div>
                        <span className="px-3 py-1 bg-[#FFF7E6] text-[#012333] text-xs font-extrabold rounded-md">
                            {profile.currency}
                        </span>
                    </div>

                    <div className="mt-8 space-y-1">
                        <span className="text-xs text-[#6B7078] uppercase tracking-wider block">Account Holder</span>
                        <p className="text-lg font-semibold text-white">{profile.accountHolder}</p>
                    </div>
                </div>

                {/* Details Grid */}
                <div className="p-8 grid grid-cols-1 md:grid-cols-2 gap-6 bg-white">
                    {/* Account Number Field */}
                    <div className="p-5 rounded-xl border border-[#E1E3E6] bg-[#F7F8F9] flex flex-col justify-between">
                        <div>
                            <span className="text-xs font-bold text-[#6B7078] uppercase tracking-wider block mb-1">
                                Account Number
                            </span>
                            <p className="text-xl font-mono font-bold text-[#012333]">
                                {profile.accountNumber}
                            </p>
                        </div>
                        <button
                            onClick={() => copyToClipboard(profile.accountNumber, "accountNumber")}
                            className="mt-4 w-full py-2 bg-white border border-[#E1E3E6] rounded-lg text-xs font-bold text-[#012333] hover:border-[#C9A227] transition-all flex items-center justify-center gap-1.5"
                        >
                            {copiedField === "accountNumber" ? (
                                <span className="text-emerald-600">✓ Copied!</span>
                            ) : (
                                <span>📋 Copy Account Number</span>
                            )}
                        </button>
                    </div>

                    {/* Routing Number Field */}
                    <div className="p-5 rounded-xl border border-[#E1E3E6] bg-[#F7F8F9] flex flex-col justify-between">
                        <div>
                            <span className="text-xs font-bold text-[#6B7078] uppercase tracking-wider block mb-1">
                                Routing Number (ABA / ACH)
                            </span>
                            <p className="text-xl font-mono font-bold text-[#012333]">
                                {profile.routingNumber}
                            </p>
                        </div>
                        <button
                            onClick={() => copyToClipboard(profile.routingNumber, "routingNumber")}
                            className="mt-4 w-full py-2 bg-white border border-[#E1E3E6] rounded-lg text-xs font-bold text-[#012333] hover:border-[#C9A227] transition-all flex items-center justify-center gap-1.5"
                        >
                            {copiedField === "routingNumber" ? (
                                <span className="text-emerald-600">✓ Copied!</span>
                            ) : (
                                <span>📋 Copy Routing Number</span>
                            )}
                        </button>
                    </div>

                    {/* SWIFT / BIC */}
                    <div className="p-4 rounded-xl border border-[#E1E3E6] bg-white">
                        <span className="text-xs font-semibold text-[#6B7078] block">SWIFT / BIC Code</span>
                        <p className="text-sm font-mono font-semibold text-[#012333] mt-1">{profile.swiftBic}</p>
                    </div>

                    {/* Country */}
                    <div className="p-4 rounded-xl border border-[#E1E3E6] bg-white">
                        <span className="text-xs font-semibold text-[#6B7078] block">Bank Jurisdiction</span>
                        <p className="text-sm font-semibold text-[#012333] mt-1">{profile.country}</p>
                    </div>
                </div>
            </div>

            {/* Audit & Event Timeline */}
            {profile.recentEvents && profile.recentEvents.length > 0 && (
                <div className="bg-white rounded-2xl p-6 border border-[#E1E3E6] shadow-sm space-y-4">
                    <h3 className="text-base font-bold text-[#012333]">Banking Activity Audit History</h3>
                    <div className="space-y-3">
                        {profile.recentEvents.map((evt) => (
                            <div key={evt.id} className="p-3.5 bg-[#F7F8F9] rounded-xl border border-[#E1E3E6] flex items-center justify-between text-xs">
                                <div>
                                    <span className="font-bold text-[#012333]">{evt.event}</span>
                                    <p className="text-[#6B7078] mt-0.5">{evt.details || `Source: ${evt.source}`}</p>
                                </div>
                                <span className="text-[#6B7078] font-mono text-[11px]">
                                    {new Date(evt.createdAt).toLocaleString()}
                                </span>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
};

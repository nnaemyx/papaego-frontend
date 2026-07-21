"use client";

import { useState, useEffect } from "react";
import { RefreshCw, Shield, User, Building, Clock, AlertTriangle, CheckCircle2, XCircle, Info, ChevronDown, ChevronUp } from "lucide-react";
import { toast } from "sonner";
import { complianceApi, type ComplianceStatus, type StatusHistoryEntry } from "@/lib/api/compliance-kyc-kyb";
import ComplianceStatusBadge from "./ComplianceStatusBadge";
import type { VerificationStatus } from "@/lib/api/compliance-kyc-kyb";
import { format, parseISO } from "date-fns";

interface Props {
    organizationId: string;
}

export default function ComplianceStatusDashboard({ organizationId }: Props) {
    const [data, setData] = useState<ComplianceStatus | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isRefreshing, setIsRefreshing] = useState(false);
    const [showHistory, setShowHistory] = useState(false);

    const fetchStatus = async (silent = false) => {
        if (!silent) setIsLoading(true);
        else setIsRefreshing(true);
        try {
            const res = await complianceApi.getStatus(organizationId);
            setData(res);
        } catch (err: any) {
            if (!silent) toast.error("Failed to load compliance status.");
        } finally {
            setIsLoading(false);
            setIsRefreshing(false);
        }
    };

    useEffect(() => {
        fetchStatus();
        const interval = setInterval(() => fetchStatus(true), 30000);
        return () => clearInterval(interval);
    }, [organizationId]);

    if (isLoading) {
        return (
            <div className="animate-pulse space-y-4">
                {[1, 2, 3].map(i => (
                    <div key={i} className="h-24 bg-white rounded-xl border border-gray-200" />
                ))}
            </div>
        );
    }

    if (!data) return null;

    return (
        <div className="space-y-6">
            {/* Overall status banner */}
            <div className={`flex items-start gap-4 p-5 rounded-2xl border ${
                data.isFullyApproved
                    ? "bg-emerald-50 border-emerald-200"
                    : "bg-[#FFF7E6] border-[#F0CD00]"
            }`}>
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
                    data.isFullyApproved ? "bg-emerald-100 text-emerald-700" : "bg-amber-100 text-[#C9A227]"
                }`}>
                    <Shield className="w-5 h-5" />
                </div>
                <div>
                    <h2 className="font-bold text-base" style={{ color: "#012333" }}>
                        {data.isFullyApproved ? "Verification Complete ✓" : "Verification In Progress"}
                    </h2>
                    <p className="text-sm mt-1" style={{ color: data.isFullyApproved ? "#047857" : "#856404" }}>
                        {data.isFullyApproved
                            ? "Both KYC and KYB have been approved by FV Bank. Your organization is activated."
                            : "Your compliance verification is being processed by FV Bank. This typically takes 1-3 business days."
                        }
                    </p>
                    {data.canProceedToManagedAccount && (
                        <div className="mt-3 inline-flex items-center gap-2 bg-emerald-100 text-emerald-800 text-xs font-bold px-3 py-1 rounded-full">
                            <CheckCircle2 className="w-3.5 h-3.5" />
                            Ready for Managed Account Setup
                        </div>
                    )}
                </div>
                <button
                    onClick={() => fetchStatus(true)}
                    disabled={isRefreshing}
                    className="ml-auto text-gray-400 hover:text-gray-600 transition-colors"
                    title="Refresh status"
                >
                    <RefreshCw className={`w-4 h-4 ${isRefreshing ? "animate-spin" : ""}`} />
                </button>
            </div>

            {/* KYC Card */}
            <VerificationCard
                icon={<User className="w-5 h-5" />}
                title="Identity Verification (KYC)"
                subtitle="Personal identity check by FV Bank"
                status={data.kyc?.status as VerificationStatus || null}
                submittedAt={data.kyc?.submittedAt}
                rejectionReason={data.kyc?.rejectionReason}
                additionalInfoNote={data.kyc?.additionalInfoNote}
                notStarted={!data.kyc}
            />

            {/* KYB Card */}
            <VerificationCard
                icon={<Building className="w-5 h-5" />}
                title="Business Verification (KYB)"
                subtitle="Corporate entity check by FV Bank"
                status={data.kyb?.status as VerificationStatus || null}
                submittedAt={data.kyb?.submittedAt}
                rejectionReason={data.kyb?.rejectionReason}
                additionalInfoNote={data.kyb?.additionalInfoNote}
                notStarted={!data.kyb}
            />

            {/* Status History */}
            <div className="bg-white border rounded-2xl overflow-hidden shadow-sm" style={{ borderColor: "#E1E3E6" }}>
                <button
                    onClick={() => setShowHistory(h => !h)}
                    className="w-full flex items-center justify-between p-5 text-left hover:bg-gray-50 transition-colors"
                >
                    <div className="flex items-center gap-3">
                        <Clock className="w-4 h-4 text-gray-400" />
                        <span className="font-semibold text-sm" style={{ color: "#012333" }}>Verification History</span>
                        <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-gray-100 text-gray-600">
                            {data.history.length} events
                        </span>
                    </div>
                    {showHistory ? <ChevronUp className="w-4 h-4 text-gray-400" /> : <ChevronDown className="w-4 h-4 text-gray-400" />}
                </button>

                {showHistory && (
                    <div className="border-t p-5" style={{ borderColor: "#E1E3E6" }}>
                        {data.history.length === 0 ? (
                            <p className="text-gray-400 text-sm py-4 text-center">No history yet.</p>
                        ) : (
                            <ol className="relative mt-2 space-y-0">
                                {data.history.map((entry, i) => (
                                    <HistoryItem key={entry.id} entry={entry} isLast={i === data.history.length - 1} />
                                ))}
                            </ol>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
}

function VerificationCard({ icon, title, subtitle, status, submittedAt, rejectionReason, additionalInfoNote, notStarted }: {
    icon: React.ReactNode;
    title: string;
    subtitle: string;
    status: VerificationStatus | null;
    submittedAt?: string;
    rejectionReason?: string;
    additionalInfoNote?: string;
    notStarted: boolean;
}) {
    return (
        <div className="bg-white border rounded-2xl p-5 shadow-sm" style={{ borderColor: "#E1E3E6" }}>
            <div className="flex items-start justify-between gap-4">
                <div className="flex items-start gap-3">
                    <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0"
                        style={{ backgroundColor: "#FFF7E6", border: "1px solid #F0CD00", color: "#C9A227" }}>
                        {icon}
                    </div>
                    <div>
                        <h3 className="font-bold text-sm" style={{ color: "#012333" }}>{title}</h3>
                        <p className="text-xs mt-0.5" style={{ color: "#6B7078" }}>{subtitle}</p>
                        {submittedAt && (
                            <p className="text-xs mt-1 text-gray-400">
                                Submitted {format(parseISO(submittedAt), "MMM d, yyyy")}
                            </p>
                        )}
                    </div>
                </div>
                {notStarted ? (
                    <span className="text-xs text-gray-400 bg-gray-100 border border-gray-200 px-2.5 py-1 rounded-full">
                        Not started
                    </span>
                ) : status ? (
                    <ComplianceStatusBadge status={status} />
                ) : null}
            </div>

            {additionalInfoNote && (
                <div className="mt-4 flex gap-2.5 bg-amber-50 border border-amber-200 rounded-xl p-3 text-amber-800 text-xs">
                    <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                    <div>
                        <p className="font-bold mb-0.5">Action Required</p>
                        <p>{additionalInfoNote}</p>
                    </div>
                </div>
            )}
            {rejectionReason && (
                <div className="mt-4 flex gap-2.5 bg-red-50 border border-red-200 rounded-xl p-3 text-red-800 text-xs">
                    <XCircle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
                    <div>
                        <p className="font-bold mb-0.5">Rejection Reason</p>
                        <p>{rejectionReason}</p>
                    </div>
                </div>
            )}
            {status === "MANUAL_REVIEW" && (
                <div className="mt-4 flex gap-2.5 bg-indigo-50 border border-indigo-200 rounded-xl p-3 text-indigo-800 text-xs">
                    <Info className="w-4 h-4 text-indigo-600 shrink-0 mt-0.5" />
                    <p>FV Bank is conducting a manual review. This typically takes 1-3 business days.</p>
                </div>
            )}
        </div>
    );
}

function HistoryItem({ entry, isLast }: { entry: StatusHistoryEntry; isLast: boolean }) {
    const isApproved = entry.toStatus === "APPROVED";
    const isRejected = entry.toStatus === "REJECTED";

    return (
        <li className="relative flex gap-4 pb-6 last:pb-0">
            {!isLast && (
                <div className="absolute left-3.5 top-7 bottom-0 w-0.5 bg-gray-200" />
            )}
            <div className={`w-7 h-7 rounded-full flex items-center justify-center shrink-0 mt-0.5 ${
                isApproved ? "bg-emerald-500 text-white" :
                isRejected ? "bg-red-500 text-white" :
                "bg-gray-200 text-gray-500"
            }`}>
                {isApproved ? <CheckCircle2 className="w-3.5 h-3.5" /> :
                 isRejected ? <XCircle className="w-3.5 h-3.5" /> :
                 <Clock className="w-3 h-3" />}
            </div>
            <div className="flex-1 min-w-0 pt-0.5">
                <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-xs font-bold" style={{ color: "#012333" }}>{entry.entityType}</span>
                    {entry.fromStatus && (
                        <>
                            <span className="text-gray-300 text-xs">→</span>
                            <span className="text-xs text-gray-400">{entry.fromStatus}</span>
                        </>
                    )}
                    <span className="text-gray-300 text-xs">→</span>
                    <span className={`text-xs font-bold ${isApproved ? "text-emerald-600" : isRejected ? "text-red-600" : "text-gray-700"}`}>
                        {entry.toStatus}
                    </span>
                </div>
                {entry.reason && <p className="text-xs mt-0.5 text-gray-500 truncate">{entry.reason}</p>}
                <p className="text-xs mt-1 text-gray-400">
                    {format(parseISO(entry.createdAt), "MMM d, yyyy HH:mm")} · {entry.changedBy || "System"}
                </p>
            </div>
        </li>
    );
}

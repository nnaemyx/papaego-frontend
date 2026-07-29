"use client";

import { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { adminOrganizationsApi, type OrganizationFullDetail } from "@/lib/api/admin-organizations";
import { toast } from "sonner";
import Link from "next/link";
import {
    ArrowLeft,
    Building2,
    CheckCircle2,
    XCircle,
    Clock,
    AlertTriangle,
    Shield,
    FileText,
    Download,
    ExternalLink,
    Landmark,
    Users,
    Activity,
    CreditCard,
    Check,
    X
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";

export default function AdminOrganizationDetailPage() {
    const params = useParams();
    const router = useRouter();
    const queryClient = useQueryClient();
    const id = params.id as string;

    const [kycReason, setKycReason] = useState("");
    const [kybReason, setKybReason] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);

    const { data, isLoading, refetch } = useQuery({
        queryKey: ["admin-organization-detail", id],
        queryFn: () => adminOrganizationsApi.getOrganizationDetail(id),
        enabled: !!id
    });

    const org = data?.organization;

    // Approve KYC Mutation
    const updateKycMutation = useMutation({
        mutationFn: (payload: { kycRequestId: string; status: string; reason?: string; note?: string }) =>
            adminOrganizationsApi.updateKycStatus(id, payload),
        onSuccess: (res) => {
            toast.success(res.message);
            queryClient.invalidateQueries({ queryKey: ["admin-organization-detail", id] });
            queryClient.invalidateQueries({ queryKey: ["admin-organizations"] });
        },
        onError: (err: any) => toast.error(err.response?.data?.error || "Failed to update KYC status")
    });

    // Approve KYB Mutation
    const updateKybMutation = useMutation({
        mutationFn: (payload: { kybRequestId: string; status: string; reason?: string; note?: string }) =>
            adminOrganizationsApi.updateKybStatus(id, payload),
        onSuccess: (res) => {
            toast.success(res.message);
            queryClient.invalidateQueries({ queryKey: ["admin-organization-detail", id] });
            queryClient.invalidateQueries({ queryKey: ["admin-organizations"] });
        },
        onError: (err: any) => toast.error(err.response?.data?.error || "Failed to update KYB status")
    });

    // Update Org Status Mutation
    const updateOrgStatusMutation = useMutation({
        mutationFn: (payload: { status: string; reason?: string }) =>
            adminOrganizationsApi.updateOrganizationStatus(id, payload),
        onSuccess: (res) => {
            toast.success(res.message);
            queryClient.invalidateQueries({ queryKey: ["admin-organization-detail", id] });
            queryClient.invalidateQueries({ queryKey: ["admin-organizations"] });
        },
        onError: (err: any) => toast.error(err.response?.data?.error || "Failed to update organization status")
    });

    // Provision Bank Mutation
    const provisionBankMutation = useMutation({
        mutationFn: () => adminOrganizationsApi.provisionBank(id),
        onSuccess: (res) => {
            toast.success("Managed U.S. Bank Account provisioned successfully!");
            queryClient.invalidateQueries({ queryKey: ["admin-organization-detail", id] });
            queryClient.invalidateQueries({ queryKey: ["admin-organizations"] });
        },
        onError: (err: any) => toast.error(err.response?.data?.error || "Failed to provision bank account")
    });

    if (isLoading) {
        return (
            <div className="p-12 text-center text-slate-500 font-sans">
                <Clock className="w-8 h-8 animate-spin mx-auto mb-2 text-amber-500" />
                Loading organization details...
            </div>
        );
    }

    if (!org) {
        return (
            <div className="p-12 text-center font-sans">
                <AlertTriangle className="w-12 h-12 mx-auto mb-3 text-amber-500" />
                <h2 className="text-lg font-bold text-slate-800">Organization Not Found</h2>
                <Link href="/admin/organizations">
                    <Button variant="outline" className="mt-4 text-xs">Back to Organizations</Button>
                </Link>
            </div>
        );
    }

    const latestKyc = org.kycRequests[0] || null;
    const kyb = org.kybRequest || null;

    return (
        <div className="p-8 space-y-8 font-sans max-w-7xl mx-auto">
            {/* Top Navigation */}
            <div className="flex items-center gap-4">
                <Link href="/admin/organizations">
                    <Button variant="ghost" size="sm" className="gap-1.5 text-xs text-slate-600 hover:text-slate-900">
                        <ArrowLeft className="w-4 h-4" />
                        Back to Organizations
                    </Button>
                </Link>
            </div>

            {/* Header Banner */}
            <div className="bg-white p-6 rounded-2xl border shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-6" style={{ borderColor: "#E1E3E6" }}>
                <div className="flex items-start gap-4">
                    <div className="p-3.5 rounded-xl bg-amber-50 border border-amber-200 text-[#C9A227]">
                        <Building2 className="w-8 h-8" />
                    </div>
                    <div>
                        <div className="flex items-center gap-3">
                            <h1 className="text-2xl font-bold text-slate-900">{org.businessName}</h1>
                            <Badge className={
                                org.status === "ACTIVE" ? "bg-emerald-100 text-emerald-800 border-emerald-200" :
                                org.status === "DRAFT" ? "bg-amber-100 text-amber-800 border-amber-200" :
                                "bg-slate-100 text-slate-700"
                            }>
                                {org.status}
                            </Badge>
                        </div>
                        <p className="text-xs text-slate-500 mt-1">
                            Registered: {new Date(org.createdAt).toLocaleDateString()} • Reg No: <span className="font-semibold text-slate-700">{org.registrationNumber || "N/A"}</span> • Type: {org.businessType} ({org.countryOfRegistration})
                        </p>
                        <p className="text-xs text-slate-500">
                            Owner: <span className="font-medium text-slate-800">{org.owner?.firstName} {org.owner?.lastName}</span> ({org.contactEmail})
                        </p>
                    </div>
                </div>

                {/* Quick Actions */}
                <div className="flex flex-wrap items-center gap-2">
                    {org.status !== "ACTIVE" && (
                        <Button
                            size="sm"
                            onClick={() => updateOrgStatusMutation.mutate({ status: "ACTIVE", reason: "Admin manually activated organization" })}
                            disabled={updateOrgStatusMutation.isPending}
                            className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold gap-1.5"
                        >
                            <CheckCircle2 className="w-4 h-4" />
                            Activate Business
                        </Button>
                    )}

                    {org.status === "ACTIVE" && (
                        <Button
                            size="sm"
                            variant="outline"
                            onClick={() => updateOrgStatusMutation.mutate({ status: "SUSPENDED", reason: "Admin suspended organization" })}
                            disabled={updateOrgStatusMutation.isPending}
                            className="text-red-600 border-red-200 hover:bg-red-50 text-xs font-semibold gap-1.5"
                        >
                            <XCircle className="w-4 h-4" />
                            Suspend Business
                        </Button>
                    )}

                    {!org.bankAccount && (
                        <Button
                            size="sm"
                            onClick={() => provisionBankMutation.mutate()}
                            disabled={provisionBankMutation.isPending}
                            className="bg-[#012333] hover:bg-[#02354d] text-white text-xs font-semibold gap-1.5"
                        >
                            <Landmark className="w-4 h-4 text-[#C9A227]" />
                            Provision U.S. Bank Account
                        </Button>
                    )}
                </div>
            </div>

            {/* Grid layout */}
            <div className="grid grid-[#1fr] lg:grid-cols-3 gap-8">
                
                {/* Left 2 Columns: Main Details */}
                <div className="lg:col-span-2 space-y-8">

                    {/* Section 1: Business Profile & Qualification */}
                    <div className="bg-white p-6 rounded-2xl border shadow-sm space-y-6" style={{ borderColor: "#E1E3E6" }}>
                        <h2 className="text-base font-bold text-slate-900 border-b pb-3 flex items-center gap-2">
                            <Building2 className="w-4 h-4 text-[#C9A227]" />
                            Business Profile & Qualification Assessment
                        </h2>

                        <div className="grid grid-cols-2 gap-4 text-xs">
                            <div>
                                <span className="text-slate-400 block">Industry</span>
                                <span className="font-semibold text-slate-800">{org.industry || "N/A"}</span>
                            </div>
                            <div>
                                <span className="text-slate-400 block">Authorized Representative</span>
                                <span className="font-semibold text-slate-800">{org.authorizedRepName} ({org.authorizedRepTitle})</span>
                            </div>
                            <div>
                                <span className="text-slate-400 block">Business Address</span>
                                <span className="font-semibold text-slate-800">{org.businessAddress}, {org.city}, {org.country}</span>
                            </div>
                            <div>
                                <span className="text-slate-400 block">Contact Phone</span>
                                <span className="font-semibold text-slate-800">{org.contactPhone}</span>
                            </div>
                            {org.website && (
                                <div className="col-span-2">
                                    <span className="text-slate-400 block">Website</span>
                                    <a href={org.website} target="_blank" rel="noreferrer" className="text-blue-600 hover:underline flex items-center gap-1 font-medium">
                                        {org.website}
                                        <ExternalLink className="w-3 h-3" />
                                    </a>
                                </div>
                            )}
                        </div>

                        {/* Qualification Assessment Details */}
                        {org.qualification ? (
                            <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 text-xs space-y-3">
                                <div className="flex items-center justify-between">
                                    <span className="font-bold text-slate-800">Qualification Outcome:</span>
                                    <Badge className={
                                        org.qualification.outcome === "QUALIFIED" ? "bg-emerald-100 text-emerald-800" : "bg-amber-100 text-amber-800"
                                    }>
                                        {org.qualification.outcome} (Risk Score: {org.qualification.riskScore})
                                    </Badge>
                                </div>
                                <div className="grid grid-cols-2 gap-2 text-slate-600">
                                    <div><span className="font-medium text-slate-800">Expected Monthly Volume:</span> ${(org.qualification.answers?.expectedMonthlyVolume || 0).toLocaleString()}</div>
                                    <div><span className="font-medium text-slate-800">Payment Frequency:</span> {org.qualification.answers?.paymentFrequency || "N/A"}</div>
                                    <div><span className="font-medium text-slate-800">Target Countries:</span> {Array.isArray(org.qualification.answers?.targetCountries) ? org.qualification.answers?.targetCountries.join(", ") : "N/A"}</div>
                                    <div><span className="font-medium text-slate-800">Primary Use Case:</span> {org.qualification.answers?.primaryUseCase || "N/A"}</div>
                                </div>
                            </div>
                        ) : (
                            <div className="bg-amber-50 text-amber-800 p-3 rounded-lg text-xs font-medium border border-amber-200">
                                Qualification assessment has not been completed yet.
                            </div>
                        )}
                    </div>

                    {/* Section 2: Individual Identity Verification (KYC) */}
                    <div className="bg-white p-6 rounded-2xl border shadow-sm space-y-6" style={{ borderColor: "#E1E3E6" }}>
                        <div className="flex items-center justify-between border-b pb-3">
                            <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
                                <Shield className="w-4 h-4 text-blue-600" />
                                Individual Identity Verification (KYC)
                            </h2>
                            {latestKyc && (
                                <Badge className={
                                    latestKyc.status === "APPROVED" ? "bg-emerald-100 text-emerald-800" :
                                    latestKyc.status === "REJECTED" ? "bg-red-100 text-red-800" :
                                    "bg-amber-100 text-amber-800"
                                }>
                                    {latestKyc.status}
                                </Badge>
                            )}
                        </div>

                        {latestKyc ? (
                            <div className="space-y-4 text-xs">
                                <div className="flex items-center justify-between text-slate-500">
                                    <span>Submitted: {new Date(latestKyc.createdAt).toLocaleString()}</span>
                                    {latestKyc.reviewedAt && <span>Reviewed: {new Date(latestKyc.reviewedAt).toLocaleString()}</span>}
                                </div>

                                {/* Documents */}
                                <div>
                                    <h4 className="font-bold text-slate-800 mb-2">Uploaded Identity Documents:</h4>
                                    {latestKyc.documents?.length > 0 ? (
                                        <div className="space-y-2">
                                            {latestKyc.documents.map((doc) => (
                                                <div key={doc.id} className="flex items-center justify-between bg-slate-50 p-3 rounded-lg border border-slate-200">
                                                    <div className="flex items-center gap-2">
                                                        <FileText className="w-4 h-4 text-slate-500" />
                                                        <span className="font-semibold text-slate-800">{doc.documentType} ({doc.fileName})</span>
                                                    </div>
                                                    <a href={doc.fileUrl} target="_blank" rel="noreferrer" className="text-blue-600 hover:underline text-xs font-semibold flex items-center gap-1">
                                                        View Document
                                                        <ExternalLink className="w-3.5 h-3.5" />
                                                    </a>
                                                </div>
                                            ))}
                                        </div>
                                    ) : (
                                        <p className="text-slate-400 italic">No identity documents attached.</p>
                                    )}
                                </div>

                                {/* Admin Action Controls for KYC */}
                                <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-3">
                                    <h4 className="font-bold text-slate-800">Admin KYC Review Actions:</h4>
                                    <Textarea
                                        placeholder="Optional rejection reason or review note..."
                                        value={kycReason}
                                        onChange={(e) => setKycReason(e.target.value)}
                                        className="text-xs bg-white"
                                    />
                                    <div className="flex items-center gap-2">
                                        <Button
                                            size="sm"
                                            onClick={() => updateKycMutation.mutate({ kycRequestId: latestKyc.id, status: "APPROVED", note: kycReason })}
                                            disabled={updateKycMutation.isPending}
                                            className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold gap-1"
                                        >
                                            <Check className="w-3.5 h-3.5" />
                                            Approve KYC
                                        </Button>
                                        <Button
                                            size="sm"
                                            variant="outline"
                                            onClick={() => updateKycMutation.mutate({ kycRequestId: latestKyc.id, status: "REJECTED", reason: kycReason || "Identity documents do not match criteria." })}
                                            disabled={updateKycMutation.isPending}
                                            className="text-red-600 border-red-200 hover:bg-red-50 text-xs font-semibold gap-1"
                                        >
                                            <X className="w-3.5 h-3.5" />
                                            Reject KYC
                                        </Button>
                                    </div>
                                </div>
                            </div>
                        ) : (
                            <p className="text-xs text-slate-400 italic">No KYC application submitted yet.</p>
                        )}
                    </div>

                    {/* Section 3: Corporate Verification (KYB) */}
                    <div className="bg-white p-6 rounded-2xl border shadow-sm space-y-6" style={{ borderColor: "#E1E3E6" }}>
                        <div className="flex items-center justify-between border-b pb-3">
                            <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
                                <Users className="w-4 h-4 text-purple-600" />
                                Corporate Verification (KYB) & Beneficial Ownership
                            </h2>
                            {kyb && (
                                <Badge className={
                                    kyb.status === "APPROVED" ? "bg-emerald-100 text-emerald-800" :
                                    kyb.status === "REJECTED" ? "bg-red-100 text-red-800" :
                                    "bg-amber-100 text-amber-800"
                                }>
                                    {kyb.status}
                                </Badge>
                            )}
                        </div>

                        {kyb ? (
                            <div className="space-y-4 text-xs">
                                {/* Directors & UBOs */}
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="bg-slate-50 p-3 rounded-lg border border-slate-200">
                                        <h4 className="font-bold text-slate-800 mb-2">Directors ({kyb.directors?.length || 0}):</h4>
                                        {kyb.directors?.map((d: any, idx: number) => (
                                            <div key={idx} className="text-slate-700 py-0.5 border-b border-slate-200 last:border-0">
                                                • {d.fullName} ({d.nationality}) {d.isPEP && <span className="text-red-600 font-bold ml-1">[PEP]</span>}
                                            </div>
                                        ))}
                                    </div>
                                    <div className="bg-slate-50 p-3 rounded-lg border border-slate-200">
                                        <h4 className="font-bold text-slate-800 mb-2">Ultimate Beneficial Owners ({kyb.ubos?.length || 0}):</h4>
                                        {kyb.ubos?.map((u: any, idx: number) => (
                                            <div key={idx} className="text-slate-700 py-0.5 border-b border-slate-200 last:border-0">
                                                • {u.fullName} ({u.ownershipPercentage}% ownership)
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                {/* KYB Documents */}
                                <div>
                                    <h4 className="font-bold text-slate-800 mb-2">Uploaded Corporate Documents:</h4>
                                    {kyb.documents?.length > 0 ? (
                                        <div className="space-y-2">
                                            {kyb.documents.map((doc) => (
                                                <div key={doc.id} className="flex items-center justify-between bg-slate-50 p-3 rounded-lg border border-slate-200">
                                                    <div className="flex items-center gap-2">
                                                        <FileText className="w-4 h-4 text-purple-600" />
                                                        <span className="font-semibold text-slate-800">{doc.documentType} ({doc.fileName})</span>
                                                    </div>
                                                    <a href={doc.fileUrl} target="_blank" rel="noreferrer" className="text-blue-600 hover:underline text-xs font-semibold flex items-center gap-1">
                                                        View Document
                                                        <ExternalLink className="w-3.5 h-3.5" />
                                                    </a>
                                                </div>
                                            ))}
                                        </div>
                                    ) : (
                                        <p className="text-slate-400 italic">No corporate documents attached.</p>
                                    )}
                                </div>

                                {/* Admin Action Controls for KYB */}
                                <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-3">
                                    <h4 className="font-bold text-slate-800">Admin KYB Review Actions:</h4>
                                    <Textarea
                                        placeholder="Optional rejection reason or review note..."
                                        value={kybReason}
                                        onChange={(e) => setKybReason(e.target.value)}
                                        className="text-xs bg-white"
                                    />
                                    <div className="flex items-center gap-2">
                                        <Button
                                            size="sm"
                                            onClick={() => updateKybMutation.mutate({ kybRequestId: kyb.id, status: "APPROVED", note: kybReason })}
                                            disabled={updateKybMutation.isPending}
                                            className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold gap-1"
                                        >
                                            <Check className="w-3.5 h-3.5" />
                                            Approve KYB
                                        </Button>
                                        <Button
                                            size="sm"
                                            variant="outline"
                                            onClick={() => updateKybMutation.mutate({ kybRequestId: kyb.id, status: "REJECTED", reason: kybReason || "Corporate documents failed verification." })}
                                            disabled={updateKybMutation.isPending}
                                            className="text-red-600 border-red-200 hover:bg-red-50 text-xs font-semibold gap-1"
                                        >
                                            <X className="w-3.5 h-3.5" />
                                            Reject KYB
                                        </Button>
                                    </div>
                                </div>
                            </div>
                        ) : (
                            <p className="text-xs text-slate-400 italic">No KYB application submitted yet.</p>
                        )}
                    </div>
                </div>

                {/* Right Column: Managed Bank Account & Audit Trail */}
                <div className="space-y-8">
                    
                    {/* Managed U.S. Bank Account Details */}
                    <div className="bg-white p-6 rounded-2xl border shadow-sm space-y-4" style={{ borderColor: "#E1E3E6" }}>
                        <h2 className="text-base font-bold text-slate-900 border-b pb-3 flex items-center gap-2">
                            <Landmark className="w-4 h-4 text-[#C9A227]" />
                            Managed U.S. Bank Account
                        </h2>

                        {org.bankAccount ? (
                            <div className="space-y-3 text-xs">
                                <div className="bg-[#012333] text-white p-4 rounded-xl space-y-2 border border-slate-800">
                                    <div className="flex items-center justify-between">
                                        <span className="text-[10px] uppercase font-bold tracking-widest text-[#C9A227]">Managed U.S. Account</span>
                                        <Badge className="bg-emerald-500/20 text-emerald-400 border-emerald-500/30 text-[10px]">
                                            {org.bankAccount.status}
                                        </Badge>
                                    </div>
                                    <div className="font-mono text-sm font-bold tracking-wider">{org.bankAccount.bankName}</div>
                                    <div className="text-slate-300">Holder: {org.bankAccount.accountHolder}</div>
                                    <div className="pt-2 border-t border-slate-700/80 flex items-center justify-between font-mono">
                                        <div>
                                            <div className="text-[9px] text-slate-400">ACCOUNT NUMBER</div>
                                            <div className="font-bold text-white text-xs">{org.bankAccount.accountNumber}</div>
                                        </div>
                                        <div>
                                            <div className="text-[9px] text-slate-400">ROUTING NUMBER</div>
                                            <div className="font-bold text-white text-xs">{org.bankAccount.routingNumber}</div>
                                        </div>
                                    </div>
                                </div>

                                {/* Event timeline */}
                                <div className="space-y-2">
                                    <h4 className="font-bold text-slate-800">Account Event Audit Trail:</h4>
                                    {org.bankAccount.events?.map((evt: any) => (
                                        <div key={evt.id} className="bg-slate-50 p-2.5 rounded border border-slate-200 text-[11px] space-y-0.5">
                                            <div className="font-semibold text-slate-800">{evt.eventType}</div>
                                            <div className="text-slate-600">{evt.description}</div>
                                            <div className="text-[9px] text-slate-400">{new Date(evt.createdAt).toLocaleString()}</div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        ) : (
                            <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 text-center text-xs space-y-3">
                                <p className="text-slate-500">No managed U.S. bank account has been provisioned yet for this business.</p>
                                <Button
                                    size="sm"
                                    onClick={() => provisionBankMutation.mutate()}
                                    disabled={provisionBankMutation.isPending}
                                    className="bg-[#012333] hover:bg-[#02354d] text-white text-xs font-semibold gap-1"
                                >
                                    <Landmark className="w-3.5 h-3.5 text-[#C9A227]" />
                                    Provision FV Bank Account Now
                                </Button>
                            </div>
                        )}
                    </div>

                    {/* Status Audit Trail */}
                    <div className="bg-white p-6 rounded-2xl border shadow-sm space-y-4" style={{ borderColor: "#E1E3E6" }}>
                        <h2 className="text-base font-bold text-slate-900 border-b pb-3 flex items-center gap-2">
                            <Activity className="w-4 h-4 text-slate-600" />
                            Compliance Status Audit History
                        </h2>

                        {org.statusHistory?.length > 0 ? (
                            <div className="space-y-3 text-xs">
                                {org.statusHistory.map((hist: any) => (
                                    <div key={hist.id} className="bg-slate-50 p-3 rounded-lg border border-slate-200 space-y-1">
                                        <div className="flex items-center justify-between">
                                            <span className="font-bold text-slate-800">{hist.entityType}: {hist.toStatus}</span>
                                            <span className="text-[10px] text-slate-400">{new Date(hist.createdAt).toLocaleDateString()}</span>
                                        </div>
                                        {hist.reason && <div className="text-slate-600 text-[11px]">{hist.reason}</div>}
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <p className="text-xs text-slate-400 italic">No status history logged yet.</p>
                        )}
                    </div>

                </div>

            </div>
        </div>
    );
}

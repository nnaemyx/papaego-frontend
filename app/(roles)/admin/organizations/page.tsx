"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { adminOrganizationsApi, type OrganizationListItem } from "@/lib/api/admin-organizations";
import Link from "next/link";
import {
    Building2,
    Search,
    Shield,
    CheckCircle2,
    Clock,
    AlertCircle,
    FileText,
    ExternalLink,
    ChevronRight,
    UserCheck,
    Landmark,
    Filter
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

export default function AdminOrganizationsPage() {
    const [statusFilter, setStatusFilter] = useState<string>("ALL");
    const [searchQuery, setSearchQuery] = useState<string>("");

    const { data, isLoading, refetch } = useQuery({
        queryKey: ["admin-organizations", statusFilter, searchQuery],
        queryFn: () => adminOrganizationsApi.getOrganizations({ status: statusFilter, search: searchQuery })
    });

    const organizations = data?.organizations || [];

    const getStatusBadge = (status: string) => {
        switch (status) {
            case "ACTIVE":
                return <Badge className="bg-emerald-500/10 text-emerald-600 border-emerald-200">Active</Badge>;
            case "DRAFT":
                return <Badge className="bg-amber-500/10 text-amber-600 border-amber-200">Draft / Onboarding</Badge>;
            case "SUSPENDED":
                return <Badge className="bg-red-500/10 text-red-600 border-red-200">Suspended</Badge>;
            case "REJECTED":
                return <Badge className="bg-rose-500/10 text-rose-600 border-rose-200">Rejected</Badge>;
            default:
                return <Badge variant="outline">{status}</Badge>;
        }
    };

    const getComplianceBadge = (status: string, label: string) => {
        if (status === "APPROVED") return <span className="text-xs px-2 py-0.5 rounded bg-emerald-50 text-emerald-700 border border-emerald-200 font-medium">{label}: Approved</span>;
        if (status === "REJECTED") return <span className="text-xs px-2 py-0.5 rounded bg-red-50 text-red-700 border border-red-200 font-medium">{label}: Rejected</span>;
        if (status === "SUBMITTED" || status === "IN_REVIEW") return <span className="text-xs px-2 py-0.5 rounded bg-amber-50 text-amber-700 border border-amber-200 font-medium">{label}: In Review</span>;
        return <span className="text-xs px-2 py-0.5 rounded bg-slate-100 text-slate-600 border border-slate-200 font-medium">{label}: {status.replace("_", " ")}</span>;
    };

    return (
        <div className="p-8 space-y-8 font-sans max-w-7xl mx-auto">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b pb-6" style={{ borderColor: "#E1E3E6" }}>
                <div>
                    <div className="flex items-center gap-2">
                        <Building2 className="w-7 h-7" style={{ color: "#C9A227" }} />
                        <h1 className="text-2xl font-bold tracking-tight" style={{ color: "#012333" }}>
                            Business Organizations & Onboarding
                        </h1>
                    </div>
                    <p className="text-sm mt-1 text-slate-500">
                        Inspect registered businesses, review qualification questionnaires, approve KYC & KYB documents, and manage dedicated U.S. bank accounts.
                    </p>
                </div>

                <div className="flex items-center gap-3">
                    <Badge variant="outline" className="px-3 py-1.5 text-xs font-semibold bg-white">
                        Total Registered: {data?.total || 0}
                    </Badge>
                </div>
            </div>

            {/* Filters and Search Bar */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-white p-4 rounded-xl border shadow-sm" style={{ borderColor: "#E1E3E6" }}>
                {/* Search */}
                <div className="relative w-full sm:w-80">
                    <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                    <Input
                        placeholder="Search business, email, reg no..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="pl-9 bg-slate-50 border-slate-200 focus:bg-white text-sm"
                    />
                </div>

                {/* Status Tabs */}
                <div className="flex items-center gap-1.5 w-full sm:w-auto overflow-x-auto pb-1 sm:pb-0">
                    {["ALL", "DRAFT", "ACTIVE", "SUSPENDED", "REJECTED"].map((tab) => (
                        <button
                            key={tab}
                            onClick={() => setStatusFilter(tab)}
                            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors whitespace-nowrap ${
                                statusFilter === tab
                                    ? "bg-[#012333] text-white shadow-sm"
                                    : "text-slate-600 hover:bg-slate-100"
                            }`}
                        >
                            {tab === "ALL" ? "All Businesses" : tab.charAt(0) + tab.slice(1).toLowerCase()}
                        </button>
                    ))}
                </div>
            </div>

            {/* Organizations List */}
            {isLoading ? (
                <div className="bg-white p-12 rounded-xl border text-center text-slate-500" style={{ borderColor: "#E1E3E6" }}>
                    <Clock className="w-8 h-8 animate-spin mx-auto mb-2 text-amber-500" />
                    Loading registered business organizations...
                </div>
            ) : organizations.length === 0 ? (
                <div className="bg-white p-12 rounded-xl border text-center" style={{ borderColor: "#E1E3E6" }}>
                    <Building2 className="w-12 h-12 mx-auto mb-3 text-slate-300" />
                    <h3 className="text-base font-semibold text-slate-800">No organizations found</h3>
                    <p className="text-sm text-slate-500 max-w-sm mx-auto mt-1">
                        There are currently no registered business organizations matching your filter.
                    </p>
                </div>
            ) : (
                <div className="bg-white border rounded-xl shadow-sm overflow-hidden" style={{ borderColor: "#E1E3E6" }}>
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse text-sm">
                            <thead>
                                <tr className="border-b bg-slate-50/80 text-xs font-semibold uppercase tracking-wider text-slate-500" style={{ borderColor: "#E1E3E6" }}>
                                    <th className="p-4">Organization & Owner</th>
                                    <th className="p-4">Reg No. & Type</th>
                                    <th className="p-4">Qualification</th>
                                    <th className="p-4">KYC & KYB Status</th>
                                    <th className="p-4">Managed U.S. Account</th>
                                    <th className="p-4">Status</th>
                                    <th className="p-4 text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                                {organizations.map((org: OrganizationListItem) => (
                                    <tr key={org.id} className="hover:bg-slate-50/50 transition-colors">
                                        <td className="p-4">
                                            <div className="font-bold text-slate-900">{org.businessName}</div>
                                            <div className="text-xs text-slate-500 mt-0.5">
                                                Owner: {org.owner?.firstName} {org.owner?.lastName} ({org.contactEmail})
                                            </div>
                                        </td>
                                        <td className="p-4">
                                            <div className="text-xs font-medium text-slate-800">{org.registrationNumber || "N/A"}</div>
                                            <div className="text-xs text-slate-500">{org.businessType} • {org.countryOfRegistration}</div>
                                        </td>
                                        <td className="p-4">
                                            <span className={`text-xs px-2 py-0.5 rounded font-semibold ${
                                                org.qualificationOutcome === "QUALIFIED" ? "bg-emerald-100 text-emerald-800" :
                                                org.qualificationOutcome === "NEEDS_REVIEW" ? "bg-amber-100 text-amber-800" :
                                                "bg-slate-100 text-slate-600"
                                            }`}>
                                                {org.qualificationOutcome}
                                            </span>
                                        </td>
                                        <td className="p-4 space-y-1">
                                            <div>{getComplianceBadge(org.kycStatus, "KYC")}</div>
                                            <div>{getComplianceBadge(org.kybStatus, "KYB")}</div>
                                        </td>
                                        <td className="p-4">
                                            {org.hasBankAccount ? (
                                                <span className="inline-flex items-center gap-1 text-xs font-medium text-emerald-700 bg-emerald-50 px-2 py-1 rounded border border-emerald-200">
                                                    <Landmark className="w-3.5 h-3.5" />
                                                    Provisioned ({org.bankAccountStatus})
                                                </span>
                                            ) : (
                                                <span className="text-xs text-slate-400">Not Provisioned</span>
                                            )}
                                        </td>
                                        <td className="p-4">
                                            {getStatusBadge(org.status)}
                                        </td>
                                        <td className="p-4 text-right">
                                            <Link href={`/admin/organizations/${org.id}`}>
                                                <Button size="sm" variant="outline" className="text-xs font-medium gap-1 hover:bg-[#012333] hover:text-white">
                                                    View Details
                                                    <ChevronRight className="w-3.5 h-3.5" />
                                                </Button>
                                            </Link>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}
        </div>
    );
}

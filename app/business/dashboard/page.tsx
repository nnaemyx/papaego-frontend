"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import {
    Bell, LogOut, Settings, ChevronRight, Building2, Shield,
    Rocket, FileText, Users, ArrowUpRight, AlertCircle
} from "lucide-react";
import { toast } from "sonner";
import { useAuthStore } from "@/store/auth-store";
import { useOnboardingStore } from "@/store/onboarding-store";
import { organizationsApi, type Organization } from "@/lib/api/organizations";
import ComplianceStatusDashboard from "@/components/business/ComplianceStatusDashboard";

export default function BusinessDashboardPage() {
    const router = useRouter();
    const { user, isAuthenticated, logout } = useAuthStore();
    const { reset: resetOnboarding } = useOnboardingStore();
    const [org, setOrg] = useState<Organization | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        if (!isAuthenticated) {
            router.push("/business/auth/signin");
            return;
        }
        fetchOrg();
    }, [isAuthenticated]);

    const fetchOrg = async () => {
        try {
            const res = await organizationsApi.getMyOrganization();
            setOrg(res.organization);
        } catch {
            setOrg(null);
        } finally {
            setIsLoading(false);
        }
    };

    const handleLogout = () => {
        logout();
        resetOnboarding();
        router.push("/business/auth/signin");
        toast.success("Signed out successfully.");
    };

    if (!isAuthenticated) return null;

    return (
        <div className="min-h-screen font-sans" style={{ backgroundColor: "#F7F8F9" }}>
            {/* Top Navigation */}
            <nav className="bg-white border-b px-6 py-4 flex items-center gap-4 sticky top-0 z-40" style={{ borderColor: "#E1E3E6" }}>
                <div className="flex items-center gap-3">
                    <Link href="/">
                        <Image
                            src="/images/logo.png"
                            alt="PapaEgo"
                            width={160}
                            height={36}
                            className="h-8 w-auto"
                            priority
                        />
                    </Link>
                </div>

                {org && (
                    <div className="hidden md:flex items-center gap-2 ml-2 px-3 py-1 rounded-full text-xs font-semibold"
                        style={{ backgroundColor: "#FFF7E6", border: "1px solid #F0CD00" }}>
                        <Building2 className="w-3.5 h-3.5 text-[#C9A227]" />
                        <span style={{ color: "#012333" }}>{org.businessName}</span>
                        <OrgStatusPill status={org.status} />
                    </div>
                )}

                <div className="ml-auto flex items-center gap-3">
                    <button className="w-9 h-9 rounded-xl bg-gray-50 border border-gray-200 flex items-center justify-center text-gray-500 hover:text-gray-700 transition-all">
                        <Bell className="w-4 h-4" />
                    </button>
                    <div className="w-9 h-9 rounded-xl flex items-center justify-center font-bold text-sm"
                        style={{ backgroundColor: "#FFF7E6", border: "1px solid #F0CD00", color: "#C9A227" }}>
                        {user?.firstName?.[0]?.toUpperCase() || user?.email?.[0]?.toUpperCase() || "U"}
                    </div>
                    <button onClick={handleLogout}
                        className="hidden sm:flex items-center gap-1.5 text-xs text-gray-500 hover:text-gray-800 transition-colors font-medium">
                        <LogOut className="w-3.5 h-3.5" />
                        Sign out
                    </button>
                </div>
            </nav>

            <div className="max-w-5xl mx-auto px-6 py-10">
                {/* Welcome header */}
                <div className="mb-8">
                    <h1 className="text-2xl font-bold mb-1" style={{ color: "#012333" }}>
                        Welcome{user?.firstName ? `, ${user.firstName}` : ""}
                    </h1>
                    <p className="text-sm" style={{ color: "#6B7078" }}>
                        {org
                            ? `Manage your organization and track compliance verification for ${org.businessName}.`
                            : "Complete your onboarding to access all platform features."
                        }
                    </p>
                </div>

                {isLoading ? (
                    <DashboardSkeleton />
                ) : !org ? (
                    <NoOrgState />
                ) : (
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                        {/* Main: Compliance Status */}
                        <div className="lg:col-span-2 space-y-6">
                            <div>
                                <div className="flex items-center justify-between mb-5">
                                    <h2 className="text-base font-bold flex items-center gap-2" style={{ color: "#012333" }}>
                                        <Shield className="w-4 h-4 text-[#C9A227]" />
                                        Compliance Status
                                    </h2>
                                </div>
                                <ComplianceStatusDashboard organizationId={org.id} />
                            </div>
                        </div>

                        {/* Sidebar */}
                        <div className="space-y-5">
                            {/* Organization card */}
                            <div className="bg-white border rounded-2xl p-5 shadow-sm" style={{ borderColor: "#E1E3E6" }}>
                                <div className="flex items-center gap-3 mb-4">
                                    <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0"
                                        style={{ backgroundColor: "#FFF7E6", border: "1px solid #F0CD00" }}>
                                        <Building2 className="w-5 h-5 text-[#C9A227]" />
                                    </div>
                                    <div className="min-w-0">
                                        <p className="font-bold text-sm truncate" style={{ color: "#012333" }}>{org.businessName}</p>
                                        <p className="text-xs" style={{ color: "#6B7078" }}>{org.businessType.replace(/_/g, " ")}</p>
                                    </div>
                                </div>
                                <div className="space-y-2 text-xs">
                                    <DataRow label="Country" value={org.country} />
                                    <DataRow label="Industry" value={org.industry} />
                                    <DataRow label="Registration" value={org.registrationNumber || "N/A"} />
                                    <DataRow label="Rep." value={org.authorizedRepName} />
                                </div>
                                <Link href={`/business/organization/${org.id}`}
                                    className="flex items-center gap-1.5 mt-4 text-xs font-semibold transition-colors" style={{ color: "#C9A227" }}>
                                    View details <ArrowUpRight className="w-3 h-3" />
                                </Link>
                            </div>

                            {/* Quick actions */}
                            <div className="bg-white border rounded-2xl p-5 shadow-sm" style={{ borderColor: "#E1E3E6" }}>
                                <p className="text-xs font-bold uppercase tracking-wider mb-4" style={{ color: "#6B7078" }}>Quick Actions</p>
                                <div className="space-y-2">
                                    {org.status === "ACTIVE" && (
                                        <QuickAction
                                            icon={<Rocket className="w-4 h-4 text-emerald-600" />}
                                            label="Set Up Managed Account"
                                            description="Sprint 2 — Coming soon"
                                            disabled
                                        />
                                    )}
                                    <QuickAction
                                        icon={<FileText className="w-4 h-4 text-[#C9A227]" />}
                                        label="Upload Documents"
                                        description="Add supporting documents"
                                        href="/business/documents"
                                    />
                                    <QuickAction
                                        icon={<Users className="w-4 h-4 text-blue-600" />}
                                        label="Invite Team Members"
                                        description="Add your team to the org"
                                        href={`/business/organization/${org.id}/members`}
                                        disabled={org.status !== "ACTIVE"}
                                    />
                                    <QuickAction
                                        icon={<Settings className="w-4 h-4 text-gray-500" />}
                                        label="Organization Settings"
                                        description="Update your details"
                                        href={`/business/organization/${org.id}`}
                                    />
                                </div>
                            </div>

                            {/* Need help */}
                            <div className="p-5 rounded-2xl border" style={{ backgroundColor: "#FFF7E6", borderColor: "#F0CD00" }}>
                                <p className="font-bold text-sm mb-1" style={{ color: "#012333" }}>Need help?</p>
                                <p className="text-xs mb-4 leading-relaxed" style={{ color: "#856404" }}>
                                    Our compliance team is available to assist you through the verification process.
                                </p>
                                <a href="mailto:compliance@papaego.com"
                                    className="flex items-center gap-1.5 text-xs font-bold transition-colors" style={{ color: "#C9A227" }}>
                                    Contact Support <ArrowUpRight className="w-3 h-3" />
                                </a>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}

function OrgStatusPill({ status }: { status: string }) {
    const colors: Record<string, string> = {
        DRAFT: "text-gray-500",
        ACTIVE: "text-emerald-700 font-bold",
        SUSPENDED: "text-amber-700 font-bold",
        REJECTED: "text-red-700 font-bold"
    };
    return (
        <span className={`text-xs ${colors[status] || "text-gray-500"}`}>
            • {status}
        </span>
    );
}

function DataRow({ label, value }: { label: string; value: string }) {
    return (
        <div className="flex items-center justify-between gap-2">
            <span style={{ color: "#6B7078" }}>{label}</span>
            <span className="font-semibold text-right truncate max-w-[60%]" style={{ color: "#012333" }}>{value}</span>
        </div>
    );
}

function QuickAction({ icon, label, description, href, disabled }: {
    icon: React.ReactNode;
    label: string;
    description: string;
    href?: string;
    disabled?: boolean;
}) {
    const cls = `flex items-center gap-3 p-3 rounded-xl border transition-all group ${
        disabled
            ? "border-gray-200 bg-gray-50 opacity-50 cursor-not-allowed"
            : "border-[#E1E3E6] bg-white hover:border-[#C9A227] hover:bg-[#FFF7E6]/40 cursor-pointer"
    }`;

    const content = (
        <>
            <div className="w-8 h-8 rounded-lg bg-gray-100 flex items-center justify-center shrink-0">
                {icon}
            </div>
            <div className="flex-1 min-w-0">
                <p className="text-xs font-bold truncate" style={{ color: "#012333" }}>{label}</p>
                <p className="text-xs" style={{ color: "#6B7078" }}>{description}</p>
            </div>
            {!disabled && <ChevronRight className="w-3.5 h-3.5 text-gray-400 group-hover:text-[#C9A227] transition-colors shrink-0" />}
        </>
    );

    if (href && !disabled) {
        return <Link href={href} className={cls}>{content}</Link>;
    }
    return <div className={cls}>{content}</div>;
}

function NoOrgState() {
    return (
        <div className="flex flex-col items-center text-center py-16 max-w-md mx-auto">
            <div className="w-16 h-16 rounded-2xl flex items-center justify-center mb-5"
                style={{ backgroundColor: "#FFF7E6", border: "1px solid #F0CD00" }}>
                <AlertCircle className="w-8 h-8 text-[#C9A227]" />
            </div>
            <h2 className="text-xl font-bold mb-2" style={{ color: "#012333" }}>Complete your onboarding</h2>
            <p className="text-sm mb-8 leading-relaxed" style={{ color: "#6B7078" }}>
                You haven&apos;t set up your organization yet. Complete the onboarding wizard to register your business and begin compliance verification.
            </p>
            <Link href="/business/onboarding"
                className="flex items-center gap-2 text-white font-semibold px-8 py-3.5 rounded-xl transition-all shadow-sm"
                style={{ backgroundColor: "#C9A227" }}>
                Start Onboarding
                <ChevronRight className="w-4 h-4" />
            </Link>
        </div>
    );
}

function DashboardSkeleton() {
    return (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-4">
                {[1, 2, 3].map(i => (
                    <div key={i} className="h-28 bg-white rounded-2xl border border-gray-200 animate-pulse" />
                ))}
            </div>
            <div className="space-y-4">
                {[1, 2].map(i => (
                    <div key={i} className="h-40 bg-white rounded-2xl border border-gray-200 animate-pulse" />
                ))}
            </div>
        </div>
    );
}

"use client";

import { useCallback, useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import Link from "next/link";
import {
    Building2, Shield, Rocket, FileText, Users, ChevronRight,
    Wallet, Send, Copy, Check, RefreshCw, Landmark, TrendingUp, Download
} from "lucide-react";
import { toast } from "sonner";
import { useAuthStore } from "@/store/auth-store";
import { useOnboardingStore } from "@/store/onboarding-store";
import { organizationsApi, type Organization } from "@/lib/api/organizations";
import { getBankingProfile, type BankingProfile } from "@/lib/api/banking";
import { customerApi, type CustomerTrade, type FxRate } from "@/lib/api/customer";
import ComplianceStatusDashboard from "@/components/business/ComplianceStatusDashboard";
import { NewTransactionModal } from "@/components/customer/NewTransactionModal";
import { PapaEgoFundModal } from "@/components/customer/PapaEgoFundModal";
import { CustomerTradeItem } from "@/components/customer/CustomerTradeItem";
import { ExchangeRateCarousel } from "@/components/customer/ExchangeRateCarousel";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

export default function MergedBusinessCustomerDashboard() {
    const router = useRouter();
    const pathname = usePathname();
    const { user, isAuthenticated, logout } = useAuthStore();
    const { reset: resetOnboarding } = useOnboardingStore();

    const [org, setOrg] = useState<Organization | null>(null);
    const [bankingProfile, setBankingProfile] = useState<BankingProfile | null>(null);
    const [trades, setTrades] = useState<CustomerTrade[]>([]);
    const [rates, setRates] = useState<FxRate[]>([]);
    const [ledgerBalance, setLedgerBalance] = useState<{ available: number; reserved: number }>({ available: 0, reserved: 0 });
    const [isLoading, setIsLoading] = useState(true);

    const [copiedAcc, setCopiedAcc] = useState(false);
    const [copiedRoute, setCopiedRoute] = useState(false);
    const [showNewTradeModal, setShowNewTradeModal] = useState(false);
    const [showFundModal, setShowFundModal] = useState(false);

    const fetchDashboardData = useCallback(async () => {
        setIsLoading(true);
        try {
            const orgRes = await organizationsApi.getMyOrganization().catch(() => null);
            if (orgRes?.organization) {
                setOrg(orgRes.organization);
            }

            const bankRes = await getBankingProfile().catch(() => null);
            if (bankRes?.profile) {
                setBankingProfile(bankRes.profile);
            }

            const [tradesRes, ratesRes] = await Promise.all([
                customerApi.getTrades({ limit: 5 }).catch(() => ({ trades: [] })),
                customerApi.getFxRates().catch(() => ({ rates: [] }))
            ]);

            setTrades(tradesRes.trades || []);
            setRates(ratesRes.rates || []);

            const statsRes = await customerApi.getDashboardStats().catch(() => null);
            if (statsRes) {
                setLedgerBalance({
                    available: (statsRes as any).availableBalance || 0,
                    reserved: (statsRes as any).reservedBalance || 0
                });
            }
        } catch (err: any) {
            console.error("Dashboard data load error:", err);
        } finally {
            setIsLoading(false);
        }
    }, []);

    // This component is shared between the legacy /business/dashboard route and the
    // canonical /customer/dashboard route. When accessed via the legacy path we
    // redirect; when already on the canonical path we load the dashboard data so
    // the wallet/ledger balance is populated (otherwise it stays at 0).
    useEffect(() => {
        if (pathname === "/business/dashboard") {
            router.replace("/customer/dashboard");
            return;
        }
        if (isAuthenticated) {
            fetchDashboardData();
        }
    }, [pathname, isAuthenticated, router, fetchDashboardData]);

    const handleCopy = (text: string, type: "acc" | "route") => {
        navigator.clipboard.writeText(text);
        if (type === "acc") {
            setCopiedAcc(true);
            setTimeout(() => setCopiedAcc(false), 2000);
        } else {
            setCopiedRoute(true);
            setTimeout(() => setCopiedRoute(false), 2000);
        }
        toast.success("Copied to clipboard!");
    };

    if (!isAuthenticated) return null;

    return (
        <div className="p-6 md:p-8 space-y-8 max-w-7xl mx-auto font-sans">

            {/* Header Action Row */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-6 rounded-2xl border shadow-sm" style={{ borderColor: "#E1E3E6" }}>
                <div>
                    <h1 className="text-2xl font-bold mb-1" style={{ color: "#012333" }}>
                        Welcome{user?.firstName ? `, ${user.firstName}` : ""} 👋
                    </h1>
                    <p className="text-xs md:text-sm text-slate-500">
                        {org
                            ? `Authenticated business account for ${org.businessName}. Manage funding, initiate trades, and view your FV Bank details.`
                            : "Complete your onboarding to activate your business bank account and trade features."
                        }
                    </p>
                </div>

                <div className="flex items-center gap-3 shrink-0">
                    <Button
                        size="sm"
                        onClick={() => setShowNewTradeModal(true)}
                        className="bg-[#C9A227] hover:bg-[#b08e20] text-white text-xs font-bold gap-1.5 shadow-sm px-4 py-2"
                    >
                        <Send className="w-4 h-4" />
                        Initiate Trade
                    </Button>

                    <button
                        onClick={fetchDashboardData}
                        className="p-2 rounded-xl bg-gray-50 border border-gray-200 text-gray-500 hover:text-gray-700 transition-all"
                        title="Refresh"
                    >
                        <RefreshCw className="w-4 h-4" />
                    </button>
                </div>
            </div>

            {/* Top Financial Cards Row: Clean 2-Column Grid Layout (No Overlapping) */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-stretch">

                {/* Card 1: Available Ledger Balance & Trade Actions */}
                <div className="bg-white p-6 rounded-2xl border shadow-sm flex flex-col justify-between space-y-6" style={{ borderColor: "#E1E3E6" }}>
                    <div>
                        <div className="flex items-center justify-between mb-3">
                            <span className="text-xs font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
                                <Wallet className="w-4 h-4 text-emerald-600" />
                                Available Ledger Balance
                            </span>
                            <Badge variant="outline" className="text-[10px] text-slate-600 bg-slate-50">Live Wallet</Badge>
                        </div>
                        <div className="text-3xl font-extrabold text-slate-900 tracking-tight">
                            ₦{ledgerBalance.available.toLocaleString("en-NG", { minimumFractionDigits: 2 })}
                        </div>
                        {ledgerBalance.reserved > 0 && (
                            <p className="text-xs text-amber-600 mt-1.5 font-medium">
                                • ₦{ledgerBalance.reserved.toLocaleString()} reserved for active trades
                            </p>
                        )}
                    </div>

                    <div className="pt-4 border-t border-slate-100 grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <Button
                            size="sm"
                            variant="outline"
                            onClick={() => router.push('/customer/wallet')}
                            className="w-full text-xs font-bold gap-1.5 border-slate-300 hover:bg-slate-50 py-2.5"
                        >
                            <Download className="w-3.5 h-3.5 text-blue-600" />
                            Fund Ledger Balance
                        </Button>

                        <Button
                            size="sm"
                            onClick={() => setShowNewTradeModal(true)}
                            className="w-full text-xs font-bold gap-1.5 bg-[#012333] hover:bg-[#02354d] text-white py-2.5 shadow-sm"
                        >
                            <Send className="w-3.5 h-3.5 text-[#C9A227]" />
                            Send Money / Trade
                        </Button>
                    </div>
                </div>

                {/* Card 2: Dedicated Managed FV Bank U.S. Account Details */}
                <div className="bg-[#012333] text-white p-6 rounded-2xl border shadow-sm flex flex-col justify-between space-y-4 relative overflow-hidden" style={{ borderColor: "#02354d" }}>
                    <div>
                        <div className="flex items-center justify-between mb-4">
                            <span className="text-xs font-bold uppercase tracking-wider text-[#C9A227] flex items-center gap-1.5">
                                <Landmark className="w-4 h-4" />
                                Dedicated FV Bank U.S. Account
                            </span>
                            <Badge className={
                                bankingProfile?.status === "ACTIVE"
                                    ? "bg-emerald-500/20 text-emerald-400 border-emerald-500/30 text-[10px]"
                                    : "bg-amber-500/20 text-amber-300 border-amber-500/30 text-[10px]"
                            }>
                                {bankingProfile?.status || (org?.status === "ACTIVE" ? "ACTIVE" : "PENDING")}
                            </Badge>
                        </div>

                        {bankingProfile ? (
                            <div className="space-y-3">
                                <div className="text-xs text-slate-300">Account Holder: <span className="font-semibold text-white">{bankingProfile.accountHolder}</span></div>
                                <div className="grid grid-cols-2 gap-4 pt-3 border-t border-slate-700/80">
                                    <div>
                                        <div className="text-[10px] uppercase tracking-wider text-slate-400">Account Number</div>
                                        <div className="font-mono text-sm font-bold text-white flex items-center gap-1.5 mt-1">
                                            {bankingProfile.accountNumber}
                                            <button onClick={() => handleCopy(bankingProfile.accountNumber, "acc")} className="text-slate-400 hover:text-[#C9A227] transition-colors">
                                                {copiedAcc ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                                            </button>
                                        </div>
                                    </div>
                                    <div>
                                        <div className="text-[10px] uppercase tracking-wider text-slate-400">Routing Number</div>
                                        <div className="font-mono text-sm font-bold text-white flex items-center gap-1.5 mt-1">
                                            {bankingProfile.routingNumber}
                                            <button onClick={() => handleCopy(bankingProfile.routingNumber, "route")} className="text-slate-400 hover:text-[#C9A227] transition-colors">
                                                {copiedRoute ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ) : (
                            <div className="text-xs text-slate-300 space-y-2 py-2">
                                <p>Your business onboarding compliance is being verified by FV Bank.</p>
                                <p className="text-[11px] text-amber-300">Routing & Account Numbers will be generated upon approval.</p>
                            </div>
                        )}
                    </div>

                    <div className="pt-3 flex items-center justify-between text-[11px] text-slate-400 border-t border-slate-800">
                        <span>Bank: FV Bank (San Juan, PR, USA)</span>
                        <span>Currency: USD</span>
                    </div>
                </div>

            </div>

            {/* Live FX Exchange Rates Carousel */}
            <div className="bg-white p-6 rounded-2xl border shadow-sm space-y-4" style={{ borderColor: "#E1E3E6" }}>
                <div className="flex items-center justify-between border-b pb-3">
                    <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                        <TrendingUp className="w-4 h-4 text-[#C9A227]" />
                        Live FX Exchange Rates
                    </h2>
                    <span className="text-xs text-slate-500">Updated Real-Time</span>
                </div>
                <ExchangeRateCarousel rates={rates} />
            </div>

            {/* Main Content Layout */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

                {/* Left 2 Columns */}
                <div className="lg:col-span-2 space-y-8">

                    {/* Recent Trades / Transactions Section */}
                    <div className="bg-white p-6 rounded-2xl border shadow-sm space-y-4" style={{ borderColor: "#E1E3E6" }}>
                        <div className="flex items-center justify-between border-b pb-3">
                            <div>
                                <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
                                    <Send className="w-4 h-4 text-emerald-600" />
                                    My Trades & Cross-Border Payments
                                </h2>
                                <p className="text-xs text-slate-500">Track active and completed trades to international suppliers</p>
                            </div>

                            <Button
                                size="sm"
                                onClick={() => setShowNewTradeModal(true)}
                                className="bg-[#C9A227] hover:bg-[#b08e20] text-white text-xs font-semibold gap-1"
                            >
                                + New Trade
                            </Button>
                        </div>

                        {trades.length === 0 ? (
                            <div className="text-center py-10 space-y-3">
                                <FileText className="w-10 h-10 mx-auto text-slate-300" />
                                <p className="text-xs text-slate-500">No trades initiated yet. Click below to start your first cross-border trade.</p>
                                <Button
                                    size="sm"
                                    onClick={() => setShowNewTradeModal(true)}
                                    className="bg-[#012333] hover:bg-[#02354d] text-white text-xs font-semibold"
                                >
                                    Initiate Supplier Trade
                                </Button>
                            </div>
                        ) : (
                            <div className="divide-y divide-slate-100">
                                {trades.map((trade) => (
                                    <CustomerTradeItem
                                        key={trade.id}
                                        trade={trade}
                                    />
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Compliance & Onboarding Status */}
                    {org && (
                        <div className="bg-white p-6 rounded-2xl border shadow-sm space-y-4" style={{ borderColor: "#E1E3E6" }}>
                            <div className="flex items-center justify-between border-b pb-3">
                                <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
                                    <Shield className="w-4 h-4 text-[#C9A227]" />
                                    Business Verification & Compliance Status
                                </h2>
                            </div>
                            <ComplianceStatusDashboard organizationId={org.id} />
                        </div>
                    )}

                </div>

                {/* Right Column */}
                <div className="space-y-6">

                    {/* Org Details Card */}
                    {org && (
                        <div className="bg-white border rounded-2xl p-5 shadow-sm space-y-4" style={{ borderColor: "#E1E3E6" }}>
                            <div className="flex items-center gap-3 border-b pb-3">
                                <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0"
                                    style={{ backgroundColor: "#FFF7E6", border: "1px solid #F0CD00" }}>
                                    <Building2 className="w-5 h-5 text-[#C9A227]" />
                                </div>
                                <div className="min-w-0">
                                    <p className="font-bold text-sm truncate" style={{ color: "#012333" }}>{org.businessName}</p>
                                    <p className="text-xs text-slate-500">{org.businessType?.replace(/_/g, " ")}</p>
                                </div>
                            </div>
                            <div className="space-y-2 text-xs">
                                <DataRow label="Country" value={org.country} />
                                <DataRow label="Industry" value={org.industry} />
                                <DataRow label="Registration" value={org.registrationNumber || "N/A"} />
                                <DataRow label="Rep." value={org.authorizedRepName} />
                            </div>
                        </div>
                    )}

                    {/* Quick Actions */}
                    <div className="bg-[#012333] text-white rounded-2xl p-5 shadow-sm space-y-3">
                        <p className="text-xs font-bold uppercase tracking-wider text-[#C9A227]">Quick Actions</p>
                        <div className="space-y-2">
                            <QuickAction
                                icon={<Send className="w-4 h-4 text-emerald-400" />}
                                label="Initiate Trade / Send Money"
                                description="Pay overseas supplier"
                                onClick={() => setShowNewTradeModal(true)}
                            />
                            <QuickAction
                                icon={<Download className="w-4 h-4 text-blue-400" />}
                                label="Fund Ledger Account"
                                description="Get PapaEgo bank details"
                                href="/customer/wallet"
                            />
                            <QuickAction
                                icon={<Rocket className="w-4 h-4 text-[#C9A227]" />}
                                label="Managed Banking Setup"
                                description="View FV Bank status"
                                href="/customer/banking"
                            />
                        </div>
                    </div>

                </div>

            </div>

            {/* Trade Modal */}
            {showNewTradeModal && (
                <NewTransactionModal
                    onClose={() => {
                        setShowNewTradeModal(false);
                        fetchDashboardData();
                    }}
                />
            )}

            {/* Fund Ledger Account Modal */}
            <PapaEgoFundModal
                isOpen={showFundModal}
                onClose={() => setShowFundModal(false)}
            />
        </div>
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

function QuickAction({ icon, label, description, href, onClick }: {
    icon: React.ReactNode;
    label: string;
    description: string;
    href?: string;
    onClick?: () => void;
}) {
    const cls = "flex items-center gap-3 p-3 rounded-xl border border-slate-700 bg-slate-800/80 hover:bg-slate-800 hover:border-[#C9A227] cursor-pointer transition-all group";

    const content = (
        <>
            <div className="w-8 h-8 rounded-lg bg-slate-700 flex items-center justify-center shrink-0">
                {icon}
            </div>
            <div className="flex-1 min-w-0">
                <p className="text-xs font-bold truncate text-white">{label}</p>
                <p className="text-xs text-slate-400">{description}</p>
            </div>
            <ChevronRight className="w-3.5 h-3.5 text-slate-400 group-hover:text-[#C9A227] transition-colors shrink-0" />
        </>
    );

    if (href) {
        return <Link href={href} className={cls}>{content}</Link>;
    }
    return <div onClick={onClick} className={cls}>{content}</div>;
}

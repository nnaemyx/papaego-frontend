"use client";

import { useState, use } from "react";
import { useQuery } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import {
    ArrowLeft,
    Building2,
    Copy,
    Check,
    ExternalLink,
    ShieldCheck,
    Mail,
    Phone,
    MapPin,
    Wallet,
    ChevronDown,
    Plus,
    Edit3,
    ArrowDownLeft,
    ArrowUpRight,
    Clock,
    UserCheck,
    FileText,
} from "lucide-react";
import { adminCustomersApi } from "@/lib/api/customers";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import Link from "next/link";

export default function AdminCustomerTreasuryDetailPage({
    params,
}: {
    params: Promise<{ id: string }>;
}) {
    const { id } = use(params);
    const router = useRouter();

    const [copiedField, setCopiedField] = useState<string | null>(null);

    const { data: customer, isLoading } = useQuery({
        queryKey: ["admin-customer", id],
        queryFn: () => adminCustomersApi.getCustomer(id),
    });

    const handleCopy = (text: string, field: string) => {
        navigator.clipboard.writeText(text);
        setCopiedField(field);
        toast.success(`Copied ${field} to clipboard`);
        setTimeout(() => setCopiedField(null), 2000);
    };

    if (isLoading) {
        return (
            <div className="p-8 space-y-4 max-w-7xl mx-auto" style={{ backgroundColor: "#F7F8F9", minHeight: "100vh" }}>
                <div className="h-8 bg-gray-200 rounded w-48 animate-pulse" />
                <div className="h-32 bg-gray-200 rounded animate-pulse" />
                <div className="h-96 bg-gray-200 rounded animate-pulse" />
            </div>
        );
    }

    if (!customer) {
        return (
            <div className="p-8 text-center" style={{ backgroundColor: "#F7F8F9", minHeight: "100vh" }}>
                <p className="text-slate-500">Customer not found.</p>
                <Button onClick={() => router.push("/admin/customers")} variant="outline" className="mt-4">
                    Back to Customers
                </Button>
            </div>
        );
    }

    const entityName = customer.companyName || customer.name || customer.fullName || "Customer";
    const entityId = customer.customerId || `PE-${customer.id?.slice(0, 6).toUpperCase()}`;
    const availableBalanceNum = parseFloat(customer.availableBalance?.toString() || customer.walletBalance?.toString() || "0");
    const reservedBalanceNum = parseFloat(customer.reservedBalance?.toString() || "0");
    const totalDepositedNum = parseFloat(customer.totalDeposited?.toString() || "0");

    const walletTransactions = customer.walletTransactions || [];
    const recentTrades = customer.recentTrades || [];
    const bankDetails = customer.bankDetails || customer.organization?.bankAccount || null;

    const isVerified = customer.verificationStatus === "Verified" || customer.verified || customer.kycStatus === "APPROVED";

    return (
        <div className="min-h-screen p-4 md:p-8 space-y-6 font-sans max-w-7xl mx-auto" style={{ backgroundColor: "#F7F8F9" }}>
            {/* ── Breadcrumb ── */}
            <div className="flex items-center gap-2 text-xs text-slate-500 font-medium">
                <Link href="/admin/customers" className="hover:text-slate-900 transition-colors">
                    Customers
                </Link>
                <span>›</span>
                <span className="font-semibold text-slate-900">{entityName}</span>
            </div>

            {/* ── Header Row with Top Balance Cards ── */}
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 border-b pb-6" style={{ borderColor: "#E1E3E6" }}>
                <div>
                    <div className="flex items-center gap-3">
                        <h1 className="text-2xl md:text-3xl font-extrabold text-slate-900">
                            {entityName}
                        </h1>
                        <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold ${
                            isVerified ? "bg-emerald-50 text-emerald-700" : "bg-amber-50 text-amber-700"
                        }`}>
                            {isVerified ? "Verified" : "Pending KYC"}
                        </span>
                        <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-slate-100 text-slate-700">
                            {customer.customerType || "Corporate"}
                        </span>
                    </div>
                    <p className="text-xs font-mono text-slate-400 mt-1">Customer ID: {entityId}</p>

                    <div className="flex items-center gap-3 mt-4">
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => toast.info(`Viewing documents for ${entityName}`)}
                            className="bg-white border-slate-200 text-slate-700 text-xs font-bold px-4 py-2 h-auto rounded-lg shadow-sm gap-1.5"
                        >
                            <FileText className="w-3.5 h-3.5 text-slate-500" />
                            KYC Documents
                        </Button>

                        <Button
                            size="sm"
                            onClick={() => router.push(`/admin/transactions?search=${customer.name || customer.email}`)}
                            className="bg-[#C9A227] hover:bg-[#b08e20] text-white text-xs font-bold px-4 py-2 h-auto rounded-lg shadow-sm gap-1.5"
                        >
                            <Plus className="w-3.5 h-3.5" />
                            View Trades
                        </Button>
                    </div>
                </div>

                {/* Top Balance Cards */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 shrink-0">
                    <div className="bg-white p-5 rounded-2xl border shadow-sm min-w-[170px]" style={{ borderColor: "#E1E3E6" }}>
                        <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Available Balance</p>
                        <p className="text-xl md:text-2xl font-extrabold font-mono text-slate-900 mt-1">
                            ₦{availableBalanceNum.toLocaleString("en-NG", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                        </p>
                    </div>

                    <div className="bg-white p-5 rounded-2xl border shadow-sm min-w-[170px]" style={{ borderColor: "#E1E3E6" }}>
                        <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Reserved (Trades)</p>
                        <p className="text-xl md:text-2xl font-extrabold font-mono text-slate-900 mt-1">
                            ₦{reservedBalanceNum.toLocaleString("en-NG", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                        </p>
                    </div>

                    <div className="bg-white p-5 rounded-2xl border shadow-sm min-w-[170px]" style={{ borderColor: "#E1E3E6" }}>
                        <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Total Funded</p>
                        <p className="text-xl md:text-2xl font-extrabold font-mono text-slate-900 mt-1">
                            ₦{totalDepositedNum.toLocaleString("en-NG", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                        </p>
                    </div>
                </div>
            </div>

            {/* ── 2-Column Content Grid ── */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
                {/* Left Column: Overview & Banking Cards */}
                <div className="space-y-6">
                    {/* Overview Card */}
                    <div className="bg-white rounded-2xl border p-6 shadow-sm space-y-5" style={{ borderColor: "#E1E3E6" }}>
                        <div className="flex items-center gap-2 border-b pb-3">
                            <ShieldCheck className="w-4 h-4 text-[#C9A227]" />
                            <h3 className="text-base font-bold text-slate-900">Profile & KYC</h3>
                        </div>

                        <div>
                            <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">KYC Status</p>
                            <div className="flex items-center justify-between mt-1">
                                <span className={`text-xs font-bold flex items-center gap-1.5 ${
                                    isVerified ? "text-emerald-600" : "text-amber-600"
                                }`}>
                                    <span className={`w-2 h-2 rounded-full ${isVerified ? "bg-emerald-500" : "bg-amber-500"}`} />
                                    {customer.kycStatus || (isVerified ? "APPROVED" : "PENDING")}
                                </span>
                                <span className="text-[11px] text-slate-400">
                                    Joined {new Date(customer.dateJoined || customer.createdAt).toLocaleDateString()}
                                </span>
                            </div>
                        </div>

                        <div>
                            <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Account Holder</p>
                            <p className="text-xs font-bold text-slate-900 mt-1">{customer.name || customer.fullName || "—"}</p>
                            <p className="text-[11px] text-slate-500">{customer.companySector || customer.customerType || "Individual Trader"}</p>
                        </div>

                        <div className="space-y-1.5 text-xs">
                            <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Contact Info</p>
                            <p className="text-slate-700 flex items-center gap-1.5 font-medium">
                                <Mail className="w-3.5 h-3.5 text-[#C9A227]" />
                                {customer.email || customer.user?.email || "—"}
                            </p>
                            <p className="text-slate-700 flex items-center gap-1.5 font-medium">
                                <Phone className="w-3.5 h-3.5 text-slate-400" />
                                {customer.phone || customer.user?.phone || "—"}
                            </p>
                        </div>

                        <div>
                            <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Registered Address</p>
                            <p className="text-xs text-slate-700 mt-1 leading-relaxed">
                                {customer.homeAddress || customer.address || "No address provided"}
                            </p>
                        </div>

                        {(customer.bvn || customer.nin) && (
                            <div className="pt-2 border-t border-slate-100 text-xs space-y-1">
                                {customer.bvn && (
                                    <div className="flex justify-between">
                                        <span className="text-slate-400">BVN:</span>
                                        <span className="font-mono font-bold text-slate-800">
                                            {customer.bvn.slice(0, 3)}****{customer.bvn.slice(-3)}
                                        </span>
                                    </div>
                                )}
                                {customer.nin && (
                                    <div className="flex justify-between">
                                        <span className="text-slate-400">NIN:</span>
                                        <span className="font-mono font-bold text-slate-800">
                                            {customer.nin.slice(0, 3)}****{customer.nin.slice(-3)}
                                        </span>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>

                    {/* Banking Card */}
                    <div className="bg-white rounded-2xl border p-6 shadow-sm space-y-4" style={{ borderColor: "#E1E3E6" }}>
                        <div className="flex items-center justify-between border-b pb-3">
                            <div className="flex items-center gap-2">
                                <Building2 className="w-4 h-4 text-[#C9A227]" />
                                <h3 className="text-base font-bold text-slate-900">Settlement Bank</h3>
                            </div>
                            <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                                bankDetails ? "bg-emerald-50 text-emerald-700" : "bg-slate-100 text-slate-500"
                            }`}>
                                {bankDetails ? "Connected" : "Not Linked"}
                            </span>
                        </div>

                        {bankDetails ? (
                            <>
                                <div>
                                    <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Bank Name</p>
                                    <p className="text-xs font-bold text-slate-900 mt-0.5">{bankDetails.bankName || "Settlement Bank"}</p>
                                    <p className="text-[11px] text-slate-500">{bankDetails.accountName || customer.name}</p>
                                </div>

                                <div className="divide-y divide-slate-100 text-xs space-y-2 pt-2">
                                    <div className="pt-2 flex items-center justify-between">
                                        <span className="text-slate-500">Account Number</span>
                                        <div className="flex items-center gap-1.5 font-mono font-bold text-slate-900">
                                            <span>{bankDetails.accountNumber}</span>
                                            <button onClick={() => handleCopy(bankDetails.accountNumber, "Account Number")} className="text-slate-400 hover:text-slate-600">
                                                {copiedField === "Account Number" ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                                            </button>
                                        </div>
                                    </div>

                                    {bankDetails.routingNumber && (
                                        <div className="pt-2 flex items-center justify-between">
                                            <span className="text-slate-500">Routing (ABA)</span>
                                            <div className="flex items-center gap-1.5 font-mono font-bold text-slate-900">
                                                <span>{bankDetails.routingNumber}</span>
                                                <button onClick={() => handleCopy(bankDetails.routingNumber, "Routing")} className="text-slate-400 hover:text-slate-600">
                                                    {copiedField === "Routing" ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                                                </button>
                                            </div>
                                        </div>
                                    )}

                                    {bankDetails.swiftCode && (
                                        <div className="pt-2 flex items-center justify-between">
                                            <span className="text-slate-500">SWIFT / BIC</span>
                                            <div className="flex items-center gap-1.5 font-mono font-bold text-slate-900">
                                                <span>{bankDetails.swiftCode}</span>
                                                <button onClick={() => handleCopy(bankDetails.swiftCode, "SWIFT")} className="text-slate-400 hover:text-slate-600">
                                                    {copiedField === "SWIFT" ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                                                </button>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </>
                        ) : (
                            <p className="text-xs text-slate-400 py-2">
                                Customer has not registered payout bank details yet.
                            </p>
                        )}
                    </div>
                </div>

                {/* Right 2 Columns: Ledger & Recent Trades */}
                <div className="lg:col-span-2 space-y-6">
                    {/* Wallet Ledger Activity */}
                    <div className="bg-white rounded-2xl border shadow-sm overflow-hidden" style={{ borderColor: "#E1E3E6" }}>
                        <div className="p-5 border-b flex items-center justify-between" style={{ borderColor: "#E1E3E6" }}>
                            <div className="flex items-center gap-2">
                                <Wallet className="w-4 h-4 text-[#C9A227]" />
                                <h3 className="text-base font-bold text-slate-900">Customer Wallet Ledger</h3>
                            </div>
                            <span className="text-xs font-semibold text-slate-400">
                                {walletTransactions.length} Record(s)
                            </span>
                        </div>

                        <div className="overflow-x-auto">
                            {walletTransactions.length === 0 ? (
                                <div className="text-center py-8 text-slate-400 text-xs">
                                    No ledger activity recorded for this customer.
                                </div>
                            ) : (
                                <table className="w-full text-left text-xs">
                                    <thead className="bg-slate-50/80 border-b border-slate-100 text-slate-500 uppercase tracking-wider text-[10px] font-bold">
                                        <tr>
                                            <th className="py-3 px-5">Date</th>
                                            <th className="py-3 px-5">Description</th>
                                            <th className="py-3 px-5">Type</th>
                                            <th className="py-3 px-5 text-right">Amount</th>
                                            <th className="py-3 px-5 text-right">Balance After</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
                                        {walletTransactions.map((tx: any) => {
                                            const isCredit = Number(tx.amount) > 0;
                                            return (
                                                <tr key={tx.id} className="hover:bg-slate-50/60">
                                                    <td className="py-3.5 px-5 text-slate-500 whitespace-nowrap">
                                                        {new Date(tx.createdAt).toLocaleString()}
                                                    </td>
                                                    <td className="py-3.5 px-5 font-medium text-slate-900 whitespace-nowrap">
                                                        {tx.description || tx.type}
                                                    </td>
                                                    <td className="py-3.5 px-5 whitespace-nowrap">
                                                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                                                            isCredit ? "bg-emerald-50 text-emerald-700" : "bg-amber-50 text-amber-800"
                                                        }`}>
                                                            {tx.type}
                                                        </span>
                                                    </td>
                                                    <td className={`py-3.5 px-5 text-right font-mono font-bold whitespace-nowrap ${
                                                        isCredit ? 'text-emerald-700' : 'text-slate-900'
                                                    }`}>
                                                        {isCredit ? "+" : ""}₦{Number(tx.amount).toLocaleString()}
                                                    </td>
                                                    <td className="py-3.5 px-5 text-right font-mono font-bold text-slate-900 whitespace-nowrap">
                                                        ₦{Number(tx.balanceAfter).toLocaleString()}
                                                    </td>
                                                </tr>
                                            );
                                        })}
                                    </tbody>
                                </table>
                            )}
                        </div>
                    </div>

                    {/* Customer Trades & Requests */}
                    <div className="bg-white rounded-2xl border shadow-sm overflow-hidden" style={{ borderColor: "#E1E3E6" }}>
                        <div className="p-5 border-b flex items-center justify-between" style={{ borderColor: "#E1E3E6" }}>
                            <div className="flex items-center gap-2">
                                <span className="text-slate-700 font-bold">💳</span>
                                <h3 className="text-base font-bold text-slate-900">Recent Trades & Transfers</h3>
                            </div>
                            <span className="text-xs font-semibold text-slate-400">
                                {recentTrades.length} Trade(s)
                            </span>
                        </div>

                        <div className="overflow-x-auto">
                            {recentTrades.length === 0 ? (
                                <div className="text-center py-8 text-slate-400 text-xs">
                                    No trades created yet.
                                </div>
                            ) : (
                                <table className="w-full text-left text-xs">
                                    <thead className="bg-slate-50/80 border-b border-slate-100 text-slate-500 uppercase tracking-wider text-[10px] font-bold">
                                        <tr>
                                            <th className="py-3 px-5">Trade ID</th>
                                            <th className="py-3 px-5">Pair</th>
                                            <th className="py-3 px-5">Date</th>
                                            <th className="py-3 px-5">Status</th>
                                            <th className="py-3 px-5 text-right">Amount</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
                                        {recentTrades.map((trade: any) => (
                                            <tr key={trade.id} className="hover:bg-slate-50/60">
                                                <td className="py-3.5 px-5 font-mono font-bold text-[#C9A227] whitespace-nowrap">
                                                    {trade.tradeId || `#${trade.id.slice(0, 6)}`}
                                                </td>
                                                <td className="py-3.5 px-5 font-semibold text-slate-900 whitespace-nowrap">
                                                    {trade.transaction || "FX Transfer"}
                                                </td>
                                                <td className="py-3.5 px-5 text-slate-500 whitespace-nowrap">
                                                    {trade.date} {trade.time}
                                                </td>
                                                <td className="py-3.5 px-5 whitespace-nowrap">
                                                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                                                        trade.status === "COMPLETED" ? "bg-emerald-50 text-emerald-700" : "bg-amber-50 text-amber-800"
                                                    }`}>
                                                        {trade.status}
                                                    </span>
                                                </td>
                                                <td className="py-3.5 px-5 text-right font-mono font-bold text-slate-900 whitespace-nowrap">
                                                    {trade.amount}
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

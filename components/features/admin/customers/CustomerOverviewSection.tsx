"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import type { Customer } from "@/lib/types/customer";
import { formatDate } from "@/lib/formatters";
import { Landmark, Building2, ExternalLink } from "lucide-react";
import Link from "next/link";

interface CustomerOverviewSectionProps {
    customer: Customer;
}

export function CustomerOverviewSection({ customer }: CustomerOverviewSectionProps) {
    return (
        <div className="space-y-6">
            {/* Quick Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {[
                    { label: "Total Trades", value: (customer.totalTransactions || 0).toString() },
                    { label: "Trade Volume", value: customer.totalVolume || "₦0" },
                    { label: "Last Trade", value: formatDate(customer.lastTrade) },
                    { label: "Member Since", value: formatDate(customer.dateJoined) },
                ].map((s) => (
                    <div
                        key={s.label}
                        className="rounded-xl p-4 border text-center"
                        style={{ backgroundColor: "white", borderColor: "#e1e3e6" }}
                    >
                        <p className="text-xl font-bold" style={{ color: "#2b2f33" }}>{s.value}</p>
                        <p className="text-xs mt-1" style={{ color: "#6b7078" }}>{s.label}</p>
                    </div>
                ))}
            </div>

            {/* Customer Summary & Managed Banking Cards */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                
                {/* Personal & Business Info */}
                <div
                    className="rounded-xl p-5 border space-y-3"
                    style={{ backgroundColor: "white", borderColor: "#e1e3e6" }}
                >
                    <h3 className="font-semibold text-base" style={{ color: "#2b2f33" }}>
                        Customer Details
                    </h3>
                    {[
                        { label: "Full Name", value: customer.name },
                        { label: "Email", value: customer.email },
                        { label: "Phone", value: customer.phone },
                        { label: "Customer ID", value: customer.customerId },
                        {
                            label: "Company / Business",
                            value: customer.companyName || customer.organization?.businessName || "Individual"
                        },
                        {
                            label: "KYC Verification",
                            value: (
                                <Badge
                                    variant="outline"
                                    className={`text-xs ${customer.verificationStatus === "Verified"
                                        ? "bg-green-100 text-green-700 border-green-300"
                                        : customer.verificationStatus === "Pending"
                                            ? "bg-yellow-100 text-yellow-700 border-yellow-300"
                                            : "bg-red-100 text-red-700 border-red-300"
                                        }`}
                                >
                                    {customer.verificationStatus}
                                </Badge>
                            ),
                        },
                    ].map((item) => (
                        <div
                            key={item.label}
                            className="flex justify-between items-center py-1.5 border-b"
                            style={{ borderColor: "#f0f0f0" }}
                        >
                            <span className="text-sm" style={{ color: "#6b7078" }}>
                                {item.label}
                            </span>
                            <span className="text-sm font-medium" style={{ color: "#2b2f33" }}>
                                {item.value}
                            </span>
                        </div>
                    ))}

                    {customer.organization?.id && (
                        <div className="pt-2">
                            <Link href={`/admin/organizations/${customer.organization.id}`}>
                                <Button size="sm" variant="outline" className="w-full text-xs font-semibold gap-1 text-[#012333]">
                                    <Building2 className="w-3.5 h-3.5 text-[#C9A227]" />
                                    View Full Business Organization Profile
                                    <ExternalLink className="w-3.5 h-3.5 ml-auto" />
                                </Button>
                            </Link>
                        </div>
                    )}
                </div>

                {/* Managed FV Bank U.S. Account Section */}
                <div
                    className="rounded-xl p-5 border space-y-4"
                    style={{ backgroundColor: "white", borderColor: "#e1e3e6" }}
                >
                    <div className="flex items-center justify-between border-b pb-2">
                        <h3 className="font-semibold text-base flex items-center gap-2" style={{ color: "#2b2f33" }}>
                            <Landmark className="w-4 h-4 text-[#C9A227]" />
                            Managed FV Bank U.S. Account
                        </h3>
                        {customer.organization?.bankAccount && (
                            <Badge className="bg-emerald-100 text-emerald-800 border-emerald-200 text-[10px]">
                                {customer.organization.bankAccount.status}
                            </Badge>
                        )}
                    </div>

                    {customer.organization?.bankAccount ? (
                        <div className="bg-[#012333] text-white p-4 rounded-xl space-y-3 font-sans">
                            <div className="text-xs font-bold text-[#C9A227] uppercase tracking-wider">
                                {customer.organization.bankAccount.bankName} (U.S. Account)
                            </div>
                            <div className="space-y-1 text-xs">
                                <div className="flex justify-between">
                                    <span className="text-slate-400">Account Number:</span>
                                    <span className="font-mono font-bold">{customer.organization.bankAccount.accountNumber}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-slate-400">Routing Number:</span>
                                    <span className="font-mono font-bold">{customer.organization.bankAccount.routingNumber}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-slate-400">Currency:</span>
                                    <span className="font-bold">USD</span>
                                </div>
                            </div>
                        </div>
                    ) : (
                        <div className="bg-slate-50 p-4 rounded-xl text-center text-xs text-slate-500 space-y-2 border border-slate-200">
                            <p>No dedicated managed U.S. bank account is provisioned for this customer.</p>
                            {customer.organization?.id && (
                                <Link href={`/admin/organizations/${customer.organization.id}`}>
                                    <Button size="sm" className="bg-[#012333] text-white text-xs font-semibold gap-1">
                                        Provision FV Bank Account in Admin
                                    </Button>
                                </Link>
                            )}
                        </div>
                    )}

                    <div className="space-y-2 pt-2 text-xs">
                        <div className="flex justify-between py-1 border-b" style={{ borderColor: "#f0f0f0" }}>
                            <span style={{ color: "#6b7078" }}>Activity Level</span>
                            <span className="font-medium text-slate-800">{customer.activityLevel || "Medium"}</span>
                        </div>
                        <div className="flex justify-between py-1 border-b" style={{ borderColor: "#f0f0f0" }}>
                            <span style={{ color: "#6b7078" }}>Most Traded Pair</span>
                            <span className="font-medium text-slate-800">{customer.mostTradedPair || "None"}</span>
                        </div>
                    </div>
                </div>

            </div>
        </div>
    );
}


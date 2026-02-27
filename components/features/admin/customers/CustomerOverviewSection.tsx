"use client";

import { Badge } from "@/components/ui/badge";
import type { Customer } from "@/lib/types/customer";
import { formatDate } from "@/lib/formatters";

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

            {/* Customer Summary */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
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
                            label: "KYC Status",
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
                        { label: "Account Type", value: customer.customerType || "Individual" },
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
                </div>

                <div
                    className="rounded-xl p-5 border space-y-3"
                    style={{ backgroundColor: "white", borderColor: "#e1e3e6" }}
                >
                    <h3 className="font-semibold text-base" style={{ color: "#2b2f33" }}>
                        Activity Summary
                    </h3>
                    {[
                        { label: "Activity Level", value: customer.activityLevel || "Medium" },
                        { label: "Most Traded Pair", value: "NGN → USD" },
                        { label: "Preferred Method", value: "Bank Transfer" },
                        { label: "Total Spent", value: "₦8,400,000" },
                        { label: "Referrals", value: "3" },
                        { label: "Support Tickets", value: "1 Open" },
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
                </div>
            </div>
        </div>
    );
}

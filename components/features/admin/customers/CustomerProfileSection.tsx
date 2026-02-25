"use client";

import type { Customer } from "@/lib/types/customer";
import { formatDate } from "@/lib/formatters";

interface CustomerProfileSectionProps {
    customer: Customer;
}

export function CustomerProfileSection({ customer }: CustomerProfileSectionProps) {
    const name = customer.name.split(" ");
    return (
        <div className="space-y-6">
            <div
                className="rounded-xl p-5 border"
                style={{ backgroundColor: "white", borderColor: "#e1e3e6" }}
            >
                <h3 className="font-semibold text-base mb-4" style={{ color: "#2b2f33" }}>
                    Personal Information
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-3">
                    {[
                        { label: "First Name", value: name[0] || "—" },
                        { label: "Last Name", value: name.slice(1).join(" ") || "—" },
                        { label: "Email Address", value: customer.email },
                        { label: "Phone Number", value: customer.phone },
                        { label: "Date Joined", value: formatDate(customer.dateJoined) },
                        { label: "Account Type", value: customer.customerType || "Individual" },
                        { label: "Address", value: customer.address || "—" },
                        { label: "Activity Level", value: customer.activityLevel || "Medium" },
                    ].map((item) => (
                        <div key={item.label} className="py-2 border-b" style={{ borderColor: "#f0f0f0" }}>
                            <p className="text-xs mb-1" style={{ color: "#9aa0a6" }}>{item.label}</p>
                            <p className="text-sm font-medium" style={{ color: "#2b2f33" }}>{item.value}</p>
                        </div>
                    ))}
                </div>
            </div>

            <div
                className="rounded-xl p-5 border"
                style={{ backgroundColor: "white", borderColor: "#e1e3e6" }}
            >
                <h3 className="font-semibold text-base mb-4" style={{ color: "#2b2f33" }}>
                    Bank Accounts on File
                </h3>
                <div className="space-y-3">
                    {[
                        { bank: "GTBank", name: customer.name, number: "0209014338", type: "Savings" },
                        { bank: "Access Bank", name: customer.name, number: "0123456789", type: "Current" },
                    ].map((acct, i) => (
                        <div key={i} className="p-3 rounded-lg" style={{ backgroundColor: "#f6f6f6" }}>
                            <div className="flex justify-between">
                                <p className="text-sm font-medium" style={{ color: "#2b2f33" }}>{acct.bank}</p>
                                <p className="text-xs" style={{ color: "#9aa0a6" }}>{acct.type}</p>
                            </div>
                            <p className="text-xs mt-0.5" style={{ color: "#6b7078" }}>
                                {acct.name} · {acct.number}
                            </p>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}

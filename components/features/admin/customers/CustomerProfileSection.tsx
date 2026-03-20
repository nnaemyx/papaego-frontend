"use client";

import type { Customer } from "@/lib/types/customer";
import { formatDate } from "@/lib/formatters";

interface CustomerProfileSectionProps {
    customer: Customer;
}

export function CustomerProfileSection({ customer }: CustomerProfileSectionProps) {
    const name = (customer.name || "").split(" ");
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

            {customer.customerType === 'Business' && (
                <div
                    className="rounded-xl p-5 border"
                    style={{ backgroundColor: "white", borderColor: "#e1e3e6" }}
                >
                    <h3 className="font-semibold text-base mb-4" style={{ color: "#2b2f33" }}>
                        Company Information
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-3">
                        <div className="py-2 border-b" style={{ borderColor: "#f0f0f0" }}>
                            <p className="text-xs mb-1" style={{ color: "#9aa0a6" }}>Company Name</p>
                            <p className="text-sm font-medium" style={{ color: "#2b2f33" }}>{customer.companyName || "—"}</p>
                        </div>
                        <div className="py-2 border-b" style={{ borderColor: "#f0f0f0" }}>
                            <p className="text-xs mb-1" style={{ color: "#9aa0a6" }}>Company Sector</p>
                            <p className="text-sm font-medium" style={{ color: "#2b2f33" }}>{customer.companySector || "—"}</p>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

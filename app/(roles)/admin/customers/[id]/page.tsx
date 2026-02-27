"use client";

import { useState, use } from "react";
import { useQuery } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { adminCustomersApi } from "@/lib/api/customers";
import { Badge } from "@/components/ui/badge";
import { formatDate } from "@/lib/formatters";
import { CustomerOverviewSection } from "@/components/features/admin/customers/CustomerOverviewSection";
import { CustomerProfileSection } from "@/components/features/admin/customers/CustomerProfileSection";
import { CustomerTransactionsSection } from "@/components/features/admin/customers/CustomerTransactionsSection";
import { CustomerKycSection } from "@/components/features/admin/customers/CustomerKycSection";
import { CustomerLinkedAgentsSection } from "@/components/features/admin/customers/CustomerLinkedAgentsSection";
import { CustomerActivitySection } from "@/components/features/admin/customers/CustomerActivitySection";
import { CustomerNotesSection } from "@/components/features/admin/customers/CustomerNotesSection";

const TABS = [
    { id: "overview", label: "Overview" },
    { id: "profile", label: "Profile" },
    { id: "transactions", label: "Transactions" },
    { id: "kyc", label: "KYC & Documents" },
    { id: "agents", label: "Linked Agents" },
    { id: "activity", label: "Activity" },
    { id: "notes", label: "Notes" },
];

export default function CustomerDetailPage({
    params,
}: {
    params: Promise<{ id: string }>;
}) {
    const { id } = use(params);
    const router = useRouter();
    const [activeTab, setActiveTab] = useState("overview");

    const { data: customer, isLoading } = useQuery({
        queryKey: ["admin-customer", id],
        queryFn: () => adminCustomersApi.getCustomer(id),
    });

    if (isLoading) {
        return (
            <div className="p-6 space-y-4" style={{ backgroundColor: "#f7f8f9", minHeight: "100%" }}>
                <div className="h-8 bg-gray-200 rounded w-48 animate-pulse" />
                <div className="h-24 bg-gray-200 rounded animate-pulse" />
                <div className="h-64 bg-gray-200 rounded animate-pulse" />
            </div>
        );
    }

    if (!customer) {
        return (
            <div className="p-6 text-center" style={{ backgroundColor: "#f7f8f9", minHeight: "100%" }}>
                <p style={{ color: "#6b7078" }}>Customer not found.</p>
            </div>
        );
    }

    return (
        <div style={{ backgroundColor: "#f7f8f9", minHeight: "100%" }}>
            {/* Header */}
            <div
                className="px-4 md:px-6 lg:px-7 py-5 border-b"
                style={{ backgroundColor: "white", borderColor: "#e1e3e6" }}
            >
                <button
                    onClick={() => router.push("/admin/customers")}
                    className="flex items-center gap-2 text-sm mb-4 hover:opacity-70 transition-opacity"
                    style={{ color: "#c9a227" }}
                >
                    <ArrowLeft className="h-4 w-4" />
                    Back to Customers
                </button>

                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div className="flex items-center gap-4">
                        <div
                            className="w-14 h-14 rounded-full flex items-center justify-center text-white text-xl font-bold flex-shrink-0"
                            style={{ backgroundColor: "#1890ff" }}
                        >
                            {customer.name?.charAt(0) || "?"}
                        </div>
                        <div>
                            <h1 className="text-2xl font-bold" style={{ color: "#2b2f33" }}>
                                {customer.name}
                            </h1>
                            <div className="flex items-center gap-2 mt-1 flex-wrap">
                                <span className="text-sm" style={{ color: "#6b7078" }}>
                                    {customer.customerId}
                                </span>
                                <span style={{ color: "#e1e3e6" }}>·</span>
                                <span className="text-sm" style={{ color: "#6b7078" }}>
                                    {customer.customerType || "Individual"}
                                </span>
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
                            </div>
                        </div>
                    </div>
                </div>

                {/* Tabs */}
                <div className="flex gap-0 mt-5 overflow-x-auto scrollbar-hidden -mb-px">
                    {TABS.map((tab) => (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id)}
                            className="px-4 py-2 text-sm font-medium whitespace-nowrap border-b-2 transition-colors"
                            style={{
                                borderBottomColor: activeTab === tab.id ? "#c9a227" : "transparent",
                                color: activeTab === tab.id ? "#c9a227" : "#6b7078",
                            }}
                        >
                            {tab.label}
                        </button>
                    ))}
                </div>
            </div>

            {/* Tab Content */}
            <div className="p-4 md:p-6 lg:px-7">
                {activeTab === "overview" && <CustomerOverviewSection customer={customer} />}
                {activeTab === "profile" && <CustomerProfileSection customer={customer} />}
                {activeTab === "transactions" && <CustomerTransactionsSection customer={customer} />}
                {activeTab === "kyc" && <CustomerKycSection customer={customer} />}
                {activeTab === "agents" && <CustomerLinkedAgentsSection customer={customer} />}
                {activeTab === "activity" && <CustomerActivitySection customer={customer} />}
                {activeTab === "notes" && <CustomerNotesSection customer={customer} />}
            </div>
        </div>
    );
}

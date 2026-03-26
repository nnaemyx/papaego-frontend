"use client";

import { use, useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { suppliersApi } from "@/lib/api/suppliers";
import { adminCustomersApi } from "@/lib/api/customers";
import { NIGERIAN_SECTORS } from "@/lib/api/customer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import {
    Building2,
    ChevronLeft,
    Hash,
    MapPin,
    Users,
    Pencil,
    Save,
    X,
    Loader2,
    Search,
    UserPlus,
    UserMinus,
} from "lucide-react";
import { toast } from "sonner";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function SupplierDetailPage({
    params,
}: {
    params: Promise<{ id: string }>;
}) {
    const { id } = use(params);
    const router = useRouter();
    const queryClient = useQueryClient();
    const [isEditing, setIsEditing] = useState(false);
    const [customerSearch, setCustomerSearch] = useState("");
    const [form, setForm] = useState({
        businessName: "",
        bankName: "",
        accountNumber: "",
        sector: "",
        address: "",
    });

    const { data: supplier, isLoading } = useQuery({
        queryKey: ["admin-supplier", id],
        queryFn: () => suppliersApi.getSupplier(id),
    });

    useEffect(() => {
        if (supplier) {
            setForm({
                businessName: supplier.businessName,
                bankName: supplier.bankName,
                accountNumber: supplier.accountNumber,
                sector: supplier.sector,
                address: supplier.address || "",
            });
        }
    }, [supplier]);

    const { data: customers = [] } = useQuery({
        queryKey: ["admin-customers-list"],
        queryFn: () => adminCustomersApi.getCustomers(),
        staleTime: 60_000,
    });

    const updateMutation = useMutation({
        mutationFn: (payload: typeof form) => suppliersApi.updateSupplier(id, payload),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["admin-supplier", id] });
            queryClient.invalidateQueries({ queryKey: ["admin-suppliers"] });
            toast.success("Supplier updated");
            setIsEditing(false);
        },
        onError: () => toast.error("Failed to update supplier"),
    });

    const linkMutation = useMutation({
        mutationFn: (customerId: string) => suppliersApi.linkCustomer(id, customerId),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["admin-supplier", id] });
            toast.success("Customer linked");
        },
        onError: () => toast.error("Failed to link customer"),
    });

    const unlinkMutation = useMutation({
        mutationFn: (customerId: string) => suppliersApi.unlinkCustomer(id, customerId),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["admin-supplier", id] });
            toast.success("Customer unlinked");
        },
        onError: () => toast.error("Failed to unlink customer"),
    });

    if (isLoading) {
        return (
            <div className="flex items-center justify-center min-h-[60vh]">
                <Loader2
                    className="w-10 h-10 animate-spin"
                    style={{ color: "#C9A227" }}
                />
            </div>
        );
    }

    if (!supplier) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
                <p className="font-bold text-red-500">Supplier not found</p>
                <Link href="/admin/suppliers">
                    <Button variant="outline">Back to Suppliers</Button>
                </Link>
            </div>
        );
    }

    const linkedIds = supplier.linkedCustomers.map((c) => c.id);
    const unlinkedCustomers = (customers as any[]).filter(
        (c: any) => !linkedIds.includes(c.id)
    );
    const filteredUnlinked = unlinkedCustomers.filter((c: any) => {
        if (!customerSearch) return true;
        const q = customerSearch.toLowerCase();
        return (
            (c.name || c.fullName || "").toLowerCase().includes(q) ||
            (c.email || "").toLowerCase().includes(q)
        );
    });

    return (
        <div
            className="p-4 md:p-6 lg:p-8 space-y-6 max-w-4xl mx-auto"
            style={{ backgroundColor: "#F7F8F9", minHeight: "100vh" }}
        >
            {/* Back */}
            <button
                onClick={() => router.back()}
                className="flex items-center gap-2 text-sm font-semibold hover:underline"
                style={{ color: "#2b2f33" }}
            >
                <ChevronLeft className="w-4 h-4" />
                Back to Suppliers
            </button>

            {/* Header */}
            <div className="bg-white rounded-2xl border p-6" style={{ borderColor: "#E1E3E6" }}>
                <div className="flex items-start justify-between gap-4">
                    <div className="flex items-center gap-4">
                        <div
                            className="w-14 h-14 rounded-2xl flex items-center justify-center"
                            style={{ backgroundColor: "#FFF8E1" }}
                        >
                            <Building2 className="w-7 h-7" style={{ color: "#C9A227" }} />
                        </div>
                        <div>
                            <h1 className="text-2xl font-bold" style={{ color: "#2b2f33" }}>
                                {supplier.businessName}
                            </h1>
                            <Badge
                                variant="outline"
                                className="mt-1"
                                style={{
                                    backgroundColor: "#F7F8F9",
                                    color: "#6b7078",
                                    borderColor: "#E1E3E6",
                                }}
                            >
                                {supplier.sector}
                            </Badge>
                        </div>
                    </div>
                    <div className="flex gap-2">
                        {isEditing ? (
                            <>
                                <Button
                                    variant="outline"
                                    onClick={() => setIsEditing(false)}
                                    size="sm"
                                >
                                    <X className="w-4 h-4 mr-1" />
                                    Cancel
                                </Button>
                                <Button
                                    size="sm"
                                    onClick={() => updateMutation.mutate(form)}
                                    disabled={updateMutation.isPending}
                                    className="text-white"
                                    style={{ backgroundColor: "#C9A227" }}
                                >
                                    {updateMutation.isPending ? (
                                        <Loader2 className="w-4 h-4 mr-1 animate-spin" />
                                    ) : (
                                        <Save className="w-4 h-4 mr-1" />
                                    )}
                                    Save
                                </Button>
                            </>
                        ) : (
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() => setIsEditing(true)}
                            >
                                <Pencil className="w-4 h-4 mr-1" />
                                Edit
                            </Button>
                        )}
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Details */}
                <div className="bg-white rounded-2xl border p-6 space-y-5" style={{ borderColor: "#E1E3E6" }}>
                    <h2 className="font-bold text-lg" style={{ color: "#2b2f33" }}>
                        Supplier Details
                    </h2>

                    {isEditing ? (
                        <div className="space-y-4">
                            <div className="space-y-1.5">
                                <label className="text-sm font-semibold" style={{ color: "#6b7078" }}>
                                    Business Name
                                </label>
                                <Input
                                    value={form.businessName}
                                    onChange={(e) =>
                                        setForm((p) => ({ ...p, businessName: e.target.value }))
                                    }
                                />
                            </div>
                            <div className="grid grid-cols-2 gap-3">
                                <div className="space-y-1.5">
                                    <label className="text-sm font-semibold" style={{ color: "#6b7078" }}>
                                        Bank Name
                                    </label>
                                    <Input
                                        value={form.bankName}
                                        onChange={(e) =>
                                            setForm((p) => ({ ...p, bankName: e.target.value }))
                                        }
                                    />
                                </div>
                                <div className="space-y-1.5">
                                    <label className="text-sm font-semibold" style={{ color: "#6b7078" }}>
                                        Account Number
                                    </label>
                                    <Input
                                        value={form.accountNumber}
                                        onChange={(e) =>
                                            setForm((p) => ({ ...p, accountNumber: e.target.value }))
                                        }
                                    />
                                </div>
                            </div>
                            <div className="space-y-1.5">
                                <label className="text-sm font-semibold" style={{ color: "#6b7078" }}>
                                    Sector
                                </label>
                                <Select
                                    value={form.sector}
                                    onValueChange={(v) => setForm((p) => ({ ...p, sector: v }))}
                                >
                                    <SelectTrigger>
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {NIGERIAN_SECTORS.map((s) => (
                                            <SelectItem key={s} value={s}>
                                                {s}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="space-y-1.5">
                                <label className="text-sm font-semibold" style={{ color: "#6b7078" }}>
                                    Address
                                </label>
                                <textarea
                                    value={form.address}
                                    onChange={(e) =>
                                        setForm((p) => ({ ...p, address: e.target.value }))
                                    }
                                    rows={2}
                                    className="w-full border rounded-lg px-3 py-2 text-sm resize-none outline-none"
                                    style={{ borderColor: "#E1E3E6", color: "#2b2f33" }}
                                />
                            </div>
                        </div>
                    ) : (
                        <div className="space-y-3">
                            {[
                                { icon: Building2, label: "Business Name", val: supplier.businessName },
                                { icon: Hash, label: "Bank Name", val: supplier.bankName },
                                { icon: Hash, label: "Account Number", val: supplier.accountNumber },
                                { icon: Building2, label: "Sector", val: supplier.sector },
                                { icon: MapPin, label: "Address", val: supplier.address || "—" },
                            ].map(({ icon: Icon, label, val }) => (
                                <div key={label} className="flex items-start justify-between gap-4">
                                    <div className="flex items-center gap-2">
                                        <Icon className="w-4 h-4 shrink-0" style={{ color: "#9AA0A6" }} />
                                        <span className="text-sm" style={{ color: "#6b7078" }}>
                                            {label}
                                        </span>
                                    </div>
                                    <span
                                        className="text-sm font-semibold text-right"
                                        style={{ color: "#2b2f33" }}
                                    >
                                        {val}
                                    </span>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {/* Linked Customers */}
                <div className="bg-white rounded-2xl border p-6 space-y-4" style={{ borderColor: "#E1E3E6" }}>
                    <h2 className="font-bold text-lg flex items-center gap-2" style={{ color: "#2b2f33" }}>
                        <Users className="w-5 h-5" style={{ color: "#C9A227" }} />
                        Linked Customers ({supplier.linkedCustomers.length})
                    </h2>

                    {/* Currently linked */}
                    <div className="space-y-2">
                        {supplier.linkedCustomers.length === 0 ? (
                            <p className="text-sm" style={{ color: "#9AA0A6" }}>
                                No customers linked yet.
                            </p>
                        ) : (
                            supplier.linkedCustomers.map((c) => (
                                <div
                                    key={c.id}
                                    className="flex items-center justify-between p-3 rounded-xl"
                                    style={{ backgroundColor: "#F7F8F9" }}
                                >
                                    <div>
                                        <p className="text-sm font-semibold" style={{ color: "#2b2f33" }}>
                                            {c.fullName}
                                        </p>
                                        <p className="text-xs" style={{ color: "#9AA0A6" }}>
                                            {c.email}
                                        </p>
                                    </div>
                                    <button
                                        onClick={() => unlinkMutation.mutate(c.id)}
                                        disabled={unlinkMutation.isPending}
                                        className="p-1.5 rounded-lg hover:bg-red-50 transition-colors"
                                    >
                                        <UserMinus className="w-4 h-4 text-red-400" />
                                    </button>
                                </div>
                            ))
                        )}
                    </div>

                    {/* Add more customers */}
                    <div className="border-t pt-4 space-y-2" style={{ borderColor: "#E1E3E6" }}>
                        <p className="text-xs font-semibold" style={{ color: "#6b7078" }}>
                            Link More Customers
                        </p>
                        <div className="relative">
                            <Search
                                className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4"
                                style={{ color: "#9AA0A6" }}
                            />
                            <Input
                                placeholder="Search customers to link…"
                                className="pl-9"
                                value={customerSearch}
                                onChange={(e) => setCustomerSearch(e.target.value)}
                            />
                        </div>
                        <div
                            className="max-h-40 overflow-y-auto rounded-xl border divide-y"
                            style={{ borderColor: "#E1E3E6" }}
                        >
                            {filteredUnlinked.length === 0 ? (
                                <p className="text-xs text-center py-4" style={{ color: "#9AA0A6" }}>
                                    {customerSearch ? "No matching customers" : "All customers are linked"}
                                </p>
                            ) : (
                                filteredUnlinked.map((c: any) => (
                                    <div
                                        key={c.id}
                                        className="flex items-center justify-between px-3 py-2.5 hover:bg-gray-50"
                                    >
                                        <div>
                                            <p className="text-sm font-medium" style={{ color: "#2b2f33" }}>
                                                {c.name || c.fullName}
                                            </p>
                                            <p className="text-xs" style={{ color: "#9AA0A6" }}>
                                                {c.email}
                                            </p>
                                        </div>
                                        <button
                                            onClick={() => linkMutation.mutate(c.id)}
                                            disabled={linkMutation.isPending}
                                            className="p-1.5 rounded-lg hover:bg-green-50 transition-colors"
                                        >
                                            <UserPlus className="w-4 h-4" style={{ color: "#27AE60" }} />
                                        </button>
                                    </div>
                                ))
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

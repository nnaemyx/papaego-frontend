"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { suppliersApi, type Supplier, type CreateSupplierPayload } from "@/lib/api/suppliers";
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
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogFooter,
} from "@/components/ui/dialog";
import {
    Building2,
    Search,
    Plus,
    Hash,
    MapPin,
    Users,
    Pencil,
    Trash2,
    Loader2,
    X,
} from "lucide-react";
import { toast } from "sonner";
import Link from "next/link";

const EMPTY_FORM: CreateSupplierPayload = {
    businessName: "",
    bankName: "",
    accountNumber: "",
    sector: "",
    address: "",
    customerIds: [],
};

export default function AdminSuppliersPage() {
    const queryClient = useQueryClient();
    const [search, setSearch] = useState("");
    const [sectorFilter, setSectorFilter] = useState("All");
    const [showDialog, setShowDialog] = useState(false);
    const [editingSupplier, setEditingSupplier] = useState<Supplier | null>(null);
    const [form, setForm] = useState<CreateSupplierPayload>(EMPTY_FORM);
    const [customerSearch, setCustomerSearch] = useState("");

    /* ── Queries ── */
    const { data, isLoading } = useQuery({
        queryKey: ["admin-suppliers", search, sectorFilter],
        queryFn: () =>
            suppliersApi.getSuppliers({
                search: search || undefined,
                sector: sectorFilter !== "All" ? sectorFilter : undefined,
            }),
        staleTime: 30_000,
    });

    const { data: customers = [] } = useQuery({
        queryKey: ["admin-customers-list"],
        queryFn: () => adminCustomersApi.getCustomers(),
        staleTime: 60_000,
    });

    /* ── Mutations ── */
    const createMutation = useMutation({
        mutationFn: (payload: CreateSupplierPayload) =>
            suppliersApi.createSupplier(payload),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["admin-suppliers"] });
            toast.success("Supplier created successfully");
            closeDialog();
        },
        onError: () => toast.error("Failed to create supplier"),
    });

    const updateMutation = useMutation({
        mutationFn: ({ id, payload }: { id: string; payload: Partial<CreateSupplierPayload> }) =>
            suppliersApi.updateSupplier(id, payload),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["admin-suppliers"] });
            toast.success("Supplier updated successfully");
            closeDialog();
        },
        onError: () => toast.error("Failed to update supplier"),
    });

    const deleteMutation = useMutation({
        mutationFn: (id: string) => suppliersApi.deleteSupplier(id),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["admin-suppliers"] });
            toast.success("Supplier deleted");
        },
        onError: () => toast.error("Failed to delete supplier"),
    });

    /* ── Helpers ── */
    const openCreate = () => {
        setEditingSupplier(null);
        setForm(EMPTY_FORM);
        setCustomerSearch("");
        setShowDialog(true);
    };

    const openEdit = (supplier: Supplier) => {
        setEditingSupplier(supplier);
        setForm({
            businessName: supplier.businessName,
            bankName: supplier.bankName,
            accountNumber: supplier.accountNumber,
            sector: supplier.sector,
            address: supplier.address,
            customerIds: supplier.linkedCustomers.map((c) => c.id),
        });
        setCustomerSearch("");
        setShowDialog(true);
    };

    const closeDialog = () => {
        setShowDialog(false);
        setEditingSupplier(null);
        setForm(EMPTY_FORM);
    };

    const handleSubmit = () => {
        if (!form.businessName || !form.bankName || !form.accountNumber || !form.sector) {
            toast.error("Please fill in all required fields");
            return;
        }
        if (editingSupplier) {
            updateMutation.mutate({ id: editingSupplier.id, payload: form });
        } else {
            createMutation.mutate(form);
        }
    };

    const handleDelete = (supplier: Supplier) => {
        if (confirm(`Delete "${supplier.businessName}"? This cannot be undone.`)) {
            deleteMutation.mutate(supplier.id);
        }
    };

    const toggleCustomer = (customerId: string) => {
        setForm((prev) => ({
            ...prev,
            customerIds: prev.customerIds?.includes(customerId)
                ? prev.customerIds.filter((id) => id !== customerId)
                : [...(prev.customerIds || []), customerId],
        }));
    };

    const suppliers = data?.suppliers ?? [];
    const total = data?.total ?? 0;

    const filteredCustomers = (customers as any[]).filter((c: any) => {
        if (!customerSearch) return true;
        const q = customerSearch.toLowerCase();
        return (
            (c.name || c.fullName || "").toLowerCase().includes(q) ||
            (c.email || "").toLowerCase().includes(q)
        );
    });

    const isPending = createMutation.isPending || updateMutation.isPending;

    return (
        <div className="p-4 md:p-6 lg:p-8 space-y-6 max-w-7xl mx-auto">
            {/* Header */}
            <div className="flex items-start justify-between gap-4">
                <div>
                    <h1
                        className="text-3xl md:text-4xl font-bold mb-1.5 flex items-center gap-3"
                        style={{ color: "#2b2f33" }}
                    >
                        <Building2 className="w-8 h-8" style={{ color: "#C9A227" }} />
                        Suppliers
                    </h1>
                    <p style={{ color: "#6b7078" }}>
                        Manage supplier accounts and link them to customers for automatic
                        account number recall.
                    </p>
                </div>
                <Button
                    onClick={openCreate}
                    className="h-11 px-5 shrink-0 font-semibold text-white"
                    style={{ backgroundColor: "#C9A227" }}
                >
                    <Plus className="w-4 h-4 mr-2" />
                    Add Supplier
                </Button>
            </div>

            {/* Filters */}
            <div className="flex flex-col sm:flex-row gap-4">
                <div className="relative flex-1 max-w-sm">
                    <Search
                        className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4"
                        style={{ color: "#9AA0A6" }}
                    />
                    <Input
                        placeholder="Search suppliers…"
                        className="pl-9"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                    />
                </div>
                <Select value={sectorFilter} onValueChange={setSectorFilter}>
                    <SelectTrigger className="w-[200px]">
                        <SelectValue placeholder="All Sectors" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="All">All Sectors</SelectItem>
                        {NIGERIAN_SECTORS.map((s) => (
                            <SelectItem key={s} value={s}>
                                {s}
                            </SelectItem>
                        ))}
                    </SelectContent>
                </Select>
                <div className="text-sm self-center" style={{ color: "#6b7078" }}>
                    {total} supplier{total !== 1 ? "s" : ""}
                </div>
            </div>

            {/* Grid */}
            {isLoading ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {Array.from({ length: 6 }).map((_, i) => (
                        <div
                            key={i}
                            className="h-52 rounded-2xl animate-pulse"
                            style={{ backgroundColor: "#E1E3E6" }}
                        />
                    ))}
                </div>
            ) : suppliers.length === 0 ? (
                <div
                    className="text-center py-20 rounded-3xl border border-dashed"
                    style={{ borderColor: "#E1E3E6", backgroundColor: "#F7F8F9" }}
                >
                    <Building2 className="w-16 h-16 mx-auto mb-4" style={{ color: "#D1D5DB" }} />
                    <h3 className="text-xl font-bold mb-2" style={{ color: "#9AA0A6" }}>
                        No suppliers found
                    </h3>
                    <p className="mb-6" style={{ color: "#9AA0A6" }}>
                        Add your first supplier to get started.
                    </p>
                    <Button
                        onClick={openCreate}
                        className="font-semibold text-white"
                        style={{ backgroundColor: "#C9A227" }}
                    >
                        <Plus className="w-4 h-4 mr-2" />
                        Add Supplier
                    </Button>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {suppliers.map((supplier) => (
                        <div
                            key={supplier.id}
                            className="bg-white rounded-2xl border p-5 hover:shadow-md transition-shadow space-y-4"
                            style={{ borderColor: "#E1E3E6" }}
                        >
                            {/* Top row */}
                            <div className="flex items-start justify-between gap-2">
                                <div className="flex items-center gap-3">
                                    <div
                                        className="w-11 h-11 rounded-xl flex items-center justify-center shrink-0"
                                        style={{ backgroundColor: "#FFF8E1" }}
                                    >
                                        <Building2
                                            className="w-5 h-5"
                                            style={{ color: "#C9A227" }}
                                        />
                                    </div>
                                    <div>
                                        <p
                                            className="font-bold text-base leading-snug"
                                            style={{ color: "#2b2f33" }}
                                        >
                                            {supplier.businessName}
                                        </p>
                                        <Badge
                                            variant="outline"
                                            className="text-xs mt-0.5"
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
                                <div className="flex gap-1.5 shrink-0">
                                    <button
                                        onClick={() => openEdit(supplier)}
                                        className="w-8 h-8 rounded-lg flex items-center justify-center hover:bg-gray-100 transition-colors"
                                    >
                                        <Pencil className="w-4 h-4" style={{ color: "#6b7078" }} />
                                    </button>
                                    <button
                                        onClick={() => handleDelete(supplier)}
                                        className="w-8 h-8 rounded-lg flex items-center justify-center hover:bg-red-50 transition-colors"
                                    >
                                        <Trash2 className="w-4 h-4 text-red-400" />
                                    </button>
                                </div>
                            </div>

                            {/* Bank details */}
                            <div
                                className="rounded-xl p-3 space-y-1.5"
                                style={{ backgroundColor: "#F7F8F9" }}
                            >
                                <div className="flex items-center gap-2">
                                    <Hash className="w-3.5 h-3.5 shrink-0" style={{ color: "#9AA0A6" }} />
                                    <span className="text-sm font-semibold" style={{ color: "#2b2f33" }}>
                                        {supplier.bankName}
                                    </span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <Hash className="w-3.5 h-3.5 shrink-0" style={{ color: "#9AA0A6" }} />
                                    <span className="text-sm font-mono" style={{ color: "#6b7078" }}>
                                        {supplier.accountNumber}
                                    </span>
                                </div>
                                {supplier.address && (
                                    <div className="flex items-center gap-2">
                                        <MapPin className="w-3.5 h-3.5 shrink-0" style={{ color: "#9AA0A6" }} />
                                        <span
                                            className="text-xs truncate"
                                            style={{ color: "#6b7078" }}
                                        >
                                            {supplier.address}
                                        </span>
                                    </div>
                                )}
                            </div>

                            {/* Linked customers */}
                            <div className="flex items-center gap-2">
                                <Users className="w-4 h-4" style={{ color: "#9AA0A6" }} />
                                <span className="text-sm" style={{ color: "#6b7078" }}>
                                    {supplier.linkedCustomers.length === 0
                                        ? "No linked customers"
                                        : `${supplier.linkedCustomers.length} linked customer${supplier.linkedCustomers.length !== 1 ? "s" : ""}`}
                                </span>
                            </div>

                            {supplier.linkedCustomers.length > 0 && (
                                <div className="flex flex-wrap gap-1.5">
                                    {supplier.linkedCustomers.slice(0, 3).map((c) => (
                                        <span
                                            key={c.id}
                                            className="text-xs px-2 py-0.5 rounded-full font-medium"
                                            style={{
                                                backgroundColor: "#E2FDED",
                                                color: "#27AE60",
                                            }}
                                        >
                                            {c.fullName}
                                        </span>
                                    ))}
                                    {supplier.linkedCustomers.length > 3 && (
                                        <span
                                            className="text-xs px-2 py-0.5 rounded-full"
                                            style={{ backgroundColor: "#F7F8F9", color: "#9AA0A6" }}
                                        >
                                            +{supplier.linkedCustomers.length - 3} more
                                        </span>
                                    )}
                                </div>
                            )}

                            <Link
                                href={`/admin/suppliers/${supplier.id}`}
                                className="block text-center text-xs font-semibold py-2 rounded-lg transition-colors hover:opacity-80"
                                style={{ color: "#C9A227", backgroundColor: "#FFF8E1" }}
                            >
                                View Details →
                            </Link>
                        </div>
                    ))}
                </div>
            )}

            {/* Add / Edit Dialog */}
            <Dialog open={showDialog} onOpenChange={(open) => !open && closeDialog()}>
                <DialogContent className="max-w-xl max-h-[90vh] overflow-y-auto">
                    <DialogHeader>
                        <DialogTitle>
                            {editingSupplier ? "Edit Supplier" : "Add New Supplier"}
                        </DialogTitle>
                    </DialogHeader>

                    <div className="space-y-4 py-2">
                        {/* Business Name */}
                        <div className="space-y-1.5">
                            <label className="text-sm font-semibold" style={{ color: "#2b2f33" }}>
                                Business Name <span className="text-red-500">*</span>
                            </label>
                            <Input
                                value={form.businessName}
                                onChange={(e) => setForm((p) => ({ ...p, businessName: e.target.value }))}
                                placeholder="e.g. Apex Imports Ltd"
                            />
                        </div>

                        {/* Bank Name + Account Number */}
                        <div className="grid grid-cols-2 gap-3">
                            <div className="space-y-1.5">
                                <label className="text-sm font-semibold" style={{ color: "#2b2f33" }}>
                                    Bank Name <span className="text-red-500">*</span>
                                </label>
                                <Input
                                    value={form.bankName}
                                    onChange={(e) => setForm((p) => ({ ...p, bankName: e.target.value }))}
                                    placeholder="e.g. Zenith Bank"
                                />
                            </div>
                            <div className="space-y-1.5">
                                <label className="text-sm font-semibold" style={{ color: "#2b2f33" }}>
                                    Account Number <span className="text-red-500">*</span>
                                </label>
                                <Input
                                    value={form.accountNumber}
                                    onChange={(e) => setForm((p) => ({ ...p, accountNumber: e.target.value }))}
                                    placeholder="0123456789"
                                    maxLength={20}
                                />
                            </div>
                        </div>

                        {/* Sector */}
                        <div className="space-y-1.5">
                            <label className="text-sm font-semibold" style={{ color: "#2b2f33" }}>
                                Sector <span className="text-red-500">*</span>
                            </label>
                            <Select
                                value={form.sector}
                                onValueChange={(v) => setForm((p) => ({ ...p, sector: v }))}
                            >
                                <SelectTrigger>
                                    <SelectValue placeholder="Select a sector…" />
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

                        {/* Address */}
                        <div className="space-y-1.5">
                            <label className="text-sm font-semibold" style={{ color: "#2b2f33" }}>
                                Address
                            </label>
                            <textarea
                                value={form.address}
                                onChange={(e) => setForm((p) => ({ ...p, address: e.target.value }))}
                                placeholder="Supplier's full address…"
                                rows={2}
                                className="w-full border rounded-lg px-3 py-2 text-sm resize-none outline-none focus:ring-1"
                                style={{ borderColor: "#E1E3E6", color: "#2b2f33" }}
                            />
                        </div>

                        {/* Link Customers */}
                        <div className="space-y-2">
                            <label className="text-sm font-semibold" style={{ color: "#2b2f33" }}>
                                Link to Customers
                            </label>
                            <p className="text-xs" style={{ color: "#9AA0A6" }}>
                                Tag customers who use this supplier for auto-fill on future trades.
                            </p>
                            <div className="relative">
                                <Search
                                    className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4"
                                    style={{ color: "#9AA0A6" }}
                                />
                                <Input
                                    placeholder="Search customers…"
                                    className="pl-9"
                                    value={customerSearch}
                                    onChange={(e) => setCustomerSearch(e.target.value)}
                                />
                            </div>
                            <div
                                className="max-h-36 overflow-y-auto rounded-lg border divide-y"
                                style={{ borderColor: "#E1E3E6" }}
                            >
                                {filteredCustomers.length === 0 ? (
                                    <p className="text-xs text-center py-4" style={{ color: "#9AA0A6" }}>
                                        No customers found
                                    </p>
                                ) : (
                                    filteredCustomers.map((c: any) => {
                                        const id = c.id;
                                        const name = c.name || c.fullName || c.email;
                                        const isSelected = form.customerIds?.includes(id);
                                        return (
                                            <label
                                                key={id}
                                                className="flex items-center gap-3 px-3 py-2.5 cursor-pointer hover:bg-gray-50 transition-colors"
                                            >
                                                <input
                                                    type="checkbox"
                                                    checked={!!isSelected}
                                                    onChange={() => toggleCustomer(id)}
                                                    className="w-4 h-4 accent-amber-500"
                                                />
                                                <div>
                                                    <p className="text-sm font-medium" style={{ color: "#2b2f33" }}>
                                                        {name}
                                                    </p>
                                                    <p className="text-xs" style={{ color: "#9AA0A6" }}>
                                                        {c.email}
                                                    </p>
                                                </div>
                                            </label>
                                        );
                                    })
                                )}
                            </div>
                            {/* Selected tags */}
                            {(form.customerIds?.length ?? 0) > 0 && (
                                <div className="flex flex-wrap gap-1.5 mt-1">
                                    {form.customerIds?.map((cid) => {
                                        const c = (customers as any[]).find((x: any) => x.id === cid);
                                        return (
                                            <span
                                                key={cid}
                                                className="flex items-center gap-1 text-xs px-2 py-0.5 rounded-full font-medium"
                                                style={{ backgroundColor: "#E2FDED", color: "#27AE60" }}
                                            >
                                                {c?.name || c?.fullName || cid}
                                                <button
                                                    type="button"
                                                    onClick={() => toggleCustomer(cid)}
                                                >
                                                    <X className="w-3 h-3" />
                                                </button>
                                            </span>
                                        );
                                    })}
                                </div>
                            )}
                        </div>
                    </div>

                    <DialogFooter className="gap-2">
                        <Button variant="outline" onClick={closeDialog}>
                            Cancel
                        </Button>
                        <Button
                            onClick={handleSubmit}
                            disabled={isPending}
                            className="font-semibold text-white"
                            style={{ backgroundColor: "#C9A227" }}
                        >
                            {isPending && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                            {editingSupplier ? "Save Changes" : "Create Supplier"}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}

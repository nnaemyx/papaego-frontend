"use client";

import React, { useEffect, useState } from "react";
import { Plus, Users, Search, MoreVertical, Edit2, Trash2, Link as LinkIcon, Loader2 } from "lucide-react";
import { customerApi } from "@/lib/api/customer";
import { SupplierModal } from "@/components/customer/SupplierModal";
import { toast } from "sonner";
import { format } from "date-fns";

export default function CustomerSuppliersPage() {
    const [suppliers, setSuppliers] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedSupplier, setSelectedSupplier] = useState<any | null>(null);

    const fetchSuppliers = async () => {
        try {
            const data = await customerApi.getSuppliers();
            setSuppliers(data);
        } catch (error) {
            toast.error("Failed to load suppliers");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchSuppliers();
    }, []);

    const handleSaveSupplier = async (data: any) => {
        try {
            if (selectedSupplier) {
                await customerApi.updateSupplier(selectedSupplier.id, data);
                toast.success("Supplier updated successfully");
            } else {
                await customerApi.createSupplier(data);
                toast.success("Supplier added successfully");
            }
            fetchSuppliers();
        } catch (error) {
            toast.error("Failed to save supplier");
            throw error;
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm("Are you sure you want to delete this supplier?")) return;
        try {
            await customerApi.deleteSupplier(id);
            toast.success("Supplier removed");
            fetchSuppliers();
        } catch (error) {
            toast.error("Failed to delete supplier");
        }
    };

    const openAddModal = () => {
        setSelectedSupplier(null);
        setIsModalOpen(true);
    };

    const openEditModal = (supplier: any) => {
        setSelectedSupplier(supplier);
        setIsModalOpen(true);
    };

    const filteredSuppliers = suppliers.filter(s => 
        s.beneficiaryName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        s.bankName?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="min-h-screen" style={{ backgroundColor: "#f7f8f9" }}>
            <main className="p-4 md:p-8 max-w-7xl mx-auto space-y-6">
                
                {/* Header */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div>
                        <h1 className="text-2xl md:text-3xl font-bold" style={{ color: "var(--text-primary)" }}>
                            My Suppliers
                        </h1>
                        <p className="body-secondary mt-1 max-w-2xl">
                            Manage your saved suppliers and beneficiaries for faster trade requests.
                        </p>
                    </div>

                    <button
                        onClick={openAddModal}
                        className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-white font-bold transition-opacity hover:opacity-90"
                        style={{ backgroundColor: "var(--brand-primary)" }}
                    >
                        <Plus className="w-5 h-5" />
                        Add Supplier
                    </button>
                </div>

                <div 
                    className="bg-white rounded-2xl border flex flex-col min-h-[500px]"
                    style={{ borderColor: "var(--border-custom)" }}
                >
                    {/* Controls */}
                    <div className="p-5 border-b" style={{ borderColor: "#E1E3E6" }}>
                        <div className="relative max-w-md">
                            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                            <input
                                type="text"
                                placeholder="Search by name or bank..."
                                value={searchTerm}
                                onChange={e => setSearchTerm(e.target.value)}
                                className="w-full h-11 pl-11 pr-4 rounded-xl border bg-gray-50 focus:bg-white outline-none focus:ring-2"
                                style={{ borderColor: "#E1E3E6" }}
                            />
                        </div>
                    </div>

                    {/* Table / List */}
                    {loading ? (
                        <div className="flex flex-col items-center justify-center flex-1 py-12">
                            <Loader2 className="w-10 h-10 animate-spin text-gray-400 mb-4" />
                            <p className="text-gray-500 font-medium">Loading suppliers...</p>
                        </div>
                    ) : filteredSuppliers.length === 0 ? (
                        <div className="flex flex-col items-center justify-center flex-1 py-20 px-4 text-center">
                            <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mb-4">
                                <Users className="w-8 h-8 text-gray-400" />
                            </div>
                            <h3 className="text-lg font-bold" style={{ color: "var(--text-primary)" }}>
                                {searchTerm ? "No results found" : "No suppliers yet"}
                            </h3>
                            <p className="text-gray-500 mt-1 max-w-sm">
                                {searchTerm 
                                    ? "Try adjusting your search term."
                                    : "Add your frequently used beneficiaries here to speed up your trade requests."}
                            </p>
                            {!searchTerm && (
                                <button
                                    onClick={openAddModal}
                                    className="mt-6 font-bold text-[#C9A227] hover:underline"
                                >
                                    + Add your first supplier
                                </button>
                            )}
                        </div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full text-left border-collapse">
                                <thead>
                                    <tr className="border-b" style={{ borderColor: "#E1E3E6", backgroundColor: "#F7F8F9" }}>
                                        <th className="px-6 py-4 text-xs font-bold text-[#6B7078] uppercase tracking-wider">Beneficiary</th>
                                        <th className="px-6 py-4 text-xs font-bold text-[#6B7078] uppercase tracking-wider">Bank Details</th>
                                        <th className="px-6 py-4 text-xs font-bold text-[#6B7078] uppercase tracking-wider">Currency</th>
                                        <th className="px-6 py-4 text-xs font-bold text-[#6B7078] uppercase tracking-wider">Added</th>
                                        <th className="px-6 py-4 text-xs font-bold text-[#6B7078] uppercase tracking-wider text-right">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y" style={{ borderColor: "#E1E3E6" }}>
                                    {filteredSuppliers.map(supplier => (
                                        <tr key={supplier.id} className="hover:bg-gray-50/50 transition-colors">
                                            <td className="px-6 py-4">
                                                <div className="font-bold text-[#012333]">{supplier.beneficiaryName}</div>
                                                {supplier.address && (
                                                    <div className="text-sm text-gray-500 mt-0.5 max-w-[200px] truncate">{supplier.address}</div>
                                                )}
                                            </td>
                                            <td className="px-6 py-4">
                                                {supplier.bankName ? (
                                                    <>
                                                        <div className="text-sm font-semibold">{supplier.bankName}</div>
                                                        <div className="text-sm text-gray-500">{supplier.accountNumber || "No Account #"}</div>
                                                    </>
                                                ) : (
                                                    <span className="text-gray-400 text-sm">Not provided</span>
                                                )}
                                            </td>
                                            <td className="px-6 py-4">
                                                <span className="inline-flex items-center justify-center px-2.5 py-1 rounded-md bg-gray-100 text-xs font-bold text-gray-700">
                                                    {supplier.currency || "USD"}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 text-sm text-gray-500">
                                                {format(new Date(supplier.createdAt), "MMM d, yyyy")}
                                            </td>
                                            <td className="px-6 py-4 text-right">
                                                <div className="flex items-center justify-end gap-2">
                                                    <button 
                                                        onClick={() => openEditModal(supplier)}
                                                        className="p-2 hover:bg-gray-200 rounded-lg text-gray-600 transition-colors"
                                                        title="Edit Supplier"
                                                    >
                                                        <Edit2 className="w-4 h-4" />
                                                    </button>
                                                    <button 
                                                        onClick={() => handleDelete(supplier.id)}
                                                        className="p-2 hover:bg-red-100 rounded-lg text-red-500 transition-colors"
                                                        title="Delete Supplier"
                                                    >
                                                        <Trash2 className="w-4 h-4" />
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
            </main>

            <SupplierModal 
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onSave={handleSaveSupplier}
                initialData={selectedSupplier}
            />
        </div>
    );
}

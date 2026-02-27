"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import type { Customer } from "@/lib/types/customer";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { adminCustomersApi } from "@/lib/api/customers";
import { toast } from "sonner";
import { formatDate } from "@/lib/formatters";

interface CustomerNotesSectionProps {
    customer: Customer;
}

export function CustomerNotesSection({ customer }: CustomerNotesSectionProps) {
    const [note, setNote] = useState("");
    const queryClient = useQueryClient();
    const notes = customer.notes || [];

    const addNoteMutation = useMutation({
        mutationFn: (content: string) => adminCustomersApi.addCustomerNote(customer.id, content),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["admin-customer", customer.id] });
            setNote("");
            toast.success("Note added successfully");
        },
        onError: () => {
            toast.error("Failed to add note");
        }
    });

    return (
        <div
            className="rounded-xl p-5 border space-y-4"
            style={{ backgroundColor: "white", borderColor: "#e1e3e6" }}
        >
            <h3 className="font-semibold text-base" style={{ color: "#2b2f33" }}>
                Admin Notes
            </h3>

            <div className="space-y-3">
                {notes.length > 0 ? (
                    notes.map((n) => (
                        <div
                            key={n.id}
                            className="p-3 rounded-lg"
                            style={{ backgroundColor: "#f6f6f6" }}
                        >
                            <div className="flex justify-between mb-1">
                                <p className="text-xs font-semibold" style={{ color: "#2b2f33" }}>
                                    {n.createdBy}
                                </p>
                                <p className="text-xs" style={{ color: "#9aa0a6" }}>
                                    {formatDate(n.createdAt)}
                                </p>
                            </div>
                            <p className="text-xs" style={{ color: "#6b7078" }}>
                                {n.content}
                            </p>
                        </div>
                    ))
                ) : (
                    <p className="text-sm text-gray-500 py-2">No notes added yet.</p>
                )}
            </div>

            <div className="space-y-2">
                <label className="text-sm" style={{ color: "#6b7078" }}>
                    Add a note
                </label>
                <textarea
                    value={note}
                    onChange={(e) => setNote(e.target.value)}
                    className="w-full rounded-lg border p-3 text-sm resize-none focus:outline-none focus:ring-1"
                    style={{ borderColor: "#e1e3e6", minHeight: "80px", color: "#2b2f33" }}
                    placeholder={`Add a note about ${customer.name || 'this customer'}...`}
                />
                <Button
                    style={{ backgroundColor: "#c9a227", color: "white" }}
                    disabled={!note.trim() || addNoteMutation.isPending}
                    onClick={() => addNoteMutation.mutate(note)}
                >
                    {addNoteMutation.isPending ? "Saving..." : "Save Note"}
                </Button>
            </div>
        </div>
    );
}

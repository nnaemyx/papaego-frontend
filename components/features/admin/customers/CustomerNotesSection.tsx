"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import type { Customer } from "@/lib/types/customer";

interface CustomerNotesSectionProps {
    customer: Customer;
}

const mockNotes = [
    { author: "Admin", date: "20/12/2025", content: "Customer requested priority processing for high-value trades." },
    { author: "Compliance Team", date: "05/12/2025", content: "KYC documents reviewed and approved. No issues found." },
    { author: "Support Agent", date: "15/11/2025", content: "Ticket raised for payment delay — resolved within 24h." },
];

export function CustomerNotesSection({ customer }: CustomerNotesSectionProps) {
    const [note, setNote] = useState("");

    return (
        <div
            className="rounded-xl p-5 border space-y-4"
            style={{ backgroundColor: "white", borderColor: "#e1e3e6" }}
        >
            <h3 className="font-semibold text-base" style={{ color: "#2b2f33" }}>
                Admin Notes
            </h3>

            <div className="space-y-3">
                {mockNotes.map((n, i) => (
                    <div
                        key={i}
                        className="p-3 rounded-lg"
                        style={{ backgroundColor: "#f6f6f6" }}
                    >
                        <div className="flex justify-between mb-1">
                            <p className="text-xs font-semibold" style={{ color: "#2b2f33" }}>
                                {n.author}
                            </p>
                            <p className="text-xs" style={{ color: "#9aa0a6" }}>
                                {n.date}
                            </p>
                        </div>
                        <p className="text-xs" style={{ color: "#6b7078" }}>
                            {n.content}
                        </p>
                    </div>
                ))}
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
                    placeholder={`Add a note about ${customer.name}...`}
                />
                <Button
                    style={{ backgroundColor: "#c9a227", color: "white" }}
                    disabled={!note.trim()}
                >
                    Save Note
                </Button>
            </div>
        </div>
    );
}

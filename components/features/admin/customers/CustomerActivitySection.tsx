"use client";

import type { Customer } from "@/lib/types/customer";

interface CustomerActivitySectionProps {
    customer: Customer;
}

// Replaced timeline with customer.activityTimeline

function getTypeColor(type: string) {
    switch (type) {
        case "trade": return "#1890ff";
        case "kyc": return "#9333ea";
        case "cancel": return "#e05555";
        case "support": return "#f0cd00";
        case "register": return "#27ae60";
        default: return "#9aa0a6";
    }
}

export function CustomerActivitySection({ customer }: CustomerActivitySectionProps) {
    return (
        <div
            className="rounded-xl p-5 border"
            style={{ backgroundColor: "white", borderColor: "#e1e3e6" }}
        >
            <h3 className="font-semibold text-base mb-5" style={{ color: "#2b2f33" }}>
                Activity Timeline
            </h3>
            <div className="relative">
                <div
                    className="absolute left-[7px] top-0 bottom-0 w-0.5"
                    style={{ backgroundColor: "#e1e3e6" }}
                />
                <div className="space-y-5 pl-6">
                    {(customer.activityTimeline || []).map((item, i) => (
                        <div key={i} className="relative">
                            <div
                                className="absolute -left-6 w-3.5 h-3.5 rounded-full border-2 top-0.5"
                                style={{ backgroundColor: getTypeColor(item.type), borderColor: "white" }}
                            />
                            <p className="text-sm" style={{ color: "#2b2f33" }}>{item.event}</p>
                            <p className="text-xs mt-0.5" style={{ color: "#9aa0a6" }}>
                                {item.date} · {item.time}
                            </p>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}

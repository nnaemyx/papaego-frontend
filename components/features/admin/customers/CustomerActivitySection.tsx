"use client";

import type { Customer } from "@/lib/types/customer";

interface CustomerActivitySectionProps {
    customer: Customer;
}

const timeline = [
    { date: "25 Dec 2025", time: "11:16 AM", event: "Trade #PE-24118 completed — Buy USD ₦3.25M", type: "trade" },
    { date: "10 Dec 2025", time: "02:30 PM", event: "Sell GBP trade initiated — £1,100", type: "trade" },
    { date: "05 Dec 2025", time: "09:00 AM", event: "Account KYC documents verified", type: "kyc" },
    { date: "28 Nov 2025", time: "03:00 PM", event: "Trade #PE-24063 cancelled — Buy EUR", type: "cancel" },
    { date: "15 Nov 2025", time: "10:00 AM", event: "Support ticket raised — payment delay", type: "support" },
    { date: "01 Nov 2025", time: "08:00 AM", event: "Account registered on PapaEgo", type: "register" },
];

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
                    {timeline.map((item, i) => (
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

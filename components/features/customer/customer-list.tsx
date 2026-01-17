"use client";

import { useQuery } from "@tanstack/react-query";
import api from "@/lib/api/client";

export default function CustomerList() {
    const { data: customers, isLoading, error } = useQuery({
        queryKey: ["customers"],
        queryFn: async () => {
            const res = await api.get("/agents/customers");
            return res.data;
        },
    });

    if (isLoading) return <div>Loading customers...</div>;
    if (error) return <div>Failed to load customers.</div>;

    return (
        <div className="bg-white rounded-lg shadowoverflow-hidden">
            <ul className="divide-y divide-gray-200">
                {customers?.map((customer: any) => (
                    <li key={customer.id} className="p-4 hover:bg-gray-50 flex justify-between items-center">
                        <div>
                            <p className="font-medium text-gray-900">{customer.fullName}</p>
                            <p className="text-sm text-gray-500">{customer.email}</p>
                        </div>
                        <div>
                            <span
                                className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${customer.verified
                                        ? "bg-green-100 text-green-800"
                                        : "bg-gray-100 text-gray-800"
                                    }`}
                            >
                                {customer.verified ? "Verified" : "Pending"}
                            </span>
                        </div>
                    </li>
                ))}
            </ul>
        </div>
    );
}

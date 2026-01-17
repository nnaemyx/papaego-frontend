"use client";

import { useQuery } from "@tanstack/react-query";
import api from "@/lib/api/client";
import { format } from "date-fns";

export default function TradeList() {
    const { data: trades, isLoading, error } = useQuery({
        queryKey: ["trades"],
        queryFn: async () => {
            const res = await api.get("/trades"); // Adjust endpoint as needed
            return res.data;
        },
    });

    if (isLoading) return <div className="p-4 text-center">Loading trades...</div>;
    if (error) return <div className="p-4 text-center text-red-500">Failed to load trades.</div>;

    return (
        <div className="overflow-x-auto bg-white rounded-lg shadow-sm border border-gray-100">
            <table className="w-full text-left text-sm">
                <thead className="bg-gray-50 border-b border-gray-200">
                    <tr>
                        <th className="px-6 py-3 font-medium text-gray-500">Date</th>
                        <th className="px-6 py-3 font-medium text-gray-500">Trade ID</th>
                        <th className="px-6 py-3 font-medium text-gray-500">Pair</th>
                        <th className="px-6 py-3 font-medium text-gray-500">Amount</th>
                        <th className="px-6 py-3 font-medium text-gray-500">Status</th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                    {trades?.map((trade: any) => (
                        <tr key={trade.id} className="hover:bg-gray-50">
                            <td className="px-6 py-4 text-gray-600">
                                {format(new Date(trade.createdAt), "MMM d, yyyy")}
                            </td>
                            <td className="px-6 py-4 font-medium text-gray-900 truncate max-w-[100px]">
                                {trade.id}
                            </td>
                            <td className="px-6 py-4 text-gray-600">
                                {trade.sendCurrency} → {trade.receiveCurrency}
                            </td>
                            <td className="px-6 py-4 font-medium">
                                {trade.amount} {trade.sendCurrency}
                            </td>
                            <td className="px-6 py-4">
                                <span
                                    className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${trade.status === "COMPLETED"
                                        ? "bg-green-100 text-green-700"
                                        : trade.status === "PENDING"
                                            ? "bg-yellow-100 text-yellow-700"
                                            : "bg-gray-100 text-gray-700"
                                        }`}
                                >
                                    {trade.status}
                                </span>
                            </td>
                        </tr>
                    ))}
                    {trades?.length === 0 && (
                        <tr>
                            <td colSpan={5} className="px-6 py-8 text-center text-gray-500">
                                No trades found.
                            </td>
                        </tr>
                    )}
                </tbody>
            </table>
        </div>
    );
}

"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import api from "@/lib/api/client";
import { useState } from "react";

export default function AgentManagement() {
    const queryClient = useQueryClient();
    const [error, setError] = useState("");

    const { data: agents, isLoading } = useQuery({
        queryKey: ["agents"],
        queryFn: async () => {
            const res = await api.get("/admin/agents", {
                params: { role: "AGENT" } // Assuming generic user list endpoint or specific
            });
            return res.data;
        },
    });

    const toggleStatusMutation = useMutation({
        mutationFn: async ({ id, action }: { id: string; action: "suspend" | "activate" }) => {
            // Endpoint to suspend/activate agent
            const res = await api.post(`/admin/agents/${id}/${action}`);
            return res.data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["agents"] });
        },
        onError: (err: any) => {
            setError(err.response?.data?.error || "Action failed");
        },
    });

    if (isLoading) return <div>Loading agents...</div>;

    return (
        <div className="bg-white rounded-lg shadow overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-200">
                <h3 className="text-lg font-medium text-gray-900">Agent Management</h3>
            </div>

            {error && (
                <div className="mx-6 mt-4 p-3 text-sm text-red-500 bg-red-50 rounded-md">
                    {error}
                </div>
            )}

            <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                    <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Agent
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Status
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Actions
                        </th>
                    </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                    {agents?.map((agent: any) => (
                        <tr key={agent.id}>
                            <td className="px-6 py-4 whitespace-nowrap">
                                <div className="flex items-center">
                                    <div>
                                        <div className="text-sm font-medium text-gray-900">
                                            {agent.email}
                                        </div>
                                        <div className="text-sm text-gray-500">
                                            ID: {agent.id}
                                        </div>
                                    </div>
                                </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                                <span
                                    className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${agent.isActive
                                            ? "bg-green-100 text-green-800"
                                            : "bg-red-100 text-red-800"
                                        }`}
                                >
                                    {agent.isActive ? "Active" : "Suspended"}
                                </span>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                {agent.isActive ? (
                                    <button
                                        onClick={() => toggleStatusMutation.mutate({ id: agent.id, action: "suspend" })}
                                        className="text-red-600 hover:text-red-900"
                                        disabled={toggleStatusMutation.isPending}
                                    >
                                        Suspend
                                    </button>
                                ) : (
                                    <button
                                        onClick={() => toggleStatusMutation.mutate({ id: agent.id, action: "activate" })}
                                        className="text-green-600 hover:text-green-900"
                                        disabled={toggleStatusMutation.isPending}
                                    >
                                        Activate
                                    </button>
                                )}
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
}

import type { Agent } from "@/lib/types/agent";
import { useQuery } from "@tanstack/react-query";
import { agentsApi } from "@/lib/api/agents";

interface AgentActivityTabProps {
    agent: Agent;
}

function getTypeColor(type: string) {
    const t = type.toLowerCase();
    if (t.includes('trade')) return "#1890ff";
    if (t.includes('kyc') || t.includes('verify')) return "#9333ea";
    if (t.includes('login')) return "#27ae60";
    if (t.includes('commission')) return "#c9a227";
    if (t.includes('flag') || t.includes('suspend')) return "#e05555";
    if (t.includes('customer')) return "#08a965";
    return "#9aa0a6";
}

export function AgentActivityTab({ agent }: AgentActivityTabProps) {
    const { data: activities, isLoading } = useQuery({
        queryKey: ["agent-activities", agent.id],
        queryFn: () => agentsApi.getAgentActivities(agent.id),
    });

    const summaryStats = [
        { label: "Total Trades", value: agent.statistics?.totalTrades || 0 },
        { label: "Flags Raised", value: agent.statistics?.flaggedTransactions || 0 },
        { label: "Region", value: agent.region },
        { label: "Status", value: agent.status },
    ];

    return (
        <div className="space-y-6">
            {/* Summary stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {summaryStats.map((s) => (
                    <div
                        key={s.label}
                        className="rounded-xl p-4 border text-center"
                        style={{ backgroundColor: "white", borderColor: "#e1e3e6" }}
                    >
                        <p className="text-xl font-bold" style={{ color: "#2b2f33" }}>{s.value}</p>
                        <p className="text-xs mt-1" style={{ color: "#6b7078" }}>{s.label}</p>
                    </div>
                ))}
            </div>

            {/* Timeline */}
            <div
                className="rounded-xl p-5 border"
                style={{ backgroundColor: "white", borderColor: "#e1e3e6" }}
            >
                <h3 className="font-semibold text-base mb-5" style={{ color: "#2b2f33" }}>
                    Activity Timeline
                </h3>
                {isLoading ? (
                    <div className="py-10 text-center text-sm" style={{ color: "#6b7078" }}>
                        Loading activity...
                    </div>
                ) : (
                    <div className="relative">
                        {/* Vertical line */}
                        <div
                            className="absolute left-[7px] top-0 bottom-0 w-0.5"
                            style={{ backgroundColor: "#e1e3e6" }}
                        />
                        <div className="space-y-5 pl-6">
                            {activities && activities.length > 0 ? (
                                activities.map((item: any, i: number) => (
                                    <div key={i} className="relative">
                                        {/* Dot */}
                                        <div
                                            className="absolute -left-6 w-3.5 h-3.5 rounded-full border-2 top-0.5"
                                            style={{
                                                backgroundColor: getTypeColor(item.transaction),
                                                borderColor: "white",
                                            }}
                                        />
                                        <div className="flex items-start justify-between gap-4">
                                            <div>
                                                <p className="text-sm" style={{ color: "#2b2f33" }}>
                                                    {item.transaction}
                                                </p>
                                                <p className="text-xs mt-0.5" style={{ color: "#9aa0a6" }}>
                                                    {item.date} · {item.time} {item.reference && `· Ref: ${item.reference}`}
                                                </p>
                                            </div>
                                            <span
                                                className="text-xs font-medium px-2 py-0.5 rounded-full whitespace-nowrap flex-shrink-0"
                                                style={{
                                                    backgroundColor: `${getTypeColor(item.transaction)}20`,
                                                    color: getTypeColor(item.transaction),
                                                }}
                                            >
                                                Log
                                            </span>
                                        </div>
                                    </div>
                                ))
                            ) : (
                                <p className="text-sm text-center py-5" style={{ color: "#6b7078" }}>
                                    No activity recorded yet.
                                </p>
                            )}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}

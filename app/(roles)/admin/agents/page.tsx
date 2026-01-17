import AgentManagement from "@/components/features/admin/agent-management";

export default function AdminAgentsPage() {
    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <h1 className="text-2xl font-bold tracking-tight">Agent Management</h1>
            </div>
            <AgentManagement />
        </div>
    );
}

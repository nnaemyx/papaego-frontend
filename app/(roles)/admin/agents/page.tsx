"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, Download, Plus } from "lucide-react";
import { agentsApi } from "@/lib/api/agents";
import { AgentStatsCards } from "@/components/features/admin/AgentStatsCards";
import { AgentsTable } from "@/components/features/admin/AgentsTable";
import { InviteAgentSheet } from "@/components/features/admin/InviteAgentSheet";
import { InviteSuccessSheet } from "@/components/features/admin/InviteSuccessSheet";

export default function AdminAgentsPage() {
  const queryClient = useQueryClient();
  const router = useRouter();
  const [search, setSearch] = useState("");
  const [inviteOpen, setInviteOpen] = useState(false);
  const [successOpen, setSuccessOpen] = useState(false);
  const [invitedEmail, setInvitedEmail] = useState("");

  // Fetch agents
  const { data: agents = [], isLoading: agentsLoading } = useQuery({
    queryKey: ["agents", search],
    queryFn: () => agentsApi.getAgents({ search }),
  });

  // Fetch stats
  const { data: stats, isLoading: statsLoading } = useQuery({
    queryKey: ["agent-stats"],
    queryFn: agentsApi.getAgentStats,
  });

  // Suspend agent mutation
  const suspendMutation = useMutation({
    mutationFn: agentsApi.suspendAgent,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["agents"] });
      queryClient.invalidateQueries({ queryKey: ["agent-stats"] });
    },
  });

  // Activate agent mutation
  const activateMutation = useMutation({
    mutationFn: agentsApi.activateAgent,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["agents"] });
      queryClient.invalidateQueries({ queryKey: ["agent-stats"] });
    },
  });

  // Delete agent mutation
  const deleteMutation = useMutation({
    mutationFn: agentsApi.deleteAgent,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["agents"] });
      queryClient.invalidateQueries({ queryKey: ["agent-stats"] });
    },
  });

  const handleInviteSuccess = (email: string) => {
    setInvitedEmail(email);
    setSuccessOpen(true);
    queryClient.invalidateQueries({ queryKey: ["agents"] });
    queryClient.invalidateQueries({ queryKey: ["agent-stats"] });
  };

  const handleExport = async () => {
    try {
      const blob = await agentsApi.exportAgents();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `agents-${new Date().toISOString().split("T")[0]}.csv`;
      a.click();
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error("Export failed:", error);
    }
  };

  return (
    <div className="space-y-6 p-4 md:p-6 lg:pl-7 lg:pr-6" style={{ backgroundColor: '#f7f8f9' }}>
      {/* Header */}
      <div className="space-y-2">
        <h1
          className="text-4xl font-bold"
          style={{
            color: "var(--text-primary)",
            fontFamily: "var(--font-public-sans)",
          }}
        >
          Agents
        </h1>
        <p
          className="text-base"
          style={{
            color: "var(--text-secondary)",
            fontFamily: "var(--font-public-sans)",
          }}
        >
          Manage agents, monitor activity, review performance, and control
          access across the platform
        </p>
      </div>

      {/* Stats Cards */}
      {stats && <AgentStatsCards stats={stats} isLoading={statsLoading} />}

      {/* All Agents Section */}
      <div className="space-y-4">
        <h2
          className="text-2xl font-bold"
          style={{
            color: "var(--text-primary)",
            fontFamily: "var(--font-public-sans)",
          }}
        >
          All Agents
        </h2>

        {/* Filters and Actions */}
        <div className="flex flex-col md:flex-row gap-4 items-start md:items-center justify-between">
          <div className="flex gap-2 w-full md:w-auto">
            <div className="relative flex-1 md:w-80">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search by name, ID, or email"
                className="pl-10"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
          </div>

          <div className="flex gap-2">
            <Button
              variant="outline"
              onClick={handleExport}
              style={{
                borderColor: "var(--status-success)",
                color: "var(--status-success)",
              }}
            >
              <Download className="h-4 w-4 mr-2" />
              Export
            </Button>
            <Button
              style={{
                backgroundColor: "var(--brand-primary)",
                color: "white",
              }}
              onClick={() => setInviteOpen(true)}
            >
              <Plus className="h-4 w-4 mr-2" />
              New Agent
            </Button>
          </div>
        </div>

        {/* Agents Table */}
        <AgentsTable
          agents={agents}
          isLoading={agentsLoading}
          onSuspend={(id) => suspendMutation.mutate(id)}
          onActivate={(id) => activateMutation.mutate(id)}
          onDelete={(id) => deleteMutation.mutate(id)}
          onViewDetails={(id) => router.push(`/admin/agents/${id}`)}
        />
      </div>

      {/* Invite Agent Sheet */}
      <InviteAgentSheet
        open={inviteOpen}
        onOpenChange={setInviteOpen}
        onSuccess={handleInviteSuccess}
      />

      {/* Invite Success Sheet */}
      <InviteSuccessSheet
        open={successOpen}
        onOpenChange={setSuccessOpen}
        agentEmail={invitedEmail}
        onInviteAnother={() => {
          setSuccessOpen(false);
          setInviteOpen(true);
        }}
        onViewAgents={() => {
          setSuccessOpen(false);
        }}
      />
    </div>
  );
}

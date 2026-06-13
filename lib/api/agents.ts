import api from "./client";
import type {
  Agent,
  AgentStats,
  InviteAgentFormData,
} from "@/lib/types/agent";

export interface AgentFilters {
  status?: string;
  role?: string;
  region?: string;
  search?: string;
  page?: number;
  limit?: number;
}

export const agentsApi = {
  // Get all agents with optional filters
  getAgents: async (filters?: AgentFilters): Promise<Agent[]> => {
    const response = await api.get("/admin/agents", { params: filters });
    return response.data;
  },

  // Get agent statistics
  getAgentStats: async (): Promise<AgentStats> => {
    // Mock implementation - backend doesn't have this endpoint yet
    const agents = await agentsApi.getAgents();
    return {
      active: agents.filter((a) => a.status === "Active").length,
      inactive: agents.filter((a) => a.status === "Inactive").length,
      pendingVerification: agents.filter(
        (a) => a.status === "Pending Verification"
      ).length,
      flagged: agents.filter((a) => a.status === "Flagged").length,
    };
  },

  // Invite/create new agent
  inviteAgent: async (data: InviteAgentFormData) => {
    const response = await api.post("/admin/agents", {
      email: data.email,
      phone: "+234000000000", // Temporary, will be updated during onboarding
      firstName: data.firstName,
      lastName: data.lastName,
      region: data.region,
      agentType: data.agentType || "FIELD",
      notes: data.notes,
    });
    return response.data;
  },

  // Suspend agent
  suspendAgent: async (id: string) => {
    const response = await api.post(`/admin/agents/${id}/suspend`);
    return response.data;
  },

  // Activate agent
  activateAgent: async (id: string) => {
    const response = await api.post(`/admin/agents/${id}/activate`);
    return response.data;
  },

  // Get single agent
  getAgent: async (id: string): Promise<Agent> => {
    const response = await api.get(`/admin/agents/${id}`);
    return response.data;
  },

  // Delete agent
  deleteAgent: async (id: string) => {
    const response = await api.delete(`/admin/agents/${id}`);
    return response.data;
  },

  verifyDocuments: async (id: string) => {
    const response = await api.patch(`/admin/agents/${id}/verify-documents`);
    return response.data;
  },

  // Update agent
  updateAgent: async (id: string, data: Partial<Agent>) => {
    const response = await api.patch(`/admin/agents/${id}`, data);
    return response.data;
  },

  // Update agent verification
  updateAgentVerification: async (id: string, status: string) => {
    const response = await api.post(`/admin/agents/${id}/verify`, { status });
    return response.data;
  },

  // Get agent activities
  getAgentActivities: async (id: string) => {
    const response = await api.get(`/admin/agents/${id}/activities`);
    return response.data;
  },

  // Get agent transactions
  getAgentTransactions: async (id: string) => {
    const response = await api.get(`/admin/agents/${id}/transactions`);
    return response.data;
  },

  // Export agents to CSV
  exportAgents: async () => {
    const response = await api.get("/admin/agents/export", {
      responseType: 'blob'
    });
    return response.data;
  },
};

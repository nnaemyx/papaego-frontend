import api from "./client";

export interface AgentApplicationPayload {
  fullName: string;
  email: string;
  phone: string;
  country: string;
  stateCity: string;
  occupation: string;
  linkedIn?: string;
  hearAboutUs: string;
  ownsOrOperatesBusiness: boolean;
  whyAgent: string;
  networkSize?: string;
}

export interface AgentApplication {
  id: string;
  fullName: string;
  email: string;
  phone: string;
  country: string;
  stateCity: string;
  occupation: string;
  linkedIn?: string | null;
  hearAboutUs: string;
  ownsOrOperatesBusiness: boolean;
  whyAgent: string;
  networkSize?: string | null;
  status: "PENDING" | "REVIEWED" | "APPROVED" | "REJECTED";
  adminNotes?: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface AgentApplicationsResponse {
  applications: AgentApplication[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface AgentApplicationStats {
  total: number;
  pending: number;
  reviewed: number;
  approved: number;
  rejected: number;
}

export const agentApplicationsApi = {
  // Public — no auth
  submit: async (data: AgentApplicationPayload): Promise<{ message: string; id: string }> => {
    const response = await api.post("/agent-applications", data);
    return response.data;
  },

  // Admin only
  getAll: async (params?: {
    status?: string;
    search?: string;
    page?: number;
    limit?: number;
  }): Promise<AgentApplicationsResponse> => {
    const response = await api.get("/admin/agent-applications", { params });
    return response.data;
  },

  getOne: async (id: string): Promise<AgentApplication> => {
    const response = await api.get(`/admin/agent-applications/${id}`);
    return response.data;
  },

  updateStatus: async (
    id: string,
    status: string,
    adminNotes?: string
  ): Promise<{ message: string; application: AgentApplication }> => {
    const response = await api.patch(`/admin/agent-applications/${id}/status`, {
      status,
      adminNotes,
    });
    return response.data;
  },

  getStats: async (): Promise<AgentApplicationStats> => {
    const response = await api.get("/admin/agent-applications/stats");
    return response.data;
  },
};

import api, { apiClient } from "./client";

export interface AuditLogFilters {
  role?: string;
  action?: string;
  entity?: string;
  search?: string;
  page?: number;
  limit?: number;
}

export interface AuditLogStats {
  totalLogs: number;
  adminActions: number;
  agentActions: number;
  systemEvents: number;
}

export interface AuditLogEntry {
  id: string;
  logId: string;
  actor: string;
  actorType: "Admin" | "Agent" | "System";
  action: string;
  targetType: string;
  targetId: string;
  ipAddress: string;
  timestamp: string;
  severity: "Info" | "Warning" | "Critical";
  createdAt: string;
}

export const auditLogsApi = {
  // Get all audit logs with optional filters
  getAuditLogs: async (filters?: AuditLogFilters): Promise<AuditLogEntry[]> => {
    return apiClient.get<AuditLogEntry[]>("/admin/audit-logs", { params: filters });
  },

  // Get audit log statistics
  getAuditLogStats: async (): Promise<AuditLogStats> => {
    return apiClient.get<AuditLogStats>("/admin/audit-logs/stats");
  },

  // Export audit logs to CSV
  exportAuditLogs: async (): Promise<Blob> => {
    const response = await api.get("/admin/audit-logs/export", { responseType: "blob" });
    return response.data;
  },

  // Get negotiation audit logs
  getNegotiationLogs: async (params?: { page?: number; limit?: number; tradeId?: string }): Promise<{ logs: any[]; total: number }> => {
    const response = await api.get("/admin/audit-logs/negotiations", { params });
    return response.data;
  },

  // Get rate change logs
  getRateChangeLogs: async (params?: { page?: number; limit?: number; pair?: string }): Promise<{ logs: any[]; total: number }> => {
    const response = await api.get("/admin/audit-logs/rate-changes", { params });
    return response.data;
  },

  // Get payment logs
  getPaymentLogs: async (params?: { page?: number; limit?: number }): Promise<{ logs: any[]; total: number }> => {
    const response = await api.get("/admin/audit-logs/payments", { params });
    return response.data;
  },

  // Get trade audit logs
  getTradeAuditLogs: async (params?: { page?: number; limit?: number; tradeId?: string }): Promise<{ logs: any[]; total: number }> => {
    const response = await api.get("/admin/audit-logs/trades", { params });
    return response.data;
  },
};

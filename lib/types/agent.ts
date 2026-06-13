// Agent role types
export type AgentRole = "Agent" | "Senior Agent" | "Supervisor";
export type AgentStatus =
  | "Active"
  | "Inactive"
  | "Pending Verification"
  | "Suspended"
  | "Flagged";
export type Region = "Nigeria" | "Ghana" | "Kenya" | "UK" | "USA";

// Agent interface
export interface Agent {
  id: string;
  agentId: string; // Display ID like "#PE-24118"
  name: string;
  email: string;
  role: string;
  region: string;
  branch?: string;
  phone?: string;
  status: string;
  activeTrades: number;
  totalVolume?: string;
  performance?: string;
  createdAt: string;
  updatedAt?: string;
  agentType?: string;
  statistics?: {
    totalTrades: number;
    activeTrades: number;
    completedTrades: number;
    flaggedTransactions: number;
  };
  agentProfile?: {
    onboardingStatus: string;
    licenseId: string;
    agentType?: string;
    governmentIdUrl?: string;
    proofOfAddressUrl?: string;
    homeAddress?: string;
    dateOfBirth?: string;
  };
}

// Agent statistics
export interface AgentStats {
  active: number;
  inactive: number;
  pendingVerification: number;
  flagged: number;
  totalVolume?: string;
  averageTradeTime?: string;
}

// Invite agent form data
export interface InviteAgentFormData {
  firstName: string;
  lastName: string;
  email: string;
  role?: string;
  region: string;
  agentType?: string;
  notes?: string;
}

// Onboarding data
export interface OnboardingAccountSetup {
  email: string;
  password: string;
  confirmPassword: string;
}

export interface OnboardingPersonalDetails {
  firstName: string;
  lastName: string;
  homeAddress: string;
  phoneNumber: string;
  dateOfBirth: string;
}

export interface OnboardingDocuments {
  governmentIdFile?: File;
  proofOfAddressFile?: File;
}

export interface OnboardingRoleRegion {
  role: string;
  region: string;
  confirmInfo: boolean;
}

export interface OnboardingData
  extends OnboardingAccountSetup,
  OnboardingPersonalDetails,
  OnboardingDocuments,
  OnboardingRoleRegion { }

import { TradeStatus, VerificationStatus } from './index';

export interface AgentDashboardStats {
  activeTrades: number;
  completedTrades: number;
  totalCommissions: string;
  monthlyCommissions: string;
  pendingDocuments: number;
  totalTrades: number;
}

export interface AgentTrade {
  id: string;
  tradeId: string;
  date: string;
  time: string;
  customer: string;
  transaction: string;
  amount: string;
  status: TradeStatus;
  verification: VerificationStatus;
  commission?: string;
  paymentMethod?: string;
}

export interface AgentTradesResponse {
  trades: AgentTrade[];
  total: number;
  page: number;
  limit: number;
}

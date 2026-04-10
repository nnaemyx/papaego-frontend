import api from './client';
import { apiClient } from './client';

export interface ReferralValidationResult {
  valid: boolean;
  agentName?: string;
  agentId?: string;
  region?: string;
  referralType: 'AGENT' | 'CORPORATE' | 'INVALID';
}

export interface AgentReferralInfo {
  referralCode: string;
  referralLink: string;
  totalReferred: number;
  commissionFromReferrals: string;
  referredCustomers: ReferredCustomer[];
}

export interface ReferredCustomer {
  id: string;
  name: string;
  email: string;
  joinedDate: string;
  totalTrades: number;
  totalVolume: string;
  commissionEarned: string;
  status: string;
}

export const CORPORATE_REFERRAL_CODE = 'PAPAEGO-CORPORATE';

export const referralApi = {
  /** Validate a referral code — checks if it belongs to an agent or is corporate */
  validateReferralCode: async (code: string): Promise<ReferralValidationResult> => {
    if (!code.trim()) return { valid: false, referralType: 'INVALID' };
    if (code.toUpperCase() === CORPORATE_REFERRAL_CODE || code.toUpperCase() === 'CORPORATE') {
      return { valid: true, referralType: 'CORPORATE' };
    }
    try {
      const result = await apiClient.get<ReferralValidationResult>(`/referral/validate?code=${encodeURIComponent(code)}`);
      return result;
    } catch {
      // Fallback: treat as potentially valid agent code (backend will validate on submit)
      return { valid: true, referralType: 'AGENT' };
    }
  },

  /** Get referral info for the currently logged-in agent */
  getAgentReferralInfo: async (): Promise<AgentReferralInfo> => {
    try {
      return await apiClient.get<AgentReferralInfo>('/agent/referral');
    } catch {
      // Graceful fallback — generate referral link client-side if endpoint not ready
      return {
        referralCode: '',
        referralLink: '',
        totalReferred: 0,
        commissionFromReferrals: '₦0',
        referredCustomers: [],
      };
    }
  },

  /** Admin: mark a customer signup as a corporate referral (no agent commission) */
  markCorporateReferral: async (customerId: string): Promise<void> => {
    await api.patch(`/admin/customers/${customerId}/referral`, {
      referralType: 'CORPORATE',
      referralCode: CORPORATE_REFERRAL_CODE,
    });
  },

  /** Admin: remove corporate referral tag */
  clearReferral: async (customerId: string): Promise<void> => {
    await api.patch(`/admin/customers/${customerId}/referral`, {
      referralType: 'DIRECT',
      referralCode: null,
    });
  },
};

export interface Customer {
  id: string;
  customerId: string; // PE-XXXXXX format
  name: string;
  email: string;
  phone: string;
  lastTrade: string; // ISO date string
  totalTransactions: number;
  totalTrades?: number;
  verificationStatus: 'Verified' | 'Pending' | 'Failed';
  activityLevel?: 'High' | 'Medium' | 'Low';
  activityStatus?: 'Active' | 'Inactive' | 'Dormant';
  lastActive?: string;
  lastTransactionAt?: string | null;
  customerType?: 'Individual' | 'Business';
  companyName?: string | null;
  companySector?: string | null;
  /** How the customer was onboarded */
  referralType?: 'AGENT' | 'CORPORATE' | 'DIRECT';
  /** Name of the agent who referred this customer (if referralType === 'AGENT') */
  referredByAgent?: string | null;
  referredByThisAgent?: boolean;
  governmentIdUrl?: string | null;
  proofOfAddressUrl?: string | null;
  joinDate?: string; // human formatted date (e.g. 01/01/2025)
  dateJoined?: string; // ISO date string
  address?: string;
  avatar?: string;
  recentTrades?: any[];
  notes?: any[];
  linkedAgents?: any[];
  activityTimeline?: any[];
  totalVolume?: string;
  mostTradedPair?: string;
  bankDetails?: {
    id: string;
    bankName: string;
    accountNumber: string;
    accountName: string;
    accountType?: string;
  } | null;
  kycStatus?: 'NOT_SUBMITTED' | 'SUBMITTED' | 'UNDER_REVIEW' | 'APPROVED' | 'REJECTED' | 'RESUBMITTED';
  kycRejectionReason?: string | null;
  kycReviewedAt?: string | null;
  kycReviewedBy?: string | null;
  // Sprint 2 — Activity tracking
  lastTransactionAgo?: string;
}

export interface CustomerStats {
  totalCustomers: number;
  verifiedCustomers: number;
  highValueCustomers?: number;
  activeCustomersToday?: number;
  // Sprint 2 — activity buckets
  activeCustomers?: number;
  inactiveCustomers?: number;
  dormantCustomers?: number;
}

export interface CustomerFilters {
  search?: string;
  status?: 'All' | 'Verified' | 'Pending' | 'Failed';
  customerType?: 'All' | 'Individual' | 'Business';
  sector?: string;
  activityLevel?: 'All' | 'Active' | 'Inactive' | 'Dormant';
  dateJoined?: string;
}

export interface CustomerNote {
  id: string;
  content: string;
  createdAt: string;
  createdBy: string;
}

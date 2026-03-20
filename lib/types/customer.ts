export interface Customer {
  id: string;
  customerId: string; // PE-XXXXXX format
  name: string;
  email: string;
  phone: string;
  lastTrade: string; // ISO date string
  totalTransactions: number;
  verificationStatus: 'Verified' | 'Pending' | 'Failed';
  activityLevel?: 'High' | 'Medium' | 'Low';
  customerType?: 'Individual' | 'Business';
  companyName?: string | null;
  companySector?: string | null;
  governmentIdUrl?: string | null;
  proofOfAddressUrl?: string | null;
  dateJoined: string; // ISO date string
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
}

export interface CustomerStats {
  totalCustomers: number;
  verifiedCustomers: number;
  highValueCustomers: number;
  activeCustomersToday: number;
}

export interface CustomerFilters {
  search?: string;
  status?: 'All' | 'Verified' | 'Pending' | 'Failed';
  customerType?: 'All' | 'Individual' | 'Business';
  sector?: string;
  activityLevel?: 'All' | 'High' | 'Medium' | 'Low';
  dateJoined?: string;
}

export interface CustomerNote {
  id: string;
  content: string;
  createdAt: string;
  createdBy: string;
}

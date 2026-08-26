import api from "./client";

// ── Types ────────────────────────────────────────────────────────────────────

export interface CustomerSignupPayload {
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
    password: string;
    gender?: string;
    dateOfBirth?: string;
    homeAddress?: string;
    bvn: string;
    nin?: string;
    companyName?: string;
    companySector?: string;
    governmentIdUrl?: string;
    proofOfAddressUrl?: string;
    /** Referral code from an agent or CORPORATE for company-referred signups */
    referralCode?: string;
    /** AGENT | CORPORATE | DIRECT */
    referralType?: 'AGENT' | 'CORPORATE' | 'DIRECT';
}

export interface CustomerTrade {
    id: string;
    tradeId: string;
    amount: string;
    sendCurrency: string;
    receiveCurrency: string;
    fxRate: string | null;
    status: string;
    paymentProofUrl: string | null;
    recipientName: string | null;
    payoutAmount: string | null;
    lockedUntil: string | null;
    tradeRequestId?: string | null;
    createdAt: string;
}

export interface CustomerTradeDetail extends CustomerTrade {
    paymentMethod: string | null;
    paymentSource: string | null;
    payoutMethod: string | null;
    recipientDetails: string | null;
    receiptUrl: string | null;
    paymentAccountName: string | null;
    paymentAccountNumber: string | null;
    paymentBankName: string | null;
    paymentAmount: string | null;
    // Negotiation fields
    negotiationUsed: boolean;
    originalFxRate: string | null;
    negotiatedRate: string | null;
    // Rate expiry
    rateExpiresIn: number | null;
    isRateExpired: boolean;
    timeline: { action: string; createdAt: string }[];
    stages?: { key: string; label: string; description: string; completed: boolean; completedAt: string | null }[];
    agent?: { id: string; firstName: string; lastName: string; email: string } | null;
    agentRating?: { id: string; rating: number; feedback: string | null } | null;
}

export interface FxRate {
    pair: string;
    buy: number;
    sell: number;
    lastUpdated: string;
}

export interface CustomerDashboardStats {
    totalTrades: number;
    todayTrades: number;
    pendingActions: number;
    kycVerified: boolean;
    kycStatus: 'NOT_SUBMITTED' | 'SUBMITTED' | 'UNDER_REVIEW' | 'APPROVED' | 'REJECTED' | 'RESUBMITTED';
    availableBalance?: number | string;
    reservedBalance?: number | string;
}

export interface CustomerTradeRequest {
    id: string;
    amount: string;
    sendCurrency: string;
    receiveCurrency: string;
    status: "DRAFT" | "PENDING" | "REJECTED" | "PROCESSED" | "POOL" | "ASSIGNED" | "QUOTED" | "CANCELLED";
    createdAt: string;
    linkedTradeId?: string | null;
}

export interface CustomerBankDetails {
    id: string;
    bankName: string;
    accountName: string;
    accountNumber: string;
    routingNumber?: string;
    swiftCode?: string;
    updatedAt: string;
}

// ── API ───────────────────────────────────────────────────────────────────────

export const customerApi = {
    /** Register a new customer account */
    signup: async (payload: CustomerSignupPayload) => {
        const response = await api.post("/customer/portal/signup", payload);
        return response.data;
    },

    /** Step 1 of Customer Signup: Initiate registration and send OTP */
    initiateSignup: async (payload: {
        firstName: string;
        lastName: string;
        email: string;
        phone: string;
        password?: string;
        referralCode?: string;
    }) => {
        const response = await api.post("/customer/portal/signup/initiate", payload);
        return response.data;
    },

    /** Step 1.5 of Customer Signup: Verify OTP and return auth tokens */
    verifySignupOtp: async (payload: { email: string; otp: string }) => {
        const response = await api.post("/customer/portal/signup/verify", payload);
        return response.data;
    },

    /** Resend Customer Signup OTP code */
    resendSignupOtp: async (payload: { email: string }) => {
        const response = await api.post("/customer/portal/signup/resend", payload);
        return response.data;
    },

    /** Step 2 & 3 of Customer Signup: Submit KYC details for authenticated customer */
    submitSignupKyc: async (payload: {
        gender?: string;
        dateOfBirth?: string;
        homeAddress?: string;
        bvn: string;
        nin?: string;
        companyName?: string;
        companySector?: string;
        governmentIdUrl?: string;
        proofOfAddressUrl?: string;
    }) => {
        const response = await api.post("/customer/portal/signup/submit-kyc", payload);
        return response.data;
    },


    /** Upload customer document during signup (unauthenticated) */
    uploadSignupDocument: async (file: File): Promise<{ url: string }> => {
        const formData = new FormData();
        formData.append("file", file);
        const response = await api.post("/customer/portal/signup/upload", formData, {
            headers: { "Content-Type": "multipart/form-data" },
        });
        return response.data;
    },

    /** Upload KYC document and get back a URL (Now uses Cloudinary) */
    uploadDocument: async (file: File): Promise<{ url: string }> => {
        const formData = new FormData();
        formData.append("file", file); // Backend expects 'file' for general uploads
        const response = await api.post("/upload", formData, {
            headers: { "Content-Type": "multipart/form-data" },
        });
        return response.data;
    },

    /** Get authenticated customer's profile */
    getProfile: async () => {
        const response = await api.get("/customer/portal/me");
        return response.data;
    },

    /** Dashboard stats */
    getDashboardStats: async (): Promise<CustomerDashboardStats> => {
        const response = await api.get("/customer/portal/dashboard/stats");
        return response.data;
    },

    /** Get current KYC status with timeline */
    getKycStatus: async (): Promise<any> => {
        const response = await api.get("/customer/portal/kyc-status");
        return response.data;
    },

    /** Resubmit KYC documents */
    resubmitKyc: async (formData: FormData): Promise<any> => {
        const response = await api.patch("/customer/portal/kyc/resubmit", formData, {
            headers: { "Content-Type": "multipart/form-data" },
        });
        return response.data;
    },

    /** List trades with optional status filter */
    getTrades: async (params?: { status?: string; page?: number; limit?: number; search?: string }) => {
        const response = await api.get("/customer/portal/trades", { params });
        return response.data as { trades: CustomerTrade[]; total: number; page: number; limit: number };
    },

    /** Single trade detail */
    getTrade: async (id: string): Promise<CustomerTradeDetail> => {
        const response = await api.get(`/customer/portal/trades/${id}`);
        return response.data;
    },

    /** Trade Requests Section */
    createTradeRequest: async (payload: {
        amount: string;
        sendCurrency: string;
        receiveCurrency: string;
        agentId?: string;
        purpose?: string;
        tradeType?: string;
        receiptUrl?: string;
        // Supplier details (new)
        businessName?: string;
        bankName?: string;
        accountNumber?: string;
        sector?: string;
        address?: string;
        invoiceUrl?: string;
    }) => {
        const response = await api.post("/customer/portal/trade-requests", payload);
        return response.data;
    },

    getTradeRequests: async (params?: { page?: number; limit?: number; search?: string }): Promise<{ requests: CustomerTradeRequest[]; total: number; page: number; limit: number }> => {
        const response = await api.get("/customer/portal/trade-requests", { params });
        return response.data;
    },

    getTradeRequest: async (id: string): Promise<any> => {
        const response = await api.get(`/customer/portal/trade-requests/${id}`);
        return response.data;
    },

    /** Bank Details Section */
    getBankDetails: async (): Promise<CustomerBankDetails[]> => {
        const response = await api.get("/customer/portal/bank-details");
        return response.data;
    },

    upsertBankDetails: async (payload: Partial<CustomerBankDetails>) => {
        const response = await api.post("/customer/portal/bank-details", payload);
        return response.data;
    },

    /** Suppliers Section */
    getSuppliers: async (params?: { includeArchived?: boolean }): Promise<any[]> => {
        const response = await api.get("/suppliers", { params });
        return response.data;
    },

    createSupplier: async (payload: any): Promise<any> => {
        const response = await api.post("/suppliers", payload);
        return response.data;
    },

    updateSupplier: async (id: string, payload: any): Promise<any> => {
        const response = await api.put(`/suppliers/${id}`, payload);
        return response.data;
    },

    deleteSupplier: async (id: string): Promise<any> => {
        const response = await api.delete(`/suppliers/${id}`);
        return response.data;
    },

    updateTradeRequest: async (id: string, payload: any): Promise<any> => {
        const response = await api.put(`/customer/portal/trade-requests/${id}`, payload);
        return response.data;
    },

    cancelTradeRequest: async (id: string): Promise<any> => {
        const response = await api.patch(`/customer/portal/trade-requests/${id}/cancel`);
        return response.data;
    },

    cancelTrade: async (id: string): Promise<any> => {
        const response = await api.patch(`/customer/portal/trades/${id}/cancel`);
        return response.data;
    },

    rateAgent: async (id: string, rating: number, feedback?: string): Promise<any> => {
        const response = await api.post(`/customer/portal/trades/${id}/rate`, { rating, feedback });
        return response.data;
    },

    submitFeedback: async (category: string, message: string): Promise<any> => {
        const response = await api.post("/customer/portal/feedback", { category, message });
        return response.data;
    },

    /** Upload payment proof for a trade (Cloudinary version) */
    uploadPaymentProof: async (tradeId: string, file: File): Promise<any> => {
        const formData = new FormData();
        formData.append("proof", file);
        const response = await api.patch(`/customer/portal/trades/${tradeId}/proof`, formData, {
            headers: { "Content-Type": "multipart/form-data" },
        });
        return response.data;
    },

    /** Upload receipt (alternate for new flow) */
    uploadReceipt: async (tradeId: string, file: File): Promise<any> => {
        const formData = new FormData();
        formData.append("receipt", file);
        const response = await api.patch(`/customer/portal/trades/${tradeId}/upload-receipt`, formData, {
            headers: { "Content-Type": "multipart/form-data" },
        });
        return response.data;
    },

    /** Get live FX rates */
    getFxRates: async (): Promise<{ rates: FxRate[] }> => {
        const response = await api.get("/customer/portal/fx-rates");
        return response.data;
    },

    /** List active agents for trade selection */
    getAgents: async (): Promise<{ id: string; name: string; region: string }[]> => {
        const response = await api.get("/customer/portal/agents");
        return response.data;
    },

    /** Legacy: Initiate a new trade directly (Keep for compatibility if needed, but redirects to requests) */
    createTrade: async (payload: { amount: string; sendCurrency: string; receiveCurrency: string; agentId: string; purpose?: string }) => {
        return customerApi.createTradeRequest(payload);
    },

    /** Confirm supplier account and rate for a trade */
    confirmTrade: async (tradeId: string) => {
        const response = await api.patch(`/customer/portal/trades/${tradeId}/confirm`);
        return response.data;
    },

    /** Check if customer is eligible to negotiate the rate on a trade */
    getNegotiationEligibility: async (tradeId: string): Promise<{
        eligible: boolean;
        turnover: number;
        turnoverThreshold: number;
        maxDiscountPct: number;
        reason?: string;
    }> => {
        const response = await api.get(`/customer/portal/trades/${tradeId}/negotiate/eligibility`);
        return response.data;
    },

    /** Submit a negotiation request for a trade */
    requestNegotiation: async (tradeId: string, requestedRate: number): Promise<{
        success: boolean;
        message: string;
        originalRate: number;
        requestedRate: number;
        discountPct: string;
    }> => {
        const response = await api.post(`/customer/portal/trades/${tradeId}/negotiate`, { requestedRate });
        return response.data;
    },

    /** Check if negotiation is globally available */
    getNegotiationStatus: async (): Promise<{ negotiationAvailable: boolean }> => {
        const response = await api.get("/customer/portal/negotiation-status");
        return response.data;
    },

    /** Check if a specific trade can be negotiated */
    checkNegotiationEligibility: async (tradeId: string): Promise<{
        eligible: boolean;
        reason: string;
        turnoverMet: boolean;
        featureEnabled: boolean;
    }> => {
        const response = await api.get(`/customer/portal/trades/${tradeId}/negotiation-eligibility`);
        return response.data;
    },

    /** Check available ledger balance vs required amount */
    checkLedgerBalance: async (amount: number): Promise<{
        sufficient: boolean;
        availableBalance: string;
        reservedBalance: string;
        requiredAmount: string;
        shortfall: string;
        currency: string;
    }> => {
        const response = await api.post("/customer/portal/wallet/check-balance", { amount });
        return response.data;
    },

    /** Pay for trade using NGN Ledger balance */
    payFromWallet: async (tradeId: string): Promise<{ success: boolean; trade: any; message: string }> => {
        const response = await api.post(`/customer/portal/trades/${tradeId}/pay-from-wallet`);
        return response.data;
    },

    /** Initialize Paystack direct deposit */
    initializePaystackDeposit: async (amount: number): Promise<{
        reference: string;
        amount: number;
        email: string;
        publicKey: string;
        currency: string;
    }> => {
        const response = await api.post("/customer/portal/wallet/paystack/initialize", { amount });
        return response.data;
    },

    /** Verify Paystack deposit */
    verifyPaystackDeposit: async (reference: string, amount: number): Promise<{
        success: boolean;
        amount: number;
        availableBalance: string;
        message: string;
    }> => {
        const response = await api.post("/customer/portal/wallet/paystack/verify", { reference, amount });
        return response.data;
    },

    /** Apply one-time 0.05% negotiation discount to a trade */
    negotiateTrade: async (tradeId: string): Promise<{
        success: boolean;
        originalRate: number;
        negotiatedRate: number;
        discountApplied: number;
        message: string;
    }> => {
        const response = await api.post(`/customer/portal/trades/${tradeId}/negotiate`);
        return response.data;
    },
};

// ── Nigerian Industry Sectors ────────────────────────────────────────────────

export const NIGERIAN_SECTORS = [
    "Agriculture & Agribusiness",
    "Automotive & Transportation",
    "Aviation & Aerospace",
    "Banking & Financial Services",
    "Broadcasting & Media",
    "Chemical & Petrochemical",
    "Construction & Real Estate",
    "Consulting & Professional Services",
    "Consumer Goods & Retail",
    "Defence & Security",
    "E-Commerce & Digital Commerce",
    "Education & Training",
    "Energy & Power",
    "Entertainment & Arts",
    "Environmental Services",
    "Fashion & Textiles",
    "Food & Beverages",
    "Government & Public Services",
    "Healthcare & Pharmaceuticals",
    "Hospitality, Tourism & Travel",
    "Import & Export Trade",
    "Information Technology (IT)",
    "Insurance",
    "Legal Services",
    "Logistics & Supply Chain",
    "Manufacturing & Industrial",
    "Maritime & Shipping",
    "Mining & Solid Minerals",
    "Non-Governmental Organization (NGO)",
    "Oil & Gas (Upstream)",
    "Oil & Gas (Downstream)",
    "Printing & Publishing",
    "Real Estate & Property",
    "Renewable Energy",
    "Social Entrepreneurship",
    "Sports & Recreation",
    "Telecommunications",
    "Veterinary & Animal Science",
    "Other",
];

export type TransactionStatus =
  | "In Progress"
  | "Completed"
  | "Pending"
  | "Cancelled"
  | "Failed";

export type VerificationStatus = "Verified" | "Pending" | "Failed";

export interface Transaction {
  id: string;
  tradeId: string;
  date: string;
  time: string;
  customer: string;
  agent: string;
  transaction: string;
  amount: string;
  status: TransactionStatus;
  verification: VerificationStatus;
}

export interface TransactionDetail {
  id: string;
  tradeId: string;
  transactionType: string;
  amount: string;
  dateTime: string;
  verificationStatus: string;
  
  // Customer Information
  customer: {
    name: string;
    customerId: string;
    mobileNumber: string;
    email: string;
    kycStatus: string;
    kycLevel: string;
  };

  // Trade Details
  tradeDetails: {
    tradeType: string;
    fromCurrency: string;
    toCurrency: string;
    exchangeRate: string;
    localAmountPaid: string;
    foreignAmountSent: string;
    serviceFee: string;
    totalCharged: string;
  };

  // Payment Method
  paymentMethod: {
    method: string;
    source: string;
    senderBank: string;
    accountName: string;
    accountNumber: string;
  };

  // Delivery Details
  deliveryDetails: {
    method: string;
    currency: string;
    recipientBank: string;
    accountName: string;
    routingNumber: string;
    swiftCode: string;
    accountType: string;
    recipientCountry: string;
    bankAddress: string;
    notes: string;
  };

  // Timeline
  timeline: Array<{
    event: string;
    dateTime: string;
    status: string;
  }>;

  // Agent Notes
  agentNotes: Array<{
    time: string;
    note: string;
    verified?: boolean;
  }>;

  // SuperAdmin data
  handledBy: string;
}

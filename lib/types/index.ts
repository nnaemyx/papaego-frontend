export type Role = 'agent' | 'admin' | 'customer' | 'compliance';

export type TradeStatus = 'In Progress' | 'Completed' | 'Pending' | 'Cancelled';

export type VerificationStatus = 'Verified' | 'Pending' | 'Failed';

export interface User {
  id: string;
  name: string;
  email: string;
  role: Role;
  avatar?: string;
}

export interface Trade {
  id: string;
  date: string;
  time: string;
  customer: string;
  transaction: string;
  amount: string;
  status: TradeStatus;
  verification: VerificationStatus;
}

export interface DashboardStat {
  title: string;
  value: string | number;
  trend: {
    value: string;
    isPositive: boolean;
  };
  description: string;
}

export interface QuickAction {
  title: string;
  icon: string;
  gradient: 'green' | 'blue' | 'pink' | 'yellow';
  href: string;
}

// Trade Form Types
export type TradeFormStep = 1 | 2 | 3 | 4;

export interface CustomerInformation {
  customerId: string;
  emailAddress: string;
  firstName: string;
  lastName: string;
  phoneNumber: string;
  country: string;
}

export interface TradeDetails {
  tradeType?: 'buy' | 'sell';
  fromCurrency?: string;
  toCurrency?: string;
  amountSent?: string;
  amountToReceive?: string;
}

export interface PaymentInformation {
  paymentMethod?: string;
  paymentSource?: string;
  paymentProofFile?: File | null;
  paymentProofFileName?: string;
}

export interface PayoutDetails {
  payoutMethod?: string;
  recipientName?: string;
  recipientDetails?: string;
  payoutAmount?: string;
}

export interface TradeFormData {
  currentStep: TradeFormStep;
  customerInformation: Partial<CustomerInformation>;
  tradeDetails: Partial<TradeDetails>;
  paymentInformation: Partial<PaymentInformation>;
  payoutDetails: Partial<PayoutDetails>;
}

export interface StepConfig {
  number: TradeFormStep;
  label: string;
}

// Extended Transaction Details Types
export interface CustomerDetails {
  fullName: string;
  customerId: string;
  phoneNumber: string;
  emailAddress: string;
  bvnStatus: 'Verified' | 'Pending' | 'Failed';
  kycLevel: 'Completed' | 'Pending' | 'Not Started';
  customerMessage: string;
}

export interface TradeDetailsExtended {
  tradeType: 'Buy' | 'Sell';
  fromCurrency: string;
  toCurrency: string;
  exchangeRate: string;
  amountPaidNGN?: string;
  amountPaidUSD?: string;
  amountPaidGBP?: string;
  amountPaidCAD?: string;
  amountToReceiveUSD?: string;
  amountToReceiveNGN?: string;
  amountToReceiveGBP?: string;
  amountToReceiveCAD?: string;
  serviceFee: string;
  totalCharged: string;
  tradeMessage: string;
}

export interface PaymentDetails {
  paymentMethod: string;
  paymentSource: string;
  senderBank: string;
  accountName: string;
  accountNumber: string;
  paymentProof?: string;
  paymentMessage: string;
}

export interface DeliveryDetails {
  deliveryMethod: string;
  currency: string;
  recipientBank: string;
  recipientName: string;
  accountNumber: string;
  routingNumber?: string;
  swiftCode?: string;
  accountType?: string;
  recipientCountry: string;
  bankAddress: string;
  status: 'In Progress' | 'Completed' | 'Pending' | 'Failed';
  deliveryMessage: string;
}

export interface TimelineEvent {
  label: string;
  dateTime: string;
  status: 'completed' | 'in-progress' | 'pending';
}

export interface AgentNote {
  timestamp: string;
  author: string;
  content: string;
  type?: 'info' | 'warning' | 'error';
}

export interface TransactionDetailsExtended {
  transactionId: string;
  status: TradeStatus;
  verificationStatus: VerificationStatus;
  customer: string;
  handledBy: string;
  transactionType: string;
  amountPaid: string;
  dateTime: string;
  overviewMessage: string;
  customerDetails: CustomerDetails;
  tradeDetails: TradeDetailsExtended;
  paymentDetails: PaymentDetails;
  deliveryDetails: DeliveryDetails;
  timeline: TimelineEvent[];
  notes: AgentNote[];
}
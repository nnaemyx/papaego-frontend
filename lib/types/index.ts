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
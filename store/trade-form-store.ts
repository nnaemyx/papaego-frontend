import { create } from 'zustand';
import { TradeFormData, TradeFormStep } from '@/lib/types';

interface TradeFormStore extends TradeFormData {
  setCurrentStep: (step: TradeFormStep) => void;
  updateCustomerInformation: (data: Partial<TradeFormData['customerInformation']>) => void;
  updateTradeDetails: (data: Partial<TradeFormData['tradeDetails']>) => void;
  updatePaymentInformation: (data: Partial<TradeFormData['paymentInformation']>) => void;
  updatePayoutDetails: (data: Partial<TradeFormData['payoutDetails']>) => void;
  nextStep: () => void;
  previousStep: () => void;
  resetForm: () => void;
}

const initialState: TradeFormData = {
  currentStep: 1,
  customerInformation: {},
  tradeDetails: {},
  paymentInformation: {},
  payoutDetails: {},
};

export const useTradeFormStore = create<TradeFormStore>((set) => ({
  ...initialState,
  setCurrentStep: (step) => set({ currentStep: step }),
  updateCustomerInformation: (data) =>
    set((state) => ({
      customerInformation: { ...state.customerInformation, ...data },
    })),
  updateTradeDetails: (data) =>
    set((state) => ({
      tradeDetails: { ...state.tradeDetails, ...data },
    })),
  updatePaymentInformation: (data) =>
    set((state) => ({
      paymentInformation: { ...state.paymentInformation, ...data },
    })),
  updatePayoutDetails: (data) =>
    set((state) => ({
      payoutDetails: { ...state.payoutDetails, ...data },
    })),
  nextStep: () =>
    set((state) => ({
      currentStep: Math.min(4, state.currentStep + 1) as TradeFormStep,
    })),
  previousStep: () =>
    set((state) => ({
      currentStep: Math.max(1, state.currentStep - 1) as TradeFormStep,
    })),
  resetForm: () => set(initialState),
}));
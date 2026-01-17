'use client';

import { useTradeFormStore } from '@/store/trade-form-store';
import { StepperIndicator } from '@/components/trade/StepperIndicator';
import { CustomerInfoForm } from '@/components/trade/forms/CustomerInfoForm';
import { TradeDetailsForm } from '@/components/trade/forms/TradeDetailsForm';
import { PaymentInfoForm } from '@/components/trade/forms/PaymentInfoForm';
import { PayoutDetailsForm } from '@/components/trade/forms/PayoutDetailsForm';

export default function NewTradePage() {
  const { currentStep } = useTradeFormStore();

  const renderForm = () => {
    switch (currentStep) {
      case 1:
        return <CustomerInfoForm />;
      case 2:
        return <TradeDetailsForm />;
      case 3:
        return <PaymentInfoForm />;
      case 4:
        return <PayoutDetailsForm />;
      default:
        return <CustomerInfoForm />;
    }
  };

  return (
    <div className="min-h-full">
      <div className="">
        {/* Page Header */}
        <div className="mb-6 p-4 md:p-6 lg:pl-7 ">
          <h1 className="text-2xl md:text-3xl lg:text-4xl font-bold mb-2" style={{ color: 'var(--text-primary)' }}>
            New Trade
          </h1>
          <p className="text-sm md:text-base" style={{ color: 'var(--text-secondary)' }}>
            Create a new trade by entering customer details, trade information, and payout details
          </p>
        </div>

        {/* Stepper */}
        <div className="max-w-243.5 mx-auto">
          <StepperIndicator currentStep={currentStep} />
        </div>

        {/* Form Content */}
        <div className="max-w-243.5 min-h-154 mx-auto">{renderForm()}</div>
      </div>
    </div>
  );
}
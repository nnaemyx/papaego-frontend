'use client';

import { useTradeFormStore } from '@/store/trade-form-store';
import { StepperIndicator } from '@/components/trade/StepperIndicator';
import { CustomerInfoForm } from '@/components/trade/forms/CustomerInfoForm';
import { TradeDetailsForm } from '@/components/trade/forms/TradeDetailsForm';
import { PaymentInfoForm } from '@/components/trade/forms/PaymentInfoForm';
import { PayoutDetailsForm } from '@/components/trade/forms/PayoutDetailsForm';

import { useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import { agentApi } from '@/lib/api/agent';

export default function NewTradePage() {
  const { 
    currentStep, 
    updateCustomerInformation, 
    updateTradeDetails, 
    setTradeRequestId,
    resetForm 
  } = useTradeFormStore();
  const searchParams = useSearchParams();
  const requestId = searchParams.get('requestId');

  // Fetch request details if processing a request
  const { data: requestDetails } = useQuery({
    queryKey: ['trade-request-detail', requestId],
    queryFn: () => agentApi.getTradeRequests().then(reqs => reqs.find((r: any) => r.id === requestId)),
    enabled: !!requestId,
  });

  useEffect(() => {
    // Only reset if we're NATURALLY starting a new trade (no requestId)
    // or if the user just arrived. 
    // For now, let's keep it simple: if requestId exists, fill.
    if (requestDetails) {
      setTradeRequestId(requestDetails.id);
      updateCustomerInformation({
        customerId: requestDetails.customerId,
        firstName: requestDetails.customer.firstName,
        lastName: requestDetails.customer.lastName,
        emailAddress: requestDetails.customer.email,
        phoneNumber: requestDetails.customer.phone,
      });
      updateTradeDetails({
        fromCurrency: requestDetails.sendCurrency,
        toCurrency: requestDetails.receiveCurrency,
        amountSent: requestDetails.amount,
      });
    }
  }, [requestDetails, updateCustomerInformation, updateTradeDetails, setTradeRequestId]);

  useEffect(() => {
    // Reset form on initial mount if no requestId
    if (!requestId) {
        resetForm();
    }
  }, [requestId, resetForm]);

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
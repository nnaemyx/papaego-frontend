"use client";

import { useTradeFormStore } from "@/store/trade-form-store";
import { AgentStepperIndicator } from "@/components/trade/AgentStepperIndicator";
import { CustomerInfoForm } from "@/components/trade/forms/CustomerInfoForm";
import { AgentRateDetailsForm } from "@/components/trade/forms/AgentRateDetailsForm";

import { useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { agentApi } from "@/lib/api/agent";

export default function NewTradePage() {
    const {
        currentStep,
        updateCustomerInformation,
        updateTradeDetails,
        setTradeRequestId,
        resetForm,
    } = useTradeFormStore();
    const searchParams = useSearchParams();
    const requestId = searchParams.get("requestId");

    // Pre-fill from trade request if coming from trade-requests page
    const { data: requestDetails } = useQuery({
        queryKey: ["trade-request-detail", requestId],
        queryFn: () =>
            agentApi
                .getTradeRequests()
                .then((reqs: any[]) => reqs.find((r) => r.id === requestId)),
        enabled: !!requestId,
    });

    useEffect(() => {
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
        if (!requestId) {
            resetForm();
        }
    }, [requestId, resetForm]);

    const renderForm = () => {
        switch (currentStep) {
            case 1:
                return <CustomerInfoForm />;
            case 2:
                return <AgentRateDetailsForm />;
            default:
                return <CustomerInfoForm />;
        }
    };

    return (
        <div className="min-h-full">
            <div>
                {/* Page Header */}
                <div className="mb-6 p-4 md:p-6 lg:pl-7">
                    <h1
                        className="text-2xl md:text-3xl lg:text-4xl font-bold mb-2"
                        style={{ color: "var(--text-primary)" }}
                    >
                        Set Trade Rate
                    </h1>
                    <p
                        className="text-sm md:text-base"
                        style={{ color: "var(--text-secondary)" }}
                    >
                        Select the customer and provide the exchange rate. Admin will
                        handle supplier details and invoice.
                    </p>
                </div>

                {/* Stepper */}
                <div className="max-w-243.5 mx-auto">
                    <AgentStepperIndicator currentStep={currentStep} />
                </div>

                {/* Form Content */}
                <div className="max-w-243.5 min-h-154 mx-auto">{renderForm()}</div>
            </div>
        </div>
    );
}

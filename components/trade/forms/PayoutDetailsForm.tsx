'use client';

import { useForm } from 'react-hook-form';
import { useTradeFormStore } from '@/store/trade-form-store';
import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useRouter } from 'next/navigation';
import { agentApi } from '@/lib/api/agent';
import { customersApi } from '@/lib/api/customers';
import { useState, useEffect } from 'react';
import { toast } from 'sonner';
import { useQuery } from '@tanstack/react-query';
import { Landmark, Check } from 'lucide-react';

interface PayoutDetailsFormData {
  payoutMethod: string;
  recipientName: string;
  recipientDetails: string;
  payoutAmount: string;
}

export function PayoutDetailsForm() {
  const {
    customerInformation,
    tradeDetails,
    paymentInformation,
    payoutDetails,
    tradeRequestId, 
    updatePayoutDetails,
    previousStep,
    resetForm
  } = useTradeFormStore();
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Fetch customer details to get saved bank info
  const { data: customerData } = useQuery({
    queryKey: ['agent-customer-details', customerInformation.customerId],
    queryFn: () => customersApi.getCustomer(customerInformation.customerId || ''),
    enabled: !!customerInformation.customerId,
  });

  const form = useForm<PayoutDetailsFormData>({
    defaultValues: {
      payoutMethod: 'bank-transfer',
      recipientName: '',
      recipientDetails: '',
      payoutAmount: '',
      ...(payoutDetails as any),
    },
  });

  // Effect to set default recipient name to customer name if empty
  useEffect(() => {
    if (!form.getValues('recipientName') && customerInformation.firstName) {
        form.setValue('recipientName', `${customerInformation.firstName} ${customerInformation.lastName}`);
    }
  }, [customerInformation, form]);

  const applySavedBank = () => {
    if (customerData?.bankDetails) {
        const details = customerData.bankDetails;
        form.setValue('recipientName', details.accountName);
        form.setValue('recipientDetails', `Bank: ${details.bankName} | Acc: ${details.accountNumber}`);
        form.setValue('payoutMethod', 'bank-transfer');
        toast.success('Saved bank details applied!');
    }
  };

  const onSubmit = async (data: PayoutDetailsFormData) => {
    setIsSubmitting(true);
    try {
      updatePayoutDetails(data);

      // Build trade data from all form steps
      const amountRaw = String(tradeDetails.amountSent || '0').replace(/[^0-9.]/g, '');
      
      const tradeData = {
        customerId: customerInformation.customerId || '',
        amount: parseFloat(amountRaw),
        sendCurrency: tradeDetails.fromCurrency || 'GBP',
        receiveCurrency: tradeDetails.toCurrency || 'NGN',
        paymentMethod: paymentInformation.paymentMethod,
        paymentSource: paymentInformation.paymentSource,
        payoutMethod: data.payoutMethod,
        recipientName: data.recipientName,
        recipientDetails: data.recipientDetails,
        payoutAmount: data.payoutAmount,
        tradeRequestId: tradeRequestId, // NEW: Link to initiator request
        paymentProofFile: paymentInformation.paymentProofFile || null,
      };

      if (!tradeData.customerId) {
        toast.error('Customer selection is required. Please go back to Step 1.');
        setIsSubmitting(false);
        return;
      }

      await agentApi.createTrade(tradeData);

      toast.success('Trade created successfully!');
      resetForm();
      router.push('/agent/dashboard');
    } catch (error) {
      console.error('Failed to create trade:', error);
      toast.error('Failed to create trade. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };


  const handleBack = () => {
    updatePayoutDetails(form.getValues());
    previousStep();
  };

  return (
    <div className="border border-(--border-custom) rounded-xl bg-white p-4 md:p-6 lg:p-8">
      {/* Section Header */}
      <div className="mb-6 lg:mb-8">
        <h2 className="text-xl md:text-2xl font-bold mb-2" style={{ color: 'var(--text-primary)' }}>
          Payout Details
        </h2>
        <p className="text-sm md:text-base" style={{ color: 'var(--text-secondary)' }}>
          Specify where the funds should be sent after the trade is processed. Double-check recipient details to avoid delays.
        </p>
      </div>

      {/* Saved Bank Details Helper */}
      {customerData?.bankDetails && (
        <div 
          onClick={applySavedBank}
          className="mb-8 p-4 rounded-xl border border-dashed border-brand-primary/30 bg-brand-primary/5 cursor-pointer hover:bg-brand-primary/10 transition-colors flex items-center justify-between"
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-brand-primary/10 flex items-center justify-center text-brand-primary">
              <Landmark className="w-5 h-5" />
            </div>
            <div>
              <p className="text-sm font-bold text-brand-primary">Use Customer's Saved Bank Details</p>
              <p className="text-xs text-brand-primary/70">
                {customerData.bankDetails.bankName} • {customerData.bankDetails.accountNumber}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-1 text-xs font-bold text-brand-primary uppercase tracking-wider">
            Apply <Check className="w-3 h-3" />
          </div>
        </div>
      )}

      {/* Form */}
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6 md:space-y-8">
          {/* Payout Method & Recipient Name */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
            <FormField
              control={form.control}
              name="payoutMethod"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-xs" style={{ color: 'var(--text-tertiary)' }}>
                    Payout Method
                  </FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger className="h-12 rounded-lg border-border-light">
                        <SelectValue />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="bank-transfer">Bank Transfer</SelectItem>
                      <SelectItem value="mobile-money">Mobile Money</SelectItem>
                      <SelectItem value="crypto">Cryptocurrency</SelectItem>
                      <SelectItem value="cash-pickup">Cash Pickup</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="recipientName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-xs" style={{ color: 'var(--text-tertiary)' }}>
                    Recipient Name
                  </FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      placeholder="Samuel Balogun"
                      className="h-12 rounded-lg border-border-light"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          {/* Recipient Details & Payout Amount */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
            <FormField
              control={form.control}
              name="recipientDetails"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-xs" style={{ color: 'var(--text-tertiary)' }}>
                    Recipient Details
                  </FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      placeholder="Bank Name: Chase Bank   Account Number: 437..."
                      className="h-12 rounded-lg border-border-light"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="payoutAmount"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-xs" style={{ color: 'var(--text-tertiary)' }}>
                    Payout Amount
                  </FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      placeholder="$5,500"
                      className="h-12 rounded-lg border-border-light"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          {/* Action Buttons */}
          <div className="flex justify-end gap-4 pt-4">
            <Button
              type="button"
              onClick={handleBack}
              variant="outline"
              className="h-12 px-8 rounded-lg text-base font-semibold border-2"
              style={{
                borderColor: 'var(--brand-primary)',
                color: 'var(--brand-primary)',
              }}
            >
              Back
            </Button>
            <Button
              type="submit"
              disabled={isSubmitting}
              className="h-12 px-8 rounded-lg text-base font-semibold"
              style={{
                backgroundColor: 'var(--brand-primary)',
                color: '#ffffff',
              }}
            >
              {isSubmitting ? 'Creating...' : 'Create New Trade'}
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
}
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

interface PayoutDetailsFormData {
  payoutMethod: string;
  recipientName: string;
  recipientDetails: string;
  payoutAmount: string;
}

export function PayoutDetailsForm() {
  const { payoutDetails, updatePayoutDetails, previousStep, resetForm } = useTradeFormStore();
  const router = useRouter();

  const form = useForm<PayoutDetailsFormData>({
    defaultValues: {
      payoutMethod: 'bank-transfer',
      recipientName: '',
      recipientDetails: '',
      payoutAmount: '',
      ...(payoutDetails as any),
    },
  });

  const onSubmit = (data: PayoutDetailsFormData) => {
    updatePayoutDetails(data);
    // Submit the trade
    alert('Trade created successfully!');
    resetForm();
    router.push('/agent/dashboard');
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
              className="h-12 px-8 rounded-lg text-base font-semibold"
              style={{
                backgroundColor: 'var(--brand-primary)',
                color: '#ffffff',
              }}
            >
              Create New Trade
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
}
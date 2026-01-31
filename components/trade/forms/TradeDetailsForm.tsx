'use client';

import { useForm } from 'react-hook-form';
import { useTradeFormStore } from '@/store/trade-form-store';
import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
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
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { ArrowLeftRight } from 'lucide-react';

interface TradeDetailsFormData {
  tradeType: 'buy' | 'sell';
  fromCurrency: string;
  toCurrency: string;
  amountSent: string;
  amountToReceive: string;
}

const currencies = [
  { code: 'NGN', name: 'Nigerian Naira', symbol: '₦' },
  { code: 'USD', name: 'United States Dollar', symbol: '$' },
  { code: 'GBP', name: 'British Pound', symbol: '£' },
  { code: 'EUR', name: 'Euro', symbol: '€' },
  { code: 'CAD', name: 'Canadian Dollar', symbol: 'C$' },
];

export function TradeDetailsForm() {
  const { tradeDetails, updateTradeDetails, nextStep, previousStep } = useTradeFormStore();

  const form = useForm<TradeDetailsFormData>({
    defaultValues: {
      tradeType: 'buy',
      fromCurrency: '',
      toCurrency: '',
      amountSent: '',
      amountToReceive: '',
      ...tradeDetails,
    },
  });

  const onSubmit = (data: TradeDetailsFormData) => {
    updateTradeDetails(data);
    nextStep();
  };

  const handleBack = () => {
    updateTradeDetails(form.getValues());
    previousStep();
  };

  // Calculate exchange rate (mock calculation)
  // const exchangeRate = '₦1,620 / $1';

  return (
    <div className="border border-(--border-custom) bg-white p-4 md:p-6 lg:p-10 max-w-350">
      {/* Section Header */}
      <div className="mb-10">
        <h2 className="text-3xl font-bold mb-3" style={{ color: 'var(--text-primary)' }}>
          Trade Details
        </h2>
        <p className="text-base" style={{ color: 'var(--text-secondary)' }}>
          Identify the customer and confirm who this trade is for. This helps link the
          transaction to the correct customer profile
        </p>
      </div>

      {/* Form */}
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-12">
          {/* Trade Type - Flex Row */}
          <div className="flex flex-col md:flex-row md:items-center gap-4 md:gap-11">
            <h3 className="text-xl font-bold shrink-0" style={{ color: 'var(--text-primary)' }}>
              Trade Type:
            </h3>
            <FormField
              control={form.control}
              name="tradeType"
              render={({ field }) => (
                <FormItem>
                  <FormControl>
                    <RadioGroup
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                      className="flex gap-8"
                    >
                      <div className="flex items-center gap-3">
                        <RadioGroupItem value="buy" id="buy" className="w-5 h-5" />
                        <Label htmlFor="buy" className="text-lg font-normal cursor-pointer" style={{ color: 'var(--text-primary)' }}>
                          Buy
                        </Label>
                      </div>
                      <div className="flex items-center gap-3">
                        <RadioGroupItem value="sell" id="sell" className="w-5 h-5" />
                        <Label htmlFor="sell" className="text-lg font-normal cursor-pointer" style={{ color: 'var(--text-primary)' }}>
                          Sell
                        </Label>
                      </div>
                    </RadioGroup>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          {/* Currency Selection - Flex Row */}
          <div className="flex flex-col lg:flex-row gap-6 lg:gap-4 items-stretch lg:items-center">
            {/* From Currency */}
            <div className="flex flex-row items-center gap-4 max-w-100">
              <FormField
                control={form.control}
                name="fromCurrency"
                render={({ field }) => (
                  <FormItem>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger className="py-6 rounded-lg border-border-light text-base">
                          <div className="text-left">
                            <SelectValue placeholder="From Currency" />
                          </div>
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {currencies.map((currency) => (
                          <SelectItem key={currency.code} value={currency.code}>
                            {currency.code} — {currency.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              {/* Exchange Icon */}
              <div className="flex justify-center items-center shrink-0 lg:mx-2">
                <div className="w-10 h-10 rounded-full flex items-center justify-center" style={{ backgroundColor: 'var(--brand-primary)' }}>
                  <ArrowLeftRight className="w-6 h-6 text-white" />
                </div>
              </div>
            </div>


            {/* To Currency */}
            <div className="flex-1 max-w-100">
              <FormField
                control={form.control}
                name="toCurrency"
                render={({ field }) => (
                  <FormItem>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger className="py-6 rounded-lg border-border-light text-base">
                          <div className="text-left">
                            <SelectValue placeholder="To Currency" />
                          </div>
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {currencies.map((currency) => (
                          <SelectItem key={currency.code} value={currency.code}>
                            {currency.code} — {currency.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Exchange Rate Display */}
            <div className="border-2 relative rounded-lg px-4 py-3 h-12 shrink-0" style={{ borderColor: 'var(--brand-primary)', minWidth: '180px' }}>
              <div className="text-xs absolute bg-white p-1 -top-3" style={{ color: 'var(--brand-primary)' }}>
                Exchange Rate
              </div>
              <div className="text-[16px] px-1 font-bold" style={{ color: 'var(--brand-primary)' }}>
                0.00
              </div>
            </div>
          </div>

          {/* Dashed Separator */}
          <div className="border-t border-dashed my-12" style={{ borderColor: 'var(--border-custom)' }} />

          {/* Amount Fields - Flex Row */}
          <div className="flex flex-col md:flex-row gap-6 md:gap-18 ">
            {/* Amount Sent */}
            <div className="flex-1 max-w-70">
              <FormField
                control={form.control}
                name="amountSent"
                render={({ field }) => (
                  <FormItem>
                    <FormControl>
                      <Input
                        {...field}
                        placeholder="Amount Sent"
                        className="h-12 rounded-lg border-border-light text-xl font-normal placeholder:text-gray-400"
                        style={{ color: 'var(--text-primary)' }}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Amount to Receive */}
            <div className="flex-1 max-w-70">
              <FormField
                control={form.control}
                name="amountToReceive"
                render={({ field }) => (
                  <FormItem>
                    <FormControl>
                      <div className="relative">
                        <div className="absolute -top-3 p-1 bg-white left-4 text-xs font-normal" style={{ color: 'var(--status-success)' }}>
                          Amount to Receive
                        </div>
                        <Input
                          {...field}
                          placeholder="0.00"
                          className="h-12 rounded-lg px-4 placeholder:text-(--status-success) text-[16px] font-bold border-2"
                          style={{
                            color: 'var(--status-success)',
                            borderColor: 'var(--status-success)'
                          }}
                        />
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex justify-end gap-4 pt-8">
            <Button
              type="button"
              onClick={handleBack}
              variant="outline"
              className="h-14 px-12 rounded-lg text-base font-semibold border-2"
              style={{
                borderColor: 'var(--brand-primary)',
                color: 'var(--brand-primary)',
              }}
            >
              Back
            </Button>
            <Button
              type="submit"
              className="h-14 px-12 rounded-lg text-base font-semibold"
              style={{
                backgroundColor: 'var(--brand-primary)',
                color: '#ffffff',
              }}
            >
              Next
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
}
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
import { CustomerInformation } from '@/lib/types';
import { useQuery } from '@tanstack/react-query';
import { customersApi } from '@/lib/api/customers';
import { useEffect } from 'react';

const countries = [
  'Nigeria',
  'United States',
  'United Kingdom',
  'Canada',
  'Ghana',
  'South Africa',
  'Kenya',
];

export function CustomerInfoForm() {
  const { customerInformation, updateCustomerInformation, nextStep } = useTradeFormStore();

  const { data: customers = [], isLoading } = useQuery({
    queryKey: ['customers-for-trade'],
    queryFn: () => customersApi.getCustomers(),
  });

  const form = useForm<Partial<CustomerInformation>>({
    defaultValues: customerInformation,
  });

  const selectedCustomerId = form.watch('customerId');
  const selectedCustomer = customers.find(c => c.id === selectedCustomerId);

  useEffect(() => {
    if (selectedCustomer) {
      form.setValue('firstName', selectedCustomer.name.split(' ')[0] || '');
      form.setValue('lastName', selectedCustomer.name.split(' ').slice(1).join(' ') || '');
      form.setValue('emailAddress', selectedCustomer.email);
      form.setValue('phoneNumber', selectedCustomer.phone);
    }
  }, [selectedCustomerId, selectedCustomer, form]);

  const onSubmit = (data: Partial<CustomerInformation>) => {
    if (!data.customerId) {
        alert("Please select a customer");
        return;
    }
    updateCustomerInformation(data);
    nextStep();
  };

  return (
    <div className="border border-(--border-custom)  bg-white p-4 md:p-6 lg:p-8">
      {/* Section Header */}
      <div className="mb-6 lg:mb-8">
        <h2 className="text-xl md:text-2xl font-bold mb-2" style={{ color: 'var(--text-primary)' }}>
          Customer Information
        </h2>
        <p className="text-sm md:text-base" style={{ color: 'var(--text-secondary)' }}>
          Identify the customer and confirm who this trade is for. This helps link the
          transaction to the correct customer profile
        </p>
      </div>

      {/* Form */}
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 md:space-y-11.25">
          {/* Customer Selection */}
          <div className="grid grid-cols-1 gap-4 md:gap-6">
            <FormField
              control={form.control}
              name="customerId"
              render={({ field }) => (
                <FormItem>
                  <div className="text-sm font-medium mb-1" style={{ color: 'var(--text-secondary)' }}>
                    Select Customer
                  </div>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger className="h-12 rounded-lg border-border-light text-base bg-white">
                        <SelectValue placeholder={isLoading ? "Loading customers..." : "Choose a customer"} />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {customers.map((c: any) => (
                        <SelectItem key={c.id} value={c.id}>
                          {c.name} ({c.email})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          {/* Read-Only Details (Once Selected) */}
          {selectedCustomer && (
            <div className="space-y-4 md:space-y-6 animate-in fade-in slide-in-from-top-2">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold uppercase tracking-wider text-gray-400">Email Address</label>
                  <div className="p-3 bg-gray-50 border rounded-lg text-gray-700">{selectedCustomer.email}</div>
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold uppercase tracking-wider text-gray-400">Phone Number</label>
                  <div className="p-3 bg-gray-50 border rounded-lg text-gray-700">{selectedCustomer.phone}</div>
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
                 <div className="space-y-1.5">
                  <label className="text-xs font-semibold uppercase tracking-wider text-gray-400">Full Name</label>
                  <div className="p-3 bg-gray-50 border rounded-lg text-gray-700">{selectedCustomer.name}</div>
                </div>
                <FormField
                    control={form.control}
                    name="country"
                    render={({ field }) => (
                        <FormItem>
                            <label className="text-xs font-semibold uppercase tracking-wider text-gray-400 mb-1.5 block">Target Country</label>
                            <Select onValueChange={field.onChange} defaultValue={field.value || 'Nigeria'}>
                                <FormControl>
                                <SelectTrigger className="h-12 rounded-lg border-border-light text-base">
                                    <SelectValue placeholder="Country/Location" />
                                </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                {countries.map((country) => (
                                    <SelectItem key={country} value={country}>
                                    {country}
                                    </SelectItem>
                                ))}
                                </SelectContent>
                            </Select>
                            <FormMessage />
                        </FormItem>
                    )}
                />
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex justify-end gap-4 pt-4">
            <Button
              type="submit"
              className="h-12 px-8 rounded-lg text-base font-semibold"
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
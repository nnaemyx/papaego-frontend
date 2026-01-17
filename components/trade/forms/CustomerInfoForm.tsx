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

  const form = useForm<Partial<CustomerInformation>>({
    defaultValues: customerInformation,
  });

  const onSubmit = (data: Partial<CustomerInformation>) => {
    updateCustomerInformation(data);
    nextStep();
  };

  return (
    <div className="border border-border-custom  bg-white p-4 md:p-6 lg:p-8">
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
          {/* Row 1: Customer ID & Email */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
            <FormField
              control={form.control}
              name="customerId"
              render={({ field }) => (
                <FormItem>
                  <FormControl>
                    <Input
                      {...field}
                      className="h-12 rounded-lg border-border-light text-base placeholder:text-[#9AA0A6]"
                      style={{ fontSize: '16px' }}
                      placeholder='Customer ID'
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="emailAddress"
              render={({ field }) => (
                <FormItem>
                
                  <FormControl>
                    <Input
                      {...field}
                      type="email"
                      className="h-12 rounded-lg border-border-light text-base placeholder:text-[#9AA0A6]"
                      style={{ fontSize: '16px' }}
                      placeholder='Email Address'
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          {/* Row 2: First Name & Last Name */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
            <FormField
              control={form.control}
              name="firstName"
              render={({ field }) => (
                <FormItem>
               
                  <FormControl>
                    <Input
                      {...field}
                      className="h-12 rounded-lg border-border-light text-base placeholder:text-[#9AA0A6]"
                      style={{ fontSize: '16px' }}
                      placeholder='First Name'
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="lastName"
              render={({ field }) => (
                <FormItem>
                
                  <FormControl>
                    <Input
                      {...field}
                      className="h-12 rounded-lg border-border-light text-base placeholder:text-[#9AA0A6]"
                      style={{ fontSize: '16px' }}
                      placeholder='Last Name'
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          {/* Row 3: Phone Number & Country */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
            <FormField
              control={form.control}
              name="phoneNumber"
              render={({ field }) => (
                <FormItem>
                 
                  <FormControl>
                    <Input
                      {...field}
                      type="tel"
                      className="h-12 rounded-lg border-border-light text-base placeholder:text-[#9AA0A6]"
                      style={{ fontSize: '16px' }}
                      placeholder='Phone Number'
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="country"
              render={({ field }) => (
                <FormItem>
                
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger className="py-6 w-full rounded-lg border-border-light text-base">
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
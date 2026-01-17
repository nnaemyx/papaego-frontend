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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Upload, Paperclip, X } from 'lucide-react';
import { useState } from 'react';

interface PaymentInfoFormData {
  paymentMethod: string;
  paymentSource: string;
}

export function PaymentInfoForm() {
  const { paymentInformation, updatePaymentInformation, nextStep, previousStep } = useTradeFormStore();
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);

  const form = useForm<PaymentInfoFormData>({
    defaultValues: {
      paymentMethod: 'bank-transfer',
      paymentSource: 'customer-bank',
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      ...(paymentInformation as any),
    },
  });

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setUploadedFile(file);
      updatePaymentInformation({ 
        paymentProofFile: file,
        paymentProofFileName: file.name 
      });
    }
  };

  const removeFile = () => {
    setUploadedFile(null);
    updatePaymentInformation({ 
      paymentProofFile: null,
      paymentProofFileName: undefined 
    });
  };

  const onSubmit = (data: PaymentInfoFormData) => {
    updatePaymentInformation(data);
    nextStep();
  };

  const handleBack = () => {
    updatePaymentInformation(form.getValues());
    previousStep();
  };

  return (
    <div className="border border-border-custom rounded-xl bg-white p-4 md:p-6 lg:p-8">
      {/* Section Header */}
      <div className="mb-6 lg:mb-8">
        <h2 className="text-xl md:text-2xl font-bold mb-2" style={{ color: 'var(--text-primary)' }}>
          Payment Information
        </h2>
        <p className="text-sm md:text-base" style={{ color: 'var(--text-secondary)' }}>
          Provide details on how the customer is paying for this trade. Upload proof of payment if required.
        </p>
      </div>

      {/* Form */}
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6 md:space-y-8">
          {/* Payment Method & Source */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
            <FormField
              control={form.control}
              name="paymentMethod"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-xs" style={{ color: 'var(--text-tertiary)' }}>
                    Payment Method
                  </FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger className="h-12 rounded-lg border-border-light">
                        <SelectValue />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="bank-transfer">Bank Transfer</SelectItem>
                      <SelectItem value="cash">Cash</SelectItem>
                      <SelectItem value="mobile-money">Mobile Money</SelectItem>
                      <SelectItem value="crypto">Cryptocurrency</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="paymentSource"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-xs" style={{ color: 'var(--text-tertiary)' }}>
                    Payment Source
                  </FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger className="h-12 rounded-lg border-border-light">
                        <SelectValue />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="customer-bank">Customer Bank Account</SelectItem>
                      <SelectItem value="agent-wallet">Agent Wallet</SelectItem>
                      <SelectItem value="third-party">Third Party</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          {/* Upload Payment Proof */}
          <div>
            <h3 className="text-lg font-bold mb-4" style={{ color: 'var(--text-primary)' }}>
              Upload Payment Proof
            </h3>

            <div className="border-2 border-dashed rounded-xl p-8 text-center" style={{ borderColor: 'var(--border-custom)' }}>
              <input
                type="file"
                id="file-upload"
                className="hidden"
                accept=".jpg,.jpeg,.png,.pdf"
                onChange={handleFileUpload}
              />
              
              {!uploadedFile ? (
                <label htmlFor="file-upload" className="cursor-pointer">
                  <div className="flex flex-col items-center gap-4">
                    <div className="w-16 h-16 rounded-full flex items-center justify-center" style={{ backgroundColor: 'var(--brand-primary)' }}>
                      <Upload className="w-8 h-8 text-white" />
                    </div>
                    <div>
                      <p className="text-base font-semibold mb-2" style={{ color: 'var(--text-primary)' }}>
                        Click to upload or drag and drop a file here
                      </p>
                      <p className="text-sm mb-1" style={{ color: 'var(--text-secondary)' }}>
                        Upload the proof shared by the customer for this payment
                      </p>
                      <p className="text-xs" style={{ color: 'var(--text-tertiary)' }}>
                        (Make sure the document clearly shows the amount, date, and payment reference)
                      </p>
                      <p className="text-xs mt-2" style={{ color: 'var(--text-tertiary)' }}>
                        JPG, PNG, or PDF · Max size 5MB
                      </p>
                    </div>
                  </div>
                </label>
              ) : (
                <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                  <div className="flex items-center gap-3">
                    <Paperclip className="w-5 h-5" style={{ color: 'var(--brand-primary)' }} />
                    <span className="text-base" style={{ color: 'var(--brand-primary)' }}>
                      {uploadedFile.name}
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={removeFile}
                    className="p-1 hover:bg-gray-200 rounded"
                  >
                    <X className="w-5 h-5" style={{ color: 'var(--text-secondary)' }} />
                  </button>
                </div>
              )}
            </div>
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
              Next
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
}
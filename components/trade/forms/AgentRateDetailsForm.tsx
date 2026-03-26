"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { useTradeFormStore } from "@/store/trade-form-store";
import { Button } from "@/components/ui/button";
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { agentApi } from "@/lib/api/agent";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Loader2, Info } from "lucide-react";

interface RateDetailsFormData {
    fxRate: string;
    payoutAmount: string;
    notes?: string;
}

export function AgentRateDetailsForm() {
    const {
        customerInformation,
        tradeDetails,
        tradeRequestId,
        previousStep,
        resetForm,
    } = useTradeFormStore();
    const router = useRouter();
    const [isSubmitting, setIsSubmitting] = useState(false);

    const form = useForm<RateDetailsFormData>({
        defaultValues: {
            fxRate: tradeDetails.exchangeRate?.toString() || "",
            payoutAmount: "",
            notes: "",
        },
    });

    const fromCurrency = tradeDetails.fromCurrency || "GBP";
    const toCurrency = tradeDetails.toCurrency || "NGN";
    const amountSent = tradeDetails.amountSent || "0";

    const onSubmit = async (data: RateDetailsFormData) => {
        if (!customerInformation.customerId) {
            toast.error("Customer selection is required. Please go back to Step 1.");
            return;
        }

        setIsSubmitting(true);
        try {
            const amountRaw = parseFloat(
                String(amountSent).replace(/[^0-9.]/g, "")
            );

            await agentApi.createTrade({
                customerId: customerInformation.customerId,
                amount: amountRaw,
                sendCurrency: fromCurrency,
                receiveCurrency: toCurrency,
                fxRate: data.fxRate,
                payoutAmount: data.payoutAmount,
                tradeRequestId: tradeRequestId,
                // No recipient/supplier details — admin handles those
            });

            toast.success("Trade created successfully! Admin will handle the supplier details.");
            resetForm();
            router.push("/agent/dashboard");
        } catch (error) {
            console.error("Failed to create trade:", error);
            toast.error("Failed to create trade. Please try again.");
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="border border-(--border-custom) rounded-xl bg-white p-4 md:p-6 lg:p-8">
            {/* Header */}
            <div className="mb-6 lg:mb-8">
                <h2
                    className="text-xl md:text-2xl font-bold mb-2"
                    style={{ color: "var(--text-primary)" }}
                >
                    Rate Details
                </h2>
                <p
                    className="text-sm md:text-base"
                    style={{ color: "var(--text-secondary)" }}
                >
                    Set the FX rate and payout amount for this trade. Supplier details
                    will be handled by the admin.
                </p>
            </div>

            {/* Trade Summary Banner */}
            <div
                className="mb-6 p-4 rounded-xl flex items-start gap-3"
                style={{ backgroundColor: "#F0F9FF", border: "1px solid #BAE6FD" }}
            >
                <Info className="w-5 h-5 shrink-0 mt-0.5" style={{ color: "#0284C7" }} />
                <div>
                    <p className="text-sm font-bold" style={{ color: "#0369A1" }}>
                        Trade Summary
                    </p>
                    <p className="text-sm mt-0.5" style={{ color: "#0284C7" }}>
                        Customer:{" "}
                        <strong>
                            {customerInformation.firstName} {customerInformation.lastName}
                        </strong>{" "}
                        · Amount:{" "}
                        <strong>
                            {amountSent} {fromCurrency}
                        </strong>{" "}
                        → <strong>{toCurrency}</strong>
                    </p>
                    <p className="text-xs mt-1" style={{ color: "#0369A1" }}>
                        Supplier / recipient details are managed by the Admin.
                        Your role is to provide the rate.
                    </p>
                </div>
            </div>

            <Form {...form}>
                <form
                    onSubmit={form.handleSubmit(onSubmit)}
                    className="space-y-6 md:space-y-8"
                >
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
                        {/* FX Rate */}
                        <FormField
                            control={form.control}
                            name="fxRate"
                            rules={{ required: "FX rate is required" }}
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel
                                        className="text-xs"
                                        style={{ color: "var(--text-tertiary)" }}
                                    >
                                        FX Rate (1 {fromCurrency} = ? {toCurrency}){" "}
                                        <span className="text-red-500">*</span>
                                    </FormLabel>
                                    <FormControl>
                                        <Input
                                            {...field}
                                            type="number"
                                            step="0.01"
                                            placeholder="e.g. 1850.00"
                                            className="h-12 rounded-lg border-border-light"
                                        />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        {/* Payout Amount */}
                        <FormField
                            control={form.control}
                            name="payoutAmount"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel
                                        className="text-xs"
                                        style={{ color: "var(--text-tertiary)" }}
                                    >
                                        Payout Amount ({toCurrency})
                                    </FormLabel>
                                    <FormControl>
                                        <Input
                                            {...field}
                                            placeholder="e.g. 1,850,000"
                                            className="h-12 rounded-lg border-border-light"
                                        />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                    </div>

                    {/* Notes */}
                    <FormField
                        control={form.control}
                        name="notes"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel
                                    className="text-xs"
                                    style={{ color: "var(--text-tertiary)" }}
                                >
                                    Notes for Admin (optional)
                                </FormLabel>
                                <FormControl>
                                    <textarea
                                        {...field}
                                        placeholder="Any notes or special instructions for the admin…"
                                        rows={3}
                                        className="w-full border rounded-lg px-3 py-2.5 text-sm resize-none outline-none focus:ring-1"
                                        style={{
                                            borderColor: "var(--border-custom)",
                                            color: "var(--text-primary)",
                                        }}
                                    />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />

                    {/* Security note */}
                    <div
                        className="p-3 rounded-xl text-sm"
                        style={{ backgroundColor: "#E2FDED", color: "#27AE60" }}
                    >
                        🔒 Supplier and recipient details are confidential and handled
                        exclusively by Admin. You only provide the FX rate here.
                    </div>

                    {/* Actions */}
                    <div className="flex justify-end gap-4 pt-4">
                        <Button
                            type="button"
                            onClick={previousStep}
                            variant="outline"
                            className="h-12 px-8 rounded-lg text-base font-semibold border-2"
                            style={{
                                borderColor: "var(--brand-primary)",
                                color: "var(--brand-primary)",
                            }}
                        >
                            Back
                        </Button>
                        <Button
                            type="submit"
                            disabled={isSubmitting}
                            className="h-12 px-8 rounded-lg text-base font-semibold"
                            style={{
                                backgroundColor: "var(--brand-primary)",
                                color: "#ffffff",
                            }}
                        >
                            {isSubmitting ? (
                                <>
                                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                    Submitting…
                                </>
                            ) : (
                                "Submit Trade"
                            )}
                        </Button>
                    </div>
                </form>
            </Form>
        </div>
    );
}

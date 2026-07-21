"use client";

import { useState } from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { BarChart3, Globe, ChevronRight, ChevronLeft, Loader2, AlertCircle, Info } from "lucide-react";
import { toast } from "sonner";
import { qualificationApi } from "@/lib/api/qualification";
import { useOnboardingStore } from "@/store/onboarding-store";

const schema = z.object({
    hasInternationalPayments: z.boolean({ message: "Please select an option" }),
    expectedMonthlyVolume: z.number().positive().optional(),
    supplierPaymentFrequency: z.enum(["WEEKLY", "MONTHLY", "QUARTERLY", "AD_HOC"]).optional(),
    countriesOfOperation: z.array(z.string()).min(1, "Add at least one country"),
    primaryUseCase: z.string().max(500).optional(),
    additionalContext: z.string().max(1000).optional(),
});

type FormData = z.infer<typeof schema>;

interface Props {
    onNext: () => void;
    onBack: () => void;
}

const COUNTRIES = [
    "Nigeria", "Ghana", "Kenya", "South Africa", "Senegal", "Ethiopia", "Tanzania",
    "Uganda", "Côte d'Ivoire", "Cameroon", "Egypt", "Morocco", "United States",
    "United Kingdom", "China", "Germany", "France", "India", "UAE", "Other"
];

export default function QualificationForm({ onNext, onBack }: Props) {
    const { qualificationDraft, setQualificationDraft, savedOrgId, markStepComplete } = useOnboardingStore();
    const [isLoading, setIsLoading] = useState(false);
    const [selectedCountries, setSelectedCountries] = useState<string[]>(
        (qualificationDraft.countriesOfOperation as string[]) || []
    );

    const { register, handleSubmit, control, formState: { errors }, watch } = useForm<FormData>({
        resolver: zodResolver(schema),
        defaultValues: {
            ...qualificationDraft,
            countriesOfOperation: selectedCountries,
            hasInternationalPayments: qualificationDraft.hasInternationalPayments,
        }
    });

    const hasIntl = watch("hasInternationalPayments");

    const toggleCountry = (country: string, onChange: (val: string[]) => void) => {
        const updated = selectedCountries.includes(country)
            ? selectedCountries.filter(c => c !== country)
            : [...selectedCountries, country];
        setSelectedCountries(updated);
        onChange(updated);
    };

    const onSubmit = async (data: FormData) => {
        if (!savedOrgId) {
            toast.error("Please complete organization details first.");
            return;
        }
        setIsLoading(true);
        setQualificationDraft({ ...data, organizationId: savedOrgId });

        try {
            const res = await qualificationApi.submit({
                ...data,
                organizationId: savedOrgId,
                countriesOfOperation: selectedCountries,
            });

            if (res.outcome === "NOT_QUALIFIED") {
                toast.error("Your business does not qualify at this time.", { description: res.notes, duration: 8000 });
                return;
            }

            if (res.outcome === "MANUAL_REVIEW") {
                toast.info("Your application is pending manual review.", { description: res.notes, duration: 8000 });
            } else {
                toast.success("Qualification complete! Your business qualifies.");
            }

            markStepComplete("qualification");
            onNext();
        } catch (err: any) {
            toast.error(err?.response?.data?.error || "Qualification submission failed.");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
            {/* Info banner */}
            <div className="flex gap-3 p-4 rounded-xl text-sm"
                style={{ backgroundColor: "#FFF7E6", border: "1px solid #F0CD00", color: "#856404" }}>
                <Info className="w-4 h-4 text-[#C9A227] shrink-0 mt-0.5" />
                <p>
                    This assessment helps us understand your business needs. Your answers determine your eligibility for PapaEgo&apos;s cross-border payment services.
                </p>
            </div>

            {/* International payments */}
            <section>
                <div className="flex items-center gap-2 mb-5">
                    <div className="w-8 h-8 rounded-lg flex items-center justify-center"
                        style={{ backgroundColor: "#FFF7E6", border: "1px solid #F0CD00" }}>
                        <Globe className="w-4 h-4 text-[#C9A227]" />
                    </div>
                    <h2 className="text-base font-bold" style={{ color: "#012333" }}>International Payments</h2>
                </div>

                <div>
                    <label className="form-label">Does your business make or receive international payments? *</label>
                    <Controller
                        name="hasInternationalPayments"
                        control={control}
                        render={({ field }) => (
                            <div className="flex gap-4 mt-2">
                                {[{ val: true, label: "Yes" }, { val: false, label: "No" }].map(opt => (
                                    <button
                                        key={String(opt.val)}
                                        type="button"
                                        onClick={() => field.onChange(opt.val)}
                                        className={`flex-1 py-3 rounded-xl border text-sm font-semibold transition-all ${
                                            field.value === opt.val
                                                ? "border-[#C9A227] bg-[#FFF7E6] text-[#C9A227]"
                                                : "border-[#E1E3E6] bg-white text-[#6B7078] hover:border-gray-300"
                                        }`}
                                    >
                                        {opt.label}
                                    </button>
                                ))}
                            </div>
                        )}
                    />
                    {errors.hasInternationalPayments && <FieldError msg={errors.hasInternationalPayments.message!} />}
                </div>
            </section>

            {hasIntl !== false && (
                <>
                    {/* Volume & Frequency */}
                    <section>
                        <div className="flex items-center gap-2 mb-5">
                            <div className="w-8 h-8 rounded-lg flex items-center justify-center"
                                style={{ backgroundColor: "#FFF7E6", border: "1px solid #F0CD00" }}>
                                <BarChart3 className="w-4 h-4 text-[#C9A227]" />
                            </div>
                            <h2 className="text-base font-bold" style={{ color: "#012333" }}>Transaction Profile</h2>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                            <div>
                                <label className="form-label">Expected Monthly Volume (USD)</label>
                                <input
                                    {...register("expectedMonthlyVolume", { valueAsNumber: true })}
                                    type="number"
                                    className="form-input"
                                    placeholder="e.g. 50000"
                                />
                                <p className="text-xs mt-1" style={{ color: "#6B7078" }}>Used for risk assessment — not strictly enforced</p>
                            </div>

                            <div>
                                <label className="form-label">Supplier Payment Frequency</label>
                                <select {...register("supplierPaymentFrequency")} className="form-input">
                                    <option value="">Select frequency...</option>
                                    <option value="WEEKLY">Weekly</option>
                                    <option value="MONTHLY">Monthly</option>
                                    <option value="QUARTERLY">Quarterly</option>
                                    <option value="AD_HOC">Ad-hoc / As needed</option>
                                </select>
                            </div>
                        </div>
                    </section>

                    {/* Countries */}
                    <section>
                        <label className="form-label mb-2 block">Countries of Operation *</label>
                        <p className="text-xs mb-4" style={{ color: "#6B7078" }}>Select all countries you send or receive payments to/from</p>
                        <Controller
                            name="countriesOfOperation"
                            control={control}
                            render={({ field }) => (
                                <div className="flex flex-wrap gap-2">
                                    {COUNTRIES.map(country => (
                                        <button
                                            key={country}
                                            type="button"
                                            onClick={() => toggleCountry(country, field.onChange)}
                                            className={`px-3.5 py-1.5 rounded-full text-xs font-semibold border transition-all ${
                                                selectedCountries.includes(country)
                                                    ? "border-[#C9A227] bg-[#FFF7E6] text-[#C9A227]"
                                                    : "border-[#E1E3E6] bg-white text-[#6B7078] hover:border-gray-300"
                                            }`}
                                        >
                                            {country}
                                        </button>
                                    ))}
                                </div>
                            )}
                        />
                        {errors.countriesOfOperation && <FieldError msg={errors.countriesOfOperation.message!} />}
                    </section>

                    {/* Use Case */}
                    <section>
                        <label className="form-label">Primary Use Case</label>
                        <textarea
                            {...register("primaryUseCase")}
                            className="form-input resize-none"
                            rows={3}
                            placeholder="e.g. We import electronics from China and need to pay suppliers monthly in USD..."
                        />

                        <label className="form-label mt-4">Additional Context</label>
                        <textarea
                            {...register("additionalContext")}
                            className="form-input resize-none"
                            rows={3}
                            placeholder="Any other information about your payment needs..."
                        />
                    </section>
                </>
            )}

            <div className="flex justify-between pt-4 border-t" style={{ borderColor: "#E1E3E6" }}>
                <button
                    type="button"
                    onClick={onBack}
                    className="flex items-center gap-2 px-5 py-3 rounded-xl border border-[#E1E3E6] text-sm font-semibold text-[#6B7078] hover:bg-gray-50 transition-all"
                >
                    <ChevronLeft className="w-4 h-4" />
                    Back
                </button>

                <button
                    type="submit"
                    disabled={isLoading}
                    className="flex items-center gap-2 font-semibold px-8 py-3 rounded-xl text-white transition-all hover:opacity-95 disabled:opacity-60 shadow-sm"
                    style={{ backgroundColor: "#C9A227" }}
                >
                    {isLoading && <Loader2 className="w-4 h-4 animate-spin" />}
                    {isLoading ? "Submitting..." : "Continue"}
                    {!isLoading && <ChevronRight className="w-4 h-4" />}
                </button>
            </div>
        </form>
    );
}

function FieldError({ msg }: { msg: string }) {
    return (
        <div className="flex items-center gap-1.5 mt-1.5">
            <AlertCircle className="w-3.5 h-3.5 text-red-500 shrink-0" />
            <p className="text-xs text-red-500">{msg}</p>
        </div>
    );
}

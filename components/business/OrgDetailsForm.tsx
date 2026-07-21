"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Building2, Globe, Phone, User, ChevronRight, Loader2, AlertCircle } from "lucide-react";
import { toast } from "sonner";
import { organizationsApi, type CreateOrganizationPayload } from "@/lib/api/organizations";
import { useOnboardingStore } from "@/store/onboarding-store";

const schema = z.object({
    businessName: z.string().min(2, "Business name required"),
    businessType: z.enum(["LLC", "CORPORATION", "SOLE_PROPRIETOR", "PARTNERSHIP", "NGO", "OTHER"]),
    countryOfRegistration: z.string().min(2, "Required"),
    registrationNumber: z.string().optional(),
    industry: z.string().min(2, "Industry required"),
    businessAddress: z.string().min(5, "Address required"),
    city: z.string().min(2, "City required"),
    state: z.string().optional(),
    postalCode: z.string().optional(),
    country: z.string().min(2, "Country required"),
    contactEmail: z.string().email("Valid email required"),
    contactPhone: z.string().min(7, "Phone required"),
    website: z.string().url("Must be a valid URL (e.g. https://...)").optional().or(z.literal("")),
    authorizedRepName: z.string().min(2, "Required"),
    authorizedRepTitle: z.string().min(2, "Required"),
});

type FormData = z.infer<typeof schema>;

interface Props {
    onNext: () => void;
}

const BUSINESS_TYPES = [
    { value: "LLC", label: "Limited Liability Company (LLC)" },
    { value: "CORPORATION", label: "Corporation" },
    { value: "SOLE_PROPRIETOR", label: "Sole Proprietorship" },
    { value: "PARTNERSHIP", label: "Partnership" },
    { value: "NGO", label: "Non-Governmental Organization" },
    { value: "OTHER", label: "Other" },
];

const INDUSTRIES = [
    "Technology", "Manufacturing", "Agriculture", "Trade & Commerce", "Financial Services",
    "Healthcare", "Education", "Energy", "Real Estate", "Transportation & Logistics",
    "Media & Entertainment", "Professional Services", "Government", "Other"
];

export default function OrgDetailsForm({ onNext }: Props) {
    const { orgDraft, setOrgDraft, setSavedOrg, markStepComplete, savedOrgId } = useOnboardingStore();
    const [isLoading, setIsLoading] = useState(false);

    const { register, handleSubmit, formState: { errors } } = useForm<FormData>({
        resolver: zodResolver(schema),
        defaultValues: orgDraft as Partial<FormData>
    });

    const onSubmit = async (data: FormData) => {
        setIsLoading(true);
        setOrgDraft(data);
        try {
            const payload = data as CreateOrganizationPayload;

            let org;
            if (savedOrgId) {
                const res = await organizationsApi.update(savedOrgId, payload);
                org = res.organization;
            } else {
                const res = await organizationsApi.create(payload);
                org = res.organization;
            }

            setSavedOrg(org);
            markStepComplete("org-details");
            toast.success("Organization details saved!");
            onNext();
        } catch (err: any) {
            const message = err?.response?.data?.error || "Failed to save organization. Please try again.";
            toast.error(message);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
            {/* Business Information */}
            <section>
                <div className="flex items-center gap-2 mb-5">
                    <div className="w-8 h-8 rounded-lg flex items-center justify-center"
                        style={{ backgroundColor: "#FFF7E6", border: "1px solid #F0CD00" }}>
                        <Building2 className="w-4 h-4 text-[#C9A227]" />
                    </div>
                    <h2 className="text-base font-bold" style={{ color: "#012333" }}>Business Information</h2>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    <div className="md:col-span-2">
                        <label className="form-label">Legal Business Name *</label>
                        <input {...register("businessName")} className="form-input" placeholder="Acme Holdings Ltd." />
                        {errors.businessName && <FieldError msg={errors.businessName.message!} />}
                    </div>

                    <div>
                        <label className="form-label">Business Type *</label>
                        <select {...register("businessType")} className="form-input">
                            <option value="">Select type...</option>
                            {BUSINESS_TYPES.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
                        </select>
                        {errors.businessType && <FieldError msg={errors.businessType.message!} />}
                    </div>

                    <div>
                        <label className="form-label">Industry *</label>
                        <select {...register("industry")} className="form-input">
                            <option value="">Select industry...</option>
                            {INDUSTRIES.map(i => <option key={i} value={i}>{i}</option>)}
                        </select>
                        {errors.industry && <FieldError msg={errors.industry.message!} />}
                    </div>

                    <div>
                        <label className="form-label">Country of Registration *</label>
                        <input {...register("countryOfRegistration")} className="form-input" placeholder="Nigeria" />
                        {errors.countryOfRegistration && <FieldError msg={errors.countryOfRegistration.message!} />}
                    </div>

                    <div>
                        <label className="form-label">Registration Number</label>
                        <input {...register("registrationNumber")} className="form-input" placeholder="RC-1234567" />
                    </div>
                </div>
            </section>

            {/* Business Address */}
            <section>
                <div className="flex items-center gap-2 mb-5">
                    <div className="w-8 h-8 rounded-lg flex items-center justify-center"
                        style={{ backgroundColor: "#FFF7E6", border: "1px solid #F0CD00" }}>
                        <Globe className="w-4 h-4 text-[#C9A227]" />
                    </div>
                    <h2 className="text-base font-bold" style={{ color: "#012333" }}>Business Address</h2>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    <div className="md:col-span-2">
                        <label className="form-label">Street Address *</label>
                        <input {...register("businessAddress")} className="form-input" placeholder="12 Business Avenue" />
                        {errors.businessAddress && <FieldError msg={errors.businessAddress.message!} />}
                    </div>
                    <div>
                        <label className="form-label">City *</label>
                        <input {...register("city")} className="form-input" placeholder="Lagos" />
                        {errors.city && <FieldError msg={errors.city.message!} />}
                    </div>
                    <div>
                        <label className="form-label">State / Province</label>
                        <input {...register("state")} className="form-input" placeholder="Lagos State" />
                    </div>
                    <div>
                        <label className="form-label">Postal Code</label>
                        <input {...register("postalCode")} className="form-input" placeholder="100001" />
                    </div>
                    <div>
                        <label className="form-label">Country *</label>
                        <input {...register("country")} className="form-input" placeholder="Nigeria" />
                        {errors.country && <FieldError msg={errors.country.message!} />}
                    </div>
                </div>
            </section>

            {/* Contact Details */}
            <section>
                <div className="flex items-center gap-2 mb-5">
                    <div className="w-8 h-8 rounded-lg flex items-center justify-center"
                        style={{ backgroundColor: "#FFF7E6", border: "1px solid #F0CD00" }}>
                        <Phone className="w-4 h-4 text-[#C9A227]" />
                    </div>
                    <h2 className="text-base font-bold" style={{ color: "#012333" }}>Contact Details</h2>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    <div>
                        <label className="form-label">Business Email *</label>
                        <input {...register("contactEmail")} type="email" className="form-input" placeholder="info@company.com" />
                        {errors.contactEmail && <FieldError msg={errors.contactEmail.message!} />}
                    </div>
                    <div>
                        <label className="form-label">Business Phone *</label>
                        <input {...register("contactPhone")} className="form-input" placeholder="+234 800 000 0000" />
                        {errors.contactPhone && <FieldError msg={errors.contactPhone.message!} />}
                    </div>
                    <div className="md:col-span-2">
                        <label className="form-label">Website</label>
                        <input {...register("website")} className="form-input" placeholder="https://yourcompany.com" />
                        {errors.website && <FieldError msg={errors.website.message!} />}
                    </div>
                </div>
            </section>

            {/* Authorized Representative */}
            <section>
                <div className="flex items-center gap-2 mb-5">
                    <div className="w-8 h-8 rounded-lg flex items-center justify-center"
                        style={{ backgroundColor: "#FFF7E6", border: "1px solid #F0CD00" }}>
                        <User className="w-4 h-4 text-[#C9A227]" />
                    </div>
                    <h2 className="text-base font-bold" style={{ color: "#012333" }}>Authorized Representative</h2>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    <div>
                        <label className="form-label">Full Name *</label>
                        <input {...register("authorizedRepName")} className="form-input" placeholder="John Doe" />
                        {errors.authorizedRepName && <FieldError msg={errors.authorizedRepName.message!} />}
                    </div>
                    <div>
                        <label className="form-label">Title / Role *</label>
                        <input {...register("authorizedRepTitle")} className="form-input" placeholder="CEO / Director" />
                        {errors.authorizedRepTitle && <FieldError msg={errors.authorizedRepTitle.message!} />}
                    </div>
                </div>
            </section>

            <div className="flex justify-end pt-4 border-t" style={{ borderColor: "#E1E3E6" }}>
                <button
                    type="submit"
                    disabled={isLoading}
                    className="flex items-center gap-2 font-semibold px-8 py-3 rounded-xl text-white transition-all hover:opacity-95 disabled:opacity-60 shadow-sm"
                    style={{ backgroundColor: "#C9A227" }}
                >
                    {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
                    {isLoading ? "Saving..." : "Continue"}
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

"use client";

import { useState, useRef } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { User, IdCard, Upload, ChevronRight, ChevronLeft, Loader2, AlertCircle, CheckCircle2 } from "lucide-react";
import { toast } from "sonner";
import { complianceApi, type KycSubmitPayload } from "@/lib/api/compliance-kyc-kyb";
import { useOnboardingStore } from "@/store/onboarding-store";

const schema = z.object({
    fullName: z.string().min(2, "Full name required"),
    dateOfBirth: z.string().refine(d => !isNaN(Date.parse(d)), "Valid date required"),
    nationality: z.string().min(2, "Nationality required"),
    residentialAddress: z.string().min(5, "Address required"),
    phone: z.string().min(7, "Phone required"),
    email: z.string().email("Valid email required"),
    idType: z.enum(["PASSPORT", "NATIONAL_ID", "DRIVERS_LICENSE"]),
});

type FormData = z.infer<typeof schema>;

interface Props {
    onNext: () => void;
    onBack: () => void;
}

const ID_TYPES = [
    { value: "PASSPORT", label: "International Passport" },
    { value: "NATIONAL_ID", label: "National Identity Card" },
    { value: "DRIVERS_LICENSE", label: "Driver's License" },
];

export default function KycForm({ onNext, onBack }: Props) {
    const { kycDraft, setKycDraft, savedOrg, savedOrgId, markStepComplete } = useOnboardingStore();
    const [isLoading, setIsLoading] = useState(false);
    const [uploadedFile, setUploadedFile] = useState<File | null>(null);
    const [selfieFile, setSelfieFile] = useState<File | null>(null);
    const fileRef = useRef<HTMLInputElement>(null);
    const selfieRef = useRef<HTMLInputElement>(null);

    const existingKyc = savedOrg?.kycRequests?.[0];
    const hasExistingDoc = !!(existingKyc?.id || existingKyc?.documents?.length);

    const { register, handleSubmit, setValue, watch, formState: { errors } } = useForm<FormData>({
        resolver: zodResolver(schema),
        defaultValues: {
            idType: existingKyc?.idType || "PASSPORT",
            fullName: existingKyc?.fullName || kycDraft.fullName || "",
            dateOfBirth: existingKyc?.dateOfBirth ? new Date(existingKyc.dateOfBirth).toISOString().split('T')[0] : (kycDraft.dateOfBirth ? new Date(kycDraft.dateOfBirth).toISOString().split('T')[0] : ""),
            nationality: existingKyc?.nationality || kycDraft.nationality || "",
            residentialAddress: existingKyc?.residentialAddress || kycDraft.residentialAddress || "",
            phone: existingKyc?.phone || kycDraft.phone || "",
            email: existingKyc?.email || kycDraft.email || "",
            ...kycDraft
        } as Partial<FormData>
    });

    const selectedIdType = watch("idType") || "PASSPORT";

    const onSubmit = async (data: FormData) => {
        if (!savedOrgId) { toast.error("Complete organization details first."); return; }
        if (!uploadedFile && !hasExistingDoc) { toast.error("Please upload your government-issued ID."); return; }

        setIsLoading(true);
        setKycDraft(data as Partial<KycSubmitPayload>);

        try {
            const res = await complianceApi.submitKyc({
                ...data,
                organizationId: savedOrgId,
                idType: data.idType as "PASSPORT" | "NATIONAL_ID" | "DRIVERS_LICENSE",
            });

            const kycRequestId = (res as any)?.kyc?.id || (res as any)?.kycId;
            if (!kycRequestId) {
                throw new Error((res as any)?.message || "Failed to retrieve KYC Request ID");
            }

            if (uploadedFile) {
                const formData = new FormData();
                formData.append("file", uploadedFile);
                formData.append("organizationId", savedOrgId);
                formData.append("kycRequestId", kycRequestId);
                formData.append("documentType", data.idType);
                await complianceApi.uploadDocument(formData);
            }

            if (selfieFile) {
                const selfieFormData = new FormData();
                selfieFormData.append("file", selfieFile);
                selfieFormData.append("organizationId", savedOrgId);
                selfieFormData.append("kycRequestId", kycRequestId);
                selfieFormData.append("documentType", "SELFIE");
                await complianceApi.uploadDocument(selfieFormData);
            }

            toast.success((res as any)?.message || "KYC application updated successfully!");
            markStepComplete("kyc");
            onNext();
        } catch (err: any) {
            console.error("KYC submission error:", err);
            toast.error(err?.response?.data?.error || err?.message || "KYC submission failed. Please try again.");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">

            {/* Personal Information */}
            <section>
                <div className="flex items-center gap-2 mb-5">
                    <div className="w-8 h-8 rounded-lg flex items-center justify-center"
                        style={{ backgroundColor: "#FFF7E6", border: "1px solid #F0CD00" }}>
                        <User className="w-4 h-4 text-[#C9A227]" />
                    </div>
                    <h2 className="text-base font-bold" style={{ color: "#012333" }}>Personal Information</h2>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    <div className="md:col-span-2">
                        <label className="form-label">Full Legal Name *</label>
                        <input {...register("fullName")} className="form-input" placeholder="As it appears on your ID" />
                        {errors.fullName && <FieldError msg={errors.fullName.message!} />}
                    </div>
                    <div>
                        <label className="form-label">Date of Birth *</label>
                        <input {...register("dateOfBirth")} type="date" className="form-input" />
                        {errors.dateOfBirth && <FieldError msg={errors.dateOfBirth.message!} />}
                    </div>
                    <div>
                        <label className="form-label">Nationality *</label>
                        <input {...register("nationality")} className="form-input" placeholder="Nigerian" />
                        {errors.nationality && <FieldError msg={errors.nationality.message!} />}
                    </div>
                    <div className="md:col-span-2">
                        <label className="form-label">Residential Address *</label>
                        <input {...register("residentialAddress")} className="form-input" placeholder="Full residential address" />
                        {errors.residentialAddress && <FieldError msg={errors.residentialAddress.message!} />}
                    </div>
                    <div>
                        <label className="form-label">Phone Number *</label>
                        <input {...register("phone")} className="form-input" placeholder="+234 800 000 0000" />
                        {errors.phone && <FieldError msg={errors.phone.message!} />}
                    </div>
                    <div>
                        <label className="form-label">Email Address *</label>
                        <input {...register("email")} type="email" className="form-input" placeholder="you@email.com" />
                        {errors.email && <FieldError msg={errors.email.message!} />}
                    </div>
                </div>
            </section>

            {/* ID Document */}
            <section>
                <div className="flex items-center gap-2 mb-5">
                    <div className="w-8 h-8 rounded-lg flex items-center justify-center"
                        style={{ backgroundColor: "#FFF7E6", border: "1px solid #F0CD00" }}>
                        <IdCard className="w-4 h-4 text-[#C9A227]" />
                    </div>
                    <h2 className="text-base font-bold" style={{ color: "#012333" }}>Government-Issued ID</h2>
                </div>

                <div className="mb-5">
                    <label className="form-label">ID Type *</label>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mt-2">
                        {ID_TYPES.map(t => {
                            const isSelected = selectedIdType === t.value;
                            return (
                                <button
                                    key={t.value}
                                    type="button"
                                    onClick={() => setValue("idType", t.value as any, { shouldValidate: true, shouldDirty: true, shouldTouch: true })}
                                    className={`p-3.5 rounded-xl border text-center text-xs font-semibold transition-all flex items-center justify-center gap-2 cursor-pointer ${
                                        isSelected
                                            ? "border-[#C9A227] bg-[#FFF7E6] text-[#C9A227] shadow-sm font-bold ring-2 ring-[#C9A227]/30"
                                            : "border-[#E1E3E6] bg-white text-[#6B7078] hover:border-slate-300 hover:bg-slate-50"
                                    }`}
                                >
                                    <div className={`w-3.5 h-3.5 rounded-full border flex items-center justify-center shrink-0 ${
                                        isSelected ? "border-[#C9A227] bg-[#C9A227]" : "border-slate-300 bg-white"
                                    }`}>
                                        {isSelected && <div className="w-1.5 h-1.5 rounded-full bg-white" />}
                                    </div>
                                    <span className="truncate">{t.label}</span>
                                </button>
                            );
                        })}
                    </div>
                    <input type="hidden" {...register("idType")} />
                    {errors.idType && <FieldError msg={errors.idType.message!} />}
                </div>

                {/* File uploads */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FileDropZone
                        label="ID Document *"
                        hint="Upload front of your ID (JPG, PNG or PDF, max 10MB)"
                        file={uploadedFile}
                        onFile={setUploadedFile}
                        inputRef={fileRef}
                    />
                    <FileDropZone
                        label="Selfie Photo"
                        hint="Clear photo of your face (optional for Sprint 1)"
                        file={selfieFile}
                        onFile={setSelfieFile}
                        inputRef={selfieRef}
                        optional
                    />
                </div>
            </section>

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
                    {isLoading ? "Submitting KYC..." : "Submit KYC"}
                    {!isLoading && <ChevronRight className="w-4 h-4" />}
                </button>
            </div>
        </form>
    );
}

function FileDropZone({ label, hint, file, onFile, inputRef, optional }: {
    label: string; hint: string; file: File | null;
    onFile: (f: File) => void; inputRef: React.RefObject<HTMLInputElement | null>;
    optional?: boolean;
}) {
    const handleDrop = (e: React.DragEvent) => {
        e.preventDefault();
        const dropped = e.dataTransfer.files[0];
        if (dropped) onFile(dropped);
    };

    return (
        <div>
            <label className="form-label">{label}{optional ? " (Optional)" : ""}</label>
            <div
                onDrop={handleDrop}
                onDragOver={e => e.preventDefault()}
                onClick={() => inputRef.current?.click()}
                className={`relative mt-2 border-2 border-dashed rounded-xl p-6 text-center cursor-pointer transition-all ${
                    file
                        ? "border-emerald-500 bg-emerald-50"
                        : "border-gray-200 bg-gray-50 hover:border-[#C9A227] hover:bg-[#FFF7E6]/40"
                }`}
            >
                <input
                    ref={inputRef}
                    type="file"
                    accept=".jpg,.jpeg,.png,.pdf"
                    className="sr-only"
                    onChange={e => { const f = e.target.files?.[0]; if (f) onFile(f); }}
                />
                {file ? (
                    <div className="flex flex-col items-center gap-2">
                        <CheckCircle2 className="w-7 h-7 text-emerald-600" />
                        <p className="text-emerald-800 text-sm font-medium truncate max-w-full">{file.name}</p>
                        <p className="text-emerald-600 text-xs">{(file.size / 1024).toFixed(0)} KB</p>
                    </div>
                ) : (
                    <div className="flex flex-col items-center gap-2">
                        <Upload className="w-7 h-7 text-gray-400" />
                        <p className="text-[#012333] text-sm font-semibold">Click or drag to upload</p>
                        <p className="text-xs" style={{ color: "#6B7078" }}>{hint}</p>
                    </div>
                )}
            </div>
        </div>
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

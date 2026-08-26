"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Building, Users, Plus, Trash2, ChevronRight, ChevronLeft, Loader2, AlertCircle, Upload, CheckCircle2 } from "lucide-react";
import { toast } from "sonner";
import { complianceApi, type Director, type UBO } from "@/lib/api/compliance-kyc-kyb";
import { useOnboardingStore } from "@/store/onboarding-store";

const schema = z.object({
    companyName: z.string().min(2, "Required"),
    registrationNumber: z.string().min(2, "Required"),
    countryOfIncorporation: z.string().min(2, "Required"),
    businessAddress: z.string().min(5, "Required"),
    taxIdentification: z.string().optional(),
});

type FormData = z.infer<typeof schema>;

interface Props {
    onNext: () => void;
    onBack: () => void;
}

export default function KybForm({ onNext, onBack }: Props) {
    const { kybDraft, savedOrgId, markStepComplete, directors: storedDirectors, ubos: storedUbos, setDirectors, setUbos } = useOnboardingStore();
    const [isLoading, setIsLoading] = useState(false);
    const [directors, setLocalDirectors] = useState<Director[]>(storedDirectors.length ? storedDirectors : [{ name: "", role: "", dateOfBirth: "", nationality: "" }]);
    const [ubos, setLocalUbos] = useState<UBO[]>(storedUbos.length ? storedUbos : []);
    const [incCertFile, setIncCertFile] = useState<File | null>(null);

    const { register, handleSubmit, formState: { errors } } = useForm<FormData>({
        resolver: zodResolver(schema),
        defaultValues: kybDraft as Partial<FormData>
    });

    const addDirector = () => setLocalDirectors(d => [...d, { name: "", role: "", dateOfBirth: "", nationality: "" }]);
    const removeDirector = (i: number) => setLocalDirectors(d => d.filter((_, idx) => idx !== i));
    const updateDirector = (i: number, field: keyof Director, val: string) =>
        setLocalDirectors(d => d.map((dir, idx) => idx === i ? { ...dir, [field]: val } : dir));

    const addUBO = () => setLocalUbos(u => [...u, { name: "", ownershipPercentage: 0, nationality: "", dateOfBirth: "" }]);
    const removeUBO = (i: number) => setLocalUbos(u => u.filter((_, idx) => idx !== i));
    const updateUBO = (i: number, field: keyof UBO, val: string | number) =>
        setLocalUbos(u => u.map((ubo, idx) => idx === i ? { ...ubo, [field]: val } : ubo));

    const onSubmit = async (data: FormData) => {
        if (!savedOrgId) { toast.error("Complete organization details first."); return; }

        const validDirectors = directors.filter(d => d.name.trim());
        if (validDirectors.length === 0) { toast.error("At least one director is required."); return; }

        setDirectors(validDirectors);
        setUbos(ubos);
        setIsLoading(true);

        try {
            const res = await complianceApi.submitKyb({
                ...data,
                organizationId: savedOrgId,
                directors: validDirectors,
                ubos: ubos.filter(u => u.name.trim()),
            });

            const kybRequestId = (res as any)?.kyb?.id || (res as any)?.kybId;

            if (incCertFile && kybRequestId) {
                const fd = new FormData();
                fd.append("file", incCertFile);
                fd.append("organizationId", savedOrgId);
                fd.append("kybRequestId", kybRequestId);
                fd.append("documentType", "CERTIFICATE_OF_INCORPORATION");
                await complianceApi.uploadDocument(fd);
            }

            toast.success((res as any)?.message || "KYB application submitted successfully!");
            markStepComplete("kyb");
            onNext();
        } catch (err: any) {
            console.error("KYB submission error:", err);
            toast.error(err?.response?.data?.error || err?.message || "KYB submission failed.");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
            {/* Company Info */}
            <section>
                <div className="flex items-center gap-2 mb-5">
                    <div className="w-8 h-8 rounded-lg flex items-center justify-center"
                        style={{ backgroundColor: "#FFF7E6", border: "1px solid #F0CD00" }}>
                        <Building className="w-4 h-4 text-[#C9A227]" />
                    </div>
                    <h2 className="text-base font-bold" style={{ color: "#012333" }}>Company Information</h2>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    <div className="md:col-span-2">
                        <label className="form-label">Company Name (as registered) *</label>
                        <input {...register("companyName")} className="form-input" placeholder="Acme Holdings Limited" />
                        {errors.companyName && <FieldError msg={errors.companyName.message!} />}
                    </div>
                    <div>
                        <label className="form-label">Registration Number *</label>
                        <input {...register("registrationNumber")} className="form-input" placeholder="RC-1234567" />
                        {errors.registrationNumber && <FieldError msg={errors.registrationNumber.message!} />}
                    </div>
                    <div>
                        <label className="form-label">Country of Incorporation *</label>
                        <input {...register("countryOfIncorporation")} className="form-input" placeholder="Nigeria" />
                        {errors.countryOfIncorporation && <FieldError msg={errors.countryOfIncorporation.message!} />}
                    </div>
                    <div className="md:col-span-2">
                        <label className="form-label">Registered Business Address *</label>
                        <input {...register("businessAddress")} className="form-input" placeholder="12 Business Avenue, Lagos, Nigeria" />
                        {errors.businessAddress && <FieldError msg={errors.businessAddress.message!} />}
                    </div>
                    <div>
                        <label className="form-label">Tax Identification Number</label>
                        <input {...register("taxIdentification")} className="form-input" placeholder="e.g. 0123456789" />
                    </div>
                </div>
            </section>

            {/* Certificate of Incorporation */}
            <section>
                <label className="form-label mb-2 block">Certificate of Incorporation</label>
                <div
                    onClick={() => document.getElementById("inc-cert-upload")?.click()}
                    className={`border-2 border-dashed rounded-xl p-6 text-center cursor-pointer transition-all ${
                        incCertFile ? "border-emerald-500 bg-emerald-50 text-emerald-800" : "border-gray-200 bg-gray-50 hover:border-[#C9A227]"
                    }`}
                >
                    <input id="inc-cert-upload" type="file" accept=".jpg,.jpeg,.png,.pdf" className="sr-only"
                        onChange={e => { const f = e.target.files?.[0]; if (f) setIncCertFile(f); }} />
                    {incCertFile ? (
                        <div className="flex items-center justify-center gap-2 text-emerald-700">
                            <CheckCircle2 className="w-5 h-5" />
                            <span className="text-sm font-semibold">{incCertFile.name}</span>
                        </div>
                    ) : (
                        <div className="flex flex-col items-center gap-2 text-[#6B7078]">
                            <Upload className="w-6 h-6 text-gray-400" />
                            <span className="text-sm font-medium">Upload Certificate of Incorporation (PDF, JPG, PNG)</span>
                        </div>
                    )}
                </div>
            </section>

            {/* Directors */}
            <section>
                <div className="flex items-center justify-between mb-5">
                    <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-lg flex items-center justify-center"
                            style={{ backgroundColor: "#FFF7E6", border: "1px solid #F0CD00" }}>
                            <Users className="w-4 h-4 text-[#C9A227]" />
                        </div>
                        <h2 className="text-base font-bold" style={{ color: "#012333" }}>Directors</h2>
                    </div>
                    <button type="button" onClick={addDirector}
                        className="flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-lg border transition-all"
                        style={{ backgroundColor: "#FFF7E6", borderColor: "#F0CD00", color: "#C9A227" }}>
                        <Plus className="w-3.5 h-3.5" />
                        Add Director
                    </button>
                </div>

                <div className="space-y-4">
                    {directors.map((dir, i) => (
                        <div key={i} className="bg-gray-50 border rounded-xl p-4" style={{ borderColor: "#E1E3E6" }}>
                            <div className="flex items-center justify-between mb-4">
                                <span className="text-xs font-bold uppercase tracking-wider" style={{ color: "#6B7078" }}>Director {i + 1}</span>
                                {directors.length > 1 && (
                                    <button type="button" onClick={() => removeDirector(i)}
                                        className="text-red-500 hover:text-red-700 transition-colors">
                                        <Trash2 className="w-4 h-4" />
                                    </button>
                                )}
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                <div>
                                    <label className="form-label">Full Name *</label>
                                    <input value={dir.name} onChange={e => updateDirector(i, "name", e.target.value)}
                                        className="form-input" placeholder="John Doe" />
                                </div>
                                <div>
                                    <label className="form-label">Role / Title *</label>
                                    <input value={dir.role} onChange={e => updateDirector(i, "role", e.target.value)}
                                        className="form-input" placeholder="Managing Director" />
                                </div>
                                <div>
                                    <label className="form-label">Date of Birth</label>
                                    <input value={dir.dateOfBirth || ""} type="date" onChange={e => updateDirector(i, "dateOfBirth", e.target.value)}
                                        className="form-input" />
                                </div>
                                <div>
                                    <label className="form-label">Nationality</label>
                                    <input value={dir.nationality || ""} onChange={e => updateDirector(i, "nationality", e.target.value)}
                                        className="form-input" placeholder="Nigerian" />
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </section>

            {/* UBOs */}
            <section>
                <div className="flex items-center justify-between mb-5">
                    <div>
                        <h2 className="text-base font-bold" style={{ color: "#012333" }}>Ultimate Beneficial Owners (UBOs)</h2>
                        <p className="text-xs mt-0.5" style={{ color: "#6B7078" }}>Individuals owning 25% or more of the company</p>
                    </div>
                    <button type="button" onClick={addUBO}
                        className="flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-lg border transition-all"
                        style={{ backgroundColor: "#FFF7E6", borderColor: "#F0CD00", color: "#C9A227" }}>
                        <Plus className="w-3.5 h-3.5" />
                        Add UBO
                    </button>
                </div>

                {ubos.length === 0 ? (
                    <div className="border border-dashed rounded-xl p-6 text-center text-sm"
                        style={{ borderColor: "#E1E3E6", color: "#6B7078" }}>
                        No UBOs added. Click "Add UBO" if applicable.
                    </div>
                ) : (
                    <div className="space-y-4">
                        {ubos.map((ubo, i) => (
                            <div key={i} className="bg-gray-50 border rounded-xl p-4" style={{ borderColor: "#E1E3E6" }}>
                                <div className="flex items-center justify-between mb-3">
                                    <span className="text-xs font-bold uppercase tracking-wider" style={{ color: "#6B7078" }}>UBO {i + 1}</span>
                                    <button type="button" onClick={() => removeUBO(i)} className="text-red-500 hover:text-red-700">
                                        <Trash2 className="w-4 h-4" />
                                    </button>
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                    <div>
                                        <label className="form-label">Full Name *</label>
                                        <input value={ubo.name} onChange={e => updateUBO(i, "name", e.target.value)}
                                            className="form-input" placeholder="Jane Doe" />
                                    </div>
                                    <div>
                                        <label className="form-label">Ownership % *</label>
                                        <input value={ubo.ownershipPercentage} type="number" min={0} max={100}
                                            onChange={e => updateUBO(i, "ownershipPercentage", parseFloat(e.target.value))}
                                            className="form-input" placeholder="25" />
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </section>

            <div className="flex justify-between pt-4 border-t" style={{ borderColor: "#E1E3E6" }}>
                <button type="button" onClick={onBack}
                    className="flex items-center gap-2 px-5 py-3 rounded-xl border border-[#E1E3E6] text-sm font-semibold text-[#6B7078] hover:bg-gray-50 transition-all">
                    <ChevronLeft className="w-4 h-4" />
                    Back
                </button>
                <button type="submit" disabled={isLoading}
                    className="flex items-center gap-2 font-semibold px-8 py-3 rounded-xl text-white transition-all hover:opacity-95 disabled:opacity-60 shadow-sm"
                    style={{ backgroundColor: "#C9A227" }}>
                    {isLoading && <Loader2 className="w-4 h-4 animate-spin" />}
                    {isLoading ? "Submitting KYB..." : "Submit KYB"}
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

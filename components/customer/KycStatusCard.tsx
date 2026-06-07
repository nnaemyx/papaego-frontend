"use client";

import { useState, useRef, useEffect } from "react";
import { 
  ShieldAlert, ShieldCheck, Hourglass, CheckCircle2, 
  AlertCircle, Upload, X, Loader2, FileText 
} from "lucide-react";
import { customerApi } from "@/lib/api/customer";

interface KycStatusCardProps {
  initialStatus: 'NOT_SUBMITTED' | 'SUBMITTED' | 'UNDER_REVIEW' | 'APPROVED' | 'REJECTED' | 'RESUBMITTED';
  onStatusUpdate?: () => void;
}

export function KycStatusCard({ initialStatus, onStatusUpdate }: KycStatusCardProps) {
  const [status, setStatus] = useState(initialStatus);
  const [rejectionReason, setRejectionReason] = useState<string | null>(null);
  const [stages, setStages] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Resubmission state
  const [govIdFile, setGovIdFile] = useState<File | null>(null);
  const [proofFile, setProofFile] = useState<File | null>(null);
  const govIdRef = useRef<HTMLInputElement>(null);
  const proofRef = useRef<HTMLInputElement>(null);

  const fetchKycStatus = async () => {
    try {
      setLoading(true);
      const data = await customerApi.getKycStatus();
      setStatus(data.status);
      setRejectionReason(data.rejectionReason);
      setStages(data.stages || []);
    } catch (err) {
      console.error("Failed to load KYC status:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchKycStatus();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initialStatus]);

  const handleResubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!govIdFile && !proofFile) {
      setError("Please select at least one document to resubmit");
      return;
    }

    setUploading(true);
    setError(null);

    try {
      const formData = new FormData();
      if (govIdFile) formData.append("governmentId", govIdFile);
      if (proofFile) formData.append("proofOfAddress", proofFile);

      await customerApi.resubmitKyc(formData);
      
      // Reset files
      setGovIdFile(null);
      setProofFile(null);
      
      // Update status locally
      setStatus("RESUBMITTED");
      
      // Refresh
      fetchKycStatus();
      if (onStatusUpdate) onStatusUpdate();
    } catch (err: any) {
      console.error("KYC Resubmit Error:", err);
      setError(err?.response?.data?.error || "Failed to resubmit documents. Please try again.");
    } finally {
      setUploading(false);
    }
  };

  const getStatusConfig = () => {
    switch (status) {
      case "APPROVED":
        return {
          bg: "bg-emerald-50 border-emerald-200",
          titleColor: "text-emerald-800",
          descColor: "text-emerald-600",
          icon: <ShieldCheck className="w-8 h-8 text-emerald-600 animate-pulse" />,
          title: "KYC Verification Approved",
          desc: "Your identity has been verified successfully. You have unrestricted access to PapaEgo features.",
        };
      case "REJECTED":
        return {
          bg: "bg-rose-50 border-rose-200",
          titleColor: "text-rose-800",
          descColor: "text-rose-600",
          icon: <ShieldAlert className="w-8 h-8 text-rose-600" />,
          title: "Verification Action Required",
          desc: rejectionReason 
            ? `Your verification was rejected: "${rejectionReason}". Please upload valid documents below.` 
            : "Some of your KYC documents could not be verified. Please review and resubmit below.",
        };
      case "UNDER_REVIEW":
        return {
          bg: "bg-amber-50 border-amber-200",
          titleColor: "text-amber-800",
          descColor: "text-amber-600",
          icon: <Hourglass className="w-8 h-8 text-amber-600 animate-spin" style={{ animationDuration: "3s" }} />,
          title: "Verification Under Review",
          desc: "Our compliance team is currently verifying your documents. This usually takes less than 24 hours.",
        };
      case "SUBMITTED":
      case "RESUBMITTED":
        return {
          bg: "bg-blue-50 border-blue-200",
          titleColor: "text-blue-800",
          descColor: "text-blue-600",
          icon: <Hourglass className="w-8 h-8 text-blue-600 animate-pulse" />,
          title: "Verification Submitted",
          desc: "Your KYC documents have been received and are queued for compliance review.",
        };
      default:
        return {
          bg: "bg-slate-50 border-slate-200",
          titleColor: "text-slate-800",
          descColor: "text-slate-600",
          icon: <ShieldAlert className="w-8 h-8 text-slate-500" />,
          title: "Verification Pending",
          desc: "Please complete your profile and upload identity verification documents to unlock all features.",
        };
    }
  };

  if (loading && stages.length === 0) {
    return (
      <div className="w-full bg-white rounded-2xl border p-6 flex flex-col items-center justify-center min-h-[200px] shadow-[0px_10px_30px_rgba(206,206,206,0.25)]" style={{ borderColor: "var(--border-custom)" }}>
        <Loader2 className="w-8 h-8 animate-spin" style={{ color: "#C9A227" }} />
        <span className="text-sm mt-3 text-gray-500">Loading KYC details...</span>
      </div>
    );
  }

  const config = getStatusConfig();

  return (
    <div className="w-full flex flex-col gap-6">
      {/* Banner card */}
      <div className={`w-full rounded-2xl border p-6 flex gap-4 ${config.bg} shadow-[0px_10px_30px_rgba(206,206,206,0.1)] transition-all`}>
        <div className="shrink-0 mt-1">{config.icon}</div>
        <div className="flex-1">
          <h4 className={`text-base font-bold ${config.titleColor} mb-1`}>{config.title}</h4>
          <p className={`text-sm ${config.descColor} leading-relaxed`}>{config.desc}</p>
        </div>
      </div>

      {/* Stepper Card */}
      {stages.length > 0 && (
        <div className="w-full bg-white rounded-2xl border p-6 shadow-[0px_10px_30px_rgba(206,206,206,0.25)]" style={{ borderColor: "var(--border-custom)" }}>
          <h4 className="text-sm font-bold text-slate-800 mb-6">Verification Progress</h4>
          
          <div className="relative flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6 sm:gap-2">
            {stages.map((stage: any, idx: number) => {
              const isActive = status === stage.key || 
                (stage.key === 'SUBMITTED' && ['SUBMITTED', 'UNDER_REVIEW', 'APPROVED', 'REJECTED', 'RESUBMITTED'].includes(status)) ||
                (stage.key === 'UNDER_REVIEW' && ['UNDER_REVIEW', 'APPROVED', 'REJECTED', 'RESUBMITTED'].includes(status)) ||
                (stage.key === 'APPROVED' && status === 'APPROVED');

              const isPast = stage.completed && status !== stage.key;

              return (
                <div key={stage.key} className="flex-1 flex flex-row sm:flex-col items-center gap-4 sm:gap-2 w-full">
                  <div className="relative flex items-center justify-center shrink-0">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold transition-all ${
                      stage.completed 
                        ? "bg-emerald-500 text-white" 
                        : status === "REJECTED" && stage.key === "APPROVED"
                          ? "bg-rose-100 text-rose-500 border-2 border-rose-400"
                          : isActive 
                            ? "bg-amber-500 text-white animate-pulse" 
                            : "bg-slate-100 text-slate-400 border border-slate-200"
                    }`}>
                      {stage.completed ? (
                        <CheckCircle2 className="w-5 h-5" />
                      ) : status === "REJECTED" && stage.key === "APPROVED" ? (
                        <X className="w-5 h-5" />
                      ) : (
                        idx + 1
                      )}
                    </div>
                  </div>
                  
                  <div className="text-left sm:text-center">
                    <p className={`text-sm font-bold ${isActive ? "text-amber-600" : stage.completed ? "text-emerald-600" : "text-slate-500"}`}>
                      {stage.label}
                    </p>
                    <p className="text-xs text-slate-400 max-w-[180px] mt-0.5 leading-tight hidden sm:block mx-auto">
                      {stage.description}
                    </p>
                    {stage.completedAt && (
                      <p className="text-[10px] text-slate-400 mt-1 font-mono">
                        {new Date(stage.completedAt).toLocaleDateString()}
                      </p>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Resubmit form */}
      {status === "REJECTED" && (
        <div className="w-full bg-white rounded-2xl border p-6 shadow-[0px_10px_30px_rgba(206,206,206,0.25)]" style={{ borderColor: "var(--border-custom)" }}>
          <h4 className="text-base font-bold text-slate-800 mb-2">Resubmit Documentation</h4>
          <p className="text-xs text-slate-500 mb-6">Upload clear, legible copies of the missing or rejected documents to verify your profile.</p>
          
          <form onSubmit={handleResubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Gov ID */}
              <div>
                <p className="text-sm font-semibold text-slate-800 mb-1">Government-Issued ID</p>
                <p className="text-xs text-slate-400 mb-3">(Passport, Driver's License, or National ID Card)</p>
                <div 
                  onClick={() => govIdRef.current?.click()}
                  className="border-2 border-dashed rounded-xl p-6 text-center cursor-pointer hover:border-amber-400 transition-colors bg-slate-50 border-slate-200"
                >
                  <input 
                    ref={govIdRef}
                    type="file"
                    className="hidden"
                    accept=".jpg,.jpeg,.png,.pdf"
                    onChange={(e) => e.target.files?.[0] && setGovIdFile(e.target.files[0])}
                  />
                  {govIdFile ? (
                    <div className="flex items-center justify-center gap-2">
                      <FileText className="w-5 h-5 text-amber-500" />
                      <span className="text-sm font-medium truncate max-w-[150px] text-slate-700">{govIdFile.name}</span>
                      <button type="button" onClick={(e) => { e.stopPropagation(); setGovIdFile(null); }} className="text-slate-400 hover:text-rose-500">
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  ) : (
                    <div className="flex flex-col items-center">
                      <Upload className="w-6 h-6 text-slate-400 mb-2" />
                      <p className="text-xs text-slate-500">Click to upload new Government ID</p>
                      <p className="text-[10px] text-slate-400 mt-1">JPG, PNG, or PDF up to 5MB</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Proof of Address */}
              <div>
                <p className="text-sm font-semibold text-slate-800 mb-1">Proof of Address</p>
                <p className="text-xs text-slate-400 mb-3">(Utility bill, bank statement, or residency cert)</p>
                <div 
                  onClick={() => proofRef.current?.click()}
                  className="border-2 border-dashed rounded-xl p-6 text-center cursor-pointer hover:border-amber-400 transition-colors bg-slate-50 border-slate-200"
                >
                  <input 
                    ref={proofRef}
                    type="file"
                    className="hidden"
                    accept=".jpg,.jpeg,.png,.pdf"
                    onChange={(e) => e.target.files?.[0] && setProofFile(e.target.files[0])}
                  />
                  {proofFile ? (
                    <div className="flex items-center justify-center gap-2">
                      <FileText className="w-5 h-5 text-amber-500" />
                      <span className="text-sm font-medium truncate max-w-[150px] text-slate-700">{proofFile.name}</span>
                      <button type="button" onClick={(e) => { e.stopPropagation(); setProofFile(null); }} className="text-slate-400 hover:text-rose-500">
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  ) : (
                    <div className="flex flex-col items-center">
                      <Upload className="w-6 h-6 text-slate-400 mb-2" />
                      <p className="text-xs text-slate-500">Click to upload new Address Proof</p>
                      <p className="text-[10px] text-slate-400 mt-1">JPG, PNG, or PDF up to 5MB</p>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {error && (
              <div className="flex items-center gap-2 p-3 bg-rose-50 border border-rose-150 rounded-xl text-xs text-rose-600">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            <div className="flex justify-end pt-2">
              <button
                type="submit"
                disabled={(!govIdFile && !proofFile) || uploading}
                className="px-6 h-11 rounded-lg text-sm font-bold text-white transition-opacity disabled:opacity-50 flex items-center justify-center gap-2"
                style={{ backgroundColor: "#C9A227" }}
              >
                {uploading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Uploading & Resubmitting...
                  </>
                ) : (
                  "Resubmit Documents"
                )}
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}

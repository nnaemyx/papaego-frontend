"use client";

import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { Eye, EyeOff, Upload, CheckCircle, AlertCircle, ChevronDown, X, User } from "lucide-react";
import { customerApi, NIGERIAN_SECTORS } from "@/lib/api/customer";
import { useAuthStore } from "@/store/auth-store";
import Link from "next/link";

// ── Steps ──────────────────────────────────────────────────────────────────────
const STEPS = [
  { id: 1, label: "Create Account" },
  { id: 2, label: "Personal & KYC Details" },
  { id: 3, label: "Identity Upload" },
];

type Step = 0 | 1 | 2 | 3 | "success" | "failed";

// ── Component ──────────────────────────────────────────────────────────────────
export default function CustomerSignupPage() {
  const router = useRouter();
  const login = useAuthStore((s) => s.login);

  const [step, setStep] = useState<Step>(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  // Form data
  const [form, setForm] = useState({
    firstName: "", lastName: "", email: "", phone: "",
    password: "", confirmPassword: "",
    gender: "", dateOfBirth: "", homeAddress: "", bvn: "", nin: "",
    companyName: "", companySector: "",
  });
  const [accountType, setAccountType] = useState<"individual" | "business" | null>(null);
  const [govIdFile, setGovIdFile] = useState<File | null>(null);
  const [proofFile, setProofFile] = useState<File | null>(null);
  const govIdRef = useRef<HTMLInputElement>(null);
  const proofRef = useRef<HTMLInputElement>(null);

  const set = (field: string, value: string) => setForm((f) => ({ ...f, [field]: value }));

  // ── Step 1 validation ────────────────────────────────────────────────────────
  const step1Valid =
    form.firstName && form.lastName && form.email && form.phone &&
    form.password.length >= 8 && form.password === form.confirmPassword;

  const step2Valid = form.gender && form.dateOfBirth && form.homeAddress && form.bvn;
  const step3Valid = govIdFile && proofFile;

  // ── Submit ────────────────────────────────────────────────────────────────────
  const handleSubmit = async () => {
    setLoading(true);
    setError("");
    try {
      // Upload document files first
      let govIdUrl = undefined;
      let proofUrl = undefined;

      if (govIdFile) {
        const uploadRes = await customerApi.uploadSignupDocument(govIdFile);
        govIdUrl = uploadRes.url;
      }

      if (proofFile) {
        const uploadRes = await customerApi.uploadSignupDocument(proofFile);
        proofUrl = uploadRes.url;
      }

      const data = await customerApi.signup({
        ...form,
        governmentIdUrl: govIdUrl,
        proofOfAddressUrl: proofUrl,
      });

      // Save auth state
      login(data.user, data.token);
      setStep("success");
    } catch (err: any) {
      setError(err?.response?.data?.error || "Registration failed. Please try again.");
      setStep("failed");
    } finally {
      setLoading(false);
    }
  };

  const stepNumber = typeof step === "number" ? step : null;

  // ── Render ────────────────────────────────────────────────────────────────────
  return (
    <div className="min-h-screen flex flex-col" style={{ backgroundColor: "#F7F8F9" }}>
      {/* Logo Header */}
      <div className="px-6 py-5">
        <h1 className="text-2xl font-bold" style={{ color: "#C9A227" }}>PapaEgo</h1>
      </div>

      {/* Success Screen */}
      {step === "success" && (
        <div className="flex-1 flex items-center justify-center p-4">
          <div className="w-full max-w-md text-center">
            <div className="w-24 h-24 rounded-full flex items-center justify-center mx-auto mb-6"
              style={{ backgroundColor: "#E2FDED" }}>
              <CheckCircle className="w-12 h-12" style={{ color: "#27AE60" }} />
            </div>
            <h2 className="text-2xl font-bold mb-2" style={{ color: "#012333" }}>Account Created!</h2>
            <p className="mb-2" style={{ color: "#6B7078" }}>
              Welcome to PapaEgo! Your account has been created successfully.
            </p>
            <p className="text-sm mb-8" style={{ color: "#6B7078" }}>
              Our team will verify your KYC documents shortly. You can start exploring the platform in the meantime.
            </p>
            <button
              onClick={() => router.push("/customer/dashboard")}
              className="w-full h-12 rounded-lg font-semibold text-white"
              style={{ backgroundColor: "#C9A227" }}>
              Go to Dashboard
            </button>
            <p className="mt-4 text-sm" style={{ color: "#6B7078" }}>
              Already verified?{" "}
              <Link href="/customer-auth/signin" className="font-semibold" style={{ color: "#C9A227" }}>
                Sign In
              </Link>
            </p>
          </div>
        </div>
      )}

      {/* Failed Screen */}
      {step === "failed" && (
        <div className="flex-1 flex items-center justify-center p-4">
          <div className="w-full max-w-md text-center">
            <div className="w-24 h-24 rounded-full flex items-center justify-center mx-auto mb-6"
              style={{ backgroundColor: "#FFE5E5" }}>
              <AlertCircle className="w-12 h-12" style={{ color: "#E05555" }} />
            </div>
            <h2 className="text-2xl font-bold mb-2" style={{ color: "#012333" }}>Registration Failed</h2>
            <p className="mb-8" style={{ color: "#6B7078" }}>{error}</p>
            <button
              onClick={() => { setStep(1); setError(""); }}
              className="w-full h-12 rounded-lg font-semibold text-white"
              style={{ backgroundColor: "#C9A227" }}>
              Try Again
            </button>
            <p className="mt-4 text-sm" style={{ color: "#6B7078" }}>
              Already have an account?{" "}
              <Link href="/customer-auth/signin" className="font-semibold" style={{ color: "#C9A227" }}>
                Sign In
              </Link>
            </p>
          </div>
        </div>
      )}

      {/* ── Step 0: Account Type Selection ── */}
      {step === 0 && (
        <div className="flex-1 flex flex-col items-center justify-center py-10 px-4">
          <div className="text-center mb-10 w-full">
            <h2 className="text-[28px] md:text-3xl font-bold mb-2" style={{ color: "#012333" }}>
              How will you use PapaEgo?
            </h2>
            <p className="text-sm" style={{ color: "#6B7078" }}>
              Choose the option that best describes you.<br />
              You can always upgrade later.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl w-full mx-auto">
            {/* Individual Card */}
            <div
              onClick={() => setAccountType("individual")}
              className="relative p-6 rounded-2xl border-2 transition-all cursor-pointer flex flex-col items-start"
              style={{
                borderColor: accountType === "individual" ? "#C9A227" : "#E1E3E6",
                backgroundColor: accountType === "individual" ? "#FFFDF5" : "#FFFFFF",
              }}>
              <div className="absolute top-6 right-6 w-5 h-5 rounded-full border-2 flex items-center justify-center"
                style={{ borderColor: accountType === "individual" ? "#C9A227" : "#E1E3E6" }}>
                {accountType === "individual" && <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: "#C9A227" }} />}
              </div>
              <div className="mb-6 w-12 h-12 rounded-xl flex items-center justify-center"
                style={{ backgroundColor: accountType === "individual" ? "#F0E7C8" : "#F3F4F6" }}>
                <User className="w-6 h-6" style={{ color: accountType === "individual" ? "#C9A227" : "#9AA0A6" }} />
              </div>
              <h3 className="text-xl font-bold mb-1"
                style={{ color: accountType === "individual" ? "#C9A227" : "#012333" }}>
                Individual Account
              </h3>
              <p className="text-sm font-semibold mb-6" style={{ color: "#012333" }}>
                Send, receive, and manage your money globally
              </p>
              <p className="text-xs font-bold mb-3" style={{ color: "#012333" }}>Perfect for:</p>
              <ul className="space-y-2">
                {[
                  "Paying friends & family",
                  "Online purchases",
                  "Receiving international transfers",
                ].map((item, i) => (
                  <li key={i} className="flex items-center gap-2 text-sm" style={{ color: "#6B7078" }}>
                    <CheckCircle className="w-4 h-4 flex-shrink-0"
                      style={{ color: accountType === "individual" ? "#C9A227" : "#9AA0A6" }} />
                    {item}
                  </li>
                ))}
              </ul>
            </div>

            {/* Business Card */}
            <div
              onClick={() => setAccountType("business")}
              className="relative p-6 rounded-2xl border-2 transition-all cursor-pointer flex flex-col items-start"
              style={{
                borderColor: accountType === "business" ? "#C9A227" : "#E1E3E6",
                backgroundColor: accountType === "business" ? "#FFF8E1" : "#FFFFFF",
              }}>
              <div className="absolute top-6 right-6 w-5 h-5 rounded-full border-2 flex items-center justify-center"
                style={{ borderColor: accountType === "business" ? "#C9A227" : "#E1E3E6", backgroundColor: accountType === "business" ? "white" : "transparent" }}>
                {accountType === "business" && <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: "#C9A227" }} />}
              </div>
              <div className="mb-6 w-12 h-12 rounded-xl flex items-center justify-center"
                style={{ backgroundColor: accountType === "business" ? "#EAD27B" : "#F3F4F6", border: accountType === "business" ? "2px solid #C9A227" : "none" }}>
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke={accountType === "business" ? "#FFFFFF" : "#9AA0A6"} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="2" y="7" width="20" height="14" rx="2" ry="2"></rect>
                  <path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"></path>
                </svg>
              </div>
              <h3 className="text-xl font-bold mb-1"
                style={{ color: accountType === "business" ? "#C9A227" : "#012333" }}>
                Business Account
              </h3>
              <p className="text-sm font-semibold mb-6" style={{ color: "#012333" }}>
                Make and receive international business payments
              </p>
              <p className="text-xs font-bold mb-3" style={{ color: "#012333" }}>Perfect for:</p>
              <ul className="space-y-2">
                {[
                  "Paying suppliers",
                  "Receiving payments from abroad",
                  "Managing company transactions",
                ].map((item, i) => (
                  <li key={i} className="flex items-center gap-2 text-sm" style={{ color: "#6B7078" }}>
                    <CheckCircle className="w-4 h-4 flex-shrink-0"
                      style={{ color: accountType === "business" ? "#C9A227" : "#9AA0A6" }} />
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Footer for Step 0 */}
          <div className="max-w-4xl w-full mx-auto flex items-center justify-between mt-12 mb-8">
            <p className="text-sm" style={{ color: "#6B7078" }}>
              Already have an account?{" "}
              <Link href="/customer-auth/signin" className="font-semibold" style={{ color: "#C9A227" }}>
                Sign In
              </Link>
            </p>
            <button
              onClick={() => setStep(1)}
              disabled={!accountType}
              className="px-10 h-11 rounded-lg font-medium text-sm text-white disabled:opacity-50 transition-opacity"
              style={{ backgroundColor: "#C9A227" }}>
              Next
            </button>
          </div>
        </div>
      )}

      {/* Multistep Form (Steps 1, 2, 3) */}
      {typeof step === "number" && step > 0 && (
        <div className="flex-1 flex flex-col items-center justify-start py-4 px-4">
          <div className="text-center mb-4">
            <h2 className="text-2xl font-bold" style={{ color: "#012333" }}>Welcome to PapaEgo</h2>
            <p className="text-sm mt-1 max-w-md" style={{ color: "#6B7078" }}>
              Complete your onboarding to gain access to the PapaEgo platform.
              This process helps us meet compliance and operational requirements.
            </p>
          </div>

          {/* Stepper */}
          <div className="w-full max-w-3xl bg-white rounded-xl border p-6 mb-6" style={{ borderColor: "#E1E3E6" }}>
            <div className="flex items-center justify-between mb-6">
              {STEPS.map((s, idx) => (
                <div key={s.id} className="flex items-center flex-1">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0"
                      style={{
                        backgroundColor: step >= s.id ? "#C9A227" : "#E1E3E6",
                        color: step >= s.id ? "white" : "#9AA0A6",
                      }}>
                      {step > s.id ? <CheckCircle className="w-4 h-4" /> : s.id}
                    </div>
                    <span className="text-sm font-medium hidden sm:block"
                      style={{ color: step >= s.id ? "#C9A227" : "#9AA0A6" }}>
                      {s.label}
                    </span>
                  </div>
                  {idx < STEPS.length - 1 && (
                    <div className="flex-1 h-0.5 mx-3"
                      style={{ backgroundColor: step > s.id ? "#C9A227" : "#E1E3E6" }} />
                  )}
                </div>
              ))}
            </div>

            {/* ── Step 1: Create Account ── */}
            {step === 1 && (
              <div>
                <h3 className="text-lg font-bold mb-1" style={{ color: "#012333" }}>Create Account</h3>
                <p className="text-sm mb-4" style={{ color: "#6B7078" }}>Set up your login details to get started</p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <FloatingInput label="First Name" value={form.firstName} onChange={(v) => set("firstName", v)} />
                  <FloatingInput label="Last Name" value={form.lastName} onChange={(v) => set("lastName", v)} />
                  <FloatingInput type="email" label="Email Address" value={form.email} onChange={(v) => set("email", v)} />
                  <FloatingInput label="Phone Number" value={form.phone} onChange={(v) => set("phone", v)} placeholder="+234..." />
                  <div className="relative">
                    <FloatingInput
                      type={showPassword ? "text" : "password"}
                      label="Create Password"
                      value={form.password}
                      onChange={(v) => set("password", v)}
                    />
                    <button type="button" className="absolute right-3 top-3.5 text-gray-400"
                      onClick={() => setShowPassword(!showPassword)}>
                      {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                    </button>
                  </div>
                  <div className="relative">
                    <FloatingInput
                      type={showConfirm ? "text" : "password"}
                      label="Confirm Password"
                      value={form.confirmPassword}
                      onChange={(v) => set("confirmPassword", v)}
                    />
                    <button type="button" className="absolute right-3 top-3.5 text-gray-400"
                      onClick={() => setShowConfirm(!showConfirm)}>
                      {showConfirm ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                    </button>
                  </div>
                </div>
                <InfoBox text="Use at least 8 characters with a mix of letters, numbers, and symbols" />
              </div>
            )}

            {/* ── Step 2: Personal & KYC ── */}
            {step === 2 && (
              <div>
                <h3 className="text-lg font-bold mb-1" style={{ color: "#012333" }}>Personal & KYC Details</h3>
                <p className="text-sm mb-4" style={{ color: "#6B7078" }}>Tell us about yourself so we can secure your account</p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <FloatingSelect label="Gender" value={form.gender} onChange={(v) => set("gender", v)}
                    options={["Male", "Female", "Prefer not to say"]} />
                  <FloatingInput type="date" label="Date of Birth" value={form.dateOfBirth} onChange={(v) => set("dateOfBirth", v)} max={new Date().toISOString().split("T")[0]} />
                  <div className="sm:col-span-2">
                    <FloatingInput label="Home Address" value={form.homeAddress} onChange={(v) => set("homeAddress", v)} />
                  </div>
                  <FloatingInput label="Bank Verification Number (BVN)" value={form.bvn} onChange={(v) => set("bvn", v)} />
                  <FloatingInput label="National Identification Number (NIN)" value={form.nin} onChange={(v) => set("nin", v)} />
                  {accountType === "business" && (
                    <>
                      <div className="sm:col-span-2">
                        <FloatingInput label="Company Name (optional)" value={form.companyName} onChange={(v) => set("companyName", v)} />
                      </div>
                      <div className="sm:col-span-2">
                        <FloatingSelect
                          label="Company Sector (optional)"
                          value={form.companySector}
                          onChange={(v) => set("companySector", v)}
                          options={NIGERIAN_SECTORS}
                        />
                      </div>
                    </>
                  )}
                </div>
                <InfoBox text="Your information is encrypted and securely stored" />
              </div>
            )}

            {/* ── Step 3: Identity Upload ── */}
            {step === 3 && (
              <div>
                <h3 className="text-lg font-bold mb-1" style={{ color: "#012333" }}>Identity Upload + Selfie</h3>
                <p className="text-sm mb-4" style={{ color: "#6B7078" }}>Confirm your identity to fully activate your account</p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <UploadBox
                    label="Government-Issued ID"
                    subtitle="(Passport, National ID, or Driver's License)"
                    file={govIdFile}
                    inputRef={govIdRef}
                    onClear={() => setGovIdFile(null)}
                    onChange={(f) => setGovIdFile(f)}
                  />
                  <UploadBox
                    label="Proof of Address"
                    subtitle="(Utility bill or bank statement – issued within last 3 months)"
                    file={proofFile}
                    inputRef={proofRef}
                    onClear={() => setProofFile(null)}
                    onChange={(f) => setProofFile(f)}
                  />
                </div>
                <InfoBox text="Your documents are securely stored and reviewed by the compliance team" />
              </div>
            )}

            {/* Navigation */}
            <div className="flex items-center justify-between mt-6 pt-4 border-t" style={{ borderColor: "#E1E3E6" }}>
              <p className="text-sm" style={{ color: "#6B7078" }}>
                Already have an account?{" "}
                <Link href="/customer-auth/signin" className="font-semibold" style={{ color: "#C9A227" }}>
                  Sign In
                </Link>
              </p>
              <div className="flex gap-3">
                <button
                  onClick={() => setStep((s) => (typeof s === "number" ? (s - 1) as Step : 0))}
                  className="px-6 h-11 rounded-lg border font-medium text-sm transition-colors"
                  style={{ borderColor: "#C9A227", color: "#C9A227" }}>
                  Back
                </button>
                {step < 3 ? (
                  <button
                    onClick={() => setStep((s) => (typeof s === "number" ? (s + 1) as Step : 2))}
                    disabled={(step === 1 && !step1Valid) || (step === 2 && !step2Valid)}
                    className="px-6 h-11 rounded-lg font-medium text-sm text-white disabled:opacity-50"
                    style={{ backgroundColor: "#C9A227" }}>
                    Next
                  </button>
                ) : (
                  <button
                    onClick={handleSubmit}
                    disabled={!step3Valid || loading}
                    className="px-6 h-11 rounded-lg font-medium text-sm text-white disabled:opacity-50"
                    style={{ backgroundColor: "#C9A227" }}>
                    {loading ? "Creating account…" : "Create Account"}
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ── Sub-components ─────────────────────────────────────────────────────────────

function FloatingInput({
  label, value, onChange, type = "text", placeholder, max,
}: {
  label: string; value: string; onChange: (v: string) => void;
  type?: string; placeholder?: string; max?: string;
}) {
  return (
    <div className="relative border rounded-lg px-3 pt-4 pb-2" style={{ borderColor: "#E1E3E6" }}>
      <label className="absolute top-1.5 left-3 text-xs" style={{ color: "#9AA0A6" }}>{label}</label>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder || ""}
        max={max}
        className="w-full text-sm bg-transparent outline-none mt-1"
        style={{ color: "#012333" }}
      />
    </div>
  );
}

function FloatingSelect({
  label, value, onChange, options,
}: {
  label: string; value: string; onChange: (v: string) => void; options: string[];
}) {
  return (
    <div className="relative border rounded-lg px-3 pt-4 pb-2" style={{ borderColor: "#E1E3E6" }}>
      <label className="absolute top-1.5 left-3 text-xs" style={{ color: "#9AA0A6" }}>{label}</label>
      <div className="relative mt-1">
        <select
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="w-full text-sm bg-transparent outline-none appearance-none pr-6"
          style={{ color: value ? "#012333" : "#9AA0A6" }}>
          <option value="">Select…</option>
          {options.map((o) => <option key={o} value={o}>{o}</option>)}
        </select>
        <ChevronDown className="absolute right-0 top-0 w-4 h-4 pointer-events-none" style={{ color: "#9AA0A6" }} />
      </div>
    </div>
  );
}

function UploadBox({
  label, subtitle, file, inputRef, onClear, onChange,
}: {
  label: string; subtitle: string; file: File | null;
  inputRef: React.RefObject<HTMLInputElement | null>;
  onClear: () => void; onChange: (f: File) => void;
}) {
  return (
    <div>
      <p className="text-sm font-semibold mb-1" style={{ color: "#012333" }}>{label}</p>
      <p className="text-xs mb-2" style={{ color: "#6B7078" }}>{subtitle}</p>
      <div
        className="border-2 border-dashed rounded-xl p-6 text-center cursor-pointer hover:border-amber-400 transition-colors"
        style={{ borderColor: "#E1E3E6", backgroundColor: "#FAFAFA" }}
        onClick={() => inputRef.current?.click()}>
        <input
          ref={inputRef}
          type="file"
          className="hidden"
          accept=".jpg,.jpeg,.png,.pdf"
          onChange={(e) => e.target.files?.[0] && onChange(e.target.files[0])}
        />
        {file ? (
          <div className="flex items-center justify-center gap-2">
            <CheckCircle className="w-5 h-5" style={{ color: "#27AE60" }} />
            <span className="text-sm font-medium truncate max-w-[140px]" style={{ color: "#012333" }}>{file.name}</span>
            <button type="button" onClick={(e) => { e.stopPropagation(); onClear(); }}
              className="text-gray-400 hover:text-red-500">
              <X className="w-4 h-4" />
            </button>
          </div>
        ) : (
          <>
            <div className="w-10 h-10 rounded-lg flex items-center justify-center mx-auto mb-2"
              style={{ backgroundColor: "#FFF8E6" }}>
              <Upload className="w-5 h-5" style={{ color: "#C9A227" }} />
            </div>
            <p className="text-sm" style={{ color: "#6B7078" }}>Click to upload or drag and drop a file here</p>
            <p className="text-xs mt-1" style={{ color: "#9AA0A6" }}>JPG, PNG, or PDF · Max size 5MB</p>
          </>
        )}
      </div>
    </div>
  );
}

function InfoBox({ text }: { text: string }) {
  return (
    <div className="flex items-center gap-2 mt-4 p-3 rounded-lg" style={{ backgroundColor: "#EFF6FF", border: "1px solid #DBEAFE" }}>
      <div className="w-4 h-4 rounded-full flex-shrink-0 flex items-center justify-center"
        style={{ backgroundColor: "#3B82F6" }}>
        <span className="text-white text-xs font-bold">i</span>
      </div>
      <p className="text-sm" style={{ color: "#1E40AF" }}>{text}</p>
    </div>
  );
}

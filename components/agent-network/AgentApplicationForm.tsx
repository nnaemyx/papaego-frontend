'use client';

import { useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import { toast } from 'sonner';
import { agentApplicationsApi, AgentApplicationPayload } from '@/lib/api/agent-applications';
import { CheckCircle, Loader2 } from 'lucide-react';

const COUNTRIES = [
  'Nigeria', 'Ghana', 'Kenya', 'South Africa', 'Uganda', 'Tanzania',
  'Senegal', 'Cameroon', 'Côte d\'Ivoire', 'Ethiopia', 'Zimbabwe',
  'United Kingdom', 'United States', 'Canada', 'Germany', 'France',
  'Netherlands', 'UAE', 'Other',
];

const HOW_DID_YOU_HEAR = [
  'Social Media (Instagram, Twitter, LinkedIn)',
  'Friend or Colleague Referral',
  'Google Search',
  'PapaEgo Website',
  'Event or Conference',
  'News / Media Coverage',
  'Other',
];

interface FormState {
  fullName: string;
  email: string;
  phone: string;
  country: string;
  stateCity: string;
  occupation: string;
  linkedIn: string;
  hearAboutUs: string;
  ownsOrOperatesBusiness: string;
  whyAgent: string;
  networkSize: string;
}

const INITIAL_FORM: FormState = {
  fullName: '',
  email: '',
  phone: '',
  country: '',
  stateCity: '',
  occupation: '',
  linkedIn: '',
  hearAboutUs: '',
  ownsOrOperatesBusiness: '',
  whyAgent: '',
  networkSize: '',
};

export function AgentApplicationForm() {
  const [form, setForm] = useState<FormState>(INITIAL_FORM);
  const [submitted, setSubmitted] = useState(false);

  const mutation = useMutation({
    mutationFn: (payload: AgentApplicationPayload) => agentApplicationsApi.submit(payload),
    onSuccess: () => {
      setSubmitted(true);
      toast.success("Application submitted! We'll be in touch soon.");
    },
    onError: (error: any) => {
      const message = error?.response?.data?.error || 'Something went wrong. Please try again.';
      toast.error(message);
    },
  });

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const required: (keyof FormState)[] = [
      'fullName', 'email', 'phone', 'country', 'stateCity',
      'occupation', 'hearAboutUs', 'ownsOrOperatesBusiness', 'whyAgent',
    ];

    for (const key of required) {
      if (!form[key].trim()) {
        toast.error(`Please fill in the "${fieldLabel(key)}" field.`);
        return;
      }
    }

    mutation.mutate({
      fullName: form.fullName,
      email: form.email,
      phone: form.phone,
      country: form.country,
      stateCity: form.stateCity,
      occupation: form.occupation,
      linkedIn: form.linkedIn || undefined,
      hearAboutUs: form.hearAboutUs,
      ownsOrOperatesBusiness: form.ownsOrOperatesBusiness === 'yes',
      whyAgent: form.whyAgent,
      networkSize: form.networkSize || undefined,
    });
  };

  if (submitted) {
    return (
      <div
        className="flex flex-col items-center justify-center py-20 px-6 rounded-2xl text-center gap-6"
        style={{ backgroundColor: '#fff', border: '2px solid var(--brand-primary)' }}
      >
        <div
          className="w-20 h-20 rounded-full flex items-center justify-center"
          style={{ backgroundColor: '#fef9ec' }}
        >
          <CheckCircle className="w-10 h-10" style={{ color: 'var(--brand-primary)' }} />
        </div>
        <div>
          <h3
            className="text-2xl font-bold mb-2"
            style={{ fontFamily: 'var(--font-bricolage-grotesque)', color: 'var(--dark-blue)' }}
          >
            Application Submitted Successfully!
          </h3>
          <p className="text-base" style={{ color: 'var(--text-secondary)', fontFamily: 'var(--font-bricolage-grotesque)' }}>
            Thank you for your interest in becoming a PapaEgo Agent. Our team will review your application and reach out to you within 5–7 business days.
          </p>
        </div>
        <button
          onClick={() => { setSubmitted(false); setForm(INITIAL_FORM); }}
          className="mt-2 px-8 py-3 rounded-lg font-semibold text-sm transition-all hover:opacity-90"
          style={{ backgroundColor: 'var(--brand-primary)', color: '#fff', fontFamily: 'var(--font-bricolage-grotesque)' }}
        >
          Submit Another Application
        </button>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} id="agent-application-form" className="space-y-5">
      {/* Row 1: Full Name + Email */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        <FormField label="Full Name" required>
          <input
            id="app-fullName"
            name="fullName"
            type="text"
            placeholder="e.g. Amara Johnson"
            value={form.fullName}
            onChange={handleChange}
            style={inputStyle}
          />
        </FormField>
        <FormField label="Email Address" required>
          <input
            id="app-email"
            name="email"
            type="email"
            placeholder="you@example.com"
            value={form.email}
            onChange={handleChange}
            style={inputStyle}
          />
        </FormField>
      </div>

      {/* Row 2: Phone + Country */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        <FormField label="Phone Number" required>
          <input
            id="app-phone"
            name="phone"
            type="tel"
            placeholder="+234 000 000 0000"
            value={form.phone}
            onChange={handleChange}
            style={inputStyle}
          />
        </FormField>
        <FormField label="Country" required>
          <select
            id="app-country"
            name="country"
            value={form.country}
            onChange={handleChange}
            style={inputStyle}
          >
            <option value="">Select your country</option>
            {COUNTRIES.map((c) => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>
        </FormField>
      </div>

      {/* Row 3: State/City + Occupation */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        <FormField label="State / City" required>
          <input
            id="app-stateCity"
            name="stateCity"
            type="text"
            placeholder="e.g. Lagos, Nigeria"
            value={form.stateCity}
            onChange={handleChange}
            style={inputStyle}
          />
        </FormField>
        <FormField label="Occupation" required>
          <input
            id="app-occupation"
            name="occupation"
            type="text"
            placeholder="e.g. Business Owner, Sales Manager"
            value={form.occupation}
            onChange={handleChange}
            style={inputStyle}
          />
        </FormField>
      </div>

      {/* Row 4: LinkedIn + How did you hear */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        <FormField label="LinkedIn Profile" optional>
          <input
            id="app-linkedIn"
            name="linkedIn"
            type="url"
            placeholder="https://linkedin.com/in/yourprofile"
            value={form.linkedIn}
            onChange={handleChange}
            style={inputStyle}
          />
        </FormField>
        <FormField label="How did you hear about PapaEgo?" required>
          <select
            id="app-hearAboutUs"
            name="hearAboutUs"
            value={form.hearAboutUs}
            onChange={handleChange}
            style={inputStyle}
          >
            <option value="">Select an option</option>
            {HOW_DID_YOU_HEAR.map((h) => (
              <option key={h} value={h}>{h}</option>
            ))}
          </select>
        </FormField>
      </div>

      {/* Row 5: Owns Business + Network Size */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        <FormField label="Do you currently own or operate a business?" required>
          <select
            id="app-ownsOrOperatesBusiness"
            name="ownsOrOperatesBusiness"
            value={form.ownsOrOperatesBusiness}
            onChange={handleChange}
            style={inputStyle}
          >
            <option value="">Select an option</option>
            <option value="yes">Yes</option>
            <option value="no">No</option>
          </select>
        </FormField>
        <FormField label="Estimated size of your network" optional>
          <input
            id="app-networkSize"
            name="networkSize"
            type="text"
            placeholder="e.g. 50–200 contacts, 500+ LinkedIn connections"
            value={form.networkSize}
            onChange={handleChange}
            style={inputStyle}
          />
        </FormField>
      </div>

      {/* Why Agent — full width */}
      <FormField label="Why would you like to become a PapaEgo Agent?" required>
        <textarea
          id="app-whyAgent"
          name="whyAgent"
          rows={4}
          placeholder="Tell us about your motivation, experience, and what makes you a great fit…"
          value={form.whyAgent}
          onChange={handleChange}
          style={{ ...inputStyle, resize: 'vertical', minHeight: '110px' }}
        />
      </FormField>

      <button
        id="agent-application-submit"
        type="submit"
        disabled={mutation.isPending}
        className="w-full flex items-center justify-center gap-2 py-4 rounded-lg font-bold text-base transition-all hover:opacity-90 active:scale-[0.99] disabled:opacity-60"
        style={{
          backgroundColor: 'var(--brand-primary)',
          color: '#fff',
          fontFamily: 'var(--font-bricolage-grotesque)',
          fontSize: '16px',
        }}
      >
        {mutation.isPending ? (
          <>
            <Loader2 className="w-5 h-5 animate-spin" />
            Submitting…
          </>
        ) : (
          'Submit Application'
        )}
      </button>
    </form>
  );
}

// ── Helpers ───────────────────────────────────────────────────────────────────

const inputStyle: React.CSSProperties = {
  width: '100%',
  padding: '12px 16px',
  border: '1.5px solid #e1e3e6',
  borderRadius: '10px',
  fontSize: '14px',
  fontFamily: 'var(--font-bricolage-grotesque)',
  color: 'var(--text-primary)',
  backgroundColor: '#fff',
  outline: 'none',
  transition: 'border-color 0.2s',
};

function FormField({
  label,
  required,
  optional,
  children,
}: {
  label: string;
  required?: boolean;
  optional?: boolean;
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col gap-2">
      <label
        className="text-sm font-semibold"
        style={{ color: 'var(--text-primary)', fontFamily: 'var(--font-bricolage-grotesque)' }}
      >
        {label}
        {required && <span style={{ color: 'var(--status-error)' }}> *</span>}
        {optional && (
          <span className="ml-1 text-xs font-normal" style={{ color: 'var(--text-tertiary)' }}>
            (Optional)
          </span>
        )}
      </label>
      {children}
    </div>
  );
}

function fieldLabel(key: string): string {
  const map: Record<string, string> = {
    fullName: 'Full Name',
    email: 'Email Address',
    phone: 'Phone Number',
    country: 'Country',
    stateCity: 'State / City',
    occupation: 'Occupation',
    hearAboutUs: 'How did you hear about PapaEgo?',
    ownsOrOperatesBusiness: 'Do you own or operate a business?',
    whyAgent: 'Why would you like to become a PapaEgo Agent?',
  };
  return map[key] || key;
}

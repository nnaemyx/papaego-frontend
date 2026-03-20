"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  User,
  Shield,
  ChevronRight,
  LogOut,
  CheckCircle,
  Clock,
  Phone,
  Mail,
  Building,
  MapPin,
  Lock,
  Bell,
  HelpCircle,
  FileText,
} from "lucide-react";
import { useAuthStore } from "@/store/auth-store";
import { customerApi } from "@/lib/api/customer";
import { authApi } from "@/lib/api/auth";
import { BankDetailsModal } from "@/components/customer/BankDetailsModal";

export default function CustomerProfilePage() {
  const router = useRouter();
  const { user } = useAuthStore();
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [isBankModalOpen, setIsBankModalOpen] = useState(false);

  const fetchProfile = () => {
    setLoading(true);
    customerApi
      .getProfile()
      .then(setProfile)
      .catch(() => {})
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchProfile();
  }, []);

  const handleLogout = () => {
    authApi.logout();
    router.push("/customer-auth/signin");
  };

  const kycVerified = profile?.verified;
  const initials = (user?.firstName?.[0] || "U").toUpperCase();

  const menuItems = [
    {
      icon: Lock,
      label: "Security Settings",
      desc: "Password & two-factor auth",
      href: "/customer/security",
    },
    {
      icon: Bell,
      label: "Notification Preferences",
      desc: "Email & SMS alerts",
      href: "/customer/notifications",
    },
    {
      icon: HelpCircle,
      label: "Support & FAQ",
      desc: "Get help from our team",
      href: "mailto:support@papaego.com",
    },
    {
      icon: FileText,
      label: "Privacy Policy",
      desc: "How we handle your data",
      href: "/privacy",
    },
  ];

  return (
    <div className="p-4 md:p-6 lg:pl-7 lg:pr-6 space-y-6">
      {/* ── Header ── */}
      <div>
        <h1
          className="text-2xl md:text-3xl lg:text-4xl font-bold mb-1.5"
          style={{ color: "var(--text-primary)" }}
        >
          My Profile
        </h1>
        <p className="text-sm md:text-base" style={{ color: "var(--text-secondary)" }}>
          Manage your account settings and KYC status
        </p>
      </div>

      <div className="space-y-4 max-w-2xl">
        {/* ── Avatar Card ── */}
        <div
          className="bg-white rounded-2xl border p-5 flex items-center gap-4"
          style={{ borderColor: "var(--border-custom)" }}
        >
          <div
            className="w-16 h-16 rounded-full flex items-center justify-center text-2xl font-bold flex-shrink-0"
            style={{ backgroundColor: "var(--brand-primary)", color: "white" }}
          >
            {initials}
          </div>
          <div className="flex-1 min-w-0">
            <h2 className="font-bold text-lg truncate" style={{ color: "var(--text-primary)" }}>
              {user?.firstName} {user?.lastName}
            </h2>
            <p className="body-secondary truncate">{user?.email}</p>
            <span
              className="inline-flex items-center gap-1 mt-2 px-2.5 py-0.5 rounded-full text-xs font-semibold"
              style={{
                backgroundColor: kycVerified ? "#E2FDED" : "#FFF8E1",
                color: kycVerified ? "#27AE60" : "#F59E0B",
              }}
            >
              {kycVerified ? (
                <CheckCircle className="w-3 h-3" />
              ) : (
                <Clock className="w-3 h-3" />
              )}
              {kycVerified ? "KYC Verified" : "KYC Pending"}
            </span>
          </div>
        </div>

        {/* ── Account Information ── */}
        {loading ? (
          <div
            className="h-48 rounded-xl animate-pulse"
            style={{ backgroundColor: "#E1E3E6" }}
          />
        ) : (
          profile && (
            <div
              className="bg-white rounded-2xl border overflow-hidden"
              style={{ borderColor: "var(--border-custom)" }}
            >
              <div
                className="px-5 py-3.5 border-b"
                style={{ borderColor: "var(--border-light)", backgroundColor: "var(--bg-muted)" }}
              >
                <h3 className="heading-card">Account Information</h3>
              </div>
              <div className="divide-y" style={{ borderColor: "var(--border-light)" }}>
                {[
                  { icon: User,     label: "Full Name", val: profile.fullName },
                  { icon: Mail,     label: "Email",     val: profile.email || profile.user?.email },
                  { icon: Phone,    label: "Phone",     val: profile.phone || profile.user?.phone },
                  { icon: MapPin,   label: "Address",   val: profile.homeAddress },
                  { icon: Building, label: "Company",   val: profile.companyName },
                  { icon: Building, label: "Sector",    val: profile.companySector },
                ].map(({ icon: Icon, label, val }) => (
                  <div key={label} className="flex items-center gap-3 px-5 py-3.5">
                    <div
                      className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0"
                      style={{ backgroundColor: "var(--bg-muted)" }}
                    >
                      <Icon className="w-4 h-4" style={{ color: "var(--text-secondary)" }} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="caption" style={{ color: "var(--text-tertiary)" }}>
                        {label}
                      </p>
                      <p
                        className="text-sm font-medium truncate"
                        style={{ color: "var(--text-primary)" }}
                      >
                        {val || "—"}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )
        )}

        {/* ── KYC Status ── */}
        <div
          className="bg-white rounded-2xl border overflow-hidden"
          style={{ borderColor: "var(--border-custom)" }}
        >
          <div
            className="px-5 py-3.5 border-b"
            style={{ borderColor: "var(--border-light)", backgroundColor: "var(--bg-muted)" }}
          >
            <h3 className="heading-card">KYC Status</h3>
          </div>
          <div className="p-5">
            <div className="flex items-start gap-4">
              <div
                className="w-11 h-11 rounded-full flex items-center justify-center flex-shrink-0"
                style={{ backgroundColor: kycVerified ? "#E2FDED" : "#FFF8E1" }}
              >
                <Shield
                  className="w-5 h-5"
                  style={{ color: kycVerified ? "#27AE60" : "#F59E0B" }}
                />
              </div>
              <div>
                <p className="font-semibold text-sm mb-1" style={{ color: "var(--text-primary)" }}>
                  {kycVerified ? "Identity Verified" : "Verification Pending"}
                </p>
                <p className="body-secondary">
                  {kycVerified
                    ? "Your identity has been verified by our compliance team."
                    : "Our compliance team is reviewing your documents. This usually takes 1–2 business days."}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* ── Bank Details ── */}
        <div
          className="bg-white rounded-2xl border overflow-hidden"
          style={{ borderColor: "var(--border-custom)" }}
        >
          <div
            className="px-5 py-3.5 border-b flex items-center justify-between"
            style={{ borderColor: "var(--border-light)", backgroundColor: "var(--bg-muted)" }}
          >
            <h3 className="heading-card">Saved Bank Details</h3>
            <button
              onClick={() => setIsBankModalOpen(true)}
              className="text-xs font-bold hover:underline"
              style={{ color: "var(--brand-primary)" }}
            >
              Update Details
            </button>
          </div>
          <div className="p-5">
            {profile?.bankDetails?.length > 0 ? (
              <div className="space-y-3">
                {[
                  { label: "Bank Name",       val: profile.bankDetails[0].bankName },
                  { label: "Account Name",    val: profile.bankDetails[0].accountName },
                  { label: "Account Number",  val: profile.bankDetails[0].accountNumber },
                ].map(({ label, val }) => (
                  <div key={label} className="flex items-center justify-between">
                    <span className="body-secondary">{label}</span>
                    <span
                      className="text-sm font-semibold"
                      style={{ color: "var(--text-primary)" }}
                    >
                      {val}
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-4">
                <p className="body-secondary italic">No bank details saved yet.</p>
                <button
                  onClick={() => setIsBankModalOpen(true)}
                  className="mt-2 text-sm font-bold hover:underline"
                  style={{ color: "var(--brand-primary)" }}
                >
                  + Add Bank Details
                </button>
              </div>
            )}
          </div>
        </div>

        {/* ── Menu Items ── */}
        <div
          className="bg-white rounded-2xl border overflow-hidden"
          style={{ borderColor: "var(--border-custom)" }}
        >
          {menuItems.map(({ icon: Icon, label, desc, href }, idx) => (
            <a
              key={label}
              href={href}
              className="flex items-center gap-3 px-5 py-4 hover:bg-gray-50 transition-colors"
              style={{
                borderBottom:
                  idx < menuItems.length - 1
                    ? `1px solid var(--border-light)`
                    : "none",
              }}
            >
              <div
                className="w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0"
                style={{ backgroundColor: "var(--bg-muted)" }}
              >
                <Icon className="w-4 h-4" style={{ color: "var(--text-secondary)" }} />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium" style={{ color: "var(--text-primary)" }}>
                  {label}
                </p>
                <p className="caption" style={{ color: "var(--text-tertiary)" }}>
                  {desc}
                </p>
              </div>
              <ChevronRight className="w-4 h-4 flex-shrink-0" style={{ color: "var(--text-tertiary)" }} />
            </a>
          ))}
        </div>

        {/* ── Logout ── */}
        <button
          onClick={handleLogout}
          className="w-full flex items-center justify-center gap-2 h-12 rounded-xl border font-semibold text-sm transition-colors hover:bg-red-50"
          style={{
            borderColor: "#FFD1D1",
            color: "var(--status-error)",
            backgroundColor: "#FFF5F5",
          }}
        >
          <LogOut className="w-4 h-4" />
          Sign Out
        </button>

        {/* ── Footer ── */}
        <p
          className="caption text-center pb-6"
          style={{ color: "var(--text-tertiary)" }}
        >
          PapaEgo v1.0 · © {new Date().getFullYear()} PapaEgo. All rights reserved.
        </p>
      </div>

      <BankDetailsModal
        isOpen={isBankModalOpen}
        onClose={() => setIsBankModalOpen(false)}
        onSuccess={fetchProfile}
        initialData={profile?.bankDetails?.[0]}
      />
    </div>
  );
}

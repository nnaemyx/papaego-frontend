import React, { useState } from "react";
import { X, CheckCircle } from "lucide-react";
import { customerApi } from "@/lib/api/customer";

interface BankDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  initialData?: {
    bankName: string;
    accountName: string;
    accountNumber: string;
  };
}

export function BankDetailsModal({ isOpen, onClose, onSuccess, initialData }: BankDetailsModalProps) {
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [form, setForm] = useState({
    bankName: initialData?.bankName || "",
    accountName: initialData?.accountName || "",
    accountNumber: initialData?.accountNumber || "",
  });

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.bankName || !form.accountName || !form.accountNumber) return;

    setLoading(true);
    try {
      await customerApi.upsertBankDetails(form);
      setSuccess(true);
      setTimeout(() => {
        setSuccess(false);
        onSuccess();
        onClose();
      }, 1500);
    } catch (error) {
      console.error("Failed to save bank details", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ backgroundColor: "rgba(0,0,0,0.5)" }}>
      <div className="bg-white rounded-2xl w-full max-w-md overflow-hidden relative" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between px-6 py-4 border-b" style={{ borderColor: "#E1E3E6" }}>
          <h2 className="text-lg font-bold" style={{ color: "#012333" }}>{initialData ? "Update Bank Details" : "Add Bank Details"}</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <X className="w-5 h-5" />
          </button>
        </div>

        {success ? (
          <div className="p-8 flex flex-col items-center justify-center min-h-[200px]">
             <div className="w-16 h-16 rounded-full flex items-center justify-center mb-4" style={{ backgroundColor: "#E2FDED" }}>
              <CheckCircle className="w-8 h-8" style={{ color: "#27AE60" }} />
             </div>
             <p className="font-bold text-lg" style={{ color: "#012333" }}>Bank Details Saved!</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="p-6 space-y-4">
            <div>
              <label className="block text-xs font-bold mb-1" style={{ color: "#012333" }}>Bank Name</label>
              <input
                type="text"
                required
                value={form.bankName}
                onChange={(e) => setForm({ ...form, bankName: e.target.value })}
                className="w-full h-11 px-4 rounded-xl border text-sm outline-none transition-colors"
                style={{ borderColor: "#E1E3E6", backgroundColor: "#F7F8F9" }}
                placeholder="e.g. Access Bank"
              />
            </div>
            <div>
              <label className="block text-xs font-bold mb-1" style={{ color: "#012333" }}>Account Name</label>
              <input
                type="text"
                required
                value={form.accountName}
                onChange={(e) => setForm({ ...form, accountName: e.target.value })}
                className="w-full h-11 px-4 rounded-xl border text-sm outline-none transition-colors"
                style={{ borderColor: "#E1E3E6", backgroundColor: "#F7F8F9" }}
                placeholder="e.g. John Doe"
              />
            </div>
            <div>
              <label className="block text-xs font-bold mb-1" style={{ color: "#012333" }}>Account Number</label>
              <input
                type="text"
                required
                value={form.accountNumber}
                onChange={(e) => setForm({ ...form, accountNumber: e.target.value })}
                className="w-full h-11 px-4 rounded-xl border text-sm outline-none transition-colors"
                style={{ borderColor: "#E1E3E6", backgroundColor: "#F7F8F9" }}
                placeholder="e.g. 0123456789"
              />
            </div>
            <div className="pt-2">
              <button
                type="submit"
                disabled={loading || !form.bankName || !form.accountName || !form.accountNumber}
                className="w-full h-11 rounded-xl font-bold text-sm text-white disabled:opacity-50 transition-colors"
                style={{ backgroundColor: "#C9A227" }}
              >
                {loading ? "Saving..." : "Save Details"}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}

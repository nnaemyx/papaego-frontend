"use client";

import { useEffect, useState } from "react";
import { CheckCircle, RefreshCw } from "lucide-react";
import { customerApi } from "@/lib/api/customer";

interface NewTransactionModalProps {
  onClose: () => void;
}

const CURRENCIES = ["USD", "GBP", "EUR", "NGN", "CAD", "AED"];

export function NewTransactionModal({ onClose }: NewTransactionModalProps) {
  const [amount, setAmount] = useState("");
  const [fromCurrency, setFromCurrency] = useState("USD");
  const [toCurrency, setToCurrency] = useState("NGN");
  const [purpose, setPurpose] = useState("");
  const [agentId, setAgentId] = useState("");
  const [agents, setAgents] = useState<{ id: string; name: string; region: string }[]>([]);
  const [loadingAgents, setLoadingAgents] = useState(false);
  const [tradeType, setTradeType] = useState("BUY");
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  useEffect(() => {
    setLoadingAgents(true);
    customerApi
      .getAgents()
      .then((data) => {
        setAgents(data);
        if (data.length > 0) setAgentId(data[0].id);
      })
      .catch(() => {})
      .finally(() => setLoadingAgents(false));
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!agentId) return alert("Please select an agent");
    setSubmitting(true);
    try {
      await customerApi.createTradeRequest({
        amount,
        sendCurrency: fromCurrency,
        receiveCurrency: toCurrency,
        agentId,
        purpose,
        tradeType,
      });
      setSubmitted(true);
      setTimeout(() => {
        onClose();
        window.location.reload();
      }, 2500);
    } catch {
      alert("Failed to initiate trade. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center"
      style={{ backgroundColor: "rgba(0,0,0,0.55)" }}
      onClick={onClose}
    >
      <div
        className="w-full max-w-lg bg-white rounded-t-3xl p-6 pb-10"
        onClick={(e) => e.stopPropagation()}
      >
        {submitted ? (
          <div className="text-center py-10">
            <div
              className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4"
              style={{ backgroundColor: "#E2FDED" }}
            >
              <CheckCircle className="w-8 h-8" style={{ color: "#27AE60" }} />
            </div>
            <h3 className="text-xl font-bold mb-2" style={{ color: "#012333" }}>
              Request Submitted!
            </h3>
            <p className="body-secondary">
              An agent will review and process your trade shortly.
            </p>
          </div>
        ) : (
          <>
            {/* Header */}
            <div className="flex items-center justify-between mb-5">
              <div>
                <h3 className="text-xl font-bold" style={{ color: "var(--text-primary)" }}>
                  New Transaction
                </h3>
                <p className="caption mt-0.5" style={{ color: "var(--text-secondary)" }}>
                  Enter details to start a trade request
                </p>
              </div>
              <button
                onClick={onClose}
                className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-100 text-gray-400 text-xl font-bold transition-colors"
              >
                ×
              </button>
            </div>

            {/* Trade Type Toggle */}
            <div className="flex bg-gray-100 rounded-xl p-1 mb-5">
              {["BUY", "SELL"].map((t) => (
                <button
                  key={t}
                  type="button"
                  onClick={() => setTradeType(t)}
                  className={`flex-1 py-2.5 text-sm font-bold rounded-lg transition-colors ${
                    tradeType === t ? "bg-white shadow" : "text-gray-500 hover:text-gray-700"
                  }`}
                  style={{ color: tradeType === t ? "var(--text-primary)" : undefined }}
                >
                  {t === "BUY" ? "Buy Currency" : "Sell Currency"}
                </button>
              ))}
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Currency selects */}
              <div className="grid grid-cols-2 gap-3">
                {(
                  [
                    { label: "From Currency", value: fromCurrency, onChange: setFromCurrency },
                    { label: "To Currency",   value: toCurrency,   onChange: setToCurrency },
                  ] as const
                ).map(({ label, value, onChange }) => (
                  <div key={label}>
                    <label
                      className="caption font-medium mb-1 block"
                      style={{ color: "var(--text-secondary)" }}
                    >
                      {label}
                    </label>
                    <select
                      value={value}
                      onChange={(e) => onChange(e.target.value)}
                      className="w-full border rounded-lg px-3 py-2.5 text-sm outline-none bg-white"
                      style={{
                        borderColor: "var(--border-custom)",
                        color: "var(--text-primary)",
                      }}
                    >
                      {CURRENCIES.map((c) => (
                        <option key={c}>{c}</option>
                      ))}
                    </select>
                  </div>
                ))}
              </div>

              {/* Agent select */}
              <div>
                <label
                  className="caption font-medium mb-1 block"
                  style={{ color: "var(--text-secondary)" }}
                >
                  Assign to Agent
                </label>
                <select
                  value={agentId}
                  onChange={(e) => setAgentId(e.target.value)}
                  disabled={loadingAgents}
                  className="w-full border rounded-lg px-3 py-2.5 text-sm outline-none bg-white"
                  style={{
                    borderColor: "var(--border-custom)",
                    color: "var(--text-primary)",
                  }}
                >
                  {loadingAgents ? (
                    <option>Loading agents...</option>
                  ) : (
                    agents.map((a) => (
                      <option key={a.id} value={a.id}>
                        {a.name} ({a.region})
                      </option>
                    ))
                  )}
                </select>
              </div>

              {/* Amount */}
              <div>
                <label
                  className="caption font-medium mb-1 block"
                  style={{ color: "var(--text-secondary)" }}
                >
                  Amount (You {tradeType === "BUY" ? "Send" : "Sell"})
                </label>
                <input
                  type="number"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  placeholder="Enter amount"
                  required
                  min="1"
                  className="w-full border rounded-lg px-3 py-2.5 text-sm outline-none"
                  style={{
                    borderColor: "var(--border-custom)",
                    color: "var(--text-primary)",
                  }}
                />
              </div>

              {/* Purpose */}
              <div>
                <label
                  className="caption font-medium mb-1 block"
                  style={{ color: "var(--text-secondary)" }}
                >
                  Purpose{" "}
                  <span style={{ color: "var(--text-tertiary)" }}>(optional)</span>
                </label>
                <input
                  value={purpose}
                  onChange={(e) => setPurpose(e.target.value)}
                  placeholder="e.g. Business payment, School fees..."
                  className="w-full border rounded-lg px-3 py-2.5 text-sm outline-none"
                  style={{
                    borderColor: "var(--border-custom)",
                    color: "var(--text-primary)",
                  }}
                />
              </div>

              <button
                type="submit"
                disabled={submitting}
                className="w-full h-12 rounded-xl font-semibold text-white flex items-center justify-center gap-2 transition-opacity mt-2"
                style={{
                  backgroundColor: "var(--brand-primary)",
                  opacity: submitting ? 0.7 : 1,
                }}
              >
                {submitting && <RefreshCw className="w-4 h-4 animate-spin" />}
                {submitting ? "Processing..." : "Submit Request"}
              </button>
            </form>
          </>
        )}
      </div>
    </div>
  );
}

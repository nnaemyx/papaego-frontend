"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import {
    cancelDepositRequest,
    createDepositRequest,
    getMyDeposits,
    getMyWallet,
    type DepositRequest,
    type WalletSummary,
} from "@/lib/api/wallet";

function formatMoney(amount: string | number, currency = "NGN") {
    const value = typeof amount === "string" ? Number(amount) : amount;
    return new Intl.NumberFormat("en-NG", {
        style: "currency",
        currency,
        minimumFractionDigits: 2,
    }).format(Number.isFinite(value) ? value : 0);
}

function formatDate(iso: string) {
    return new Date(iso).toLocaleString();
}

const DEPOSIT_STATUS_STYLES: Record<string, string> = {
    PENDING: "bg-amber-100 text-amber-800",
    APPROVED: "bg-emerald-100 text-emerald-800",
    REJECTED: "bg-red-100 text-red-800",
    CANCELLED: "bg-gray-100 text-gray-600",
};

export function WalletPanel() {
    const [summary, setSummary] = useState<WalletSummary | null>(null);
    const [deposits, setDeposits] = useState<DepositRequest[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    // Deposit form state
    const [amount, setAmount] = useState("");
    const [reference, setReference] = useState("");
    const [proof, setProof] = useState<File | null>(null);
    const [submitting, setSubmitting] = useState(false);
    const [formError, setFormError] = useState<string | null>(null);
    const [formSuccess, setFormSuccess] = useState<string | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const load = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            const [walletData, depositData] = await Promise.all([
                getMyWallet(),
                getMyDeposits(),
            ]);
            setSummary(walletData);
            setDeposits(depositData.deposits ?? []);
        } catch (err) {
            console.error("Failed to load wallet", err);
            setError("We couldn't load your wallet. Please try again.");
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        load();
    }, [load]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setFormError(null);
        setFormSuccess(null);

        const parsed = Number(amount);
        if (!parsed || parsed <= 0) {
            setFormError("Enter a valid amount greater than zero.");
            return;
        }

        setSubmitting(true);
        try {
            await createDepositRequest({
                amount: parsed,
                reference: reference.trim() || undefined,
                proof,
            });
            setFormSuccess("Deposit request submitted. It will reflect once approved.");
            setAmount("");
            setReference("");
            setProof(null);
            if (fileInputRef.current) fileInputRef.current.value = "";
            await load();
        } catch (err) {
            console.error("Deposit failed", err);
            setFormError("Could not submit deposit request. Please try again.");
        } finally {
            setSubmitting(false);
        }
    };

    const handleCancel = async (id: string) => {
        try {
            await cancelDepositRequest(id);
            await load();
        } catch (err) {
            console.error("Cancel failed", err);
        }
    };

    const currency = summary?.currency ?? "NGN";

    return (
        <div className="space-y-6">
            {/* Balance cards */}
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                <div className="rounded-xl border bg-white p-5 shadow-sm">
                    <p className="text-sm text-gray-500">Available balance</p>
                    <p className="mt-1 text-2xl font-semibold text-gray-900">
                        {loading ? "—" : formatMoney(summary?.availableBalance ?? 0, currency)}
                    </p>
                </div>
                <div className="rounded-xl border bg-white p-5 shadow-sm">
                    <p className="text-sm text-gray-500">Reserved (in-flight trades)</p>
                    <p className="mt-1 text-2xl font-semibold text-gray-900">
                        {loading ? "—" : formatMoney(summary?.reservedBalance ?? 0, currency)}
                    </p>
                </div>
                <div className="rounded-xl border bg-white p-5 shadow-sm">
                    <p className="text-sm text-gray-500">Total deposited</p>
                    <p className="mt-1 text-2xl font-semibold text-gray-900">
                        {loading ? "—" : formatMoney(summary?.totalDeposited ?? 0, currency)}
                    </p>
                </div>
            </div>

            {error && (
                <div className="rounded-lg bg-red-50 p-4 text-sm text-red-700">{error}</div>
            )}

            {/* Fund wallet */}
            <div className="rounded-xl border bg-white p-5 shadow-sm">
                <h3 className="text-lg font-semibold text-gray-900">Fund your wallet</h3>
                <p className="mt-1 text-sm text-gray-500">
                    Transfer to your managed account, then submit the deposit details below. Funds
                    become available once an administrator confirms the transfer.
                </p>
                <form onSubmit={handleSubmit} className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Amount ({currency})</label>
                        <input
                            type="number"
                            min="0"
                            step="0.01"
                            value={amount}
                            onChange={(e) => setAmount(e.target.value)}
                            className="mt-1 w-full rounded-lg border px-3 py-2 text-sm focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                            placeholder="0.00"
                            required
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Reference (optional)</label>
                        <input
                            type="text"
                            value={reference}
                            onChange={(e) => setReference(e.target.value)}
                            className="mt-1 w-full rounded-lg border px-3 py-2 text-sm focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                            placeholder="Bank transfer reference"
                        />
                    </div>
                    <div className="sm:col-span-2">
                        <label className="block text-sm font-medium text-gray-700">Proof of payment (optional)</label>
                        <input
                            ref={fileInputRef}
                            type="file"
                            accept="image/*,application/pdf"
                            onChange={(e) => setProof(e.target.files?.[0] ?? null)}
                            className="mt-1 w-full text-sm text-gray-600 file:mr-3 file:rounded-lg file:border-0 file:bg-emerald-50 file:px-3 file:py-2 file:text-sm file:font-medium file:text-emerald-700"
                        />
                    </div>

                    {formError && (
                        <div className="sm:col-span-2 rounded-lg bg-red-50 p-3 text-sm text-red-700">{formError}</div>
                    )}
                    {formSuccess && (
                        <div className="sm:col-span-2 rounded-lg bg-emerald-50 p-3 text-sm text-emerald-700">{formSuccess}</div>
                    )}

                    <div className="sm:col-span-2">
                        <button
                            type="submit"
                            disabled={submitting}
                            className="rounded-lg bg-emerald-600 px-4 py-2 text-sm font-medium text-white hover:bg-emerald-700 disabled:opacity-60"
                        >
                            {submitting ? "Submitting..." : "Submit deposit request"}
                        </button>
                    </div>
                </form>
            </div>

            {/* Deposit requests */}
            <div className="rounded-xl border bg-white p-5 shadow-sm">
                <h3 className="text-lg font-semibold text-gray-900">Deposit requests</h3>
                {deposits.length === 0 ? (
                    <p className="mt-3 text-sm text-gray-500">No deposit requests yet.</p>
                ) : (
                    <div className="mt-3 overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200 text-sm">
                            <thead>
                                <tr className="text-left text-gray-500">
                                    <th className="py-2 pr-4">Date</th>
                                    <th className="py-2 pr-4">Amount</th>
                                    <th className="py-2 pr-4">Reference</th>
                                    <th className="py-2 pr-4">Status</th>
                                    <th className="py-2 pr-4"></th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                                {deposits.map((d) => (
                                    <tr key={d.id}>
                                        <td className="py-2 pr-4 text-gray-600">{formatDate(d.createdAt)}</td>
                                        <td className="py-2 pr-4 font-medium text-gray-900">
                                            {formatMoney(d.amount, d.currency)}
                                        </td>
                                        <td className="py-2 pr-4 text-gray-600">{d.reference || "—"}</td>
                                        <td className="py-2 pr-4">
                                            <span
                                                className={`inline-flex rounded-full px-2 py-0.5 text-xs font-medium ${DEPOSIT_STATUS_STYLES[d.status] ?? "bg-gray-100 text-gray-600"
                                                    }`}
                                            >
                                                {d.status}
                                            </span>
                                        </td>
                                        <td className="py-2 pr-4">
                                            {d.status === "PENDING" && (
                                                <button
                                                    onClick={() => handleCancel(d.id)}
                                                    className="text-xs font-medium text-red-600 hover:underline"
                                                >
                                                    Cancel
                                                </button>
                                            )}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>

            {/* Transaction history */}
            <div className="rounded-xl border bg-white p-5 shadow-sm">
                <h3 className="text-lg font-semibold text-gray-900">Transaction history</h3>
                {!summary || summary.transactions.length === 0 ? (
                    <p className="mt-3 text-sm text-gray-500">No transactions yet.</p>
                ) : (
                    <div className="mt-3 overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200 text-sm">
                            <thead>
                                <tr className="text-left text-gray-500">
                                    <th className="py-2 pr-4">Date</th>
                                    <th className="py-2 pr-4">Type</th>
                                    <th className="py-2 pr-4">Description</th>
                                    <th className="py-2 pr-4 text-right">Amount</th>
                                    <th className="py-2 pr-4 text-right">Balance</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                                {summary.transactions.map((t) => {
                                    const value = Number(t.amount);
                                    const isCredit = value >= 0;
                                    return (
                                        <tr key={t.id}>
                                            <td className="py-2 pr-4 text-gray-600">{formatDate(t.createdAt)}</td>
                                            <td className="py-2 pr-4 text-gray-600">{t.type.replace(/_/g, " ")}</td>
                                            <td className="py-2 pr-4 text-gray-600">{t.description || "—"}</td>
                                            <td
                                                className={`py-2 pr-4 text-right font-medium ${isCredit ? "text-emerald-600" : "text-red-600"
                                                    }`}
                                            >
                                                {isCredit ? "+" : ""}
                                                {formatMoney(value, t.currency)}
                                            </td>
                                            <td className="py-2 pr-4 text-right text-gray-900">
                                                {formatMoney(t.balanceAfter, t.currency)}
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </div>
    );
}

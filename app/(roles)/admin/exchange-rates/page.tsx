"use client";

import { useState, useCallback } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
    exchangeRatesApi,
    type ProviderRateDetail,
    type MarkupConfig,
    type ExchangeRateLog,
    type MarkupType,
} from "@/lib/api/exchange-rates";
import { toast } from "sonner";
import {
    TrendingUp,
    Shield,
    Settings,
    RefreshCw,
    Plus,
    Save,
    History,
    Eye,
    EyeOff,
    ArrowRight,
    Info,
    CheckCircle2,
    Clock,
    ChevronLeft,
    ChevronRight,
    AlertTriangle,
    Percent,
    DollarSign,
    Activity,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogFooter,
} from "@/components/ui/dialog";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";

// ─── Constants ────────────────────────────────────────────────────────────────

const SUPPORTED_PAIRS = [
    { base: "USD", quote: "NGN" },
    { base: "GBP", quote: "NGN" },
    { base: "EUR", quote: "NGN" },
    { base: "AED", quote: "NGN" },
    { base: "CNY", quote: "NGN" },
    { base: "USDT", quote: "NGN" },
    { base: "USDC", quote: "NGN" },
];

const CURRENCY_ICONS: Record<string, string> = {
    NGN: "₦", USD: "$", EUR: "€", GBP: "£", AED: "د.إ", CNY: "¥", USDT: "₮", USDC: "◎",
};

const CURRENCY_FLAGS: Record<string, string> = {
    USD: "🇺🇸", GBP: "🇬🇧", EUR: "🇪🇺", AED: "🇦🇪", CNY: "🇨🇳",
    USDT: "💵", USDC: "💵", NGN: "🇳🇬",
};

// ─── Formatters ───────────────────────────────────────────────────────────────

function formatRate(rate: number | string, currency = "NGN"): string {
    const num = typeof rate === "string" ? parseFloat(rate) : rate;
    const symbol = CURRENCY_ICONS[currency] || "";
    return `${symbol}${num.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 4 })}`;
}

function formatDate(date: string): string {
    return new Date(date).toLocaleString("en-GB", {
        day: "2-digit",
        month: "short",
        hour: "2-digit",
        minute: "2-digit",
    });
}

// ─── Rate Card (admin view) ───────────────────────────────────────────────────

function RateCard({
    rate,
    markup,
    onEditMarkup,
}: {
    rate: ProviderRateDetail;
    markup?: MarkupConfig;
    onEditMarkup: () => void;
}) {
    const [showProvider, setShowProvider] = useState(false);
    const markupValue = markup ? parseFloat(markup.markupValue) : 0;
    const markupType = markup?.markupType ?? "FIXED";

    const markupDisplay =
        markupType === "FIXED"
            ? `+${CURRENCY_ICONS[rate.pair.split("/")[1]] || ""}${markupValue.toFixed(2)}`
            : `+${markupValue.toFixed(2)}%`;

    return (
        <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
            {/* Header */}
            <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                    <span className="text-xl">{CURRENCY_FLAGS[rate.pair.split("/")[0]] || "🌐"}</span>
                    <div>
                        <p className="font-bold text-gray-800">{rate.pair}</p>
                        <p className="text-xs text-gray-400">{rate.providerName}</p>
                    </div>
                </div>
                <Badge
                    variant="outline"
                    className="text-xs"
                    style={{ color: "#27ae60", borderColor: "#27ae60", backgroundColor: "#e2fded" }}
                >
                    <Activity size={10} className="mr-1" />
                    Live
                </Badge>
            </div>

            {/* Customer Rate — always visible */}
            <div
                className="rounded-xl p-4 mb-3"
                style={{ background: "linear-gradient(135deg, #2f2403 0%, #4a3a05 100%)" }}
            >
                <p className="text-white/50 text-xs uppercase tracking-widest mb-1">Customer Rate</p>
                <p className="text-white font-black text-2xl">
                    {formatRate(rate.customerRate, rate.pair.split("/")[1])}
                </p>
                <div className="flex items-center gap-2 mt-2">
                    <span
                        className="text-xs px-2 py-0.5 rounded-full font-medium"
                        style={{ background: "rgba(201,162,39,0.25)", color: "#c9a227" }}
                    >
                        {markupDisplay} markup
                    </span>
                    <span className="text-white/40 text-xs">{markupType}</span>
                </div>
            </div>

            {/* Provider Rate — toggle */}
            <div className="border border-gray-100 rounded-xl p-3 mb-3">
                <div className="flex items-center justify-between">
                    <div>
                        <p className="text-xs text-gray-400 uppercase tracking-widest mb-0.5">
                            Provider Rate
                            <span className="ml-1 px-1.5 py-0.5 rounded text-xs bg-gray-100 text-gray-500 normal-case tracking-normal">
                                Admin only
                            </span>
                        </p>
                        {showProvider ? (
                            <p className="font-bold text-gray-600 text-sm">
                                {formatRate(rate.providerRate, rate.pair.split("/")[1])}
                            </p>
                        ) : (
                            <p className="font-bold text-gray-300 text-sm tracking-widest">••••••••</p>
                        )}
                    </div>
                    <button
                        onClick={() => setShowProvider((p) => !p)}
                        className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
                    >
                        {showProvider ? <EyeOff size={14} className="text-gray-400" /> : <Eye size={14} className="text-gray-400" />}
                    </button>
                </div>
            </div>

            {/* Markup breakdown */}
            <div className="flex items-center gap-2 text-xs text-gray-500 mb-4">
                <span className="font-mono">{formatRate(rate.providerRate, rate.pair.split("/")[1])}</span>
                <ArrowRight size={10} className="text-gray-300" />
                <span className="text-amber-600 font-medium">{markupDisplay}</span>
                <ArrowRight size={10} className="text-gray-300" />
                <span className="font-mono font-bold text-gray-700">
                    {formatRate(rate.customerRate, rate.pair.split("/")[1])}
                </span>
            </div>

            {/* Actions */}
            <div className="flex items-center justify-between">
                <p className="text-xs text-gray-400">
                    <Clock size={10} className="inline mr-1" />
                    {formatDate(rate.fetchedAt)}
                </p>
                <Button
                    size="sm"
                    variant="outline"
                    onClick={onEditMarkup}
                    className="h-7 text-xs"
                    style={{ borderColor: "#c9a227", color: "#c9a227" }}
                >
                    <Settings size={11} className="mr-1" />
                    Edit Markup
                </Button>
            </div>
        </div>
    );
}

// ─── Markup Edit Modal ────────────────────────────────────────────────────────

function MarkupEditModal({
    open,
    pair,
    existing,
    onClose,
    onSuccess,
}: {
    open: boolean;
    pair: { base: string; quote: string } | null;
    existing: MarkupConfig | null;
    onClose: () => void;
    onSuccess: () => void;
}) {
    const [markupType, setMarkupType] = useState<MarkupType>(
        existing?.markupType ?? "FIXED"
    );
    const [markupValue, setMarkupValue] = useState(
        existing?.markupValue ?? "0"
    );

    // Recalculate preview if we have the provider rate
    const { data: providerData } = useQuery({
        queryKey: ["provider-rate-preview", pair?.base, pair?.quote],
        queryFn: () =>
            pair ? exchangeRatesApi.getProviderRate(pair.base, pair.quote) : null,
        enabled: !!pair && open,
    });

    const providerRate = providerData && "rate" in providerData
        ? providerData.rate.providerRate
        : null;

    const previewCustomerRate = providerRate
        ? markupType === "FIXED"
            ? providerRate + parseFloat(markupValue || "0")
            : providerRate * (1 + parseFloat(markupValue || "0") / 100)
        : null;

    const mutation = useMutation({
        mutationFn: () =>
            exchangeRatesApi.setMarkup({
                baseCurrency: pair!.base,
                quoteCurrency: pair!.quote,
                markupType,
                markupValue: parseFloat(markupValue),
            }),
        onSuccess: () => {
            toast.success(`Markup updated for ${pair?.base}/${pair?.quote}`);
            onSuccess();
            onClose();
        },
        onError: (err: any) => toast.error(err.response?.data?.error || "Failed to update markup"),
    });

    if (!pair) return null;

    return (
        <Dialog open={open} onOpenChange={onClose}>
            <DialogContent className="max-w-md">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        <div className="p-1.5 rounded-lg" style={{ backgroundColor: "#fdf3d0" }}>
                            <Settings size={15} style={{ color: "#c9a227" }} />
                        </div>
                        Edit Markup — {pair.base}/{pair.quote}
                    </DialogTitle>
                </DialogHeader>

                <div className="space-y-5">
                    <div className="p-3 rounded-xl bg-blue-50 border border-blue-100 flex gap-2">
                        <Info size={14} className="text-blue-500 mt-0.5 flex-shrink-0" />
                        <p className="text-xs text-blue-600">
                            Changes take effect immediately. The provider rate remains unchanged internally.
                            Customers only see the final customer rate.
                        </p>
                    </div>

                    {/* Markup type selector */}
                    <div>
                        <Label className="text-sm font-semibold mb-3 block">Markup Type</Label>
                        <div className="grid grid-cols-2 gap-3">
                            {(["FIXED", "PERCENTAGE"] as MarkupType[]).map((type) => (
                                <button
                                    key={type}
                                    onClick={() => setMarkupType(type)}
                                    className={`p-3 rounded-xl border-2 transition-all text-left ${markupType === type
                                        ? "border-amber-400 bg-amber-50"
                                        : "border-gray-200 hover:border-gray-300"
                                        }`}
                                >
                                    <div className="flex items-center gap-2 mb-1">
                                        {type === "FIXED"
                                            ? <DollarSign size={14} style={{ color: markupType === type ? "#c9a227" : "#9aa0a6" }} />
                                            : <Percent size={14} style={{ color: markupType === type ? "#c9a227" : "#9aa0a6" }} />
                                        }
                                        <span className={`text-sm font-bold ${markupType === type ? "text-amber-700" : "text-gray-500"}`}>
                                            {type === "FIXED" ? "Fixed" : "Percentage"}
                                        </span>
                                    </div>
                                    <p className="text-xs text-gray-400">
                                        {type === "FIXED"
                                            ? `Rate + ${CURRENCY_ICONS[pair.quote] || ""}amount`
                                            : "Rate × (1 + %/100)"}
                                    </p>
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Markup value */}
                    <div>
                        <Label>
                            Markup Value{" "}
                            <span className="text-gray-400 font-normal">
                                ({markupType === "FIXED"
                                    ? `${CURRENCY_ICONS[pair.quote] || ""}amount`
                                    : "percentage %"})
                            </span>
                        </Label>
                        <div className="relative mt-1">
                            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm">
                                {markupType === "FIXED" ? (CURRENCY_ICONS[pair.quote] || "+") : "%"}
                            </span>
                            <Input
                                type="number"
                                min="0"
                                step={markupType === "FIXED" ? "1" : "0.01"}
                                value={markupValue}
                                onChange={(e) => setMarkupValue(e.target.value)}
                                className="pl-8"
                                placeholder="0"
                            />
                        </div>
                    </div>

                    {/* Live preview */}
                    {providerRate !== null && previewCustomerRate !== null && (
                        <div className="rounded-xl border border-gray-200 p-4">
                            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">
                                Rate Preview
                            </p>
                            <div className="flex items-center gap-3 text-sm">
                                <div className="text-center">
                                    <p className="text-xs text-gray-400 mb-1">Provider Rate</p>
                                    <p className="font-bold text-gray-600">
                                        {formatRate(providerRate, pair.quote)}
                                    </p>
                                </div>
                                <ArrowRight size={16} className="text-gray-300 flex-shrink-0" />
                                <div className="text-center">
                                    <p className="text-xs text-gray-400 mb-1">Markup</p>
                                    <p className="font-bold text-amber-600">
                                        {markupType === "FIXED"
                                            ? `+${CURRENCY_ICONS[pair.quote] || ""}${parseFloat(markupValue || "0").toFixed(2)}`
                                            : `+${parseFloat(markupValue || "0").toFixed(2)}%`}
                                    </p>
                                </div>
                                <ArrowRight size={16} className="text-gray-300 flex-shrink-0" />
                                <div className="text-center">
                                    <p className="text-xs text-gray-400 mb-1">Customer Rate</p>
                                    <p className="font-black text-gray-900 text-base">
                                        {formatRate(previewCustomerRate, pair.quote)}
                                    </p>
                                </div>
                            </div>
                        </div>
                    )}
                </div>

                <DialogFooter>
                    <Button variant="outline" onClick={onClose}>Cancel</Button>
                    <Button
                        onClick={() => mutation.mutate()}
                        disabled={mutation.isPending}
                        style={{ backgroundColor: "#c9a227" }}
                        className="text-white"
                    >
                        <Save size={13} className="mr-2" />
                        {mutation.isPending ? "Saving..." : "Save Markup"}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}

// ─── Ingest Rate Modal ────────────────────────────────────────────────────────

function IngestRateModal({
    open,
    onClose,
    onSuccess,
}: {
    open: boolean;
    onClose: () => void;
    onSuccess: () => void;
}) {
    const [form, setForm] = useState({
        providerName: "Manual",
        baseCurrency: "USD",
        quoteCurrency: "NGN",
        providerRate: "",
    });

    const mutation = useMutation({
        mutationFn: () =>
            exchangeRatesApi.ingestRate({
                ...form,
                providerRate: parseFloat(form.providerRate),
            }),
        onSuccess: () => {
            toast.success("Rate ingested successfully");
            onSuccess();
            onClose();
            setForm({ providerName: "Manual", baseCurrency: "USD", quoteCurrency: "NGN", providerRate: "" });
        },
        onError: (err: any) => toast.error(err.response?.data?.error || "Failed to ingest rate"),
    });

    return (
        <Dialog open={open} onOpenChange={onClose}>
            <DialogContent className="max-w-md">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        <Plus size={16} style={{ color: "#c9a227" }} />
                        Ingest Provider Rate
                    </DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                    <div className="p-3 rounded-xl bg-amber-50 border border-amber-200 flex gap-2">
                        <Shield size={14} className="text-amber-600 mt-0.5 flex-shrink-0" />
                        <p className="text-xs text-amber-700">
                            Provider rates are stored immutably. This rate will be used to compute customer rates
                            based on the configured markup.
                        </p>
                    </div>
                    <div>
                        <Label>Provider Name</Label>
                        <Input
                            placeholder="e.g. Binance, OKX, Manual"
                            value={form.providerName}
                            onChange={(e) => setForm((p) => ({ ...p, providerName: e.target.value }))}
                        />
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                        <div>
                            <Label>Base Currency</Label>
                            <Select value={form.baseCurrency} onValueChange={(v) => setForm((p) => ({ ...p, baseCurrency: v }))}>
                                <SelectTrigger><SelectValue /></SelectTrigger>
                                <SelectContent>
                                    {["USD", "GBP", "EUR", "AED", "CNY", "USDT", "USDC"].map((c) => (
                                        <SelectItem key={c} value={c}>{c}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                        <div>
                            <Label>Quote Currency</Label>
                            <Select value={form.quoteCurrency} onValueChange={(v) => setForm((p) => ({ ...p, quoteCurrency: v }))}>
                                <SelectTrigger><SelectValue /></SelectTrigger>
                                <SelectContent>
                                    {["NGN", "USD", "GBP", "EUR"].map((c) => (
                                        <SelectItem key={c} value={c}>{c}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                    </div>
                    <div>
                        <Label>Provider Rate (1 {form.baseCurrency} = ? {form.quoteCurrency})</Label>
                        <Input
                            type="number"
                            placeholder="e.g. 1620"
                            value={form.providerRate}
                            onChange={(e) => setForm((p) => ({ ...p, providerRate: e.target.value }))}
                        />
                    </div>
                </div>
                <DialogFooter>
                    <Button variant="outline" onClick={onClose}>Cancel</Button>
                    <Button
                        onClick={() => mutation.mutate()}
                        disabled={mutation.isPending || !form.providerRate || !form.providerName}
                        style={{ backgroundColor: "#c9a227" }}
                        className="text-white"
                    >
                        {mutation.isPending ? "Ingesting..." : "Ingest Rate"}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}

// ─── Audit Log Table ──────────────────────────────────────────────────────────

function AuditLogTable() {
    const [page, setPage] = useState(1);
    const limit = 20;

    const { data, isLoading } = useQuery({
        queryKey: ["exchange-rate-logs", page],
        queryFn: () => exchangeRatesApi.getRateLogs({ page, limit }),
    });

    const logs = data?.logs ?? [];
    const total = data?.total ?? 0;
    const totalPages = Math.ceil(total / limit);

    return (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
                <h3 className="font-bold text-gray-800 flex items-center gap-2">
                    <History size={16} style={{ color: "#c9a227" }} />
                    Rate Audit Log
                </h3>
                <span className="text-sm text-gray-400">{total.toLocaleString()} quotes generated</span>
            </div>

            {isLoading ? (
                <div className="p-8 text-center">
                    <RefreshCw size={20} className="animate-spin text-gray-300 mx-auto mb-2" />
                    <p className="text-sm text-gray-400">Loading logs...</p>
                </div>
            ) : logs.length === 0 ? (
                <div className="p-12 text-center">
                    <History size={36} className="text-gray-200 mx-auto mb-3" />
                    <p className="text-gray-500 font-medium">No quotes generated yet</p>
                    <p className="text-gray-400 text-sm mt-1">
                        Every time a customer or system requests a rate, it will be logged here
                    </p>
                </div>
            ) : (
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead>
                            <tr className="border-b border-gray-100">
                                {["Pair", "Provider", "Provider Rate", "Markup", "Customer Rate", "Requested By", "Timestamp"].map((col) => (
                                    <th key={col} className="px-4 py-3 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider">
                                        {col}
                                    </th>
                                ))}
                            </tr>
                        </thead>
                        <tbody>
                            {logs.map((log: ExchangeRateLog) => (
                                <tr key={log.id} className="border-b border-gray-50 hover:bg-gray-50/50 transition-colors">
                                    <td className="px-4 py-3">
                                        <div className="flex items-center gap-2">
                                            <span>{CURRENCY_FLAGS[log.baseCurrency] || "🌐"}</span>
                                            <span className="font-bold text-gray-800 text-sm">
                                                {log.baseCurrency}/{log.quoteCurrency}
                                            </span>
                                        </div>
                                    </td>
                                    <td className="px-4 py-3 text-sm text-gray-500">{log.providerName}</td>
                                    <td className="px-4 py-3">
                                        <span className="font-mono text-sm text-gray-600">
                                            {formatRate(log.providerRate, log.quoteCurrency)}
                                        </span>
                                    </td>
                                    <td className="px-4 py-3">
                                        <div>
                                            <span
                                                className="text-xs px-2 py-0.5 rounded-full font-medium"
                                                style={{ backgroundColor: "#fdf3d0", color: "#a97600" }}
                                            >
                                                +{formatRate(log.markupApplied, log.quoteCurrency)}
                                            </span>
                                            <span className="text-xs text-gray-400 ml-1">{log.markupType}</span>
                                        </div>
                                    </td>
                                    <td className="px-4 py-3">
                                        <span className="font-bold text-gray-900 text-sm">
                                            {formatRate(log.customerRate, log.quoteCurrency)}
                                        </span>
                                    </td>
                                    <td className="px-4 py-3 text-xs text-gray-400">
                                        {log.requestedBy ? log.requestedBy.substring(0, 8) + "..." : "System"}
                                    </td>
                                    <td className="px-4 py-3 text-xs text-gray-400 whitespace-nowrap">
                                        {formatDate(log.createdAt)}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}

            {totalPages > 1 && (
                <div className="flex items-center justify-between px-6 py-4 border-t border-gray-100">
                    <p className="text-sm text-gray-400">
                        {((page - 1) * limit) + 1}–{Math.min(page * limit, total)} of {total.toLocaleString()}
                    </p>
                    <div className="flex items-center gap-2">
                        <Button size="sm" variant="outline" onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={page === 1} className="h-8 w-8 p-0">
                            <ChevronLeft size={13} />
                        </Button>
                        <span className="text-sm text-gray-600">{page} / {totalPages}</span>
                        <Button size="sm" variant="outline" onClick={() => setPage((p) => Math.min(totalPages, p + 1))} disabled={page === totalPages} className="h-8 w-8 p-0">
                            <ChevronRight size={13} />
                        </Button>
                    </div>
                </div>
            )}
        </div>
    );
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function ExchangeRatesPage() {
    const queryClient = useQueryClient();
    const [editingPair, setEditingPair] = useState<{ base: string; quote: string } | null>(null);
    const [ingestOpen, setIngestOpen] = useState(false);
    const [activeTab, setActiveTab] = useState<"rates" | "logs">("rates");

    const { data: providerData, isLoading, refetch } = useQuery({
        queryKey: ["all-provider-rates"],
        queryFn: exchangeRatesApi.getAllProviderRates,
        refetchInterval: 60000,
    });

    const { data: markupData } = useQuery({
        queryKey: ["all-markup-configs"],
        queryFn: () => exchangeRatesApi.getMarkupConfigs(),
    });

    const rates = providerData && "rates" in providerData ? providerData.rates : [];
    const markups = markupData && "markups" in markupData ? markupData.markups : [];

    const getMarkupForPair = useCallback(
        (base: string, quote: string) =>
            markups.find((m: MarkupConfig) => m.baseCurrency === base && m.quoteCurrency === quote) || null,
        [markups]
    );

    const editingMarkup = editingPair
        ? getMarkupForPair(editingPair.base, editingPair.quote)
        : null;

    // Summary stats
    const totalPairs = rates.length;
    const avgMarkup =
        rates.length > 0
            ? rates.reduce((sum, r) => sum + (r.customerRate - r.providerRate), 0) / rates.length
            : 0;

    return (
        <div className="min-h-screen" style={{ backgroundColor: "#f7f8f9" }}>
            {/* Header */}
            <div
                className="px-8 pt-8 pb-10 relative overflow-hidden"
                style={{ background: "linear-gradient(135deg, #012333 0%, #023d57 50%, #012333 100%)" }}
            >
                <div className="absolute inset-0 opacity-5">
                    <div
                        className="absolute inset-0"
                        style={{
                            backgroundImage: "repeating-linear-gradient(45deg, #c9a227 0, #c9a227 1px, transparent 0, transparent 50%)",
                            backgroundSize: "20px 20px",
                        }}
                    />
                </div>

                <div className="relative max-w-7xl mx-auto">
                    <div className="flex items-start justify-between">
                        <div>
                            <div className="flex items-center gap-3 mb-2">
                                <div className="p-2 rounded-xl" style={{ background: "rgba(201,162,39,0.2)" }}>
                                    <TrendingUp size={22} style={{ color: "#c9a227" }} />
                                </div>
                                <h1 className="text-2xl font-bold text-white">Exchange Rate Engine</h1>
                            </div>
                            <p className="text-white/50 text-sm">
                                Manage provider rates, markup configuration, and quote audit trail
                            </p>
                        </div>
                        <div className="flex items-center gap-3">
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() => refetch()}
                                style={{ borderColor: "rgba(255,255,255,0.2)", background: "transparent", color: "rgba(255,255,255,0.8)" }}
                            >
                                <RefreshCw size={13} className="mr-1" />
                                Refresh
                            </Button>
                            <Button
                                size="sm"
                                onClick={() => setIngestOpen(true)}
                                style={{ backgroundColor: "#c9a227", color: "#fff" }}
                            >
                                <Plus size={13} className="mr-2" />
                                Ingest Rate
                            </Button>
                        </div>
                    </div>

                    {/* Stats strip */}
                    <div className="mt-6 grid grid-cols-4 gap-4">
                        {[
                            { label: "Active Pairs", value: totalPairs, icon: TrendingUp, color: "#c9a227" },
                            {
                                label: "Avg. Markup",
                                value: `₦${avgMarkup.toFixed(2)}`,
                                icon: DollarSign,
                                color: "#2dd97a",
                            },
                            {
                                label: "Last Updated",
                                value: rates[0] ? formatDate(rates[0].fetchedAt) : "—",
                                icon: Clock,
                                color: "#76b0ff",
                            },
                            {
                                label: "Provider Security",
                                value: "Rates Hidden",
                                icon: Shield,
                                color: "#f57a92",
                            },
                        ].map((stat) => {
                            const Icon = stat.icon;
                            return (
                                <div key={stat.label} className="rounded-xl p-4" style={{ background: "rgba(255,255,255,0.08)" }}>
                                    <div className="flex items-center gap-2 mb-2">
                                        <Icon size={14} style={{ color: stat.color }} />
                                        <span className="text-white/50 text-xs">{stat.label}</span>
                                    </div>
                                    <p className="text-white font-bold text-sm">{stat.value}</p>
                                </div>
                            );
                        })}
                    </div>
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-8 py-8">
                {/* Tabs */}
                <div className="flex items-center gap-2 mb-6">
                    {[
                        { key: "rates", label: "Rate Configuration", icon: Settings },
                        { key: "logs", label: "Audit Logs", icon: History },
                    ].map(({ key, label, icon: Icon }) => (
                        <button
                            key={key}
                            onClick={() => setActiveTab(key as "rates" | "logs")}
                            className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-semibold transition-all ${activeTab === key
                                ? "text-white shadow-md"
                                : "text-gray-500 hover:text-gray-800"
                                }`}
                            style={activeTab === key
                                ? { backgroundColor: "#012333" }
                                : { backgroundColor: "#fff", border: "1px solid #e1e3e6" }
                            }
                        >
                            <Icon size={14} />
                            {label}
                        </button>
                    ))}
                </div>

                {activeTab === "rates" && (
                    <div>
                        {/* How it works info banner */}
                        <div
                            className="rounded-2xl p-4 mb-6 flex items-start gap-3"
                            style={{ background: "linear-gradient(135deg, #e6f7ff 0%, #f0f9ff 100%)", border: "1px solid #bae0ff" }}
                        >
                            <Info size={16} className="text-blue-500 mt-0.5 flex-shrink-0" />
                            <div className="text-sm text-blue-700">
                                <p className="font-semibold mb-1">How the Rate Engine Works</p>
                                <p>
                                    Provider rates are fetched and stored immutably. The configured markup is applied
                                    dynamically to compute the <strong>customer rate</strong>. Customers{" "}
                                    <strong>never</strong> see provider rates — only the final customer rate is returned
                                    to public endpoints. Every quote is logged for full auditability.
                                </p>
                                <div className="flex items-center gap-2 mt-2 font-mono text-xs">
                                    <span className="bg-blue-100 px-2 py-0.5 rounded">Provider Rate</span>
                                    <ArrowRight size={10} />
                                    <span className="bg-amber-100 text-amber-700 px-2 py-0.5 rounded">+ Markup</span>
                                    <ArrowRight size={10} />
                                    <span className="bg-green-100 text-green-700 px-2 py-0.5 rounded font-bold">Customer Rate</span>
                                </div>
                            </div>
                        </div>

                        {/* Rate cards */}
                        {isLoading ? (
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                                {[1, 2, 3, 4, 5, 6].map((i) => (
                                    <div key={i} className="h-72 rounded-2xl bg-gray-200 animate-pulse" />
                                ))}
                            </div>
                        ) : rates.length === 0 ? (
                            <div className="flex flex-col items-center justify-center py-20 rounded-2xl border-2 border-dashed border-gray-200">
                                <TrendingUp size={40} className="text-gray-300 mb-3" />
                                <p className="text-gray-500 font-medium">No rates configured yet</p>
                                <p className="text-gray-400 text-sm mt-1 mb-4">
                                    Ingest provider rates to start configuring markups
                                </p>
                                <Button
                                    onClick={() => setIngestOpen(true)}
                                    style={{ backgroundColor: "#c9a227", color: "#fff" }}
                                >
                                    <Plus size={14} className="mr-2" />
                                    Ingest First Rate
                                </Button>
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                                {rates.map((rate: ProviderRateDetail) => {
                                    const [base, quote] = rate.pair.split("/");
                                    return (
                                        <RateCard
                                            key={rate.pair}
                                            rate={rate}
                                            markup={getMarkupForPair(base, quote) || undefined}
                                            onEditMarkup={() => setEditingPair({ base, quote })}
                                        />
                                    );
                                })}
                            </div>
                        )}
                    </div>
                )}

                {activeTab === "logs" && <AuditLogTable />}
            </div>

            {/* Modals */}
            <MarkupEditModal
                open={!!editingPair}
                pair={editingPair}
                existing={editingMarkup}
                onClose={() => setEditingPair(null)}
                onSuccess={() => {
                    queryClient.invalidateQueries({ queryKey: ["all-provider-rates"] });
                    queryClient.invalidateQueries({ queryKey: ["all-markup-configs"] });
                }}
            />
            <IngestRateModal
                open={ingestOpen}
                onClose={() => setIngestOpen(false)}
                onSuccess={() => {
                    queryClient.invalidateQueries({ queryKey: ["all-provider-rates"] });
                }}
            />
        </div>
    );
}

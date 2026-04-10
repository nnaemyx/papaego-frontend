"use client";

import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { adminRatesApi, type FxRate, type UpsertFxRatePayload } from "@/lib/api/fx-rates";
import { settingsApi } from "@/lib/api/settings";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import {
  TrendingUp,
  Plus,
  Save,
  Pencil,
  Trash2,
  RefreshCw,
  AlertCircle,
  Info,
  CheckCircle,
} from "lucide-react";
import { toast } from "sonner";

const CURRENCY_PAIRS = [
  "USD/NGN", "GBP/NGN", "EUR/NGN", "CAD/NGN", "AED/NGN",
  "CHF/NGN", "JPY/NGN", "CNY/NGN", "AUD/NGN", "ZAR/NGN",
];

function parsePair(pair: string): { base: string; quote: string } {
  const [base, quote] = pair.split("/");
  return { base: base ?? pair, quote: quote ?? "NGN" };
}

interface EditState {
  pair: string;
  buy: string;
  sell: string;
}

export default function AdminRatesPage() {
  const queryClient = useQueryClient();

  // Inline-edit state — key is pair string
  const [editingPair, setEditingPair] = useState<string | null>(null);
  const [editValues, setEditValues] = useState<EditState>({ pair: "", buy: "", sell: "" });

  // Add-new dialog
  const [addOpen, setAddOpen] = useState(false);
  const [newPair, setNewPair] = useState("");
  const [newBuy, setNewBuy] = useState("");
  const [newSell, setNewSell] = useState("");
  const [customPair, setCustomPair] = useState(false);

  // FX Margin state
  const [marginInput, setMarginInput] = useState<string>("0.00");

  // ── Queries ──────────────────────────────────────────────────────────────────
  const { data: rates = [], isLoading, refetch, isRefetching } = useQuery({
    queryKey: ["admin-fx-rates"],
    queryFn: adminRatesApi.getRates,
  });

  const { data: fxMargin } = useQuery({
    queryKey: ["fx-margin", "NGA"],
    queryFn: () => settingsApi.getFxMargin("NGA"),
  });

  useEffect(() => {
    if (fxMargin?.margin !== undefined) {
      setMarginInput(fxMargin.margin.toString());
    }
  }, [fxMargin]);

  // ── Mutations ─────────────────────────────────────────────────────────────────
  const upsertMutation = useMutation({
    mutationFn: (payload: UpsertFxRatePayload) => adminRatesApi.upsertRate(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-fx-rates"] });
      toast.success("Rate updated successfully");
      setEditingPair(null);
      setAddOpen(false);
      setNewPair(""); setNewBuy(""); setNewSell("");
    },
    onError: () => toast.error("Failed to update rate. Please try again."),
  });

  const deleteMutation = useMutation({
    mutationFn: (pair: string) => adminRatesApi.deleteRate(pair),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-fx-rates"] });
      toast.success("Rate removed");
    },
    onError: () => toast.error("Failed to remove rate."),
  });

  const marginMutation = useMutation({
    mutationFn: (margin: number) => settingsApi.setFxMargin("NGA", margin),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["fx-margin", "NGA"] });
      toast.success("FX Margin updated");
    },
    onError: () => toast.error("Failed to update margin."),
  });

  // ── Handlers ──────────────────────────────────────────────────────────────────
  const startEdit = (rate: FxRate) => {
    setEditingPair(rate.pair);
    setEditValues({ pair: rate.pair, buy: rate.buy.toString(), sell: rate.sell.toString() });
  };

  const saveEdit = () => {
    const buy = parseFloat(editValues.buy);
    const sell = parseFloat(editValues.sell);
    if (isNaN(buy) || isNaN(sell) || buy <= 0 || sell <= 0) {
      toast.error("Please enter valid positive rate values");
      return;
    }
    if (sell < buy) {
      toast.error("Sell rate should be ≥ Buy rate");
      return;
    }
    const { base, quote } = parsePair(editValues.pair);
    upsertMutation.mutate({ pair: editValues.pair, baseCurrency: base, quoteCurrency: quote, buy, sell });
  };

  const handleAdd = () => {
    const pair = newPair.trim().toUpperCase();
    const buy = parseFloat(newBuy);
    const sell = parseFloat(newSell);
    if (!pair || !pair.includes("/")) { toast.error("Enter a valid pair (e.g. USD/NGN)"); return; }
    if (isNaN(buy) || isNaN(sell) || buy <= 0 || sell <= 0) { toast.error("Enter valid positive rates"); return; }
    if (sell < buy) { toast.error("Sell rate should be ≥ Buy rate"); return; }
    const { base, quote } = parsePair(pair);
    upsertMutation.mutate({ pair, baseCurrency: base, quoteCurrency: quote, buy, sell });
  };

  const handleMarginSave = () => {
    const num = parseFloat(marginInput);
    if (isNaN(num) || num < 0) { toast.error("Enter a valid margin value"); return; }
    marginMutation.mutate(num);
  };

  const formatTime = (iso: string) => {
    try { return new Date(iso).toLocaleString("en-NG", { dateStyle: "medium", timeStyle: "short" }); }
    catch { return iso; }
  };

  return (
    <div className="p-4 md:p-6 lg:pl-7 lg:pr-6 space-y-8" style={{ backgroundColor: "#f7f8f9", minHeight: "100%" }}>

      {/* ── Header ── */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl lg:text-4xl font-bold mb-1" style={{ color: "var(--text-primary)" }}>
            Exchange Rates
          </h1>
          <p className="text-sm md:text-base" style={{ color: "var(--text-secondary)" }}>
            Manage live FX rates visible to all agents and customers
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => refetch()}
            disabled={isRefetching}
            className="w-10 h-10 rounded-full border bg-white flex items-center justify-center shadow-sm hover:bg-gray-50 transition-colors"
            style={{ borderColor: "var(--border-custom)" }}
          >
            <RefreshCw className={`w-4 h-4 ${isRefetching ? "animate-spin" : ""}`} style={{ color: "var(--brand-primary)" }} />
          </button>
          <Button
            onClick={() => { setAddOpen(true); setNewPair(""); setNewBuy(""); setNewSell(""); setCustomPair(false); }}
            className="h-10 px-5 flex items-center gap-2"
            style={{ backgroundColor: "var(--brand-primary)", color: "#fff" }}
          >
            <Plus className="w-4 h-4" />
            Add Rate
          </Button>
        </div>
      </div>

      {/* ── Admin Notice ── */}
      <div className="flex items-start gap-3 p-4 rounded-xl border" style={{ backgroundColor: "#E2FDED", borderColor: "#86EFAC" }}>
        <CheckCircle className="w-5 h-5 shrink-0 mt-0.5" style={{ color: "#27AE60" }} />
        <div>
          <p className="text-sm font-semibold" style={{ color: "#166534" }}>Admin-Controlled Rates</p>
          <p className="text-xs mt-0.5" style={{ color: "#15803D" }}>
            All rates set here are published platform-wide. Agents and customers see them in read-only mode.
            Rates lock in at trade confirmation — existing confirmed trades are not affected.
          </p>
        </div>
      </div>

      {/* ── FX Margin Card ── */}
      <div className="bg-white rounded-2xl border shadow-sm p-6" style={{ borderColor: "var(--border-custom)" }}>
        <div className="flex items-center gap-2 mb-4">
          <TrendingUp className="w-5 h-5" style={{ color: "var(--brand-primary)" }} />
          <h2 className="text-base font-bold" style={{ color: "var(--text-primary)" }}>Global FX Margin</h2>
          <Badge variant="outline" className="ml-auto text-xs"
            style={{ backgroundColor: "#E2FDED", borderColor: "#27AE60", color: "#27AE60" }}>
            Active
          </Badge>
        </div>
        <p className="text-xs mb-4" style={{ color: "var(--text-secondary)" }}>
          This margin (₦) is added on top of interbank base rates to calculate the final buy/sell prices for all currency pairs.
        </p>
        <div className="flex items-center gap-3 max-w-xs">
          <div className="relative flex-1">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm font-semibold" style={{ color: "var(--text-secondary)" }}>₦</span>
            <Input
              type="number"
              step="0.01"
              min="0"
              className="pl-8 h-11 text-lg font-bold"
              value={marginInput}
              onChange={(e) => setMarginInput(e.target.value)}
              style={{ color: "var(--text-primary)" }}
            />
          </div>
          <Button
            onClick={handleMarginSave}
            disabled={marginMutation.isPending || marginInput === fxMargin?.margin?.toString()}
            className="h-11 px-5"
            style={{ backgroundColor: "var(--brand-primary)", color: "#fff" }}
          >
            <Save className="w-4 h-4 mr-1.5" />
            {marginMutation.isPending ? "Saving…" : "Save"}
          </Button>
        </div>
        <div className="flex items-start gap-2 mt-4 p-3 rounded-lg text-xs"
          style={{ backgroundColor: "#FFF8E1", border: "1px solid #FDE68A", color: "#92400E" }}>
          <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
          <p>Changes immediately apply to all new trades. Existing locked-in quotes are not affected.</p>
        </div>
      </div>

      {/* ── Rates Table ── */}
      <div className="bg-white rounded-2xl border shadow-sm overflow-hidden" style={{ borderColor: "var(--border-custom)" }}>
        <div className="px-6 py-4 border-b flex items-center justify-between" style={{ borderColor: "var(--border-custom)" }}>
          <h2 className="font-bold" style={{ color: "var(--text-primary)" }}>
            Currency Pairs ({rates.length})
          </h2>
        </div>

        {isLoading ? (
          <div className="p-6 space-y-3">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="h-16 rounded-xl animate-pulse" style={{ backgroundColor: "#F3F4F6" }} />
            ))}
          </div>
        ) : rates.length === 0 ? (
          <div className="py-16 text-center">
            <TrendingUp className="w-12 h-12 mx-auto mb-3 opacity-20" style={{ color: "var(--text-tertiary)" }} />
            <p className="font-semibold" style={{ color: "var(--text-secondary)" }}>No rates configured yet</p>
            <p className="text-sm mt-1" style={{ color: "var(--text-tertiary)" }}>Click "Add Rate" to add your first currency pair.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="text-xs font-semibold uppercase tracking-wider" style={{ backgroundColor: "#F9FAFB", color: "var(--text-tertiary)" }}>
                  <th className="px-6 py-3">Pair</th>
                  <th className="px-6 py-3">Buy Rate (₦)</th>
                  <th className="px-6 py-3">Sell Rate (₦)</th>
                  <th className="px-6 py-3">Spread</th>
                  <th className="px-6 py-3">Last Updated</th>
                  <th className="px-6 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y" style={{ borderColor: "var(--border-light)" }}>
                {rates.map((rate) => {
                  const isEditing = editingPair === rate.pair;
                  const spread = rate.sell - rate.buy;
                  const [base] = rate.pair.split("/");
                  return (
                    <tr key={rate.pair} className="hover:bg-gray-50/50 transition-colors">
                      {/* Pair */}
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full flex items-center justify-center text-xs font-bold shrink-0"
                            style={{ backgroundColor: "#012333", color: "#C9A227" }}>
                            {base}
                          </div>
                          <div>
                            <p className="font-bold text-sm" style={{ color: "var(--text-primary)" }}>{rate.pair}</p>
                            <span className="text-[10px] px-1.5 py-0.5 rounded-full font-medium"
                              style={{ backgroundColor: "#E2FDED", color: "#27AE60" }}>
                              Live
                            </span>
                          </div>
                        </div>
                      </td>

                      {/* Buy Rate */}
                      <td className="px-6 py-4">
                        {isEditing ? (
                          <Input
                            type="number"
                            value={editValues.buy}
                            onChange={(e) => setEditValues((v) => ({ ...v, buy: e.target.value }))}
                            className="h-9 w-32 text-sm"
                            step="0.01"
                            min="0"
                            autoFocus
                          />
                        ) : (
                          <span className="text-sm font-bold" style={{ color: "var(--text-primary)" }}>
                            ₦{rate.buy.toLocaleString()}
                          </span>
                        )}
                      </td>

                      {/* Sell Rate */}
                      <td className="px-6 py-4">
                        {isEditing ? (
                          <Input
                            type="number"
                            value={editValues.sell}
                            onChange={(e) => setEditValues((v) => ({ ...v, sell: e.target.value }))}
                            className="h-9 w-32 text-sm"
                            step="0.01"
                            min="0"
                          />
                        ) : (
                          <span className="text-sm font-bold" style={{ color: "var(--text-primary)" }}>
                            ₦{rate.sell.toLocaleString()}
                          </span>
                        )}
                      </td>

                      {/* Spread */}
                      <td className="px-6 py-4">
                        <span className="text-sm" style={{ color: "var(--text-secondary)" }}>
                          ₦{spread.toLocaleString()}
                        </span>
                      </td>

                      {/* Last Updated */}
                      <td className="px-6 py-4">
                        <span className="text-xs" style={{ color: "var(--text-tertiary)" }}>
                          {formatTime(rate.lastUpdated)}
                        </span>
                      </td>

                      {/* Actions */}
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2 justify-end">
                          {isEditing ? (
                            <>
                              <Button
                                size="sm"
                                onClick={saveEdit}
                                disabled={upsertMutation.isPending}
                                className="h-8 px-3 text-xs"
                                style={{ backgroundColor: "#27AE60", color: "#fff" }}
                              >
                                <Save className="w-3.5 h-3.5 mr-1" />
                                {upsertMutation.isPending ? "Saving…" : "Save"}
                              </Button>
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => setEditingPair(null)}
                                className="h-8 px-3 text-xs"
                              >
                                Cancel
                              </Button>
                            </>
                          ) : (
                            <>
                              <button
                                onClick={() => startEdit(rate)}
                                className="w-8 h-8 rounded-lg flex items-center justify-center transition-colors hover:bg-amber-50"
                                title="Edit rate"
                              >
                                <Pencil className="w-4 h-4" style={{ color: "var(--brand-primary)" }} />
                              </button>
                              <button
                                onClick={() => deleteMutation.mutate(rate.pair)}
                                disabled={deleteMutation.isPending}
                                className="w-8 h-8 rounded-lg flex items-center justify-center transition-colors hover:bg-red-50"
                                title="Remove rate"
                              >
                                <Trash2 className="w-4 h-4" style={{ color: "#EB5757" }} />
                              </button>
                            </>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* ── Info Footer ── */}
      <div className="flex items-start gap-2 px-1">
        <Info className="w-4 h-4 shrink-0 mt-0.5" style={{ color: "var(--text-tertiary)" }} />
        <p className="text-xs" style={{ color: "var(--text-tertiary)" }}>
          All rate changes are logged in the Audit Log. Agents and customers see these rates in read-only mode.
          Contact your IT team to automate rate feeds via API.
        </p>
      </div>

      {/* ── Add Rate Dialog ── */}
      <Dialog open={addOpen} onOpenChange={setAddOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Add / Update Currency Pair</DialogTitle>
            <DialogDescription>
              Enter the currency pair and set the buy and sell rates. If the pair already exists, it will be updated.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-2">
            {/* Pair selection */}
            <div>
              <Label className="text-sm mb-2 block" style={{ color: "var(--text-primary)" }}>
                Currency Pair <span style={{ color: "#EB5757" }}>*</span>
              </Label>
              <div className="grid grid-cols-3 gap-2 mb-2">
                {CURRENCY_PAIRS.slice(0, 6).map((p) => (
                  <button
                    key={p}
                    onClick={() => { setNewPair(p); setCustomPair(false); }}
                    className="py-2 px-3 rounded-lg border text-xs font-semibold transition-all"
                    style={{
                      borderColor: newPair === p && !customPair ? "var(--brand-primary)" : "var(--border-custom)",
                      backgroundColor: newPair === p && !customPair ? "#FBF4DC" : "white",
                      color: newPair === p && !customPair ? "var(--brand-primary)" : "var(--text-secondary)",
                    }}
                  >
                    {p}
                  </button>
                ))}
              </div>
              <div className="flex items-center gap-2 mt-1">
                <input
                  type="checkbox"
                  id="custom-pair"
                  checked={customPair}
                  onChange={(e) => { setCustomPair(e.target.checked); if (e.target.checked) setNewPair(""); }}
                  className="w-4 h-4 rounded"
                />
                <label htmlFor="custom-pair" className="text-xs" style={{ color: "var(--text-secondary)" }}>
                  Enter custom pair
                </label>
              </div>
              {customPair && (
                <Input
                  placeholder="e.g. AUD/NGN"
                  value={newPair}
                  onChange={(e) => setNewPair(e.target.value.toUpperCase())}
                  className="h-10 mt-2 uppercase"
                />
              )}
            </div>

            {/* Buy Rate */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="new-buy" className="text-sm mb-2 block" style={{ color: "var(--text-primary)" }}>
                  Buy Rate (₦) <span style={{ color: "#EB5757" }}>*</span>
                </Label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm" style={{ color: "var(--text-secondary)" }}>₦</span>
                  <Input
                    id="new-buy"
                    type="number"
                    step="0.01"
                    min="0"
                    placeholder="1580.00"
                    value={newBuy}
                    onChange={(e) => setNewBuy(e.target.value)}
                    className="h-10 pl-7"
                  />
                </div>
              </div>
              <div>
                <Label htmlFor="new-sell" className="text-sm mb-2 block" style={{ color: "var(--text-primary)" }}>
                  Sell Rate (₦) <span style={{ color: "#EB5757" }}>*</span>
                </Label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm" style={{ color: "var(--text-secondary)" }}>₦</span>
                  <Input
                    id="new-sell"
                    type="number"
                    step="0.01"
                    min="0"
                    placeholder="1600.00"
                    value={newSell}
                    onChange={(e) => setNewSell(e.target.value)}
                    className="h-10 pl-7"
                  />
                </div>
              </div>
            </div>

            {/* Spread preview */}
            {newBuy && newSell && !isNaN(parseFloat(newBuy)) && !isNaN(parseFloat(newSell)) && (
              <div className="flex items-center gap-2 px-3 py-2 rounded-lg text-xs"
                style={{ backgroundColor: "#F9FAFB", border: "1px solid var(--border-custom)" }}>
                <Info className="w-3.5 h-3.5" style={{ color: "var(--text-tertiary)" }} />
                <span style={{ color: "var(--text-secondary)" }}>
                  Spread: <strong>₦{(parseFloat(newSell) - parseFloat(newBuy)).toFixed(2)}</strong>
                </span>
              </div>
            )}
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setAddOpen(false)}>Cancel</Button>
            <Button
              onClick={handleAdd}
              disabled={upsertMutation.isPending || !newPair || !newBuy || !newSell}
              style={{ backgroundColor: "var(--brand-primary)", color: "#fff" }}
            >
              {upsertMutation.isPending ? "Saving…" : "Save Rate"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

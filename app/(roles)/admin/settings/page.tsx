"use client";

import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { settingsApi } from "@/lib/api/settings";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Save, AlertCircle } from "lucide-react";

export default function AdminSettingsPage() {
    const queryClient = useQueryClient();
    const [marginInput, setMarginInput] = useState<string>("0.00");
    const [thresholdInput, setThresholdInput] = useState<string>("10000000");
    const [discountInput, setDiscountInput] = useState<string>("5.00");
    const [negEnabled, setNegEnabled] = useState<boolean>(true);

    const { data: fxMargin, isLoading } = useQuery({
        queryKey: ["fx-margin", "NGA"],
        queryFn: () => settingsApi.getFxMargin("NGA"),
    });

    const { data: negConfig, isLoading: isLoadingNeg } = useQuery({
        queryKey: ["negotiation-config"],
        queryFn: () => settingsApi.getNegotiationConfig(),
    });

    useEffect(() => {
        if (fxMargin?.margin !== undefined) {
            setMarginInput(fxMargin.margin.toString());
        }
    }, [fxMargin]);

    useEffect(() => {
        if (negConfig) {
            setThresholdInput(negConfig.turnoverThreshold.toString());
            setDiscountInput((negConfig.maxDiscountPct * 100).toString());
            setNegEnabled(negConfig.enabled);
        }
    }, [negConfig]);

    const updateMarginMutation = useMutation({
        mutationFn: (newMargin: number) => settingsApi.setFxMargin("NGA", newMargin),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["fx-margin", "NGA"] });
            alert("FX Margin updated successfully!");
        },
        onError: () => {
            alert("Failed to update FX Margin. Check your permissions.");
        }
    });

    const updateNegMutation = useMutation({
        mutationFn: (config: { turnoverThreshold: number; maxDiscountPct: number; enabled: boolean }) =>
            settingsApi.updateNegotiationConfig(config),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["negotiation-config"] });
            alert("Negotiation Config updated successfully!");
        },
        onError: () => {
            alert("Failed to update Negotiation Config. Check your permissions.");
        }
    });

    const handleSave = () => {
        const num = parseFloat(marginInput);
        if (isNaN(num)) {
            alert("Please enter a valid number");
            return;
        }
        updateMarginMutation.mutate(num);
    };

    const handleSaveNeg = () => {
        const threshold = parseFloat(thresholdInput);
        const discountPct = parseFloat(discountInput);
        if (isNaN(threshold) || isNaN(discountPct)) {
            alert("Please enter valid numbers");
            return;
        }
        updateNegMutation.mutate({
            turnoverThreshold: threshold,
            maxDiscountPct: discountPct / 100,
            enabled: negEnabled,
        });
    };

    const isNegConfigChanged = negConfig && (
        thresholdInput !== negConfig.turnoverThreshold.toString() ||
        discountInput !== (negConfig.maxDiscountPct * 100).toString() ||
        negEnabled !== negConfig.enabled
    );

    return (
        <div className="space-y-6 p-4 md:p-6 lg:pl-7 lg:pr-6" style={{ backgroundColor: "#f7f8f9", minHeight: "100vh" }}>
            {/* Header */}
            <div className="space-y-2">
                <h1 className="text-3xl font-bold" style={{ color: "#2b2f33" }}>
                    System Settings
                </h1>
                <p className="text-base" style={{ color: "#6b7078" }}>
                    Manage global platform configurations and exchange parameters.
                </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 pt-4">

                {/* FX Margin Card */}
                <Card className="shadow-sm border-gray-200">
                    <CardHeader>
                        <div className="flex justify-between items-start">
                            <div>
                                <CardTitle className="text-lg font-bold" style={{ color: "#2b2f33" }}>Exchange Rate Margin</CardTitle>
                                <CardDescription>Configure the profit margin applied to interbank base rates.</CardDescription>
                            </div>
                            <Badge variant="outline" style={{ backgroundColor: "#d4f4dd", borderColor: "#27ae60", color: "#27ae60" }}>
                                Active
                            </Badge>
                        </div>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        {isLoading ? (
                            <div className="animate-pulse flex space-x-4">
                                <div className="h-10 bg-gray-200 rounded w-full"></div>
                                <div className="h-10 bg-gray-200 rounded w-24"></div>
                            </div>
                        ) : (
                            <div className="space-y-4">
                                <div className="flex items-center gap-3">
                                    <div className="relative flex-1">
                                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 font-medium">₦</span>
                                        <Input
                                            type="number"
                                            step="0.01"
                                            className="pl-8 text-lg font-semibold"
                                            value={marginInput}
                                            onChange={(e) => setMarginInput(e.target.value)}
                                            style={{ color: "#2b2f33" }}
                                        />
                                    </div>
                                    <Button
                                        onClick={handleSave}
                                        disabled={updateMarginMutation.isPending || marginInput === fxMargin?.margin?.toString()}
                                        style={{ backgroundColor: "#c9a227", color: "white" }}
                                    >
                                        <Save className="w-4 h-4 mr-2" />
                                        Save
                                    </Button>
                                </div>
                                <div className="p-3 rounded-lg flex items-start gap-2 text-sm" style={{ backgroundColor: "#fff8e1", border: "1px solid #ffd54f", color: "#f57f17" }}>
                                    <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" />
                                    <p>Changes will immediately affect all new agent trades. Existing locked-in quotes will remain unmodified until they expire.</p>
                                </div>
                            </div>
                        )}
                    </CardContent>
                </Card>

                {/* Rate Negotiation Config Card */}
                <Card className="shadow-sm border-gray-200">
                    <CardHeader>
                        <div className="flex justify-between items-start">
                            <div>
                                <CardTitle className="text-lg font-bold" style={{ color: "#2b2f33" }}>Rate Negotiation System</CardTitle>
                                <CardDescription>Configure turnover thresholds and maximum allowable rate discount.</CardDescription>
                            </div>
                            <Badge variant="outline" style={{
                                backgroundColor: negEnabled ? "#d4f4dd" : "#ffe5e5",
                                borderColor: negEnabled ? "#27ae60" : "#e05555",
                                color: negEnabled ? "#27ae60" : "#e05555"
                            }}>
                                {negEnabled ? "Enabled" : "Disabled"}
                            </Badge>
                        </div>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        {isLoadingNeg ? (
                            <div className="animate-pulse space-y-3">
                                <div className="h-10 bg-gray-200 rounded w-full"></div>
                                <div className="h-10 bg-gray-200 rounded w-full"></div>
                                <div className="h-10 bg-gray-200 rounded w-full"></div>
                            </div>
                        ) : (
                            <div className="space-y-4">
                                <div className="space-y-2">
                                    <label className="text-xs font-bold uppercase tracking-wider text-gray-500">System Enable</label>
                                    <select
                                        className="w-full h-10 px-3 rounded-md border border-gray-300 bg-white font-medium text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-yellow-500"
                                        value={negEnabled ? "true" : "false"}
                                        onChange={(e) => setNegEnabled(e.target.value === "true")}
                                    >
                                        <option value="true">Active / Enabled</option>
                                        <option value="false">Inactive / Disabled</option>
                                    </select>
                                </div>

                                <div className="space-y-2">
                                    <label className="text-xs font-bold uppercase tracking-wider text-gray-500">30-Day Turnover Threshold (₦)</label>
                                    <div className="relative">
                                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 font-medium">₦</span>
                                        <Input
                                            type="number"
                                            className="pl-8 font-semibold"
                                            value={thresholdInput}
                                            onChange={(e) => setThresholdInput(e.target.value)}
                                            style={{ color: "#2b2f33" }}
                                        />
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <label className="text-xs font-bold uppercase tracking-wider text-gray-500">Max Discount Limit (%)</label>
                                    <div className="relative">
                                        <Input
                                            type="number"
                                            step="0.01"
                                            className="pr-8 font-semibold"
                                            value={discountInput}
                                            onChange={(e) => setDiscountInput(e.target.value)}
                                            style={{ color: "#2b2f33" }}
                                        />
                                        <span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 font-medium">%</span>
                                    </div>
                                </div>

                                <Button
                                    onClick={handleSaveNeg}
                                    disabled={updateNegMutation.isPending || !isNegConfigChanged}
                                    className="w-full h-11 text-base font-semibold"
                                    style={{ backgroundColor: "#c9a227", color: "white" }}
                                >
                                    <Save className="w-4 h-4 mr-2" />
                                    Save Settings
                                </Button>
                            </div>
                        )}
                    </CardContent>
                </Card>

            </div>
        </div>
    );
}

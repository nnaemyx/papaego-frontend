"use client";

import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { settingsApi } from "@/lib/api/settings";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Save, AlertCircle, Sparkles, Activity, ShieldAlert } from "lucide-react";
import { toast } from "sonner";

export default function AdminSettingsPage() {
    const queryClient = useQueryClient();
    
    // FX Margin state
    const [marginInput, setMarginInput] = useState<string>("0.00");
    const { data: fxMargin, isLoading: isLoadingMargin } = useQuery({
        queryKey: ["fx-margin", "NGA"],
        queryFn: () => settingsApi.getFxMargin("NGA"),
    });

    useEffect(() => {
        if (fxMargin?.margin !== undefined) {
            setMarginInput(fxMargin.margin.toString());
        }
    }, [fxMargin]);

    const updateMarginMutation = useMutation({
        mutationFn: (newMargin: number) => settingsApi.setFxMargin("NGA", newMargin),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["fx-margin", "NGA"] });
            toast.success("FX Margin updated successfully!");
        },
        onError: () => {
            toast.error("Failed to update FX Margin. Check your permissions.");
        }
    });

    const handleSaveMargin = () => {
        const num = parseFloat(marginInput);
        if (isNaN(num)) {
            toast.error("Please enter a valid number");
            return;
        }
        updateMarginMutation.mutate(num);
    };

    // Turnover Negotiation state
    const [targetInput, setTargetInput] = useState<string>("0.00");
    const { data: turnoverStats, isLoading: isLoadingTurnover } = useQuery({
        queryKey: ["admin-turnover-stats"],
        queryFn: () => settingsApi.getTurnoverStats(),
    });

    useEffect(() => {
        if (turnoverStats?.targetTurnover !== undefined) {
            setTargetInput(turnoverStats.targetTurnover.toString());
        }
    }, [turnoverStats]);

    const updateTurnoverConfigMutation = useMutation({
        mutationFn: (payload: { target?: number; enabled?: boolean }) => settingsApi.updateTurnoverConfig(payload),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["admin-turnover-stats"] });
            toast.success("Turnover configuration updated successfully!");
        },
        onError: () => {
            toast.error("Failed to update turnover configuration.");
        }
    });

    const handleSaveTurnoverTarget = () => {
        const num = parseFloat(targetInput);
        if (isNaN(num) || num <= 0) {
            toast.error("Please enter a valid positive threshold amount");
            return;
        }
        updateTurnoverConfigMutation.mutate({ target: num });
    };

    const handleToggleNegotiation = () => {
        if (!turnoverStats) return;
        updateTurnoverConfigMutation.mutate({ enabled: !turnoverStats.featureEnabled });
    };

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

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 pt-4">

                {/* FX Margin Card */}
                <Card className="shadow-sm border-gray-200 bg-white">
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
                        {isLoadingMargin ? (
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
                                        onClick={handleSaveMargin}
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

                {/* Turnover Negotiation Config Card */}
                <Card className="shadow-sm border-gray-200 bg-white">
                    <CardHeader>
                        <div className="flex justify-between items-start">
                            <div>
                                <CardTitle className="text-lg font-bold" style={{ color: "#2b2f33" }}>Turnover Negotiation Engine</CardTitle>
                                <CardDescription>Reward high-activity clients with dynamic discounts based on total daily volume.</CardDescription>
                            </div>
                            {isLoadingTurnover ? (
                                <span className="h-5 w-12 bg-gray-100 rounded animate-pulse" />
                            ) : (
                                <Badge 
                                    variant="outline" 
                                    style={{ 
                                        backgroundColor: turnoverStats?.featureEnabled ? "#EDE9FE" : "#F3F4F6", 
                                        borderColor: turnoverStats?.featureEnabled ? "#8B5CF6" : "#D1D5DB", 
                                        color: turnoverStats?.featureEnabled ? "#7C3AED" : "#4B5563" 
                                    }}
                                >
                                    {turnoverStats?.featureEnabled ? "Feature Enabled" : "Disabled"}
                                </Badge>
                            )}
                        </div>
                    </CardHeader>
                    <CardContent className="space-y-6">
                        {isLoadingTurnover ? (
                            <div className="space-y-4 animate-pulse">
                                <div className="h-10 bg-gray-200 rounded w-full"></div>
                                <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                                <div className="h-8 bg-gray-200 rounded w-full"></div>
                            </div>
                        ) : (
                            <div className="space-y-6">
                                {/* Toggle and thresholds */}
                                <div className="flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center pb-4 border-b border-gray-100">
                                    <div>
                                        <p className="text-sm font-semibold text-gray-800">Negotiation Status</p>
                                        <p className="text-xs text-gray-500">Allow customers to trigger preferred rates once threshold is met.</p>
                                    </div>
                                    <Button
                                        onClick={handleToggleNegotiation}
                                        disabled={updateTurnoverConfigMutation.isPending}
                                        variant={turnoverStats?.featureEnabled ? "default" : "outline"}
                                        style={
                                            turnoverStats?.featureEnabled 
                                                ? { backgroundColor: "#7C3AED", color: "white" }
                                                : {}
                                        }
                                        className="font-semibold"
                                    >
                                        {turnoverStats?.featureEnabled ? "Disable Feature" : "Enable Feature"}
                                    </Button>
                                </div>

                                <div className="space-y-2">
                                    <label className="text-sm font-semibold text-gray-850">Daily Turnover Threshold (USD)</label>
                                    <div className="flex items-center gap-3">
                                        <div className="relative flex-1">
                                            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 font-medium">$</span>
                                            <Input
                                                type="number"
                                                step="100"
                                                className="pl-8 text-lg font-semibold"
                                                value={targetInput}
                                                onChange={(e) => setTargetInput(e.target.value)}
                                                style={{ color: "#2b2f33" }}
                                            />
                                        </div>
                                        <Button
                                            onClick={handleSaveTurnoverTarget}
                                            disabled={updateTurnoverConfigMutation.isPending || targetInput === turnoverStats?.targetTurnover?.toString()}
                                            style={{ backgroundColor: "#7C3AED", color: "white" }}
                                        >
                                            <Save className="w-4 h-4 mr-2" />
                                            Update Threshold
                                        </Button>
                                    </div>
                                </div>

                                {/* Progress Bar */}
                                <div className="space-y-2 bg-purple-50/40 p-4 rounded-xl border border-purple-100/50">
                                    <div className="flex justify-between items-center text-sm">
                                        <span className="font-semibold text-purple-950 flex items-center gap-1.5">
                                            <Activity className="w-4 h-4 text-purple-600" />
                                            Today's Accumulation
                                        </span>
                                        <span className="font-bold text-purple-700">
                                            ${turnoverStats?.currentTurnover?.toLocaleString()} / ${turnoverStats?.targetTurnover?.toLocaleString()}
                                        </span>
                                    </div>
                                    
                                    {/* Progress Bar Container */}
                                    <div className="w-full h-3 bg-gray-100 rounded-full overflow-hidden">
                                        <div 
                                            className="h-full rounded-full transition-all duration-500 bg-gradient-to-r from-purple-500 to-indigo-600"
                                            style={{ width: `${turnoverStats?.turnoverProgress || 0}%` }}
                                        />
                                    </div>

                                    <div className="flex justify-between items-center pt-1">
                                        <span className="text-xs text-purple-800">
                                            Progress: <span className="font-bold">{turnoverStats?.turnoverProgress}%</span>
                                        </span>
                                        <span 
                                            className="text-xs font-bold px-2 py-0.5 rounded-full"
                                            style={{ 
                                                backgroundColor: turnoverStats?.turnoverMet ? "#D1FAE5" : "#F3F4F6", 
                                                color: turnoverStats?.turnoverMet ? "#065F46" : "#374151" 
                                            }}
                                        >
                                            {turnoverStats?.turnoverMet ? "✨ Target Met (Active)" : "Pending Target"}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        )}
                    </CardContent>
                </Card>

            </div>
        </div>
    );
}

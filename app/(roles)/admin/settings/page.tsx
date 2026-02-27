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

    const { data: fxMargin, isLoading } = useQuery({
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
            alert("FX Margin updated successfully!");
        },
        onError: () => {
            alert("Failed to update FX Margin. Check your permissions.");
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

            </div>
        </div>
    );
}

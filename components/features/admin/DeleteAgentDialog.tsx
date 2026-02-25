"use client";

import { useState } from "react";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { AlertTriangle } from "lucide-react";

interface DeleteAgentDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    agentName: string;
    agentId: string;
    onConfirm: () => void;
    isDeleting?: boolean;
}

export function DeleteAgentDialog({
    open,
    onOpenChange,
    agentName,
    agentId,
    onConfirm,
    isDeleting,
}: DeleteAgentDialogProps) {
    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-md">
                <DialogHeader>
                    <div className="flex items-center gap-3 mb-2">
                        <div
                            className="w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0"
                            style={{ backgroundColor: "#ffe5e5" }}
                        >
                            <AlertTriangle
                                className="h-5 w-5"
                                style={{ color: "#e05555" }}
                            />
                        </div>
                        <DialogTitle className="text-xl font-bold" style={{ color: "#2b2f33" }}>
                            Delete Agent
                        </DialogTitle>
                    </div>
                </DialogHeader>

                <div className="space-y-4 py-2">
                    <p className="text-sm" style={{ color: "#6b7078" }}>
                        Are you sure you want to permanently delete{" "}
                        <span className="font-semibold" style={{ color: "#2b2f33" }}>
                            {agentName}
                        </span>{" "}
                        ({agentId})? This action cannot be undone and will remove all
                        associated data.
                    </p>

                    <div
                        className="p-3 rounded-lg border-l-4 text-sm"
                        style={{
                            backgroundColor: "#fff8ce",
                            borderLeftColor: "#f0cd00",
                            color: "#4a4f55",
                        }}
                    >
                        <strong>Warning:</strong> Deleting this agent will also remove
                        their transaction history, commission records, and audit trail
                        references.
                    </div>
                </div>

                <DialogFooter className="gap-3">
                    <Button
                        variant="outline"
                        onClick={() => onOpenChange(false)}
                        disabled={isDeleting}
                        className="flex-1"
                    >
                        Cancel
                    </Button>
                    <Button
                        onClick={onConfirm}
                        disabled={isDeleting}
                        className="flex-1"
                        style={{ backgroundColor: "#e05555", color: "white" }}
                    >
                        {isDeleting ? "Deleting..." : "Delete Agent"}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}

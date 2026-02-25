"use client";

import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { CheckCircle } from "lucide-react";

interface InviteSuccessSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  agentEmail: string;
  onInviteAnother: () => void;
  onViewAgents: () => void;
}

export function InviteSuccessSheet({
  open,
  onOpenChange,
  agentEmail,
  onInviteAnother,
  onViewAgents,
}: InviteSuccessSheetProps) {
  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        side="right"
        className="w-full sm:max-w-[500px]"
        style={{ borderTopLeftRadius: "40px", borderBottomLeftRadius: "40px" }}
      >
        <SheetHeader className="mb-6">
          <SheetTitle className="text-3xl font-bold">
            Invitation Sent Successfully!
          </SheetTitle>
        </SheetHeader>

        <div className="flex flex-col items-center py-8">
          <div className="mb-6">
            <CheckCircle className="w-24 h-24" style={{ color: "#27ae60" }} />
          </div>

          <div className="text-center mb-8">
            <p className="text-lg font-semibold mb-2" style={{ color: "#2b2f33" }}>
              Agent Invitation Email Sent
            </p>
            <p className="text-base" style={{ color: "#6b7078" }}>
              An onboarding invitation has been sent to:
            </p>
            <p className="text-base font-semibold mt-2" style={{ color: "#c9a227" }}>
              {agentEmail}
            </p>
          </div>

          <div className="w-full space-y-4 p-4 bg-blue-50 border border-blue-200 rounded-lg mb-8">
            <p className="text-sm" style={{ color: "#1565c0" }}>
              <strong>Next Steps:</strong>
            </p>
            <ul className="text-sm space-y-2 ml-4 list-disc" style={{ color: "#1565c0" }}>
              <li>The agent will receive an email with an onboarding link</li>
              <li>They'll complete a 4-step verification process</li>
              <li>You'll be notified once they submit for review</li>
            </ul>
          </div>

          <div className="w-full space-y-3">
            <Button
              onClick={onInviteAnother}
              className="w-full h-12"
              style={{
                backgroundColor: "#c9a227",
                color: "white",
              }}
            >
              Invite Another Agent
            </Button>
            <Button
              onClick={onViewAgents}
              variant="outline"
              className="w-full h-12"
              style={{
                borderColor: "#c9a227",
                color: "#c9a227",
              }}
            >
              View All Agents
            </Button>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}

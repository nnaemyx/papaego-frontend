"use client";

import { useState } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { MoreHorizontal } from "lucide-react";
import type { Agent } from "@/lib/types/agent";
import { formatAgentId, getStatusColor } from "@/lib/formatters";
import { DeleteAgentDialog } from "./DeleteAgentDialog";

interface AgentsTableProps {
  agents: Agent[];
  isLoading?: boolean;
  onSuspend: (id: string) => void;
  onActivate: (id: string) => void;
  onDelete?: (id: string) => void;
  onViewDetails?: (id: string) => void;
}

export function AgentsTable({
  agents,
  isLoading,
  onSuspend,
  onActivate,
  onDelete,
  onViewDetails,
}: AgentsTableProps) {
  const [selectedAgents, setSelectedAgents] = useState<string[]>([]);
  const [deleteTarget, setDeleteTarget] = useState<Agent | null>(null);

  const toggleAgent = (id: string) => {
    setSelectedAgents((prev) =>
      prev.includes(id) ? prev.filter((a) => a !== id) : [...prev, id]
    );
  };

  const toggleAll = () => {
    setSelectedAgents(
      selectedAgents.length === agents.length
        ? []
        : agents.map((a) => a.id)
    );
  };

  if (isLoading) {
    return (
      <div className="border rounded-lg">
        <div className="p-8 text-center text-gray-500">Loading agents...</div>
      </div>
    );
  }

  return (
    <>
      <div className="border rounded-lg" style={{ backgroundColor: "#f6f6f6" }}>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-12">
                <Checkbox
                  checked={agents.length > 0 && selectedAgents.length === agents.length}
                  onCheckedChange={toggleAll}
                />
              </TableHead>
              <TableHead className="font-medium text-xs">Agent ID</TableHead>
              <TableHead className="font-medium text-xs">Agent Name</TableHead>
              <TableHead className="font-medium text-xs">Role</TableHead>
              <TableHead className="font-medium text-xs">Region</TableHead>
              <TableHead className="font-medium text-xs">
                Active Trades
              </TableHead>
              <TableHead className="font-medium text-xs">Status</TableHead>
              <TableHead className="font-medium text-xs">Action</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {agents.map((agent) => (
              <TableRow key={agent.id}>
                <TableCell>
                  <Checkbox
                    checked={selectedAgents.includes(agent.id)}
                    onCheckedChange={() => toggleAgent(agent.id)}
                  />
                </TableCell>
                <TableCell className="text-xs font-normal">
                  {formatAgentId(agent.id)}
                </TableCell>
                <TableCell className="text-xs font-normal text-green-600">
                  {agent.name}
                </TableCell>
                <TableCell className="text-xs font-normal">
                  {agent.role}
                </TableCell>
                <TableCell className="text-xs font-normal">
                  {agent.region}
                </TableCell>
                <TableCell className="text-xs font-normal">
                  {agent.activeTrades}
                </TableCell>
                <TableCell>
                  <Badge
                    variant="outline"
                    className={`text-xs ${getStatusColor(agent.status)}`}
                  >
                    {agent.status}
                  </Badge>
                </TableCell>
                <TableCell>
                  <DropdownMenu>
                    <DropdownMenuTrigger className="focus:outline-none">
                      <MoreHorizontal className="h-4 w-4" />
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem
                        onClick={() => onViewDetails?.(agent.id)}
                      >
                        View Details
                      </DropdownMenuItem>
                      {agent.status === "Active" ? (
                        <DropdownMenuItem onClick={() => onSuspend(agent.id)}>
                          Suspend
                        </DropdownMenuItem>
                      ) : (
                        <DropdownMenuItem onClick={() => onActivate(agent.id)}>
                          Activate
                        </DropdownMenuItem>
                      )}
                      <DropdownMenuItem className="text-red-600" onClick={() => setDeleteTarget(agent)}>
                        Delete
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {/* Delete Confirmation Dialog */}
      {deleteTarget && (
        <DeleteAgentDialog
          open={!!deleteTarget}
          onOpenChange={(open) => !open && setDeleteTarget(null)}
          agentName={deleteTarget.name}
          agentId={formatAgentId(deleteTarget.id)}
          onConfirm={() => {
            onDelete?.(deleteTarget.id);
            setDeleteTarget(null);
          }}
        />
      )}
    </>
  );
}

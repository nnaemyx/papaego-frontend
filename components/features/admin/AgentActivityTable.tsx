"use client";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";

export interface AgentActivity {
  agent: string;
  trades: number;
  volume: string;
  status: "Active" | "Inactive";
}

interface AgentActivityTableProps {
  agents: AgentActivity[];
}

export function AgentActivityTable({ agents }: AgentActivityTableProps) {
  return (
    <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
      <div className="p-4 border-b border-gray-200">
        <h3 className="text-lg font-bold text-gray-900">
          Top Agents (This Month)
        </h3>
      </div>
      
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="font-medium text-xs">Agent</TableHead>
            <TableHead className="font-medium text-xs">Trades</TableHead>
            <TableHead className="font-medium text-xs">Volume</TableHead>
            <TableHead className="font-medium text-xs">Status</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {agents.map((agent, index) => (
            <TableRow key={index}>
              <TableCell className="text-xs">{agent.agent}</TableCell>
              <TableCell className="text-xs">{agent.trades}</TableCell>
              <TableCell className="text-xs">{agent.volume}</TableCell>
              <TableCell>
                <Badge
                  variant="outline"
                  className={`text-xs ${
                    agent.status === "Active"
                      ? "bg-green-100 text-green-700 border-green-300"
                      : "bg-gray-100 text-gray-700 border-gray-300"
                  }`}
                >
                  {agent.status}
                </Badge>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}

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
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
    DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { MoreHorizontal } from "lucide-react";
import type { Customer } from "@/lib/types/customer";
import { formatDate } from "@/lib/formatters";

interface CustomersTableProps {
    customers: Customer[];
    isLoading?: boolean;
    onViewDetails?: (id: string) => void;
    onApprove?: (id: string) => void;
    onDelete?: (id: string) => void;
    onRestrict?: (id: string) => void;
    onSendMessage?: (id: string, payload: { subject: string; message: string }) => void;
}

function getVerificationColor(status: string) {
    switch (status) {
        case "Verified":
            return "bg-green-100 text-green-700 border-green-300";
        case "Pending":
            return "bg-yellow-100 text-yellow-700 border-yellow-300";
        case "Failed":
            return "bg-red-100 text-red-700 border-red-300";
        default:
            return "bg-gray-100 text-gray-700 border-gray-300";
    }
}

export function CustomersTable({
    customers,
    isLoading,
    onViewDetails,
    onApprove,
    onDelete,
    onRestrict,
    onSendMessage
}: CustomersTableProps) {
    const [selected, setSelected] = useState<string[]>([]);
    
    // Modal states
    const [activeCustomer, setActiveCustomer] = useState<Customer | null>(null);
    const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
    const [isRestrictDialogOpen, setIsRestrictDialogOpen] = useState(false);
    const [isMessageDialogOpen, setIsMessageDialogOpen] = useState(false);
    
    // Message state
    const [messageSubject, setMessageSubject] = useState("");
    const [messageBody, setMessageBody] = useState("");

    const toggle = (id: string) => {
        setSelected((prev) =>
            prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
        );
    };

    const toggleAll = () => {
        setSelected(selected.length === customers.length ? [] : customers.map((c) => c.id));
    };

    // Action Handlers
    const handleActionClick = (customer: Customer, action: 'delete' | 'restrict' | 'message') => {
        setActiveCustomer(customer);
        if (action === 'delete') setIsDeleteDialogOpen(true);
        if (action === 'restrict') setIsRestrictDialogOpen(true);
        if (action === 'message') {
            setMessageSubject("");
            setMessageBody("");
            setIsMessageDialogOpen(true);
        }
    };

    const confirmDelete = () => {
        if (activeCustomer && onDelete) onDelete(activeCustomer.id);
        setIsDeleteDialogOpen(false);
    };

    const confirmRestrict = () => {
        if (activeCustomer && onRestrict) onRestrict(activeCustomer.id);
        setIsRestrictDialogOpen(false);
    };

    const confirmMessage = () => {
        if (activeCustomer && onSendMessage) {
            onSendMessage(activeCustomer.id, { subject: messageSubject, message: messageBody });
        }
        setIsMessageDialogOpen(false);
    };

    if (isLoading) {
        return (
            <div className="border rounded-lg p-8 text-center text-gray-500">
                Loading customers...
            </div>
        );
    }

    if (customers.length === 0) {
        return (
            <div className="border rounded-lg p-8 text-center" style={{ color: "#9aa0a6" }}>
                No customers found.
            </div>
        );
    }

    return (
        <div className="border rounded-lg overflow-hidden" style={{ backgroundColor: "#f6f6f6" }}>
            <Table>
                <TableHeader>
                    <TableRow>
                        <TableHead className="w-12">
                            <Checkbox
                                checked={customers.length > 0 && selected.length === customers.length}
                                onCheckedChange={toggleAll}
                            />
                        </TableHead>
                        <TableHead className="text-xs font-medium">Customer ID</TableHead>
                        <TableHead className="text-xs font-medium">Name</TableHead>
                        <TableHead className="text-xs font-medium">Email</TableHead>
                        <TableHead className="text-xs font-medium">Phone</TableHead>
                        <TableHead className="text-xs font-medium">Total Trades</TableHead>
                        <TableHead className="text-xs font-medium">Last Trade</TableHead>
                        <TableHead className="text-xs font-medium">Verification</TableHead>
                        <TableHead className="text-xs font-medium">Action</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {customers.map((customer) => (
                        <TableRow key={customer.id}>
                            <TableCell>
                                <Checkbox
                                    checked={selected.includes(customer.id)}
                                    onCheckedChange={() => toggle(customer.id)}
                                />
                            </TableCell>
                            <TableCell className="text-xs font-medium" style={{ color: "#c9a227" }}>
                                {customer.customerId}
                            </TableCell>
                            <TableCell className="text-xs font-medium" style={{ color: "#2b2f33" }}>
                                {customer.name}
                            </TableCell>
                            <TableCell className="text-xs" style={{ color: "#6b7078" }}>
                                {customer.email}
                            </TableCell>
                            <TableCell className="text-xs" style={{ color: "#6b7078" }}>
                                {customer.phone}
                            </TableCell>
                            <TableCell className="text-xs font-medium" style={{ color: "#2b2f33" }}>
                                {customer.totalTransactions}
                            </TableCell>
                            <TableCell className="text-xs" style={{ color: "#6b7078" }}>
                                {formatDate(customer.lastTrade)}
                            </TableCell>
                            <TableCell>
                                <Badge
                                    variant="outline"
                                    className={`text-xs ${getVerificationColor(customer.verificationStatus)}`}
                                >
                                    {customer.verificationStatus}
                                </Badge>
                            </TableCell>
                            <TableCell>
                                <DropdownMenu>
                                    <DropdownMenuTrigger className="focus:outline-none">
                                        <MoreHorizontal className="h-4 w-4" />
                                    </DropdownMenuTrigger>
                                    <DropdownMenuContent align="end">
                                        <DropdownMenuItem onClick={() => onViewDetails?.(customer.id)}>
                                            View Details
                                        </DropdownMenuItem>
                                        <DropdownMenuItem className="text-red-600 focus:text-red-600" onClick={() => handleActionClick(customer, 'delete')}>
                                            Delete Customer
                                        </DropdownMenuItem>
                                        {customer.verificationStatus === "Pending" && (
                                            <DropdownMenuItem
                                                onClick={() => onApprove?.(customer.id)}
                                                className="text-green-600 focus:text-green-600"
                                            >
                                                Approve Account
                                            </DropdownMenuItem>
                                        )}
                                        <DropdownMenuItem onClick={() => handleActionClick(customer, 'message')}>
                                            Send Message
                                        </DropdownMenuItem>
                                        <DropdownMenuItem className="text-orange-600 focus:text-orange-600" onClick={() => handleActionClick(customer, 'restrict')}>
                                            Restrict Account
                                        </DropdownMenuItem>
                                    </DropdownMenuContent>
                                </DropdownMenu>
                            </TableCell>
                        </TableRow>
                    ))}
                </TableBody>
            </Table>

            {/* Modals */}
            <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Delete Customer</DialogTitle>
                        <DialogDescription>
                            Are you sure you want to delete {activeCustomer?.name}? This action will permanently remove their records if they have no trades.
                        </DialogDescription>
                    </DialogHeader>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setIsDeleteDialogOpen(false)}>Cancel</Button>
                        <Button variant="destructive" onClick={confirmDelete}>Delete</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            <Dialog open={isRestrictDialogOpen} onOpenChange={setIsRestrictDialogOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Toggle Account Restriction</DialogTitle>
                        <DialogDescription>
                            Are you sure you want to change the restriction status for {activeCustomer?.name}?
                        </DialogDescription>
                    </DialogHeader>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setIsRestrictDialogOpen(false)}>Cancel</Button>
                        <Button style={{ backgroundColor: '#e67e22', color: 'white' }} onClick={confirmRestrict}>Confirm</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            <Dialog open={isMessageDialogOpen} onOpenChange={setIsMessageDialogOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Send Message to {activeCustomer?.name}</DialogTitle>
                        <DialogDescription>
                            This will send an email directly to the customer.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4 py-4">
                        <div className="space-y-2">
                            <label className="text-sm font-medium">Subject</label>
                            <Input 
                                placeholder="Message Subject" 
                                value={messageSubject}
                                onChange={(e) => setMessageSubject(e.target.value)}
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-medium">Message</label>
                            <Textarea 
                                placeholder="Type your message here..." 
                                className="min-h-[120px]"
                                value={messageBody}
                                onChange={(e) => setMessageBody(e.target.value)}
                            />
                        </div>
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setIsMessageDialogOpen(false)}>Cancel</Button>
                        <Button 
                            style={{ backgroundColor: '#012333', color: 'white' }} 
                            onClick={confirmMessage}
                            disabled={!messageSubject.trim() || !messageBody.trim()}
                        >
                            Send Message
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}

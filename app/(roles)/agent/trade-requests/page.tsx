'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { agentApi } from '@/lib/api/agent';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  FileText, 
  ArrowRight, 
  XCircle, 
  Clock, 
  User, 
  DollarSign, 
  Calendar,
  AlertCircle
} from 'lucide-react';
import Link from 'next/link';
import { toast } from 'sonner';

export default function TradeRequestsPage() {
  const queryClient = useQueryClient();
  const [statusFilter, setStatusFilter] = useState('PENDING');

  const { data: requests, isLoading, error } = useQuery({
    queryKey: ['agent-trade-requests', statusFilter],
    queryFn: () => agentApi.getTradeRequests(statusFilter),
    refetchInterval: 30_000, // Auto-refresh every 30s to show newly assigned requests
  });

  const rejectMutation = useMutation({
    mutationFn: (id: string) => agentApi.rejectTradeRequest(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['agent-trade-requests'] });
      toast.success('Trade request rejected');
    },
    onError: () => {
      toast.error('Failed to reject request');
    }
  });

  const handleReject = (id: string) => {
    if (confirm('Are you sure you want to reject this request?')) {
      rejectMutation.mutate(id);
    }
  };

  return (
    <div className="p-4 md:p-6 lg:p-8 max-w-7xl mx-auto">
      {/* Page Header */}
      <div className="mb-8">
        <h1 className="text-2xl md:text-3xl font-bold mb-2 flex items-center gap-3">
          <FileText className="w-8 h-8 text-[#C9A227]" />
          Trade Requests
        </h1>
        <p className="text-gray-500">
          Manage incoming trade initiations from customers. Process them to create actual trades.
        </p>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 mb-6 border-b pb-px">
        {['PENDING', 'ASSIGNED', 'PROCESSED', 'REJECTED'].map((status) => (
          <button
            key={status}
            onClick={() => setStatusFilter(status)}
            className={`px-4 py-2 text-sm font-bold transition-all border-b-2 ${
              statusFilter === status 
              ? 'border-[#C9A227] text-[#012333]' 
              : 'border-transparent text-gray-400 hover:text-gray-600'
            }`}
          >
            {status}
          </button>
        ))}
      </div>

      {/* Content */}
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-64 bg-gray-100 rounded-2xl animate-pulse" />
          ))}
        </div>
      ) : error ? (
        <div className="p-12 text-center bg-red-50 rounded-2xl border border-red-100">
          <AlertCircle className="w-12 h-12 text-red-400 mx-auto mb-4" />
          <h3 className="text-lg font-bold text-red-800">Failed to load requests</h3>
          <p className="text-red-600">Please check your connection and try again.</p>
        </div>
      ) : requests?.length === 0 ? (
        <div className="p-20 text-center bg-gray-50 rounded-3xl border border-dashed border-gray-200">
          <FileText className="w-16 h-16 text-gray-200 mx-auto mb-4" />
          <h3 className="text-xl font-bold text-gray-400">No {statusFilter.toLowerCase()} requests</h3>
          <p className="text-gray-400">Everything is up to date!</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {requests?.map((req: any) => (
            <Card key={req.id} className="overflow-hidden border-none shadow-sm hover:shadow-md transition-shadow rounded-2xl bg-white group">
              <div className="p-6">
                <div className="flex justify-between items-start mb-4">
                  <Badge variant="outline" className={`
                    ${req.status === 'PENDING' ? 'bg-amber-50 text-amber-600 border-amber-200' : ''}
                    ${req.status === 'PROCESSED' ? 'bg-green-50 text-green-600 border-green-200' : ''}
                    ${req.status === 'REJECTED' ? 'bg-red-50 text-red-600 border-red-200' : ''}
                  `}>
                    {req.status}
                  </Badge>
                  <span className="text-[10px] text-gray-400 flex items-center gap-1">
                    <Calendar className="w-3 h-3" />
                    {new Date(req.createdAt).toLocaleDateString()}
                  </span>
                </div>

                <div className="space-y-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-gray-50 flex items-center justify-center">
                      <User className="w-5 h-5 text-gray-400" />
                    </div>
                    <div>
                      <p className="text-sm font-bold text-[#012333]">
                        {req.customer.firstName} {req.customer.lastName}
                      </p>
                      <p className="text-xs text-gray-500">{req.customer.email}</p>
                    </div>
                  </div>

                  <div className="bg-gray-50 p-4 rounded-xl">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-[10px] text-gray-400 uppercase tracking-wider font-bold">Transaction</p>
                        <p className="text-lg font-black text-[#012333]">
                          {req.amount} <span className="text-sm text-gray-400">{req.sendCurrency}</span>
                        </p>
                      </div>
                      <ArrowRight className="w-5 h-5 text-gray-300" />
                      <div className="text-right">
                        <p className="text-[10px] text-gray-400 uppercase tracking-wider font-bold">Receive</p>
                        <p className="text-lg font-black text-[#012333]">
                          {req.receiveCurrency}
                        </p>
                      </div>
                    </div>
                  </div>

                  {req.purpose && (
                    <div>
                      <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider mb-1">Purpose</p>
                      <p className="text-xs text-gray-600 italic">"{req.purpose}"</p>
                    </div>
                  )}
                </div>

                {(req.status === 'PENDING' || req.status === 'ASSIGNED') && (
                  <div className="mt-6 flex gap-3">
                    <Link href={`/agent/trades/new?requestId=${req.id}`} className="flex-1">
                      <Button className="w-full bg-[#012333] hover:bg-[#02334a] text-white rounded-xl h-11 font-bold">
                        Set Rate
                      </Button>
                    </Link>
                    <Button 
                      variant="outline" 
                      onClick={() => handleReject(req.id)}
                      className="w-12 h-11 rounded-xl border-red-100 text-red-500 hover:bg-red-50 hover:text-red-600"
                    >
                      <XCircle className="w-5 h-5" />
                    </Button>
                  </div>
                )}
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}

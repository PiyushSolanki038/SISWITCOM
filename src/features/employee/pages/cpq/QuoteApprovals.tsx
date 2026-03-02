import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  CheckCircle2, 
  XCircle, 
  Search,
  Filter
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { QuoteApproval } from '@/features/employee/pages/cpq/types';
import { cpqService } from '@/features/employee/services/cpqService';
import { Select, SelectTrigger, SelectValue, SelectItem } from '@/components/ui/select';
import { SafeSelectContent } from '@/components/ui/overlay-helpers';
import { toast } from 'sonner';
import { useAuth } from '@/hooks/useAuth';

const QuoteApprovals: React.FC = () => {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [comment, setComment] = useState('');
  const [selectedRequest, setSelectedRequest] = useState<QuoteApproval | null>(null);
  const [requests, setRequests] = useState<QuoteApproval[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState<'all' | 'pending' | 'approved' | 'rejected'>('all');
  const { user } = useAuth();
  const canApprove = ((user?.role || '').toString().toLowerCase() === 'owner') || ((user?.role || '').toString().toLowerCase() === 'admin');

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      setError(null);
      try {
        const approvals = await cpqService.getApprovals();
        const mapped: QuoteApproval[] = approvals.map((a: any) => {
          const s = (a.status || '').toString().toUpperCase();
          const status =
            s.includes('APPROVAL') || s.includes('PENDING') ? 'pending' :
            s.includes('APPROVED') ? 'approved' :
            s.includes('REJECT') ? 'rejected' : 'pending';
          return {
            id: a._id,
            quote_id: a.quoteId || a.quote?.id,
            requested_by: a.requestedBy,
            decided_by: a.decidedBy,
            status,
            created_at: a.createdAt,
            updated_at: a.updatedAt,
            quote_number: a.quote?.quoteNumber,
            customer_name: a.quote?.account?.name,
            total_amount: a.quote?.grandTotal ? Number(a.quote?.grandTotal) : undefined,
            discount_percent: a.quote?.discountTotal && a.quote?.subtotal
              ? Math.round((Number(a.quote.discountTotal) / Number(a.quote.subtotal)) * 100)
              : undefined,
          };
        });
        setRequests(mapped);
      } catch (e: any) {
        setError(e?.message || 'Failed to load approvals');
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const handleApprove = async (request: QuoteApproval) => {
    try {
      if (!canApprove) {
        toast.error('Not authorized to approve');
        return;
      }
      await cpqService.approveQuote(request.quote_id!);
      toast.success('Quote approved');
      setRequests(prev => prev.map(r => r.id === request.id ? { ...r, status: 'approved' } : r));
    } catch (e: any) {
      toast.error('Failed to approve quote');
    }
  };

  const handleReject = async (request: QuoteApproval) => {
    try {
      await cpqService.rejectQuote(request.quote_id!, comment);
      toast.success('Quote rejected');
      setRequests(prev => prev.map(r => r.id === request.id ? { ...r, status: 'rejected' } : r));
      setComment('');
      setSelectedRequest(null);
    } catch (e: any) {
      toast.error('Failed to reject quote');
    }
  };

  const filteredRequests = requests.filter(req => {
    const matchesSearch = (req.quote_number?.toLowerCase().includes(searchTerm.toLowerCase()) || false) ||
      (req.customer_name?.toLowerCase().includes(searchTerm.toLowerCase()) || false);
    const matchesStatus = statusFilter === 'all' ? true : req.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-[#1A3C34]">Quote Approvals</h1>
        <p className="text-slate-500">Review and approve high-discount quotes.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle>Pending Approvals</CardTitle>
            <CardDescription>Quotes requiring manual review (Discount {'>'} 10%)</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center space-x-2 mb-4">
              <div className="relative flex-1">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-slate-500" />
                <Input
                  placeholder="Search requests..."
                  className="pl-9"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              <div className="w-48">
                <Select value={statusFilter} onValueChange={(v) => setStatusFilter(v as any)}>
                  <SelectTrigger className="h-10">
                    <SelectValue placeholder="Status" />
                  </SelectTrigger>
                  <SafeSelectContent>
                    <SelectItem value="all">All</SelectItem>
                    <SelectItem value="pending">Pending</SelectItem>
                    <SelectItem value="approved">Approved</SelectItem>
                    <SelectItem value="rejected">Rejected</SelectItem>
                  </SafeSelectContent>
                </Select>
              </div>
            </div>

            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Quote #</TableHead>
                  <TableHead>Requested By</TableHead>
                  <TableHead>Customer</TableHead>
                  <TableHead>Total Amount</TableHead>
                  <TableHead>Discount</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredRequests.filter(r => r.status === 'pending').map((request) => (
                  <TableRow key={request.id}>
                    <TableCell className="font-medium text-[#1A3C34]">
                      {request.quote_number}
                    </TableCell>
                    <TableCell>{request.requested_by}</TableCell>
                    <TableCell>{request.customer_name}</TableCell>
                    <TableCell>${request.total_amount?.toLocaleString()}</TableCell>
                    <TableCell>
                      <Badge variant={(request.discount_percent || 0) > 10 ? "destructive" : "secondary"}>
                        {request.discount_percent}%
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button 
                          size="sm" 
                          className="bg-emerald-600 hover:bg-emerald-700 h-8 w-8 p-0"
                          onClick={() => handleApprove(request)}
                          title="Approve"
                        >
                          <CheckCircle2 className="h-4 w-4" />
                        </Button>
                        
                        <Dialog>
                          <DialogTrigger asChild>
                            <Button 
                              size="sm" 
                              variant="destructive" 
                              className="h-8 w-8 p-0"
                              onClick={() => setSelectedRequest(request)}
                              title="Reject"
                            >
                              <XCircle className="h-4 w-4" />
                            </Button>
                          </DialogTrigger>
                          <DialogContent>
                            <DialogHeader>
                              <DialogTitle>Reject Quote {request.quote_number}</DialogTitle>
                              <DialogDescription>
                                Please provide a reason for rejecting this quote.
                              </DialogDescription>
                            </DialogHeader>
                            <div className="py-4">
                              <Textarea 
                                placeholder="Reason for rejection..." 
                                value={comment}
                                onChange={(e) => setComment(e.target.value)}
                              />
                            </div>
                            <DialogFooter>
                              <Button variant="outline" onClick={() => setSelectedRequest(null)}>Cancel</Button>
                              <Button variant="destructive" onClick={() => handleReject(request)}>Reject Quote</Button>
                            </DialogFooter>
                          </DialogContent>
                        </Dialog>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
                {loading && (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-8 text-slate-500">
                      Loading approvals...
                    </TableCell>
                  </TableRow>
                )}
                {!loading && filteredRequests.filter(r => r.status === 'pending').length === 0 && (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-8 text-slate-500">
                      No pending approvals found.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Approved</CardTitle>
            <CardDescription>Recently approved quotes</CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Quote #</TableHead>
                  <TableHead>Requested By</TableHead>
                  <TableHead>Customer</TableHead>
                  <TableHead>Total</TableHead>
                  <TableHead>Discount</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredRequests.filter(r => r.status === 'approved').map((r) => (
                  <TableRow key={r.id}>
                    <TableCell className="font-medium text-[#1A3C34]">{r.quote_number}</TableCell>
                    <TableCell>{r.requested_by}</TableCell>
                    <TableCell>{r.customer_name}</TableCell>
                    <TableCell>${r.total_amount?.toLocaleString()}</TableCell>
                    <TableCell>
                      <Badge variant={(r.discount_percent || 0) > 10 ? "destructive" : "secondary"}>
                        {r.discount_percent}%
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <Button variant="outline" size="sm" onClick={() => navigate(`/employee-dashboard/cpq/quotes/${r.quote_id}`)}>
                        View
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
                {loading && (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-8 text-slate-500">Loading...</TableCell>
                  </TableRow>
                )}
                {!loading && filteredRequests.filter(r => r.status === 'approved').length === 0 && (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-8 text-slate-500">No approved quotes</TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Rejected</CardTitle>
            <CardDescription>Recently rejected quotes</CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Quote #</TableHead>
                  <TableHead>Requested By</TableHead>
                  <TableHead>Customer</TableHead>
                  <TableHead>Total</TableHead>
                  <TableHead>Discount</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredRequests.filter(r => r.status === 'rejected').map((r) => (
                  <TableRow key={r.id}>
                    <TableCell className="font-medium text-[#1A3C34]">{r.quote_number}</TableCell>
                    <TableCell>{r.requested_by}</TableCell>
                    <TableCell>{r.customer_name}</TableCell>
                    <TableCell>${r.total_amount?.toLocaleString()}</TableCell>
                    <TableCell>
                      <Badge variant="secondary">{r.discount_percent}%</Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <Button variant="outline" size="sm" onClick={() => navigate(`/employee-dashboard/cpq/quotes/${r.quote_id}`)}>
                        View
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
                {loading && (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-8 text-slate-500">Loading...</TableCell>
                  </TableRow>
                )}
                {!loading && filteredRequests.filter(r => r.status === 'rejected').length === 0 && (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-8 text-slate-500">No rejected quotes</TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default QuoteApprovals;

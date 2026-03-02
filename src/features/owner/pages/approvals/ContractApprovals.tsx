import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { CheckCircle2, XCircle, Search } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { toast } from 'sonner';
import { clmService } from '@/features/employee/services/clmService';
import { cpqService } from '@/features/employee/services/cpqService';
import { Contract } from '@/features/employee/pages/clm/types';
import { QuoteApproval } from '@/features/employee/pages/cpq/types';
import { useAuth } from '@/hooks/useAuth';

type ApprovalItem = {
  id: string;
  status: string;
  comment?: string;
  contract: Contract;
};

const ContractApprovals: React.FC = () => {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [comment, setComment] = useState('');
  const [selected, setSelected] = useState<ApprovalItem | null>(null);
  const [items, setItems] = useState<ApprovalItem[]>([]);
  const [quoteRequests, setQuoteRequests] = useState<QuoteApproval[]>([]);
  const [loading, setLoading] = useState(false);
  const { user } = useAuth();
  const canApprove = ((user?.role || '').toString().toLowerCase() === 'owner') || ((user?.role || '').toString().toLowerCase() === 'admin');

  const loadData = async () => {
    setLoading(true);
    try {
      const approvals = await clmService.getPendingContractApprovals();
      setItems(approvals);
      const quotes = await cpqService.getApprovals();
      const mapped: QuoteApproval[] = quotes.map((a: any) => {
        const s = (a.status || '').toString().toUpperCase();
        const status =
          s.includes('APPROVAL') || s.includes('PENDING') ? 'pending' :
          s.includes('APPROVED') ? 'approved' :
          s.includes('REJECT') ? 'rejected' : 'pending';
        return {
          id: a._id || a.id,
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
      setQuoteRequests(mapped);
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : 'Failed to load approvals';
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const exportContractsCSV = () => {
    const headers = ['contract_number', 'title', 'customer', 'status'];
    const rows = items.map(i => [
      i.contract.contract_number ?? '',
      i.contract.name ?? '',
      i.contract.customer_name ?? '',
      i.contract.status ?? ''
    ]);
    const csv = [headers, ...rows].map(r => r.map(v => `"${String(v).replace(/"/g, '""')}"`).join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'approvals_contracts.csv';
    a.click();
    URL.revokeObjectURL(url);
  };

  const exportQuotesCSV = () => {
    const headers = ['quote_number', 'requested_by', 'customer', 'total_amount', 'discount_percent', 'status'];
    const rows = quoteRequests.map(r => [
      r.quote_number ?? '',
      r.requested_by ?? '',
      r.customer_name ?? '',
      r.total_amount ?? '',
      r.discount_percent ?? '',
      r.status ?? ''
    ]);
    const csv = [headers, ...rows].map(r => r.map(v => `"${String(v).replace(/"/g, '""')}"`).join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'approvals_quotes.csv';
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleExportAll = () => {
    exportContractsCSV();
    exportQuotesCSV();
  };

  const handleApprove = async (item: ApprovalItem) => {
    try {
      if (!canApprove) {
        toast.error('Not authorized to approve');
        return;
      }
      const updated = await clmService.approveContract(item.contract.id);
      toast.success('Contract approved');
      setItems(prev => prev.map(r => r.id === item.id ? { ...r, status: 'APPROVED', contract: updated } : r));
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : 'Failed to approve contract';
      toast.error(msg);
    }
  };

  const handleReject = async (item: ApprovalItem) => {
    try {
      const updated = await clmService.rejectContract(item.contract.id, comment);
      toast.success('Contract rejected');
      setItems(prev => prev.map(r => r.id === item.id ? { ...r, status: 'REJECTED', comment, contract: updated } : r));
      setComment('');
      setSelected(null);
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : 'Failed to reject contract';
      toast.error(msg);
    }
  };

  const filtered = items.filter(i => {
    const c = i.contract;
    const s = searchTerm.toLowerCase();
    return (c.contract_number?.toLowerCase().includes(s) || false) || (c.name?.toLowerCase().includes(s) || false) || (c.customer_name?.toLowerCase().includes(s) || false);
  });
  const filteredQuotes = quoteRequests.filter(r => {
    const s = searchTerm.toLowerCase();
    return (r.quote_number?.toLowerCase().includes(s) || false) || (r.customer_name?.toLowerCase().includes(s) || false);
  });

  return (
    <>
      <div className="od-topstrip">
        <div className="od-breadcrumb">SISWIT &nbsp;/&nbsp; <span>Approvals</span></div>
        <div className="od-topstrip-right">
          <button className="od-btn-ghost" onClick={loadData}>Refresh</button>
          <button className="od-btn-ink" onClick={handleExportAll}>Export All</button>
        </div>
      </div>
      <div className="od-content">
        <div className="od-panel">
          <div className="od-panel-head">
            <div>
              <div className="od-panel-title">Pending Approvals</div>
              <div className="od-panel-subtitle">Review and decide on approvals</div>
            </div>
          </div>
          <div className="mb-3">
            <div className="relative">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-[#64748B]" />
              <Input placeholder="Search approvals..." className="pl-9 bg-white border-black/10 text-[#0F172A] placeholder:text-[#64748B] focus-visible:ring-1 focus-visible:ring-[#3B82F6]" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
            </div>
          </div>
          <div className="od-bottom-grid">
            <div className="od-panel">
              <div className="od-panel-head">
                <div>
                  <div className="od-panel-title">Contracts</div>
                  <div className="od-panel-subtitle">Pending contracts</div>
                </div>
              </div>
              {loading ? (
                <div className="od-empty">Loading approvals...</div>
              ) : filtered.length === 0 ? (
                <div className="od-empty">No pending approvals</div>
              ) : (
                <table className="od-tbl">
                  <thead>
                    <tr>
                      <th>Contract #</th>
                      <th>Title</th>
                      <th>Customer</th>
                      <th>Status</th>
                      <th style={{ textAlign: 'right' }}>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filtered.map((i) => (
                      <tr key={i.id}>
                        <td><strong>{i.contract.contract_number}</strong></td>
                        <td>{i.contract.name}</td>
                        <td>{i.contract.customer_name}</td>
                        <td style={{ color: 'var(--muted)', fontSize: '12px' }}>{i.contract.status}</td>
                        <td style={{ textAlign: 'right' }}>
                          <div className="flex justify-end gap-2">
                            <Button size="sm" className="bg-[#22C55E] hover:bg-[#1ea64f] h-8 w-8 p-0" onClick={() => handleApprove(i)} title="Approve">
                              <CheckCircle2 className="h-4 w-4" />
                            </Button>
                            <Dialog>
                              <DialogTrigger asChild>
                                <Button size="sm" variant="destructive" className="h-8 w-8 p-0 bg-[#EF4444] hover:bg-[#d23333]" onClick={() => setSelected(i)} title="Reject">
                                  <XCircle className="h-4 w-4" />
                                </Button>
                              </DialogTrigger>
                              <DialogContent className="bg-white text-[#0F172A] border-black/10">
                                <DialogHeader>
                                  <DialogTitle className="text-[#0F172A]">Reject Contract {i.contract.contract_number}</DialogTitle>
                                  <DialogDescription className="text-[#64748B]">Provide a reason for rejection.</DialogDescription>
                                </DialogHeader>
                                <div className="py-4">
                                  <Textarea className="bg-white border-black/10 text-[#0F172A] placeholder:text-[#64748B] focus-visible:ring-1 focus-visible:ring-[#3B82F6]" placeholder="Reason..." value={comment} onChange={(e) => setComment(e.target.value)} />
                                </div>
                                <DialogFooter>
                                  <Button variant="outline" className="border-black/10 text-[#0F172A]" onClick={() => setSelected(null)}>Cancel</Button>
                                  <Button variant="destructive" className="bg-[#EF4444] hover:bg-[#d23333]" onClick={() => handleReject(i)}>Reject Contract</Button>
                                </DialogFooter>
                              </DialogContent>
                            </Dialog>
                            <Button variant="outline" size="sm" className="border-black/10 text-[#0F172A]" onClick={() => navigate(`/employee-dashboard/clm/contracts/${i.contract.id}`)}>View</Button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
            <div className="od-panel">
              <div className="od-panel-head">
                <div>
                  <div className="od-panel-title">Quotes</div>
                  <div className="od-panel-subtitle">Pending quotes</div>
                </div>
              </div>
              {loading ? (
                <div className="od-empty">Loading approvals...</div>
              ) : filteredQuotes.filter(r => r.status === 'pending').length === 0 ? (
                <div className="od-empty">No pending quote approvals</div>
              ) : (
                <table className="od-tbl">
                  <thead>
                    <tr>
                      <th>Quote #</th>
                      <th>Requested By</th>
                      <th>Customer</th>
                      <th>Total</th>
                      <th>Discount</th>
                      <th style={{ textAlign: 'right' }}>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredQuotes.filter(r => r.status === 'pending').map((r) => (
                      <tr key={r.id}>
                        <td><strong>{r.quote_number}</strong></td>
                        <td>{r.requested_by}</td>
                        <td>{r.customer_name}</td>
                        <td>${r.total_amount?.toLocaleString()}</td>
                        <td>{r.discount_percent}%</td>
                        <td style={{ textAlign: 'right' }}>
                          <div className="flex justify-end gap-2">
                            <Button size="sm" className="bg-[#22C55E] hover:bg-[#1ea64f] h-8 w-8 p-0" onClick={async () => {
                              try {
                                await cpqService.approveQuote(r.quote_id!);
                                toast.success('Quote approved');
                                setQuoteRequests(prev => prev.map(q => q.id === r.id ? { ...q, status: 'approved' } : q));
                              } catch {
                                toast.error('Failed to approve quote');
                              }
                            }} title="Approve">
                              <CheckCircle2 className="h-4 w-4" />
                            </Button>
                            <Dialog>
                              <DialogTrigger asChild>
                                <Button size="sm" variant="destructive" className="h-8 w-8 p-0 bg-[#EF4444] hover:bg-[#d23333]" onClick={() => setSelected(null)} title="Reject">
                                  <XCircle className="h-4 w-4" />
                                </Button>
                              </DialogTrigger>
                              <DialogContent className="bg-white text-[#0F172A] border-black/10">
                                <DialogHeader>
                                  <DialogTitle className="text-[#0F172A]">Reject Quote {r.quote_number}</DialogTitle>
                                  <DialogDescription className="text-[#64748B]">Provide a reason for rejection.</DialogDescription>
                                </DialogHeader>
                                <div className="py-4">
                                  <Textarea className="bg-white border-black/10 text-[#0F172A] placeholder:text-[#64748B] focus-visible:ring-1 focus-visible:ring-[#3B82F6]" placeholder="Reason..." value={comment} onChange={(e) => setComment(e.target.value)} />
                                </div>
                                <DialogFooter>
                                  <Button variant="outline" className="border-black/10 text-[#0F172A]" onClick={() => setSelected(null)}>Cancel</Button>
                                  <Button variant="destructive" className="bg-[#EF4444] hover:bg-[#d23333]" onClick={async () => {
                                    try {
                                      await cpqService.rejectQuote(r.quote_id!, comment);
                                      toast.success('Quote rejected');
                                      setQuoteRequests(prev => prev.map(q => q.id === r.id ? { ...q, status: 'rejected' } : q));
                                      setComment('');
                                    } catch {
                                      toast.error('Failed to reject quote');
                                    }
                                  }}>Reject Quote</Button>
                                </DialogFooter>
                              </DialogContent>
                            </Dialog>
                            <Button variant="outline" size="sm" className="border-black/10 text-[#0F172A]" onClick={() => navigate(`/employee-dashboard/cpq/quotes/${r.quote_id}`)}>View</Button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default ContractApprovals;

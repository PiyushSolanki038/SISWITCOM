import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, 
  Send, 
  FileCheck, 
  Copy, 
  Edit,
  Printer,
  Download,
  Trash2
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Separator } from '@/components/ui/separator';
import { Quote } from '@/features/employee/pages/cpq/types';
import { cpqService } from '@/features/employee/services/cpqService';
import { clmService } from '@/features/employee/services/clmService';
import { Skeleton } from '@/components/ui/skeleton';
import { toast } from 'sonner';
import { useAuth } from '@/hooks/useAuth';

const QuoteDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [isConverting, setIsConverting] = useState(false);
  const [data, setData] = useState<Quote | null>(null);
  const { user } = useAuth();
  const canApprove = ((user?.role || '').toString().toLowerCase() === 'owner') || ((user?.role || '').toString().toLowerCase() === 'admin');

  useEffect(() => {
    const fetchQuote = async () => {
        if (!id) return;
        setLoading(true);
        try {
            const quote = await cpqService.getQuote(id);
            setData(quote);
        } catch (error) {
            console.error("Failed to load quote", error);
            toast.error("Failed to load quote details");
        } finally {
            setLoading(false);
        }
    };
    fetchQuote();
  }, [id]);

  if (loading) {
    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                     <Skeleton className="h-10 w-10 rounded-full" />
                     <div className="space-y-2">
                        <Skeleton className="h-8 w-48" />
                        <Skeleton className="h-4 w-32" />
                     </div>
                </div>
                <div className="flex gap-2">
                    <Skeleton className="h-10 w-24" />
                    <Skeleton className="h-10 w-24" />
                </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="md:col-span-2 space-y-6">
                     <Skeleton className="h-[200px] w-full rounded-lg" />
                     <Skeleton className="h-[300px] w-full rounded-lg" />
                </div>
                <div className="space-y-6">
                    <Skeleton className="h-[150px] w-full rounded-lg" />
                    <Skeleton className="h-[150px] w-full rounded-lg" />
                </div>
            </div>
        </div>
    );
  }

  if (!data) return <div>Quote not found</div>;

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'approved': return 'bg-emerald-50 text-emerald-700 border-emerald-100';
      case 'accepted': return 'bg-emerald-100 text-emerald-800 border-emerald-200';
      case 'pending_approval': return 'bg-amber-50 text-amber-700 border-amber-100';
      case 'sent': return 'bg-blue-50 text-blue-700 border-blue-100';
      case 'rejected': return 'bg-red-50 text-red-700 border-red-100';
      default: return 'bg-slate-50 text-slate-700 border-slate-100';
    }
  };

  const handleConvertToContract = async () => {
    setIsConverting(true);
    try {
      await clmService.createContractFromQuote(data.id);
      
      toast.success('Contract created successfully');
      navigate('/employee-dashboard/clm/contracts');
    } catch (error) {
      console.error("Failed to convert to contract", error);
      toast.error("Failed to create contract");
    } finally {
      setIsConverting(false);
    }
  };
  
  const handleSendQuote = async () => {
    try {
        await cpqService.sendQuote(data.id);
        toast.success('Quote sent to customer');
        // Refresh data
        const updated = await cpqService.getQuote(data.id);
        setData(updated);
    } catch (error) {
        toast.error("Failed to send quote");
    }
  };

  const handleApproveManager = async () => {
    try {
      await cpqService.approveQuote(data.id);
      toast.success('Quote approved');
      const updated = await cpqService.getQuote(data.id);
      setData(updated);
    } catch (e) {
      toast.error('Failed to approve quote');
    }
  };

  const handleRecallRequest = async () => {
    try {
      const updatedQuote = await cpqService.updateQuote(data.id, { status: 'DRAFT' });
      toast.success('Approval request recalled');
      setData(updatedQuote);
    } catch (e) {
      toast.error('Failed to recall request');
    }
  };

  const handlePrint = () => {
    window.print();
  };

  const handleDownload = () => {
    try {
      const payload = {
        quote_number: data.quote_number,
        status: data.status,
        customer_name: data.customer_name,
        currency: data.currency,
        subtotal: data.subtotal,
        discount_total: data.discount_total,
        tax_total: data.tax_total,
        grand_total: data.grand_total,
        valid_until: data.valid_until,
        items: (data.items || []).map(i => ({
          product: i.product_name_snapshot,
          quantity: i.quantity,
          unit_price: i.unit_price,
          discount_percent: i.discount_percent,
          line_total: i.line_total,
        })),
      };
      const blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${data.quote_number || 'quote'}.json`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(url);
    } catch {
      toast.error('Failed to download quote');
    }
  };

  const renderActions = () => {
    switch (data.status) {
      case 'draft':
        return (
          <>
             <Button variant="outline" className="text-red-600 hover:bg-red-50">
                <Trash2 className="w-4 h-4 mr-2" />
                Delete
             </Button>
             <Button className="bg-[#1A3C34] text-white hover:bg-[#1A3C34]/90" onClick={() => navigate(`/employee-dashboard/cpq/quotes/edit/${data.id}`)}>
               <Edit className="w-4 h-4 mr-2" />
               Edit Quote
             </Button>
          </>
        );
      case 'pending_approval':
        return (
          <>
            <Button variant="outline" onClick={handleRecallRequest}>
               Recall Request
            </Button>
            {canApprove && (
              <Button className="bg-emerald-600 text-white hover:bg-emerald-700" onClick={handleApproveManager}>
                 Approve (Manager)
              </Button>
            )}
          </>
        );
      case 'approved':
        return (
          <Button className="bg-[#1A3C34] text-white hover:bg-[#1A3C34]/90" onClick={handleSendQuote}>
            <Send className="w-4 h-4 mr-2" />
            Send to Customer
          </Button>
        );
      case 'sent':
        return (
          <Button variant="outline">
            Resend Email
          </Button>
        );
      case 'accepted':
        return (
          <Button 
            className="bg-emerald-600 text-white hover:bg-emerald-700" 
            onClick={handleConvertToContract}
            disabled={isConverting}
          >
            <FileCheck className="w-4 h-4 mr-2" />
            {isConverting ? 'Converting...' : 'Convert to Contract'}
          </Button>
        );
      case 'rejected':
        return (
          <Button variant="outline">
            <Copy className="w-4 h-4 mr-2" />
            Duplicate Quote
          </Button>
        );
      default:
        return null;
    }
  };

  return (
    <div className="space-y-6">
      <div className="sticky top-0 z-40 bg-white/80 backdrop-blur supports-[backdrop-filter]:bg-white/60 border-b px-2 py-3 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => navigate('/employee-dashboard/cpq/quotes')}>
            <ArrowLeft className="w-4 h-4" />
          </Button>
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-2xl font-bold text-[#1A3C34]">{data.quote_number}</h1>
              <Badge variant="secondary" className={`capitalize ${getStatusColor(data.status)}`}>
                {data.status.replace('_', ' ')}
              </Badge>
            </div>
            <p className="text-slate-500">Manage quote lifecycle</p>
          </div>
        </div>
        <div className="flex gap-2">
           <Button variant="outline" size="icon" onClick={handlePrint} title="Print">
            <Printer className="w-4 h-4" />
          </Button>
          <Button variant="outline" size="icon" onClick={handleDownload} title="Download JSON">
            <Download className="w-4 h-4" />
          </Button>
          {renderActions()}
        </div>
      </div>
      
      <Card>
        <CardContent>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Badge className="bg-slate-100 text-slate-700">Draft</Badge>
              <span className="text-slate-400">→</span>
              <Badge className={data.status === 'pending_approval' || data.status === 'approved' || data.status === 'sent' || data.status === 'accepted' ? 'bg-amber-50 text-amber-700' : 'bg-slate-100 text-slate-700'}>Pending</Badge>
              <span className="text-slate-400">→</span>
              <Badge className={data.status === 'approved' || data.status === 'sent' || data.status === 'accepted' ? 'bg-emerald-50 text-emerald-700' : 'bg-slate-100 text-slate-700'}>Approved</Badge>
              <span className="text-slate-400">→</span>
              <Badge className={data.status === 'sent' || data.status === 'accepted' ? 'bg-blue-50 text-blue-700' : 'bg-slate-100 text-slate-700'}>Sent</Badge>
              <span className="text-slate-400">→</span>
              <Badge className={data.status === 'accepted' ? 'bg-emerald-100 text-emerald-800' : data.status === 'rejected' ? 'bg-red-50 text-red-700' : 'bg-slate-100 text-slate-700'}>{data.status === 'accepted' ? 'Won' : data.status === 'rejected' ? 'Lost' : 'Outcome'}</Badge>
            </div>
            {data.status === 'sent' && (
              <div className="text-xs text-slate-500">Quote is locked after sent. Only owner/admin can unlock.</div>
            )}
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content: Line Items */}
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Line Items</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Product</TableHead>
                    <TableHead className="text-right">Qty</TableHead>
                    <TableHead className="text-right">Unit Price</TableHead>
                    <TableHead className="text-right">Discount</TableHead>
                    <TableHead className="text-right">Total</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {data.items?.map((item) => (
                    <TableRow key={item.id}>
                      <TableCell>
                        <div className="font-medium">{item.product_name_snapshot}</div>
                      </TableCell>
                      <TableCell className="text-right">{item.quantity}</TableCell>
                      <TableCell className="text-right">${item.unit_price.toLocaleString()}</TableCell>
                      <TableCell className="text-right text-red-600">{item.discount_percent}%</TableCell>
                      <TableCell className="text-right font-bold">${item.line_total.toLocaleString()}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </div>

        {/* Sidebar: Overview & Pricing Breakdown */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Quote Overview</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <div className="text-sm font-medium text-slate-700">Customer</div>
                <div className="text-sm text-slate-500">{data.customer_name}</div>
              </div>
              <div>
                <div className="text-sm font-medium text-slate-700">Status</div>
                <div className="text-sm text-slate-500 capitalize">{data.status.replace('_', ' ')}</div>
              </div>
               <div>
                <div className="text-sm font-medium text-slate-700">Grand Total</div>
                <div className="text-sm text-slate-500">${data.grand_total.toLocaleString()}</div>
              </div>
              <div>
                <div className="text-sm font-medium text-slate-700">Valid Until</div>
                <div className="text-sm text-slate-500">{data.valid_until}</div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Pricing Breakdown</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex justify-between text-sm">
                <span className="text-slate-500">Subtotal</span>
                <span>${data.subtotal.toLocaleString()}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-slate-500">Discount Total</span>
                <span className="text-red-600">-${data.discount_total.toLocaleString()}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-slate-500">Tax</span>
                <span>${data.tax_total.toLocaleString()}</span>
              </div>
              <Separator />
              <div className="flex justify-between font-bold text-lg text-[#1A3C34]">
                <span>Grand Total</span>
                <span>${data.grand_total.toLocaleString()}</span>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default QuoteDetail;

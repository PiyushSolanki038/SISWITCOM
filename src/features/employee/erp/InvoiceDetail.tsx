import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { erpService } from './erpService';
import { ERPInvoice } from './types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/components/ui/use-toast';

const InvoiceDetail = () => {
  const { id } = useParams();
  const [invoice, setInvoice] = useState<ERPInvoice | null>(null);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();
  const navigate = useNavigate();
  
  const load = async () => {
    if (!id) return;
    const inv = await erpService.getInvoice(id);
    setInvoice(inv);
    setLoading(false);
  };
  
  useEffect(() => {
    load();
  }, [id]);
  
  const send = async () => {
    if (!invoice) return;
    await erpService.sendInvoice(invoice._id);
    toast({ title: 'Invoice sent' });
    await load();
  };
  
  const pay = async () => {
    if (!invoice) return;
    await erpService.createPayment({ invoiceId: invoice._id, paymentMethod: 'bank_transfer' });
    toast({ title: 'Payment recorded' });
    await load();
  };
  
  if (loading) return <div className="p-6">Loading...</div>;
  if (!invoice) return <div className="p-6">Not found</div>;
  
  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Invoice {invoice.invoiceNumber}</h1>
          <p className="text-muted-foreground">{invoice.accountId?.name}</p>
        </div>
        <div className="flex gap-2">
          {invoice.status === 'draft' && <Button onClick={send}>Send</Button>}
          {invoice.status !== 'paid' && <Button onClick={pay}>Record Payment</Button>}
        </div>
      </div>
      
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle>Status</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <div className="flex items-center justify-between">
              <div>Invoice</div>
              <Badge>{invoice.status}</Badge>
            </div>
            <div className="flex items-center justify-between">
              <div>Due</div>
              <div>{new Date(invoice.dueDate).toLocaleDateString()}</div>
            </div>
          </CardContent>
        </Card>
        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle>Linked</CardTitle>
          </CardHeader>
          <CardContent className="flex gap-2">
            <Button variant="outline" onClick={() => navigate(`/employee-dashboard/erp/orders/${invoice.orderId}`)}>View Order</Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
export default InvoiceDetail;

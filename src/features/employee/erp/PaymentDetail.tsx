import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { erpService } from './erpService';
import { ERPPayment } from './types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

const PaymentDetail = () => {
  const { id } = useParams();
  const [payment, setPayment] = useState<ERPPayment | null>(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  
  useEffect(() => {
    const load = async () => {
      if (!id) return;
      const p = await erpService.getPayment(id);
      setPayment(p);
      setLoading(false);
    };
    load();
  }, [id]);
  
  if (loading) return <div className="p-6">Loading...</div>;
  if (!payment) return <div className="p-6">Not found</div>;
  
  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Payment {payment.paymentNumber}</h1>
        <p className="text-muted-foreground">{payment.accountId?.name}</p>
      </div>
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle>Status</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <div className="flex items-center justify-between">
              <div>Payment</div>
              <Badge>{payment.status}</Badge>
            </div>
            <div className="flex items-center justify-between">
              <div>Date</div>
              <div>{new Date(payment.paymentDate).toLocaleString()}</div>
            </div>
            <div className="flex items-center justify-between">
              <div>Amount</div>
              <div>{new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(Number(payment.amount))}</div>
            </div>
          </CardContent>
        </Card>
        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle>Linked</CardTitle>
          </CardHeader>
          <CardContent className="flex gap-2">
            <button className="px-3 py-2 border rounded" onClick={() => navigate(`/employee-dashboard/erp/invoices/${payment.invoiceId}`)}>View Invoice</button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
export default PaymentDetail;

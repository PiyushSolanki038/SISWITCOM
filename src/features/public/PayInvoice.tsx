import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Loader2, CheckCircle2, AlertCircle } from 'lucide-react';
import { API_CONFIG } from '@/config/api';

type Item = { name?: string; productId?: string; quantity?: number; unitPrice?: number; total?: number };

const PayInvoice: React.FC = () => {
  const { token } = useParams();
  const [loading, setLoading] = useState(true);
  const [paying, setPaying] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [invoice, setInvoice] = useState<any>(null);
  const [method, setMethod] = useState<'credit_card' | 'bank_transfer' | 'upi'>('credit_card');
  const [cardName, setCardName] = useState('');
  const [cardNumber, setCardNumber] = useState('');

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        const res = await fetch(`${API_CONFIG.baseUrl}/erp/public/invoices/${token}`);
        const data = await res.json();
        if (!res.ok) throw new Error(data?.message || 'Failed to load invoice');
        setInvoice(data);
      } catch (e: any) {
        setError(e.message);
      } finally {
        setLoading(false);
      }
    };
    if (token) load();
  }, [token]);

  const pay = async () => {
    if (!token) return;
    setPaying(true);
    setError(null);
    try {
      const res = await fetch(`${API_CONFIG.baseUrl}/erp/public/invoices/${token}/pay`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ paymentMethod: method, cardName, cardNumber }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.message || 'Payment failed');
      setSuccess(true);
      setInvoice(data.invoice || invoice);
    } catch (e: any) {
      setError(e.message);
    } finally {
      setPaying(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <Loader2 className="w-10 h-10 text-[#1A3C34] animate-spin" />
      </div>
    );
  }

  if (error && !invoice) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
        <Card className="max-w-md w-full text-center p-8 border-red-200">
          <div className="flex justify-center mb-6">
            <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center">
              <AlertCircle className="w-10 h-10 text-red-600" />
            </div>
          </div>
          <h1 className="text-2xl font-bold text-red-800 mb-2">Link Error</h1>
          <p className="text-slate-600 mb-2">{error}</p>
        </Card>
      </div>
    );
  }

  if (success) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
        <Card className="max-w-md w-full text-center p-8">
          <div className="flex justify-center mb-6">
            <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center">
              <CheckCircle2 className="w-10 h-10 text-green-600" />
            </div>
          </div>
          <h1 className="text-2xl font-bold text-[#1A3C34] mb-2">Payment Successful</h1>
          <p className="text-slate-600">Thank you for your payment.</p>
        </Card>
      </div>
    );
  }

  const items: Item[] = Array.isArray(invoice?.items) ? invoice.items : [];
  const currency = invoice?.currency || 'USD';
  const fmt = (n: number) => Number(n || 0).toLocaleString('en-US', { style: 'currency', currency });

  return (
    <div className="min-h-screen bg-slate-50">
      <header className="bg-white border-b px-6 py-4">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <div className="font-bold text-[#1A3C34]">SISWIT</div>
          <Badge variant="outline">{invoice?.invoiceNumber}</Badge>
        </div>
      </header>
      <main className="max-w-4xl mx-auto p-4 md:p-8 grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle>Invoice</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between text-sm text-slate-600 mb-4">
              <div>Bill To: <span className="font-medium">{invoice?.accountName || ''}</span></div>
              <div>Due: {invoice?.dueDate ? new Date(invoice.dueDate).toLocaleDateString() : '—'}</div>
            </div>
            <div className="overflow-auto border rounded">
              <table className="w-full text-sm">
                <thead className="bg-slate-50">
                  <tr className="text-left">
                    <th className="p-3 border">Product</th>
                    <th className="p-3 border text-right">Qty</th>
                    <th className="p-3 border text-right">Unit Price</th>
                    <th className="p-3 border text-right">Total</th>
                  </tr>
                </thead>
                <tbody>
                  {items.map((i, idx) => (
                    <tr key={idx}>
                      <td className="p-3 border">{i.name || i.productId}</td>
                      <td className="p-3 border text-right">{i.quantity || 0}</td>
                      <td className="p-3 border text-right">{fmt(Number(i.unitPrice || 0))}</td>
                      <td className="p-3 border text-right">{fmt(Number(i.total || 0))}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="flex justify-end mt-4">
              <div className="w-64 space-y-2">
                <div className="flex justify-between"><span>Total</span><span className="font-semibold">{fmt(Number(invoice?.amount || 0))}</span></div>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Pay Online</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {error && <div className="text-sm text-red-600">{error}</div>}
            <div className="space-y-2">
              <Label>Payment Method</Label>
              <select value={method} onChange={(e) => setMethod(e.target.value as any)} className="w-full border rounded h-9 px-2">
                <option value="credit_card">Credit Card</option>
                <option value="bank_transfer">Bank Transfer</option>
                <option value="upi">UPI</option>
              </select>
            </div>
            {method === 'credit_card' && (
              <div className="space-y-3">
                <div className="space-y-1">
                  <Label>Name on Card</Label>
                  <Input value={cardName} onChange={(e) => setCardName(e.target.value)} placeholder="Jane Doe" />
                </div>
                <div className="space-y-1">
                  <Label>Card Number</Label>
                  <Input value={cardNumber} onChange={(e) => setCardNumber(e.target.value)} placeholder="4111 1111 1111 1111" />
                </div>
              </div>
            )}
            <Button className="w-full bg-[#1A3C34]" onClick={pay} disabled={paying}>
              {paying ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Processing</> : `Pay ${fmt(Number(invoice?.amount || 0))}`}
            </Button>
          </CardContent>
        </Card>
      </main>
    </div>
  );
};

export default PayInvoice;

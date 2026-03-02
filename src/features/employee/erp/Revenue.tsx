import React, { useEffect, useMemo, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, LineChart, Line } from 'recharts';
import { DollarSign, TrendingUp, CreditCard, Activity } from 'lucide-react';
import { erpService } from './erpService';
import { ERPPayment, ERPInvoice } from './types';

const months = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];

const Revenue = () => {
  const [payments, setPayments] = useState<ERPPayment[]>([]);
  const [invoices, setInvoices] = useState<ERPInvoice[]>([]);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    const load = async () => {
      try {
        const [p, i] = await Promise.all([erpService.getPayments(), erpService.getInvoices()]);
        setPayments(p);
        setInvoices(i);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);
  
  const totals = useMemo(() => {
    const paid = payments.filter(p => p.status === 'completed').reduce((acc, p) => acc + Number(p.amount), 0);
    const unpaid = invoices.filter(i => i.status !== 'paid').reduce((acc, inv) => acc + Number(inv.balanceDue ?? inv.amount), 0);
    const byMonth = new Map<string, number>();
    const now = new Date();
    for (let k = 5; k >= 0; k--) {
      const d = new Date(now.getFullYear(), now.getMonth() - k, 1);
      const key = `${d.getFullYear()}-${d.getMonth()}`;
      byMonth.set(key, 0);
    }
    payments.filter(p => p.status === 'completed').forEach(p => {
      const d = new Date(p.paymentDate);
      const key = `${d.getFullYear()}-${d.getMonth()}`;
      if (byMonth.has(key)) byMonth.set(key, (byMonth.get(key) || 0) + Number(p.amount));
    });
    const chart = Array.from(byMonth.entries()).map(([key, value]) => {
      const [y, m] = key.split('-').map(Number);
      return { name: months[m], revenue: value, recurring: 0 };
    });
    return { paid, unpaid, chart };
  }, [payments, invoices]);
  
  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Revenue Recognition</h1>
          <p className="text-muted-foreground">Monitor your financial performance and recurring revenue.</p>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(totals.paid)}
            </div>
            <p className="text-xs text-muted-foreground">Completed payments</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Recurring (ARR)</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">$0.00</div>
            <p className="text-xs text-muted-foreground">Derived from subscriptions</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending Invoices</CardTitle>
            <CreditCard className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(totals.unpaid)}
            </div>
            <p className="text-xs text-muted-foreground">Unpaid amount</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Growth Rate</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">+12.5%</div>
            <p className="text-xs text-muted-foreground">Year over year</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
        <Card className="col-span-4">
          <CardHeader>
            <CardTitle>Revenue Overview</CardTitle>
          </CardHeader>
          <CardContent className="pl-2">
            <ResponsiveContainer width="100%" height={350}>
              <BarChart data={totals.chart}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                <XAxis dataKey="name" className="text-sm font-medium" />
                <YAxis className="text-sm font-medium" />
                <Tooltip 
                    contentStyle={{ backgroundColor: 'white', borderRadius: '8px', border: '1px solid #e2e8f0' }}
                />
                <Legend />
                <Bar dataKey="revenue" name="Total Revenue" fill="#0f172a" radius={[4, 4, 0, 0]} />
                <Bar dataKey="recurring" name="Recurring Revenue" fill="#10b981" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
        <Card className="col-span-3">
          <CardHeader>
            <CardTitle>Recent Transactions</CardTitle>
            <p className="text-sm text-muted-foreground">
              Latest financial activities.
            </p>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {payments.slice(0, 6).map(p => (
                <div key={p._id} className="flex items-center">
                  <div className="ml-4 space-y-1">
                    <p className="text-sm font-medium leading-none">{p.accountId?.name || 'Account'}</p>
                    <p className="text-sm text-muted-foreground">Payment</p>
                  </div>
                  <div className="ml-auto font-medium">+{new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(Number(p.amount))}</div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Revenue;

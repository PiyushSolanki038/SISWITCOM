import React, { useEffect, useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { API_CONFIG } from '@/config/api';

type PaymentTransaction = {
  id: string;
  createdAt: string;
  status: string;
  amount: string;
  orderId: string;
  tenantId: string;
};

const AdminPaymentsPage: React.FC = () => {
  const [transactions, setTransactions] = useState<PaymentTransaction[]>([]);

  useEffect(() => {
    (async () => {
      const res = await fetch(`${API_CONFIG.baseUrl}/payments/transactions/all`);
      const data = await res.json();
      if (res.ok) setTransactions(data as PaymentTransaction[]);
    })();
  }, []);

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>All Payments</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {transactions.map((t) => (
              <div key={t.id} className="grid grid-cols-5 gap-2 border rounded p-2">
                <span>{new Date(t.createdAt).toLocaleString()}</span>
                <span>{t.status}</span>
                <span>{t.amount}</span>
                <span>{t.orderId}</span>
                <span className="text-xs text-slate-500">{t.tenantId}</span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminPaymentsPage;

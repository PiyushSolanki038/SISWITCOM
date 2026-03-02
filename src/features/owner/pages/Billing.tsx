import React, { useEffect, useState } from 'react';
import { API_CONFIG } from '@/config/api';
import { useAuth } from '@/context/AuthContext';
import NotificationBell from '@/components/common/NotificationBell';

type PaymentItem = {
  _id?: string;
  id?: string;
  paymentNumber?: string;
  paymentDate?: string;
  status?: string;
  amount?: number;
  account?: { name?: string };
  invoice?: { id?: string };
};

const OwnerBillingPage: React.FC = () => {
  const { user } = useAuth();
  const [transactions, setTransactions] = useState<PaymentItem[]>([]);

  useEffect(() => {
    (async () => {
      try {
        const token = localStorage.getItem('token') || '';
        const res = await fetch(`${API_CONFIG.baseUrl}/erp/payments`, {
          headers: { 'x-auth-token': token, Authorization: `Bearer ${token}` }
        });
        if (!res.ok) return;
        const data = await res.json();
        const items = Array.isArray(data) ? (data as PaymentItem[]) : [];
        setTransactions(items);
      } catch {
        // ignore
      }
    })();
  }, [user?.id]);

  return (
    <>
      <div className="od-topstrip">
        <div className="od-breadcrumb">SISWIT &nbsp;/&nbsp; <span>Billing</span></div>
        <div className="od-topstrip-right">
          <NotificationBell />
        </div>
      </div>
      <div className="od-content">
        <div className="od-main-grid">
          <div className="od-panel">
            <div className="od-panel-head">
              <div>
                <div className="od-panel-title">Plan & Billing</div>
                <div className="od-panel-subtitle">Your subscription and recent activity</div>
              </div>
            </div>
            <div className="od-empty">Plan details coming soon</div>
          </div>
          <div className="od-panel">
            <div className="od-panel-head">
              <div>
                <div className="od-panel-title">Payment History</div>
                <div className="od-panel-subtitle">Transactions for your organization</div>
              </div>
            </div>
            <table className="od-tbl">
              <thead>
                <tr>
                  <th>Date</th>
                  <th>Status</th>
                  <th>Amount</th>
                  <th>Number</th>
                  <th>Account</th>
                </tr>
              </thead>
              <tbody>
                {transactions.map((t) => (
                  <tr key={t._id || t.id || t.paymentNumber}>
                    <td><strong>{t.paymentDate ? new Date(t.paymentDate).toLocaleString() : '-'}</strong></td>
                    <td>{t.status || '-'}</td>
                    <td>{typeof t.amount === 'number' ? `$${t.amount}` : '-'}</td>
                    <td>{t.paymentNumber || '-'}</td>
                    <td style={{ color: 'var(--muted)', fontSize: '12px' }}>{t.account?.name || '-'}</td>
                  </tr>
                ))}
                {transactions.length === 0 && (
                  <tr>
                    <td colSpan={5}><div className="od-empty">No transactions found</div></td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </>
  );
};

export default OwnerBillingPage;

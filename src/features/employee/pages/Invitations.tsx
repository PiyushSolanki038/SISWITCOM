import React, { useEffect, useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { API_CONFIG } from '@/config/api';

interface Invitation {
  id: string;
  email: string;
  role: 'EMPLOYEE' | 'ADMIN' | 'CUSTOMER';
  status: 'PENDING' | 'ACCEPTED' | 'REVOKED' | 'EXPIRED';
  expiresAt?: string;
  createdAt?: string;
}

const EmployeeInvitationsPage: React.FC = () => {
  const [invitations, setInvitations] = useState<Invitation[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [sending, setSending] = useState<boolean>(false);
  const [email, setEmail] = useState<string>('');
  const [fullName, setFullName] = useState<string>('');
  const [companyName, setCompanyName] = useState<string>('');
  const [showLink, setShowLink] = useState<boolean>(false);
  const [linkUrl, setLinkUrl] = useState<string>('');

  const token = typeof window !== 'undefined' ? (localStorage.getItem('token') || '') : '';
  const appOrigin = typeof window !== 'undefined' ? window.location.origin : 'http://localhost:5173';

  const loadInvites = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API_CONFIG.baseUrl}/invitations/list`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      if (res.ok) {
        const rows = Array.isArray(data) ? data : [];
        const onlyCustomers = rows.filter((inv: Invitation) => String(inv.role || '').toUpperCase() === 'CUSTOMER');
        setInvitations(onlyCustomers);
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadInvites();
  }, []);

  const createCustomerInvite = async () => {
    if (!email) return;
    setSending(true);
    try {
      const res = await fetch(`${API_CONFIG.baseUrl}/invitations/customer/create`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ email, fullName: fullName || undefined, companyName: companyName || undefined })
      });
      const data = await res.json();
      if (!res.ok) {
        alert(data?.message || 'Failed to send invite');
        return;
      }
      setEmail('');
      setFullName('');
      setCompanyName('');
      await loadInvites();
    } finally {
      setSending(false);
    }
  };

  const revokeInvite = async (id: string) => {
    const res = await fetch(`${API_CONFIG.baseUrl}/invitations/revoke/${id}`, {
      method: 'POST'
    });
    if (res.ok) {
      await loadInvites();
    } else {
      alert('Failed to revoke invite');
    }
  };

  const resendInvite = async (id: string) => {
    const res = await fetch(`${API_CONFIG.baseUrl}/invitations/resend/${id}`, {
      method: 'POST'
    });
    const data = await res.json();
    if (!res.ok || !data?.token) {
      alert(data?.message || 'Failed to resend invite');
      return;
    }
    const url = `${appOrigin}/accept-invite/${data.token}`;
    setLinkUrl(url);
    setShowLink(true);
  };

  return (
    <div className="p-4 md:p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold">Customer Invitations</h1>
        <Button onClick={loadInvites} variant="outline" disabled={loading}>{loading ? 'Refreshing…' : 'Refresh'}</Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Send Customer Invite</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <div>
              <Label htmlFor="email">Email</Label>
              <Input id="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="customer@example.com" />
            </div>
            <div>
              <Label htmlFor="fullName">Full Name (optional)</Label>
              <Input id="fullName" value={fullName} onChange={(e) => setFullName(e.target.value)} placeholder="Jane Doe" />
            </div>
            <div>
              <Label htmlFor="companyName">Company (optional)</Label>
              <Input id="companyName" value={companyName} onChange={(e) => setCompanyName(e.target.value)} placeholder="Acme Inc." />
            </div>
          </div>
          <div className="mt-3">
            <Button onClick={createCustomerInvite} disabled={!email || sending}>{sending ? 'Sending…' : 'Send Invite'}</Button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Customer Invitations</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left border-b">
                  <th className="py-2 pr-2">Email</th>
                  <th className="py-2 pr-2">Status</th>
                  <th className="py-2 pr-2">Expires</th>
                  <th className="py-2 pr-2">Actions</th>
                </tr>
              </thead>
              <tbody>
                {invitations.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="py-4 text-slate-500">No invitations found.</td>
                  </tr>
                ) : (
                  invitations.map((inv) => (
                    <tr key={inv.id} className="border-b">
                      <td className="py-2 pr-2">{inv.email}</td>
                      <td className="py-2 pr-2">
                        <Badge variant={inv.status === 'PENDING' ? 'default' : inv.status === 'ACCEPTED' ? 'secondary' : 'outline'}>
                          {String(inv.status || '').toLowerCase()}
                        </Badge>
                      </td>
                      <td className="py-2 pr-2">{inv.expiresAt ? new Date(inv.expiresAt).toLocaleString() : '—'}</td>
                      <td className="py-2 pr-2 space-x-2">
                        {inv.status === 'PENDING' ? (
                          <>
                            <Button variant="outline" size="sm" onClick={() => resendInvite(inv.id)}>Resend Link</Button>
                            <Button variant="destructive" size="sm" onClick={() => revokeInvite(inv.id)}>Revoke</Button>
                          </>
                        ) : (
                          <span className="text-slate-400">—</span>
                        )}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      <Dialog open={showLink} onOpenChange={setShowLink}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Invitation Link</DialogTitle>
          </DialogHeader>
          <div className="space-y-2">
            <div className="text-sm text-slate-600">Share this link with the customer to accept the invite:</div>
            <Input readOnly value={linkUrl} onFocus={(e) => e.currentTarget.select()} />
            <div>
              <Button onClick={() => { navigator.clipboard.writeText(linkUrl); }}>Copy</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default EmployeeInvitationsPage;

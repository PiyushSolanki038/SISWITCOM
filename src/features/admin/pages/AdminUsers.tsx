import React, { useEffect, useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { API_CONFIG } from '@/config/api';
import { useAuth } from '@/context/AuthContext';

const AdminUsersPage: React.FC = () => {
  const { user } = useAuth();
  const [email, setEmail] = useState('');
  const [invitations, setInvitations] = useState<any[]>([]);
  const tenantId = user?.id;
  const createdById = user?.id;

  const loadInvites = async () => {
    const token = localStorage.getItem('token') || '';
    const res = await fetch(`${API_CONFIG.baseUrl}/invitations/list`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    const data = await res.json();
    if (res.ok) setInvitations(data);
  };

  useEffect(() => {
    loadInvites();
  }, []);

  const inviteAdmin = async () => {
    if (!email) return;
    const token = localStorage.getItem('token') || '';
    const res = await fetch(`${API_CONFIG.baseUrl}/invitations/admin/create`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      body: JSON.stringify({ email })
    });
    if (res.ok) {
      setEmail('');
      loadInvites();
    }
  };

  const revoke = async (id: string) => {
    const res = await fetch(`${API_CONFIG.baseUrl}/invitations/revoke/${id}`, { method: 'POST' });
    if (res.ok) loadInvites();
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Invite Admin</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <Input placeholder="Admin email" value={email} onChange={(e) => setEmail(e.target.value)} />
          <Button onClick={inviteAdmin} disabled={!email}>Send Invite</Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Invitations</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {invitations.map((inv) => (
              <div key={inv.id} className="flex items-center justify-between border rounded p-2">
                <div>
                  <p className="text-sm">{inv.email} — {inv.role} — {inv.status}</p>
                  <p className="text-xs text-slate-500">Expires: {new Date(inv.expiresAt).toLocaleString()}</p>
                </div>
                {inv.status === 'PENDING' && (
                  <Button variant="outline" size="sm" onClick={() => revoke(inv.id)}>Revoke</Button>
                )}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminUsersPage;

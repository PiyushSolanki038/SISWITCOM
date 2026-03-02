import React, { useEffect, useState } from 'react';
import { Input } from '@/components/ui/input';
import { API_CONFIG } from '@/config/api';
import { useAuth } from '@/context/AuthContext';
import { toast } from 'sonner';
import NotificationBell from '@/components/common/NotificationBell';
import ChatWidget from '@/components/common/ChatWidget';

type Invitation = {
  id: string;
  email: string;
  role: 'ADMIN' | 'OWNER' | 'EMPLOYEE' | 'CUSTOMER';
  status: string;
  expiresAt: string;
};

const TeamPage: React.FC = () => {
  const { user } = useAuth();
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [search, setSearch] = useState('');
  const [invitations, setInvitations] = useState<Invitation[]>([]);
  const [loading, setLoading] = useState(false);
  const [resendId, setResendId] = useState<string | null>(null);
  const tenantId = user?.id;
  const createdById = user?.id;

  const loadInvites = async () => {
    const token = localStorage.getItem('token') || '';
    const res = await fetch(`${API_CONFIG.baseUrl}/invitations/list`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    const data = await res.json();
    if (res.ok) setInvitations(data as Invitation[]);
  };

  useEffect(() => {
    loadInvites();
  }, []);

  const inviteAdminEmail = async () => {
    if (!email) return;
    setLoading(true);
    const token = localStorage.getItem('token') || '';
    const res = await fetch(`${API_CONFIG.baseUrl}/invitations/admin/create`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      body: JSON.stringify({ email, fullName })
    });
    setLoading(false);
    if (res.ok) {
      setEmail('');
      setFullName('');
      loadInvites();
    }
  };

  const formatWhatsappNumber = (raw?: string) => {
    if (!raw) return '';
    const digits = (raw.match(/\d+/g) || []).join('');
    if (digits.startsWith('0')) return digits.substring(1);
    if (digits.length === 10) return `91${digits}`;
    return digits;
  };

  const sendWhatsappInvite = async () => {
    const num = formatWhatsappNumber(phone);
    if (!num || !email || !fullName) return;
    setLoading(true);
    // Create admin invitation to get token
    const authToken = localStorage.getItem('token') || '';
    const res = await fetch(`${API_CONFIG.baseUrl}/invitations/admin/create`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${authToken}` },
      body: JSON.stringify({ email, fullName })
    });
    setLoading(false);
    if (!res.ok) return;
    const data = await res.json() as { token?: string };
    const inviteToken = data?.token;
    const acceptUrl = inviteToken ? `${window.location.origin}/accept-invite/${inviteToken}` : `${window.location.origin}/signin`;
    const firstName = (fullName || '').trim().split(/\s+/)[0] || 'there';
    const msg = [
      `Hi ${firstName}, you are invited as ADMIN to SISWIT.`,
      `Name: ${fullName}`,
      `Use this link to accept: ${acceptUrl}`,
      `Email: ${email}`
    ].join(' ');
    const url = `https://wa.me/${num}?text=${encodeURIComponent(msg)}`;
    window.open(url, '_blank');
    setEmail('');
    setFullName('');
  };

  const revoke = async (id: string) => {
    const res = await fetch(`${API_CONFIG.baseUrl}/invitations/revoke/${id}`, { method: 'POST' });
    if (res.ok) loadInvites();
  };

  const copyInviteLink = async (id: string) => {
    try {
      const res = await fetch(`${API_CONFIG.baseUrl}/invitations/resend/${id}`, { method: 'POST' });
      if (!res.ok) {
        toast.error('Failed to generate invite link');
        return;
      }
      const data = await res.json() as { token?: string };
      const token = data?.token;
      if (!token) {
        toast.error('No token received');
        return;
      }
      const acceptUrl = `${window.location.origin}/accept-invite/${token}`;
      await navigator.clipboard.writeText(acceptUrl);
      toast.success('Invite link copied to clipboard');
    } catch {
      toast.error('Error copying invite link');
    }
  };

  const resendEmail = async (id: string) => {
    try {
      setResendId(id);
      const res = await fetch(`${API_CONFIG.baseUrl}/invitations/resend-email/${id}`, { method: 'POST' });
      if (!res.ok) {
        toast.error('Failed to resend email');
        setResendId(null);
        return;
      }
      toast.success('Invitation email resent');
      await loadInvites();
    } catch {
      toast.error('Error resending email');
    } finally {
      setResendId(null);
    }
  };

  return (
    <>
      <div className="od-topstrip">
        <div className="od-breadcrumb">SISWIT &nbsp;/&nbsp; <span>Team</span></div>
        <div className="od-topstrip-right"><NotificationBell /><ChatWidget /><button className="od-btn-ghost" onClick={loadInvites}>Refresh</button><button className="od-btn-ink" onClick={inviteAdminEmail} disabled={loading || !email || !fullName}>Send Email Invite</button></div>
      </div>

      <div className="od-content">
        <div className="od-panel">
          <div className="od-panel-head">
            <div>
              <div className="od-panel-title">Invite Admin</div>
              <div className="od-panel-subtitle">Send an email or WhatsApp invite</div>
            </div>
          </div>
          <div className="space-y-3">
            <Input className="bg-white border-black/10 text-[#0F172A]" placeholder="Admin full name" value={fullName} onChange={(e) => setFullName(e.target.value)} />
            <Input className="bg-white border-black/10 text-[#0F172A]" placeholder="Admin email" value={email} onChange={(e) => setEmail(e.target.value)} />
            <div className="flex items-center gap-2">
              <Input className="bg-white border-black/10 text-[#0F172A]" placeholder="WhatsApp number (optional)" value={phone} onChange={(e) => setPhone(e.target.value)} />
              <button className="od-btn-ghost" onClick={sendWhatsappInvite} disabled={!phone}>Send WhatsApp</button>
            </div>
          </div>
        </div>

        <div className="od-panel">
          <div className="od-panel-head">
            <div>
              <div className="od-panel-title">Admin Invitations</div>
              <div className="od-panel-subtitle">Pending and sent invites</div>
            </div>
          </div>
          <div className="mb-3">
            <Input className="bg-white border-black/10 text-[#0F172A]" placeholder="Search by email or status..." value={search} onChange={(e) => setSearch(e.target.value)} />
          </div>
          <table className="od-tbl">
            <thead>
              <tr>
                <th>Email</th>
                <th>Role</th>
                <th>Status</th>
                <th>Expires</th>
                <th style={{ textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {invitations
                .filter((inv) => inv.role === 'ADMIN')
                .filter((inv) => {
                  const s = search.toLowerCase();
                  return !s || inv.email.toLowerCase().includes(s) || inv.status.toLowerCase().includes(s);
                })
                .map((inv) => (
                <tr key={inv.id}>
                  <td><strong>{inv.email}</strong></td>
                  <td>{inv.role}</td>
                  <td>{inv.status}</td>
                  <td style={{ color: 'var(--muted)', fontSize: '12px' }}>{new Date(inv.expiresAt).toLocaleString()}</td>
                  <td style={{ textAlign: 'right' }}>
                    {inv.status === 'PENDING' && (
                      <div className="flex justify-end gap-2">
                        <button className="od-cta-btn ghost" onClick={() => revoke(inv.id)}>Revoke</button>
                        <button className="od-cta-btn" disabled={resendId === inv.id} onClick={() => resendEmail(inv.id)}>{resendId === inv.id ? 'Sending…' : 'Resend Email'}</button>
                        <button className="od-cta-btn ghost" onClick={() => copyInviteLink(inv.id)}>Copy Link</button>
                      </div>
                    )}
                  </td>
                </tr>
              ))}
              {invitations.filter((i) => i.role === 'ADMIN').length === 0 && (
                <tr>
                  <td colSpan={5}><div className="od-empty">No invitations found</div></td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
};

export default TeamPage;

import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/components/ui/use-toast';
import { API_CONFIG } from '@/config/api';
import { useAuth } from '@/context/AuthContext';

const AcceptInvite: React.FC = () => {
  const { token } = useParams();
  const navigate = useNavigate();
  const { login } = useAuth();
  const [status, setStatus] = useState<'loading' | 'valid' | 'invalid' | 'accepted'>('loading');
  const [email, setEmail] = useState<string>('');
  const [role, setRole] = useState<string>('');
  const [open, setOpen] = useState(false);
  const [pw1, setPw1] = useState('');
  const [pw2, setPw2] = useState('');
  const { toast } = useToast();
  useEffect(() => {
    (async () => {
      if (!token) return;
      const res = await fetch(`${API_CONFIG.baseUrl}/invitations/validate/${token}`);
      const data = await res.json();
      if (res.ok && data.valid) {
        setEmail(data.invitation.email);
        setRole(data.invitation.role);
        setStatus('valid');
      } else {
        setStatus('invalid');
      }
    })();
  }, [token]);

  const accept = async () => {
    if (!token) return;
    const res = await fetch(`${API_CONFIG.baseUrl}/invitations/accept/${token}`, { method: 'POST' });
    if (res.ok) {
      const data = await res.json();
      setEmail(data.email);
      setRole(data.role);
      setStatus('accepted');
      setOpen(true);
    }
  };

  const submitPassword = async () => {
    if (!token) return;
    if (!pw1 || pw1.length < 8) {
      toast({ title: 'Password too short', description: 'Use at least 8 characters' });
      return;
    }
    if (pw1 !== pw2) {
      toast({ title: 'Passwords do not match', description: 'Enter the same password twice' });
      return;
    }
    const res = await fetch(`${API_CONFIG.baseUrl}/invitations/set-password/${token}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ password: pw1 })
    });
    if (res.ok) {
      // login using the invited role
      try {
        const r = (role || '').toLowerCase();
        await login(email, pw1, (r || 'customer') as any);
        setOpen(false);
        toast({ title: 'Password set', description: 'Welcome to your dashboard' });
        navigate('/customer-dashboard', { replace: true });
      } catch {
        toast({ title: 'Login failed', description: 'Try signing in manually' });
        navigate('/signin', { replace: true });
      }
    } else {
      toast({ title: 'Failed to set password', description: 'Please try again' });
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 p-6">
      <Card className="max-w-md w-full">
        <CardHeader>
          <CardTitle>Accept Invitation</CardTitle>
        </CardHeader>
        <CardContent>
          {status === 'loading' && <p>Validating invitation…</p>}
          {status === 'invalid' && <p className="text-red-600">Invitation is invalid or expired.</p>}
          {status === 'valid' && (
            <div className="space-y-3">
              <p>Invite for: <strong>{email}</strong></p>
              <p>Role: <strong>{role}</strong></p>
              <Button onClick={accept} className="w-full">Accept Invitation</Button>
            </div>
          )}
          {status === 'accepted' && <p className="text-green-600">Invitation accepted. Redirecting…</p>}
        </CardContent>
      </Card>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Set Your Password</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="pw1">Password</Label>
              <Input id="pw1" type="password" value={pw1} onChange={(e) => setPw1(e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="pw2">Confirm Password</Label>
              <Input id="pw2" type="password" value={pw2} onChange={(e) => setPw2(e.target.value)} />
            </div>
            <Button className="w-full" onClick={submitPassword}>Save Password</Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AcceptInvite;

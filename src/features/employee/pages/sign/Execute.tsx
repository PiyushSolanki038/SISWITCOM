import React, { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { clmService } from '@/features/employee/services/clmService';
import { toast } from 'sonner';
import { Contract, PublicSignSessionResponse } from '@/features/employee/pages/clm/types';

const SignExecute: React.FC = () => {
  const [params] = useSearchParams();
  const token = params.get('token') || '';
  const [loading, setLoading] = useState(true);
  const [session, setSession] = useState<PublicSignSessionResponse['session'] | null>(null);
  const [contract, setContract] = useState<Contract | null>(null);
  const [signing, setSigning] = useState(false);
  const [signature, setSignature] = useState('');

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const data: PublicSignSessionResponse = await clmService.getPublicSignSession(token);
        setSession(data.session || null);
        setContract(data.contract || null);
      } catch (e) {
        console.error(e);
        toast.error('Invalid or expired signing link');
      } finally {
        setLoading(false);
      }
    };
    if (token) load();
  }, [token]);

  const handleSign = async () => {
    try {
      setSigning(true);
      if (!signature || signature.trim().length < 2) {
        toast.error('Please type your full name as signature');
        return;
      }
      await clmService.publicSign(token, `Signature: ${signature}`);
      toast.success('Signed successfully');
      if (session) setSession({ ...session, status: 'signed' });
    } catch (e) {
      console.error(e);
      toast.error('Failed to sign');
    } finally {
      setSigning(false);
    }
  };

  const handleDecline = async () => {
    try {
      setSigning(true);
      await clmService.publicDecline(token);
      toast.success('Declined successfully');
      if (session) setSession({ ...session, status: 'declined' });
    } catch (e) {
      console.error(e);
      toast.error('Failed to decline');
    } finally {
      setSigning(false);
    }
  };

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <h1 className="text-3xl font-bold mb-2 text-[#1A3C34]">Contract Signing</h1>
      <p className="text-slate-500 mb-6">Review the contract and sign to proceed. This link is single-use and may expire.</p>
      {loading ? (
        <p>Loading...</p>
      ) : !session ? (
        <p className="text-red-600">Invalid or expired link.</p>
      ) : (
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-[#1A3C34]">{contract?.name}</CardTitle>
              <CardDescription>Contract #{contract?.contract_number} • Signer: {session?.signerName} ({session?.signerEmail})</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2">
                  <h2 className="text-lg font-semibold mb-2">Terms</h2>
                  <div className="rounded border p-4 whitespace-pre-wrap text-sm">
                    {contract?.content || 'No content'}
                  </div>
                </div>
                <div>
                  <div className="rounded border p-4 bg-slate-50">
                    <div className="text-sm text-slate-600">
                      <p><strong>Token:</strong> Single-use</p>
                      <p><strong>Status:</strong> {session?.status}</p>
                      {session?.expiresAt ? <p><strong>Expires:</strong> {new Date(session.expiresAt).toLocaleString()}</p> : null}
                    </div>
                  </div>
                  <div className="mt-4">
                    <label className="text-sm font-medium">Type your full name to sign</label>
                    <Input value={signature} onChange={(e) => setSignature(e.target.value)} placeholder="Full name" className="mt-2" />
                  </div>
                  <div className="mt-4 flex gap-2">
                    <Button className="bg-[#1A3C34] text-white" onClick={handleSign} disabled={signing || session?.status === 'signed'}>
                      Sign
                    </Button>
                    <Button variant="outline" onClick={handleDecline} disabled={signing || session?.status === 'declined'}>
                      Decline
                    </Button>
                  </div>
                  <p className="text-xs text-slate-500 mt-2">By clicking Sign, you agree to the terms stated above.</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <div className="text-center text-xs text-slate-500">© {new Date().getFullYear()} SISWIT • This action is logged for audit purposes.</div>
        </div>
      )}
    </div>
  );
};

export default SignExecute;

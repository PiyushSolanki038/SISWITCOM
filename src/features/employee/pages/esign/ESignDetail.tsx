import React, { useEffect, useMemo, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, 
  FileText, 
  Users, 
  History, 
  Clock, 
  CheckCircle2, 
  MoreHorizontal,
  Download,
  Share2,
  AlertCircle,
  MapPin,
  Globe,
  Eye,
  Send,
  Trash2,
  Ban,
  Bell
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Separator } from '@/components/ui/separator';
import { ESignRequest } from './types';
import { clmService } from '@/features/employee/services/clmService';
import type { ContractSignatureRequest, Contract, ContractSigner, ContractAuditLog } from '@/features/employee/pages/clm/types';

const mapToRequest = (sig: ContractSignatureRequest, contract?: Contract, audit?: ContractAuditLog[]): ESignRequest => {
  const signers: ContractSigner[] = Array.isArray(contract?.signers) ? (contract?.signers as unknown as ContractSigner[]) : [];
  return {
    id: sig.id,
    subject: contract?.name || 'Signature Request',
    status: sig.status,
    message: `Signature request for ${contract?.name || 'contract'}`,
    created: new Date(sig.createdAt).toLocaleString(),
    lastUpdate: new Date(sig.updatedAt).toLocaleString(),
    sender: sig.signerName || 'Unknown',
    recipients: [sig.signerEmail],
    documents: [],
    signers: signers.map((s, idx) => ({
      order: s.sign_order || idx + 1,
      name: s.name,
      email: s.email,
      role: 'Signer',
      status: (s.status === 'signed' ? 'completed' : 'pending'),
      completedAt: s.signed_at ? new Date(s.signed_at as string).toLocaleString() : null
    })),
    auditTrail: (audit || []).map((a, i) => ({
      id: i + 1,
      action: a.action,
      user: a.performed_by,
      timestamp: new Date(a.created_at).toLocaleString(),
      ip: '—',
      location: ''
    }))
  };
};

const ESignDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('documents');
  const [loading, setLoading] = useState(false);
  const [request, setRequest] = useState<ESignRequest | null>(null);

  useEffect(() => {
    let mounted = true;
    const load = async () => {
      if (!id) return;
      setLoading(true);
      try {
        const sig = await clmService.getSignature(id);
        const contract = sig.contract || (sig.contractId ? await clmService.getContract(sig.contractId) : undefined);
        const audit = contract?.id ? await clmService.getContractAuditLogs(contract.id) : [];
        if (mounted) {
          setRequest(mapToRequest(sig, contract, audit));
        }
      } catch (e) {
        console.error('Failed to load e-sign detail', e);
        if (mounted) setRequest(null);
      } finally {
        if (mounted) setLoading(false);
      }
    };
    load();
    return () => { mounted = false; };
  }, [id]);

  const req = request;

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'completed': return <Badge className="bg-green-100 text-green-800 hover:bg-green-200"><CheckCircle2 className="w-3 h-3 mr-1" /> Completed</Badge>;
      case 'signed': return <Badge className="bg-emerald-100 text-emerald-800 hover:bg-emerald-200"><CheckCircle2 className="w-3 h-3 mr-1" /> Signed</Badge>;
      case 'viewed': return <Badge className="bg-blue-100 text-blue-800 hover:bg-blue-200"><Eye className="w-3 h-3 mr-1" /> Viewed</Badge>;
      case 'sent': return <Badge className="bg-indigo-100 text-indigo-800 hover:bg-indigo-200"><Send className="w-3 h-3 mr-1" /> Sent</Badge>;
      case 'pending': return <Badge className="bg-yellow-100 text-yellow-800 hover:bg-yellow-200"><Clock className="w-3 h-3 mr-1" /> Draft</Badge>;
      case 'rejected': return <Badge className="bg-red-100 text-red-800 hover:bg-red-200"><AlertCircle className="w-3 h-3 mr-1" /> Rejected</Badge>;
      case 'expired': return <Badge className="bg-slate-100 text-slate-800 hover:bg-slate-200"><Clock className="w-3 h-3 mr-1" /> Expired</Badge>;
      default: return <Badge variant="outline">{status}</Badge>;
    }
  };

  const renderActions = () => {
    if (!req) return null;
    switch (req.status) {
      case 'pending':
        return (
          <>
            <Button variant="outline" className="text-red-600 hover:text-red-700 hover:bg-red-50">
              <Trash2 className="w-4 h-4 mr-2" />
              Delete Draft
            </Button>
            <Button className="bg-[#1A3C34] text-white hover:bg-[#1A3C34]/90">
              <Send className="w-4 h-4 mr-2" />
              Send Request
            </Button>
          </>
        );
      case 'sent':
      case 'viewed':
        return (
          <>
             <Button variant="outline">
              <Ban className="w-4 h-4 mr-2" />
              Void Request
            </Button>
            <Button className="bg-[#1A3C34] text-white hover:bg-[#1A3C34]/90">
              <Bell className="w-4 h-4 mr-2" />
              Send Reminder
            </Button>
          </>
        );
      case 'completed':
      case 'signed':
        return (
          <Button className="bg-emerald-600 text-white hover:bg-emerald-700">
            <Download className="w-4 h-4 mr-2" />
            Download Signed Copy
          </Button>
        );
      default:
        return null;
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="text-center text-slate-500 py-10">Loading...</div>
      </div>
    );
  }

  if (!req) {
    return (
      <div className="space-y-6">
        <div className="text-center text-slate-500 py-10">Request not found.</div>
        <div className="flex justify-center">
          <Button variant="outline" onClick={() => navigate('/employee-dashboard/esign')}>
            <ArrowLeft className="w-4 h-4 mr-2" /> Back
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => navigate('/employee-dashboard/esign')}>
            <ArrowLeft className="w-4 h-4" />
          </Button>
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-xl font-bold text-[#1A3C34]">{req.subject}</h1>
              {getStatusBadge(req.status)}
            </div>
            <div className="text-sm text-slate-500 mt-1">
              Request ID: {req.id} • Created {req.created}
            </div>
          </div>
        </div>
        <div className="flex gap-2">
          {renderActions()}
          <Button variant="ghost" size="icon">
            <MoreHorizontal className="w-4 h-4" />
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
           <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="w-full justify-start">
              <TabsTrigger value="documents">Documents</TabsTrigger>
              <TabsTrigger value="audit">Audit Trail</TabsTrigger>
            </TabsList>
            
            <TabsContent value="documents" className="mt-4">
              <Card>
                <CardHeader>
                  <CardTitle>Documents</CardTitle>
                  <CardDescription>Files included in this signature request</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {req.documents?.map((doc) => (
                    <div key={doc.id} className="flex items-center justify-between p-4 border rounded-lg bg-slate-50">
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-white rounded border">
                          <FileText className="w-5 h-5 text-[#1A3C34]" />
                        </div>
                        <div>
                          <div className="font-medium">{doc.name}</div>
                          <div className="text-xs text-slate-500">{doc.pages} pages</div>
                        </div>
                      </div>
                      <Button variant="ghost" size="sm">View</Button>
                    </div>
                  ))}
                  <div className="h-[400px] bg-slate-100 rounded-lg flex items-center justify-center border-2 border-dashed border-slate-300 mt-4">
                    <div className="text-center text-slate-500">
                      <FileText className="w-12 h-12 mx-auto mb-2 opacity-50" />
                      <p>Document Preview Placeholder</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="audit" className="mt-4">
              <Card>
                <CardHeader>
                  <CardTitle>Audit Trail</CardTitle>
                  <CardDescription>Complete history of this request</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="relative border-l-2 border-slate-200 ml-3 space-y-8 py-2">
                  {req.auditTrail?.map((log, index) => (
                      <div key={log.id} className="relative pl-8">
                        <div className="absolute -left-[9px] top-0 w-4 h-4 rounded-full border-2 border-white bg-[#1A3C34]" />
                        <div className="flex flex-col gap-1">
                          <span className="font-medium text-sm text-[#1A3C34]">{log.action}</span>
                          <div className="flex items-center gap-2 text-xs text-slate-500">
                            <Clock className="w-3 h-3" />
                            {log.timestamp}
                          </div>
                          <div className="flex items-center gap-2 text-xs text-slate-500">
                            <Users className="w-3 h-3" />
                            {log.user}
                          </div>
                          <div className="flex items-center gap-2 text-xs text-slate-500">
                            <Globe className="w-3 h-3" />
                            IP: {log.ip} ({log.location})
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Signers</CardTitle>
              <CardDescription>Signing order and status</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {req.signers?.map((signer, index) => (
                <div key={index} className="flex gap-3">
                  <div className="flex flex-col items-center">
                    <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
                      signer.status === 'completed' ? 'bg-green-100 text-green-700' : 'bg-slate-100 text-slate-700'
                    }`}>
                      {signer.order}
                    </div>
                    {index < (request.signers?.length || 0) - 1 && <div className="w-px h-full bg-slate-200 my-1" />}
                  </div>
                  <div className="flex-1 pb-4">
                    <div className="font-medium text-sm">{signer.name}</div>
                    <div className="text-xs text-slate-500">{signer.email}</div>
                    <div className="flex items-center gap-2 mt-1">
                      <Badge variant="secondary" className="text-[10px] h-5">{signer.role}</Badge>
                      {signer.status === 'completed' && (
                        <span className="text-[10px] text-green-600 flex items-center">
                          <CheckCircle2 className="w-3 h-3 mr-1" /> Signed
                        </span>
                      )}
                      {signer.status === 'pending' && (
                        <span className="text-[10px] text-yellow-600 flex items-center">
                          <Clock className="w-3 h-3 mr-1" /> Pending
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Message</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-slate-600 bg-slate-50 p-3 rounded border">
                "{req.message}"
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default ESignDetail;

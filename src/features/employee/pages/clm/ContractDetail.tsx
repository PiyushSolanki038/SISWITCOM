import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, 
  FileText, 
  History, 
  MessageSquare, 
  PenTool, 
  CheckCircle2,
  FileCheck,
  Download,
  Calendar,
  Send,
  Lock,
  RefreshCw,
  Ban,
  Upload,
  User,
  Mail,
  AlertTriangle
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Skeleton } from "@/components/ui/skeleton";
import { Contract, ContractAuditLog, ContractSigner, ContractStatus } from './types';
import { erpService } from '../../erp/erpService';
import { clmService } from '@/features/employee/services/clmService';
import { toast } from 'sonner';
// @ts-ignore
import html2pdf from 'html2pdf.js';

const ContractDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);

  // Modal States
  const [isSendModalOpen, setIsSendModalOpen] = useState(false);
  const [isTerminateModalOpen, setIsTerminateModalOpen] = useState(false);
  const [isCreateOrderModalOpen, setIsCreateOrderModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  
  // Form States
  const [signerName, setSignerName] = useState('');
  const [signerEmail, setSignerEmail] = useState('');
  const [terminateReason, setTerminateReason] = useState('');
  const [editTitle, setEditTitle] = useState('');
  const [editStartDate, setEditStartDate] = useState('');
  const [editEndDate, setEditEndDate] = useState('');
  const [editValue, setEditValue] = useState<number | ''>('');
  const [editCurrency, setEditCurrency] = useState('USD');
  const [editContent, setEditContent] = useState('');
  const [uploadNote, setUploadNote] = useState('');
  const [uploadFile, setUploadFile] = useState<File | null>(null);

  const [contract, setContract] = useState<Contract | null>(null);
  const [auditLogs, setAuditLogs] = useState<ContractAuditLog[]>([]);
  const [signers, setSigners] = useState<ContractSigner[]>([]);
  const [versions, setVersions] = useState<any[]>([]);

  useEffect(() => {
    const fetchContract = async () => {
      if (!id) return;
      if (id === 'new') {
        navigate('/employee-dashboard/clm/contracts/new', { replace: true });
        return;
      }
      setLoading(true);
      try {
        const data = await clmService.getContract(id);
        setContract(data);
        // Assuming backend returns signers in the contract object or we need separate endpoint
        // For now, if signers are in contract, use them
        if (data.signers) {
             setSigners(data.signers);
        }
      } catch (error) {
        console.error("Failed to load contract", error);
        toast.error("Failed to load contract");
      } finally {
        setLoading(false);
      }
    };
    fetchContract();
  }, [id]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-emerald-50 text-emerald-700 border-emerald-100';
      case 'signed': return 'bg-blue-50 text-blue-700 border-blue-100';
      case 'sent_for_signature': return 'bg-indigo-50 text-indigo-700 border-indigo-100';
      case 'in_review': return 'bg-amber-50 text-amber-700 border-amber-100';
      case 'draft': return 'bg-slate-50 text-slate-700 border-slate-100';
      case 'expired': return 'bg-red-50 text-red-700 border-red-100';
      case 'terminated': return 'bg-gray-50 text-gray-700 border-gray-100';
      default: return 'bg-slate-50 text-slate-700 border-slate-100';
    }
  };

  const handleAction = (action: string) => {
    console.log(`Performing action: ${action}`);
    if (action === 'send_for_signature') {
      setIsSendModalOpen(true);
    } else if (action === 'terminate') {
      setIsTerminateModalOpen(true);
    } else if (action === 'create_order') {
      setIsCreateOrderModalOpen(true);
    } else if (action === 'edit') {
      if (!contract) return;
      setEditTitle(contract.name || '');
      setEditStartDate(contract.start_date || '');
      setEditEndDate(contract.end_date || '');
      setEditValue(contract.contract_value ?? '');
      setEditCurrency(contract.currency || 'USD');
      setEditContent(contract.content || '');
      setIsEditModalOpen(true);
    } else if (action === 'upload_version') {
      setUploadNote('');
      setUploadFile(null);
      setIsUploadModalOpen(true);
    }
    // In real app, this would call API and update state
  };

  const submitCreateOrder = async () => {
    if (!contract) return;
    try {
      // Create order from contract
      const orderData = {
        contractId: contract.id,
        accountId: contract.account_id, // Use ID directly if it's a string ID
        // Note: erpService expects accountId string, but backend might want object. 
        // Need to check ERPOrder type. Assuming string for now based on typical linking.
        // items...
        items: [
          {
            productId: 'prod-1', // Placeholder
            name: contract.name,
            quantity: 1,
            unitPrice: contract.contract_value,
            total: contract.contract_value
          }
        ],
        subtotal: contract.contract_value,
        taxTotal: contract.contract_value * 0.1, // 10% tax
        grandTotal: contract.contract_value * 1.1,
        currency: 'USD',
        status: 'draft',
        paymentStatus: 'unpaid',
        fulfillmentStatus: 'pending'
      };
      
      await erpService.createOrder(orderData);
      
      toast.success("Order created successfully");
      setIsCreateOrderModalOpen(false);
      navigate('/employee-dashboard/erp/orders');
    } catch (error) {
      console.error("Failed to create order", error);
      toast.error("Failed to create order");
    }
  };

  const submitSendForSignature = async () => {
    if (!contract) return;
    try {
        const signersList = [{
            name: signerName,
            email: signerEmail,
            role: 'client'
        }];
        
        const updatedContract = await clmService.sendForSignature(contract.id, signersList);
        setContract(updatedContract);
        toast.success("Sent for signature successfully");
        setIsSendModalOpen(false);
    } catch (error) {
        console.error("Failed to send for signature", error);
        toast.error("Failed to send for signature");
    }
  };

  const submitTerminate = () => {
    // Implement termination logic if needed via API
    setIsTerminateModalOpen(false);
  };

  const handleDownloadPDF = () => {
    const element = document.getElementById('contract-content');
    if (!element) return;
    
    const opt = {
      margin:       1,
      filename:     `${contract?.contract_number || 'contract'}.pdf`,
      image:        { type: 'jpeg', quality: 0.98 },
      html2canvas:  { scale: 2 },
      jsPDF:        { unit: 'in', format: 'letter', orientation: 'portrait' }
    };
    
    // @ts-ignore
    html2pdf().set(opt).from(element).save();
  };

  if (loading || !contract) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
                 <Skeleton className="h-10 w-10 rounded-full" />
                 <div className="space-y-2">
                    <Skeleton className="h-8 w-48" />
                    <Skeleton className="h-4 w-32" />
                 </div>
            </div>
            <div className="flex gap-2">
                <Skeleton className="h-10 w-24" />
                <Skeleton className="h-10 w-24" />
            </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="md:col-span-2 space-y-6">
                 <Skeleton className="h-[200px] w-full rounded-lg" />
                 <Skeleton className="h-[300px] w-full rounded-lg" />
            </div>
            <div className="space-y-6">
                <Skeleton className="h-[150px] w-full rounded-lg" />
                <Skeleton className="h-[150px] w-full rounded-lg" />
            </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => navigate('/employee-dashboard/clm/contracts')}>
            <ArrowLeft className="w-4 h-4" />
          </Button>
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-2xl font-bold text-[#1A3C34]">{contract.name}</h1>
              <Badge variant="secondary" className={`capitalize ${getStatusColor(contract.status)}`}>
                {contract.status.replace(/_/g, ' ')}
              </Badge>
            </div>
            <p className="text-slate-500">{contract.contract_number} • {contract.customer_name}</p>
          </div>
        </div>
        
        {/* Lifecycle Actions */}
        <div className="flex gap-2">
          {contract.status === 'draft' && (
            <>
              <Button variant="outline" onClick={() => handleAction('upload_version')}>
                <Upload className="w-4 h-4 mr-2" />
                Upload Version
              </Button>
              <Button className="bg-[#1A3C34] text-white" onClick={() => handleAction('edit')}>
                <PenTool className="w-4 h-4 mr-2" />
                Edit
              </Button>
            </>
          )}
          {contract.status === 'in_review' && (
            <>
              <Button variant="outline">
                <MessageSquare className="w-4 h-4 mr-2" />
                Internal Comments
              </Button>
              <Button className="bg-indigo-600 text-white hover:bg-indigo-700" onClick={() => handleAction('send_for_signature')}>
                <Send className="w-4 h-4 mr-2" />
                Send for Signature
              </Button>
            </>
          )}
          {contract.status === 'sent_for_signature' && (
            <Button variant="outline" disabled>
              <Lock className="w-4 h-4 mr-2" />
              Awaiting Signatures
            </Button>
          )}
          {contract.status === 'signed' && (
            <>
              <Button className="bg-blue-600 text-white hover:bg-blue-700" onClick={() => handleAction('create_order')}>
                <ShoppingCart className="w-4 h-4 mr-2" />
                Create Order
              </Button>
              <Button className="bg-emerald-600 text-white hover:bg-emerald-700" onClick={() => handleAction('activate')}>
                <CheckCircle2 className="w-4 h-4 mr-2" />
                Activate Contract
              </Button>
            </>
          )}
          {contract.status === 'active' && (
            <>
              <Button variant="outline" className="text-red-600 hover:bg-red-50" onClick={() => handleAction('terminate')}>
                <Ban className="w-4 h-4 mr-2" />
                Terminate
              </Button>
              <Button variant="outline" disabled>
                <CheckCircle2 className="w-4 h-4 mr-2" />
                Active
              </Button>
            </>
          )}
          {contract.status === 'expired' && (
            <Button className="bg-blue-600 text-white hover:bg-blue-700" onClick={() => handleAction('renew')}>
              <RefreshCw className="w-4 h-4 mr-2" />
              Renew Contract
            </Button>
          )}
          {contract.status === 'terminated' && (
            <Button variant="outline" disabled className="text-red-600 border-red-200 bg-red-50">
              <Ban className="w-4 h-4 mr-2" />
              Terminated
            </Button>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Overview & Document */}
        <div className="lg:col-span-2 space-y-6">
          {/* Overview */}
          <Card>
            <CardHeader>
              <CardTitle>Contract Overview</CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div>
                <p className="text-sm text-slate-500">Value</p>
                <p className="font-medium">${contract.contract_value.toLocaleString()}</p>
              </div>
              <div>
                <p className="text-sm text-slate-500">Start Date</p>
                <p className="font-medium">{contract.start_date}</p>
              </div>
              <div>
                <p className="text-sm text-slate-500">End Date</p>
                <p className="font-medium">{contract.end_date}</p>
              </div>
              <div>
                <p className="text-sm text-slate-500">Owner</p>
                <p className="font-medium">{contract.owner_name}</p>
              </div>
               <div>
                <p className="text-sm text-slate-500">Renewal</p>
                <p className="font-medium capitalize">{contract.renewal_type}</p>
              </div>
              <div>
                <p className="text-sm text-slate-500">Type</p>
                <p className="font-medium">{contract.contract_type}</p>
              </div>
            </CardContent>
          </Card>

          {/* Document Viewer & Versions */}
          <Card className="min-h-[500px] flex flex-col">
            <Tabs defaultValue="preview" className="flex-1 flex flex-col">
              <div className="flex items-center justify-between px-6 pt-6">
                <CardTitle>Document</CardTitle>
                <TabsList>
                  <TabsTrigger value="preview">Preview</TabsTrigger>
                  <TabsTrigger value="versions">Versions</TabsTrigger>
                </TabsList>
              </div>
              <Separator className="mt-4" />
              
              <TabsContent value="preview" className="flex-1 m-0">
                <div className="flex-1 min-h-[450px] bg-slate-100 flex items-center justify-center p-8 overflow-auto">
                  <div className="relative group w-full max-w-2xl">
                      <div id="contract-content" className="bg-white shadow-lg w-full min-h-[600px] p-12 flex flex-col gap-4">
                        {contract.content ? (
                            <div dangerouslySetInnerHTML={{ __html: contract.content }} className="prose max-w-none" />
                        ) : (
                            <>
                                <div className="text-center border-b pb-4 mb-4">
                                    <h1 className="text-2xl font-bold">{contract.name}</h1>
                                    <p className="text-sm text-slate-500">{contract.contract_number}</p>
                                </div>
                                <div className="space-y-4 text-sm">
                                    <p><strong>Customer:</strong> {contract.customer_name}</p>
                                    <p><strong>Value:</strong> ${contract.contract_value.toLocaleString()}</p>
                                    <p><strong>Start Date:</strong> {contract.start_date}</p>
                                    <p><strong>End Date:</strong> {contract.end_date}</p>
                                    <div className="mt-8">
                                        <h3 className="font-bold mb-2">Terms and Conditions</h3>
                                        <p className="text-slate-600">
                                            This Master Services Agreement ("Agreement") is made between {contract.owner_name || 'Sirius Infra'} and {contract.customer_name}.
                                            The parties agree to the terms set forth herein...
                                        </p>
                                    </div>
                                </div>
                            </>
                        )}
                         <div className="mt-auto pt-8 border-t flex justify-between items-center text-xs text-slate-400">
                            <span>Page 1 of 1</span>
                            <span>{contract.contract_number}</span>
                         </div>
                      </div>
                      
                      <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity">
                        <Button variant="outline" className="bg-white/80 backdrop-blur-sm shadow-sm" onClick={handleDownloadPDF}>
                           <Download className="w-4 h-4 mr-2" />
                           Download PDF
                        </Button>
                      </div>
                  </div>
                </div>
              </TabsContent>
              
              <TabsContent value="versions" className="m-0 p-6">
                <div className="space-y-4">
                  {versions.map((v) => (
                    <div key={v.id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-slate-50">
                      <div className="flex items-center gap-4">
                        <div className="p-2 bg-slate-100 rounded-lg">
                          <FileText className="w-6 h-6 text-slate-600" />
                        </div>
                        <div>
                          <div className="font-medium">Version {v.version}</div>
                          <div className="text-sm text-slate-500">{v.note} • {v.uploaded_by}</div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-sm text-slate-500">{v.date}</div>
                        <Button variant="ghost" size="sm" className="h-8 mt-1 text-blue-600 hover:text-blue-700">
                          Download
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </TabsContent>
            </Tabs>
          </Card>
        </div>

        {/* Right Column: Activity, Signers, Renewal */}
        <div className="space-y-6">
           {/* Renewal / Expiry View */}
           <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center gap-2">
                <RefreshCw className="w-4 h-4 text-slate-500" />
                Renewal & Expiry
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex justify-between items-center text-sm">
                <span className="text-slate-500">Contract End Date</span>
                <span className="font-medium">{contract.end_date}</span>
              </div>
              <div className="flex justify-between items-center text-sm">
                <span className="text-slate-500">Renewal Type</span>
                <Badge variant="outline">{contract.renewal_type}</Badge>
              </div>
              <div className="flex justify-between items-center text-sm">
                <span className="text-slate-500">Notice Period</span>
                <span className="font-medium">30 Days</span>
              </div>
              <Separator />
              <div className="space-y-2">
                {contract.status === 'active' ? (
                  <>
                     <Button variant="outline" className="w-full justify-start">
                        <Calendar className="w-4 h-4 mr-2" />
                        Set Reminder
                     </Button>
                     <Button 
                       variant="outline" 
                       className="w-full justify-start text-red-600 hover:bg-red-50 hover:text-red-700"
                       onClick={() => handleAction('terminate')}
                     >
                        <Ban className="w-4 h-4 mr-2" />
                        Terminate Contract
                     </Button>
                  </>
                ) : contract.status === 'expired' ? (
                  <Button className="w-full bg-blue-600 hover:bg-blue-700">
                    <RefreshCw className="w-4 h-4 mr-2" />
                    Renew Now
                  </Button>
                ) : (
                  <p className="text-xs text-slate-400 text-center py-2">
                    Renewal options available when active
                  </p>
                )}
              </div>
            </CardContent>
          </Card>

           {/* Signer Status */}
           <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center gap-2">
                <PenTool className="w-4 h-4 text-slate-500" />
                Signatures
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {signers.map(signer => (
                  <div key={signer.id} className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold ${
                        signer.status === 'signed' ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-600'
                      }`}>
                        {signer.name.charAt(0)}
                      </div>
                      <div>
                        <p className="text-sm font-medium">{signer.name}</p>
                        <p className="text-xs text-slate-500">{signer.email}</p>
                      </div>
                    </div>
                    <Badge variant={signer.status === 'signed' ? 'default' : 'outline'} className={signer.status === 'signed' ? 'bg-emerald-600' : ''}>
                      {signer.status}
                    </Badge>
                  </div>
                ))}
                {signers.length === 0 && (
                  <p className="text-sm text-slate-500 text-center py-4">No signers added yet</p>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Audit Timeline */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center gap-2">
                <History className="w-4 h-4 text-slate-500" />
                Activity Log
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-[300px] pr-4">
                <div className="space-y-6">
                  {auditLogs.map((log, index) => (
                    <div key={log.id} className="flex gap-3 relative">
                      {index !== auditLogs.length - 1 && (
                        <div className="absolute left-[15px] top-8 bottom-[-24px] w-px bg-slate-200" />
                      )}
                      <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center shrink-0 z-10">
                        <History className="w-4 h-4 text-slate-500" />
                      </div>
                      <div>
                        <p className="text-sm font-medium">{log.action.replace(/_/g, ' ')}</p>
                        <p className="text-xs text-slate-500">by {log.performed_by}</p>
                        {log.metadata?.reason && (
                           <p className="text-xs text-red-500 mt-1">Reason: {log.metadata.reason}</p>
                        )}
                        <p className="text-xs text-slate-400 mt-1">{new Date(log.created_at).toLocaleString()}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </ScrollArea>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Send for Signature Modal */}
      <Dialog open={isSendModalOpen} onOpenChange={setIsSendModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Send for Signature</DialogTitle>
            <DialogDescription>
              This will lock the contract and notify the signers.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
             <div className="space-y-2">
               <Label>Signer Name</Label>
               <div className="relative">
                 <User className="absolute left-2 top-2.5 h-4 w-4 text-slate-500" />
                 <Input 
                   placeholder="e.g. John Doe" 
                   className="pl-8" 
                   value={signerName} 
                   onChange={(e) => setSignerName(e.target.value)} 
                 />
               </div>
             </div>
             <div className="space-y-2">
               <Label>Signer Email</Label>
               <div className="relative">
                 <Mail className="absolute left-2 top-2.5 h-4 w-4 text-slate-500" />
                 <Input 
                   placeholder="e.g. john@example.com" 
                   className="pl-8" 
                   value={signerEmail} 
                   onChange={(e) => setSignerEmail(e.target.value)} 
                 />
               </div>
             </div>
             <div className="space-y-2">
               <Label>Signing Order</Label>
               <Input type="number" defaultValue="1" min="1" />
             </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsSendModalOpen(false)}>Cancel</Button>
            <Button className="bg-[#1A3C34]" onClick={submitSendForSignature}>
              <Send className="w-4 h-4 mr-2" />
              Send Request
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Terminate Modal */}
      <Dialog open={isTerminateModalOpen} onOpenChange={setIsTerminateModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="text-red-600 flex items-center gap-2">
              <AlertTriangle className="h-5 w-5" />
              Terminate Contract
            </DialogTitle>
            <DialogDescription>
              Are you sure you want to terminate this contract? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
             <div className="space-y-2">
               <Label>Reason for Termination</Label>
               <Input 
                 placeholder="e.g. Breach of contract, Mutual agreement" 
                 value={terminateReason} 
                 onChange={(e) => setTerminateReason(e.target.value)} 
               />
             </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsTerminateModalOpen(false)}>Cancel</Button>
            <Button variant="destructive" onClick={submitTerminate}>
              Terminate Contract
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Create Order Modal */}
      <Dialog open={isCreateOrderModalOpen} onOpenChange={setIsCreateOrderModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create ERP Order</DialogTitle>
            <DialogDescription>
              This will create a new Sales Order in the ERP module based on this contract's value ({contract.contract_value.toLocaleString()}).
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <div className="rounded-md bg-slate-50 p-4">
              <div className="flex justify-between mb-2">
                <span className="text-sm text-slate-500">Customer</span>
                <span className="text-sm font-medium">{contract.customer_name}</span>
              </div>
              <div className="flex justify-between mb-2">
                <span className="text-sm text-slate-500">Contract Value</span>
                <span className="text-sm font-medium">${contract.contract_value.toLocaleString()}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-slate-500">Order Type</span>
                <span className="text-sm font-medium">New Business</span>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsCreateOrderModalOpen(false)}>Cancel</Button>
            <Button className="bg-blue-600 text-white" onClick={submitCreateOrder}>Confirm & Create Order</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      <Dialog open={isEditModalOpen} onOpenChange={setIsEditModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Contract</DialogTitle>
            <DialogDescription>Update contract details and content.</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-2">
              <Label>Title</Label>
              <Input value={editTitle} onChange={(e) => setEditTitle(e.target.value)} />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <div className="space-y-2">
                <Label>Start Date</Label>
                <Input type="date" value={editStartDate} onChange={(e) => setEditStartDate(e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label>End Date</Label>
                <Input type="date" value={editEndDate} onChange={(e) => setEditEndDate(e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label>Value</Label>
                <Input type="number" value={editValue} onChange={(e) => setEditValue(e.target.value ? Number(e.target.value) : '')} />
              </div>
            </div>
            <div className="space-y-2">
              <Label>Currency</Label>
              <Input value={editCurrency} onChange={(e) => setEditCurrency(e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label>Content (HTML/Text)</Label>
              <Textarea className="min-h-[160px]" value={editContent} onChange={(e) => setEditContent(e.target.value)} />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditModalOpen(false)}>Cancel</Button>
            <Button
              className="bg-[#1A3C34] text-white"
              onClick={async () => {
                if (!contract) return;
                try {
                  const updated = await clmService.updateContract(contract.id, {
                    title: editTitle,
                    startDate: editStartDate,
                    endDate: editEndDate,
                    value: typeof editValue === 'number' ? editValue : undefined,
                    currency: editCurrency,
                    content: editContent
                  });
                  setContract(updated);
                  toast.success('Contract updated');
                  setIsEditModalOpen(false);
                } catch {
                  toast.error('Failed to update contract');
                }
              }}
            >
              Save Changes
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={isUploadModalOpen} onOpenChange={setIsUploadModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Upload Version</DialogTitle>
            <DialogDescription>Upload a new version to replace current content.</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-2">
              <Label>Version Note</Label>
              <Input placeholder="e.g. Redlines v2" value={uploadNote} onChange={(e) => setUploadNote(e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label>File</Label>
              <Input type="file" accept=".html,.txt" onChange={(e) => setUploadFile(e.target.files?.[0] || null)} />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsUploadModalOpen(false)}>Cancel</Button>
            <Button
              onClick={async () => {
                if (!contract) return;
                if (!uploadFile) {
                  toast.error('Select a file');
                  return;
                }
                try {
                  const text = await uploadFile.text();
                  const updated = await clmService.updateContract(contract.id, { content: text });
                  setContract(updated);
                  const nextVer = (versions[versions.length - 1]?.version || 0) + 1;
                  setVersions([
                    ...versions,
                    {
                      id: `${updated.id}-v${nextVer}`,
                      version: nextVer,
                      note: uploadNote || uploadFile.name,
                      uploaded_by: 'You',
                      date: new Date().toLocaleString()
                    }
                  ]);
                  toast.success('Version uploaded');
                  setIsUploadModalOpen(false);
                } catch {
                  toast.error('Failed to upload version');
                }
              }}
            >
              Upload
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>

  );
};

export default ContractDetail;

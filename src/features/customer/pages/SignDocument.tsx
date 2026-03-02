import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  PenTool, 
  CheckCircle2, 
  ArrowLeft,
  Loader2,
  FileText,
  Download,
  AlertCircle,
  Calendar,
  Shield
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { useToast } from '@/components/ui/use-toast';
import { cn } from '@/lib/utils';
import { customerService, CustomerContract } from '../services/customerService';

const SignDocument: React.FC = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [signing, setSigning] = useState(false);
  const [signature, setSignature] = useState('');
  const [agreed, setAgreed] = useState(false);
  const [contract, setContract] = useState<CustomerContract | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      if (id) {
        const data = await customerService.getContractById(id);
        if (data) {
          setContract(data);
          if (data.status === 'Signed' || data.status === 'Active') {
            const userSigner = data.signers?.find(s => s.email === 'john@acme.com');
            if (userSigner && userSigner.status === 'Signed') {
              setSignature(userSigner.name);
              setAgreed(true);
            }
          }
        } else {
          toast({ title: "Error", description: "Contract not found", variant: "destructive" });
          navigate('/customer-dashboard/contracts');
        }
        setLoading(false);
      } else {
        const contracts = await customerService.getContracts();
        const pendingContract = contracts.find(c => c.status === 'Sent for Signature');
        if (pendingContract) {
          navigate(`/customer-dashboard/sign/${pendingContract.id}`, { replace: true });
        } else {
          setLoading(false);
        }
      }
    })();
  }, [id, navigate, toast]);

  const handleSign = async () => {
    if (!signature || !agreed || !contract) return;
    
    setSigning(true);
    try {
      const result = await customerService.updateContractStatus(contract.id, 'Signed');
      
      if (result) {
        toast({
          title: "Document Signed",
          description: "The document has been successfully signed.",
        });
        navigate('/customer-dashboard/contracts');
      } else {
        throw new Error('Failed to sign document');
      }
    } catch (error) {
      console.error('Signing error:', error);
      toast({
        title: "Error",
        description: "Failed to sign document. Please try again.",
        variant: "destructive"
      });
    } finally {
      setSigning(false);
    }
  };

  if (loading) {
    return (
      <div className="flex h-[50vh] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-emerald-600" />
      </div>
    );
  }

  // Empty State - No ID and no pending contracts
  if (!id && !contract) {
      return (
          <div className="flex flex-col items-center justify-center h-[60vh] space-y-6 text-center p-8">
              <div className="bg-emerald-50 p-6 rounded-full">
                  <CheckCircle2 className="h-16 w-16 text-emerald-600" />
              </div>
              <div className="space-y-2">
                  <h2 className="text-2xl font-bold text-slate-900">All Caught Up!</h2>
                  <p className="text-slate-500 max-w-md">You have no pending documents to sign. You can view your active contracts and history in the Contracts section.</p>
              </div>
              <div className="flex gap-4">
                  <Button variant="outline" onClick={() => navigate('/customer-dashboard/contracts')}>
                      View Contracts
                  </Button>
                  <Button variant="ghost" onClick={() => {
                      // Reset Demo Helper
                      localStorage.clear();
                      window.location.reload();
                  }}>
                      Reset Demo
                  </Button>
              </div>
          </div>
      );
  }

  if (!contract) return null;

  return (
    <div className="max-w-5xl mx-auto space-y-8 pb-12">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => navigate(-1)} className="rounded-full hover:bg-slate-100">
            <ArrowLeft className="h-5 w-5 text-slate-600" />
          </Button>
          <div>
            <h2 className="text-2xl font-bold text-slate-900 flex items-center gap-3">
              Sign Document
              <Badge variant={contract.status === 'Signed' ? 'default' : 'outline'} className={contract.status === 'Signed' ? 'bg-emerald-600' : ''}>
                {contract.status}
              </Badge>
            </h2>
            <p className="text-slate-500 text-sm mt-1">Ref: {contract.id}</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
            <Button variant="outline" className="gap-2 text-slate-600">
                <Download size={16} />
                Download PDF
            </Button>
            <div className="text-right hidden md:block">
                <p className="text-xs text-slate-500">Valid Until</p>
                <p className="text-sm font-medium">{new Date(contract.endDate).toLocaleDateString()}</p>
            </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column: Document Preview */}
        <div className="lg:col-span-2 space-y-6">
            <Card className="border-slate-200 shadow-sm overflow-hidden">
                <CardHeader className="bg-slate-50 border-b border-slate-100 pb-4">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                            <FileText className="h-5 w-5 text-slate-500" />
                            <CardTitle className="text-base font-medium text-slate-700">{contract.name}</CardTitle>
                        </div>
                        <Badge variant="secondary" className="bg-slate-200 text-slate-600">Page 1 of 4</Badge>
                    </div>
                </CardHeader>
                <CardContent className="p-8 bg-slate-50/50 min-h-[600px] overflow-y-auto max-h-[800px]">
                    <div className="bg-white shadow-sm border border-slate-200 p-12 min-h-[800px] mx-auto max-w-[800px] space-y-6">
                        {/* Mock Document Content */}
                        <div className="flex justify-between items-start mb-12">
                            <div className="h-12 w-12 bg-slate-900 rounded-lg flex items-center justify-center">
                                <span className="text-white font-bold text-xl">S</span>
                            </div>
                            <div className="text-right text-slate-500 text-sm">
                                <p>Date: {new Date().toLocaleDateString()}</p>
                                <p>Contract #: {contract.id}</p>
                            </div>
                        </div>

                        <div className="space-y-4 text-center mb-12">
                            <h1 className="text-2xl font-bold uppercase tracking-widest text-slate-900">{contract.name}</h1>
                            <p className="text-slate-500">Between</p>
                            <p className="font-medium text-lg">{contract.parties[0]} AND {contract.parties[1]}</p>
                        </div>

                        <div className="space-y-4 text-sm text-slate-600 leading-relaxed text-justify">
                            <p>
                                <strong>1. AGREEMENT.</strong> This Agreement is entered into as of {contract.startDate}, by and between the parties listed above. 
                                This document serves as a binding contract governing the services and terms outlined in the attached exhibits.
                            </p>
                            <p>
                                <strong>2. SERVICES.</strong> The Service Provider agrees to perform the services described in the Statement of Work attached hereto as Exhibit A.
                                All services shall be performed in a professional manner and in accordance with industry standards.
                            </p>
                            <p>
                                <strong>3. COMPENSATION.</strong> In consideration for the services, the Client agrees to pay the Service Provider the total sum of 
                                <span className="font-semibold text-slate-900"> {contract.value}</span>. Payment terms shall be Net 30 from the date of invoice.
                            </p>
                            <p>
                                <strong>4. TERM.</strong> This Agreement shall commence on {contract.startDate} and shall continue until {contract.endDate}, unless terminated earlier in accordance with the provisions hereof.
                            </p>
                            <p>
                                <strong>5. CONFIDENTIALITY.</strong> Both parties agree to maintain the confidentiality of all proprietary information exchanged during the term of this Agreement.
                            </p>
                            <div className="h-4"></div>
                            <p className="italic text-slate-400 text-xs text-center border-t border-b border-slate-100 py-4 my-8">
                                [ ... Remaining clauses 6-24 omitted for brevity ... ]
                            </p>
                        </div>

                        {/* Signature Placeholder on Document */}
                        <div className="mt-16 pt-8 border-t border-slate-200 grid grid-cols-2 gap-12">
                            <div className="space-y-2">
                                <p className="text-xs uppercase tracking-wider text-slate-500">Signed for {contract.parties[1]}</p>
                                <div className="h-12 border-b border-slate-300 flex items-end">
                                    <span className="font-serif italic text-lg text-slate-900">Jane Smith</span>
                                </div>
                                <p className="text-xs text-slate-400">Date: {contract.startDate}</p>
                            </div>
                            <div className="space-y-2">
                                <p className="text-xs uppercase tracking-wider text-slate-500">Signed for {contract.parties[0]}</p>
                                <div className="h-12 border-b border-slate-300 flex items-end bg-yellow-50/50 relative">
                                    {signature && (
                                        <span className="font-serif italic text-2xl text-blue-900 absolute bottom-1 left-0 w-full text-center animate-fade-in">
                                            {signature}
                                        </span>
                                    )}
                                    {!signature && (
                                        <div className="absolute inset-0 flex items-center justify-center">
                                            <span className="text-xs text-amber-600 bg-amber-50 px-2 py-1 rounded-full animate-pulse">
                                                Sign Here
                                            </span>
                                        </div>
                                    )}
                                </div>
                                <p className="text-xs text-slate-400">Date: {new Date().toLocaleDateString()}</p>
                            </div>
                        </div>
                    </div>
                </CardContent>
            </Card>
        </div>

        {/* Right Column: Action Panel */}
        <div className="space-y-6">
            <Card className="border-t-4 border-t-blue-600 shadow-md sticky top-6">
                <CardHeader>
                    <CardTitle className="text-lg">Action Required</CardTitle>
                    <CardDescription>Please review and sign to proceed.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                    <div className="bg-blue-50 p-4 rounded-lg border border-blue-100">
                        <div className="flex gap-3">
                            <AlertCircle className="h-5 w-5 text-blue-600 shrink-0" />
                            <div className="text-sm text-blue-800">
                                <p className="font-medium mb-1">Electronic Signature</p>
                                <p>By signing this document, you agree to be legally bound by its terms and conditions under the E-SIGN Act.</p>
                            </div>
                        </div>
                    </div>

                    <div className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="signature">Full Legal Name</Label>
                            <Input 
                                id="signature" 
                                placeholder="Type your full name" 
                                value={signature}
                                onChange={(e) => setSignature(e.target.value)}
                                className="h-12 text-lg font-serif italic"
                                autoComplete="off"
                                disabled={contract.status === 'Signed' || contract.status === 'Active'}
                            />
                            <p className="text-xs text-slate-500">This will appear as your official signature.</p>
                        </div>

                        <Separator />

                        <div className="flex items-start space-x-3 pt-2">
                            <Checkbox 
                                id="terms" 
                                checked={agreed} 
                                onCheckedChange={(c) => setAgreed(c as boolean)} 
                                className="mt-1"
                                disabled={contract.status === 'Signed' || contract.status === 'Active'}
                            />
                            <label
                                htmlFor="terms"
                                className="text-sm text-slate-600 leading-snug peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
                            >
                                I have read and agree to the <span className="text-blue-600 hover:underline">Terms of Service</span> and <span className="text-blue-600 hover:underline">Privacy Policy</span>, and consent to use electronic records and signatures.
                            </label>
                        </div>
                    </div>
                </CardContent>
                <CardFooter className="bg-slate-50 border-t border-slate-100 p-6">
                    <Button 
                        className={cn(
                            "w-full text-lg h-12 gap-2 shadow-sm",
                            contract.status === 'Signed' || contract.status === 'Active' 
                                ? "bg-emerald-600 hover:bg-emerald-700" 
                                : "bg-blue-600 hover:bg-blue-700"
                        )}
                        disabled={(!signature || !agreed || signing) && contract.status !== 'Signed' && contract.status !== 'Active'}
                        onClick={contract.status === 'Signed' || contract.status === 'Active' ? () => navigate('/customer-dashboard/contracts') : handleSign}
                    >
                        {signing ? <Loader2 className="animate-spin" /> : (
                            contract.status === 'Signed' || contract.status === 'Active' ? <CheckCircle2 size={20} /> : <PenTool size={20} />
                        )}
                        {contract.status === 'Signed' || contract.status === 'Active' ? "Signed & Verified" : "Sign & Complete"}
                    </Button>
                </CardFooter>
            </Card>

            <div className="flex items-center justify-center gap-2 text-slate-400 text-xs">
                <Shield size={12} />
                <span>Secured by Sirius E-Sign</span>
            </div>
        </div>
      </div>
    </div>
  );
};

export default SignDocument;

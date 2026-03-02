import React, { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, 
  Download, 
  PenTool,
  Calendar,
  Shield,
  Clock,
  FileText,
  Users,
  History,
  Info,
  CheckCircle,
  AlertCircle
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { customerService, CustomerContract } from '../services/customerService';
import { useToast } from '@/components/ui/use-toast';

const ContractDetail: React.FC = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [contract, setContract] = useState<CustomerContract | null>(null);

  useEffect(() => {
    (async () => {
      if (id) {
        const data = await customerService.getContractById(id);
        if (data) {
          setContract(data);
        } else {
          toast({ title: "Error", description: "Contract not found", variant: "destructive" });
          navigate('/customer-dashboard/contracts');
        }
      }
    })();
  }, [id, navigate, toast]);

  if (!contract) return <div>Loading...</div>;

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'Active': 
        return <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">Active</Badge>;
      case 'Sent for Signature': 
        return <Badge variant="outline" className="bg-amber-50 text-amber-700 border-amber-200">Pending Signature</Badge>;
      case 'Expired': 
        return <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200">Expired</Badge>;
      case 'Signed': 
        return <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">Signed</Badge>;
      case 'Terminated':
        return <Badge variant="outline" className="bg-slate-100 text-slate-700 border-slate-200">Terminated</Badge>;
      default: return <Badge variant="outline">{status}</Badge>;
    }
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center gap-4 justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" asChild>
            <Link to="/customer-dashboard/contracts">
              <ArrowLeft className="h-5 w-5" />
            </Link>
          </Button>
          <div>
            <h2 className="text-2xl font-bold text-[#1A3C34]">{contract.name}</h2>
            <div className="flex items-center gap-3 mt-1 text-sm text-slate-500">
              <span>{contract.id}</span>
              <span>•</span>
              {getStatusBadge(contract.status)}
            </div>
          </div>
        </div>
        <div className="flex gap-2">
           {contract.status === 'Sent for Signature' && (
              <Button className="bg-amber-600 hover:bg-amber-700 text-white gap-2" asChild>
                <Link to={`/customer-dashboard/sign/${contract.id}`}>
                  <PenTool size={16} />
                  Sign Now
                </Link>
              </Button>
            )}
          <Button variant="outline" className="gap-2">
            <Download size={16} />
            Download PDF
          </Button>
        </div>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="overview" className="w-full">
        <TabsList className="grid w-full grid-cols-4 lg:w-[400px]">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="lifecycle">Lifecycle</TabsTrigger>
          <TabsTrigger value="signers">Signers</TabsTrigger>
          <TabsTrigger value="documents">Documents</TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-6 mt-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <Card className="lg:col-span-2">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Info className="h-5 w-5 text-slate-500" />
                  Contract Details
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  <div>
                    <span className="text-xs font-medium text-slate-500 uppercase tracking-wider">Status</span>
                    <div className="mt-1">{getStatusBadge(contract.status)}</div>
                  </div>
                  <div>
                    <span className="text-xs font-medium text-slate-500 uppercase tracking-wider">Duration</span>
                    <div className="flex items-center gap-2 mt-1">
                      <Calendar className="w-4 h-4 text-slate-400" />
                      <p className="text-sm font-medium">{contract.startDate} - {contract.endDate}</p>
                    </div>
                  </div>
                  <div>
                    <span className="text-xs font-medium text-slate-500 uppercase tracking-wider">Contract Value</span>
                    <p className="text-sm font-medium mt-1">{contract.value}</p>
                  </div>
                  <div>
                    <span className="text-xs font-medium text-slate-500 uppercase tracking-wider">Renewal Type</span>
                    <p className="text-sm font-medium mt-1">{contract.renewalType}</p>
                  </div>
                </div>
                <Separator />
                <div>
                  <span className="text-xs font-medium text-slate-500 uppercase tracking-wider">Summary</span>
                  <p className="text-sm text-slate-600 mt-2 leading-relaxed">
                    {contract.summary || "No summary available for this contract."}
                  </p>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="h-5 w-5 text-slate-500" />
                  Parties Involved
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-4">
                  {contract.parties.map((party, i) => (
                    <li key={i} className="flex items-center gap-3">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold ${i === 0 ? 'bg-blue-100 text-blue-700' : 'bg-slate-100 text-slate-700'}`}>
                        {party.charAt(0)}
                      </div>
                      <span className="text-sm font-medium">{party}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Lifecycle Tab */}
        <TabsContent value="lifecycle" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <History className="h-5 w-5 text-slate-500" />
                Contract Lifecycle
              </CardTitle>
              <CardDescription>Tracking the journey of this contract from creation to expiration.</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="relative border-l-2 border-slate-200 ml-3 space-y-8 py-4">
                {contract.lifecycleEvents.map((event, index) => (
                  <div key={index} className="relative pl-8">
                    <div className={`absolute -left-[9px] top-0 w-4 h-4 rounded-full border-2 ${index === contract.lifecycleEvents.length - 1 ? 'bg-blue-600 border-blue-600' : 'bg-white border-slate-300'}`} />
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                      <div>
                        <p className="text-sm font-medium text-slate-900">{event.status}</p>
                        <p className="text-xs text-slate-500">Action by: {event.user}</p>
                      </div>
                      <span className="text-xs text-slate-400 font-mono bg-slate-50 px-2 py-1 rounded">
                        {event.date}
                      </span>
                    </div>
                  </div>
                ))}
                
                {/* Future/Next Steps Visualization */}
                {contract.status === 'Active' && (
                   <div className="relative pl-8 opacity-50">
                    <div className="absolute -left-[9px] top-0 w-4 h-4 rounded-full border-2 bg-white border-slate-300 border-dashed" />
                    <div>
                      <p className="text-sm font-medium text-slate-900">Expiring</p>
                      <p className="text-xs text-slate-500">Scheduled for {contract.endDate}</p>
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Signers Tab */}
        <TabsContent value="signers" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <PenTool className="h-5 w-5 text-slate-500" />
                Signatures
              </CardTitle>
              <CardDescription>Status of all required signatures.</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {contract.signers.map((signer, index) => (
                  <div key={index} className="flex items-center justify-between p-4 border rounded-lg bg-slate-50/50">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-slate-200 flex items-center justify-center text-slate-600 font-medium">
                        {signer.name.charAt(0)}
                      </div>
                      <div>
                        <p className="text-sm font-medium">{signer.name}</p>
                        <p className="text-xs text-slate-500">{signer.email}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      {signer.status === 'Signed' ? (
                        <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200 gap-1">
                          <CheckCircle size={10} /> Signed
                        </Badge>
                      ) : (
                        <Badge variant="outline" className="bg-amber-50 text-amber-700 border-amber-200 gap-1">
                          <Clock size={10} /> Pending
                        </Badge>
                      )}
                      {signer.signedAt && (
                        <p className="text-xs text-slate-400 mt-1">on {signer.signedAt}</p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Documents Tab */}
        <TabsContent value="documents" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5 text-slate-500" />
                Contract Documents
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {contract.documents.map((doc, index) => (
                  <div key={index} className="flex items-center justify-between p-3 border rounded-lg hover:bg-slate-50 transition-colors">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-blue-50 text-blue-600 rounded">
                        <FileText size={18} />
                      </div>
                      <div>
                        <p className="text-sm font-medium">{doc.name}</p>
                        <p className="text-xs text-slate-500">{doc.type}</p>
                      </div>
                    </div>
                    <Button variant="ghost" size="sm" className="h-8">
                      <Download size={14} className="mr-2" />
                      Download
                    </Button>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default ContractDetail;

import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Search, 
  Filter,
  Eye,
  Clock,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Contract, ContractSignatureRequest } from './types';
import { clmService } from '@/features/employee/services/clmService';
import { toast } from 'sonner';

const Signatures: React.FC = () => {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');

  const [contracts, setContracts] = useState<Contract[]>([]);

  useEffect(() => {
    const load = async () => {
      try {
        const reqs: ContractSignatureRequest[] = await clmService.getSignatures();
        const mapped = reqs.map((r) => ({
          id: r.contract?.id || r.contractId,
          contract_number: r.contract?.contract_number || '',
          name: r.contract?.name || '',
          account_id: r.contract?.account_id || '',
          quote_id: r.contract?.quote_id || '',
          status: r.status === 'signed' ? 'signed' : 'sent_for_signature',
          start_date: r.contract?.start_date || '',
          end_date: r.contract?.end_date || '',
          renewal_type: r.contract?.renewal_type || 'manual',
          contract_value: r.contract?.contract_value || 0,
          owner_id: r.contract?.owner_id || '',
          created_at: r.createdAt,
          updated_at: r.updatedAt,
          customer_name: r.contract?.customer_name || '',
        })) as Contract[];
        setContracts(mapped);
      } catch (e) {
        console.error(e);
        toast.error('Failed to load signatures');
      }
    };
    load();
  }, []);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'signed': return 'bg-blue-50 text-blue-700 border-blue-100';
      case 'sent_for_signature': return 'bg-indigo-50 text-indigo-700 border-indigo-100';
      default: return 'bg-slate-50 text-slate-700 border-slate-100';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'signed': return <CheckCircle2 className="w-4 h-4 mr-1" />;
      case 'sent_for_signature': return <Clock className="w-4 h-4 mr-1" />;
      default: return null;
    }
  };

  const filteredContracts = contracts.filter(contract => 
    (contract.customer_name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
    contract.contract_number.toLowerCase().includes(searchTerm.toLowerCase()) ||
    contract.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-[#1A3C34]">Signature Tracking</h1>
          <p className="text-slate-500">Monitor contracts currently out for signature or recently signed.</p>
        </div>
      </div>

      <div className="flex items-center space-x-2">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-slate-500" />
          <Input
            placeholder="Search signatures..."
            className="pl-9"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <Button variant="outline" size="icon">
          <Filter className="h-4 w-4" />
        </Button>
      </div>

      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Contract</TableHead>
                <TableHead>Customer</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Sent Date</TableHead>
                <TableHead>Signer</TableHead>
                <TableHead className="w-[50px]"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredContracts.map((contract) => (
                <TableRow key={contract.id} className="hover:bg-slate-50/50">
                  <TableCell>
                    <div className="flex flex-col">
                      <span className="font-medium text-[#1A3C34]">{contract.name}</span>
                      <span className="text-xs text-slate-500">{contract.contract_number}</span>
                    </div>
                  </TableCell>
                  <TableCell>{contract.customer_name}</TableCell>
                  <TableCell>
                    <Badge variant="secondary" className={`capitalize flex w-fit items-center ${getStatusColor(contract.status)}`}>
                      {getStatusIcon(contract.status)}
                      {contract.status.replace(/_/g, ' ')}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    {/* Mock Sent Date based on updated_at */}
                    {new Date(contract.updated_at).toLocaleDateString()}
                  </TableCell>
                  <TableCell>
                    {/* Mock Signer Info */}
                    <div className="flex items-center gap-2">
                      <div className="w-6 h-6 rounded-full bg-slate-200 flex items-center justify-center text-xs">
                        {contract.customer_name.charAt(0)}
                      </div>
                      <span className="text-sm">Signer from {contract.customer_name}</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Button variant="ghost" size="icon" onClick={() => navigate(`/employee-dashboard/clm/contracts/${contract.id}`)}>
                      <Eye className="h-4 w-4 text-slate-500" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
              {filteredContracts.length === 0 && (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-8 text-slate-500">
                    No contracts found matching your search.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
};

export default Signatures;

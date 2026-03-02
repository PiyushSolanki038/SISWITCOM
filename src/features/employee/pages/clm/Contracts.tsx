import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { 
  Plus, 
  Search, 
  FileText, 
  Filter,
  Eye
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
import { Skeleton } from '@/components/ui/skeleton';
import { Contract } from './types';
import { clmService } from '@/features/employee/services/clmService';
import { toast } from 'sonner';
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectItem
} from '@/components/ui/select';
import { SafeSelectContent } from '@/components/ui/overlay-helpers';

const Contracts: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  
  // Get filter params
  const statusFilter = searchParams.get('status');
  
  const [contracts, setContracts] = useState<Contract[]>([]);
  const [filteredContracts, setFilteredContracts] = useState<Contract[]>([]);
  const [typeFilter, setTypeFilter] = useState<string>('');
  const [accountFilter, setAccountFilter] = useState<string>('');
  const [fromDate, setFromDate] = useState<string>('');
  const [toDate, setToDate] = useState<string>('');

  useEffect(() => {
    const fetchContracts = async () => {
        setLoading(true);
        try {
            const data = await clmService.getContracts({
              status: statusFilter || undefined,
              type: typeFilter || undefined,
              accountId: accountFilter || undefined,
              from: fromDate || undefined,
              to: toDate || undefined
            });
            setContracts(data);
        } catch (error) {
            console.error("Failed to load contracts", error);
            toast.error("Failed to load contracts");
        } finally {
            setLoading(false);
        }
    };
    fetchContracts();
  }, [statusFilter, typeFilter, accountFilter, fromDate, toDate]);

  useEffect(() => {
      let filtered = contracts;

      if (statusFilter) {
        filtered = filtered.filter(c => c.status === statusFilter);
      }
      
      if (typeFilter) {
        filtered = filtered.filter(c => (c.contract_type || '').toLowerCase() === typeFilter.toLowerCase());
      }
      if (accountFilter) {
        filtered = filtered.filter(c => (c.account_id || '') === accountFilter);
      }
      if (fromDate) {
        filtered = filtered.filter(c => new Date(c.created_at) >= new Date(fromDate));
      }
      if (toDate) {
        filtered = filtered.filter(c => new Date(c.created_at) <= new Date(toDate));
      }
      if (searchTerm) {
        filtered = filtered.filter(c => 
          c.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
          c.contract_number.toLowerCase().includes(searchTerm.toLowerCase()) ||
          (c.customer_name && c.customer_name.toLowerCase().includes(searchTerm.toLowerCase()))
        );
      }
      
      setFilteredContracts(filtered);
  }, [statusFilter, searchTerm, contracts]);

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

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-[#1A3C34]">Contracts</h1>
          <p className="text-slate-500">Manage your contract lifecycle from draft to renewal.</p>
        </div>
        <Button 
          className="bg-[#1A3C34] text-white hover:bg-[#1A3C34]/90"
          onClick={() => navigate('/employee-dashboard/clm/contracts/new')}
        >
          <Plus className="h-4 w-4 mr-2" />
          Create Contract
        </Button>
      </div>

      <div className="flex items-center space-x-2">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-slate-500" />
          <Input
            placeholder="Search contracts..."
            className="pl-9"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="flex items-center gap-2">
          <Select value={typeFilter} onValueChange={setTypeFilter}>
            <SelectTrigger className="w-[160px]">
              <SelectValue placeholder="Type" />
            </SelectTrigger>
            <SafeSelectContent>
              <SelectItem value="MSA">MSA</SelectItem>
              <SelectItem value="NDA">NDA</SelectItem>
              <SelectItem value="Service">Service</SelectItem>
            </SafeSelectContent>
          </Select>
          <Input placeholder="Account ID" value={accountFilter} onChange={(e) => setAccountFilter(e.target.value)} className="w-[160px]" />
          <Input type="date" value={fromDate} onChange={(e) => setFromDate(e.target.value)} className="w-[150px]" />
          <Input type="date" value={toDate} onChange={(e) => setToDate(e.target.value)} className="w-[150px]" />
        </div>
      </div>

      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Contract ID / Name</TableHead>
                <TableHead>Customer</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Duration</TableHead>
                <TableHead>Value</TableHead>
                <TableHead>Owner</TableHead>
                <TableHead className="w-[50px]"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <TableRow key={i}>
                    <TableCell><Skeleton className="h-10 w-[200px]" /></TableCell>
                    <TableCell><Skeleton className="h-6 w-[120px]" /></TableCell>
                    <TableCell><Skeleton className="h-6 w-[80px]" /></TableCell>
                    <TableCell><Skeleton className="h-6 w-[100px]" /></TableCell>
                    <TableCell><Skeleton className="h-6 w-[150px]" /></TableCell>
                    <TableCell><Skeleton className="h-6 w-[80px]" /></TableCell>
                    <TableCell><Skeleton className="h-6 w-[100px]" /></TableCell>
                    <TableCell><Skeleton className="h-8 w-8 rounded-full" /></TableCell>
                  </TableRow>
                ))
              ) : filteredContracts.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={8} className="text-center py-12 text-muted-foreground">
                    <div className="flex flex-col items-center justify-center gap-2">
                      <FileText className="h-12 w-12 text-slate-200" />
                      <p>No contracts found.</p>
                    </div>
                  </TableCell>
                </TableRow>
              ) : (
                filteredContracts.map((contract) => (
                <TableRow key={contract.id} className="hover:bg-slate-50/50">
                  <TableCell>
                    <div className="flex flex-col">
                      <span className="font-medium text-[#1A3C34]">{contract.name}</span>
                      <span className="text-xs text-slate-500">{contract.contract_number}</span>
                    </div>
                  </TableCell>
                  <TableCell>{contract.customer_name}</TableCell>
                  <TableCell>
                    <Badge variant="outline">{contract.contract_type}</Badge>
                  </TableCell>
                  <TableCell>
                    <Badge variant="secondary" className={`capitalize ${getStatusColor(contract.status)}`}>
                      {contract.status.replace(/_/g, ' ')}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex flex-col text-sm">
                      <span>{contract.start_date ? new Date(contract.start_date).toLocaleDateString() : 'N/A'}</span>
                      <span className="text-slate-500 text-xs">to {contract.end_date ? new Date(contract.end_date).toLocaleDateString() : 'N/A'}</span>
                    </div>
                  </TableCell>
                  <TableCell>${contract.contract_value?.toLocaleString('en-US') || 0}</TableCell>
                  <TableCell>{contract.owner_name}</TableCell>
                  <TableCell>
                    <Button variant="ghost" size="icon" onClick={() => navigate(`/employee-dashboard/clm/contracts/${contract.id}`)}>
                      <Eye className="h-4 w-4 text-slate-500" />
                    </Button>
                  </TableCell>
                </TableRow>
              )))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
};

export default Contracts;

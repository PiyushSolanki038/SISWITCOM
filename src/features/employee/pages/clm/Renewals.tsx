import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Search, 
  Filter,
  Eye,
  Calendar,
  AlertTriangle,
  RefreshCw
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
import { Contract } from './types';
import { clmService } from '@/features/employee/services/clmService';
import { toast } from 'sonner';

const Renewals: React.FC = () => {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');

  const [contracts, setContracts] = useState<Contract[]>([]);

  useEffect(() => {
    const load = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) {
          navigate('/signin');
          return;
        }
        const data = await clmService.getContracts({ status: 'active' });
        const soon = data.filter(c => {
          if (!c.end_date) return false;
          const days = getDaysRemaining(c.end_date);
        // show upcoming within 90 days or expired
          return days <= 90;
        });
        setContracts(soon);
      } catch (e) {
        console.error(e);
        const status = (e as any)?.response?.status;
        if (status === 401) {
          try {
            localStorage.removeItem('token');
            localStorage.removeItem('user');
          } catch {}
          navigate('/signin');
          return;
        }
        toast.error('Failed to load renewals');
      }
    };
    load();
  }, []);

  const getDaysRemaining = (endDateStr: string) => {
    const endDate = new Date(endDateStr);
    const today = new Date();
    const diffTime = endDate.getTime() - today.getTime();
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  };

  const getStatusColor = (status: string, daysRemaining: number) => {
    if (status === 'expired') return 'bg-red-50 text-red-700 border-red-100';
    if (daysRemaining <= 30) return 'bg-amber-50 text-amber-700 border-amber-100';
    if (daysRemaining <= 90) return 'bg-yellow-50 text-yellow-700 border-yellow-100';
    return 'bg-emerald-50 text-emerald-700 border-emerald-100';
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
          <h1 className="text-2xl font-bold text-[#1A3C34]">Renewals & Expiry</h1>
          <p className="text-slate-500">Track upcoming contract expirations and manage renewals.</p>
        </div>
      </div>

      <div className="flex items-center space-x-2">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-slate-500" />
          <Input
            placeholder="Search renewals..."
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
                <TableHead>End Date</TableHead>
                <TableHead>Days Remaining</TableHead>
                <TableHead>Renewal Type</TableHead>
                <TableHead className="w-[50px]"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredContracts.map((contract) => {
                const daysRemaining = getDaysRemaining(contract.end_date);
                return (
                  <TableRow key={contract.id} className="hover:bg-slate-50/50">
                    <TableCell>
                      <div className="flex flex-col">
                        <span className="font-medium text-[#1A3C34]">{contract.name}</span>
                        <span className="text-xs text-slate-500">{contract.contract_number}</span>
                      </div>
                    </TableCell>
                    <TableCell>{contract.customer_name}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Calendar className="w-4 h-4 text-slate-400" />
                        {new Date(contract.end_date).toLocaleDateString()}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className={`${getStatusColor(contract.status, daysRemaining)} border`}>
                        {daysRemaining < 0 ? `${Math.abs(daysRemaining)} days ago` : `${daysRemaining} days`}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        {contract.renewal_type === 'auto' ? (
                          <RefreshCw className="w-4 h-4 text-emerald-600" />
                        ) : (
                          <AlertTriangle className="w-4 h-4 text-amber-600" />
                        )}
                        <span className="capitalize">{contract.renewal_type}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1">
                        <Button variant="ghost" size="icon" onClick={() => navigate(`/employee-dashboard/clm/contracts/${contract.id}`)}>
                          <Eye className="h-4 w-4 text-slate-500" />
                        </Button>
                        <Button variant="outline" onClick={async () => {
                          try {
                            const renewed = await clmService.renewContract(contract.id);
                            toast.success('Renewal draft created');
                            navigate(`/employee-dashboard/clm/contracts/${renewed.id}`);
                          } catch (e) {
                            console.error(e);
                            toast.error('Failed to create renewal draft');
                          }
                        }}>
                          Create Renewal Draft
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })}
              {filteredContracts.length === 0 && (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-8 text-slate-500">
                    No upcoming renewals found.
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

export default Renewals;

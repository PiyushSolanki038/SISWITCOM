import React, { useEffect, useState } from 'react';
import { 
  FileCheck, 
  Download, 
  Search,
  Filter,
  Eye,
  AlertTriangle,
  CheckCircle,
  Clock
} from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Link } from 'react-router-dom';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { customerService, CustomerContract } from '../services/customerService';

const Contracts: React.FC = () => {
  const [contracts, setContracts] = useState<CustomerContract[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [activeTab, setActiveTab] = useState('all');

  useEffect(() => {
    (async () => {
      const rows = await customerService.getContracts();
      setContracts(rows);
    })();
  }, []);

  const getFilteredContracts = () => {
    let filtered = contracts;

    // Tab filtering
    if (activeTab !== 'all') {
      if (activeTab === 'pending') {
        filtered = filtered.filter(c => c.status === 'Sent for Signature');
      } else if (activeTab === 'active') {
        filtered = filtered.filter(c => c.status === 'Active' || c.status === 'Signed');
      } else if (activeTab === 'expired') {
        filtered = filtered.filter(c => c.status === 'Expired');
      } else if (activeTab === 'terminated') {
        filtered = filtered.filter(c => c.status === 'Terminated');
      }
    }

    // Search filtering
    return filtered.filter(contract => 
      contract.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      contract.id.toLowerCase().includes(searchTerm.toLowerCase())
    );
  };

  const filteredContracts = getFilteredContracts();

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'Active': 
        return (
          <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200 flex items-center gap-1 w-fit">
            <CheckCircle size={12} />
            Active
          </Badge>
        );
      case 'Sent for Signature': 
        return (
          <Badge variant="outline" className="bg-amber-50 text-amber-700 border-amber-200 flex items-center gap-1 w-fit">
            <Clock size={12} />
            Pending Signature
          </Badge>
        );
      case 'Expired': 
        return (
          <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200 flex items-center gap-1 w-fit">
            <AlertTriangle size={12} />
            Expired
          </Badge>
        );
      case 'Signed': 
        return (
          <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200 flex items-center gap-1 w-fit">
            <CheckCircle size={12} />
            Signed
          </Badge>
        );
      case 'Terminated':
        return (
          <Badge variant="outline" className="bg-slate-100 text-slate-700 border-slate-200 flex items-center gap-1 w-fit">
            <AlertTriangle size={12} />
            Terminated
          </Badge>
        );
      default: return <Badge variant="outline">{status}</Badge>;
    }
  };

  const isExpiringSoon = (dateStr: string) => {
    const date = new Date(dateStr);
    const today = new Date();
    const diffTime = date.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)); 
    return diffDays > 0 && diffDays <= 30;
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold tracking-tight text-[#1A3C34]">Contracts</h2>
        <p className="text-slate-500 mt-2">Access your legal agreements and contracts.</p>
      </div>

      <Tabs defaultValue="all" value={activeTab} onValueChange={setActiveTab} className="w-full">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
          <TabsList>
            <TabsTrigger value="all">All Contracts</TabsTrigger>
            <TabsTrigger value="pending">Pending Signature</TabsTrigger>
            <TabsTrigger value="active">Active</TabsTrigger>
            <TabsTrigger value="expired">Expired</TabsTrigger>
            <TabsTrigger value="terminated">Terminated</TabsTrigger>
          </TabsList>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            <div className="relative flex-1 sm:w-64">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-slate-500" />
              <Input 
                placeholder="Search contracts..." 
                className="pl-9"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <Button variant="outline" size="icon">
              <Filter size={16} />
            </Button>
          </div>
        </div>

        <TabsContent value={activeTab} className="mt-0">
          <Card>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Contract Name</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Start Date</TableHead>
                  <TableHead>End Date</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredContracts.length > 0 ? (
                  filteredContracts.map((contract) => (
                    <TableRow key={contract.id}>
                      <TableCell className="font-medium">
                        <div className="flex flex-col">
                          <span className="flex items-center gap-2">
                            {contract.name}
                            {isExpiringSoon(contract.endDate) && contract.status === 'Active' && (
                              <span className="inline-flex items-center px-1.5 py-0.5 rounded text-xs font-medium bg-red-100 text-red-800">
                                Expiring Soon
                              </span>
                            )}
                          </span>
                          <span className="text-xs text-slate-500">{contract.id}</span>
                        </div>
                      </TableCell>
                      <TableCell>{contract.type}</TableCell>
                      <TableCell>{getStatusBadge(contract.status)}</TableCell>
                      <TableCell>{contract.startDate}</TableCell>
                      <TableCell>{contract.endDate}</TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button variant="ghost" size="sm" asChild>
                            <Link to={`/customer-dashboard/contracts/${contract.id}`}>View</Link>
                          </Button>
                          {contract.status === 'Sent for Signature' && (
                            <Button size="sm" className="bg-amber-600 hover:bg-amber-700 text-white" asChild>
                              <Link to={`/customer-dashboard/sign/${contract.id}`}>Sign</Link>
                            </Button>
                          )}
                          <Button variant="ghost" size="icon">
                            <Download size={16} />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-12 text-slate-500">
                      <div className="flex flex-col items-center justify-center gap-2">
                        <FileCheck className="h-8 w-8 text-slate-300" />
                        <p>No contracts found.</p>
                      </div>
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Contracts;

import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  FileSignature, 
  Search, 
  Filter, 
  Plus, 
  MoreHorizontal, 
  Clock, 
  CheckCircle2, 
  XCircle, 
  AlertCircle 
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';

import { ESignRequest } from './types';
import { clmService } from '@/features/employee/services/clmService';
import type { ContractSignatureRequest } from '@/features/employee/pages/clm/types';

type TabKey = 'all' | 'pending' | 'completed' | 'rejected' | 'expired';

const ESignRequests: React.FC = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<TabKey>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(false);
  const [requests, setRequests] = useState<ESignRequest[]>([]);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const rows: ContractSignatureRequest[] = await clmService.getSignatures();
        const mapped: ESignRequest[] = rows.map((r) => ({
          id: r.id,
          subject: r.contract?.name || 'Signature Request',
          status: r.status,
          created: new Date(r.createdAt).toLocaleString(),
          lastUpdate: new Date(r.updatedAt).toLocaleString(),
          sender: r.signerName || 'Unknown',
          recipients: [r.signerEmail],
        }));
        setRequests(mapped);
      } catch (e) {
        console.error('Failed to load e-sign requests', e);
        setRequests([]);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'sent':
        return <Badge className="bg-indigo-100 text-indigo-800 hover:bg-indigo-100"><Clock className="w-3 h-3 mr-1" /> Sent</Badge>;
      case 'viewed':
        return <Badge className="bg-blue-100 text-blue-800 hover:bg-blue-100"><Clock className="w-3 h-3 mr-1" /> Viewed</Badge>;
      case 'signed':
        return <Badge className="bg-emerald-100 text-emerald-800 hover:bg-emerald-100"><CheckCircle2 className="w-3 h-3 mr-1" /> Signed</Badge>;
      case 'declined':
        return <Badge className="bg-red-100 text-red-800 hover:bg-red-100"><XCircle className="w-3 h-3 mr-1" /> Declined</Badge>;
      case 'completed':
        return <Badge className="bg-green-100 text-green-800 hover:bg-green-100"><CheckCircle2 className="w-3 h-3 mr-1" /> Completed</Badge>;
      case 'pending':
        return <Badge className="bg-yellow-100 text-yellow-800 hover:bg-yellow-100"><Clock className="w-3 h-3 mr-1" /> Pending</Badge>;
      case 'rejected':
        return <Badge className="bg-red-100 text-red-800 hover:bg-red-100"><XCircle className="w-3 h-3 mr-1" /> Rejected</Badge>;
      case 'expired':
        return <Badge className="bg-slate-100 text-slate-800 hover:bg-slate-100"><AlertCircle className="w-3 h-3 mr-1" /> Expired</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const filteredRequests = useMemo(() => {
    const tabFilter = (status: string): boolean => {
      if (activeTab === 'all') return true;
      if (activeTab === 'pending') return ['sent', 'viewed', 'pending'].includes(status);
      if (activeTab === 'completed') return ['signed', 'completed'].includes(status);
      if (activeTab === 'rejected') return ['declined', 'rejected'].includes(status);
      if (activeTab === 'expired') return status === 'expired';
      return true;
    };
    return requests.filter((req) => {
      const matchesSearch = (req.subject || '').toLowerCase().includes(searchTerm.toLowerCase());
      const matchesTab = tabFilter(String(req.status));
      return matchesSearch && matchesTab;
    });
  }, [requests, searchTerm, activeTab]);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-[#1A3C34]">E-Sign Requests</h1>
          <p className="text-slate-500">Manage your electronic signature requests</p>
        </div>
        <Button className="bg-[#1A3C34] text-white hover:bg-[#1A3C34]/90">
          <Plus className="w-4 h-4 mr-2" />
          New Request
        </Button>
      </div>

      <Card>
        <CardContent className="p-6">
          <div className="flex flex-col sm:flex-row justify-between gap-4 mb-6">
            <div className="flex items-center gap-2 flex-1">
              <div className="relative flex-1 max-w-md">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-4 h-4" />
                <Input 
                  placeholder="Search requests..." 
                  className="pl-9"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              <Button variant="outline">
                <Filter className="w-4 h-4 mr-2" />
                Filter
              </Button>
            </div>
          </div>

          <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as TabKey)} className="w-full">
            <TabsList className="mb-4">
              <TabsTrigger value="all">All Requests</TabsTrigger>
              <TabsTrigger value="pending">Pending</TabsTrigger>
              <TabsTrigger value="completed">Completed</TabsTrigger>
              <TabsTrigger value="rejected">Rejected</TabsTrigger>
              <TabsTrigger value="expired">Expired</TabsTrigger>
            </TabsList>

            <TabsContent value={activeTab} className="mt-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Subject</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Recipients</TableHead>
                    <TableHead>Last Update</TableHead>
                    <TableHead className="w-[50px]"></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {loading && (
                    <TableRow>
                      <TableCell colSpan={5} className="text-center py-8 text-slate-500">
                        Loading...
                      </TableCell>
                    </TableRow>
                  )}
                  {!loading && filteredRequests.map((req) => (
                    <TableRow 
                      key={req.id} 
                      className="cursor-pointer hover:bg-slate-50"
                      onClick={() => navigate(`/employee-dashboard/esign/${req.id}`)}
                    >
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <div className="p-2 bg-slate-100 rounded text-slate-500">
                            <FileSignature className="w-4 h-4" />
                          </div>
                          <div>
                            <div className="font-medium text-[#1A3C34]">{req.subject}</div>
                            <div className="text-xs text-slate-500">
                              ID: {req.id} • for {typeof req.sender === 'string' ? req.sender : req.sender.name}
                            </div>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>{getStatusBadge(req.status)}</TableCell>
                      <TableCell>
                        <div className="flex flex-col gap-1">
                          {req.recipients?.map((recipient, idx) => (
                            <span key={idx} className="text-sm text-slate-600">{recipient}</span>
                          ))}
                        </div>
                      </TableCell>
                      <TableCell className="text-slate-500">{req.lastUpdate}</TableCell>
                      <TableCell onClick={(e) => e.stopPropagation()}>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon" className="h-8 w-8">
                              <MoreHorizontal className="w-4 h-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem>View Details</DropdownMenuItem>
                            <DropdownMenuItem>Remind Recipients</DropdownMenuItem>
                            <DropdownMenuItem className="text-red-600">Cancel Request</DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))}
                  {!loading && filteredRequests.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={5} className="text-center py-8 text-slate-500">
                        No requests found.
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
};

export default ESignRequests;

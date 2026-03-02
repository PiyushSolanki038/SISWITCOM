import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Plus, 
  Search, 
  FileText, 
  MoreHorizontal, 
  Filter,
  Copy,
  Eye
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectTrigger, SelectValue, SelectItem } from '@/components/ui/select';
import { SafeSelectContent } from '@/components/ui/overlay-helpers';
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
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import {
  DropdownMenu,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { SafeDropdownMenuContent } from '@/components/ui/overlay-helpers';

import { Quote } from '@/features/employee/pages/cpq/types';
import { cpqService } from '@/features/employee/services/cpqService';

const Quotes: React.FC = () => {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [quotes, setQuotes] = useState<Quote[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [tab, setTab] = useState<'all' | 'draft' | 'pending_approval' | 'approved' | 'sent' | 'rejected'>('all');
  const [statusFilter, setStatusFilter] = useState<'all' | 'draft' | 'pending_approval' | 'approved' | 'sent' | 'rejected'>('all');
  const [customerFilter, setCustomerFilter] = useState<string>('all');
  const [createdByFilter, setCreatedByFilter] = useState<string>('all');
  const [fromDate, setFromDate] = useState<string>('');
  const [toDate, setToDate] = useState<string>('');

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      setError(null);
      try {
        const data = await cpqService.getQuotes();
        setQuotes(data);
      } catch (e: any) {
        setError(e?.message || 'Failed to load quotes');
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'approved': return 'bg-emerald-50 text-emerald-700 border-emerald-100';
      case 'accepted': return 'bg-emerald-100 text-emerald-800 border-emerald-200';
      case 'pending_approval': return 'bg-amber-50 text-amber-700 border-amber-100';
      case 'sent': return 'bg-blue-50 text-blue-700 border-blue-100';
      case 'rejected': return 'bg-red-50 text-red-700 border-red-100';
      default: return 'bg-slate-50 text-slate-700 border-slate-100';
    }
  };

  const tabFiltered = quotes.filter(q => tab === 'all' ? true : q.status === tab);
  const filteredQuotes = tabFiltered.filter(quote => {
    const matchesSearch = (quote.customer_name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      quote.quote_number.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' ? true : quote.status === statusFilter;
    const matchesCustomer = customerFilter === 'all' ? true : (quote.customer_name || '') === customerFilter;
    const matchesCreatedBy = createdByFilter === 'all' ? true : (quote.created_by || '') === createdByFilter;
    const createdDate = new Date(quote.created_at).getTime();
    const fromOk = fromDate ? createdDate >= new Date(fromDate).getTime() : true;
    const toOk = toDate ? createdDate <= new Date(toDate).getTime() : true;
    return matchesSearch && matchesStatus && matchesCustomer && matchesCreatedBy && fromOk && toOk;
  });
  const customers = Array.from(new Set(quotes.map(q => q.customer_name).filter(Boolean))) as string[];
  const creators = Array.from(new Set(quotes.map(q => q.created_by).filter(Boolean))) as string[];

  return (
    <div className="space-y-6">
      <div className="sticky top-0 z-40 bg-white/80 backdrop-blur supports-[backdrop-filter]:bg-white/60 border-b px-2 py-3 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-[#1A3C34]">Quotes</h1>
          <p className="text-slate-500">View and manage all quotes.</p>
        </div>
        <Button 
          className="bg-[#1A3C34] text-white hover:bg-[#1A3C34]/90"
          onClick={() => navigate('/employee-dashboard/cpq/quotes/new')}
        >
          <Plus className="h-4 w-4 mr-2" />
          Create Quote
        </Button>
      </div>

      <Tabs value={tab} onValueChange={(v) => setTab(v as any)}>
        <TabsList className="flex-wrap">
          <TabsTrigger value="all">All</TabsTrigger>
          <TabsTrigger value="draft">Draft</TabsTrigger>
          <TabsTrigger value="pending_approval">Pending Approval</TabsTrigger>
          <TabsTrigger value="approved">Approved</TabsTrigger>
          <TabsTrigger value="sent">Sent</TabsTrigger>
          <TabsTrigger value="rejected">Rejected</TabsTrigger>
        </TabsList>
        <TabsContent value={tab}>
          <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:gap-2">
            <div className="relative flex-1 max-w-sm">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-slate-500" />
              <Input
                placeholder="Search quotes..."
                className="pl-9"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-4 gap-2 w-full sm:w-auto">
              <Select value={statusFilter} onValueChange={(v) => setStatusFilter(v as any)}>
                <SelectTrigger className="h-10">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SafeSelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="draft">Draft</SelectItem>
                  <SelectItem value="pending_approval">Pending</SelectItem>
                  <SelectItem value="approved">Approved</SelectItem>
                  <SelectItem value="sent">Sent</SelectItem>
                  <SelectItem value="rejected">Rejected</SelectItem>
                </SafeSelectContent>
              </Select>
              <Select value={customerFilter} onValueChange={setCustomerFilter}>
                <SelectTrigger className="h-10">
                  <SelectValue placeholder="Customer" />
                </SelectTrigger>
                <SafeSelectContent>
                  <SelectItem value="all">All Customers</SelectItem>
                  {customers.map(c => (
                    <SelectItem key={c} value={c}>{c}</SelectItem>
                  ))}
                </SafeSelectContent>
              </Select>
              <Select value={createdByFilter} onValueChange={setCreatedByFilter}>
                <SelectTrigger className="h-10">
                  <SelectValue placeholder="Created By" />
                </SelectTrigger>
                <SafeSelectContent>
                  <SelectItem value="all">Anyone</SelectItem>
                  {creators.map(c => (
                    <SelectItem key={c} value={c}>{c}</SelectItem>
                  ))}
                </SafeSelectContent>
              </Select>
              <div className="flex gap-2">
                <Input type="date" value={fromDate} onChange={(e) => setFromDate(e.target.value)} className="h-10" />
                <Input type="date" value={toDate} onChange={(e) => setToDate(e.target.value)} className="h-10" />
              </div>
            </div>
          </div>
        </TabsContent>
      </Tabs>

      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Quote Number</TableHead>
                <TableHead>Customer / Account</TableHead>
                <TableHead>Grand Total</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Created By</TableHead>
                <TableHead>Created Date</TableHead>
                <TableHead className="w-[50px]"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredQuotes.map((quote) => (
                <TableRow 
                  key={quote.id} 
                  className="cursor-pointer hover:bg-slate-50"
                  onClick={() => navigate(`/employee-dashboard/cpq/quotes/${quote.id}`)}
                >
                  <TableCell className="font-medium text-[#1A3C34]">
                    <div className="flex items-center gap-2">
                      <FileText className="w-4 h-4 text-slate-400" />
                      {quote.quote_number}
                    </div>
                  </TableCell>
                  <TableCell>{quote.customer_name}</TableCell>
                  <TableCell>{quote.currency} ${quote.grand_total.toLocaleString()}</TableCell>
                  <TableCell>
                    <Badge variant="secondary" className={`capitalize ${getStatusColor(quote.status)}`}>
                      {quote.status.replace('_', ' ')}
                    </Badge>
                  </TableCell>
                  <TableCell>{quote.created_by}</TableCell>
                  <TableCell>{new Date(quote.created_at).toLocaleDateString()}</TableCell>
                  <TableCell onClick={(e) => e.stopPropagation()}>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" className="h-8 w-8 p-0">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <SafeDropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => navigate(`/employee-dashboard/cpq/quotes/${quote.id}`)}>
                          <Eye className="w-4 h-4 mr-2" />
                          View Quote
                        </DropdownMenuItem>
                        <DropdownMenuItem>
                          <Copy className="w-4 h-4 mr-2" />
                          Duplicate Quote
                        </DropdownMenuItem>
                      </SafeDropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))}
              {loading && (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-8 text-slate-500">
                    Loading quotes...
                  </TableCell>
                </TableRow>
              )}
              {!loading && filteredQuotes.length === 0 && (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-8 text-slate-500">
                    No quotes found.
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

export default Quotes;

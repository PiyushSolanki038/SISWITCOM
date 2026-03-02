import React, { useEffect, useState } from 'react';
import { 
  FileText, 
  Download, 
  ArrowRight,
  Search,
  Filter,
  Clock,
  CheckCircle2,
  XCircle,
  AlertCircle
} from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Link } from 'react-router-dom';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { customerService, CustomerQuote } from '../services/customerService';

const Quotes: React.FC = () => {
  const [quotes, setQuotes] = useState<CustomerQuote[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [activeTab, setActiveTab] = useState('all');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchQuotes = async () => {
      try {
        const data = await customerService.getQuotes();
        setQuotes(data);
      } catch (error) {
        console.error('Failed to fetch quotes:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchQuotes();
  }, []);

  const getFilteredQuotes = (statusFilter: string) => {
    return quotes.filter(quote => {
      const matchesSearch = 
        quote.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        quote.id.toLowerCase().includes(searchTerm.toLowerCase());
      
      if (!matchesSearch) return false;

      if (statusFilter === 'all') return true;
      if (statusFilter === 'active') return quote.status === 'Sent';
      return quote.status.toLowerCase() === statusFilter;
    });
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'Sent': return <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">Active</Badge>;
      case 'Accepted': return <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">Accepted</Badge>;
      case 'Rejected': return <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200">Rejected</Badge>;
      case 'Expired': return <Badge variant="outline" className="bg-slate-100 text-slate-600 border-slate-200">Expired</Badge>;
      default: return <Badge variant="outline">{status}</Badge>;
    }
  };

  const QuoteTable = ({ data }: { data: CustomerQuote[] }) => (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Quote ID</TableHead>
            <TableHead>Description</TableHead>
            <TableHead>Date</TableHead>
            <TableHead>Amount</TableHead>
            <TableHead>Valid Until</TableHead>
            <TableHead>Created By</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Next Step</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {data.length > 0 ? (
            data.map((quote) => (
              <TableRow key={quote.id}>
                <TableCell className="font-medium">
                  <div className="flex items-center gap-2">
                    <FileText size={16} className="text-slate-400" />
                    {quote.id}
                  </div>
                </TableCell>
                <TableCell className="max-w-[200px] truncate">{quote.title}</TableCell>
                <TableCell>{quote.date}</TableCell>
                <TableCell className="font-medium">{quote.amount}</TableCell>
                <TableCell className="text-slate-500 text-sm">
                  {quote.validUntil}
                </TableCell>
                <TableCell className="text-slate-500 text-sm">
                  {quote.createdBy}
                </TableCell>
                <TableCell>{getStatusBadge(quote.status)}</TableCell>
                <TableCell className="text-xs text-slate-500 max-w-[150px]">
                  {quote.nextStep}
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex justify-end gap-2">
                    <Button variant="ghost" size="sm" asChild>
                      <Link to={`/customer-dashboard/quotes/${quote.id}`}>Review</Link>
                    </Button>
                    <Button variant="ghost" size="icon">
                      <Download size={16} />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))
          ) : (
            <TableRow>
              <TableCell colSpan={9} className="text-center py-8 text-slate-500">
                No quotes found.
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-3xl font-bold tracking-tight text-[#1A3C34]">Quotes</h2>
          <p className="text-slate-500 mt-2">Review your commercial offers and proposals.</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" asChild>
            <Link to="/customer-dashboard/quotes/history">View History</Link>
          </Button>
        </div>
      </div>

      <div className="flex items-center gap-4">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-slate-500" />
          <Input 
            placeholder="Search quotes..." 
            className="pl-9" 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <Button variant="outline" className="gap-2">
          <Filter size={16} />
          Filter
        </Button>
      </div>

      <Tabs defaultValue="all" value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-2 md:w-auto md:grid-cols-5 bg-slate-100">
          <TabsTrigger value="all">All Quotes</TabsTrigger>
          <TabsTrigger value="active">Active</TabsTrigger>
          <TabsTrigger value="accepted">Accepted</TabsTrigger>
          <TabsTrigger value="rejected">Rejected</TabsTrigger>
          <TabsTrigger value="expired">Expired</TabsTrigger>
        </TabsList>
        
        <TabsContent value="all" className="mt-6">
          <QuoteTable data={getFilteredQuotes('all')} />
        </TabsContent>
        <TabsContent value="active" className="mt-6">
          <QuoteTable data={getFilteredQuotes('active')} />
        </TabsContent>
        <TabsContent value="accepted" className="mt-6">
          <QuoteTable data={getFilteredQuotes('accepted')} />
        </TabsContent>
        <TabsContent value="rejected" className="mt-6">
          <QuoteTable data={getFilteredQuotes('rejected')} />
        </TabsContent>
        <TabsContent value="expired" className="mt-6">
          <QuoteTable data={getFilteredQuotes('expired')} />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Quotes;

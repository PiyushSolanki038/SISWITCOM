import React, { useEffect, useState } from 'react';
import { 
  History, 
  Search,
  Filter,
  Eye,
  FileText
} from 'lucide-react';
import { Card } from '@/components/ui/card';
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
import { customerService, CustomerQuote } from '../services/customerService';

const QuoteHistory: React.FC = () => {
  const [quotes, setQuotes] = useState<CustomerQuote[]>([]);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    // In a real app, this might fetch from a specific history endpoint
    // For now, we filter local quotes for "past" statuses
    const allQuotes = customerService.getQuotes();
    const historyQuotes = allQuotes.filter(q => 
      ['Accepted', 'Rejected', 'Expired'].includes(q.status)
    );
    setQuotes(historyQuotes);
  }, []);

  const filteredQuotes = quotes.filter(quote => 
    quote.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    quote.id.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'Accepted': return <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">Accepted</Badge>;
      case 'Rejected': return <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200">Rejected</Badge>;
      case 'Expired': return <Badge variant="outline" className="bg-slate-100 text-slate-500">Expired</Badge>;
      default: return <Badge variant="outline">{status}</Badge>;
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold tracking-tight text-[#1A3C34]">Quote History</h2>
        <p className="text-slate-500 mt-2">View archive of all past quotes.</p>
      </div>

      <div className="flex items-center gap-4">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-slate-500" />
          <Input 
            placeholder="Search history..." 
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

      <Card>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Date</TableHead>
              <TableHead>Quote ID</TableHead>
              <TableHead>Title</TableHead>
              <TableHead>Amount</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredQuotes.length > 0 ? (
              filteredQuotes.map((quote) => (
                <TableRow key={quote.id}>
                  <TableCell>{quote.date}</TableCell>
                  <TableCell className="font-medium">{quote.id}</TableCell>
                  <TableCell>{quote.title}</TableCell>
                  <TableCell>{quote.amount}</TableCell>
                  <TableCell>{getStatusBadge(quote.status)}</TableCell>
                  <TableCell className="text-right">
                    <Button variant="ghost" size="sm" asChild>
                      <Link to={`/customer-dashboard/quotes/${quote.id}`}>
                        <Eye size={16} className="mr-2" />
                        View
                      </Link>
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-12 text-slate-500">
                  <div className="flex flex-col items-center justify-center gap-2">
                    <History className="h-8 w-8 text-slate-300" />
                    <p>No quote history found.</p>
                  </div>
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </Card>
    </div>
  );
};

export default QuoteHistory;
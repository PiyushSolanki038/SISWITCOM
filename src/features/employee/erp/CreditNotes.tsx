import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { erpService } from './erpService';
import { ERPCreditNote } from './types';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, Plus, Filter, Download } from "lucide-react";
import { format } from 'date-fns';

const CreditNotes = () => {
  const [creditNotes, setCreditNotes] = useState<ERPCreditNote[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    fetchCreditNotes();
  }, []);

  const fetchCreditNotes = async () => {
    try {
      const data = await erpService.getCreditNotes();
      setCreditNotes(data);
    } catch (error) {
      console.error('Failed to fetch credit notes:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'applied': return 'default';
      case 'refunded': return 'secondary';
      case 'issued': return 'outline';
      case 'draft': return 'outline';
      default: return 'outline';
    }
  };

  const filteredNotes = creditNotes.filter(note => 
    note.creditNoteNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
    note.accountId?.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Credit Notes</h1>
          <p className="text-muted-foreground">Manage refunds and credit adjustments.</p>
        </div>
        <div className="flex gap-2">
           <Button variant="outline">
            <Download className="mr-2 h-4 w-4" />
            Export
          </Button>
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            New Credit Note
          </Button>
        </div>
      </div>

      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <CardTitle>Credit Notes List</CardTitle>
            <div className="flex items-center gap-2">
              <div className="relative w-64">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input 
                  placeholder="Search credit notes..." 
                  className="pl-8" 
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              <Button variant="outline" size="icon">
                <Filter className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {loading ? (
             <div className="text-center py-10">Loading credit notes...</div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Credit Note #</TableHead>
                  <TableHead>Customer</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Reason</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Amount</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredNotes.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                      No credit notes found.
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredNotes.map((note) => (
                    <TableRow key={note._id} className="cursor-pointer" onClick={() => navigate(`/employee-dashboard/erp/credit-notes/${note._id}`)}>
                      <TableCell className="font-medium">{note.creditNoteNumber}</TableCell>
                      <TableCell>{note.accountId?.name || 'Unknown'}</TableCell>
                      <TableCell>{format(new Date(note.createdAt), 'MMM dd, yyyy')}</TableCell>
                      <TableCell>{note.reason}</TableCell>
                      <TableCell>
                        <Badge variant={getStatusColor(note.status) as any}>
                          {note.status.charAt(0).toUpperCase() + note.status.slice(1)}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right font-medium">
                        {new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(note.amount)}
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default CreditNotes;

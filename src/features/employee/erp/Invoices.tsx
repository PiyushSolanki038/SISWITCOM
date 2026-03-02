import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { erpService } from './erpService';
import { ERPInvoice } from './types';
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
import { Search, Plus, Filter, Download, MoreHorizontal, FileText, Send } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Skeleton } from "@/components/ui/skeleton";
import { format } from 'date-fns';
import { useToast } from "@/components/ui/use-toast";
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

const Invoices = () => {
  const { toast } = useToast();
  const navigate = useNavigate();
  const [invoices, setInvoices] = useState<ERPInvoice[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;
  const [emailOpen, setEmailOpen] = useState(false);
  const [emailTo, setEmailTo] = useState('');
  const [emailNote, setEmailNote] = useState('');
  const [selectedInvoiceId, setSelectedInvoiceId] = useState<string | null>(null);

  useEffect(() => {
    fetchInvoices();
  }, []);

  const fetchInvoices = async () => {
    try {
      const data = await erpService.getInvoices();
      setInvoices(data);
    } catch (error) {
      console.error('Failed to fetch invoices:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'paid': return 'default';
      case 'sent': return 'secondary';
      case 'draft': return 'outline';
      case 'overdue': return 'destructive';
      case 'void': return 'destructive';
      default: return 'outline';
    }
  };

  const filteredInvoices = invoices.filter(invoice => {
    const matchesSearch = invoice.invoiceNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
    invoice.accountId?.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || invoice.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const totalPages = Math.ceil(filteredInvoices.length / itemsPerPage);
  const paginatedInvoices = filteredInvoices.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const handleRecordPayment = async (invoice: ERPInvoice) => {
    try {
        if (confirm(`Record full payment for ${invoice.invoiceNumber}?`)) {
            await erpService.createPayment({
                invoiceId: invoice._id,
                accountId: invoice.accountId._id,
                amount: invoice.amount,
                paymentMethod: 'bank_transfer',
                status: 'completed',
                paymentDate: new Date().toISOString()
            });
            toast({
              title: "Success",
              description: "Payment recorded successfully!",
            });
            // Refresh invoices
            fetchInvoices();
        }
    } catch (error) {
        console.error("Failed to record payment", error);
        toast({
          title: "Error",
          description: "Failed to record payment",
          variant: "destructive",
        });
    }
  };
  
  const openEmailDialog = (invoice: ERPInvoice) => {
    setSelectedInvoiceId(invoice._id);
    setEmailTo(invoice?.accountId?.email || '');
    setEmailNote('');
    setEmailOpen(true);
  };
  
  const sendInvoiceEmail = async () => {
    if (!selectedInvoiceId) return;
    try {
      if (!emailTo) {
        toast({ title: 'Enter recipient email', variant: 'destructive' });
        return;
      }
      await erpService.sendInvoiceEmail(selectedInvoiceId, { email: emailTo, note: emailNote });
      setEmailOpen(false);
      setSelectedInvoiceId(null);
      setEmailTo('');
      setEmailNote('');
      await fetchInvoices();
      toast({ title: 'Invoice emailed' });
    } catch {
      toast({ title: 'Failed to email invoice', variant: 'destructive' });
    }
  };

  if (loading) {
    return (
      <div className="p-6 space-y-6">
        <div className="flex justify-between items-center">
            <div className="space-y-2">
                <Skeleton className="h-8 w-[200px]" />
                <Skeleton className="h-4 w-[300px]" />
            </div>
        </div>
        <Card>
            <CardHeader>
                <div className="flex justify-between">
                    <Skeleton className="h-6 w-[150px]" />
                    <Skeleton className="h-9 w-[250px]" />
                </div>
            </CardHeader>
            <CardContent>
                <div className="space-y-4">
                    {[1, 2, 3, 4, 5].map((i) => (
                        <Skeleton key={i} className="h-16 w-full" />
                    ))}
                </div>
            </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Invoices</h1>
          <p className="text-muted-foreground">Manage customer invoices and payments.</p>
        </div>
        <div className="flex gap-2">
           <Button variant="outline">
            <Download className="mr-2 h-4 w-4" />
            Export
          </Button>
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            Create Invoice
          </Button>
        </div>
      </div>

      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <CardTitle>Invoices List</CardTitle>
            <div className="flex items-center gap-2">
              <div className="relative w-64">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input 
                  placeholder="Search invoices..." 
                  className="pl-8" 
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-[180px]">
                  <Filter className="mr-2 h-4 w-4" />
                  <SelectValue placeholder="Filter by status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Statuses</SelectItem>
                  <SelectItem value="draft">Draft</SelectItem>
                  <SelectItem value="sent">Sent</SelectItem>
                  <SelectItem value="paid">Paid</SelectItem>
                  <SelectItem value="overdue">Overdue</SelectItem>
                  <SelectItem value="void">Void</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardHeader>
        <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Invoice #</TableHead>
                  <TableHead>Customer</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Due Date</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Amount</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {paginatedInvoices.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-12 text-muted-foreground">
                      <div className="flex flex-col items-center justify-center space-y-3">
                        <FileText className="h-12 w-12 text-muted-foreground/50" />
                        <p className="text-lg font-medium">No invoices found</p>
                        <p className="text-sm text-muted-foreground">
                          {searchTerm || statusFilter !== 'all' 
                            ? "Try adjusting your search or filters"
                            : "New invoices will appear here"}
                        </p>
                      </div>
                    </TableCell>
                  </TableRow>
                ) : (
                  paginatedInvoices.map((invoice) => (
                    <TableRow key={invoice._id}>
                      <TableCell className="font-medium">{invoice.invoiceNumber}</TableCell>
                      <TableCell>{invoice.accountId?.name || 'Unknown'}</TableCell>
                      <TableCell>{format(new Date(invoice.createdAt), 'MMM dd, yyyy')}</TableCell>
                      <TableCell>{format(new Date(invoice.dueDate), 'MMM dd, yyyy')}</TableCell>
                      <TableCell>
                        <Badge variant={getStatusColor(invoice.status) as any}>
                          {invoice.status.charAt(0).toUpperCase() + invoice.status.slice(1)}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right font-medium">
                        {new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(invoice.amount)}
                      </TableCell>
                      <TableCell className="text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuLabel>Actions</DropdownMenuLabel>
                            <DropdownMenuItem onClick={() => navigate(`/employee-dashboard/erp/invoices/${invoice._id}`)}>View Details</DropdownMenuItem>
                            <DropdownMenuItem onClick={() => openEmailDialog(invoice)}><Send className="mr-2 h-4 w-4" /> Send Invoice</DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handleRecordPayment(invoice)}>Record Payment</DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem>Send Reminder</DropdownMenuItem>
                            <DropdownMenuItem className="text-destructive">Void Invoice</DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
        </CardContent>
      </Card>
      
      <Dialog open={emailOpen} onOpenChange={setEmailOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Send Invoice</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <div className="text-sm font-medium">Recipient Email</div>
              <Input type="email" placeholder="customer@example.com" value={emailTo} onChange={(e) => setEmailTo(e.target.value)} />
              <div className="text-xs text-muted-foreground">You can enter an email even if no customer/contact exists.</div>
            </div>
            <div className="space-y-2">
              <div className="text-sm font-medium">Note (optional)</div>
              <Input placeholder="Add a short note" value={emailNote} onChange={(e) => setEmailNote(e.target.value)} />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEmailOpen(false)}>Cancel</Button>
            <Button onClick={sendInvoiceEmail} disabled={!emailTo}>Send</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Invoices;

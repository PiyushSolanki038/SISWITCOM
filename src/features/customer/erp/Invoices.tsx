import React, { useEffect, useState } from 'react';
import { customerErpService } from './erpService';
import { ERPInvoice } from './types';
import { useAuth } from '@/context/AuthContext';
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
import { Search, Download, CreditCard, FileText } from "lucide-react";
import { format } from 'date-fns';
import { useToast } from "@/components/ui/use-toast";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";

const Invoices = () => {
  const { user } = useAuth();
  const [invoices, setInvoices] = useState<ERPInvoice[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const { toast } = useToast();
  const [statusFilter, setStatusFilter] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedInvoice, setSelectedInvoice] = useState<ERPInvoice | null>(null);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);
  const itemsPerPage = 10;

  useEffect(() => {
    if (user?.id) {
      fetchInvoices();
    }
  }, [user?.id]);

  const fetchInvoices = async () => {
    try {
      if (!user?.id) return;
      const data = await customerErpService.getMyInvoices(user.id);
      setInvoices(data);
    } catch (error) {
      console.error('Failed to fetch invoices:', error);
      toast({
        title: "Error",
        description: "Failed to load invoices. Please try again.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'paid': return 'default'; // default is primary (blue/black)
      case 'sent': return 'secondary';
      case 'draft': return 'outline';
      case 'overdue': return 'destructive';
      case 'void': return 'destructive';
      default: return 'outline';
    }
  };

  const filteredInvoices = invoices.filter(invoice => {
    const matchesSearch = invoice.invoiceNumber.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || invoice.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const handleViewDetails = (invoice: ERPInvoice) => {
    setSelectedInvoice(invoice);
    setIsDetailsOpen(true);
  };

  const totalPages = Math.ceil(filteredInvoices.length / itemsPerPage);
  const paginatedInvoices = filteredInvoices.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const handlePay = async (invoice: ERPInvoice) => {
    try {
        if (confirm(`Pay invoice ${invoice.invoiceNumber} for ${new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(invoice.grandTotal)}?`)) {
            await customerErpService.payInvoice(invoice._id);
            toast({
                title: "Payment Successful",
                description: `Invoice ${invoice.invoiceNumber} has been paid.`,
            });
            fetchInvoices();
        }
    } catch (error) {
        console.error("Payment failed", error);
        toast({
            title: "Payment Failed",
            description: "There was an error processing your payment.",
            variant: "destructive"
        });
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
          <h1 className="text-3xl font-bold tracking-tight">My Invoices</h1>
          <p className="text-muted-foreground">View and pay your invoices.</p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <CardTitle>Invoice History</CardTitle>
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
                  <TableHead>Date</TableHead>
                  <TableHead>Due Date</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Amount</TableHead>
                  <TableHead className="text-right">Action</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {paginatedInvoices.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-12 text-muted-foreground">
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
                    <TableRow key={invoice._id} className="cursor-pointer hover:bg-muted/50" onClick={() => handleViewDetails(invoice)}>
                      <TableCell className="font-medium">{invoice.invoiceNumber}</TableCell>
                      <TableCell>{format(new Date(invoice.createdAt), 'MMM dd, yyyy')}</TableCell>
                      <TableCell>{format(new Date(invoice.dueDate), 'MMM dd, yyyy')}</TableCell>
                      <TableCell>
                        <Badge variant={getStatusColor(invoice.status) as any}>
                          {invoice.status.charAt(0).toUpperCase() + invoice.status.slice(1)}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right font-medium">
                        {new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(invoice.grandTotal)}
                      </TableCell>
                      <TableCell className="text-right">
                        {invoice.status !== 'paid' && invoice.status !== 'void' ? (
                            <Button size="sm" onClick={(e) => {
                                e.stopPropagation();
                                handlePay(invoice);
                            }}>
                                <CreditCard className="mr-2 h-4 w-4" />
                                Pay
                            </Button>
                        ) : (
                            <Button size="sm" variant="outline" onClick={(e) => {
                                e.stopPropagation();
                                handleViewDetails(invoice);
                            }}>
                                View
                            </Button>
                        )}
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
        </CardContent>
      </Card>

      <Sheet open={isDetailsOpen} onOpenChange={setIsDetailsOpen}>
        <SheetContent className="sm:max-w-xl overflow-y-auto">
          <SheetHeader>
            <SheetTitle>Invoice Details</SheetTitle>
            <SheetDescription>
              View detailed information for invoice {selectedInvoice?.invoiceNumber}
            </SheetDescription>
          </SheetHeader>
          
          {selectedInvoice && (
            <div className="mt-6 space-y-6">
              {/* Status and Dates */}
              <div className="flex justify-between items-center bg-secondary/20 p-4 rounded-lg">
                <div className="space-y-1">
                  <span className="text-sm text-muted-foreground">Status</span>
                  <div>
                    <Badge variant={getStatusColor(selectedInvoice.status) as any}>
                      {selectedInvoice.status.toUpperCase()}
                    </Badge>
                  </div>
                </div>
                <div className="text-right space-y-1">
                   <span className="text-sm text-muted-foreground">Due Date</span>
                   <div className="font-medium">
                     {format(new Date(selectedInvoice.dueDate), 'MMM dd, yyyy')}
                   </div>
                </div>
              </div>

              {/* Line Items */}
              <div>
                <h3 className="text-sm font-semibold mb-3">Line Items</h3>
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Item</TableHead>
                            <TableHead className="text-right">Qty</TableHead>
                            <TableHead className="text-right">Price</TableHead>
                            <TableHead className="text-right">Total</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {selectedInvoice.items?.map((item: any, i: number) => (
                            <TableRow key={i}>
                                <TableCell>{item.description || 'Service'}</TableCell>
                                <TableCell className="text-right">{item.quantity}</TableCell>
                                <TableCell className="text-right">${item.unitPrice}</TableCell>
                                <TableCell className="text-right">${item.total}</TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
              </div>

              {/* Totals */}
              <div className="space-y-2 pt-4 border-t">
                 <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Subtotal</span>
                    <span>${selectedInvoice.subtotal?.toFixed(2)}</span>
                 </div>
                 <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Tax</span>
                    <span>${selectedInvoice.taxTotal?.toFixed(2)}</span>
                 </div>
                 <div className="flex justify-between font-bold text-lg pt-2">
                    <span>Grand Total</span>
                    <span>${selectedInvoice.grandTotal?.toFixed(2)}</span>
                 </div>
              </div>

              {/* Actions */}
              {selectedInvoice.status !== 'paid' && selectedInvoice.status !== 'void' && (
                  <Button className="w-full mt-4" onClick={() => {
                      setIsDetailsOpen(false);
                      handlePay(selectedInvoice);
                  }}>
                      <CreditCard className="mr-2 h-4 w-4" />
                      Pay Now ${selectedInvoice.grandTotal?.toFixed(2)}
                  </Button>
              )}
            </div>
          )}
        </SheetContent>
      </Sheet>
    </div>
  );
};

export default Invoices;
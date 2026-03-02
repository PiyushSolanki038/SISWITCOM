import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { erpService } from './erpService';
import { ERPOrder } from './types';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, Plus, Filter, Download, MoreHorizontal, FileText, Send, CreditCard, Truck, RotateCcw, ChevronRight } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Skeleton } from "@/components/ui/skeleton";
import { formatCurrency } from "@/lib/utils";
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
import { crmService, type Account } from "@/features/employee/services/crmService";

const Orders = () => {
  const { toast } = useToast();
  const navigate = useNavigate();
  const [orders, setOrders] = useState<ERPOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;
  const [newOrder, setNewOrder] = useState<{ accountId: string; currency: string; grandTotal: string }>({ accountId: '', currency: 'USD', grandTotal: '' });
  const [openCreate, setOpenCreate] = useState(false);
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [loadingAccounts, setLoadingAccounts] = useState(false);

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      const data = await erpService.getOrders();
      setOrders(data);
    } catch (error) {
      console.error('Failed to fetch orders:', error);
    } finally {
      setLoading(false);
    }
  };
  
  useEffect(() => {
    const loadAccounts = async () => {
      if (!openCreate) return;
      try {
        setLoadingAccounts(true);
        const data = await crmService.getAccounts();
        setAccounts(data);
      } catch (e) {
        // silent fail; dialog shows empty dropdown
      } finally {
        setLoadingAccounts(false);
      }
    };
    loadAccounts();
  }, [openCreate]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'default'; // primary
      case 'shipped': return 'secondary';
      case 'fulfillment': return 'secondary';
      case 'confirmed': return 'outline';
      case 'cancelled': return 'destructive';
      default: return 'outline';
    }
  };
  
  const getPaymentStatusColor = (status: string) => {
    switch (status) {
      case 'paid': return 'default';
      case 'partial': return 'secondary';
      case 'overdue': return 'destructive';
      default: return 'outline';
    }
  };

  const filteredOrders = orders.filter(order => {
    const matchesSearch = order.orderNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
    order.accountId?.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || order.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const totalPages = Math.ceil(filteredOrders.length / itemsPerPage);
  const paginatedOrders = filteredOrders.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const handleGenerateInvoice = async (order: ERPOrder) => {
    try {
        if (order.status !== 'confirmed') {
          toast({ title: 'Not allowed', description: 'Confirm order before generating invoice', variant: 'destructive' });
          return;
        }
        if (confirm(`Generate invoice for order ${order.orderNumber}?`)) {
            await erpService.createInvoice({
                orderId: order._id,
                accountId: order.accountId._id,
                items: order.items,
                subtotal: order.subtotal,
                taxTotal: order.taxTotal,
                grandTotal: order.grandTotal,
                status: 'draft',
                dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString()
            });
            toast({
              title: "Success",
              description: "Invoice generated successfully!",
            });
            // Refresh orders if needed or navigate to invoices
        }
    } catch (error) {
        console.error("Failed to generate invoice", error);
        toast({
          title: "Error",
          description: "Failed to generate invoice",
          variant: "destructive",
        });
    }
  };
  
  const handleEmailOrder = async (order: ERPOrder) => {
    try {
      await erpService.sendOrderEmail((order as any)._id || (order as any).id);
      toast({ title: 'Order confirmation emailed' });
    } catch {
      toast({ title: 'Failed to email order', variant: 'destructive' });
    }
  };
  
  const handleDownloadPdf = async (order: ERPOrder) => {
    try {
      const full = await erpService.getOrder((order as any)._id || (order as any).id);
      const html2pdf = (await import('html2pdf.js')).default;
      const currency = full.currency || 'USD';
      const container = document.createElement('div');
      container.style.padding = '16px';
      container.innerHTML = `
        <div style="font-family:Segoe UI,Arial,sans-serif;color:#333;">
          <h2 style="margin:0 0 8px;">Order ${full.orderNumber}</h2>
          <div style="margin:6px 0 12px;">Customer: <strong>${full.accountId?.name || ''}</strong></div>
          <table style="border-collapse:collapse;width:100%;margin:12px 0;">
            <thead>
              <tr>
                <th style="padding:6px 8px;border:1px solid #eee;text-align:left;">Product</th>
                <th style="padding:6px 8px;border:1px solid #eee;text-align:right;">Qty</th>
                <th style="padding:6px 8px;border:1px solid #eee;text-align:right;">Unit Price</th>
                <th style="padding:6px 8px;border:1px solid #eee;text-align:right;">Total</th>
              </tr>
            </thead>
            <tbody>
              ${(full.items || []).map(i => `
                <tr>
                  <td style="padding:6px 8px;border:1px solid #eee;">${i.name || i.productId}</td>
                  <td style="padding:6px 8px;border:1px solid #eee;text-align:right;">${i.quantity}</td>
                  <td style="padding:6px 8px;border:1px solid #eee;text-align:right;">${Number(i.unitPrice||0).toLocaleString('en-US',{style:'currency',currency})}</td>
                  <td style="padding:6px 8px;border:1px solid #eee;text-align:right;">${Number(i.total||0).toLocaleString('en-US',{style:'currency',currency})}</td>
                </tr>
              `).join('')}
            </tbody>
          </table>
          <div style="margin:8px 0;">Subtotal: <strong>${Number(full.subtotal||0).toLocaleString('en-US',{style:'currency',currency})}</strong></div>
          <div style="margin:8px 0;">Tax: <strong>${Number(full.taxTotal||0).toLocaleString('en-US',{style:'currency',currency})}</strong></div>
          <div style="margin:8px 0;">Grand Total: <strong>${Number(full.grandTotal||0).toLocaleString('en-US',{style:'currency',currency})}</strong></div>
        </div>
      `;
      document.body.appendChild(container);
      await html2pdf().set({
        margin: 0.5,
        filename: `Order-${full.orderNumber}.pdf`,
        image: { type: 'jpeg', quality: 0.98 },
        html2canvas: { scale: 2 },
        jsPDF: { unit: 'in', format: 'a4', orientation: 'portrait' }
      }).from(container).save();
      document.body.removeChild(container);
    } catch {
      toast({ title: 'Failed to download PDF', variant: 'destructive' });
    }
  };
  
  const getOrderId = (order: ERPOrder) => (order as any)._id || (order as any).id;
  
  const handleCancelOrder = async (orderId: string) => {
    try {
      await erpService.updateOrder(orderId, { status: 'cancelled' } as any);
      await fetchOrders();
      toast({ title: 'Order cancelled' });
    } catch {
      toast({ title: 'Failed to cancel order', variant: 'destructive' });
    }
  };

  const handleConfirmOrder = async (orderId: string) => {
    try {
      await erpService.confirmOrder(orderId);
      await fetchOrders();
      toast({ title: 'Order confirmed' });
    } catch {
      toast({ title: 'Failed to confirm order', variant: 'destructive' });
    }
  };
  
  const handleCreateOrder = async () => {
    try {
      if (!newOrder.accountId || !newOrder.currency || !newOrder.grandTotal) return;
      const data: any = {
        accountId: newOrder.accountId,
        items: [],
        subtotal: Number(newOrder.grandTotal),
        taxTotal: 0,
        grandTotal: Number(newOrder.grandTotal),
        currency: newOrder.currency,
        status: 'draft',
        paymentStatus: 'unpaid',
        fulfillmentStatus: 'pending'
      };
      await erpService.createOrder(data);
      setOpenCreate(false);
      setNewOrder({ accountId: '', currency: 'USD', grandTotal: '' });
      await fetchOrders();
      toast({ title: 'Order created' });
    } catch {
      toast({ title: 'Failed to create order', variant: 'destructive' });
    }
  };
  
  const handleDuplicateOrder = async (order: ERPOrder) => {
    try {
      const data: any = {
        accountId: order.accountId._id,
        items: order.items,
        subtotal: order.subtotal,
        taxTotal: order.taxTotal,
        grandTotal: order.grandTotal,
        currency: order.currency,
        status: 'draft',
        paymentStatus: 'unpaid',
        fulfillmentStatus: 'pending'
      };
      const created = await erpService.createOrder(data);
      toast({ title: 'Order duplicated' });
      navigate(`/employee-dashboard/erp/orders/${(created as any)._id || (created as any).id}`);
    } catch {
      toast({ title: 'Failed to duplicate order', variant: 'destructive' });
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
          <h1 className="text-3xl font-bold tracking-tight">Sales Orders</h1>
          <p className="text-muted-foreground">Manage and track all customer orders.</p>
        </div>
        <div className="flex gap-2">
           <Button variant="outline">
            <Download className="mr-2 h-4 w-4" />
            Export
          </Button>
          <Button onClick={() => setOpenCreate(true)}>
            <Plus className="mr-2 h-4 w-4" />
            Create Order
          </Button>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Order Workflow</CardTitle>
          <CardDescription>End-to-end lifecycle from order to credit note.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col md:flex-row items-center justify-between gap-4 md:gap-6">
            <div className="flex flex-col items-center">
              <FileText className="h-7 w-7 text-primary" />
              <div className="mt-1 text-sm font-medium">Order</div>
            </div>
            <ChevronRight className="hidden md:block h-5 w-5 text-muted-foreground" />
            <div className="flex flex-col items-center">
              <FileText className="h-7 w-7 text-primary" />
              <div className="mt-1 text-sm font-medium">Invoice</div>
            </div>
            <ChevronRight className="hidden md:block h-5 w-5 text-muted-foreground" />
            <div className="flex flex-col items-center">
              <CreditCard className="h-7 w-7 text-primary" />
              <div className="mt-1 text-sm font-medium">Payment</div>
            </div>
            <ChevronRight className="hidden md:block h-5 w-5 text-muted-foreground" />
            <div className="flex flex-col items-center">
              <Truck className="h-7 w-7 text-primary" />
              <div className="mt-1 text-sm font-medium">Fulfillment</div>
            </div>
            <ChevronRight className="hidden md:block h-5 w-5 text-muted-foreground" />
            <div className="flex flex-col items-center">
              <RotateCcw className="h-7 w-7 text-primary" />
              <div className="mt-1 text-sm font-medium">Credit Note</div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <CardTitle>Orders List</CardTitle>
            <div className="flex items-center gap-2">
              <div className="relative w-64">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input 
                  placeholder="Search orders..." 
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
                  <SelectItem value="completed">Completed</SelectItem>
                  <SelectItem value="shipped">Shipped</SelectItem>
                  <SelectItem value="fulfillment">Fulfillment</SelectItem>
                  <SelectItem value="confirmed">Confirmed</SelectItem>
                  <SelectItem value="cancelled">Cancelled</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardHeader>
        <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Order #</TableHead>
                  <TableHead>Customer</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Payment</TableHead>
                  <TableHead>Fulfillment</TableHead>
                  <TableHead className="text-right">Total</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {paginatedOrders.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={8} className="text-center py-12 text-muted-foreground">
                      <div className="flex flex-col items-center justify-center space-y-3">
                        <FileText className="h-12 w-12 text-muted-foreground/50" />
                        <p className="text-lg font-medium">No orders found</p>
                        <p className="text-sm text-muted-foreground">
                          {searchTerm || statusFilter !== 'all' 
                            ? "Try adjusting your search or filters"
                            : "New orders will appear here"}
                        </p>
                      </div>
                    </TableCell>
                  </TableRow>
                ) : (
                  paginatedOrders.map((order) => (
                    <TableRow key={getOrderId(order)}>
                      <TableCell className="font-medium text-primary hover:underline cursor-pointer" onClick={() => navigate(`/employee-dashboard/erp/orders/${getOrderId(order)}`)}>{order.orderNumber}</TableCell>
                      <TableCell>{order.accountId?.name || 'Unknown'}</TableCell>
                      <TableCell>{format(new Date(order.createdAt), 'MMM dd, yyyy')}</TableCell>
                      <TableCell>
                        <Badge variant={getStatusColor(order.status) as any}>
                          {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge variant={getPaymentStatusColor(order.paymentStatus) as any}>
                          {order.paymentStatus.charAt(0).toUpperCase() + order.paymentStatus.slice(1)}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <span className="text-sm text-muted-foreground">
                          {order.fulfillmentStatus.charAt(0).toUpperCase() + order.fulfillmentStatus.slice(1)}
                        </span>
                      </TableCell>
                      <TableCell className="text-right font-medium">
                        {new Intl.NumberFormat('en-US', { style: 'currency', currency: order.currency }).format(order.grandTotal)}
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
                            <DropdownMenuItem onClick={() => navigate(`/employee-dashboard/erp/orders/${getOrderId(order)}`)}>View Details</DropdownMenuItem>
                            {order.status === 'draft' && (
                              <DropdownMenuItem onClick={() => handleConfirmOrder(getOrderId(order))}>Confirm Order</DropdownMenuItem>
                            )}
                            <DropdownMenuItem onClick={() => navigate(`/employee-dashboard/erp/fulfillment/${getOrderId(order)}`)}>View Fulfillment</DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem onClick={() => handleGenerateInvoice(order)}>Generate Invoice</DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handleEmailOrder(order)}><Send className="mr-2 h-4 w-4" /> Email Confirmation</DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handleDownloadPdf(order)}><Download className="mr-2 h-4 w-4" /> Download PDF</DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handleDuplicateOrder(order)}>Duplicate Order</DropdownMenuItem>
                            <DropdownMenuItem className="text-destructive" onClick={() => handleCancelOrder(getOrderId(order))}>Cancel Order</DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>

            {totalPages > 1 && (
              <div className="mt-4">
                <Pagination>
                  <PaginationContent>
                    <PaginationItem>
                      <PaginationPrevious 
                        onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                        className={currentPage === 1 ? 'pointer-events-none opacity-50' : 'cursor-pointer'}
                      />
                    </PaginationItem>
                    
                    {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                      <PaginationItem key={page}>
                        <PaginationLink
                          isActive={currentPage === page}
                          onClick={() => setCurrentPage(page)}
                          className="cursor-pointer"
                        >
                          {page}
                        </PaginationLink>
                      </PaginationItem>
                    ))}

                    <PaginationItem>
                      <PaginationNext 
                        onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                        className={currentPage === totalPages ? 'pointer-events-none opacity-50' : 'cursor-pointer'}
                      />
                    </PaginationItem>
                  </PaginationContent>
                </Pagination>
              </div>
            )}
        </CardContent>
      </Card>
      
      <Dialog open={openCreate} onOpenChange={setOpenCreate}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create Order</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <div className="text-sm font-medium">Account</div>
              {loadingAccounts ? (
                <Skeleton className="h-10 w-full" />
              ) : (
                <Select value={newOrder.accountId} onValueChange={(v) => setNewOrder({ ...newOrder, accountId: v })}>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select account" />
                  </SelectTrigger>
                  <SelectContent>
                    {accounts.map(a => (
                      <SelectItem key={a._id} value={a._id}>{a.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            </div>
            <div className="space-y-2">
              <div className="text-sm font-medium">Currency</div>
              <Select value={newOrder.currency} onValueChange={(v) => setNewOrder({ ...newOrder, currency: v })}>
                <SelectTrigger className="w-[160px]">
                  <SelectValue placeholder="Currency" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="USD">USD</SelectItem>
                  <SelectItem value="EUR">EUR</SelectItem>
                  <SelectItem value="INR">INR</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <div className="text-sm font-medium">Grand Total</div>
              <Input placeholder="0.00" value={newOrder.grandTotal} onChange={(e) => setNewOrder({ ...newOrder, grandTotal: e.target.value })} />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setOpenCreate(false)}>Cancel</Button>
            <Button onClick={handleCreateOrder} disabled={!newOrder.accountId || !newOrder.currency || !newOrder.grandTotal}>Create</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Orders;

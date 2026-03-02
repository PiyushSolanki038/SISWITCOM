import React, { useEffect, useRef, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { erpService } from './erpService';
import { ERPOrder } from './types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/components/ui/use-toast';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Separator } from '@/components/ui/separator';
import { cpqService } from '@/features/employee/services/cpqService';
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbPage, BreadcrumbSeparator } from '@/components/ui/breadcrumb';
import { ArrowLeft, Mail, Download as DownloadIcon, Copy as DuplicateIcon, RotateCcw, Printer, Link2 } from 'lucide-react';
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { crmService } from '@/features/employee/services/crmService';

const OrderDetail = () => {
  const { id } = useParams();
  const [order, setOrder] = useState<ERPOrder | null>(null);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();
  const navigate = useNavigate();
  const printRef = useRef<HTMLDivElement | null>(null);
  const [emailOpen, setEmailOpen] = useState(false);
  const [emailNote, setEmailNote] = useState('');
  const [rmaOpen, setRmaOpen] = useState(false);
  const [rmaQty, setRmaQty] = useState<Record<string, number>>({});
  const [contactEmails, setContactEmails] = useState<Array<{ label: string; email: string }>>([]);
  const [selectedEmail, setSelectedEmail] = useState<string | undefined>(undefined);
  
  const load = async () => {
    if (!id) return;
    const o = await erpService.getOrder(id);
    setOrder(o);
    setLoading(false);
  };
  
  useEffect(() => {
    load();
  }, [id]);
  
  useEffect(() => {
    const loadContacts = async () => {
      try {
        if (!order?.accountId?.name) return;
        const contacts = await crmService.getContacts({ company: order.accountId.name });
        const list = (contacts || [])
          .filter((c: any) => !!c.email)
          .map((c: any) => ({ label: c.name ? `${c.name} <${c.email}>` : c.email, email: c.email }));
        setContactEmails(list);
        setSelectedEmail(list[0]?.email);
      } catch {}
    };
    loadContacts();
  }, [order?.accountId?.name]);
  
  const confirm = async () => {
    if (!order) return;
    await erpService.confirmOrder(order._id);
    toast({ title: 'Order confirmed' });
    await load();
  };
  
  const genInvoice = async () => {
    if (!order) return;
    await erpService.createInvoice({ orderId: order._id });
    toast({ title: 'Invoice created' });
    navigate('/employee-dashboard/erp/invoices');
  };
  
  const startFulfillment = async () => {
    if (!order) return;
    await erpService.startFulfillment(order._id);
    toast({ title: 'Fulfillment started' });
    await load();
  };
  
  const completeFulfillment = async () => {
    if (!order) return;
    await erpService.completeFulfillment(order._id);
    toast({ title: 'Fulfillment completed' });
    await load();
  };
  
  const cancelOrder = async () => {
    if (!order) return;
    await erpService.updateOrder(order._id, { status: 'cancelled' } as any);
    toast({ title: 'Order cancelled' });
    await load();
  };
  
  const duplicateOrder = async () => {
    if (!order) return;
    const payload: any = {
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
    const created = await erpService.createOrder(payload);
    toast({ title: 'Order duplicated' });
    navigate(`/employee-dashboard/erp/orders/${created._id || created.id}`);
  };
  
  const convertToQuote = async () => {
    if (!order) return;
    try {
      const data = {
        accountId: order.accountId._id,
        currency: order.currency,
        items: order.items.map(i => ({
          productId: i.productId,
          name: i.name,
          quantity: i.quantity,
          unitPrice: i.unitPrice,
          discount: 0,
          total: i.total
        })),
        status: 'draft',
        validUntil: new Date(Date.now() + 30*24*60*60*1000).toISOString()
      } as any;
      const quote = await cpqService.createQuote(data);
      toast({ title: 'Quote created from order' });
      navigate(`/employee-dashboard/cpq/quotes/${quote.id}`);
    } catch (e) {
      toast({ title: 'Failed to convert to quote', variant: 'destructive' });
    }
  };
  
  const createReturn = async () => {
    if (!order) return;
    try {
      const qtyMap = rmaQty;
      const lines = (order.items || []).map(it => {
        const q = Math.min(Math.max(Number(qtyMap[it.productId] || 0), 0), Number(it.quantity || 0));
        return { q, total: q * Number(it.unitPrice || 0) };
      });
      const amount = lines.reduce((s, l) => s + l.total, 0);
      if (amount <= 0) {
        toast({ title: 'Select at least one item qty', variant: 'destructive' });
        return;
      }
      const invoices = await erpService.getInvoices();
      const invoice = invoices.find(inv => inv.orderId === order._id);
      const note = await erpService.createCreditNote({ invoiceId: invoice?._id, accountId: order.accountId._id, amount, reason: 'Return (RMA)' });
      setRmaOpen(false);
      setRmaQty({});
      toast({ title: 'RMA created as credit note' });
      navigate(`/employee-dashboard/erp/credit-notes/${note._id}`);
    } catch {
      toast({ title: 'Failed to create return', variant: 'destructive' });
    }
  };
  
  const buildPrintableHtml = (o: ERPOrder) => {
    const currency = (o.currency || 'USD').toUpperCase();
    return `
      <!doctype html>
      <html>
      <head>
        <meta charset="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <title>Order ${o.orderNumber}</title>
        <style>
          * { box-sizing: border-box; }
          body { font-family: Segoe UI, Arial, sans-serif; color: #333; margin: 0; padding: 16px; }
          .header { display:flex; justify-content:space-between; align-items:center; border-bottom:2px solid #111; padding-bottom:8px; margin-bottom:12px; }
          .brand { font-size:22px; font-weight:700; }
          .subtle { font-size:12px; color:#666; }
          .row { display:flex; justify-content:space-between; gap:16px; margin-bottom:12px; }
          .col { flex:1; }
          .right { text-align: right; }
          table { border-collapse: collapse; width: 100%; margin: 12px 0; }
          th, td { padding: 8px; border: 1px solid #e5e7eb; }
          th { background: #f9fafb; text-align: left; }
          td.num, th.num { text-align: right; }
          .totals { display:flex; justify-content:flex-end; }
          .totals-inner { width: 280px; }
          .line { display:flex; justify-content:space-between; margin:6px 0; }
          .divider { height:1px; background:#e5e7eb; margin:8px 0; }
          @media print {
            @page { margin: 12mm; }
            a { text-decoration: none; color: inherit; }
          }
        </style>
      </head>
      <body>
        <div class="header">
          <div>
            <div class="brand">SISWIT</div>
            <div class="subtle">Sales Order</div>
          </div>
          <div class="subtle right">
            <div><strong>Order:</strong> ${o.orderNumber}</div>
            <div><strong>Date:</strong> ${new Date(o.createdAt).toLocaleDateString()}</div>
          </div>
        </div>
        <div class="row">
          <div class="col">
            <div style="font-weight:600;margin-bottom:6px;">Bill To</div>
            <div>${o.accountId?.name || ''}</div>
            ${o.accountId?.email ? `<div>${o.accountId.email}</div>` : ''}
          </div>
          <div class="col right">
            <div style="font-weight:600;margin-bottom:6px;">Status</div>
            <div>Order: ${o.status}</div>
            <div>Payment: ${o.paymentStatus}</div>
            <div>Fulfillment: ${o.fulfillmentStatus.replace('_',' ')}</div>
          </div>
        </div>
        <table>
          <thead>
            <tr>
              <th>Product</th>
              <th class="num">Qty</th>
              <th class="num">Unit Price</th>
              <th class="num">Total</th>
            </tr>
          </thead>
          <tbody>
            ${(o.items || []).map(i => `
              <tr>
                <td>${i.name || i.productId}</td>
                <td class="num">${i.quantity}</td>
                <td class="num">${Number(i.unitPrice||0).toLocaleString('en-US',{style:'currency',currency})}</td>
                <td class="num">${Number(i.total||0).toLocaleString('en-US',{style:'currency',currency})}</td>
              </tr>
            `).join('')}
          </tbody>
        </table>
        <div class="totals">
          <div class="totals-inner">
            <div class="line"><span>Subtotal</span><strong>${Number(o.subtotal||0).toLocaleString('en-US',{style:'currency',currency})}</strong></div>
            <div class="line"><span>Tax</span><strong>${Number(o.taxTotal||0).toLocaleString('en-US',{style:'currency',currency})}</strong></div>
            <div class="divider"></div>
            <div class="line" style="font-size:16px;"><span>Total</span><strong>${Number(o.grandTotal||0).toLocaleString('en-US',{style:'currency',currency})}</strong></div>
          </div>
        </div>
      </body>
      </html>
    `;
  };
  
  const downloadPdf = async () => {
    if (!order) return;
    try {
      const html2pdf = (await import('html2pdf.js')).default;
      const html = buildPrintableHtml(order);
      const container = document.createElement('div');
      container.innerHTML = html;
      document.body.appendChild(container);
      await html2pdf().set({
        margin: 0.5,
        filename: `Order-${order.orderNumber}.pdf`,
        image: { type: 'jpeg', quality: 0.98 },
        html2canvas: { scale: 2 },
        jsPDF: { unit: 'in', format: 'a4', orientation: 'portrait' }
      }).from(container).save();
      document.body.removeChild(container);
    } catch (e) {
      toast({ title: 'Failed to generate PDF', variant: 'destructive' });
    }
  };
  
  const printPage = () => {
    if (!order) return;
    (async () => {
      try {
        const html2pdf = (await import('html2pdf.js')).default;
        const html = buildPrintableHtml(order);
        const container = document.createElement('div');
        container.innerHTML = html;
        document.body.appendChild(container);
        await html2pdf()
          .set({
            margin: 0.5,
            filename: `Order-${order.orderNumber}.pdf`,
            image: { type: 'jpeg', quality: 0.98 },
            html2canvas: { scale: 2 },
            jsPDF: { unit: 'in', format: 'a4', orientation: 'portrait' }
          })
          .from(container)
          .toPdf()
          .get('pdf')
          .then((pdf: any) => {
            const url = pdf.output('bloburl');
            window.open(url, '_blank');
          });
        document.body.removeChild(container);
      } catch {
        toast({ title: 'Failed to prepare print', variant: 'destructive' });
      }
    })();
  };
  
  const copyLink = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href);
      toast({ title: 'Link copied to clipboard' });
    } catch {
      toast({ title: 'Failed to copy link', variant: 'destructive' });
    }
  };
  
  const emailOrder = async () => {
    if (!order) return;
    try {
      await erpService.sendOrderEmail(order._id, { email: selectedEmail, note: emailNote });
      setEmailOpen(false);
      setEmailNote('');
      toast({ title: 'Order email sent' });
    } catch {
      toast({ title: 'Failed to send email', variant: 'destructive' });
    }
  };
  
  if (loading) return <div className="p-6">Loading...</div>;
  if (!order) return <div className="p-6">Not found</div>;
  
  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <Breadcrumb>
          <BreadcrumbList>
            <BreadcrumbItem>
              <BreadcrumbLink href="#" onClick={(e) => { e.preventDefault(); navigate('/employee-dashboard/erp/orders'); }}>
                ERP
              </BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbLink href="#" onClick={(e) => { e.preventDefault(); navigate('/employee-dashboard/erp/orders'); }}>
                Orders
              </BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbPage>{order.orderNumber}</BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>
        <Button variant="ghost" onClick={() => navigate('/employee-dashboard/erp/orders')}><ArrowLeft className="h-4 w-4 mr-2" /> Back</Button>
      </div>
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Order {order.orderNumber}</h1>
          <p className="text-muted-foreground">{order.accountId?.name}</p>
        </div>
        <div className="flex gap-2">
          {order.status === 'draft' && <Button onClick={confirm}>Confirm</Button>}
          {order.status === 'confirmed' && <Button onClick={genInvoice}>Convert to Invoice</Button>}
          {order.fulfillmentStatus === 'pending' && <Button onClick={startFulfillment}>Start Fulfillment</Button>}
          {order.fulfillmentStatus === 'in_progress' && <Button onClick={completeFulfillment}>Complete Fulfillment</Button>}
          {order.status !== 'cancelled' && <Button variant="outline" onClick={cancelOrder}>Cancel Order</Button>}
          <Button variant="outline" onClick={duplicateOrder}><DuplicateIcon className="h-4 w-4 mr-2" /> Duplicate</Button>
          <Button variant="outline" onClick={convertToQuote}>Convert to Quote</Button>
          <Button variant="outline" onClick={() => setRmaOpen(true)}><RotateCcw className="h-4 w-4 mr-2" /> Create RMA</Button>
          <Button variant="outline" onClick={() => setEmailOpen(true)}><Mail className="h-4 w-4 mr-2" /> Email Confirmation</Button>
          <Button variant="outline" onClick={downloadPdf}><DownloadIcon className="h-4 w-4 mr-2" /> Download PDF</Button>
          <Button variant="outline" onClick={printPage}><Printer className="h-4 w-4 mr-2" /> Print</Button>
          <Button variant="outline" onClick={copyLink}><Link2 className="h-4 w-4 mr-2" /> Copy Link</Button>
        </div>
      </div>
      
      <div ref={printRef} className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader><CardTitle>Status</CardTitle></CardHeader>
          <CardContent className="space-y-2">
            <div className="flex items-center justify-between"><div>Order</div><Badge>{order.status}</Badge></div>
            <div className="flex items-center justify-between"><div>Payment</div><Badge>{order.paymentStatus}</Badge></div>
            <div className="flex items-center justify-between"><div>Fulfillment</div><Badge>{order.fulfillmentStatus.replace('_',' ')}</Badge></div>
          </CardContent>
        </Card>
        <Card className="md:col-span-2">
          <CardHeader><CardTitle>Summary</CardTitle></CardHeader>
          <CardContent className="space-y-2">
            <div className="flex items-center justify-between"><div>Subtotal</div><div>{new Intl.NumberFormat('en-US', { style: 'currency', currency: order.currency }).format(Number(order.subtotal || 0))}</div></div>
            <div className="flex items-center justify-between"><div>Tax</div><div>{new Intl.NumberFormat('en-US', { style: 'currency', currency: order.currency }).format(Number(order.taxTotal || 0))}</div></div>
            <Separator />
            <div className="flex items-center justify-between font-semibold"><div>Grand Total</div><div>{new Intl.NumberFormat('en-US', { style: 'currency', currency: order.currency }).format(Number(order.grandTotal || 0))}</div></div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader><CardTitle>Items</CardTitle></CardHeader>
        <CardContent>
          {(!order.items || order.items.length === 0) ? (
            <div className="text-sm text-muted-foreground">No items</div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Product</TableHead>
                  <TableHead className="text-right">Qty</TableHead>
                  <TableHead className="text-right">Unit Price</TableHead>
                  <TableHead className="text-right">Total</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {order.items.map((it, idx) => (
                  <TableRow key={`${it.productId || idx}-${idx}`}>
                    <TableCell className="font-medium">{it.name || it.productId}</TableCell>
                    <TableCell className="text-right">{it.quantity}</TableCell>
                    <TableCell className="text-right">{new Intl.NumberFormat('en-US', { style: 'currency', currency: order.currency }).format(Number(it.unitPrice || 0))}</TableCell>
                    <TableCell className="text-right">{new Intl.NumberFormat('en-US', { style: 'currency', currency: order.currency }).format(Number(it.total || 0))}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle>Timeline</CardTitle></CardHeader>
        <CardContent className="space-y-2">
          <div className="text-sm">Created at {new Date(order.createdAt).toLocaleString()}</div>
          <div className="text-sm">Updated at {new Date(order.updatedAt).toLocaleString()}</div>
        </CardContent>
      </Card>
      
      <Dialog open={emailOpen} onOpenChange={setEmailOpen}>
        <DialogContent>
          <DialogHeader><DialogTitle>Email Order Confirmation</DialogTitle></DialogHeader>
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <div className="text-sm font-medium">Recipient</div>
                <Select value={selectedEmail} onValueChange={setSelectedEmail}>
                  <SelectTrigger><SelectValue placeholder="Select contact email" /></SelectTrigger>
                  <SelectContent>
                    {contactEmails.length === 0 ? (
                      <SelectItem value="" disabled>No contacts with email</SelectItem>
                    ) : (
                      contactEmails.map(c => (
                        <SelectItem key={c.email} value={c.email}>{c.label}</SelectItem>
                      ))
                    )}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <div className="text-sm font-medium">Note (optional)</div>
                <Input placeholder="Add a short note" value={emailNote} onChange={(e) => setEmailNote(e.target.value)} />
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEmailOpen(false)}>Cancel</Button>
            <Button onClick={() => emailOrder()} disabled={contactEmails.length > 0 && !selectedEmail}><Mail className="h-4 w-4 mr-2" /> Send Email</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      <Dialog open={rmaOpen} onOpenChange={setRmaOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader><DialogTitle>Create Return (RMA)</DialogTitle></DialogHeader>
          <div className="space-y-3">
            <div className="text-sm text-muted-foreground">Select quantities to return for each item.</div>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Item</TableHead>
                  <TableHead className="text-right">Qty</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {(order.items || []).map((it) => (
                  <TableRow key={it.productId}>
                    <TableCell>{it.name || it.productId}</TableCell>
                    <TableCell className="text-right">
                      <Input
                        className="w-24 text-right"
                        type="number"
                        min={0}
                        max={it.quantity}
                        value={rmaQty[it.productId] ?? 0}
                        onChange={(e) => setRmaQty(prev => ({ ...prev, [it.productId]: Number(e.target.value) }))}
                      />
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setRmaOpen(false)}>Cancel</Button>
            <Button onClick={createReturn}><RotateCcw className="h-4 w-4 mr-2" /> Create Credit Note</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};
export default OrderDetail;

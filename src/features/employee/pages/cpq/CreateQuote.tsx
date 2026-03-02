import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { 
  ArrowLeft, 
  Plus, 
  Trash2, 
  Save, 
  Send,
  Calculator,
  ChevronDown
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { SafeSelectContent } from '@/components/ui/overlay-helpers';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Separator } from '@/components/ui/separator';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import { Product, QuoteItem } from '@/features/employee/pages/cpq/types';

import { cpqService } from '@/features/employee/services/cpqService';
import { crmService, Account, Deal } from '@/features/employee/services/crmService';
import { toast } from 'sonner';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from '@/components/ui/command';
import { Slider } from '@/components/ui/slider';

// Helper type for form handling
type QuoteFormItem = Omit<QuoteItem, 'quote_id' | 'created_at' | 'updated_at'> & {
  tempId: string; // For keying in the UI before saving
};

const CreateQuote: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  
  // Basic Info State
  const [opportunityId, setOpportunityId] = useState('');
  const [accountId, setAccountId] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [status, setStatus] = useState<'draft' | 'pending_approval'>('draft');
  const [quoteName, setQuoteName] = useState('');
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [opportunities, setOpportunities] = useState<Deal[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAddItemOpen, setIsAddItemOpen] = useState(false);

  useEffect(() => {
    const oppId = searchParams.get('opportunityId');
    const accId = searchParams.get('accountId');
    if (oppId) setOpportunityId(oppId);
    if (accId) setAccountId(accId);
  }, [searchParams]);
  
  const [validUntil, setValidUntil] = useState('');
  const [currency, setCurrency] = useState('USD');
  const [paymentTerms, setPaymentTerms] = useState('Net 30');
  const [quoteType, setQuoteType] = useState('Standard');
  const [taxRate, setTaxRate] = useState(10);
  
  // Line Items State
  const [lineItems, setLineItems] = useState<QuoteFormItem[]>([]);
  
  // Terms State (not in schema but useful for UI/logic)
  const [notes, setNotes] = useState('');

  // Products
  const [availableProducts, setAvailableProducts] = useState<Product[]>([]);

  useEffect(() => {
    const loadAll = async () => {
      try {
        const products = await cpqService.getProducts();
        setAvailableProducts(products);
        const accs = await crmService.getAccounts();
        setAccounts(accs);
        if (accountId) {
          const opps = await crmService.getDeals({ company: accs.find(a => a._id === accountId)?.name || '' });
          setOpportunities(opps);
        }
      } catch (error) {
        toast.error('Failed to load data');
      } finally {
        setLoading(false);
      }
    };
    loadAll();
  }, [accountId]);

  const addLineItem = () => {
    const newItem: QuoteFormItem = {
      id: '', // Will be assigned on save
      tempId: Math.random().toString(36).substr(2, 9),
      product_id: '',
      product_name_snapshot: '',
      quantity: 1,
      unit_price: 0,
      discount_percent: 0,
      line_subtotal: 0,
      line_total: 0
    };
    setLineItems([...lineItems, newItem]);
  };

  const updateLineItem = (tempId: string, field: keyof QuoteFormItem, value: string | number) => {
    setLineItems(lineItems.map(item => {
      if (item.tempId === tempId) {
        const updatedItem = { ...item, [field]: value };
        
        // If product changed, update price and name snapshot
        if (field === 'product_id') {
          const product = availableProducts.find(p => p.id === value);
          if (product) {
            updatedItem.product_name_snapshot = product.name;
            updatedItem.unit_price = product.base_price;
          }
        }
        
        // Recalculate totals
        if (['quantity', 'unit_price', 'discount_percent', 'product_id'].includes(field)) {
          updatedItem.line_subtotal = updatedItem.quantity * updatedItem.unit_price;
          const discountAmount = updatedItem.line_subtotal * (updatedItem.discount_percent / 100);
          updatedItem.line_total = updatedItem.line_subtotal - discountAmount;
        }
        
        return updatedItem;
      }
      return item;
    }));
  };

  const removeLineItem = (tempId: string) => {
    setLineItems(lineItems.filter(item => item.tempId !== tempId));
  };

  // Calculations
  const subtotal = lineItems.reduce((sum, item) => sum + item.line_subtotal, 0);
  const discountTotal = lineItems.reduce((sum, item) => sum + (item.line_subtotal - item.line_total), 0);
  const taxTotal = (subtotal - discountTotal) * (taxRate / 100);
  const grandTotal = subtotal - discountTotal + taxTotal;

  const handleSave = async (nextStatus: 'draft' | 'pending_approval') => {
    setIsSubmitting(true);
    try {
        const quoteData = {
            opportunityId,
            accountId, // Assuming this is passed or fetched
            currency,
            items: lineItems.map(item => ({
                productId: item.product_id,
                name: item.product_name_snapshot,
                quantity: item.quantity,
                unitPrice: item.unit_price,
                discount: item.discount_percent,
                total: item.line_total
            })),
            validUntil: validUntil || new Date(Date.now() + 30*24*60*60*1000).toISOString(),
            status: nextStatus,
            taxRate
        };

        const created = await cpqService.createQuote(quoteData);
        if (nextStatus === 'pending_approval' && created?.id) {
          await cpqService.requestApproval(created.id);
        }
        setStatus(nextStatus);
        toast.success(nextStatus === 'draft' ? 'Quote saved as draft' : 'Quote submitted for approval');
        navigate('/employee-dashboard/cpq/quotes');
    } catch (error) {
        console.error('Error saving quote:', error);
        toast.error('Failed to save quote');
    } finally {
        setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6 max-w-6xl mx-auto pb-10">
      <div className="sticky top-0 z-40 bg-white/80 backdrop-blur supports-[backdrop-filter]:bg-white/60 border-b px-2 py-3 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => navigate('/employee-dashboard/cpq/quotes')}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <div className="flex items-center gap-3">
              <Input value={quoteName} onChange={(e) => setQuoteName(e.target.value)} placeholder="Quote Name" className="h-10 max-w-sm font-semibold" />
              <Badge variant="outline" className="uppercase">{status === 'draft' ? 'DRAFT' : 'APPROVAL_PENDING'}</Badge>
            </div>
            <div className="text-slate-500">Build a quote step by step</div>
          </div>
        </div>
        <div className="flex gap-2">
          <AlertCancel onConfirm={() => navigate('/employee-dashboard/cpq/quotes')} />
          <Button variant="outline" onClick={() => handleSave('draft')} disabled={isSubmitting}>
            <Save className="h-4 w-4 mr-2" />
            {isSubmitting ? 'Saving...' : 'Save as Draft'}
          </Button>
          <SubmitApprovalConfirm onConfirm={() => handleSave('pending_approval')} disabled={isSubmitting} />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Basic Information</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label>Customer / Account</Label>
                  {loading ? (
                    <Skeleton className="h-10 w-full" />
                  ) : (
                    <Select value={accountId} onValueChange={(v) => setAccountId(v)}>
                      <SelectTrigger className="h-10">
                        <SelectValue placeholder="Select customer" />
                      </SelectTrigger>
                    <SafeSelectContent>
                        {accounts.map(a => (
                          <SelectItem key={a._id} value={a._id}>{a.name}</SelectItem>
                        ))}
                      </SafeSelectContent>
                    </Select>
                  )}
                </div>
                <div className="space-y-2">
                  <Label>Related Opportunity</Label>
                  {loading ? (
                    <Skeleton className="h-10 w-full" />
                  ) : (
                    <Select value={opportunityId} onValueChange={setOpportunityId}>
                      <SelectTrigger className="h-10">
                        <SelectValue placeholder="Select opportunity" />
                      </SelectTrigger>
                      <SafeSelectContent>
                        {opportunities.map(o => (
                          <SelectItem key={o._id} value={o._id}>{o.title}</SelectItem>
                        ))}
                      </SafeSelectContent>
                    </Select>
                  )}
                </div>
                <div className="space-y-2">
                  <Label>Quote Validity Date</Label>
                  <Input type="date" value={validUntil} onChange={(e) => setValidUntil(e.target.value)} className="h-10" />
                </div>
                <div className="space-y-2">
                  <Label>Currency</Label>
                  <Select value={currency} onValueChange={setCurrency}>
                    <SelectTrigger className="h-10">
                      <SelectValue />
                    </SelectTrigger>
                    <SafeSelectContent>
                      <SelectItem value="USD">USD ($)</SelectItem>
                      <SelectItem value="EUR">EUR (€)</SelectItem>
                      <SelectItem value="GBP">GBP (£)</SelectItem>
                      <SelectItem value="INR">INR (₹)</SelectItem>
                    </SafeSelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Payment Terms</Label>
                  <Select value={paymentTerms} onValueChange={setPaymentTerms}>
                    <SelectTrigger className="h-10">
                      <SelectValue placeholder="Select terms" />
                    </SelectTrigger>
                    <SafeSelectContent>
                      <SelectItem value="Net 15">Net 15</SelectItem>
                      <SelectItem value="Net 30">Net 30</SelectItem>
                      <SelectItem value="Net 45">Net 45</SelectItem>
                    </SafeSelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Quote Type</Label>
                  <Select value={quoteType} onValueChange={setQuoteType}>
                    <SelectTrigger className="h-10">
                      <SelectValue placeholder="Select type" />
                    </SelectTrigger>
                    <SafeSelectContent>
                      <SelectItem value="Standard">Standard</SelectItem>
                      <SelectItem value="Renewal">Renewal</SelectItem>
                      <SelectItem value="Custom">Custom</SelectItem>
                    </SafeSelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Tax Rate (%)</Label>
                  <Input type="number" value={taxRate} onChange={(e) => setTaxRate(parseFloat(e.target.value) || 0)} className="h-10" />
                </div>
              </div>
            </CardContent>
          </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Line Items</CardTitle>
          <Button onClick={() => setIsAddItemOpen(true)} size="sm" className="bg-[#1A3C34] text-white">
            <Plus className="h-4 w-4 mr-2" />
            Add Item
          </Button>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[300px]">Product</TableHead>
                <TableHead className="w-[100px]">Quantity</TableHead>
                <TableHead className="w-[120px]">Unit Price</TableHead>
                <TableHead className="w-[120px]">Discount (%)</TableHead>
                <TableHead className="text-right">Total</TableHead>
                <TableHead className="w-[50px]"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {lineItems.map((item) => (
                <TableRow key={item.tempId}>
                  <TableCell>
                    <Select 
                      value={item.product_id} 
                      onValueChange={(val) => updateLineItem(item.tempId, 'product_id', val)}
                    >
                      <SelectTrigger className="h-10">
                        <SelectValue placeholder={item.product_name_snapshot || 'Select product'} />
                      </SelectTrigger>
                      <SafeSelectContent>
                        {availableProducts.map(p => (
                          <SelectItem key={p.id} value={p.id}>
                            {p.name}
                          </SelectItem>
                        ))}
                      </SafeSelectContent>
                    </Select>
                  </TableCell>
                  <TableCell>
                    <Input 
                      type="number" 
                      min="1"
                      value={item.quantity}
                      onChange={(e) => updateLineItem(item.tempId, 'quantity', parseInt(e.target.value) || 0)}
                    />
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center">
                      <span className="text-sm text-slate-500 mr-1">$</span>
                      <Input 
                        type="number" 
                        value={item.unit_price}
                        readOnly // Usually driven by product, but could be editable
                        className="bg-slate-50"
                      />
                    </div>
                  </TableCell>
                  <TableCell>
                    <Input 
                      type="number" 
                      min="0" 
                      max="100"
                      value={item.discount_percent}
                      onChange={(e) => updateLineItem(item.tempId, 'discount_percent', parseFloat(e.target.value) || 0)}
                    />
                  </TableCell>
                  <TableCell className="text-right font-medium">
                    ${item.line_total.toLocaleString()}
                  </TableCell>
                  <TableCell>
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      className="text-red-500 hover:text-red-700"
                      onClick={() => removeLineItem(item.tempId)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
              {lineItems.length === 0 && (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-8 text-slate-500">
                    No items added. Click "Add Item" to start building your quote.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
          
          <Separator className="my-6" />
          
          <div className="flex justify-end">
            <div className="w-64 space-y-3">
              <div className="flex justify-between text-sm">
                <span className="text-slate-500">Subtotal:</span>
                <span>${subtotal.toLocaleString()}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-slate-500">Discount:</span>
                <span className="text-red-600">-${discountTotal.toLocaleString()}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-slate-500">Tax ({taxRate}%):</span>
                <span>${taxTotal.toLocaleString()}</span>
              </div>
              <Separator />
              <div className="flex justify-between font-bold text-lg">
                <span>Total:</span>
                <span>${grandTotal.toLocaleString()}</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader>
          <CardTitle>Additional Notes</CardTitle>
        </CardHeader>
        <CardContent>
          <Textarea 
            placeholder="Add any internal notes or terms here..." 
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            className="min-h-[100px]"
          />
        </CardContent>
      </Card>
        </div>
        <div className="space-y-6">
          <Card className="sticky top-20">
            <CardHeader>
              <CardTitle>Pricing Summary</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm">
              <div className="flex justify-between">
                <span>Subtotal</span>
                <span>${subtotal.toLocaleString()}</span>
              </div>
              <div className="flex justify-between">
                <span>Discount</span>
                <span className="text-red-600">-${discountTotal.toLocaleString()}</span>
              </div>
              <div className="flex justify-between">
                <span>Tax ({taxRate}%)</span>
                <span>${taxTotal.toLocaleString()}</span>
              </div>
              <Separator />
              <div className="flex justify-between font-bold">
                <span>Grand Total</span>
                <span>${grandTotal.toLocaleString()}</span>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
      <AddItemDialogInline
        open={isAddItemOpen}
        onOpenChange={setIsAddItemOpen}
        products={availableProducts}
        onAdd={(productId, qty, discount, snapshot) => {
          const product = availableProducts.find(p => p.id === productId);
          const unitPrice = snapshot?.unitPrice ?? (product ? Number(product.base_price || 0) : 0);
          const tempId = Math.random().toString(36).substr(2, 9);
          const line_subtotal = qty * unitPrice;
          const discountAmount = line_subtotal * (discount / 100);
          const line_total = line_subtotal - discountAmount;
          const newItem: QuoteFormItem = {
            id: '',
            tempId,
            product_id: productId,
            product_name_snapshot: (snapshot?.name ?? product?.name) || '',
            quantity: qty,
            unit_price: unitPrice,
            discount_percent: discount,
            line_subtotal,
            line_total
          };
          setLineItems([...lineItems, newItem]);
        }}
      />
    </div>
  );
};

export default CreateQuote;
function AlertCancel({ onConfirm }: { onConfirm: () => void }) {
  const [open, setOpen] = useState(false);
  return (
    <>
      <Button variant="outline" onClick={() => setOpen(true)}>Cancel</Button>
      <AlertDialog open={open} onOpenChange={setOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Discard changes?</AlertDialogTitle>
            <AlertDialogDescription>
              This will discard any unsaved changes and return to Quotes.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Stay</AlertDialogCancel>
            <AlertDialogAction onClick={onConfirm}>Discard</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}

function SubmitApprovalConfirm({ onConfirm, disabled }: { onConfirm: () => void; disabled?: boolean }) {
  const [open, setOpen] = useState(false);
  return (
    <>
      <Button onClick={() => setOpen(true)} className="bg-[#1A3C34] text-white hover:bg-[#1A3C34]/90" disabled={disabled}>
        <Send className="h-4 w-4 mr-2" />
        Submit for Approval
      </Button>
      <AlertDialog open={open} onOpenChange={setOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Submit for Approval?</AlertDialogTitle>
            <AlertDialogDescription>
              This will set status to Pending Approval and create an approval request.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={() => { onConfirm(); setOpen(false); }}>Submit</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
function AddItemDialogInline(props: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  products: Product[];
  onAdd: (productId: string, qty: number, discount: number, snapshot?: { name: string; unitPrice: number }) => void;
}) {
  const { open, onOpenChange, products, onAdd } = props;
  const [localProducts, setLocalProducts] = useState<Product[]>(products);
  const [productId, setProductId] = useState('');
  const [qty, setQty] = useState(1);
  const [discount, setDiscount] = useState(0);
  const [productPickerOpen, setProductPickerOpen] = useState(false);
  const [newName, setNewName] = useState('');
  const [newSku, setNewSku] = useState('');
  const [newPrice, setNewPrice] = useState<number | ''>('');
  const [newCurrency, setNewCurrency] = useState('USD');
  const [creating, setCreating] = useState(false);
  useEffect(() => {
    setLocalProducts(products);
  }, [products]);
  const selectedProduct = localProducts.find(p => p.id === productId);
  const unitPrice = selectedProduct ? Number(selectedProduct.base_price || 0) : 0;
  const lineSubtotal = qty * unitPrice;
  const discountAmount = lineSubtotal * (discount / 100);
  const lineTotal = lineSubtotal - discountAmount;
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[640px]">
        <DialogHeader>
          <DialogTitle>Add Item</DialogTitle>
          <DialogDescription>Select a product and set quantity and discount.</DialogDescription>
        </DialogHeader>
        <div className="space-y-6">
          <div className="space-y-2">
            <Label>Product</Label>
            <Popover open={productPickerOpen} onOpenChange={setProductPickerOpen}>
              <PopoverTrigger asChild>
                <Button variant="outline" className="w-full justify-between h-10">
                  {selectedProduct ? selectedProduct.name : 'Select product'}
                  <ChevronDown className="h-4 w-4 opacity-50" />
                </Button>
              </PopoverTrigger>
              <PopoverContent className="p-0 w-[400px] z-[10000]">
                <Command>
                  <CommandInput placeholder="Search products..." />
                  <CommandList>
                    <CommandEmpty>No products found.</CommandEmpty>
                    <CommandGroup>
                      {localProducts.map(p => (
                        <CommandItem
                          key={p.id}
                          onSelect={() => {
                            setProductId(p.id);
                            setProductPickerOpen(false);
                          }}
                        >
                          <div className="flex w-full items-center justify-between">
                            <div className="space-y-0.5">
                              <div className="font-medium">{p.name}</div>
                              {p.sku ? <div className="text-xs text-slate-500">{p.sku}</div> : null}
                            </div>
                            <div className="text-sm text-slate-600">
                              {p.currency || 'USD'} {Number(p.base_price || 0).toLocaleString()}
                            </div>
                          </div>
                        </CommandItem>
                      ))}
                    </CommandGroup>
                  </CommandList>
                </Command>
                <Separator />
                <div className="p-3 space-y-2">
                  <div className="text-sm font-medium">Add new product</div>
                  <div className="grid grid-cols-2 gap-2">
                    <Input placeholder="Name" value={newName} onChange={(e) => setNewName(e.target.value)} />
                    <Input placeholder="SKU (optional)" value={newSku} onChange={(e) => setNewSku(e.target.value)} />
                    <Input
                      placeholder="Price"
                      type="number"
                      value={newPrice}
                      onChange={(e) => setNewPrice(e.target.value ? Number(e.target.value) : '')}
                    />
                    <Select value={newCurrency} onValueChange={setNewCurrency}>
                      <SelectTrigger className="h-10">
                        <SelectValue />
                      </SelectTrigger>
                      <SafeSelectContent>
                        <SelectItem value="USD">USD</SelectItem>
                        <SelectItem value="EUR">EUR</SelectItem>
                        <SelectItem value="GBP">GBP</SelectItem>
                        <SelectItem value="INR">INR</SelectItem>
                      </SafeSelectContent>
                    </Select>
                  </div>
                  <div className="flex justify-end">
                    <Button
                      size="sm"
                      className="bg-[#1A3C34] text-white"
                      disabled={!newName || newPrice === '' || creating}
                      onClick={async () => {
                        if (!newName || newPrice === '') return;
                        try {
                          setCreating(true);
                          const created = await cpqService.createProduct({
                            name: newName,
                            sku: newSku || undefined,
                            base_price: Number(newPrice),
                            currency: newCurrency
                          } as any);
                          setLocalProducts(prev => [{ ...created }, ...prev]);
                          setProductId(created.id);
                          setNewName('');
                          setNewSku('');
                          setNewPrice('');
                          setProductPickerOpen(false);
                        } finally {
                          setCreating(false);
                        }
                      }}
                    >
                      {creating ? 'Adding...' : 'Add Product'}
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      className="ml-2"
                      disabled={creating}
                      onClick={async () => {
                        try {
                          setCreating(true);
                          const created = await cpqService.createProduct({
                            name: 'Demo Product',
                            sku: 'DEMO-001',
                            base_price: 100,
                            currency: 'USD'
                          } as any);
                          setLocalProducts(prev => [{ ...created }, ...prev]);
                          setProductId(created.id);
                          setProductPickerOpen(false);
                        } finally {
                          setCreating(false);
                        }
                      }}
                    >
                      Add Demo Product
                    </Button>
                  </div>
                </div>
              </PopoverContent>
            </Popover>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Quantity</Label>
              <div className="flex gap-2">
                <Button variant="outline" size="icon" onClick={() => setQty(Math.max(1, qty - 1))}>-</Button>
                <Input type="number" value={qty} className="h-10" onChange={(e) => setQty(Math.max(1, parseInt(e.target.value) || 1))} />
                <Button variant="outline" size="icon" onClick={() => setQty(qty + 1)}>+</Button>
              </div>
            </div>
            <div className="space-y-2">
              <Label>Discount (%)</Label>
              <div className="space-y-3">
                <Slider value={[discount]} onValueChange={(v) => setDiscount(v[0] || 0)} min={0} max={100} step={1} />
                <Input type="number" value={discount} className="h-10" onChange={(e) => setDiscount(Math.min(100, Math.max(0, parseFloat(e.target.value) || 0)))} />
              </div>
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Unit Price</Label>
              <Input value={unitPrice.toLocaleString()} disabled className="h-10" />
            </div>
            <div className="space-y-2">
              <Label>Subtotal</Label>
              <Input value={lineSubtotal.toLocaleString()} disabled className="h-10" />
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Discount Amount</Label>
              <Input value={discountAmount.toLocaleString()} disabled className="h-10" />
            </div>
            <div className="space-y-2">
              <Label>Line Total</Label>
              <Input value={lineTotal.toLocaleString()} disabled className="h-10 font-semibold" />
            </div>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
          <Button
            className="bg-[#1A3C34] text-white"
            onClick={() => {
              if (!productId) return;
              onAdd(productId, qty, discount, { name: selectedProduct?.name || '', unitPrice });
              onOpenChange(false);
            }}
            disabled={!productId}
          >
            Add
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

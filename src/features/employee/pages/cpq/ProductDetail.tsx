import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Save, Trash2 } from 'lucide-react';
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
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Product } from '@/features/employee/pages/cpq/types';
import { cpqService } from '@/features/employee/services/cpqService';
import { toast } from 'sonner';

const ProductDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [autoSkuLocked, setAutoSkuLocked] = useState(true);
  const [priceError, setPriceError] = useState('');
  const [basePriceText, setBasePriceText] = useState('');
  
  // Initialize with schema-compliant defaults
  const [formData, setFormData] = useState<Product>({
    id: '',
    name: '',
    sku: '',
    description: '',
    pricing_type: 'one_time',
    base_price: 0,
    currency: 'USD',
    is_active: true,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  });

  const currencySymbols: Record<string, string> = {
    USD: '$',
    EUR: '€',
    GBP: '£',
    INR: '₹'
  };

  const generateSku = (name: string) => {
    const cleaned = name.trim().toUpperCase().replace(/[^A-Z0-9\s-]/g, '');
    const words = cleaned.split(/\s+/).filter(Boolean);
    const prefix = 'SW';
    const code =
      words.length === 0
        ? 'GEN'
        : words
            .slice(0, 3)
            .map(w => w.length > 3 ? w.slice(0,3) : w)
            .join('-');
    const rand = Math.floor(100 + Math.random() * 900); // 3-digit
    return `${prefix}-${code}-${rand}`;
  };

  useEffect(() => {
    if (id && id !== 'new') {
      (async () => {
        try {
          setLoading(true);
          const all = await cpqService.getProducts();
          const found = all.find(p => p.id === id);
          if (found) {
            setFormData(found);
            setBasePriceText(String(found.base_price ?? ''));
          } else {
            toast.error('Product not found');
            navigate('/employee-dashboard/cpq/products');
            return;
          }
        } catch (e: any) {
          toast.error(e?.message || 'Failed to load product');
        } finally {
          setLoading(false);
        }
      })();
    } else {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    if (autoSkuLocked) {
      const newSku = generateSku(formData.name);
      setFormData(prev => ({ ...prev, sku: newSku }));
    }
  }, [formData.name, autoSkuLocked]);

  const handleSave = async () => {
    try {
      if (!formData.name.trim()) {
        toast.error('Product name is required');
        return;
      }
      if (!formData.currency) {
        toast.error('Currency is required');
        return;
      }
      if (!basePriceText.trim()) {
        toast.error('Base price is required');
        return;
      }
      const parsedPrice = Number(basePriceText);
      if (!Number.isFinite(parsedPrice) || parsedPrice <= 0) {
        toast.error('Base price must be greater than 0');
        return;
      }
      const payload = {
        name: formData.name,
        sku: formData.sku?.trim() ? formData.sku.trim() : undefined,
        description: formData.description,
        pricing_type: formData.pricing_type,
        base_price: parsedPrice,
        currency: formData.currency,
        is_active: formData.is_active
      };
      if (id === 'new') {
        const created = await cpqService.createProduct(payload);
        toast.success('Product created');
        navigate('/employee-dashboard/cpq/products');
      } else {
        const updated = await cpqService.updateProduct(id!, payload);
        setFormData(updated);
        toast.success('Product updated');
        navigate('/employee-dashboard/cpq/products');
      }
    } catch (e: any) {
      toast.error(e?.message || 'Failed to save product');
    }
  };

  const handleDelete = async () => {
    try {
      if (!id || id === 'new') {
        navigate('/employee-dashboard/cpq/products');
        return;
      }
      await cpqService.deleteProduct(id);
      toast.success('Product deleted');
      navigate('/employee-dashboard/cpq/products');
    } catch (e: any) {
      toast.error(e?.message || 'Failed to delete product');
    }
  };

  if (loading) {
    return <div className="p-6">Loading product details...</div>;
  }

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <div className="sticky top-0 z-40 bg-white/80 backdrop-blur supports-[backdrop-filter]:bg-white/60 border-b px-2 py-3 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => navigate('/employee-dashboard/cpq/products')}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <h1 className="text-2xl font-bold text-[#1A3C34]">
              {id === 'new' ? 'Add New Product' : 'Edit Product'}
            </h1>
            <p className="text-slate-500">Define pricing behavior and product specs</p>
          </div>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" className="text-red-600 hover:text-red-700 hover:bg-red-50" onClick={handleDelete}>
            <Trash2 className="h-4 w-4 mr-2" />
            Delete
          </Button>
          <Button 
            onClick={handleSave} 
            className="bg-[#1A3C34] text-white hover:bg-[#1A3C34]/90"
            disabled={!formData.name.trim() || !formData.currency || !basePriceText.trim() || Number(basePriceText) <= 0}
          >
            <Save className="h-4 w-4 mr-2" />
            Save Product
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Product Information</CardTitle>
              <CardDescription>Basic details about the product</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Product Name</Label>
                  <Input 
                    id="name" 
                    value={formData.name} 
                    onChange={(e) => setFormData({...formData, name: e.target.value})}
                    placeholder="e.g. Enterprise License"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="sku">SKU / Code</Label>
                  <Input 
                    id="sku" 
                    value={formData.sku} 
                    onChange={(e) => { setAutoSkuLocked(false); setFormData({...formData, sku: e.target.value}); }}
                    placeholder="e.g. SW-ENT-001"
                  />
                  <div className="text-xs text-slate-500">Auto-generated from product name. Editing will disable auto.</div>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Description / Specs</Label>
                <Textarea 
                  id="description" 
                  value={formData.description} 
                  onChange={(e) => setFormData({...formData, description: e.target.value})}
                  placeholder="Describe the product features..."
                  rows={4}
                />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Pricing Configuration</CardTitle>
              <CardDescription>Define how this product is priced</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Pricing Type</Label>
                  <Select 
                    value={formData.pricing_type} 
                    onValueChange={(val: 'one_time' | 'monthly' | 'yearly') => setFormData({...formData, pricing_type: val})}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SafeSelectContent>
                      <SelectItem value="one_time">One-time</SelectItem>
                      <SelectItem value="monthly">Monthly</SelectItem>
                      <SelectItem value="yearly">Yearly</SelectItem>
                    </SafeSelectContent>
                  </Select>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="currency">Currency</Label>
                  <Select 
                    value={formData.currency} 
                    onValueChange={(val) => setFormData({...formData, currency: val})}
                  >
                    <SelectTrigger>
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
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="price">Base Price</Label>
                  <div className="relative">
                    <span className="absolute left-3 top-2.5 text-slate-500">{currencySymbols[formData.currency] || '$'}</span>
                    <Input 
                      id="price" 
                      type="number" 
                      className="pl-7"
                      value={basePriceText}
                      onChange={(e) => {
                        const txt = e.target.value;
                        setBasePriceText(txt);
                        const val = Number(txt);
                        setFormData({...formData, base_price: val});
                        if (!txt.trim()) setPriceError('');
                        else if (!Number.isFinite(val) || val < 0) setPriceError('Enter a valid non-negative amount'); else setPriceError('');
                      }}
                    />
                    <span className="absolute right-3 top-2.5 text-slate-500">
                      {formData.pricing_type === 'monthly' ? '/mo' : formData.pricing_type === 'yearly' ? '/yr' : ''}
                    </span>
                  </div>
                  {priceError && <div className="text-xs text-red-600">{priceError}</div>}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Status</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label>Product Status</Label>
                  <Select 
                    value={formData.is_active ? 'Active' : 'Inactive'} 
                    onValueChange={(val) => setFormData({...formData, is_active: val === 'Active'})}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SafeSelectContent>
                      <SelectItem value="Active">Active</SelectItem>
                      <SelectItem value="Inactive">Inactive</SelectItem>
                    </SafeSelectContent>
                  </Select>
                </div>
                <div className="text-sm text-slate-500 bg-slate-50 p-3 rounded">
                  <p className="font-medium mb-1">Rules:</p>
                  <ul className="list-disc pl-4 space-y-1">
                    <li>Product price is the base price.</li>
                    <li>Discounts are applied later at quote level.</li>
                    <li>SKU must be unique. Auto-generated for convenience.</li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default ProductDetail;

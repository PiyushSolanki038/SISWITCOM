import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Plus, 
  Search, 
  Package, 
  MoreHorizontal, 
  Filter
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
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
import {
  DropdownMenu,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { SafeDropdownMenuContent } from '@/components/ui/overlay-helpers';
import { Select, SelectTrigger, SelectValue, SelectItem } from '@/components/ui/select';
import { SafeSelectContent } from '@/components/ui/overlay-helpers';

import { Product } from '@/features/employee/pages/cpq/types';
import { cpqService } from '@/features/employee/services/cpqService';
import { toast } from 'sonner';

const Products: React.FC = () => {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'inactive'>('all');
  const [pricingTypeFilter, setPricingTypeFilter] = useState<'all' | 'one_time' | 'monthly' | 'yearly'>('all');
  const [loading, setLoading] = useState(false);
  const [products, setProducts] = useState<Product[]>([]);

  const loadProducts = async () => {
    try {
      setLoading(true);
      const data = await cpqService.getProducts();
      setProducts(data);
    } catch (e: any) {
      toast.error(e?.message || 'Failed to load products');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadProducts();
  }, []);

  const getStatusColor = (isActive: boolean) => {
    return isActive 
      ? 'bg-emerald-50 text-emerald-700 border-emerald-100'
      : 'bg-slate-50 text-slate-700 border-slate-100';
  };

  const toggleActive = async (p: Product) => {
    try {
      const updated = await cpqService.updateProduct(p.id, { is_active: !p.is_active });
      setProducts(prev => prev.map(x => x.id === p.id ? { ...x, is_active: updated.is_active } : x));
      toast.success(updated.is_active ? 'Product activated' : 'Product deactivated');
    } catch (e: any) {
      toast.error(e?.message || 'Failed to update product');
    }
  };

  const filteredProducts = products
    .filter(product => 
      product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      product.sku.toLowerCase().includes(searchTerm.toLowerCase())
    )
    .filter(product => statusFilter === 'all' ? true : (statusFilter === 'active' ? product.is_active : !product.is_active))
    .filter(product => pricingTypeFilter === 'all' ? true : product.pricing_type === pricingTypeFilter);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-[#1A3C34]">Products</h1>
          <p className="text-slate-500">Define what the company sells.</p>
        </div>
        <Button 
          className="bg-[#1A3C34] text-white hover:bg-[#1A3C34]/90"
          onClick={() => navigate('/employee-dashboard/cpq/products/new')}
        >
          <Plus className="h-4 w-4 mr-2" />
          Add Product
        </Button>
      </div>

      <div className="flex items-center space-x-2">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-slate-500" />
          <Input
            placeholder="Search products..."
            className="pl-9"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="w-40">
          <Select value={statusFilter} onValueChange={(v) => setStatusFilter(v as any)}>
            <SelectTrigger className="h-10">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SafeSelectContent>
              <SelectItem value="all">All</SelectItem>
              <SelectItem value="active">Active</SelectItem>
              <SelectItem value="inactive">Inactive</SelectItem>
            </SafeSelectContent>
          </Select>
        </div>
        <div className="w-44">
          <Select value={pricingTypeFilter} onValueChange={(v) => setPricingTypeFilter(v as any)}>
            <SelectTrigger className="h-10">
              <SelectValue placeholder="Pricing Type" />
            </SelectTrigger>
            <SafeSelectContent>
              <SelectItem value="all">All Types</SelectItem>
              <SelectItem value="one_time">One-time</SelectItem>
              <SelectItem value="monthly">Monthly</SelectItem>
              <SelectItem value="yearly">Yearly</SelectItem>
            </SafeSelectContent>
          </Select>
        </div>
      </div>

      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Product Name</TableHead>
                <TableHead>SKU / Code</TableHead>
                <TableHead>Pricing Type</TableHead>
                <TableHead>Base Price</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="w-[50px]"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredProducts.map((product) => (
                <TableRow 
                  key={product.id} 
                  className="cursor-pointer hover:bg-slate-50"
                  onClick={() => navigate(`/employee-dashboard/cpq/products/${product.id}`)}
                >
                  <TableCell className="font-medium text-[#1A3C34]">
                    <div className="flex items-center gap-2">
                      <Package className="w-4 h-4 text-slate-400" />
                      {product.name}
                    </div>
                  </TableCell>
                  <TableCell>{product.sku}</TableCell>
                  <TableCell>
                    <Badge variant="outline" className="capitalize">
                      {product.pricing_type.replace('_', ' ')}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    {product.currency} ${product.base_price.toLocaleString()}
                  </TableCell>
                  <TableCell>
                    <Badge variant="secondary" className={getStatusColor(product.is_active)}>
                      {product.is_active ? 'Active' : 'Inactive'}
                    </Badge>
                  </TableCell>
                  <TableCell onClick={(e) => e.stopPropagation()}>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" className="h-8 w-8 p-0">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <SafeDropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => navigate(`/employee-dashboard/cpq/products/${product.id}`)}>
                          Edit Product
                        </DropdownMenuItem>
                        <DropdownMenuItem className={product.is_active ? 'text-red-600' : 'text-emerald-700'} onClick={() => toggleActive(product)}>
                          {product.is_active ? 'Deactivate' : 'Activate'}
                        </DropdownMenuItem>
                      </SafeDropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))}
              {loading && (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-8 text-slate-500">
                    Loading products...
                  </TableCell>
                </TableRow>
              )}
              {!loading && filteredProducts.length === 0 && (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-8 text-slate-500">
                    No products found.
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

export default Products;

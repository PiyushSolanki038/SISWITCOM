import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { cpqService } from '@/features/employee/services/cpqService';
import { Product } from '@/features/employee/pages/cpq/types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Input } from '@/components/ui/input';
import { Search } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

const Inventory = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const load = async () => {
      try {
        const list = await cpqService.getProducts();
        setProducts(list);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const filtered = products.filter(p =>
    p.name.toLowerCase().includes(search.toLowerCase()) ||
    p.sku.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Inventory</h1>
          <p className="text-muted-foreground">Product catalog acts as inventory items.</p>
        </div>
      </div>
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Products</CardTitle>
            <div className="relative w-64">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input placeholder="Search products..." className="pl-8" value={search} onChange={(e) => setSearch(e.target.value)} />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="py-8 text-center text-muted-foreground">Loading...</div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>SKU</TableHead>
                  <TableHead>Pricing</TableHead>
                  <TableHead>Price</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center text-muted-foreground">No products found.</TableCell>
                  </TableRow>
                ) : (
                  filtered.map(p => (
                    <TableRow key={p.id} className="cursor-pointer" onClick={() => navigate(`/employee-dashboard/erp/inventory/${p.id}`)}>
                      <TableCell className="font-medium">{p.name}</TableCell>
                      <TableCell>{p.sku}</TableCell>
                      <TableCell className="uppercase">{p.pricing_type.replace('_', ' ')}</TableCell>
                      <TableCell>{new Intl.NumberFormat('en-US', { style: 'currency', currency: p.currency || 'USD' }).format(p.base_price)}</TableCell>
                      <TableCell>
                        <Badge variant={p.is_active ? 'default' : 'secondary'}>{p.is_active ? 'Active' : 'Inactive'}</Badge>
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

export default Inventory;

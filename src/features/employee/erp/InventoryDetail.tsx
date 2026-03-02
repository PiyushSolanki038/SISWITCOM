import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { cpqService } from '@/features/employee/services/cpqService';
import { Product } from '@/features/employee/pages/cpq/types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';

const InventoryDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      if (!id) return;
      try {
        const p = await cpqService.getProduct(id);
        setProduct(p);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [id]);

  if (loading) return <div className="p-6">Loading...</div>;
  if (!product) return <div className="p-6">Not found</div>;

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">{product.name}</h1>
          <p className="text-muted-foreground">SKU: {product.sku}</p>
        </div>
        <Badge variant={product.is_active ? 'default' : 'secondary'}>{product.is_active ? 'Active' : 'Inactive'}</Badge>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle>Pricing</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <div className="flex items-center justify-between">
              <div>Type</div>
              <div className="uppercase">{product.pricing_type.replace('_', ' ')}</div>
            </div>
            <div className="flex items-center justify-between">
              <div>Price</div>
              <div>{new Intl.NumberFormat('en-US', { style: 'currency', currency: product.currency || 'USD' }).format(product.base_price)}</div>
            </div>
          </CardContent>
        </Card>
        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle>Description</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-sm text-muted-foreground whitespace-pre-wrap">
              {product.description || 'No description provided.'}
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="flex gap-2">
        <Button variant="outline" onClick={() => navigate('/employee-dashboard/erp/inventory')}>Back to Inventory</Button>
      </div>
    </div>
  );
};

export default InventoryDetail;

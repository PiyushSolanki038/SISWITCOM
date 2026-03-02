import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { erpService } from './erpService';
import { ERPOrder } from './types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/components/ui/use-toast';

const FulfillmentDetail = () => {
  const { id } = useParams();
  const [order, setOrder] = useState<ERPOrder | null>(null);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();
  
  const load = async () => {
    if (!id) return;
    const o = await erpService.getOrder(id);
    setOrder(o);
    setLoading(false);
  };
  
  useEffect(() => {
    load();
  }, [id]);
  
  const start = async () => {
    if (!order) return;
    await erpService.startFulfillment(order._id);
    toast({ title: 'Fulfillment started' });
    await load();
  };
  
  const complete = async () => {
    if (!order) return;
    await erpService.completeFulfillment(order._id);
    toast({ title: 'Fulfillment completed' });
    await load();
  };
  
  if (loading) return <div className="p-6">Loading...</div>;
  if (!order) return <div className="p-6">Not found</div>;
  
  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Fulfillment {order.orderNumber}</h1>
          <p className="text-muted-foreground">{order.accountId?.name}</p>
        </div>
        <div className="flex gap-2">
          {order.fulfillmentStatus === 'pending' && <Button onClick={start}>Start</Button>}
          {order.fulfillmentStatus === 'in_progress' && <Button onClick={complete}>Complete</Button>}
        </div>
      </div>
      
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle>Status</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <div className="flex items-center justify-between">
              <div>Fulfillment</div>
              <Badge>{order.fulfillmentStatus.replace('_', ' ')}</Badge>
            </div>
          </CardContent>
        </Card>
        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle>Timeline</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <div className="text-sm">Created at {new Date(order.createdAt).toLocaleString()}</div>
            <div className="text-sm">Updated at {new Date(order.updatedAt).toLocaleString()}</div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
export default FulfillmentDetail;

import React, { useEffect, useState } from 'react';
import { erpService } from './erpService';
import { ERPOrder } from './types';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useNavigate } from 'react-router-dom';
import { useToast } from '@/components/ui/use-toast';

const Fulfillment = () => {
  const [orders, setOrders] = useState<ERPOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const { toast } = useToast();
  
  useEffect(() => {
    load();
  }, []);
  
  const load = async () => {
    try {
      const data = await erpService.getOrders();
      setOrders(data.filter(o => ['pending', 'in_progress', 'completed'].includes(o.fulfillmentStatus)));
    } finally {
      setLoading(false);
    }
  };
  
  const start = async (id: string) => {
    try {
      await erpService.startFulfillment(id);
      await load();
      toast({ title: 'Fulfillment started' });
    } catch {
      toast({ title: 'Failed to start', variant: 'destructive' });
    }
  };
  
  const complete = async (id: string) => {
    try {
      await erpService.completeFulfillment(id);
      await load();
      toast({ title: 'Fulfillment completed' });
    } catch {
      toast({ title: 'Failed to complete', variant: 'destructive' });
    }
  };
  
  const badgeVariant = (s: string) => {
    if (s === 'completed') return 'default';
    if (s === 'in_progress') return 'secondary';
    return 'outline';
  };
  
  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Fulfillment</h1>
        <p className="text-muted-foreground">Track and update fulfillment.</p>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>Orders</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="py-8 text-center">Loading...</div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Order #</TableHead>
                  <TableHead>Customer</TableHead>
                  <TableHead>Fulfillment</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {orders.map(o => (
                  <TableRow key={o._id}>
                    <TableCell className="font-medium">{o.orderNumber}</TableCell>
                    <TableCell>{o.accountId?.name}</TableCell>
                    <TableCell>
                      <Badge variant={badgeVariant(o.fulfillmentStatus) as any}>{o.fulfillmentStatus.replace('_', ' ')}</Badge>
                    </TableCell>
                    <TableCell className="text-right space-x-2">
                      <Button variant="outline" onClick={() => navigate(`/employee-dashboard/erp/fulfillment/${o._id}`)}>View</Button>
                      {o.fulfillmentStatus === 'pending' && <Button onClick={() => start(o._id)}>Start</Button>}
                      {o.fulfillmentStatus === 'in_progress' && <Button onClick={() => complete(o._id)}>Complete</Button>}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
export default Fulfillment;

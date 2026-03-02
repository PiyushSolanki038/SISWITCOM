import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { CheckCircle2, AlertCircle, Calendar } from 'lucide-react';
import { customerErpService } from '../erp/erpService';
import { useAuth } from '@/context/AuthContext';
import { format } from 'date-fns';
import { Link } from 'react-router-dom';

interface Subscription {
  _id: string;
  plan: string;
  status: string;
  amount: number;
  startDate: string;
  billingCycle: string;
  currency: string;
}

const Subscriptions: React.FC = () => {
  const { user } = useAuth();
  const [subscription, setSubscription] = useState<Subscription | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchSubscription = async () => {
      if (user?.id) {
        const data = await customerErpService.getMySubscription(user.id);
        setSubscription(data);
      }
      setLoading(false);
    };

    fetchSubscription();
  }, [user?.id]);

  if (loading) {
    return <div className="p-6">Loading subscription details...</div>;
  }

  if (!subscription) {
    return (
      <div className="p-6 space-y-6">
        <h2 className="text-3xl font-bold tracking-tight text-[#1A3C34]">Active Subscriptions</h2>
        <Card className="p-6 text-center">
            <h3 className="text-xl font-semibold mb-2">No Active Subscription</h3>
            <p className="text-muted-foreground mb-4">You do not have an active subscription plan.</p>
            <Link to="/select-plan">
                <Button>View Plans</Button>
            </Link>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight text-[#1A3C34]">Active Subscriptions</h2>
          <p className="text-slate-500 mt-2">Manage your active services and agreements.</p>
        </div>
      </div>

      <div className="grid gap-6">
          <Card key={subscription._id} className="overflow-hidden">
            <CardHeader className="bg-slate-50 border-b pb-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-green-100 rounded-lg">
                    <CheckCircle2 className="h-5 w-5 text-green-700" />
                  </div>
                  <div>
                    <CardTitle className="text-xl text-[#1A3C34]">{subscription.plan.charAt(0).toUpperCase() + subscription.plan.slice(1)} Plan</CardTitle>
                    <CardDescription className="flex items-center gap-2 mt-1">
                      <span className="font-medium text-slate-700">
                        {subscription.currency === 'USD' ? '$' : '₹'}{subscription.amount}
                      </span>
                      <span>/ {subscription.billingCycle}</span>
                    </CardDescription>
                  </div>
                </div>
                <Badge 
                  variant={subscription.status === 'active' ? 'default' : 'destructive'}
                  className={subscription.status === 'active' ? 'bg-green-600 hover:bg-green-700' : ''}
                >
                  {subscription.status.toUpperCase()}
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="pt-6">
                <div className="grid md:grid-cols-2 gap-6">
                    <div>
                        <h4 className="text-sm font-medium text-muted-foreground mb-2">Billing Details</h4>
                        <div className="space-y-2">
                            <div className="flex justify-between">
                                <span>Start Date</span>
                                <span className="font-medium">{format(new Date(subscription.startDate), 'MMM dd, yyyy')}</span>
                            </div>
                            <div className="flex justify-between">
                                <span>Next Billing</span>
                                <span className="font-medium">{format(new Date(new Date(subscription.startDate).setMonth(new Date(subscription.startDate).getMonth() + 1)), 'MMM dd, yyyy')}</span>
                            </div>
                        </div>
                    </div>
                     <div>
                        <h4 className="text-sm font-medium text-muted-foreground mb-2">Actions</h4>
                        <div className="flex gap-2">
                             <Button variant="outline" className="w-full">Download Invoice</Button>
                             <Button variant="destructive" className="w-full">Cancel Subscription</Button>
                        </div>
                    </div>
                </div>
            </CardContent>
          </Card>
      </div>
    </div>
  );
};

export default Subscriptions;

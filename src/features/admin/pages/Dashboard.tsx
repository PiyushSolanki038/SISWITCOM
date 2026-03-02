import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Users, FileText, AlertTriangle, Clock, ArrowRight, Activity, CheckCircle, XCircle, ShieldCheck } from 'lucide-react';
import { adminService } from '@/features/admin/services/adminService';
import { Skeleton } from '@/components/ui/skeleton';
import { useNavigate } from 'react-router-dom';

const AdminDashboardPage: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<any>(null);
  const navigate = useNavigate();

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const res = await adminService.getOverview();
        if (mounted) setData(res);
      } catch (e) {
        console.error('Failed to load admin overview', e);
      } finally {
        if (mounted) setLoading(false);
      }
    })();
    return () => { mounted = false; };
  }, []);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-slate-900">Admin Overview</h1>
        <p className="text-slate-500 mt-2">Operational health at a glance. Make sure the system works correctly for everyone, every day.</p>
      </div>

      {/* KPI Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Users</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {loading ? (
              <Skeleton className="h-8 w-24" />
            ) : (
              <div className="text-2xl font-bold">{data?.users?.subscriptionsActive ?? 0}</div>
            )}
            <p className="text-xs text-muted-foreground">Active subscriptions</p>
            <div className="mt-3">
              <Button variant="outline" size="sm" onClick={() => navigate('/admin-dashboard/users')}>View</Button>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending Approvals</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {loading ? <Skeleton className="h-8 w-24" /> : <div className="text-2xl font-bold">{data?.cpq?.approvalsPending ?? 0}</div>}
            <p className="text-xs text-muted-foreground">Requires attention</p>
            <div className="mt-3">
              <Button variant="outline" size="sm" onClick={() => navigate('/admin-dashboard/workflow')}>Review</Button>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Failed E-Sign Requests</CardTitle>
            <AlertTriangle className="h-4 w-4 text-red-500" />
          </CardHeader>
          <CardContent>
            {loading ? <Skeleton className="h-8 w-24" /> : <div className="text-2xl font-bold text-red-600">{data?.esign?.signingSessions?.failed ?? 0}</div>}
            <p className="text-xs text-muted-foreground">In the last 24 hours</p>
            <div className="mt-3">
              <Button variant="outline" size="sm" onClick={() => navigate('/admin-dashboard/audit')}>View</Button>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">System Status</CardTitle>
            <Activity className="h-4 w-4 text-emerald-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-emerald-600">Healthy</div>
            <p className="text-xs text-muted-foreground">All systems operational</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Accounts</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {loading ? <Skeleton className="h-8 w-24" /> : <div className="text-2xl font-bold">{data?.crm?.accounts ?? 0}</div>}
            <p className="text-xs text-muted-foreground">Total accounts</p>
            <div className="mt-3">
              <Button variant="outline" size="sm" onClick={() => navigate('/admin-dashboard/data')}>View</Button>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Opportunities</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {loading ? <Skeleton className="h-8 w-24" /> : <div className="text-2xl font-bold">{data?.crm?.opportunities ?? 0}</div>}
            <p className="text-xs text-muted-foreground">Pipeline items</p>
            <div className="mt-3">
              <Button variant="outline" size="sm" onClick={() => navigate('/admin-dashboard/data')}>View</Button>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Payments (30d)</CardTitle>
            <CheckCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {loading ? (
              <Skeleton className="h-8 w-32" />
            ) : (
              <div className="text-2xl font-bold">
                ${Number(data?.erp?.payments?.last30Amount || 0).toLocaleString()}
              </div>
            )}
            <p className="text-xs text-muted-foreground">
              {loading ? '' : `${data?.erp?.payments?.last30Count ?? 0} transactions`}
            </p>
            <div className="mt-3">
              <Button variant="outline" size="sm" onClick={() => navigate('/admin-dashboard/payments')}>View</Button>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Orders Pending Fulfillment</CardTitle>
            <XCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {loading ? <Skeleton className="h-8 w-24" /> : <div className="text-2xl font-bold">{data?.erp?.orders?.pendingFulfillment ?? 0}</div>}
            <p className="text-xs text-muted-foreground">Awaiting action</p>
            <div className="mt-3">
              <Button variant="outline" size="sm" onClick={() => navigate('/admin-dashboard/data')}>View</Button>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
        {/* System Alerts */}
        <Card className="col-span-4">
          <CardHeader>
            <CardTitle>System Alerts & Issues</CardTitle>
            <CardDescription>
              Critical operational issues requiring your attention.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {loading ? (
                <div className="space-y-3">
                  <Skeleton className="h-16 w-full" />
                  <Skeleton className="h-16 w-full" />
                  <Skeleton className="h-16 w-full" />
                </div>
              ) : (
                (data?.alerts || []).map((alert: any, i: number) => (
                  <div key={i} className="flex items-start gap-4 p-3 rounded-lg border bg-slate-50">
                    <div className={`mt-1 h-2 w-2 rounded-full ${alert.severity === 'high' ? 'bg-red-500' : alert.severity === 'medium' ? 'bg-amber-500' : alert.severity === 'amber' ? 'bg-amber-500' : 'bg-blue-500'}`} />
                    <div className="flex-1">
                      <p className="text-sm font-medium text-slate-900">{alert.title}</p>
                      <p className="text-sm text-slate-500">{alert.desc}</p>
                    </div>
                    <span className="text-xs text-slate-400">{alert.time || 'recent'}</span>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>

        {/* Pending Actions */}
        <Card className="col-span-3">
          <CardHeader>
            <CardTitle>Pending Actions</CardTitle>
            <CardDescription>
              Tasks waiting for admin intervention.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {loading ? (
                <div className="space-y-3">
                  <Skeleton className="h-10 w-full" />
                  <Skeleton className="h-10 w-full" />
                  <Skeleton className="h-10 w-full" />
                </div>
              ) : (
                (data?.pendingActions || []).map((item: any, i: number) => (
                  <div key={i} className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="h-9 w-9 rounded-full bg-slate-100 flex items-center justify-center text-slate-600">
                        <FileText size={16} />
                      </div>
                      <div>
                        <p className="text-sm font-medium leading-none">{item.title}</p>
                        <p className="text-xs text-muted-foreground mt-1">{item.desc}</p>
                      </div>
                    </div>
                    <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                      <ArrowRight size={16} />
                    </Button>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
         <Card>
            <CardHeader>
                <CardTitle className="text-base">Document Uploads</CardTitle>
            </CardHeader>
            <CardContent>
                {loading ? <Skeleton className="h-8 w-24" /> : <div className="text-3xl font-bold">{data?.documents?.total ?? 0}</div>}
                <p className="text-sm text-muted-foreground">Total documents</p>
                <div className="mt-4 h-2 w-full bg-slate-100 rounded-full overflow-hidden">
                    <div className="h-full bg-blue-500 w-[65%]" />
                </div>
            </CardContent>
         </Card>
         <Card>
            <CardHeader>
                <CardTitle className="text-base">Contracts Expiring Soon</CardTitle>
            </CardHeader>
            <CardContent>
                {loading ? <Skeleton className="h-8 w-24" /> : <div className="text-3xl font-bold text-amber-600">{data?.clm?.contractsExpiringSoon ?? 0}</div>}
                <p className="text-sm text-muted-foreground">Next 7 days</p>
                 <div className="mt-4 h-2 w-full bg-slate-100 rounded-full overflow-hidden">
                    <div className="h-full bg-amber-500 w-[25%]" />
                </div>
            </CardContent>
         </Card>
         <Card>
            <CardHeader>
                <CardTitle className="text-base">Storage Usage</CardTitle>
            </CardHeader>
            <CardContent>
                <div className="text-3xl font-bold">45%</div>
                <p className="text-sm text-muted-foreground">2.4TB / 5TB Used</p>
                 <div className="mt-4 h-2 w-full bg-slate-100 rounded-full overflow-hidden">
                    <div className="h-full bg-slate-800 w-[45%]" />
                </div>
            </CardContent>
         </Card>
      </div>
    </div>
  );
};

export default AdminDashboardPage;

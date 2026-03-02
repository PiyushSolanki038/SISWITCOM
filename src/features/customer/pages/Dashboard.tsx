import React, { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { 
  FileText, 
  FileCheck, 
  FolderOpen, 
  Clock,
  CheckCircle2,
  AlertCircle,
  HelpCircle,
  ArrowRight,
  Bell,
  Calendar,
  Activity as ActivityIcon,
  TrendingUp,
  CreditCard,
  Plus,
  User,
  PenTool
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/context/AuthContext';
import { 
  customerService, 
  CustomerQuote, 
  CustomerContract, 
  CustomerDocument,
  CustomerSubscription,
  CustomerActivity
} from '../services/customerService';
import { cn } from '@/lib/utils';

const Dashboard: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [quotes, setQuotes] = useState<CustomerQuote[]>([]);
  const [contracts, setContracts] = useState<CustomerContract[]>([]);
  const [documents, setDocuments] = useState<CustomerDocument[]>([]);
  const [subscriptions, setSubscriptions] = useState<CustomerSubscription[]>([]);
  const [activities, setActivities] = useState<CustomerActivity[]>([]);

  useEffect(() => {
    // Redirect inactive customers to plan selection
    if (user?.role === 'customer' && user?.subscriptionStatus !== 'active') {
      navigate('/select-plan');
    }
    
    const fetchData = async () => {
      try {
        const [
          quotesData,
          contractsData,
          documentsData,
          subscriptionsData,
          activitiesData
        ] = await Promise.all([
          customerService.getQuotes(),
          customerService.getContracts(),
          customerService.getDocuments(),
          customerService.getSubscriptions(),
          customerService.getActivity()
        ]);

        setQuotes(quotesData);
        setContracts(contractsData);
        setDocuments(documentsData);
        setSubscriptions(subscriptionsData);
        setActivities(activitiesData);
      } catch (error) {
        console.error("Error fetching dashboard data:", error);
      }
    };

    fetchData();
  }, []);

  // Action Required
  const awaitingAcceptanceQuotes = quotes.filter(q => q.status === 'Sent');
  const pendingSignatures = contracts.filter(c => c.status === 'Sent for Signature');
  
  // Expiring Soon (simulated logic - checking if end date is within 90 days)
  const today = new Date();
  const ninetyDaysFromNow = new Date();
  ninetyDaysFromNow.setDate(today.getDate() + 90);

  const expiringContracts = contracts.filter(c => {
    if (c.status !== 'Active') return false;
    const endDate = new Date(c.endDate);
    return endDate >= today && endDate <= ninetyDaysFromNow;
  });

  // Active Services
  const activeSubscriptions = subscriptions.filter(s => s.status === 'Active');

  // Recent Items
  const recentDocuments = documents.slice(0, 3);
  const recentActivity = activities.slice(0, 4);

  const StatCard = ({ title, value, icon: Icon, trend, color, link }: any) => (
    <Card className="hover:shadow-md transition-shadow border-t-4" style={{ borderTopColor: color }}>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium text-slate-600">{title}</CardTitle>
        <div className={`p-2 rounded-full bg-slate-50`}>
          <Icon className="h-4 w-4 text-slate-600" />
        </div>
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold text-slate-900">{value}</div>
        <div className="flex items-center justify-between mt-1">
          <p className="text-xs text-slate-500">{trend}</p>
          {link && (
            <Link to={link} className="text-xs font-medium text-slate-600 hover:text-slate-900 flex items-center gap-1">
              View <ArrowRight size={10} />
            </Link>
          )}
        </div>
      </CardContent>
    </Card>
  );

  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      {/* Welcome Section */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6 border-b border-slate-200 pb-6">
        <div>
          <h2 className="text-3xl font-bold tracking-tight text-[#1A3C34]">
            Welcome back, {user?.name?.split(' ')[0] || 'Customer'}
          </h2>
          <p className="text-slate-500 mt-2 flex items-center gap-2">
            <Calendar size={14} />
            {new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Link to="/customer-dashboard/support">
            <Button variant="outline" className="gap-2 border-slate-300">
              <HelpCircle size={16} />
              Support Center
            </Button>
          </Link>
          <Link to="/customer-dashboard/notifications">
            <Button className="gap-2 bg-[#1A3C34] hover:bg-[#1A3C34]/90 text-white shadow-sm">
              <Bell size={16} />
              Notifications
              <Badge className="ml-1 bg-white/20 text-white hover:bg-white/30 border-none">3</Badge>
            </Button>
          </Link>
        </div>
      </div>

      {/* KPI Stats Grid */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <StatCard 
          title="Active Quotes" 
          value={quotes.filter(q => q.status === 'Sent' || q.status === 'Accepted').length}
          icon={FileText}
          trend="2 pending review"
          color="#3b82f6" // blue
          link="/customer-dashboard/quotes"
        />
        <StatCard 
          title="Active Contracts" 
          value={contracts.filter(c => c.status === 'Active').length}
          icon={FileCheck}
          trend="1 expiring soon"
          color="#10b981" // green
          link="/customer-dashboard/contracts"
        />
        <StatCard 
          title="Subscriptions" 
          value={activeSubscriptions.length}
          icon={CreditCard}
          trend="All systems operational"
          color="#8b5cf6" // purple
          link="/customer-dashboard/subscriptions"
        />
        <StatCard 
          title="Documents" 
          value={documents.length}
          icon={FolderOpen}
          trend="+3 new this month"
          color="#f59e0b" // amber
          link="/customer-dashboard/documents"
        />
      </div>

      <div className="grid gap-6 md:grid-cols-7">
        {/* Main Content Column (Left) */}
        <div className="md:col-span-4 space-y-6">
          
          {/* Action Required Section */}
          {(awaitingAcceptanceQuotes.length > 0 || pendingSignatures.length > 0) && (
            <Card className="border-l-4 border-l-amber-500 shadow-sm overflow-hidden">
              <CardHeader className="bg-amber-50/50 pb-3">
                <CardTitle className="text-lg font-semibold text-amber-900 flex items-center gap-2">
                  <AlertCircle className="h-5 w-5 text-amber-600" />
                  Requires Attention
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-4 grid gap-3">
                {awaitingAcceptanceQuotes.map(quote => (
                  <div key={quote.id} className="flex items-center justify-between p-3 bg-white border border-amber-100 rounded-lg shadow-sm">
                    <div className="flex items-center gap-3">
                      <div className="h-8 w-8 rounded-full bg-amber-100 flex items-center justify-center">
                        <FileText size={16} className="text-amber-700" />
                      </div>
                      <div>
                        <p className="font-medium text-slate-900">{quote.title}</p>
                        <p className="text-xs text-slate-500">Awaiting your acceptance</p>
                      </div>
                    </div>
                    <Button size="sm" variant="outline" className="border-amber-200 text-amber-800 hover:bg-amber-50" asChild>
                      <Link to={`/customer-dashboard/quotes/${quote.id}`}>Review</Link>
                    </Button>
                  </div>
                ))}
                {pendingSignatures.map(contract => (
                  <div key={contract.id} className="flex items-center justify-between p-3 bg-white border border-amber-100 rounded-lg shadow-sm">
                    <div className="flex items-center gap-3">
                      <div className="h-8 w-8 rounded-full bg-amber-100 flex items-center justify-center">
                        <PenTool className="h-4 w-4 text-amber-700" />
                      </div>
                      <div>
                        <p className="font-medium text-slate-900">{contract.title}</p>
                        <p className="text-xs text-slate-500">Signature required</p>
                      </div>
                    </div>
                    <Button size="sm" className="bg-amber-600 hover:bg-amber-700 text-white" asChild>
                      <Link to={`/customer-dashboard/sign/${contract.id}`}>Sign Now</Link>
                    </Button>
                  </div>
                ))}
              </CardContent>
            </Card>
          )}

          {/* Recent Activity */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <ActivityIcon size={20} className="text-slate-400" />
                Recent Activity
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="relative border-l border-slate-200 ml-3 space-y-6 pb-2">
                {recentActivity.map((activity, index) => (
                  <div key={activity.id} className="relative pl-6">
                    <div className={cn(
                      "absolute -left-1.5 mt-1.5 h-3 w-3 rounded-full border-2 border-white",
                      index === 0 ? "bg-emerald-500" : "bg-slate-300"
                    )} />
                    <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-1">
                      <p className="text-sm font-medium text-slate-900">{activity.action}</p>
                      <span className="text-xs text-slate-400 whitespace-nowrap">{activity.date}</span>
                    </div>
                    <p className="text-xs text-slate-500 mt-0.5">{activity.details}</p>
                  </div>
                ))}
              </div>
              <Button variant="ghost" className="w-full mt-4 text-slate-500 text-xs hover:text-slate-900" asChild>
                <Link to="/customer-dashboard/activity">View Full History</Link>
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Sidebar Column (Right) */}
        <div className="md:col-span-3 space-y-6">
          {/* Quick Actions */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Quick Actions</CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-2 gap-3">
              <Link to="/customer-dashboard/support" className="flex flex-col items-center justify-center p-4 rounded-lg border border-slate-200 hover:border-[#1A3C34] hover:bg-slate-50 transition-all text-center group">
                <HelpCircle className="h-6 w-6 text-slate-400 group-hover:text-[#1A3C34] mb-2 transition-colors" />
                <span className="text-xs font-medium text-slate-600 group-hover:text-slate-900">Get Support</span>
              </Link>
              <Link to="/customer-dashboard/profile" className="flex flex-col items-center justify-center p-4 rounded-lg border border-slate-200 hover:border-[#1A3C34] hover:bg-slate-50 transition-all text-center group">
                <User className="h-6 w-6 text-slate-400 group-hover:text-[#1A3C34] mb-2 transition-colors" />
                <span className="text-xs font-medium text-slate-600 group-hover:text-slate-900">Profile</span>
              </Link>
              <Link to="/customer-dashboard/documents" className="flex flex-col items-center justify-center p-4 rounded-lg border border-slate-200 hover:border-[#1A3C34] hover:bg-slate-50 transition-all text-center group">
                <FolderOpen className="h-6 w-6 text-slate-400 group-hover:text-[#1A3C34] mb-2 transition-colors" />
                <span className="text-xs font-medium text-slate-600 group-hover:text-slate-900">Documents</span>
              </Link>
              <Link to="/customer-dashboard/quotes" className="flex flex-col items-center justify-center p-4 rounded-lg border border-slate-200 hover:border-[#1A3C34] hover:bg-slate-50 transition-all text-center group">
                <FileText className="h-6 w-6 text-slate-400 group-hover:text-[#1A3C34] mb-2 transition-colors" />
                <span className="text-xs font-medium text-slate-600 group-hover:text-slate-900">View Quotes</span>
              </Link>
            </CardContent>
          </Card>

          {/* Active Services / Account Health */}
          <Card className="bg-[#1A3C34] text-white overflow-hidden relative">
            <div className="absolute top-0 right-0 p-8 opacity-10">
              <CheckCircle2 size={120} />
            </div>
            <CardHeader>
              <CardTitle className="text-white">Account Health</CardTitle>
              <CardDescription className="text-emerald-100">All systems operational</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4 relative z-10">
                <div className="flex items-center justify-between text-sm border-b border-white/10 pb-2">
                  <span className="text-emerald-100">Subscription</span>
                  <span className="font-medium text-white">Active</span>
                </div>
                <div className="flex items-center justify-between text-sm border-b border-white/10 pb-2">
                  <span className="text-emerald-100">Next Billing</span>
                  <span className="font-medium text-white">Mar 1, 2026</span>
                </div>
                <div className="pt-2">
                  <Button variant="secondary" className="w-full bg-white text-[#1A3C34] hover:bg-emerald-50" asChild>
                    <Link to="/customer-dashboard/subscriptions">Manage Subscription</Link>
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
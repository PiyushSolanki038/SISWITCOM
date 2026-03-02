import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { 
  MoreHorizontal, 
  DollarSign, 
  TrendingUp, 
  Calendar,
  Filter,
  Download,
  Plus,
  Users,
  Briefcase,
  CheckCircle2,
  Clock,
  Phone,
  Mail,
  ArrowRight,
  Target
} from 'lucide-react';
import { motion } from 'framer-motion';
import { toast } from "sonner";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Deal, Lead, Activity, crmService } from '@/features/employee/services/crmService';

const Overview: React.FC = () => {
  const navigate = useNavigate();
  const [deals, setDeals] = useState<Deal[]>([]);
  const [leads, setLeads] = useState<Lead[]>([]);
  const [activities, setActivities] = useState<Activity[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      try {
        const [fetchedDeals, fetchedLeads, fetchedActivities] = await Promise.all([
          crmService.getDeals(),
          crmService.getLeads(),
          crmService.getActivities()
        ]);
        setDeals(fetchedDeals);
        setLeads(fetchedLeads);
        setActivities(fetchedActivities);
      } catch (error) {
        toast.error("Failed to load CRM data");
        console.error(error);
      } finally {
        setIsLoading(false);
      }
    };

    loadData();
  }, []);

  // Stats Calculation
  const totalPipeline = deals.reduce((sum, d) => d.stage !== 'closed' ? sum + d.value : sum, 0);
  const activeDealsCount = deals.filter(d => d.stage !== 'closed').length;
  const weightedPipeline = deals.reduce((sum, d) => d.stage !== 'closed' ? sum + (d.value * (d.probability / 100)) : sum, 0);
  const wonRevenue = deals.filter(d => d.stage === 'closed').reduce((sum, d) => sum + d.value, 0);

  const calculateStageStats = () => {
    const stages = [
      { id: 'qualification', name: 'Qualification', color: 'bg-blue-500', count: 0, value: 0 },
      { id: 'proposal', name: 'Proposal', color: 'bg-indigo-500', count: 0, value: 0 },
      { id: 'negotiation', name: 'Negotiation', color: 'bg-amber-500', count: 0, value: 0 },
      { id: 'closed', name: 'Closed Won', color: 'bg-emerald-500', count: 0, value: 0 }
    ];

    deals.forEach(deal => {
      const stage = stages.find(s => s.id === deal.stage);
      if (stage) {
        stage.count++;
        stage.value += deal.value;
      }
    });

    return stages;
  };

  const stageStats = calculateStageStats();
  const maxStageValue = Math.max(...stageStats.map(s => s.value), 1);

  return (
    <div className="p-6 md:p-8 max-w-[1600px] mx-auto space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-[#1A3C34]">CRM Dashboard</h1>
          <p className="text-slate-500 mt-1">Overview of your sales pipeline, activities, and performance.</p>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="outline" className="border-slate-200 text-slate-600">
            <Calendar className="w-4 h-4 mr-2" /> This Quarter
          </Button>
          <Button onClick={() => navigate('/employee-dashboard/crm/opportunities?new=true')} className="bg-[#1A3C34] hover:bg-[#122a25] text-white">
            <Plus className="w-4 h-4 mr-2" /> New Opportunity
          </Button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-sm font-medium text-slate-500">Pipeline Value</p>
                <h3 className="text-2xl font-bold text-[#1A3C34] mt-2">${(totalPipeline / 1000).toFixed(1)}k</h3>
              </div>
              <div className="p-2 bg-blue-50 rounded-lg">
                <DollarSign className="w-5 h-5 text-blue-600" />
              </div>
            </div>
            <div className="mt-4 flex items-center text-xs text-slate-500">
              <span className="text-emerald-600 font-medium flex items-center mr-2">
                <TrendingUp className="w-3 h-3 mr-1" /> +12%
              </span>
              from last month
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-sm font-medium text-slate-500">Weighted Value</p>
                <h3 className="text-2xl font-bold text-[#1A3C34] mt-2">${(weightedPipeline / 1000).toFixed(1)}k</h3>
              </div>
              <div className="p-2 bg-indigo-50 rounded-lg">
                <Target className="w-5 h-5 text-indigo-600" />
              </div>
            </div>
            <div className="mt-4 text-xs text-slate-500">
              Forecasted revenue based on probability
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-sm font-medium text-slate-500">Active Deals</p>
                <h3 className="text-2xl font-bold text-[#1A3C34] mt-2">{activeDealsCount}</h3>
              </div>
              <div className="p-2 bg-amber-50 rounded-lg">
                <Briefcase className="w-5 h-5 text-amber-600" />
              </div>
            </div>
            <div className="mt-4 text-xs text-slate-500">
              Across {stageStats.filter(s => s.id !== 'closed').length} active stages
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-sm font-medium text-slate-500">Won Revenue (Q1)</p>
                <h3 className="text-2xl font-bold text-[#1A3C34] mt-2">${(wonRevenue / 1000).toFixed(1)}k</h3>
              </div>
              <div className="p-2 bg-emerald-50 rounded-lg">
                <CheckCircle2 className="w-5 h-5 text-emerald-600" />
              </div>
            </div>
            <div className="mt-4 text-xs text-slate-500">
              <span className="text-emerald-600 font-medium">100%</span> success rate on closed deals
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Pipeline Funnel */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Pipeline Stages</CardTitle>
            <CardDescription>Value distribution across sales stages</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              {stageStats.map((stage) => (
                <div key={stage.id} className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="font-medium text-slate-700">{stage.name}</span>
                    <span className="text-slate-500">${stage.value.toLocaleString()} ({stage.count} deals)</span>
                  </div>
                  <div className="h-3 w-full bg-slate-100 rounded-full overflow-hidden">
                    <motion.div 
                      initial={{ width: 0 }}
                      animate={{ width: `${(stage.value / maxStageValue) * 100}%` }}
                      transition={{ duration: 1, ease: "easeOut" }}
                      className={`h-full rounded-full ${stage.color}`} 
                    />
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Top Leads */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Hot Leads</CardTitle>
            <Button variant="ghost" size="sm" onClick={() => navigate('/employee-dashboard/crm/leads')}>View All</Button>
          </CardHeader>
          <CardContent className="p-0">
            <div className="divide-y divide-slate-100">
              {leads.filter(l => l.score > 70).map((lead) => (
                <div key={lead._id} className="p-4 hover:bg-slate-50 transition-colors flex items-center justify-between group cursor-pointer" onClick={() => navigate(`/employee-dashboard/crm/leads/${lead._id}`)}>
                  <div className="flex items-center gap-3">
                    <div className={`w-2 h-2 rounded-full ${lead.score >= 90 ? 'bg-red-500' : 'bg-orange-500'}`} />
                    <div>
                      <p className="font-medium text-sm text-[#1A3C34]">{lead.name}</p>
                      <p className="text-xs text-slate-500">{lead.company}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <Badge variant="secondary" className="text-xs font-normal">Score: {lead.score}</Badge>
                  </div>
                </div>
              ))}
            </div>
            <div className="p-4 border-t border-slate-100 bg-slate-50/50">
              <Button variant="outline" className="w-full text-xs h-8" onClick={() => navigate('/employee-dashboard/crm/leads?new=true')}>
                <Plus className="w-3 h-3 mr-2" /> Add New Lead
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Activity */}
        <Card>
          <CardHeader>
            <CardTitle>Upcoming Activities</CardTitle>
            <CardDescription>Your schedule for today and tomorrow</CardDescription>
          </CardHeader>
          <CardContent className="p-0">
            <ScrollArea className="h-[300px]">
              <div className="divide-y divide-slate-100">
                {activities.filter(Boolean).map((activity) => (
                  <div key={activity._id} className="p-4 flex items-start gap-4 hover:bg-slate-50 transition-colors">
                    <div className={`p-2 rounded-lg shrink-0 ${
                      activity.type === 'call' ? 'bg-blue-50 text-blue-600' :
                      activity.type === 'meeting' ? 'bg-purple-50 text-purple-600' :
                      'bg-slate-50 text-slate-600'
                    }`}>
                      {activity.type === 'call' && <Phone className="w-4 h-4" />}
                      {activity.type === 'meeting' && <Users className="w-4 h-4" />}
                      {activity.type === 'email' && <Mail className="w-4 h-4" />}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex justify-between items-start">
                        <h4 className="font-medium text-sm text-[#1A3C34] truncate">{activity.title}</h4>
                        <span className="text-xs text-slate-500 whitespace-nowrap ml-2">{activity.time}</span>
                      </div>
                      <p className="text-xs text-slate-500 mt-0.5 truncate">{activity.description}</p>
                      <div className="flex items-center gap-2 mt-2">
                        <Badge variant="outline" className="text-[10px] h-5 px-1.5 font-normal border-slate-200 text-slate-500">
                          {(activity.relatedTo?.type && activity.relatedTo?.name)
                            ? `${activity.relatedTo.type}: ${activity.relatedTo.name}`
                            : 'General'}
                        </Badge>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </ScrollArea>
          </CardContent>
        </Card>

        {/* Recent Deals */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Recent Deals</CardTitle>
            <Button variant="ghost" size="sm" onClick={() => navigate('/employee-dashboard/crm/opportunities')}>View All</Button>
          </CardHeader>
          <CardContent className="p-0">
            <div className="divide-y divide-slate-100">
              {deals.slice(0, 4).map((deal) => (
                <div key={deal._id} className="p-4 hover:bg-slate-50 transition-colors flex items-center justify-between cursor-pointer" onClick={() => navigate(`/employee-dashboard/crm/opportunities/${deal._id}`)}>
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-emerald-50 rounded text-emerald-600">
                      <DollarSign className="w-4 h-4" />
                    </div>
                    <div>
                      <p className="font-medium text-sm text-[#1A3C34]">{deal.title}</p>
                      <p className="text-xs text-slate-500">{deal.company}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-medium text-sm text-[#1A3C34]">${deal.value.toLocaleString()}</p>
                    <Badge 
                      variant="secondary" 
                      className={`text-[10px] mt-1 font-normal ${
                        deal.stage === 'closed' ? 'bg-emerald-50 text-emerald-700' :
                        deal.stage === 'negotiation' ? 'bg-amber-50 text-amber-700' :
                        'bg-blue-50 text-blue-700'
                      }`}
                    >
                      {deal.stage}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Overview;

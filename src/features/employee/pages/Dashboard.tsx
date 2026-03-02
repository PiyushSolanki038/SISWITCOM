import React from 'react';
import { 
  Users, 
  ShoppingCart, 
  FileCheck, 
  TrendingUp, 
  CheckCircle2,
  PenTool,
  Calendar,
  ArrowRight,
  ListTodo,
  FolderOpen,
  Clock,
  AlertCircle
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Link } from 'react-router-dom';
import { Badge } from '@/components/ui/badge';

const EmployeeDashboard: React.FC = () => {
  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h2 className="text-3xl font-bold tracking-tight text-[#1A3C34]">Employee Dashboard</h2>
          <p className="text-slate-500 mt-2">Welcome back. Here's what's happening today.</p>
        </div>
        <div className="flex items-center gap-2">
          <Link to="/employee-dashboard/cpq/quotes/new">
            <Button className="bg-[#1A3C34] hover:bg-[#1A3C34]/90 text-white">
              <ShoppingCart className="mr-2 h-4 w-4" /> New Quote
            </Button>
          </Link>
          <Link to="/employee-dashboard/clm/contracts/new">
            <Button variant="outline" className="border-[#1A3C34] text-[#1A3C34] hover:bg-[#1A3C34]/10">
              <FileCheck className="mr-2 h-4 w-4" /> New Contract
            </Button>
          </Link>
        </div>
      </div>

      {/* 1. Key Metrics Section */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card className="hover:shadow-md transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-slate-600">Total Leads</CardTitle>
            <div className="p-2 bg-blue-100 rounded-lg">
              <Users className="h-4 w-4 text-blue-600" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-[#1A3C34]">1,248</div>
            <p className="text-xs text-slate-500 mt-1 flex items-center">
              <TrendingUp className="h-3 w-3 mr-1 text-green-600" />
              <span className="text-green-600 font-medium">+18%</span> from last month
            </p>
          </CardContent>
        </Card>
        <Card className="hover:shadow-md transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-slate-600">Active Quotes</CardTitle>
            <div className="p-2 bg-indigo-100 rounded-lg">
              <ShoppingCart className="h-4 w-4 text-indigo-600" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-[#1A3C34]">34</div>
            <p className="text-xs text-slate-500 mt-1 flex items-center">
              <Clock className="h-3 w-3 mr-1 text-orange-500" />
              <span className="text-orange-500 font-medium">2 pending approval</span>
            </p>
          </CardContent>
        </Card>
        <Card className="hover:shadow-md transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-slate-600">Contracts</CardTitle>
            <div className="p-2 bg-purple-100 rounded-lg">
              <FileCheck className="h-4 w-4 text-purple-600" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-[#1A3C34]">12</div>
            <p className="text-xs text-slate-500 mt-1 flex items-center">
              <AlertCircle className="h-3 w-3 mr-1 text-red-500" />
              <span className="text-red-500 font-medium">4 expiring soon</span>
            </p>
          </CardContent>
        </Card>
        <Card className="hover:shadow-md transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-slate-600">Recent Docs</CardTitle>
            <div className="p-2 bg-emerald-100 rounded-lg">
              <FolderOpen className="h-4 w-4 text-emerald-600" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-[#1A3C34]">8</div>
            <p className="text-xs text-slate-500 mt-1 flex items-center">
              <CheckCircle2 className="h-3 w-3 mr-1 text-green-600" />
              <span className="text-green-600 font-medium">3 uploaded today</span>
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-7">
        
        {/* Left Column (Main Content) */}
        <div className="col-span-4 space-y-6">
          
          {/* 2. Pipeline Overview */}
          <Card>
            <CardHeader>
              <CardTitle>Pipeline Overview</CardTitle>
              <CardDescription>Value by opportunity stage</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {[
                  { stage: 'Prospecting', value: '$45,000', count: 12, percent: 20, color: 'bg-blue-500' },
                  { stage: 'Qualification', value: '$120,000', count: 8, percent: 45, color: 'bg-indigo-500' },
                  { stage: 'Proposal', value: '$85,000', count: 5, percent: 30, color: 'bg-purple-500' },
                  { stage: 'Negotiation', value: '$50,000', count: 3, percent: 15, color: 'bg-emerald-500' },
                ].map((item) => (
                  <div key={item.stage} className="space-y-1">
                    <div className="flex items-center justify-between text-sm">
                      <span className="font-medium text-slate-700">{item.stage}</span>
                      <span className="text-slate-500">{item.value} ({item.count})</span>
                    </div>
                    <div className="h-2 w-full rounded-full bg-slate-100 overflow-hidden">
                      <div className={`h-full rounded-full ${item.color}`} style={{ width: `${item.percent}%` }} />
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* 3. Active Business Tabs */}
          <Card>
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Active Business</CardTitle>
                  <CardDescription>Recent quotes, contracts, and docs</CardDescription>
                </div>
                <Link to="/employee-dashboard/crm/opportunities">
                  <Button variant="ghost" size="sm" className="text-[#1A3C34]">
                    View All <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </Link>
              </div>
            </CardHeader>
            <CardContent>
              <Tabs defaultValue="quotes" className="w-full">
                <TabsList className="grid w-full grid-cols-3 mb-4">
                  <TabsTrigger value="quotes">Quotes</TabsTrigger>
                  <TabsTrigger value="contracts">Contracts</TabsTrigger>
                  <TabsTrigger value="docs">Recent Docs</TabsTrigger>
                </TabsList>
                
                <TabsContent value="quotes" className="space-y-4">
                  {[
                    { id: 'Q-1024', client: 'Acme Corp', amount: '$12,000', status: 'Draft', date: 'Today' },
                    { id: 'Q-1023', client: 'TechStart', amount: '$5,500', status: 'Sent', date: 'Yesterday' },
                    { id: 'Q-1022', client: 'Global Ind', amount: '$22,000', status: 'Approved', date: '2 days ago' },
                  ].map((quote) => (
                    <div key={quote.id} className="flex items-center justify-between p-3 border rounded-lg bg-slate-50/50 hover:bg-slate-50 transition-colors cursor-pointer group">
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-blue-100 text-blue-600 rounded-md group-hover:bg-blue-200 transition-colors">
                          <ShoppingCart className="h-4 w-4" />
                        </div>
                        <div>
                          <p className="font-medium text-sm text-slate-900">{quote.client}</p>
                          <p className="text-xs text-slate-500">{quote.id} • {quote.date}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-bold text-sm text-slate-900">{quote.amount}</p>
                        <Badge variant="outline" className={`mt-1 text-[10px] uppercase ${
                          quote.status === 'Approved' ? 'text-green-600 bg-green-50 border-green-200' :
                          quote.status === 'Sent' ? 'text-blue-600 bg-blue-50 border-blue-200' :
                          'text-slate-600 bg-slate-100 border-slate-200'
                        }`}>
                          {quote.status}
                        </Badge>
                      </div>
                    </div>
                  ))}
                </TabsContent>

                <TabsContent value="contracts" className="space-y-4">
                   {[
                    { id: 'C-2044', client: 'Beta Systems', type: 'MSA', status: 'Pending Sig', date: 'Today' },
                    { id: 'C-2043', client: 'Alpha Corp', type: 'NDA', status: 'Active', date: 'Last week' },
                  ].map((contract) => (
                    <div key={contract.id} className="flex items-center justify-between p-3 border rounded-lg bg-slate-50/50 hover:bg-slate-50 transition-colors cursor-pointer group">
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-purple-100 text-purple-600 rounded-md group-hover:bg-purple-200 transition-colors">
                          <FileCheck className="h-4 w-4" />
                        </div>
                        <div>
                          <p className="font-medium text-sm text-slate-900">{contract.client}</p>
                          <p className="text-xs text-slate-500">{contract.type} • {contract.date}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <Badge variant="outline" className={`text-[10px] uppercase ${
                          contract.status === 'Active' ? 'text-green-600 bg-green-50 border-green-200' :
                          'text-orange-600 bg-orange-50 border-orange-200'
                        }`}>
                          {contract.status}
                        </Badge>
                      </div>
                    </div>
                  ))}
                </TabsContent>

                <TabsContent value="docs" className="space-y-4">
                   {[
                    { name: 'Q1 Sales Report.pdf', type: 'Report', size: '2.4 MB', date: 'Today' },
                    { name: 'Acme MSA Final.docx', type: 'Contract', size: '1.1 MB', date: 'Yesterday' },
                    { name: 'Product Catalog 2024.pdf', type: 'Marketing', size: '5.6 MB', date: '2 days ago' },
                  ].map((doc, i) => (
                    <div key={i} className="flex items-center justify-between p-3 border rounded-lg bg-slate-50/50 hover:bg-slate-50 transition-colors cursor-pointer group">
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-emerald-100 text-emerald-600 rounded-md group-hover:bg-emerald-200 transition-colors">
                          <FolderOpen className="h-4 w-4" />
                        </div>
                        <div>
                          <p className="font-medium text-sm text-slate-900">{doc.name}</p>
                          <p className="text-xs text-slate-500">{doc.type} • {doc.size}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <span className="text-xs text-slate-500">{doc.date}</span>
                      </div>
                    </div>
                  ))}
                  <Link to="/employee-dashboard/docs">
                    <Button variant="ghost" className="w-full text-xs text-slate-500 hover:text-[#1A3C34]">View All Documents</Button>
                  </Link>
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>

        </div>

        {/* Right Column (Sidebar Widgets) */}
        <div className="col-span-3 space-y-6">
          
          {/* 4. Quick Actions */}
          <Card className="border-[#1A3C34]/20 shadow-sm">
            <CardHeader className="bg-slate-50/50 pb-4">
              <CardTitle className="text-[#1A3C34]">Quick Actions</CardTitle>
            </CardHeader>
            <CardContent className="grid gap-3 pt-4">
               <Link to="/employee-dashboard/crm/leads?new=true">
                  <Button variant="outline" className="w-full justify-start hover:border-[#1A3C34] hover:text-[#1A3C34]">
                     <Users className="mr-2 h-4 w-4" /> Add New Lead
                  </Button>
               </Link>
               <Link to="/employee-dashboard/cpq/quotes/new">
                  <Button variant="outline" className="w-full justify-start hover:border-[#1A3C34] hover:text-[#1A3C34]">
                     <ShoppingCart className="mr-2 h-4 w-4" /> Create Quote
                  </Button>
               </Link>
               <Link to="/employee-dashboard/clm/contracts/new">
                  <Button variant="outline" className="w-full justify-start hover:border-[#1A3C34] hover:text-[#1A3C34]">
                     <FileCheck className="mr-2 h-4 w-4" /> Create Contract
                  </Button>
               </Link>
               <Link to="/employee-dashboard/docs">
                  <Button variant="outline" className="w-full justify-start hover:border-[#1A3C34] hover:text-[#1A3C34]">
                     <FolderOpen className="mr-2 h-4 w-4" /> Upload Document
                  </Button>
               </Link>
            </CardContent>
          </Card>

          {/* 5. Upcoming Tasks */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>My Tasks</CardTitle>
                <Badge variant="secondary" className="bg-red-100 text-red-600 hover:bg-red-100">3 Due</Badge>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {[
                  { text: 'Follow up with Acme Corp', due: 'Today', priority: 'high' },
                  { text: 'Prepare Q3 Report', due: 'Tomorrow', priority: 'medium' },
                  { text: 'Review new contract templates', due: 'Fri', priority: 'low' },
                ].map((task, i) => (
                  <div key={i} className="flex items-start gap-3 group">
                    <div className="mt-0.5 h-4 w-4 rounded border border-slate-300 group-hover:border-[#1A3C34] cursor-pointer" />
                    <div className="flex-1 space-y-1">
                      <p className="text-sm font-medium text-slate-700 leading-none group-hover:text-[#1A3C34] cursor-pointer">{task.text}</p>
                      <div className="flex items-center gap-2">
                        <span className={`text-[10px] uppercase font-bold ${
                          task.priority === 'high' ? 'text-red-500' : 
                          task.priority === 'medium' ? 'text-orange-500' : 'text-slate-500'
                        }`}>{task.priority}</span>
                        <span className="text-[10px] text-slate-400">• Due {task.due}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              <Button variant="ghost" className="w-full mt-4 text-xs text-[#1A3C34]">
                <ListTodo className="h-3 w-3 mr-2" /> View All Tasks
              </Button>
            </CardContent>
          </Card>

          {/* 6. Upcoming Activities */}
          <Card>
             <CardHeader>
               <CardTitle>Upcoming Activities</CardTitle>
             </CardHeader>
             <CardContent>
               <div className="space-y-6 border-l-2 border-slate-100 ml-2 pl-4 relative">
                 {[
                   { title: 'Demo with TechStart', time: '10:00 AM', type: 'Meeting' },
                   { title: 'Team Sync', time: '2:00 PM', type: 'Internal' },
                   { title: 'Client Lunch', time: 'Tomorrow', type: 'Meeting' },
                 ].map((activity, i) => (
                   <div key={i} className="relative">
                     <div className="absolute -left-[21px] top-1 h-2.5 w-2.5 rounded-full bg-slate-300 ring-4 ring-white" />
                     <p className="text-sm font-medium text-slate-900">{activity.title}</p>
                     <p className="text-xs text-slate-500">{activity.time} • {activity.type}</p>
                   </div>
                 ))}
               </div>
               <Link to="/employee-dashboard/crm/activities">
                 <Button variant="ghost" className="w-full mt-4 text-xs text-[#1A3C34]">
                  <Calendar className="h-3 w-3 mr-2" /> View Calendar
                </Button>
              </Link>
             </CardContent>
           </Card>

        </div>
      </div>
    </div>
  );
};

export default EmployeeDashboard;

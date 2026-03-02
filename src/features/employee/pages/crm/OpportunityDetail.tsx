import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Separator } from '@/components/ui/separator';
import { 
  ArrowLeft, 
  DollarSign, 
  Calendar, 
  Building2, 
  User, 
  FileText, 
  CheckCircle2, 
  Clock, 
  AlertCircle,
  Plus,
  MoreHorizontal,
  FileSignature,
  Paperclip,
  Trash2
} from 'lucide-react';
import { toast } from 'sonner';
import { useForm, Controller } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { Loader2 } from 'lucide-react';
import { Deal, Activity, Account, crmService } from '@/features/employee/services/crmService';
import { cpqService } from '@/features/employee/services/cpqService';
import { Quote as CPQQuote } from '@/features/employee/pages/cpq/types';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface Quote {
  id: string;
  number: string;
  amount: number;
  status: 'draft' | 'sent' | 'accepted' | 'rejected';
  date: string;
}

interface Task {
  id: string;
  title: string;
  dueDate: string;
  priority: 'high' | 'medium' | 'low';
  completed: boolean;
}

const OpportunityDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [deal, setDeal] = useState<Deal | null>(null);
  const [activeTab, setActiveTab] = useState('overview');
  const [isEditing, setIsEditing] = useState(false);
  const dealSchema = z.object({
    title: z.string().min(2, 'Title is required'),
    accountId: z.string().min(1, 'Company is required'),
    value: z.coerce.number().min(0, 'Value must be >= 0'),
    probability: z.coerce.number().min(0).max(100, '0-100'),
    closingDate: z.string().min(1, 'Closing date is required'),
    owner: z.string().optional(),
    description: z.string().optional(),
    pipelineStageId: z.string().min(1, 'Stage is required')
  });
  type DealForm = z.infer<typeof dealSchema>;
  const { register, handleSubmit, control, formState: { errors, isSubmitting }, reset, setValue } = useForm<DealForm>({
    resolver: zodResolver(dealSchema),
    defaultValues: { title: '', accountId: '', value: 0, probability: 20, closingDate: new Date().toISOString().split('T')[0], owner: 'Current User', description: '', pipelineStageId: '' }
  });
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);

  // Mock Data
  const [quotes, setQuotes] = useState<Quote[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [activities, setActivities] = useState<Activity[]>([]);
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [stages, setStages] = useState<{ _id: string; name: string; order: number }[]>([]);
  const [newNote, setNewNote] = useState('');
  const [isAddMemberOpen, setIsAddMemberOpen] = useState(false);
  const [memberName, setMemberName] = useState('');
  const [memberRole, setMemberRole] = useState('');
  const [isTaskDialogOpen, setIsTaskDialogOpen] = useState(false);
  const [taskTitle, setTaskTitle] = useState('');
  const [taskDueDate, setTaskDueDate] = useState(new Date().toISOString().split('T')[0]);
  const [taskPriority, setTaskPriority] = useState<'low' | 'medium' | 'high'>('medium');
  const teamMembers = activities
    .filter(a => a.type === 'note' && (a.title?.toLowerCase() === 'team' || (a.description || '').toLowerCase().includes('added member:')))
    .map(a => {
      const text = a.description || '';
      const m = text.match(/Added member:\s*(.+?)\s*\((.+?)\)/i);
      return m ? { name: m[1], role: m[2] } : { name: a.title || 'Member', role: '—' };
    });

  const fetchDealDetails = useCallback(async () => {
    if (!id) return;
    setLoading(true);
    try {
      if (id === 'new') {
        // Initialize empty deal for creation
        const newDeal: Deal = {
          _id: 'new',
          title: 'New Opportunity',
          company: '',
          value: 0,
          stage: 'qualification',
          probability: 20,
          closingDate: new Date().toISOString().split('T')[0],
          owner: 'Current User',
          createdAt: new Date().toISOString()
        };
        setDeal(newDeal);
        reset({
          title: '',
          accountId: '',
          value: 0,
          probability: 20,
          closingDate: newDeal.closingDate,
          owner: 'Current User',
          description: '',
          pipelineStageId: ''
        });
        setIsEditing(true);
      } else {
        const data = await crmService.getDeal(id);
        if (data) {
          setDeal(data);
          reset({
            title: data.title,
            accountId: data.accountId,
            value: data.value,
            probability: data.probability,
            closingDate: data.closingDate,
            owner: data.owner,
            description: data.description || '',
            pipelineStageId: data.pipelineStageId || ''
          });
          
          // Fetch related activities
          const dealActivities = await crmService.getActivities({ 
            relatedTo: { type: 'deal', id: id } 
          });
          
          setActivities(dealActivities.filter(a => a.type !== 'task'));
          setTasks(dealActivities.filter(a => a.type === 'task').map(a => ({
            id: a._id,
            title: a.title,
            dueDate: a.date,
            priority: a.priority || 'medium',
            completed: a.status === 'completed'
          })));
          try {
            const allQuotes: CPQQuote[] = await cpqService.getQuotes();
            const filtered = allQuotes.filter(q => q.opportunity_id === id);
            setQuotes(filtered.map(q => ({
              id: q.id,
              number: q.quote_number || q.id,
              amount: q.grand_total || 0,
              status: (q.status as any) || 'draft',
              date: q.valid_until || ''
            })));
          } catch (e) {}
        } else {
          toast.error("Deal not found");
        }
      }
    } catch (error) {
      console.error('Error fetching deal:', error);
      toast.error('Failed to load deal details');
    } finally {
      setLoading(false);
    }
  }, [id, reset]);

  useEffect(() => {
    fetchDealDetails();
    
    const fetchAccounts = async () => {
      try {
        const data = await crmService.getAccounts();
        setAccounts(data);
      } catch (error) {
        console.error('Error fetching accounts:', error);
      }
    };
    const fetchStages = async () => {
      try {
        const s = await crmService.getStages();
        setStages(s);
      } catch (error) {
        console.error('Error fetching stages:', error);
      }
    };
    fetchAccounts();
    fetchStages();
  }, [fetchDealDetails]);

  const onSave = async (values: DealForm) => {
    try {
      const account = accounts.find(a => a._id === values.accountId);
      if (id === 'new') {
        const created = await crmService.createDeal({
          title: values.title,
          company: account?.name || '',
          accountId: values.accountId,
          value: values.value,
          stage: 'qualification',
          probability: values.probability,
          closingDate: values.closingDate,
          owner: values.owner || 'Current User',
          description: values.description || '',
          pipelineStageId: values.pipelineStageId
        });
        toast.success("Opportunity created successfully");
        navigate(`/employee-dashboard/crm/opportunities`);
      } else if (deal) {
        const updated = await crmService.updateDeal(deal._id, {
          title: values.title,
          company: account?.name || '',
          accountId: values.accountId,
          value: values.value,
          probability: values.probability,
          closingDate: values.closingDate,
          owner: values.owner || 'Current User',
          description: values.description || '',
          pipelineStageId: values.pipelineStageId
        });
        setDeal(updated);
        toast.success("Opportunity updated");
        setIsEditing(false);
      }
    } catch (error: unknown) {
      const msg = error instanceof Error ? error.message : "Failed to save opportunity";
      console.error("Error saving deal:", error);
      toast.error(msg);
    }
  };

  const handleAddNote = async () => {
    if (!newNote.trim() || !deal) return;
    
    try {
        const createdActivity = await crmService.createActivity({
            type: 'note',
            title: 'Note',
            description: newNote,
            date: new Date().toISOString().split('T')[0],
            time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            duration: 0,
            status: 'completed',
            relatedTo: {
                type: 'deal',
                id: deal._id,
                name: deal.title
            }
        });

        const activity: Activity = {
            _id: createdActivity._id,
            type: 'note',
            title: 'Note',
            description: createdActivity.description || '',
            date: createdActivity.date,
            time: createdActivity.time,
            status: 'completed',
            relatedTo: {
              type: 'deal',
              id: deal._id,
              name: deal.title
            },
            createdAt: new Date().toISOString()
        };

        setActivities([activity, ...activities]);
        setNewNote('');
        toast.success('Note added');
    } catch (error) {
        console.error('Error adding note:', error);
        toast.error('Failed to add note');
    }
  };

  if (loading) {
    return <div className="p-8 text-center text-slate-500">Loading deal details...</div>;
  }

  if (!deal) {
    return <div className="p-8 text-center text-slate-500">Deal not found</div>;
  }

  return (
    <div className="space-y-6">
      <div className="sticky top-0 z-20 bg-white/80 backdrop-blur border-b">
        <div className="flex items-center py-3 px-2">
          <div className="flex items-center gap-2 flex-1">
            <Button variant="ghost" size="icon" onClick={() => navigate('/employee-dashboard/crm/opportunities')}>
              <ArrowLeft className="w-4 h-4" />
            </Button>
            <div className="text-sm text-slate-500">
              Employee-dashboard / Crm / Opportunities / <span className="text-slate-700">{id === 'new' ? 'New' : 'Detail'}</span>
            </div>
          </div>
          <div className="hidden md:flex items-center gap-2 flex-1 justify-center">
            {isEditing ? (
              <>
                <Input 
                  placeholder="Opportunity Title"
                  className="font-semibold h-10 max-w-md"
                  {...register('title')}
                />
                {errors.title && <div className="text-sm text-red-600">{errors.title.message}</div>}
                <Badge variant="outline" className="capitalize">{deal?.stage || 'qualification'}</Badge>
              </>
            ) : (
              <>
                <h1 className="text-xl md:text-2xl font-bold text-[#1A3C34] tracking-tight">{deal.title}</h1>
                <Badge variant="outline" className="capitalize">{deal.stage}</Badge>
              </>
            )}
          </div>
          <div className="flex items-center gap-2 flex-1 justify-end">
            {!isEditing && (
              <Button
                variant="outline"
                onClick={() => {
                  setIsEditing(true);
                  if (deal) {
                    reset({
                      title: deal.title,
                      accountId: deal.accountId,
                      value: deal.value,
                      probability: deal.probability,
                      closingDate: deal.closingDate,
                      owner: deal.owner,
                      description: deal.description || '',
                      pipelineStageId: deal.pipelineStageId || ''
                    });
                  }
                }}
              >
                Edit
              </Button>
            )}
            <Button
              variant="outline"
              onClick={() => {
                if (id === 'new') navigate('/employee-dashboard/crm/opportunities');
                else {
                  setIsEditing(false);
                  if (deal) {
                    reset({
                      title: deal.title,
                      accountId: deal.accountId,
                      value: deal.value,
                      probability: deal.probability,
                      closingDate: deal.closingDate,
                      owner: deal.owner,
                      description: deal.description || '',
                      pipelineStageId: deal.pipelineStageId || ''
                    });
                  }
                }
              }}
              disabled={!isEditing}
            >
              Cancel
            </Button>
            <Button
              onClick={handleSubmit(onSave)}
              disabled={isSubmitting || !isEditing}
              className="bg-[#1A3C34] hover:bg-[#17352e]"
            >
              {isSubmitting ? <span className="flex items-center gap-2"><Loader2 className="h-4 w-4 animate-spin" /> Saving...</span> : 'Save'}
            </Button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="bg-slate-50 rounded-md p-1">
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="quotes">Quotes</TabsTrigger>
              <TabsTrigger value="tasks">Tasks</TabsTrigger>
              <TabsTrigger value="activity">Activity</TabsTrigger>
            </TabsList>

            <TabsContent value="overview" className="space-y-6 mt-4">
              <Card className="shadow-sm">
                <CardHeader>
                  <CardTitle>Deal Information</CardTitle>
                </CardHeader>
                <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {isEditing ? (
                    <>
                      <div>
                        <Label className="text-xs text-slate-500">Amount</Label>
                        <Input type="number" className="h-10" {...register('value')} />
                        {errors.value && <div className="text-sm text-red-600">{errors.value.message}</div>}
                      </div>
                      <div>
                        <Label className="text-xs text-slate-500">Probability (%)</Label>
                        <Input type="number" className="h-10" {...register('probability')} />
                        {errors.probability && <div className="text-sm text-red-600">{errors.probability.message}</div>}
                      </div>
                      <div>
                        <Label className="text-xs text-slate-500">Stage</Label>
                        <Controller
                          name="pipelineStageId"
                          control={control}
                          render={({ field }) => (
                            <Select value={field.value} onValueChange={field.onChange}>
                              <SelectTrigger className="h-10">
                                <SelectValue placeholder="Select Stage" />
                              </SelectTrigger>
                              <SelectContent>
                                {stages.map(s => (
                                  <SelectItem key={s._id} value={s._id}>{s.name}</SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          )}
                        />
                        {errors.pipelineStageId && <div className="text-sm text-red-600">{errors.pipelineStageId.message}</div>}
                      </div>
                      <div>
                        <Label className="text-xs text-slate-500">Closing Date</Label>
                        <Input type="date" className="h-10" {...register('closingDate')} />
                        {errors.closingDate && <div className="text-sm text-red-600">{errors.closingDate.message}</div>}
                      </div>
                      <div>
                        <Label className="text-xs text-slate-500">Company</Label>
                        <Controller
                          name="accountId"
                          control={control}
                          render={({ field }) => (
                            <Select value={field.value} onValueChange={field.onChange}>
                              <SelectTrigger className="h-10">
                                <SelectValue placeholder="Select Company" />
                              </SelectTrigger>
                              <SelectContent>
                                {accounts.map(account => (
                                  <SelectItem key={account._id} value={account._id}>
                                    {account.name}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          )}
                        />
                        {errors.accountId && <div className="text-sm text-red-600">{errors.accountId.message}</div>}
                      </div>
                      <div>
                        <Label className="text-xs text-slate-500">Owner</Label>
                        <Input className="h-10" {...register('owner')} />
                      </div>
                      <div className="md:col-span-2">
                        <Label className="text-xs text-slate-500">Description</Label>
                        <Textarea {...register('description')} />
                      </div>
                    </>
                  ) : (
                    <>
                      <div>
                        <Label className="text-xs text-slate-500">Amount</Label>
                        <div className="font-medium text-lg">
                          {new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(deal.value)}
                        </div>
                      </div>
                      <div>
                        <Label className="text-xs text-slate-500">Probability</Label>
                        <div className="font-medium">{deal.probability}%</div>
                      </div>
                      <div>
                        <Label className="text-xs text-slate-500">Stage</Label>
                        <div className="font-medium capitalize">{deal.stage}</div>
                      </div>
                      <div>
                        <Label className="text-xs text-slate-500">Closing Date</Label>
                        <div className="font-medium">{deal.closingDate}</div>
                      </div>
                      <div>
                        <Label className="text-xs text-slate-500">Company</Label>
                        <div className="font-medium">{deal.company || '—'}</div>
                      </div>
                      <div>
                        <Label className="text-xs text-slate-500">Owner</Label>
                        <div className="flex items-center gap-2 mt-1">
                          <div className="w-6 h-6 rounded-full bg-slate-200 flex items-center justify-center text-xs">
                            {deal.owner.charAt(0)}
                          </div>
                          <span>{deal.owner}</span>
                        </div>
                      </div>
                      <div className="md:col-span-2">
                        <Label className="text-xs text-slate-500">Description</Label>
                        <p className="text-sm mt-1">{deal.description || 'No description provided.'}</p>
                      </div>
                    </>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="quotes" className="mt-4">
              <Card className="shadow-sm">
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-lg">Quotes</CardTitle>
                  <Button
                    size="sm"
                    variant="outline"
                    className="rounded-md"
                    onClick={() => navigate(`/employee-dashboard/cpq/quotes/new?opportunityId=${deal._id}&accountId=${deal.accountId}`)}
                  >
                    <Plus className="w-4 h-4 mr-2" /> New Quote
                  </Button>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {quotes.map(quote => (
                      <div key={quote.id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-slate-50 transition">
                        <div className="flex items-center gap-4">
                          <div className="bg-slate-100 p-2 rounded">
                            <FileText className="w-5 h-5 text-slate-600" />
                          </div>
                          <div>
                            <div className="font-medium">{quote.number}</div>
                            <div className="text-sm text-slate-500">{quote.date}</div>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="font-medium">
                            {new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(quote.amount)}
                          </div>
                          <Badge variant="outline" className="capitalize">{quote.status}</Badge>
                        </div>
                      </div>
                    ))}
                    {quotes.length === 0 && (
                      <div className="text-center py-8 text-slate-500">No quotes created yet</div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="tasks" className="mt-4">
              <Card className="shadow-sm">
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-lg">Tasks</CardTitle>
                  <Button size="sm" variant="outline" className="rounded-md" onClick={() => setIsTaskDialogOpen(true)}>
                    <Plus className="w-4 h-4 mr-2" /> New Task
                  </Button>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {tasks.map(task => (
                      <div 
                        key={task.id} 
                        className="flex items-start gap-3 p-3 border rounded-lg hover:bg-slate-50 cursor-pointer transition"
                        onClick={() => navigate(`/employee-dashboard/crm/activities/${task.id}`)}
                      >
                        <div className={`mt-1 w-4 h-4 rounded-full border ${task.completed ? 'bg-green-500 border-green-500' : 'border-slate-300'}`} />
                        <div className="flex-1">
                          <div className={`font-medium ${task.completed ? 'line-through text-slate-500' : ''}`}>
                            {task.title}
                          </div>
                          <div className="flex items-center gap-2 text-xs text-slate-500 mt-1">
                            <Calendar className="w-3 h-3" />
                            {task.dueDate}
                            <Badge variant="secondary" className="ml-2 text-[10px] h-5">{task.priority}</Badge>
                          </div>
                        </div>
                      </div>
                    ))}
                    {tasks.length === 0 && (
                      <div className="text-center py-8 text-slate-500">No pending tasks</div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="activity" className="mt-4">
              <Card className="shadow-sm">
                <CardHeader>
                  <CardTitle className="text-lg">Activity History</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-6">
                    <div className="flex gap-4">
                      <div className="flex-1">
                        <Textarea 
                          placeholder="Add a note..." 
                          className="mb-2"
                          value={newNote}
                          onChange={(e) => setNewNote(e.target.value)}
                        />
                        <div className="flex justify-end">
                          <Button size="sm" className="bg-[#1A3C34] hover:bg-[#17352e]" onClick={handleAddNote} disabled={!newNote.trim()}>Post Note</Button>
                        </div>
                      </div>
                    </div>
                    
                    <Separator />
                    
                    <div className="space-y-6">
                      {activities.map((activity) => (
                        <div key={activity._id} className="flex gap-4">
                          <div className="mt-1">
                            {activity.type === 'call' && <div className="p-2 bg-blue-100 rounded-full text-blue-600"><CheckCircle2 className="w-4 h-4" /></div>}
                            {activity.type === 'email' && <div className="p-2 bg-purple-100 rounded-full text-purple-600"><FileText className="w-4 h-4" /></div>}
                            {activity.type === 'note' && <div className="p-2 bg-yellow-100 rounded-full text-yellow-600"><FileSignature className="w-4 h-4" /></div>}
                          </div>
                          <div className="flex-1">
                            <div className="flex justify-between items-start">
                              <div className="font-medium text-sm">
                                {'Current User'}
                                <span className="text-slate-500 font-normal ml-1">
                                  {activity.type === 'call' && 'logged a call'}
                                  {activity.type === 'email' && 'sent an email'}
                                  {activity.type === 'note' && 'added a note'}
                                </span>
                              </div>
                              <div className="text-xs text-slate-500 flex items-center gap-1">
                                <Clock className="w-3 h-3" />
                                {activity.date}
                              </div>
                            </div>
                            <p className="text-sm mt-1 text-slate-600">{activity.description}</p>
                          </div>
                        </div>
                      ))}
                      {activities.length === 0 && (
                        <div className="text-center py-8 text-slate-500">No activity history</div>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>

        <div className="space-y-6">
          <Card className="shadow-sm">
            <CardHeader>
              <CardTitle className="text-sm font-medium text-slate-500">Stage History</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="relative pl-4 border-l-2 border-slate-200 space-y-6">
                {stages
                  .sort((a, b) => a.order - b.order)
                  .map(s => {
                    const isCurrent = s._id === (deal.pipelineStageId || '');
                    return (
                      <div key={s._id} className="relative">
                        <div className={`absolute -left-[21px] top-1 w-3 h-3 rounded-full ${isCurrent ? 'bg-[#1A3C34] ring-2 ring-white shadow-sm' : 'bg-slate-300'}`} />
                        <div className={`text-sm font-medium ${isCurrent ? 'text-slate-900' : 'text-slate-500'}`}>{s.name}</div>
                        <div className="text-xs text-slate-500">{isCurrent ? 'Current' : ''}</div>
                      </div>
                    );
                  })}
              </div>
            </CardContent>
          </Card>

          <Card className="shadow-sm">
            <CardHeader>
              <CardTitle className="text-sm font-medium text-slate-500">Team</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-3 mb-4">
                <div className="w-8 h-8 rounded-full bg-slate-200 flex items-center justify-center">
                  {deal.owner.charAt(0)}
                </div>
                <div>
                  <div className="text-sm font-medium">{deal.owner}</div>
                  <div className="text-xs text-slate-500">Deal Owner</div>
                </div>
              </div>
              <Button variant="outline" size="sm" className="w-full rounded-md" onClick={() => setIsAddMemberOpen(true)}>
                <Plus className="w-4 h-4 mr-2" /> Add Member
              </Button>
            </CardContent>
          </Card>

          <Card className="shadow-sm">
            <CardHeader>
              <CardTitle className="text-sm font-medium text-slate-500">Quick Actions</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-3">
                <Button
                  variant="outline"
                  onClick={() => setActiveTab('activity')}
                  className="rounded-md"
                >
                  <FileSignature className="w-4 h-4 mr-2" /> Add Note
                </Button>
                <Button
                  variant="outline"
                  onClick={() => navigate(`/employee-dashboard/crm/activities/new?relatedTo=deal&id=${deal._id}`)}
                  className="rounded-md"
                >
                  <CheckCircle2 className="w-4 h-4 mr-2" /> Log Activity
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
      <Dialog open={isAddMemberOpen} onOpenChange={setIsAddMemberOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add Team Member</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Name</Label>
              <Input value={memberName} onChange={(e) => setMemberName(e.target.value)} className="h-10" />
            </div>
            <div className="space-y-2">
              <Label>Role</Label>
              <Input value={memberRole} onChange={(e) => setMemberRole(e.target.value)} className="h-10" />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsAddMemberOpen(false)}>Cancel</Button>
            <Button
              onClick={async () => {
                if (!memberName.trim() || !deal) return;
                try {
                  await crmService.createActivity({
                    type: 'note',
                    title: 'Team',
                    description: `Added member: ${memberName} (${memberRole || 'Member'})`,
                    date: new Date().toISOString().split('T')[0],
                    time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
                    duration: 0,
                    status: 'completed',
                    relatedTo: { type: 'deal', id: deal._id, name: deal.title },
                    createdAt: new Date().toISOString()
                  } as any);
                  const updated = await crmService.getActivities({ relatedTo: { type: 'deal', id: deal._id } });
                  setActivities(updated.filter(a => a.type !== 'task'));
                  setIsAddMemberOpen(false);
                  setMemberName('');
                  setMemberRole('');
                  toast.success('Member added');
                } catch {
                  toast.error('Failed to add member');
                }
              }}
              className="bg-[#1A3C34] hover:bg-[#17352e]"
            >
              Add
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      <Dialog open={isTaskDialogOpen} onOpenChange={setIsTaskDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>New Task</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Title</Label>
              <Input value={taskTitle} onChange={(e) => setTaskTitle(e.target.value)} className="h-10" />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Due Date</Label>
                <Input type="date" value={taskDueDate} onChange={(e) => setTaskDueDate(e.target.value)} className="h-10" />
              </div>
              <div className="space-y-2">
                <Label>Priority</Label>
                <Select value={taskPriority} onValueChange={(v) => setTaskPriority(v as 'low'|'medium'|'high')}>
                  <SelectTrigger className="h-10">
                    <SelectValue placeholder="Select Priority" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="low">Low</SelectItem>
                    <SelectItem value="medium">Medium</SelectItem>
                    <SelectItem value="high">High</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsTaskDialogOpen(false)}>Cancel</Button>
            <Button
              onClick={async () => {
                if (!taskTitle.trim() || !deal) return;
                try {
                  await crmService.createActivity({
                    type: 'task',
                    title: taskTitle.trim(),
                    description: '',
                    date: taskDueDate,
                    time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
                    duration: 30,
                    status: 'scheduled',
                    priority: taskPriority,
                    relatedTo: { type: 'deal', id: deal._id, name: deal.title },
                    createdAt: new Date().toISOString()
                  } as any);
                  const updated = await crmService.getActivities({ relatedTo: { type: 'deal', id: deal._id } });
                  setActivities(updated.filter(a => a.type !== 'task'));
                  setTasks(updated.filter(a => a.type === 'task').map(a => ({
                    id: a._id,
                    title: a.title,
                    dueDate: a.date,
                    priority: a.priority || 'medium',
                    completed: a.status === 'completed'
                  })));
                  setIsTaskDialogOpen(false);
                  setTaskTitle('');
                  toast.success('Task created');
                } catch {
                  toast.error('Failed to create task');
                }
              }}
              className="bg-[#1A3C34] hover:bg-[#17352e]"
            >
              Create Task
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default OpportunityDetail;

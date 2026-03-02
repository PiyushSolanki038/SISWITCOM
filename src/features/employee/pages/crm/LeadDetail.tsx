import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from "@/components/ui/label";
import { 
  ArrowLeft, 
  Building2, 
  Mail, 
  Phone, 
  Calendar, 
  CheckCircle2, 
  StickyNote,
  History,
  Trash2,
  RefreshCw,
  PhoneCall,
  MessageCircle
} from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from "@/components/ui/dialog";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { crmService, Lead, Activity, Deal } from '@/features/employee/services/crmService';
import { useForm, Controller } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { Loader2 } from 'lucide-react';

const LeadDetail: React.FC = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [lead, setLead] = useState<Lead | null>(null);
  const [activities, setActivities] = useState<Activity[]>([]);
  const [tasks, setTasks] = useState<Activity[]>([]);
  const [deals, setDeals] = useState<Deal[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingActivities, setLoadingActivities] = useState(true);
  
  const [activeTab, setActiveTab] = useState('timeline');
  const [isConvertDialogOpen, setIsConvertDialogOpen] = useState(false);
  const [convertDetails, setConvertDetails] = useState({
    dealName: '',
    dealValue: 0
  });
  const [isNoteSubmitting, setIsNoteSubmitting] = useState(false);
  const [newNote, setNewNote] = useState('');

  // Task State
  const [isTaskDialogOpen, setIsTaskDialogOpen] = useState(false);
  const [isTaskSubmitting, setIsTaskSubmitting] = useState(false);
  const [newTask, setNewTask] = useState({
    title: '',
    dueDate: new Date().toISOString().split('T')[0]
  });

  // Edit State
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isUpdateSubmitting] = useState(false);
  const leadSchema = z.object({
    name: z.string().min(2, 'Name is required'),
    email: z.string().email('Valid email required').optional(),
    phone: z
      .string()
      .optional()
      .refine(
        (v) => {
          if (!v) return true;
          const digits = v.replace(/\D/g, '');
          return digits.length >= 10 && digits.length <= 15;
        },
        { message: 'Phone must contain 10–15 digits' }
      ),
    status: z.enum(['new','contacted','qualified','unqualified']),
    company: z.string().optional(),
    title: z.string().optional(),
    address: z.string().optional(),
  });
  type LeadForm = z.infer<typeof leadSchema>;
  const { register, handleSubmit, control, formState: { errors, isSubmitting }, reset } = useForm<LeadForm>({
    resolver: zodResolver(leadSchema),
    defaultValues: { name: '', email: '', phone: '', status: 'new', company: '', title: '', address: '' }
  });

  const fetchLeadDetails = useCallback(async () => {
    if (!id) return;
    setLoading(true);
    try {
      if (id === 'new') {
        const newLead: Lead = {
          _id: 'new',
          name: '',
          title: '',
          company: '',
          email: '',
          phone: '',
          source: 'Website',
          status: 'new',
          owner: 'Current User',
          score: 0,
          lastContacted: new Date().toISOString(),
          createdAt: new Date().toISOString()
        };
        setLead(newLead);
        reset({ name: '', email: '', phone: '', status: 'new', company: '', title: '', address: '' });
        setIsEditDialogOpen(true);
      } else {
        const data = await crmService.getLead(id);
        if (data) {
          setLead(data);
          // Fetch related deals if company is available
          if (data.company) {
             try {
               const relatedDeals = await crmService.getDeals({ company: data.company });
               setDeals(relatedDeals);
             } catch (err) {
               console.error("Failed to fetch related deals", err);
             }
          }
        } else {
          toast.error("Lead not found");
        }
      }
    } catch (error) {
      console.error('Error fetching lead:', error);
      toast.error('Failed to load lead details');
    } finally {
      setLoading(false);
    }
  }, [id, reset]);

  const fetchActivities = useCallback(async () => {
    if (!id || id === 'new') return;
    try {
      setLoadingActivities(true);
      // Get all activities and filter for this lead
      const allActivities = await crmService.getActivities({ relatedTo: { type: 'lead', id } });
      
      // Separate tasks from other activities
      const timelineActivities = allActivities.filter(a => a.type !== 'task');
      const taskActivities = allActivities.filter(a => a.type === 'task');
      
      setActivities(timelineActivities); 
      setTasks(taskActivities);
    } catch (error) {
      console.error('Error fetching activities:', error);
    } finally {
      setLoadingActivities(false);
    }
  }, [id]);

  useEffect(() => {
    fetchLeadDetails();
    fetchActivities();
  }, [fetchLeadDetails, fetchActivities]);

  const openEditDialog = () => {
    if (lead) {
      reset({
        name: lead.name || '',
        email: lead.email || '',
        phone: lead.phone || '',
        status: lead.status,
        company: lead.company || '',
        title: lead.title || '',
        address: lead.address || ''
      });
      setIsEditDialogOpen(true);
    }
  };

  const onUpdateLead = async (values: LeadForm) => {
    if (!lead) return;
    try {
      if (lead._id === 'new') {
        const created = await crmService.createLead({
          name: values.name,
          email: values.email || '',
          phone: values.phone || '',
          status: values.status,
          company: values.company || '',
          title: values.title || '',
          address: values.address || '',
          owner: 'Current User',
          score: 0,
          source: 'Website',
          lastContacted: new Date().toISOString(),
        } as Omit<Lead, '_id' | 'createdAt'>);
        toast.success('Lead created successfully');
        setIsEditDialogOpen(false);
        navigate(`/employee-dashboard/crm/leads/${created._id}`);
      } else {
        const updated = await crmService.updateLead(lead._id, {
          name: values.name,
          email: values.email || '',
          phone: values.phone || '',
          status: values.status,
          company: values.company || '',
          title: values.title || '',
          address: values.address || '',
        });
        if (updated) {
          setLead(updated);
          toast.success('Lead updated successfully');
          setIsEditDialogOpen(false);
        } else {
          throw new Error('Failed to update');
        }
      }
    } catch (error: unknown) {
      const msg = error instanceof Error ? error.message : 'Failed to update lead';
      console.error('Error updating lead:', error);
      toast.error(msg);
    }
  };

  const handleConvert = async () => {
    if (!lead) return;
    try {
      const result = await crmService.convertLead(lead._id, {
        dealName: convertDetails.dealName || `${lead.company} Opportunity`,
        dealValue: Number(convertDetails.dealValue) || 0
      });
      
      toast.success(result.message || 'Lead converted successfully');
      setIsConvertDialogOpen(false);
      navigate('/employee-dashboard/crm/accounts');
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Failed to convert lead';
      console.error('Error converting lead:', error);
      toast.error(message);
    }
  };

  const handleDelete = async () => {
    if (!lead || !window.confirm('Are you sure you want to delete this lead?')) return;
    
    try {
      await crmService.deleteLead(lead._id);
      
      toast.success('Lead deleted successfully');
      navigate('/employee-dashboard/crm/leads');
    } catch (error) {
      console.error('Error deleting lead:', error);
      toast.error('Failed to delete lead');
    }
  };

  const handleEmail = async () => {
    if (!lead) return;
    try {
      const subject = 'Follow up';
      const message = `Hello ${lead.name},\n\nFollowing up regarding ${lead.company || 'our discussion'}.\n\nThanks,\nCurrent User`;
      await crmService.sendLeadEmail(lead._id, { subject, message });
      toast.success('Email sent from company address');
      fetchActivities();
    } catch (e) {
      toast.error('Failed to send email');
    }
  };

  const formatWhatsappNumber = (phone?: string) => {
    if (!phone) return '';
    const digits = (phone.match(/\d+/g) || []).join('');
    if (digits.startsWith('0')) return digits.substring(1);
    if (digits.length === 10) return `91${digits}`;
    return digits;
  };

  const handleWhatsapp = async () => {
    if (!lead) return;
    const num = formatWhatsappNumber(lead.phone);
    const text = encodeURIComponent(`Hello ${lead.name}`);
    if (num) {
      const url = `https://wa.me/${num}?text=${text}`;
      window.open(url, '_blank');
    }
    try {
      const created = await crmService.createActivity({
        type: 'call',
        title: 'WhatsApp',
        description: `WhatsApp opened for ${lead.phone || ''}`,
        date: new Date().toISOString(),
        time: new Date().toLocaleTimeString(),
        status: 'completed',
        relatedTo: { type: 'lead', id: lead._id, name: lead.name }
      });
      setActivities([created, ...activities]);
    } catch {}
  };

  const handleMeeting = async () => {
    if (!lead) return;
    const message = `Hello ${lead.name}, we’d like to schedule a meeting regarding ${lead.company || 'our discussion'}. Please confirm.`;
    const num = formatWhatsappNumber(lead.phone);
    const waText = encodeURIComponent(message);
    if (num) {
      const url = `https://wa.me/${num}?text=${waText}`;
      window.open(url, '_blank');
    }
    if (lead.email) {
      const mailto = `mailto:${lead.email}?subject=${encodeURIComponent('Meeting')}&body=${encodeURIComponent(message)}`;
      window.location.href = mailto;
    }
    try {
      const created = await crmService.createActivity({
        type: 'meeting',
        title: 'Meeting',
        description: `Meeting initiated with ${lead.name}. Notifications sent.`,
        date: new Date().toISOString(),
        time: new Date().toLocaleTimeString(),
        status: 'scheduled',
        relatedTo: { type: 'lead', id: lead._id, name: lead.name }
      });
      setActivities([created, ...activities]);
      toast.success('Meeting initiated and notifications sent');
    } catch {
      toast.error('Failed to add meeting');
    }
  };

  const handleAddNote = async () => {
    if (!newNote.trim() || !lead) return;
    setIsNoteSubmitting(true);
    
    try {
      const created = await crmService.createActivity({
        type: 'note',
        title: 'Note Added',
        description: newNote,
        date: new Date().toISOString(),
        time: new Date().toLocaleTimeString(),
        status: 'completed',
        relatedTo: {
          type: 'lead',
          id: lead._id,
          name: lead.name
        }
      });

      setActivities([created, ...activities]);
      setNewNote('');
      toast.success('Note added successfully');
    } catch (error) {
      console.error('Error adding note:', error);
      toast.error('Failed to add note');
    } finally {
      setIsNoteSubmitting(false);
    }
  };

  const handleAddTask = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTask.title.trim() || !lead) return;
    setIsTaskSubmitting(true);

    try {
      const createdTask = await crmService.createActivity({
        type: 'task',
        title: newTask.title,
        description: '',
        date: newTask.dueDate,
        time: '09:00 AM', // Default time
        status: 'upcoming',
        relatedTo: {
          type: 'lead',
          id: lead._id,
          name: lead.name
        }
      });
      
      setTasks([createdTask, ...tasks]);
      setIsTaskDialogOpen(false);
      setNewTask({
        title: '',
        dueDate: new Date().toISOString().split('T')[0]
      });
      toast.success('Task created successfully');
    } catch (error) {
      console.error('Error creating task:', error);
      toast.error('Failed to create task');
    } finally {
      setIsTaskSubmitting(false);
    }
  };

  const handleToggleTask = async (taskId: string, currentStatus: string) => {
    const newStatus = currentStatus === 'completed' ? 'upcoming' : 'completed';
    try {
      // Optimistic update
      setTasks(tasks.map(t => t._id === taskId ? { ...t, status: newStatus } : t));
      
      await crmService.updateActivity(taskId, { status: newStatus });
      toast.success(newStatus === 'completed' ? 'Task completed' : 'Task reopened');
    } catch (error) {
      console.error('Error updating task:', error);
      toast.error('Failed to update task status');
      // Revert optimistic update
      fetchActivities();
    }
  };

  if (loading) {
    return <div className="p-8 text-center text-slate-500">Loading lead details...</div>;
  }

  if (!lead) return null;

  return (
    <div className="p-6 md:p-8 max-w-[1600px] mx-auto space-y-6">
      {/* Header / Navigation */}
      <div className="flex items-center gap-4 mb-2">
        <Button variant="ghost" size="icon" onClick={() => navigate('/employee-dashboard/crm/leads')}>
          <ArrowLeft className="w-4 h-4" />
        </Button>
        <div className="flex-1">
           <div className="flex items-center gap-3">
             <h1 className="text-2xl font-bold text-[#1A3C34]">{lead.name}</h1>
             <Badge variant={lead.status === 'lost' ? 'destructive' : 'secondary'} className="capitalize">
               {lead.status}
             </Badge>
           </div>
           <p className="text-slate-500 text-sm flex items-center gap-2 mt-1">
             <Building2 className="w-3 h-3" /> {lead.company} • {lead.title}
           </p>
        </div>
        <div className="flex items-center gap-2">
           <Button variant="outline" className="border-red-200 text-red-600 hover:bg-red-50 hover:text-red-700" onClick={handleDelete}>
             <Trash2 className="w-4 h-4 mr-2" /> Delete
           </Button>
           <Button className="bg-[#1A3C34] hover:bg-[#122a25] text-white" onClick={() => {
             setConvertDetails({
               dealName: `${lead.company} Opportunity`,
               dealValue: 0
             });
             setIsConvertDialogOpen(true);
           }}>
             <RefreshCw className="w-4 h-4 mr-2" /> Convert Lead
           </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column - Main Info */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* Quick Actions Card */}
          <Card>
            <CardContent className="p-4 flex flex-wrap gap-4">
               <Button variant="outline" className="flex-1" onClick={handleEmail}>
                 <Mail className="w-4 h-4 mr-2" /> Email
               </Button>
               <Button variant="outline" className="flex-1" onClick={handleWhatsapp}>
                 <MessageCircle className="w-4 h-4 mr-2" /> WhatsApp
               </Button>
               <Button variant="outline" className="flex-1" onClick={handleMeeting}>
                 <Calendar className="w-4 h-4 mr-2" /> Meeting
               </Button>
               <Button variant="outline" className="flex-1" onClick={() => setIsTaskDialogOpen(true)}>
                 <CheckCircle2 className="w-4 h-4 mr-2" /> Task
               </Button>
            </CardContent>
          </Card>

          {/* Activity Tabs */}
          <Card>
             <CardHeader className="pb-0">
               <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                 <TabsList className="grid w-full grid-cols-3">
                   <TabsTrigger value="timeline">Timeline</TabsTrigger>
                   <TabsTrigger value="notes">Notes</TabsTrigger>
                   <TabsTrigger value="tasks">Tasks</TabsTrigger>
                 </TabsList>
               </Tabs>
             </CardHeader>
             <CardContent className="pt-6">
                {activeTab === 'timeline' && (
                  <div className="space-y-6 relative border-l-2 border-slate-100 ml-3 pl-6">
                    {loadingActivities ? (
                      <div className="text-sm text-slate-500 py-4 pl-2">Loading notes and timeline details...</div>
                    ) : activities.length === 0 ? (
                      <p className="text-slate-500 text-sm">No activities yet.</p>
                    ) : (
                      activities.map((activity) => (
                        <div key={activity._id} className="relative">
                          <div className={`absolute -left-[31px] top-1 w-8 h-8 rounded-full flex items-center justify-center border-2 border-white shadow-sm ${
                            activity.type === 'email' ? 'bg-blue-100 text-blue-600' :
                            activity.type === 'call' ? 'bg-green-100 text-green-600' :
                            activity.type === 'note' ? 'bg-amber-100 text-amber-600' :
                            'bg-slate-100 text-slate-600'
                          }`}>
                             {activity.type === 'email' ? <Mail className="w-4 h-4" /> :
                              activity.type === 'call' ? <Phone className="w-4 h-4" /> :
                              activity.type === 'note' ? <StickyNote className="w-4 h-4" /> :
                              <History className="w-4 h-4" />}
                          </div>
                          <div className="flex flex-col">
                            <span className="text-sm font-medium text-slate-900">{activity.description || activity.title}</span>
                            <span className="text-xs text-slate-500">{new Date(activity.date).toLocaleDateString()}</span>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                )}

                {activeTab === 'notes' && (
                  <div className="space-y-4">
                     <div className="space-y-2">
                        <Textarea 
                          placeholder="Type a note..." 
                          value={newNote}
                          onChange={(e) => setNewNote(e.target.value)}
                          className="min-h-[100px]"
                        />
                        <div className="flex justify-end">
                           <Button size="sm" onClick={handleAddNote} disabled={isNoteSubmitting}>
                             {isNoteSubmitting ? 'Saving...' : 'Save Note'}
                           </Button>
                        </div>
                     </div>
                     <Separator />
                     <div className="space-y-4">
                        {activities.filter(a => a.type === 'note').length === 0 ? (
                           <p className="text-slate-500 text-sm">No notes yet.</p>
                        ) : (
                          activities.filter(a => a.type === 'note').map(note => (
                            <div key={note._id} className="bg-slate-50 p-4 rounded-lg">
                               <p className="text-sm text-slate-700">{note.description}</p>
                               <p className="text-xs text-slate-400 mt-2">{new Date(note.date).toLocaleDateString()}</p>
                            </div>
                          ))
                        )}
                     </div>
                  </div>
                )}

                {activeTab === 'tasks' && (
                  <div className="space-y-4">
                     <div className="flex justify-between items-center mb-4">
                       <h3 className="font-medium">Upcoming Tasks</h3>
                       <Button size="sm" variant="ghost" className="text-[#1A3C34]" onClick={() => setIsTaskDialogOpen(true)}>
                         <CheckCircle2 className="w-4 h-4 mr-2" /> Add Task
                       </Button>
                     </div>
                     <div className="space-y-2">
                        {tasks.length === 0 ? (
                           <p className="text-slate-500 text-sm">No tasks pending.</p>
                        ) : (
                          tasks.map(task => (
                            <div key={task._id} className="flex items-center gap-3 p-3 border rounded-lg hover:bg-slate-50 transition-colors group">
                               <div 
                                 className={`w-5 h-5 rounded-full border-2 flex items-center justify-center cursor-pointer ${
                                   task.status === 'completed' ? 'bg-green-500 border-green-500' : 'border-slate-300 group-hover:border-[#1A3C34]'
                                 }`}
                                 onClick={() => handleToggleTask(task._id, task.status)}
                               >
                                  {task.status === 'completed' && <CheckCircle2 className="w-3 h-3 text-white" />}
                               </div>
                               <div className="flex-1">
                                  <p className={`text-sm font-medium ${task.status === 'completed' ? 'text-slate-400 line-through' : 'text-slate-700'}`}>
                                    {task.title}
                                  </p>
                                  <p className="text-xs text-slate-500">Due: {new Date(task.date).toLocaleDateString()}</p>
                               </div>
                            </div>
                          ))
                        )}
                     </div>
                  </div>
                )}
             </CardContent>
          </Card>
        </div>

        {/* Right Column - Details Sidebar */}
        <div className="space-y-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-base">Lead Details</CardTitle>
              <Button variant="ghost" size="sm" onClick={openEditDialog} className="h-8">
                Edit
              </Button>
            </CardHeader>
            <CardContent className="space-y-4">
               <div className="grid grid-cols-[100px_1fr] gap-2 text-sm">
                  <span className="text-slate-500">Email</span>
                  <a href={`mailto:${lead.email}`} className="text-[#1A3C34] hover:underline truncate">{lead.email}</a>
                  
                  <span className="text-slate-500">Phone</span>
                  <a href={`tel:${lead.phone}`} className="text-slate-900 hover:underline">{lead.phone}</a>
                  
                  <span className="text-slate-500">Owner</span>
                  <span className="flex items-center gap-2">
                    <div className="w-5 h-5 rounded-full bg-slate-200 flex items-center justify-center text-[10px]">
                      {lead.owner.charAt(0)}
                    </div>
                    {lead.owner}
                  </span>

                  <span className="text-slate-500">Source</span>
                  <span>{lead.source}</span>

                  <span className="text-slate-500">Score</span>
                  <span className={`font-medium ${lead.score >= 80 ? 'text-green-600' : 'text-amber-600'}`}>{lead.score}/100</span>

                  <span className="text-slate-500">Address</span>
                  <span className="text-slate-700">{lead.address || 'N/A'}</span>
               </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Deals & Opportunities</CardTitle>
            </CardHeader>
            <CardContent>
               {deals.length === 0 ? (
                 <div className="text-center py-6 text-slate-500 text-sm">
                   No active deals yet.
                   <Button variant="link" className="text-[#1A3C34] h-auto p-0 ml-1" onClick={() => navigate(`/employee-dashboard/crm/opportunities?new=true&company=${lead.company}`)}>
                     Create Opportunity
                   </Button>
                 </div>
               ) : (
                 <div className="space-y-3">
                   {deals.map(deal => (
                     <div key={deal._id} className="p-3 border rounded-md hover:bg-slate-50 cursor-pointer" onClick={() => navigate(`/employee-dashboard/crm/opportunities/${deal._id}`)}>
                       <div className="font-medium text-sm text-[#1A3C34]">{deal.title}</div>
                       <div className="flex justify-between items-center mt-1">
                         <span className="text-xs text-slate-500">{new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(deal.value)}</span>
                         <Badge variant="outline" className="text-[10px] h-5">{deal.stage}</Badge>
                       </div>
                     </div>
                   ))}
                 </div>
               )}
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Edit Lead Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={(open) => { setIsEditDialogOpen(open); if (!open) reset(); }}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Lead Details</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit(onUpdateLead)} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="edit-name">Name</Label>
              <Input id="edit-name" {...register('name')} />
              {errors.name && <div className="text-sm text-red-600">{errors.name.message}</div>}
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-email">Email</Label>
              <Input id="edit-email" type="email" {...register('email')} />
              {errors.email && <div className="text-sm text-red-600">{errors.email.message}</div>}
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-phone">Phone</Label>
              <Input id="edit-phone" {...register('phone')} />
              {errors.phone && <div className="text-sm text-red-600">{errors.phone.message}</div>}
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-status">Status</Label>
              <Controller
                name="status"
                control={control}
                render={({ field }) => (
                  <Select value={field.value} onValueChange={field.onChange}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="new">New</SelectItem>
                      <SelectItem value="contacted">Contacted</SelectItem>
                      <SelectItem value="qualified">Qualified</SelectItem>
                      <SelectItem value="unqualified">Unqualified</SelectItem>
                    </SelectContent>
                  </Select>
                )}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-company">Company</Label>
              <Input id="edit-company" {...register('company')} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-title">Title</Label>
              <Input id="edit-title" {...register('title')} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-address">Address</Label>
              <Input id="edit-address" {...register('address')} />
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setIsEditDialogOpen(false)}>Cancel</Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? <span className="flex items-center gap-2"><Loader2 className="h-4 w-4 animate-spin" /> Saving...</span> : 'Save Changes'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Add Task Dialog */}
      <Dialog open={isTaskDialogOpen} onOpenChange={setIsTaskDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add New Task</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleAddTask} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="task-title">Task Title</Label>
              <Input
                id="task-title"
                value={newTask.title}
                onChange={(e) => setNewTask({...newTask, title: e.target.value})}
                placeholder="Follow up call"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="task-date">Due Date</Label>
              <Input
                id="task-date"
                type="date"
                value={newTask.dueDate}
                onChange={(e) => setNewTask({...newTask, dueDate: e.target.value})}
              />
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setIsTaskDialogOpen(false)}>Cancel</Button>
              <Button type="submit" disabled={isTaskSubmitting || !newTask.title.trim()}>
                {isTaskSubmitting ? 'Creating...' : 'Create Task'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
      
      {/* Convert Lead Dialog */}
      <Dialog open={isConvertDialogOpen} onOpenChange={setIsConvertDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Convert Lead</DialogTitle>
            <DialogDescription>
              This will create a new Account, Contact, and Opportunity from this lead.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="deal-name">Opportunity Name</Label>
              <Input
                id="deal-name"
                value={convertDetails.dealName}
                onChange={(e) => setConvertDetails({...convertDetails, dealName: e.target.value})}
                placeholder="e.g. Annual Software License"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="deal-value">Estimated Value ($)</Label>
              <Input
                id="deal-value"
                type="number"
                min="0"
                value={convertDetails.dealValue}
                onChange={(e) => setConvertDetails({...convertDetails, dealValue: Number(e.target.value)})}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsConvertDialogOpen(false)}>Cancel</Button>
            <Button onClick={handleConvert} className="bg-[#1A3C34]">
              Convert
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default LeadDetail;

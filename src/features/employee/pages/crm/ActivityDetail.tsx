import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { 
  ArrowLeft, 
  Calendar, 
  Clock, 
  User, 
  Mail, 
  Phone, 
  MessageSquare,
  CheckCircle2,
  AlertCircle,
  Pencil,
  Trash2
} from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { crmService, Activity as CRMActivity } from '@/features/employee/services/crmService';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
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
import { useForm, Controller } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { Loader2 } from 'lucide-react';

interface Activity extends Omit<CRMActivity, 'relatedTo'> {
  contact: string;
}

const ActivityDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { search } = useLocation();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [activity, setActivity] = useState<Activity | null>(null);
  const isCreate = id === 'new';
  const qs = new URLSearchParams(search);
  const relatedType = qs.get('relatedTo') || undefined;
  const relatedId = qs.get('id') || undefined;

  // Edit State
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [showDeleteAlert, setShowDeleteAlert] = useState(false);
  const activitySchema = z.object({
    title: z.string().min(2, 'Title is required'),
    type: z.enum(['call','email','meeting','note']),
    status: z.enum(['upcoming','scheduled','completed','overdue']),
    priority: z.enum(['low','medium','high']),
    date: z.string().min(1, 'Date is required'),
    time: z.string().min(1, 'Time is required'),
    duration: z.coerce.number().optional(),
    description: z.string().optional(),
  });
  type ActivityForm = z.infer<typeof activitySchema>;
  const { register, handleSubmit, control, formState: { errors, isSubmitting }, reset } = useForm<ActivityForm>({
    resolver: zodResolver(activitySchema),
    defaultValues: {
      title: '',
      type: 'call',
      status: 'upcoming',
      priority: 'medium',
      date: '',
      time: '',
      duration: 30,
      description: ''
    }
  });

  const fetchActivityDetails = useCallback(async () => {
    if (!id) return;
    try {
      setLoading(true);
      if (id === 'new') {
        const today = new Date();
        const defaultDate = today.toISOString().split('T')[0];
        const defaultTime = today.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
        const blank: Activity = {
          _id: 'new',
          type: 'note',
          title: 'New Activity',
          description: '',
          date: defaultDate,
          time: defaultTime,
          duration: 30,
          priority: 'medium',
          status: 'scheduled',
          outcome: '',
          relatedTo: {
            type: (relatedType as any) || 'deal',
            id: relatedId || '',
            name: ''
          },
          createdAt: new Date().toISOString(),
          contact: ''
        } as Activity;
        setActivity(blank);
        reset({
          title: '',
          type: 'note',
          status: 'scheduled',
          priority: 'medium',
          date: defaultDate,
          time: defaultTime,
          duration: 30,
          description: ''
        });
        setIsEditDialogOpen(true);
      } else {
        const data = await crmService.getActivity(id);
        if (data) {
          setActivity({
              ...data,
              contact: data.relatedTo.name,
              status: data.status
          });
          reset({
            title: data.title,
            type: data.type,
            status: data.status,
            priority: data.priority || 'medium',
            date: data.date,
            time: data.time,
            duration: data.duration || 30,
            description: data.description || ''
          });
        } else {
          toast.error('Activity not found');
          navigate('/employee-dashboard/crm/activities');
        }
      }
    } catch (error) {
      console.error('Error fetching activity:', error);
      toast.error('Failed to load activity details');
    } finally {
      setLoading(false);
    }
  }, [id, navigate, reset, relatedType, relatedId]);

  useEffect(() => {
    fetchActivityDetails();
  }, [fetchActivityDetails]);

  const onUpdateActivity = async (values: ActivityForm) => {
    if (!id) return;
    try {
      const updated = await crmService.updateActivity(id, {
        ...values,
        status: values.status
      });
      setActivity({
        ...updated,
        contact: updated.relatedTo.name,
        status: updated.status
      });
      setIsEditDialogOpen(false);
      toast.success('Activity updated successfully');
    } catch (error: unknown) {
      const msg = error instanceof Error ? error.message : 'Failed to update activity';
      console.error('Error updating activity:', error);
      toast.error(msg);
    }
  };
  const onCreateActivity = async (values: ActivityForm) => {
    try {
      const created = await crmService.createActivity({
        type: values.type,
        title: values.title,
        description: values.description || '',
        date: values.date,
        time: values.time,
        duration: values.duration || 0,
        status: values.status,
        relatedTo: {
          type: (relatedType as any) || 'deal',
          id: relatedId || '',
          name: ''
        },
        createdAt: new Date().toISOString()
      } as any);
      toast.success('Activity created successfully');
      navigate(`/employee-dashboard/crm/activities/${created._id}`);
    } catch (error: unknown) {
      const msg = error instanceof Error ? error.message : 'Failed to create activity';
      console.error('Error creating activity:', error);
      toast.error(msg);
    }
  };

  const handleDeleteActivity = async () => {
    if (!id) return;
    
    try {
      setIsDeleting(true);
      await crmService.deleteActivity(id);
      toast.success('Activity deleted successfully');
      navigate('/employee-dashboard/crm/activities');
    } catch (error) {
      console.error('Error deleting activity:', error);
      toast.error('Failed to delete activity');
      setIsDeleting(false);
    }
  };

  const getIcon = (type: string) => {
    switch (type) {
      case 'call': return <Phone className="w-5 h-5" />;
      case 'email': return <Mail className="w-5 h-5" />;
      case 'meeting': return <Calendar className="w-5 h-5" />;
      case 'note': return <MessageSquare className="w-5 h-5" />;
      default: return <AlertCircle className="w-5 h-5" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'bg-emerald-50 text-emerald-700 border-emerald-100';
      case 'scheduled': return 'bg-amber-50 text-amber-700 border-amber-100';
      case 'pending': return 'bg-slate-50 text-slate-700 border-slate-100';
      default: return 'bg-slate-50 text-slate-700 border-slate-100';
    }
  };

  if (loading) {
    return <div className="p-6 text-center text-slate-500">Loading activity details...</div>;
  }

  if (!activity) {
    return <div className="p-6 text-center text-slate-500">Activity not found</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => navigate('/employee-dashboard/crm/activities')}>
            <ArrowLeft className="w-4 h-4" />
          </Button>
          <div>
            <h1 className="text-2xl font-bold text-[#1A3C34]">{activity.title}</h1>
            <div className="flex items-center gap-2 text-sm text-slate-500 mt-1">
              <span className="capitalize flex items-center gap-1">
                {getIcon(activity.type)} {activity.type}
              </span>
              <span>•</span>
              <span>{new Date(activity.date).toLocaleDateString()}</span>
            </div>
          </div>
          <Badge 
            variant="secondary"
            className={`${getStatusColor(activity.status)} capitalize ml-2`}
          >
            {activity.status}
          </Badge>
        </div>
        <div className="flex gap-2">
          {!isCreate && (
            <>
              <Button variant="outline" size="sm" onClick={() => setIsEditDialogOpen(true)}>
                <Pencil className="w-4 h-4 mr-2" />
                Edit
              </Button>
              <Button variant="destructive" size="sm" onClick={() => setShowDeleteAlert(true)}>
                <Trash2 className="w-4 h-4 mr-2" />
                Delete
              </Button>
            </>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Description</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-slate-600 whitespace-pre-wrap">
                {activity.description || 'No description provided.'}
              </p>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-start gap-3">
                <User className="w-4 h-4 text-slate-400 mt-1" />
                <div>
                  <div className="text-sm font-medium text-slate-700">Contact</div>
                  <div className="text-sm text-slate-500">{activity.contact}</div>
                </div>
              </div>
              
              <div className="flex items-start gap-3">
                <Clock className="w-4 h-4 text-slate-400 mt-1" />
                <div>
                  <div className="text-sm font-medium text-slate-700">Time</div>
                  <div className="text-sm text-slate-500">
                    {activity.time}
                    {activity.duration && ` (${activity.duration} min)`}
                  </div>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <CheckCircle2 className="w-4 h-4 text-slate-400 mt-1" />
                <div>
                  <div className="text-sm font-medium text-slate-700">Status</div>
                  <div className="text-sm text-slate-500 capitalize">{activity.status}</div>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <User className="w-4 h-4 text-slate-400 mt-1" />
                <div>
                  <div className="text-sm font-medium text-slate-700">Owner</div>
                  <div className="text-sm text-slate-500">{activity.owner}</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Edit Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={(open) => { setIsEditDialogOpen(open); if (!open) reset(); }}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>{isCreate ? 'Create Activity' : 'Edit Activity'}</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit(isCreate ? onCreateActivity : onUpdateActivity)} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="edit-type">Type</Label>
                <Controller
                  name="type"
                  control={control}
                  render={({ field }) => (
                    <Select value={field.value} onValueChange={field.onChange}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="call">Call</SelectItem>
                        <SelectItem value="email">Email</SelectItem>
                        <SelectItem value="meeting">Meeting</SelectItem>
                        <SelectItem value="note">Note</SelectItem>
                      </SelectContent>
                    </Select>
                  )}
                />
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
                        <SelectItem value="upcoming">Upcoming</SelectItem>
                        <SelectItem value="scheduled">Scheduled</SelectItem>
                        <SelectItem value="completed">Completed</SelectItem>
                        <SelectItem value="overdue">Overdue</SelectItem>
                      </SelectContent>
                    </Select>
                  )}
                />
              </div>
              <div className="col-span-2 space-y-2">
                <Label htmlFor="edit-priority">Priority</Label>
                <Controller
                  name="priority"
                  control={control}
                  render={({ field }) => (
                    <Select value={field.value} onValueChange={field.onChange}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select priority" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="low">Low</SelectItem>
                        <SelectItem value="medium">Medium</SelectItem>
                        <SelectItem value="high">High</SelectItem>
                      </SelectContent>
                    </Select>
                  )}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="edit-title">Title</Label>
              <Input id="edit-title" {...register('title')} />
              {errors.title && <div className="text-sm text-red-600">{errors.title.message}</div>}
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="edit-date">Date</Label>
                <Input id="edit-date" type="date" {...register('date')} />
                {errors.date && <div className="text-sm text-red-600">{errors.date.message}</div>}
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-time">Time</Label>
                <Input id="edit-time" type="time" {...register('time')} />
                {errors.time && <div className="text-sm text-red-600">{errors.time.message}</div>}
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-duration">Duration (min)</Label>
                <Input id="edit-duration" type="number" {...register('duration')} />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="edit-description">Description</Label>
              <Textarea id="edit-description" {...register('description')} />
            </div>

            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setIsEditDialogOpen(false)}>Cancel</Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? <span className="flex items-center gap-2"><Loader2 className="h-4 w-4 animate-spin" /> Saving...</span> : (isCreate ? 'Create Activity' : 'Save Changes')}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Delete Alert */}
      <AlertDialog open={showDeleteAlert} onOpenChange={setShowDeleteAlert}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete this activity.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteActivity} className="bg-red-600 hover:bg-red-700">
              {isDeleting ? 'Deleting...' : 'Delete'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default ActivityDetail;

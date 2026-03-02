import React, { useEffect, useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useForm, Controller } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { Loader2 } from 'lucide-react';
import { crmService, Activity as CRMActivity, Contact } from '@/features/employee/services/crmService';
import { toast } from 'sonner';

const schema = z.object({
  type: z.enum(['call','email','meeting','note']),
  title: z.string().min(2, 'Title is required'),
  description: z.string().optional(),
  contactId: z.string().min(1, 'Contact is required'),
  date: z.string().min(1, 'Date is required'),
  time: z.string().min(1, 'Time is required'),
  duration: z.coerce.number().optional(),
  priority: z.enum(['low','medium','high']),
  status: z.enum(['scheduled','completed','upcoming']),
});
type FormValues = z.infer<typeof schema>;

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onCreated?: (activity: CRMActivity) => void;
}

const CreateActivityDialog: React.FC<Props> = ({ open, onOpenChange, onCreated }) => {
  const [contacts, setContacts] = useState<Contact[]>([]);
  const { register, handleSubmit, control, formState: { errors, isSubmitting }, reset } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      type: 'call',
      title: '',
      description: '',
      contactId: '',
      date: new Date().toISOString().split('T')[0],
      time: '12:00',
      duration: 30,
      priority: 'medium',
      status: 'scheduled'
    }
  });

  useEffect(() => {
    if (!open) reset();
  }, [open, reset]);

  useEffect(() => {
    (async () => {
      try {
        const data = await crmService.getContacts();
        setContacts(data);
      } catch {
        setContacts([]);
      }
    })();
  }, []);

  const onSubmit = async (values: FormValues) => {
    try {
      const contact = contacts.find(c => c._id === values.contactId);
      const created = await crmService.createActivity({
        type: values.type,
        title: values.title,
        description: values.description || '',
        date: values.date,
        time: values.time,
        duration: Number(values.duration) || 30,
        priority: values.priority,
        status: values.status,
        relatedTo: {
          type: 'contact',
          id: values.contactId,
          name: contact?.name || 'Unknown'
        }
      });
      if (onCreated) onCreated(created);
      toast.success('Activity logged successfully');
      onOpenChange(false);
      reset();
    } catch (error: unknown) {
      const msg = error instanceof Error ? error.message : 'Failed to log activity';
      toast.error(msg);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Log New Activity</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="type">Type</Label>
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
              <Label htmlFor="status">Status</Label>
              <Controller
                name="status"
                control={control}
                render={({ field }) => (
                  <Select value={field.value} onValueChange={field.onChange}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="scheduled">Scheduled</SelectItem>
                      <SelectItem value="completed">Completed</SelectItem>
                      <SelectItem value="upcoming">Upcoming</SelectItem>
                    </SelectContent>
                  </Select>
                )}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="priority">Priority</Label>
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
            <Label htmlFor="title">Title</Label>
            <Input id="title" placeholder="e.g. Discovery call with Client" {...register('title')} />
            {errors.title && <div className="text-sm text-red-600">{errors.title.message}</div>}
          </div>

          <div className="space-y-2">
            <Label htmlFor="contact">Contact Name</Label>
            <Controller
              name="contactId"
              control={control}
              render={({ field }) => (
                <Select value={field.value} onValueChange={field.onChange}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select contact" />
                  </SelectTrigger>
                  <SelectContent>
                    {contacts.map(contact => (
                      <SelectItem key={contact._id} value={contact._id}>
                        {contact.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            />
            {errors.contactId && <div className="text-sm text-red-600">{errors.contactId.message}</div>}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="date">Date</Label>
              <Input id="date" type="date" {...register('date')} />
              {errors.date && <div className="text-sm text-red-600">{errors.date.message}</div>}
            </div>
            <div className="space-y-2">
              <Label htmlFor="time">Time</Label>
              <Input id="time" type="time" {...register('time')} />
              {errors.time && <div className="text-sm text-red-600">{errors.time.message}</div>}
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Input id="description" placeholder="Additional details..." {...register('description')} />
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? <span className="flex items-center gap-2"><Loader2 className="h-4 w-4 animate-spin" /> Logging...</span> : 'Log Activity'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default CreateActivityDialog;

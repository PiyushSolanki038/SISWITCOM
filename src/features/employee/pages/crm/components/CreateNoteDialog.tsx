import React, { useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { Loader2 } from 'lucide-react';
import { crmService, Note } from '@/features/employee/services/crmService';
import { toast } from 'sonner';

type Context =
  | { type: 'lead'; id: string }
  | { type: 'deal'; id: string }
  | { type: 'account'; id: string }
  | { type: 'contact'; id: string }
  | null;

const schema = z.object({
  title: z.string().min(2, 'Title is required'),
  content: z.string().min(2, 'Content is required'),
  date: z.string().min(1, 'Date is required'),
  time: z.string().min(1, 'Time is required'),
});

type FormValues = z.infer<typeof schema>;

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  context?: Context;
  onCreated?: (note: Note) => void;
}

const CreateNoteDialog: React.FC<Props> = ({ open, onOpenChange, context = null, onCreated }) => {
  const { register, handleSubmit, formState: { errors, isSubmitting }, reset } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      title: '',
      content: '',
      date: new Date().toISOString().split('T')[0],
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    }
  });

  useEffect(() => {
    if (!open) reset();
  }, [open, reset]);

  const onSubmit = async (values: FormValues) => {
    try {
      const payload: Record<string, unknown> = { ...values };
      if (context) {
        if (context.type === 'lead') payload.leadId = context.id;
        if (context.type === 'deal') payload.opportunityId = context.id;
        if (context.type === 'account') payload.accountId = context.id;
        if (context.type === 'contact') payload.contactId = context.id;
      }
      const created = await crmService.createNote(payload);
      if (onCreated) onCreated(created);
      toast.success('Note created successfully');
      onOpenChange(false);
      reset();
    } catch (error: unknown) {
      const msg = error instanceof Error ? error.message : 'Failed to create note';
      toast.error(msg);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Add New Note</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="title">Title</Label>
            <Input id="title" {...register('title')} />
            {errors.title && <div className="text-sm text-red-600">{errors.title.message}</div>}
          </div>
          <div className="space-y-2">
            <Label htmlFor="content">Content</Label>
            <Textarea id="content" {...register('content')} />
            {errors.content && <div className="text-sm text-red-600">{errors.content.message}</div>}
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
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? <span className="flex items-center gap-2"><Loader2 className="h-4 w-4 animate-spin" /> Saving...</span> : 'Save Note'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default CreateNoteDialog;

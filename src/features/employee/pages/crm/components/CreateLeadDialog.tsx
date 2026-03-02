import React, { useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useForm, Controller } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { Loader2 } from 'lucide-react';
import { crmService, Lead } from '@/features/employee/services/crmService';
import { toast } from 'sonner';

const schema = z.object({
  name: z.string().min(2, 'Name is required'),
  title: z.string().optional(),
  company: z.string().min(1, 'Company is required'),
  email: z.string().email('Valid email required'),
  phone: z.string().optional(),
  source: z.string().min(1, 'Source is required'),
});
type FormValues = z.infer<typeof schema>;

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onCreated?: (lead: Lead) => void;
}

const CreateLeadDialog: React.FC<Props> = ({ open, onOpenChange, onCreated }) => {
  const { register, handleSubmit, formState: { errors, isSubmitting }, reset, control } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { name: '', title: '', company: '', email: '', phone: '', source: 'Website' }
  });

  useEffect(() => {
    if (!open) reset();
  }, [open, reset]);

  const onSubmit = async (values: FormValues) => {
    try {
      const created = await crmService.createLead({
        name: values.name,
        title: values.title || '',
        company: values.company,
        email: values.email,
        phone: values.phone || '',
        source: values.source,
        status: 'new',
        owner: 'Current User',
        score: 10,
        lastContacted: new Date().toISOString(),
        address: ''
      });
      if (onCreated) onCreated(created);
      toast.success('Lead created successfully');
      onOpenChange(false);
      reset();
    } catch (error: unknown) {
      const msg = error instanceof Error ? error.message : 'Failed to create lead';
      toast.error(msg);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Add New Lead</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Full Name</Label>
            <Input id="name" placeholder="e.g. John Doe" {...register('name')} />
            {errors.name && <div className="text-sm text-red-600">{errors.name.message}</div>}
          </div>
          <div className="space-y-2">
            <Label htmlFor="title">Job Title</Label>
            <Input id="title" placeholder="e.g. CTO" {...register('title')} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="company">Company</Label>
            <Input id="company" placeholder="e.g. Acme Corp" {...register('company')} />
            {errors.company && <div className="text-sm text-red-600">{errors.company.message}</div>}
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input id="email" type="email" placeholder="john@example.com" {...register('email')} />
              {errors.email && <div className="text-sm text-red-600">{errors.email.message}</div>}
            </div>
            <div className="space-y-2">
              <Label htmlFor="phone">Phone</Label>
              <Input id="phone" placeholder="(555) 123-4567" {...register('phone')} />
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="source">Source</Label>
            <Controller
              name="source"
              control={control}
              render={({ field }) => (
                <Select value={field.value} onValueChange={field.onChange}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select source" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Website">Website</SelectItem>
                    <SelectItem value="Referral">Referral</SelectItem>
                    <SelectItem value="LinkedIn">LinkedIn</SelectItem>
                    <SelectItem value="Cold Call">Cold Call</SelectItem>
                    <SelectItem value="Conference">Conference</SelectItem>
                  </SelectContent>
                </Select>
              )}
            />
            {errors.source && <div className="text-sm text-red-600">{errors.source.message}</div>}
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting} className="bg-[#1A3C34] text-white">
              {isSubmitting ? <span className="flex items-center gap-2"><Loader2 className="h-4 w-4 animate-spin" /> Creating...</span> : 'Create Lead'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default CreateLeadDialog;

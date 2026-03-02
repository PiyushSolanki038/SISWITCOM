import React, { useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { Loader2 } from 'lucide-react';
import { crmService, Account } from '@/features/employee/services/crmService';
import { toast } from 'sonner';

const schema = z.object({
  name: z.string().min(2, 'Account name is required'),
  industry: z.string().optional(),
  website: z.string().optional(),
  annualRevenue: z.string().optional(),
});
type FormValues = z.infer<typeof schema>;

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onCreated?: (account: Account) => void;
}

const CreateAccountDialog: React.FC<Props> = ({ open, onOpenChange, onCreated }) => {
  const { register, handleSubmit, formState: { errors, isSubmitting }, reset } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { name: '', industry: '', website: '', annualRevenue: '' }
  });

  useEffect(() => {
    if (!open) reset();
  }, [open, reset]);

  const onSubmit = async (values: FormValues) => {
    try {
      const created = await crmService.createAccount({
        name: values.name,
        industry: values.industry || '',
        website: values.website || '',
        status: 'active',
        owner: 'Current User',
        lastContact: new Date().toISOString().split('T')[0],
        annualRevenue: values.annualRevenue || '0'
      });
      if (onCreated) onCreated(created);
      toast.success('Account created successfully');
      onOpenChange(false);
      reset();
    } catch (error: unknown) {
      const msg = error instanceof Error ? error.message : 'Failed to create account';
      toast.error(msg);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Add New Account</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 py-2">
          <div className="space-y-2">
            <Label htmlFor="name">Account Name</Label>
            <Input id="name" placeholder="Acme Corp" {...register('name')} />
            {errors.name && <div className="text-sm text-red-600">{errors.name.message}</div>}
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="industry">Industry</Label>
              <Input id="industry" placeholder="Technology" {...register('industry')} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="annualRevenue">Annual Revenue</Label>
              <Input id="annualRevenue" placeholder="$1M" {...register('annualRevenue')} />
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="website">Website</Label>
            <Input id="website" placeholder="www.example.com" {...register('website')} />
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? <span className="flex items-center gap-2"><Loader2 className="h-4 w-4 animate-spin" /> Creating...</span> : 'Create Account'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default CreateAccountDialog;

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
import { crmService, Contact, Account } from '@/features/employee/services/crmService';
import { toast } from 'sonner';

const schema = z.object({
  name: z.string().min(2, 'Name is required'),
  email: z.string().email('Valid email required'),
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
  companyId: z.string().min(1, 'Company is required'),
  role: z.string().optional(),
});
type FormValues = z.infer<typeof schema>;

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onCreated?: (contact: Contact) => void;
}

const CreateContactDialog: React.FC<Props> = ({ open, onOpenChange, onCreated }) => {
  const [accounts, setAccounts] = useState<Account[]>([]);
  const { register, handleSubmit, control, formState: { errors, isSubmitting }, reset } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { name: '', email: '', phone: '', companyId: '', role: '' }
  });

  useEffect(() => {
    if (!open) reset();
  }, [open, reset]);

  useEffect(() => {
    (async () => {
      try {
        const data = await crmService.getAccounts();
        setAccounts(data);
      } catch {
        setAccounts([]);
      }
    })();
  }, []);

  const onSubmit = async (values: FormValues) => {
    try {
      const acc = accounts.find(a => a._id === values.companyId);
      const created = await crmService.createContact({
        name: values.name,
        email: values.email,
        phone: values.phone || '',
        company: acc?.name || '',
        role: values.role || '',
        status: 'active',
        lastContacted: new Date().toISOString().split('T')[0],
        avatar: values.name.split(' ').map(n => n[0]).join('').toUpperCase().substring(0, 2)
      });
      if (onCreated) onCreated(created);
      toast.success('Contact created successfully');
      onOpenChange(false);
      reset();
    } catch (error: unknown) {
      const msg = error instanceof Error ? error.message : 'Failed to create contact';
      toast.error(msg);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Add New Contact</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 py-2">
          <div className="space-y-2">
            <Label htmlFor="name">Full Name</Label>
            <Input id="name" placeholder="John Doe" {...register('name')} />
            {errors.name && <div className="text-sm text-red-600">{errors.name.message}</div>}
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
              {errors.phone && <div className="text-sm text-red-600">{errors.phone.message}</div>}
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="companyId">Company</Label>
              <Controller
                name="companyId"
                control={control}
                render={({ field }) => (
                  <Select value={field.value} onValueChange={field.onChange}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select company" />
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
              {errors.companyId && <div className="text-sm text-red-600">{errors.companyId.message}</div>}
            </div>
            <div className="space-y-2">
              <Label htmlFor="role">Role</Label>
              <Input id="role" placeholder="Manager" {...register('role')} />
            </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? <span className="flex items-center gap-2"><Loader2 className="h-4 w-4 animate-spin" /> Creating...</span> : 'Create Contact'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default CreateContactDialog;

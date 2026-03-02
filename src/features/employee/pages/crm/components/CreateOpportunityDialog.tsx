import React, { useEffect, useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { Loader2 } from 'lucide-react';
import { crmService, Deal, Account } from '@/features/employee/services/crmService';
import { toast } from 'sonner';

const schema = z.object({
  title: z.string().min(2, 'Title is required'),
  accountId: z.string().min(1, 'Company is required'),
  value: z.coerce.number().min(0, 'Value must be >= 0'),
  closeDate: z.string().optional(),
  stageId: z.string().min(1, 'Stage is required'),
});
type FormValues = z.infer<typeof schema>;

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onCreated?: (deal: Deal) => void;
  defaultCompanyName?: string;
}

const CreateOpportunityDialog: React.FC<Props> = ({ open, onOpenChange, onCreated, defaultCompanyName }) => {
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [stages, setStages] = useState<{ _id: string; name: string }[]>([]);
  const { register, handleSubmit, formState: { errors, isSubmitting }, setValue, reset, watch } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { title: '', accountId: '', value: 0, closeDate: '', stageId: '' }
  });

  useEffect(() => {
    if (!open) reset();
  }, [open, reset]);

  useEffect(() => {
    (async () => {
      try {
        const [accs, sts] = await Promise.all([crmService.getAccounts(), crmService.getStages()]);
        setAccounts(accs);
        setStages(sts);
        if (sts.length > 0) setValue('stageId', sts[0]._id);
        if (defaultCompanyName && accs.length > 0) {
          const acc = accs.find(a => a.name === defaultCompanyName);
          if (acc) setValue('accountId', acc._id);
        }
      } catch {
        setAccounts([]);
        setStages([]);
      }
    })();
  }, [setValue, defaultCompanyName]);

  const onSubmit = async (values: FormValues) => {
    try {
      const acc = accounts.find(a => a._id === values.accountId);
      const stage = stages.find(s => s._id === values.stageId);
      const created = await crmService.createDeal({
        title: values.title,
        company: acc?.name || '',
        accountId: values.accountId,
        value: Number(values.value),
        closingDate: values.closeDate || new Date().toISOString().split('T')[0],
        owner: 'Current User',
        probability: 10,
        pipelineStageId: stage?._id,
        stage: (stage?.name?.toLowerCase() || 'qualification') as Deal['stage'],
      });
      if (onCreated) onCreated(created);
      toast.success('Opportunity created successfully');
      onOpenChange(false);
      reset();
    } catch (error: unknown) {
      const msg = error instanceof Error ? error.message : 'Failed to create opportunity';
      toast.error(msg);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Add New Opportunity</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 py-2">
          <div className="space-y-2">
            <Label htmlFor="title">Deal Title</Label>
            <Input id="title" placeholder="Enterprise License" {...register('title')} />
            {errors.title && <div className="text-sm text-red-600">{errors.title.message}</div>}
          </div>
          <div className="space-y-2">
            <Label htmlFor="accountId">Company</Label>
            <Select value={watch('accountId')} onValueChange={(v) => setValue('accountId', v, { shouldValidate: true })}>
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
            {errors.accountId && <div className="text-sm text-red-600">{errors.accountId.message}</div>}
          </div>
          <div className="space-y-2">
            <Label htmlFor="stageId">Stage</Label>
            <Select value={watch('stageId')} onValueChange={(v) => setValue('stageId', v, { shouldValidate: true })}>
              <SelectTrigger>
                <SelectValue placeholder="Select stage" />
              </SelectTrigger>
              <SelectContent>
                {stages.map(stage => (
                  <SelectItem key={stage._id} value={stage._id}>
                    {stage.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.stageId && <div className="text-sm text-red-600">{errors.stageId.message}</div>}
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="value">Value ($)</Label>
              <Input id="value" type="number" placeholder="25000" {...register('value')} />
              {errors.value && <div className="text-sm text-red-600">{errors.value.message}</div>}
            </div>
            <div className="space-y-2">
              <Label htmlFor="closeDate">Close Date</Label>
              <Input id="closeDate" type="date" {...register('closeDate')} />
            </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? (<span className="flex items-center gap-2"><Loader2 className="h-4 w-4 animate-spin" /> Saving...</span>) : 'Create Opportunity'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default CreateOpportunityDialog;

import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { 
  Building2, 
  ArrowLeft,
  MapPin,
  Globe,
  Trash2,
  Phone
} from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { toast } from 'sonner';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { Loader2 } from 'lucide-react';
import { crmService, Account, Contact, Deal, Activity as CRMActivity } from '@/features/employee/services/crmService';

const AccountDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [account, setAccount] = useState<Account | null>(null);
  
  // Edit State
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const accountSchema = z.object({
    name: z.string().min(2, 'Account name is required'),
    industry: z.string().min(1, 'Industry is required'),
    website: z
      .string()
      .optional()
      .refine((v) => {
        if (!v || !v.trim()) return true;
        try {
          const u = new URL(v);
          return !!u.protocol && !!u.host;
        } catch {
          return false;
        }
      }, { message: 'Enter a valid URL (e.g., https://example.com)' }),
    phone: z
      .string()
      .optional()
      .refine((v) => {
        if (!v) return true;
        const digits = v.replace(/\D/g, '');
        return digits.length >= 10 && digits.length <= 15;
      }, { message: 'Phone must contain 10–15 digits' }),
    address: z.string().optional(),
    annualRevenue: z
      .string()
      .optional()
      .refine((v) => {
        if (!v || !v.trim()) return true;
        return /^\d+(\.\d{1,2})?$/.test(v) && Number(v) >= 0;
      }, { message: 'Enter a valid non-negative number' }),
  });
  type AccountForm = z.infer<typeof accountSchema>;
  const { register, handleSubmit, formState: { errors, isSubmitting }, reset, setValue } = useForm<AccountForm>({
    resolver: zodResolver(accountSchema),
    defaultValues: { name: '', industry: '', website: '', phone: '', address: '', annualRevenue: '' }
  });

  // Related Data States
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [deals, setDeals] = useState<Deal[]>([]);
  const [activities, setActivities] = useState<CRMActivity[]>([]);

  const fetchAccountDetails = useCallback(async () => {
    if (!id) return;
    try {
      setLoading(true);
      
      if (id === 'new') {
        const newAccount: Account = {
            _id: 'new',
            name: '',
            industry: '',
            website: '',
            phone: '',
            address: '',
            status: 'active',
            owner: 'Current User',
            createdAt: new Date().toISOString()
        };
        setAccount(newAccount);
        reset({
          name: '',
          industry: '',
          website: '',
          phone: '',
          address: '',
          annualRevenue: ''
        });
        setIsEditDialogOpen(true);
      } else {
        const data = await crmService.getAccount(id);
        if (data) {
          setAccount(data);
          
          // Fetch related data
          try {
            const [relatedContacts, relatedDeals, relatedActivities] = await Promise.all([
              crmService.getContacts({ company: data.name }),
              crmService.getDeals({ company: data.name }),
              crmService.getActivities({ relatedTo: { type: 'account', id: data._id } })
            ]);

            setContacts(relatedContacts);
            setDeals(relatedDeals);
            setActivities(relatedActivities);
          } catch (error) {
            console.error("Error fetching related data:", error);
            // Don't block the UI if related data fails, just log it
          }
        } else {
          toast.error("Account not found");
          navigate('/employee-dashboard/crm/accounts');
        }
      }
    } catch (error) {
      console.error('Error fetching account:', error);
      toast.error('Failed to load account details');
    } finally {
      setLoading(false);
    }
  }, [id, navigate, reset]);

  useEffect(() => {
    fetchAccountDetails();
  }, [fetchAccountDetails]);

  const handleEdit = () => {
    if (account) {
      reset({
        name: account.name || '',
        industry: account.industry || '',
        website: account.website || '',
        phone: account.phone || '',
        address: account.address || '',
        annualRevenue: account.annualRevenue || ''
      });
      setIsEditDialogOpen(true);
    }
  };

  const onSave = async (values: AccountForm) => {
    try {
      if (id === 'new' || account?._id === 'new') {
        const created = await crmService.createAccount({
          name: values.name,
          industry: values.industry || '',
          website: values.website || '',
          phone: values.phone || '',
          address: values.address || '',
          annualRevenue: values.annualRevenue || '',
          status: 'active',
          owner: 'Current User',
          lastContact: new Date().toISOString().split('T')[0],
        });
        toast.success("Account created successfully");
        setIsEditDialogOpen(false);
        navigate(`/employee-dashboard/crm/accounts/${created._id}`);
      } else if (account) {
        const updated = await crmService.updateAccount(account._id, {
          name: values.name,
          industry: values.industry || '',
          website: values.website || '',
          phone: values.phone || '',
          address: values.address || '',
          annualRevenue: values.annualRevenue || '',
        });
        setAccount(updated);
        toast.success("Account updated successfully");
        setIsEditDialogOpen(false);
      }
    } catch (error: unknown) {
      const msg = error instanceof Error ? error.message : "Failed to save account";
      toast.error(msg);
    }
  };

  const handleDelete = async () => {
    if (!account || !window.confirm("Are you sure you want to delete this account?")) return;
    try {
      await crmService.deleteAccount(account._id);
      toast.success("Account deleted");
      navigate('/employee-dashboard/crm/accounts');
    } catch (error) {
      toast.error("Failed to delete account");
    }
  };

  if (loading) {
    return <div className="p-6">Loading account details...</div>;
  }

  if (!account) {
    return <div className="p-6">Account not found</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={() => navigate('/employee-dashboard/crm/accounts')}>
          <ArrowLeft className="w-4 h-4" />
        </Button>
        <div className="flex-1">
          <h1 className="text-2xl font-bold text-[#1A3C34]">{account.name}</h1>
          <div className="flex items-center gap-4 text-sm text-slate-500">
            <span className="flex items-center gap-1">
              <Globe className="w-3 h-3" /> {account.website || 'N/A'}
            </span>
            <span className="flex items-center gap-1">
              <MapPin className="w-3 h-3" /> {account.address || 'N/A'}
            </span>
          </div>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={handleEdit}>Edit Account</Button>
          <Button variant="destructive" size="icon" onClick={handleDelete}>
            <Trash2 className="w-4 h-4" />
          </Button>
          <Button className="bg-[#1A3C34]" onClick={() => navigate('/employee-dashboard/crm/opportunities/new')}>New Opportunity</Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardContent className="p-6">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="p-4 bg-slate-50 rounded-lg">
                  <div className="text-sm text-slate-500 mb-1">Annual Revenue</div>
                  <div className="font-semibold text-[#1A3C34]">{account.annualRevenue || 'N/A'}</div>
                </div>
                <div className="p-4 bg-slate-50 rounded-lg">
                  <div className="text-sm text-slate-500 mb-1">Company Size</div>
          <div className="font-semibold text-[#1A3C34]">{account.employees || 'N/A'}</div>
        </div>
        <div className="p-4 bg-slate-50 rounded-lg">
                  <div className="text-sm text-slate-500 mb-1">Status</div>
                  <div className="font-semibold text-[#1A3C34] capitalize">{account.status}</div>
                </div>
                <div className="p-4 bg-slate-50 rounded-lg">
                  <div className="text-sm text-slate-500 mb-1">Owner</div>
                  <div className="font-semibold text-[#1A3C34]">{account.owner || 'N/A'}</div>
                </div>
              </div>
            </CardContent>
          </Card>

           <Card>
            <CardHeader>
              <CardTitle>Description</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-slate-600">{account.description || 'No description provided.'}</p>
            </CardContent>
          </Card>

          {/* Related Contacts */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>Contacts ({contacts.length})</CardTitle>
            </CardHeader>
            <CardContent>
              {contacts.length > 0 ? (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Name</TableHead>
                      <TableHead>Role</TableHead>
                      <TableHead>Email</TableHead>
                      <TableHead>Phone</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {contacts.map((contact) => (
                      <TableRow key={contact._id}>
                        <TableCell className="font-medium">{contact.name}</TableCell>
                        <TableCell>{contact.role}</TableCell>
                        <TableCell>{contact.email}</TableCell>
                        <TableCell>{contact.phone}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              ) : (
                <div className="text-sm text-slate-500 text-center py-4">No contacts found</div>
              )}
            </CardContent>
          </Card>

          {/* Related Opportunities */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>Opportunities ({deals.length})</CardTitle>
            </CardHeader>
            <CardContent>
              {deals.length > 0 ? (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Title</TableHead>
                      <TableHead>Value</TableHead>
                      <TableHead>Stage</TableHead>
                      <TableHead>Closing Date</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {deals.map((deal) => (
                      <TableRow key={deal._id}>
                        <TableCell className="font-medium">{deal.title}</TableCell>
                        <TableCell>${deal.value.toLocaleString()}</TableCell>
                        <TableCell>
                          <Badge variant="outline" className="capitalize">
                            {deal.stage}
                          </Badge>
                        </TableCell>
                        <TableCell>{new Date(deal.closingDate).toLocaleDateString()}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              ) : (
                <div className="text-sm text-slate-500 text-center py-4">No opportunities found</div>
              )}
            </CardContent>
          </Card>

          {/* Related Activities */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>Recent Activities ({activities.length})</CardTitle>
            </CardHeader>
            <CardContent>
              {activities.length > 0 ? (
                <div className="space-y-4">
                  {activities.map((activity) => (
                    <div 
                      key={activity._id} 
                      className="flex items-start gap-4 p-3 rounded-lg border hover:bg-slate-50 cursor-pointer transition-colors"
                      onClick={() => navigate(`/employee-dashboard/crm/activities/${activity._id}`)}
                    >
                      <div className="flex-1">
                        <div className="flex items-center justify-between mb-1">
                          <span className="font-medium capitalize">{activity.title}</span>
                          <span className="text-xs text-slate-500">
                            {new Date(activity.date).toLocaleDateString()}
                          </span>
                        </div>
                        <p className="text-sm text-slate-600 mb-2">{activity.description}</p>
                        <div className="flex items-center gap-2">
                          <Badge variant="secondary" className="text-xs capitalize">
                            {activity.type}
                          </Badge>
                          <Badge variant={activity.status === 'completed' ? 'default' : 'outline'} className="text-xs capitalize">
                            {activity.status}
                          </Badge>
                          {activity.priority && (
                            <Badge variant="outline" className="text-xs capitalize">
                              {activity.priority}
                            </Badge>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-sm text-slate-500 text-center py-4">No activities found</div>
              )}
            </CardContent>
          </Card>
        </div>

         <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Contact Info</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
               <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-slate-500">
                  <Phone className="w-4 h-4" />
                </div>
                <div>
                  <p className="text-xs text-slate-500">Phone</p>
                  <p className="text-sm font-medium">{account.phone || 'N/A'}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-slate-500">
                  <Globe className="w-4 h-4" />
                </div>
                <div>
                  <p className="text-xs text-slate-500">Website</p>
                  <p className="text-sm font-medium">{account.website || 'N/A'}</p>
                </div>
              </div>
            </CardContent>
          </Card>
         </div>
      </div>

      <Dialog open={isEditDialogOpen} onOpenChange={(open) => { setIsEditDialogOpen(open); if (!open) reset(); }}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{id === 'new' ? 'Create Account' : 'Edit Account'}</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit(onSave)} className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Account Name</Label>
              <Input {...register('name')} />
              {errors.name && <div className="text-sm text-red-600">{errors.name.message}</div>}
            </div>
            <div className="space-y-2">
              <Label>Industry</Label>
              <Select onValueChange={(val) => setValue('industry', val)} defaultValue={account?.industry || undefined}>
                <SelectTrigger>
                  <SelectValue placeholder={account?.industry || 'Select industry'} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Technology">Technology</SelectItem>
                  <SelectItem value="Finance">Finance</SelectItem>
                  <SelectItem value="Healthcare">Healthcare</SelectItem>
                  <SelectItem value="Manufacturing">Manufacturing</SelectItem>
                  <SelectItem value="Retail">Retail</SelectItem>
                  <SelectItem value="Services">Services</SelectItem>
                  <SelectItem value="Other">Other</SelectItem>
                </SelectContent>
              </Select>
              {errors.industry && <div className="text-sm text-red-600">{errors.industry.message}</div>}
            </div>
            <div className="space-y-2">
              <Label>Website</Label>
              <Input {...register('website')} placeholder="https://example.com" />
              {errors.website && <div className="text-sm text-red-600">{errors.website.message}</div>}
            </div>
             <div className="space-y-2">
              <Label>Phone</Label>
              <Input {...register('phone')} placeholder="+91 9876543210" />
              {errors.phone && <div className="text-sm text-red-600">{errors.phone.message}</div>}
            </div>
             <div className="space-y-2">
              <Label>Address</Label>
              <Input {...register('address')} />
            </div>
             <div className="space-y-2">
              <Label>Annual Revenue</Label>
              <Input type="number" step="0.01" min="0" {...register('annualRevenue')} />
              {errors.annualRevenue && <div className="text-sm text-red-600">{errors.annualRevenue.message}</div>}
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
    </div>
  );
};

export default AccountDetail;

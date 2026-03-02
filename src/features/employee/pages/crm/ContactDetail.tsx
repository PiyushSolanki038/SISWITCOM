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
  Mail, 
  Phone, 
  MapPin, 
  ArrowLeft, 
  Briefcase,
  User,
  Trash2,
  Loader2
} from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { toast } from 'sonner';
import { crmService, Contact, Deal, Activity, Account } from '@/features/employee/services/crmService';

const ContactDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [contact, setContact] = useState<Contact | null>(null);
  
  // Edit State
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [editForm, setEditForm] = useState<Partial<Contact>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isEmailSending, setIsEmailSending] = useState(false);

  // Related Data States
  const [activities, setActivities] = useState<Activity[]>([]);
  const [deals, setDeals] = useState<Deal[]>([]);
  const [accounts, setAccounts] = useState<Account[]>([]);
  const validatePhone = (v?: string) => {
    if (!v) return true;
    const digits = String(v).replace(/\D/g, '');
    return digits.length >= 10 && digits.length <= 15;
  };

  const fetchContactDetails = useCallback(async () => {
    if (!id) return;
    try {
      setLoading(true);
      
      if (id === 'new') {
        // Handle new contact creation view
        const newContact: Contact = {
            _id: 'new',
            name: '',
            email: '',
            phone: '',
            role: '',
            company: '',
            status: 'active',
            lastContacted: new Date().toISOString(),
            createdAt: new Date().toISOString()
        };
        setContact(newContact);
        setEditForm(newContact);
        setIsEditDialogOpen(true);
      } else {
        const data = await crmService.getContact(id);
        if (data) {
          setContact(data);
          
          // Fetch related data
          try {
            const [relatedDeals, relatedActivities] = await Promise.all([
              // In a real app we might filter by contact ID, but for now filtering by company or using what's available
              crmService.getDeals({ company: data.company }), 
              crmService.getActivities({ relatedTo: { type: 'contact', id: data._id } })
            ]);
            setDeals(relatedDeals);
            setActivities(relatedActivities);
          } catch (error) {
            console.error("Error fetching related data:", error);
          }
        } else {
          toast.error("Contact not found");
          navigate('/employee-dashboard/crm/contacts');
        }
      }

    } catch (error) {
      console.error('Error fetching contact:', error);
      toast.error('Failed to load contact details');
    } finally {
      setLoading(false);
    }
  }, [id, navigate]);

  useEffect(() => {
    fetchContactDetails();
    
    // Fetch accounts for the dropdown
    const fetchAccounts = async () => {
      try {
        const data = await crmService.getAccounts();
        setAccounts(data);
      } catch (error) {
        console.error('Error fetching accounts:', error);
      }
    };
    fetchAccounts();
  }, [fetchContactDetails]);

  const handleEdit = () => {
    if (contact) {
      setEditForm(contact);
      setIsEditDialogOpen(true);
    }
  };

  const formatWhatsappNumber = (phone?: string) => {
    if (!phone) return null;
    const digits = phone.replace(/\D/g, '');
    if (!digits) return null;
    if (digits.length === 10) return `91${digits}`;
    return digits;
  };

  const buildProfessionalEmail = (c: Contact) => {
    const subject = `Follow-up and Meeting Request — ${c.company || 'SISWIT'}`;
    const message =
`Dear ${c.name},

I hope you are doing well. I am reaching out to follow up on our discussion regarding ${c.company || 'your requirements'}.

Would you be available for a brief call or meeting this week to explore next steps? Please share a convenient time and preferred channel.

Regards,
SISWIT Team
Email: ${c.email}
`;
    return { subject, message };
  };

  const buildProfessionalWhatsapp = (c: Contact) =>
    `Hello ${c.name}, this is SISWIT. Following up regarding ${c.company || 'our discussion'}. Could we schedule a short call/meeting this week? Please share a convenient time. Thank you.`;

  const handleEmail = async () => {
    if (!contact) return;
    try {
      setIsEmailSending(true);
      const { subject, message } = buildProfessionalEmail(contact);
      if (!contact.email) {
        toast.error('No email on contact');
        setIsEmailSending(false);
        return;
      }
      await crmService.sendContactEmail(contact._id, { subject, message });
      toast.success('Email sent from company address');
      // reload activities
      try {
        const relatedActivities = await crmService.getActivities({ relatedTo: { type: 'contact', id: contact._id } });
        setActivities(relatedActivities);
      } catch {}
    } catch {
      toast.error('Failed to send email');
    } finally {
      setIsEmailSending(false);
    }
  };

  const handleWhatsapp = async () => {
    if (!contact) return;
    const num = formatWhatsappNumber(contact.phone);
    const msg = buildProfessionalWhatsapp(contact);
    if (num) {
      const url = `https://wa.me/${num}?text=${encodeURIComponent(msg)}`;
      window.open(url, '_blank');
    } else {
      toast.error('Invalid phone number for WhatsApp');
    }
    try {
      const created = await crmService.createActivity({
        type: 'call',
        title: 'WhatsApp',
        description: `WhatsApp outreach to ${contact.name}`,
        date: new Date().toISOString(),
        time: new Date().toLocaleTimeString(),
        status: 'completed',
        relatedTo: { type: 'contact', id: contact._id, name: contact.name }
      });
      setActivities([created, ...activities]);
    } catch {}
  };
  const handleSave = async () => {
    if (!editForm.name || !editForm.email) {
      toast.error("Name and Email are required");
      return;
    }

    if (editForm.phone && !validatePhone(editForm.phone)) {
      toast.error('Please enter a valid phone number (at least 10 digits)');
      return;
    }

    setIsSubmitting(true);
    try {
      if (id === 'new' || contact?._id === 'new') {
        const created = await crmService.createContact(editForm as Omit<Contact, '_id' | 'createdAt'>);
        toast.success("Contact created successfully");
        setIsEditDialogOpen(false);
        navigate(`/employee-dashboard/crm/contacts/${created._id}`);
      } else if (contact) {
        const updated = await crmService.updateContact(contact._id, editForm);
        setContact(updated);
        toast.success("Contact updated successfully");
        setIsEditDialogOpen(false);
      }
    } catch (error) {
      console.error("Error saving contact:", error);
      toast.error("Failed to save contact");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!contact || !window.confirm("Are you sure you want to delete this contact?")) return;
    try {
      await crmService.deleteContact(contact._id);
      toast.success("Contact deleted");
      navigate('/employee-dashboard/crm/contacts');
    } catch (error) {
      toast.error("Failed to delete contact");
    }
  };

  if (loading) {
    return <div className="p-8 text-center">Loading contact details...</div>;
  }

  if (!contact) {
    return <div className="p-8 text-center">Contact not found</div>;
  }

  return (
    <div className="p-6 md:p-8 max-w-[1600px] mx-auto space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
        <div className="flex items-start gap-4">
          <Button variant="ghost" size="icon" onClick={() => navigate('/employee-dashboard/crm/contacts')}>
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <div>
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-full bg-[#1A3C34] text-white flex items-center justify-center font-bold text-lg">
                {contact.avatar || contact.name.charAt(0)}
              </div>
              <div>
                <h1 className="text-2xl font-bold text-[#1A3C34]">{contact.name}</h1>
                <div className="flex items-center gap-2 text-sm text-slate-500">
                  <span className="flex items-center gap-1"><Briefcase className="w-3 h-3" /> {contact.role}</span>
                  <span>at</span>
                  <span className="flex items-center gap-1 font-medium text-[#1A3C34]">
                    <Building2 className="w-3 h-3" /> {contact.company}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="outline" size="sm" onClick={handleEmail} disabled={isEmailSending}>
            {isEmailSending ? <span className="flex items-center gap-2"><Loader2 className="w-4 h-4 animate-spin" /> Sending...</span> : <span className="flex items-center gap-2"><Mail className="w-4 h-4" /> Email</span>}
          </Button>
          <Button variant="outline" size="sm" onClick={handleWhatsapp}><User className="w-4 h-4 mr-2" /> WhatsApp</Button>
          <Button onClick={handleEdit}>Edit Contact</Button>
          <Button variant="destructive" size="icon" onClick={handleDelete}>
            <Trash2 className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {/* Main Content */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Left Sidebar: Contact Info */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Contact Info</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-slate-500">
                  <Mail className="w-4 h-4" />
                </div>
                <div>
                  <p className="text-xs text-slate-500">Email</p>
                  <p className="text-sm font-medium">{contact.email}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-slate-500">
                  <Phone className="w-4 h-4" />
                </div>
                <div>
                  <p className="text-xs text-slate-500">Phone</p>
                  <p className="text-sm font-medium">{contact.phone}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-slate-500">
                  <MapPin className="w-4 h-4" />
                </div>
                <div>
                  <p className="text-xs text-slate-500">Address</p>
                  <p className="text-sm font-medium">{contact.address || 'N/A'}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right Content: Activities & Deals */}
        <div className="md:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Activities</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {activities.map(activity => (
                  <div 
                    key={activity._id} 
                    className="flex gap-4 p-3 rounded-lg border border-slate-100 cursor-pointer hover:bg-slate-50 transition-colors"
                    onClick={() => navigate(`/employee-dashboard/crm/activities/${activity._id}`)}
                  >
                    <div className="text-sm">
                      <p className="font-medium">{activity.title}</p>
                      <p className="text-slate-600">{activity.description}</p>
                      <div className="flex items-center gap-2 mt-1">
                        <p className="text-xs text-slate-500">{activity.date} at {activity.time} • {activity.type}</p>
                        {activity.priority && (
                          <Badge variant="outline" className="text-[10px] h-5 capitalize">
                            {activity.priority}
                          </Badge>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
                {activities.length === 0 && <p className="text-sm text-slate-500">No recent activities.</p>}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Related Deals</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {deals.map(deal => (
                  <div key={deal._id} className="flex justify-between items-center p-3 rounded-lg border border-slate-100 cursor-pointer hover:bg-slate-50" onClick={() => navigate(`/employee-dashboard/crm/opportunities/${deal._id}`)}>
                    <div>
                      <p className="font-medium">{deal.title}</p>
                      <p className="text-xs text-slate-500">{deal.stage} • Closing: {deal.closingDate}</p>
                    </div>
                    <div className="text-right">
                       <p className="font-medium">{new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(deal.value)}</p>
                    </div>
                  </div>
                ))}
                {deals.length === 0 && <p className="text-sm text-slate-500">No related deals found.</p>}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{id === 'new' ? 'Create Contact' : 'Edit Contact'}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Name</Label>
              <Input 
                value={editForm.name || ''} 
                onChange={(e) => setEditForm({...editForm, name: e.target.value})}
              />
            </div>
            <div className="space-y-2">
              <Label>Email</Label>
              <Input 
                value={editForm.email || ''} 
                onChange={(e) => setEditForm({...editForm, email: e.target.value})}
              />
            </div>
            <div className="space-y-2">
              <Label>Phone</Label>
              <Input 
                value={editForm.phone || ''} 
                onChange={(e) => setEditForm({...editForm, phone: e.target.value})}
              />
            </div>
            <div className="space-y-2">
              <Label>Company</Label>
              <Select 
                value={editForm.company || ''} 
                onValueChange={(value) => setEditForm({...editForm, company: value})}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select company" />
                </SelectTrigger>
                <SelectContent>
                  {accounts.map(account => (
                    <SelectItem key={account._id} value={account.name}>
                      {account.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Role</Label>
              <Input 
                value={editForm.role || ''} 
                onChange={(e) => setEditForm({...editForm, role: e.target.value})}
              />
            </div>
            <div className="space-y-2">
              <Label>Address</Label>
              <Input 
                value={editForm.address || ''} 
                onChange={(e) => setEditForm({...editForm, address: e.target.value})}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>Cancel</Button>
            <Button onClick={handleSave} disabled={isSubmitting}>
              {isSubmitting ? 'Saving...' : 'Save Changes'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ContactDetail;

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, 
  Save, 
  Upload, 
  FileText, 
  FileCheck 
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { SafeSelectContent } from '@/components/ui/overlay-helpers';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuItem,
} from '@/components/ui/dropdown-menu';
import { SafeDropdownMenuContent } from '@/components/ui/overlay-helpers';
import { MoreHorizontal, FileSignature, ChevronDown } from 'lucide-react';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from '@/components/ui/command';
import { Calendar } from '@/components/ui/calendar';
import { Contract } from './types';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { clmService } from '@/features/employee/services/clmService';
import { toast } from 'sonner';
import { cpqService } from '@/features/employee/services/cpqService';
import type { Quote } from '@/features/employee/pages/cpq/types';
import { crmService, type Account } from '@/features/employee/services/crmService';
import { useAuth } from '@/context/AuthContext';
import type { ContractTemplate } from '@/features/employee/pages/clm/types';

const CreateContract: React.FC = () => {
  const navigate = useNavigate();
  
  const [creationMode, setCreationMode] = useState<'quote' | 'template' | 'upload'>('template');

  const schema = z.object({
    title: z.string().min(2, 'Title required'),
    accountId: z.string().min(1, 'Account required'),
    opportunityId: z.string().optional(),
    type: z.string().default('MSA'),
    startDate: z.string().optional(),
    endDate: z.string().optional(),
    renewalType: z.string().default('manual'),
    value: z.coerce.number().optional(),
    currency: z.string().default('USD'),
    content: z.string().optional(),
    signers: z.array(z.object({
      name: z.string().min(1),
      email: z.string().email(),
      sign_order: z.number().optional()
    })).optional()
  });
  const form = useForm<z.infer<typeof schema>>({
    resolver: zodResolver(schema),
    defaultValues: {
      title: '',
      accountId: '',
      opportunityId: '',
      type: 'MSA',
      startDate: '',
      endDate: '',
      renewalType: 'manual',
      value: 0,
      currency: 'USD',
      content: ''
    }
  });

  const [noticePeriod, setNoticePeriod] = useState('30');

  const [billingTerms, setBillingTerms] = useState('Net 30');
  const [paymentTerms, setPaymentTerms] = useState('Monthly');

  const isFromQuote = creationMode === 'quote';
  const [acceptedQuotes, setAcceptedQuotes] = useState<Quote[]>([]);
  const [selectedQuoteId, setSelectedQuoteId] = useState<string>('none');
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [selectedAccountId, setSelectedAccountId] = useState<string>('all');
  const [quoteSearch, setQuoteSearch] = useState<string>('');
  const [onlyMyQuotes, setOnlyMyQuotes] = useState<boolean>(false);
  const [fromDate, setFromDate] = useState<string>('');
  const [toDate, setToDate] = useState<string>('');
  const [searchDebounce, setSearchDebounce] = useState<number | null>(null);
  const { user } = useAuth();
  const [templates, setTemplates] = useState<ContractTemplate[]>([]);
  const [selectedTemplateId, setSelectedTemplateId] = useState<string>('auto');
  const contractType = form.watch('type');
  const [termMonths, setTermMonths] = useState<string>('12');
  const [accountPickerOpen, setAccountPickerOpen] = useState(false);
  const [quotePickerOpen, setQuotePickerOpen] = useState(false);
  const [fromDatePickerOpen, setFromDatePickerOpen] = useState(false);
  const [toDatePickerOpen, setToDatePickerOpen] = useState(false);
  const [autoSigners, setAutoSigners] = useState<Array<{ name: string; email: string; sign_order?: number }>>([]);
  const [quoteStatusFilter, setQuoteStatusFilter] = useState<'all' | 'accepted' | 'approved' | 'sent' | 'draft'>('all');
  const [quotesLoading, setQuotesLoading] = useState(false);
  const getQuoteStatusBadge = (s?: string) => {
    const t = (s || '').toLowerCase();
    const base = "text-[10px] h-5";
    if (t === 'accepted') return <Badge variant="secondary" className={`${base} bg-emerald-100 text-emerald-700`}>Accepted</Badge>;
    if (t === 'approved') return <Badge variant="secondary" className={`${base} bg-blue-100 text-blue-700`}>Approved</Badge>;
    if (t === 'pending') return <Badge variant="secondary" className={`${base} bg-yellow-100 text-yellow-700`}>Pending</Badge>;
    if (t === 'rejected') return <Badge variant="secondary" className={`${base} bg-red-100 text-red-700`}>Rejected</Badge>;
    if (t === 'draft') return <Badge variant="secondary" className={`${base} bg-slate-100 text-slate-700`}>Draft</Badge>;
    return <Badge variant="secondary" className={`${base} bg-slate-100 text-slate-700`}>{(s || 'Status')}</Badge>;
  };
  const isQuoteCreatedByMe = (q: Quote) => {
    const uid = (user?.id || '').toString().toLowerCase();
    const uemail = (user?.email || '').toString().toLowerCase();
    const uname = (user?.name || '').toString().toLowerCase();
    const createdBy = q.created_by;
    const candidates: string[] = [];
    if (typeof createdBy === 'string') {
      candidates.push(createdBy.toLowerCase());
    } else if (createdBy && typeof createdBy === 'object') {
      const anyObj = createdBy as any;
      ['id', '_id', 'email', 'name', 'username'].forEach(k => {
        const v = (anyObj?.[k] || '').toString().toLowerCase();
        if (v) candidates.push(v);
      });
    }
    return candidates.some(c => c === uid || c === uemail || c === uname);
  };
  const inferCurrencyFromText = (txt?: string): string => {
    const s = (txt || '').toLowerCase();
    if (!s) return 'USD';
    if (s.includes('india') || s.includes('in') || s.includes('delhi') || s.includes('mumbai') || s.includes('bangalore')) return 'INR';
    if (s.includes('united states') || s.includes('usa') || s.includes('us') || s.includes('california') || s.includes('new york')) return 'USD';
    if (s.includes('united kingdom') || s.includes('uk') || s.includes('england') || s.includes('london')) return 'GBP';
    if (s.includes('germany') || s.includes('france') || s.includes('italy') || s.includes('spain') || s.includes('europe') || s.includes('eu')) return 'EUR';
    if (s.includes('united arab emirates') || s.includes('uae') || s.includes('dubai') || s.includes('abu dhabi')) return 'AED';
    if (s.includes('saudi') || s.includes('riyadh')) return 'SAR';
    if (s.includes('australia') || s.includes('sydney') || s.includes('melbourne')) return 'AUD';
    if (s.includes('canada') || s.includes('toronto') || s.includes('vancouver')) return 'CAD';
    if (s.includes('japan') || s.includes('tokyo')) return 'JPY';
    if (s.includes('china') || s.includes('beijing') || s.includes('shanghai')) return 'CNY';
    if (s.includes('south africa') || s.includes('johannesburg')) return 'ZAR';
    if (s.includes('brazil') || s.includes('são paulo') || s.includes('rio')) return 'BRL';
    if (s.includes('mexico') || s.includes('mexico city')) return 'MXN';
    if (s.includes('singapore')) return 'SGD';
    if (s.includes('hong kong')) return 'HKD';
    return 'USD';
  };
  const inferCurrencyFromAccount = (acc?: Account | undefined): string => {
    if (!acc) return 'USD';
    const fields = [acc.location, acc.address, acc.name, acc.website];
    for (const f of fields) {
      const c = inferCurrencyFromText(typeof f === 'string' ? f : undefined);
      if (c && c !== 'USD') return c;
    }
    return 'USD';
  };
  const toYMD = (d: Date) => {
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${y}-${m}-${day}`;
  };
  const buildContentWithContext = (templateHtml: string, acc?: Account) => {
    const start = form.getValues().startDate || toYMD(new Date());
    const end = form.getValues().endDate || toYMD(new Date(new Date().setFullYear(new Date().getFullYear() + 1)));
    const ownerStr = user?.name || user?.email || 'Owner';
    const customerStr = acc?.name || 'Customer';
    const header = `<div style="margin-bottom:16px">
<p><strong>Customer:</strong> ${customerStr}</p>
<p><strong>Effective:</strong> ${start}</p>
<p><strong>Expires:</strong> ${end}</p>
<p><strong>Owner:</strong> ${ownerStr}</p>
</div>`;
    return `${header}${templateHtml || ''}`;
  };

  useEffect(() => {
    const loadQuotes = async () => {
      try {
        const quotes = await cpqService.getQuotes();
        setAcceptedQuotes(quotes);
      } catch (e) {
        setAcceptedQuotes([]);
      }
    };
    loadQuotes();
  }, []);

  useEffect(() => {
    const run = async () => {
      try {
        if (selectedAccountId && selectedAccountId !== 'all') {
          setQuotesLoading(true);
          const acc = accounts.find(a => a._id === selectedAccountId);
          const statusMap: Record<string, string> = { accepted: 'ACCEPTED', approved: 'APPROVED', sent: 'SENT', draft: 'DRAFT', all: '' };
          const statusParam = statusMap[quoteStatusFilter] || '';
          let quotes = await cpqService.getQuotesForAccount(selectedAccountId, statusParam ? (statusParam as any) : undefined);
          if (!quotes.length && acc?.name) {
            quotes = await cpqService.getQuotesByAccountName(acc.name, statusParam ? (statusParam as any) : undefined);
          }
          setAcceptedQuotes(quotes);
          setQuotesLoading(false);
        }
      } catch {}
    };
    run();
  }, [selectedAccountId, quoteStatusFilter, accounts]);
  useEffect(() => {
    const loadAccounts = async () => {
      try {
        const list = await crmService.getAccounts();
        setAccounts(list);
      } catch (e) {
        setAccounts([]);
      }
    };
    loadAccounts();
  }, [isFromQuote]);

  useEffect(() => {
    if (selectedAccountId && selectedAccountId !== 'all') {
      const acc = accounts.find(a => a._id === selectedAccountId);
      form.setValue('accountId', selectedAccountId);
      const inferredCurrency = inferCurrencyFromAccount(acc);
      if (!isFromQuote) form.setValue('currency', inferredCurrency);
      const now = new Date();
      const nextYear = new Date(now);
      nextYear.setFullYear(now.getFullYear() + 1);
      if (!form.getValues().startDate) form.setValue('startDate', now.toISOString().split('T')[0]);
      if (!form.getValues().endDate) form.setValue('endDate', nextYear.toISOString().split('T')[0]);
      if (!form.getValues().title) form.setValue('title', `${acc?.name || 'Contract'} ${form.watch('type')} ${now.getFullYear()}`);
      if (!form.getValues().content) {
        const base = acc?.name || 'Customer';
        form.setValue('content', `<h2>${form.watch('type')} Agreement</h2><p>This Agreement is between Sirius Infra and ${base}. Terms and conditions apply.</p>`);
      }
      const possibleQuotes = acceptedQuotes
        .filter(q => {
          const accName = (acc?.name || '').toLowerCase();
          const qName = (q.customer_name || '').toLowerCase();
          return q.account_id === selectedAccountId || (!!accName && accName === qName);
        })
        .sort((a, b) => {
          const ad = a.created_at ? new Date(a.created_at).getTime() : 0;
          const bd = b.created_at ? new Date(b.created_at).getTime() : 0;
          return bd - ad;
        });
      if (possibleQuotes.length) {
        const q = possibleQuotes[0];
        setSelectedQuoteId(q.id);
        form.setValue('value', Number(q.grand_total || 0));
        form.setValue('currency', q.currency || 'USD');
        form.setValue('opportunityId', q.opportunity_id || '');
        const autoSearch = q.quote_number || q.customer_name || acc?.name || '';
        setQuoteSearch(autoSearch);
      }
      (async () => {
        try {
          if (acc?.name) {
            const related = await crmService.getContacts({ company: acc.name });
            const picks = related.filter(c => c.email).slice(0, 2).map((c, i) => ({ name: c.name, email: c.email, sign_order: i + 1 }));
            if (picks.length) {
              setAutoSigners(picks);
              form.setValue('signers', picks as any);
            }
          }
        } catch {}
      })();
    }
  }, [selectedAccountId, accounts, acceptedQuotes]);

  useEffect(() => {
    if (creationMode !== 'quote') return;
    const scoped = acceptedQuotes
      .filter(q => {
        if (selectedAccountId === 'all') return true;
        const accName = (accounts.find(a => a._id === selectedAccountId)?.name || '').toLowerCase();
        const qName = (q.customer_name || '').toLowerCase();
        return q.account_id === selectedAccountId || (!!accName && accName === qName);
      })
      .filter(q => (q.created_at ? true : false));
    if (scoped.length) {
      const times = scoped.map(q => new Date(q.created_at!).getTime());
      const min = new Date(Math.min(...times));
      const max = new Date(Math.max(...times));
      if (!fromDate) setFromDate(toYMD(min));
      if (!toDate) setToDate(toYMD(max));
    } else {
      if (!fromDate || !toDate) {
        const now = new Date();
        const past = new Date();
        past.setDate(now.getDate() - 90);
        if (!fromDate) setFromDate(toYMD(past));
        if (!toDate) setToDate(toYMD(now));
      }
    }
  }, [creationMode, selectedAccountId, acceptedQuotes]);
  useEffect(() => {
    if (selectedQuoteId && selectedQuoteId !== 'none') {
      const q = acceptedQuotes.find(x => x.id === selectedQuoteId);
      if (q) {
        form.setValue('value', Number(q.grand_total || 0));
        form.setValue('currency', q.currency || 'USD');
        form.setValue('opportunityId', q.opportunity_id || '');
        if (!form.getValues().title) {
          const base = q.customer_name || 'Contract';
          form.setValue('title', `${base} ${form.watch('type')} ${new Date().getFullYear()}`);
        }
      }
    }
  }, [selectedQuoteId, acceptedQuotes]);

  useEffect(() => {
    const loadTemplates = async () => {
      try {
        const list = await clmService.getTemplates();
        setTemplates(list);
      } catch (e) {
        setTemplates([]);
      }
    };
    loadTemplates();
  }, []);

  useEffect(() => {
    if (creationMode === 'template') {
      const byType = templates.filter(t => (t.contract_type || '').toLowerCase() === (contractType || '').toLowerCase());
      const chosen = selectedTemplateId === 'auto' ? byType[0] : templates.find(t => t.id === selectedTemplateId || t._id === selectedTemplateId);
      if (chosen?.content) {
        const acc = accounts.find(a => a._id === selectedAccountId);
        form.setValue('content', buildContentWithContext(chosen.content, acc));
        if (!form.getValues().title) {
          const acc = accounts.find(a => a._id === selectedAccountId);
          const base = acc?.name || 'Contract';
          form.setValue('title', `${base} ${contractType} ${new Date().getFullYear()}`);
        }
        if (contractType === 'MSA') {
          setBillingTerms('Net 30');
          setPaymentTerms('Monthly');
        } else if (contractType === 'NDA') {
          setBillingTerms('Upon Receipt');
          setPaymentTerms('Monthly');
        }
      }
    }
  }, [creationMode, contractType, selectedTemplateId, templates, selectedAccountId, accounts]);

  useEffect(() => {
    if (searchDebounce) clearTimeout(searchDebounce);
    const t = window.setTimeout(() => {
      if (!quoteSearch) {
        setSelectedQuoteId('none');
        return;
      }
      const uid = (user?.id || '').toString().toLowerCase();
      const uemail = (user?.email || '').toString().toLowerCase();
      const uname = (user?.name || '').toString().toLowerCase();
      const match = acceptedQuotes
        .filter(q => selectedAccountId === 'all' ? true : q.account_id === selectedAccountId)
        .filter(q => {
          if (!onlyMyQuotes) return true;
          const createdBy = (q.created_by || '').toString().toLowerCase();
          return createdBy === uid || createdBy === uemail || createdBy === uname;
        })
        .filter(q => {
          const created = q.created_at ? new Date(q.created_at) : null;
          const fromOk = fromDate ? (created ? created >= new Date(fromDate) : false) : true;
          const toOk = toDate ? (created ? created <= new Date(toDate) : false) : true;
          return fromOk && toOk;
        })
        .filter(q => {
          const s = quoteSearch.toLowerCase();
          return ((q.quote_number || '').toLowerCase().includes(s) || (q.customer_name || '').toLowerCase().includes(s));
        })[0];
      if (match) {
        setSelectedQuoteId(match.id);
        if (match.account_id) {
          setSelectedAccountId(prev => prev === 'all' ? match.account_id! : prev);
          form.setValue('accountId', match.account_id!);
        }
        form.setValue('value', Number(match.grand_total || 0));
        form.setValue('currency', match.currency || 'USD');
        form.setValue('opportunityId', match.opportunity_id || '');
      }
    }, 250);
    setSearchDebounce(t as unknown as number);
    return () => clearTimeout(t);
  }, [quoteSearch, selectedAccountId, onlyMyQuotes, fromDate, toDate, acceptedQuotes]);

  useEffect(() => {
    const start = form.getValues().startDate;
    if (start && termMonths) {
      const s = new Date(start);
      const months = parseInt(termMonths, 10) || 12;
      const e = new Date(s);
      e.setMonth(e.getMonth() + months);
      form.setValue('endDate', e.toISOString().split('T')[0]);
    }
  }, [termMonths, form.watch('startDate')]);

  useEffect(() => {
    const t = form.watch('type');
    if (t === 'NDA') {
      form.setValue('renewalType', 'manual');
      setNoticePeriod('0');
    } else {
      form.setValue('renewalType', 'auto');
      setNoticePeriod('30');
    }
  }, [form.watch('type')]);

  useEffect(() => {
    const accId = form.watch('accountId');
    if (accId && accId !== selectedAccountId) {
      setSelectedAccountId(accId);
    }
  }, [form.watch('accountId'), selectedAccountId]);

  useEffect(() => {
    if (creationMode === 'quote' && selectedAccountId && selectedAccountId !== 'all') {
      setQuotePickerOpen(true);
    }
  }, [selectedAccountId, creationMode]);

  useEffect(() => {
    if (creationMode === 'quote') {
      setQuotePickerOpen(true);
    }
  }, [onlyMyQuotes, fromDate, toDate, creationMode]);

  const handleSaveDraft = async () => {
    try {
      let created: Contract | null = null;
      if (isFromQuote && selectedQuoteId && selectedQuoteId !== 'none') {
        const picked = acceptedQuotes.find(x => x.id === selectedQuoteId) || await cpqService.getQuote(selectedQuoteId);
        if ((picked.status || '').toLowerCase() !== 'accepted') {
          toast.error('Select an accepted quote to create the contract');
          return;
        }
        created = await clmService.createContractFromQuote(selectedQuoteId);
      } else {
        const vals = form.getValues();
        if (!vals.title || !vals.accountId || !vals.startDate || !vals.endDate) {
          toast.error('Fill required fields: Title, Account, Start, End');
          return;
        }
        created = await clmService.createContract({
          accountId: vals.accountId,
          title: vals.title
        });
        await clmService.updateContract(created.id, {
          type: vals.type,
          startDate: vals.startDate,
          endDate: vals.endDate,
          value: vals.value,
          currency: vals.currency,
          content: vals.content
        });
      }
      toast.success('Draft created');
      navigate(`/employee-dashboard/clm/contracts/${created.id}`);
    } catch (e) {
      const msg = (e as any)?.response?.data?.message || (e as any)?.message || 'Failed to create draft';
      console.error(e);
      toast.error(msg);
    }
  };

  const handleMoveToReview = async () => {
    try {
      let created: Contract | null = null;
      if (isFromQuote && selectedQuoteId && selectedQuoteId !== 'none') {
        const picked = acceptedQuotes.find(x => x.id === selectedQuoteId) || await cpqService.getQuote(selectedQuoteId);
        if ((picked.status || '').toLowerCase() !== 'accepted') {
          toast.error('Select an accepted quote to submit for review');
          return;
        }
        created = await clmService.createContractFromQuote(selectedQuoteId);
      } else {
        const vals = form.getValues();
        if (!vals.title || !vals.accountId || !vals.startDate || !vals.endDate) {
          toast.error('Fill required fields: Title, Account, Start, End');
          return;
        }
        created = await clmService.createContract({
          accountId: vals.accountId,
          title: vals.title
        });
        await clmService.updateContract(created.id, {
          type: vals.type,
          startDate: vals.startDate,
          endDate: vals.endDate,
          value: vals.value,
          currency: vals.currency,
          content: vals.content
        });
      }
      await clmService.submitApproval(created.id);
      toast.success('Submitted for approval');
      navigate('/employee-dashboard/clm/contracts');
    } catch (e) {
      const msg = (e as any)?.response?.data?.message || (e as any)?.message || 'Failed to submit for approval';
      console.error(e);
      toast.error(msg);
    }
  };

  const handleSendForSignature = async () => {
    try {
      let created: Contract | null = null;
      if (isFromQuote && selectedQuoteId && selectedQuoteId !== 'none') {
        const picked = acceptedQuotes.find(x => x.id === selectedQuoteId) || await cpqService.getQuote(selectedQuoteId);
        if ((picked.status || '').toLowerCase() !== 'accepted') {
          toast.error('Select an accepted quote to send for signature');
          return;
        }
        created = await clmService.createContractFromQuote(selectedQuoteId);
      } else {
        const vals = form.getValues();
        if (!vals.title || !vals.accountId || !vals.startDate || !vals.endDate) {
          toast.error('Fill required fields: Title, Account, Start, End');
          return;
        }
        created = await clmService.createContract({
          accountId: vals.accountId,
          title: vals.title
        });
        await clmService.updateContract(created.id, {
          type: vals.type,
          startDate: vals.startDate,
          endDate: vals.endDate,
          value: vals.value,
          currency: vals.currency,
          content: vals.content
        });
      }
      const signers = (form.getValues().signers as any) || autoSigners;
      if (signers && Array.isArray(signers) && signers.length) {
        await clmService.sendForSignature(created.id, signers);
        toast.success('Sent for signature');
        navigate(`/employee-dashboard/clm/contracts/${created.id}`);
      } else {
        navigate('/employee-dashboard/sign');
      }
    } catch (e) {
      const msg = (e as any)?.response?.data?.message || (e as any)?.message || 'Failed to prepare for signature';
      console.error(e);
      toast.error(msg);
    }
  };

  return (
    <div className="max-w-7xl mx-auto pb-10">
      <div className="sticky top-0 z-40 bg-background/95 backdrop-blur border-b">
        <div className="px-4 sm:px-6 py-3 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" onClick={() => navigate('/employee-dashboard/clm/contracts')}>
              <ArrowLeft className="h-4 w-4" />
            </Button>
            <div className="flex items-center gap-3">
              <div>
                <div className="flex items-center gap-3">
                  <h1 className="text-xl sm:text-2xl font-semibold text-[#1A3C34]">Create Contract</h1>
                  <Badge variant="secondary" className="h-6 text-xs">Draft</Badge>
                </div>
                <p className="text-slate-500 text-sm">Draft a new legal agreement</p>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" onClick={handleSaveDraft} className="hidden sm:flex">
              <Save className="h-4 w-4 mr-2" />
              Save Draft
            </Button>
            <Button variant="outline" onClick={handleMoveToReview} className="hidden sm:flex">
              Move to Review
            </Button>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="icon" className="hidden sm:inline-flex">
                  <MoreHorizontal className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <SafeDropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => navigate('/employee-dashboard/clm/templates')}>Browse Templates</DropdownMenuItem>
                <DropdownMenuItem onClick={() => navigate('/employee-dashboard/cpq/quotes')}>View Quotes</DropdownMenuItem>
              </SafeDropdownMenuContent>
            </DropdownMenu>
            <Button className="bg-[#1A3C34] text-white" onClick={handleSendForSignature}>
              <FileSignature className="h-4 w-4 mr-2" />
              Send for Signature
            </Button>
          </div>
        </div>
      </div>

      <div className="px-4 sm:px-6 pt-6">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <div className="lg:col-span-8 space-y-6">
            <Card>
              <CardHeader className="pb-3">
                <CardTitle>Contract Source</CardTitle>
                <CardDescription>Select how you want to start</CardDescription>
              </CardHeader>
              <CardContent className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div
                  className={`p-4 h-28 border rounded-lg cursor-pointer flex items-start gap-3 hover:bg-slate-50 ${creationMode === 'quote' ? 'ring-2 ring-[#1A3C34] bg-emerald-50/50' : ''}`}
                  onClick={() => setCreationMode('quote')}
                >
                  <div className="p-2 bg-emerald-100 text-emerald-700 rounded">
                    <FileCheck className="h-5 w-5" />
                  </div>
                  <div className="space-y-1">
                    <div className="font-medium">From Quote</div>
                    <div className="text-xs text-slate-500">Convert an accepted quote</div>
                  </div>
                </div>
                <div
                  className={`p-4 h-28 border rounded-lg cursor-pointer flex items-start gap-3 hover:bg-slate-50 ${creationMode === 'template' ? 'ring-2 ring-[#1A3C34] bg-emerald-50/50' : ''}`}
                  onClick={() => setCreationMode('template')}
                >
                  <div className="p-2 bg-blue-100 text-blue-700 rounded">
                    <FileText className="h-5 w-5" />
                  </div>
                  <div className="space-y-1">
                    <div className="font-medium">From Template</div>
                    <div className="text-xs text-slate-500">Use a standard template</div>
                  </div>
                </div>
                <div
                  className={`p-4 h-28 border rounded-lg cursor-pointer flex items-start gap-3 hover:bg-slate-50 ${creationMode === 'upload' ? 'ring-2 ring-[#1A3C34] bg-emerald-50/50' : ''}`}
                  onClick={() => setCreationMode('upload')}
                >
                  <div className="p-2 bg-slate-100 text-slate-700 rounded">
                    <Upload className="h-5 w-5" />
                  </div>
                  <div className="space-y-1">
                    <div className="font-medium">Upload File</div>
                    <div className="text-xs text-slate-500">Upload PDF or DOCX</div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <CardTitle>Basic Information</CardTitle>
                <CardDescription>Core details for this contract</CardDescription>
              </CardHeader>
              <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Contract Name</Label>
              <Input {...form.register('title')} placeholder="e.g. Global Tech MSA 2024" />
            </div>
            <div className="space-y-2">
              <Label>Account / Customer</Label>
              <Popover open={accountPickerOpen} onOpenChange={setAccountPickerOpen}>
                <PopoverTrigger asChild>
                  <Button variant="outline" className="w-full justify-between h-10">
                    {accounts.find(a => a._id === form.watch('accountId'))?.name || 'Select account'}
                    <ChevronDown className="h-4 w-4 opacity-50" />
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="p-0 w-[420px] z-[10000]">
                  <Command>
                    <CommandInput placeholder="Search accounts..." />
                    <CommandList>
                      <CommandEmpty>No accounts found.</CommandEmpty>
                      <CommandGroup>
                        {accounts.map(a => (
                          <CommandItem
                            key={a._id}
                            onSelect={() => {
                              form.setValue('accountId', a._id);
                              setSelectedAccountId(a._id);
                              setQuotePickerOpen(true);
                              setAccountPickerOpen(false);
                            }}
                          >
                            <div className="flex items-center gap-2">
                              <div className="font-medium">{a.name}</div>
                              <div className="text-xs text-slate-500">{a.website || a.location || ''}</div>
                            </div>
                          </CommandItem>
                        ))}
                      </CommandGroup>
                    </CommandList>
                  </Command>
                </PopoverContent>
              </Popover>
            </div>
            
            {creationMode === 'quote' && (
              <div className="space-y-2">
                <Label>Related Quote</Label>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
                  <div className="space-y-2">
                    <Label>Status</Label>
                    <Select value={quoteStatusFilter} onValueChange={(v) => setQuoteStatusFilter(v as any)}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SafeSelectContent>
                        <SelectItem value="all">All</SelectItem>
                        <SelectItem value="accepted">Accepted</SelectItem>
                        <SelectItem value="approved">Approved</SelectItem>
                        <SelectItem value="sent">Sent</SelectItem>
                        <SelectItem value="draft">Draft</SelectItem>
                      </SafeSelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>Refresh</Label>
                    <Button variant="outline" onClick={() => setQuotePickerOpen(true)} disabled={quotesLoading}>
                      {quotesLoading ? 'Loading…' : 'Open Quote Picker'}
                    </Button>
                  </div>
                </div>
                <Select value={selectedQuoteId} onValueChange={(v) => {
                  setSelectedQuoteId(v);
                  const q = acceptedQuotes.find(x => x.id === v);
                  if (q?.account_id) form.setValue('accountId', q.account_id);
                }}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select accepted quote" />
                  </SelectTrigger>
                  <SafeSelectContent>
                    <SelectItem value="none">None</SelectItem>
                    {acceptedQuotes
                      .filter(q => {
                        if (selectedAccountId === 'all') return true;
                        const accName = (accounts.find(a => a._id === selectedAccountId)?.name || '').toLowerCase();
                        const qName = (q.customer_name || '').toLowerCase();
                        return q.account_id === selectedAccountId || (!!accName && accName === qName);
                      })
                      .filter(q => {
                        if (!onlyMyQuotes) return true;
                        const createdBy = (q.created_by || '').toString().toLowerCase();
                        const uid = (user?.id || '').toString().toLowerCase();
                        const uemail = (user?.email || '').toString().toLowerCase();
                        const uname = (user?.name || '').toString().toLowerCase();
                        return createdBy === uid || createdBy === uemail || createdBy === uname;
                      })
                      .map((q) => (
                      <SelectItem key={q.id} value={q.id}>
                        {q.quote_number} • {q.customer_name || q.account_id}
                      </SelectItem>
                    ))}
                  </SafeSelectContent>
                </Select>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                  <div className="space-y-2">
                    <Label>Filter by account</Label>
                    <Select value={selectedAccountId} onValueChange={setSelectedAccountId}>
                      <SelectTrigger>
                        <SelectValue placeholder="All accounts" />
                      </SelectTrigger>
                      <SafeSelectContent>
                        <SelectItem value="all">All</SelectItem>
                        {accounts.map(a => (
                          <SelectItem key={a._id} value={a._id}>{a.name}</SelectItem>
                        ))}
                      </SafeSelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>Search quotes</Label>
                    <Popover open={quotePickerOpen} onOpenChange={setQuotePickerOpen}>
                      <PopoverTrigger asChild>
                        <Button variant="outline" className="w-full justify-between h-10">
                          {selectedQuoteId !== 'none' ? (acceptedQuotes.find(q => q.id === selectedQuoteId)?.quote_number || 'Selected quote') : 'Search and select quote'}
                          <ChevronDown className="h-4 w-4 opacity-50" />
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="p-0 w-[420px] z-[10000]">
                        <Command filter={(value, search) => {
                          const v = value.toLowerCase();
                          const s = search.toLowerCase();
                          return v.includes(s) ? 1 : 0;
                        }}>
                          <CommandInput placeholder="Quote number or customer..." value={quoteSearch} onValueChange={setQuoteSearch} />
                          <CommandList>
                            <CommandEmpty>No quotes found.</CommandEmpty>
                            <CommandGroup>
                              {acceptedQuotes
                                .filter(q => {
                                  if (selectedAccountId === 'all') return true;
                                  const accName = (accounts.find(a => a._id === selectedAccountId)?.name || '').toLowerCase();
                                  const qName = (q.customer_name || '').toLowerCase();
                                  return q.account_id === selectedAccountId || (!!accName && accName === qName);
                                })
                                .filter(q => {
                                  if (quoteStatusFilter === 'all') return true;
                                  return (q.status || '').toLowerCase() === quoteStatusFilter;
                                })
                                .filter(q => {
                                  if (!onlyMyQuotes) return true;
                                  return isQuoteCreatedByMe(q);
                                })
                                .filter(q => {
                                  const created = q.created_at ? new Date(q.created_at) : null;
                                  const fromOk = fromDate ? (created ? created >= new Date(fromDate) : false) : true;
                                  const toOk = toDate ? (created ? created <= new Date(toDate) : false) : true;
                                  return fromOk && toOk;
                                })
                                .filter(q => {
                                  const s = quoteSearch.toLowerCase();
                                  return s ? ((q.quote_number || '').toLowerCase().includes(s) || (q.customer_name || '').toLowerCase().includes(s)) : true;
                                })
                                .map(q => (
                                  <CommandItem
                                    key={q.id}
                                    onSelect={() => {
                                      setSelectedQuoteId(q.id);
                                      if (q.account_id) {
                                        setSelectedAccountId(prev => prev === 'all' ? q.account_id! : prev);
                                        form.setValue('accountId', q.account_id!);
                                      }
                                      form.setValue('value', Number(q.grand_total || 0));
                                      form.setValue('currency', q.currency || 'USD');
                                      form.setValue('opportunityId', q.opportunity_id || '');
                                      setQuotePickerOpen(false);
                                    }}
                                  >
                                    <div className="flex items-center justify-between w-full">
                                      <div className="flex flex-col">
                                        <div className="flex items-center gap-2">
                                          <div className="font-medium">{q.quote_number}</div>
                                          {getQuoteStatusBadge(q.status)}
                                        </div>
                                        <div className="text-xs text-slate-500">{q.customer_name || q.account_id}</div>
                                      </div>
                                    </div>
                                  </CommandItem>
                                ))}
                            </CommandGroup>
                          </CommandList>
                        </Command>
                      </PopoverContent>
                    </Popover>
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-2 mt-2">
                  <div className="space-y-2">
                    <Label>Only my quotes</Label>
                    <Select value={onlyMyQuotes ? 'yes' : 'no'} onValueChange={(v) => setOnlyMyQuotes(v === 'yes')}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SafeSelectContent>
                        <SelectItem value="no">No</SelectItem>
                        <SelectItem value="yes">Yes</SelectItem>
                      </SafeSelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>From date</Label>
                    <div className="relative">
                      <Input type="date" value={fromDate} onChange={(e) => setFromDate(e.target.value)} />
                      <Popover open={fromDatePickerOpen} onOpenChange={setFromDatePickerOpen}>
                        <PopoverTrigger asChild>
                          <Button variant="ghost" size="icon" className="absolute right-1 top-1.5 h-7 w-7">
                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" className="text-slate-500"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect><line x1="16" y1="2" x2="16" y2="6"></line><line x1="8" y1="2" x2="8" y2="6"></line><line x1="3" y1="10" x2="21" y2="10"></line></svg>
                          </Button>
                        </PopoverTrigger>
                        <PopoverContent className="p-0 w-auto">
                          <Calendar
                            mode="single"
                            selected={fromDate ? new Date(fromDate) : undefined}
                            onSelect={(date) => {
                              if (date) {
                                const y = date.getFullYear();
                                const m = String(date.getMonth() + 1).padStart(2, '0');
                                const d = String(date.getDate()).padStart(2, '0');
                                setFromDate(`${y}-${m}-${d}`);
                                setFromDatePickerOpen(false);
                              }
                            }}
                          />
                        </PopoverContent>
                      </Popover>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label>To date</Label>
                    <div className="relative">
                      <Input type="date" value={toDate} onChange={(e) => setToDate(e.target.value)} />
                      <Popover open={toDatePickerOpen} onOpenChange={setToDatePickerOpen}>
                        <PopoverTrigger asChild>
                          <Button variant="ghost" size="icon" className="absolute right-1 top-1.5 h-7 w-7">
                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" className="text-slate-500"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect><line x1="16" y1="2" x2="16" y2="6"></line><line x1="8" y1="2" x2="8" y2="6"></line><line x1="3" y1="10" x2="21" y2="10"></line></svg>
                          </Button>
                        </PopoverTrigger>
                        <PopoverContent className="p-0 w-auto">
                          <Calendar
                            mode="single"
                            selected={toDate ? new Date(toDate) : undefined}
                            onSelect={(date) => {
                              if (date) {
                                const y = date.getFullYear();
                                const m = String(date.getMonth() + 1).padStart(2, '0');
                                const d = String(date.getDate()).padStart(2, '0');
                                setToDate(`${y}-${m}-${d}`);
                                setToDatePickerOpen(false);
                              }
                            }}
                          />
                        </PopoverContent>
                      </Popover>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {creationMode === 'template' && (
               <div className="space-y-2">
               <Label>Template</Label>
               <Select value={selectedTemplateId} onValueChange={setSelectedTemplateId}>
                 <SelectTrigger>
                   <SelectValue placeholder="Auto-select by type" />
                 </SelectTrigger>
                 <SafeSelectContent>
                   <SelectItem value="auto">Auto</SelectItem>
                   {templates
                     .filter(t => (t.contract_type || '').toLowerCase() === (contractType || '').toLowerCase())
                     .map(t => (
                       <SelectItem key={(t._id || t.id)!} value={(t._id || t.id)!}>{t.name}</SelectItem>
                     ))}
                 </SafeSelectContent>
               </Select>
             </div>
            )}

            <div className="space-y-2">
              <Label>Contract Type</Label>
               <Select value={form.watch('type')} onValueChange={(v) => form.setValue('type', v)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select type" />
                  </SelectTrigger>
                  <SafeSelectContent>
                    <SelectItem value="MSA">MSA</SelectItem>
                    <SelectItem value="NDA">NDA</SelectItem>
                    <SelectItem value="Service">Service Agreement</SelectItem>
                  </SafeSelectContent>
                </Select>
            </div>
             <div className="space-y-2">
              <Label>Owner</Label>
              <Input value={user?.name || user?.email || 'Me'} disabled />
            </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <CardTitle>Contract Dates</CardTitle>
                <CardDescription>Set the effective period</CardDescription>
              </CardHeader>
              <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Start Date</Label>
              <Input type="date" {...form.register('startDate')} />
            </div>
            <div className="space-y-2">
              <Label>End Date</Label>
              <Input type="date" {...form.register('endDate')} />
            </div>
            <div className="space-y-2">
              <Label>Term Length (Months)</Label>
              <Select value={termMonths} onValueChange={setTermMonths}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SafeSelectContent>
                  <SelectItem value="6">6</SelectItem>
                  <SelectItem value="12">12</SelectItem>
                  <SelectItem value="24">24</SelectItem>
                  <SelectItem value="36">36</SelectItem>
                </SafeSelectContent>
              </Select>
            </div>
             <div className="space-y-2">
              <Label>Renewal Type</Label>
               <Select value={form.watch('renewalType')} onValueChange={(v) => form.setValue('renewalType', v)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SafeSelectContent>
                    <SelectItem value="auto">Auto-Renew</SelectItem>
                    <SelectItem value="manual">Manual</SelectItem>
                  </SafeSelectContent>
                </Select>
            </div>
            <div className="space-y-2">
              <Label>Notice Period (Days)</Label>
              <Input type="number" value={noticePeriod} onChange={(e) => setNoticePeriod(e.target.value)} />
            </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <CardTitle>Financials</CardTitle>
                <CardDescription>Auto-populated from Quote if selected</CardDescription>
              </CardHeader>
              <CardContent className="grid grid-cols-1 md:grid-cols-3 gap-4">
             <div className="space-y-2">
              <Label>Contract Value</Label>
              <Input type="number" {...form.register('value', { valueAsNumber: true })} disabled={isFromQuote} />
            </div>
             <div className="space-y-2">
              <Label>Billing Terms</Label>
               <Select value={billingTerms} onValueChange={setBillingTerms} disabled={isFromQuote}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SafeSelectContent>
                    <SelectItem value="Net 30">Net 30</SelectItem>
                    <SelectItem value="Net 60">Net 60</SelectItem>
                    <SelectItem value="Upon Receipt">Upon Receipt</SelectItem>
                  </SafeSelectContent>
                </Select>
            </div>
             <div className="space-y-2">
              <Label>Payment Frequency</Label>
               <Select value={paymentTerms} onValueChange={setPaymentTerms} disabled={isFromQuote}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SafeSelectContent>
                    <SelectItem value="Monthly">Monthly</SelectItem>
                    <SelectItem value="Quarterly">Quarterly</SelectItem>
                    <SelectItem value="Annually">Annually</SelectItem>
                  </SafeSelectContent>
                </Select>
            </div>
              </CardContent>
            </Card>
          </div>

          <div className="lg:col-span-4">
            <div className="lg:sticky lg:top-24">
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle>Summary</CardTitle>
                  <CardDescription>Executive overview</CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex items-center gap-2">
                    <Badge variant="outline" className="h-6 text-xs">Draft</Badge>
                    <Badge variant="secondary" className="h-6 text-xs">{form.watch('type') || '—'}</Badge>
                  </div>
                  <Separator />
                  <div className="text-sm">
                    <div className="font-medium">Account</div>
                    <div className="text-slate-600">{accounts.find(a => a._id === form.watch('accountId'))?.name || '—'}</div>
                  </div>
                  <div className="text-sm">
                    <div className="font-medium">Quote</div>
                    <div className="text-slate-600">{selectedQuoteId !== 'none' ? acceptedQuotes.find(q => q.id === selectedQuoteId)?.quote_number || 'Selected' : '—'}</div>
                  </div>
                  <Separator />
                  <div className="text-sm grid grid-cols-2 gap-2">
                    <div>
                      <div className="font-medium">Owner</div>
                      <div className="text-slate-600">{user?.name || user?.email || '—'}</div>
                    </div>
                    <div>
                      <div className="font-medium">Currency</div>
                      <div className="text-slate-600">{form.watch('currency') || '—'}</div>
                    </div>
                  </div>
                  <div className="text-sm grid grid-cols-2 gap-2">
                    <div>
                      <div className="font-medium">Start</div>
                      <div className="text-slate-600">{form.watch('startDate') || '—'}</div>
                    </div>
                    <div>
                      <div className="font-medium">End</div>
                      <div className="text-slate-600">{form.watch('endDate') || '—'}</div>
                    </div>
                  </div>
                  <div className="text-sm grid grid-cols-2 gap-2">
                    <div>
                      <div className="font-medium">Term</div>
                      <div className="text-slate-600">{termMonths ? `${termMonths} months` : '—'}</div>
                    </div>
                    <div>
                      <div className="font-medium">Renewal</div>
                      <div className="text-slate-600">{form.watch('renewalType') || '—'}</div>
                    </div>
                  </div>
                  <Separator />
                  <div className="text-sm grid grid-cols-2 gap-2">
                    <div>
                      <div className="font-medium">Value</div>
                      <div className="text-slate-600">{form.watch('value') || 0}</div>
                    </div>
                    <div>
                      <div className="font-medium">Currency</div>
                      <div className="text-slate-600">{form.watch('currency') || 'USD'}</div>
                    </div>
                  </div>
                  <Separator />
                  <div className="rounded-md border bg-yellow-50 text-yellow-900 p-3">
                    <div className="text-sm font-medium">Missing fields</div>
                    <div className="text-xs mt-1">
                      {[
                        !form.watch('title') ? 'Title' : null,
                        !form.watch('accountId') ? 'Account' : null,
                        !form.watch('startDate') ? 'Start Date' : null,
                        !form.watch('endDate') ? 'End Date' : null,
                      ].filter(Boolean).length === 0 ? 'All required fields look good.' : (
                        <ul className="list-disc ml-4">
                          {[
                            !form.watch('title') ? 'Title' : null,
                            !form.watch('accountId') ? 'Account' : null,
                            !form.watch('startDate') ? 'Start Date' : null,
                            !form.watch('endDate') ? 'End Date' : null,
                          ].filter(Boolean).map((f, i) => <li key={i}>{f}</li>)}
                        </ul>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CreateContract;

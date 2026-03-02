const authHeaders = () => {
  const token = localStorage.getItem('token');
  return token ? { Authorization: `Bearer ${token}` } : {};
};

// Types
export interface Deal {
  _id: string;
  title: string;
  company: string;
  accountId: string;
  leadId?: string;
  value: number;
  stage: 'new' | 'qualification' | 'proposal' | 'negotiation' | 'closed_won' | 'closed_lost';
  probability: number;
  closingDate: string;
  owner: string;
  createdAt: string;
  description?: string;
  contactName?: string;
  primaryContactId?: string;
  pipelineStageId?: string;
}

export interface Lead {
  _id: string;
  name: string;
  title: string;
  company: string;
  email: string;
  phone: string;
  source: string;
  status: 'new' | 'contacted' | 'qualified' | 'unqualified';
  owner: string;
  score: number;
  lastContacted: string;
  createdAt: string;
  address?: string;
  notes?: string;
}

export interface Activity {
  _id: string;
  type: 'call' | 'meeting' | 'email' | 'note' | 'task';
  title: string;
  description: string;
  date: string;
  time: string;
  duration?: number;
  priority?: 'low' | 'medium' | 'high';
  status: 'upcoming' | 'completed' | 'overdue' | 'scheduled' | 'cancelled';
  outcome?: string;
  relatedTo: {
    type: 'lead' | 'deal' | 'contact' | 'account';
    id: string;
    name: string;
  };
  createdAt: string;
}

export interface Contact {
  _id: string;
  name: string;
  role: string;
  company: string;
  email: string;
  phone: string;
  location?: string;
  address?: string;
  lastContacted: string;
  status: 'active' | 'inactive';
  createdAt: string;
  avatar?: string;
}

export interface Account {
  _id: string;
  name: string;
  industry: string;
  location?: string;
  employees?: string;
  annualRevenue?: string;
  status: 'active' | 'churned' | 'prospect' | 'inactive';
  owner: string;
  website: string;
  phone?: string;
  address?: string;
  createdAt: string;
  lastContact?: string;
  description?: string;
}

export interface Note {
  _id: string;
  title: string;
  content: string;
  date: string;
  time: string;
  createdAt: string;
}

// Mock data removed

class CRMService {
  private API_URL = (import.meta.env.VITE_API_URL || 'http://localhost:5000/api') + '/crm';

  // Local storage helpers removed
  private async safeFetch(url: string, init?: RequestInit) {
    const response = await fetch(url, init);
    if (response.status === 401) {
      try {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
      } catch {}
      if (typeof window !== 'undefined') {
        window.location.assign('/signin');
      }
      throw new Error('Unauthorized');
    }
    if (!response.ok) {
      let message = 'Network response was not ok';
      try {
        const data = await response.json();
        message = (data && (data.message || data.error)) ? (data.message || data.error) : message;
      } catch {}
      throw new Error(message);
    }
    return response;
  }

  private decodeDeal(db: {
    id?: string; _id?: string; title?: string; company?: string; accountId?: string; leadId?: string;
    value?: number | string; stage?: string; probability?: number | string; closingDate?: string;
    owner?: string; ownerName?: string; createdAt?: string; description?: string; contactName?: string;
    primaryContactId?: string; pipelineStageId?: string;
  }): Deal {
    return {
      _id: db._id ?? db.id,
      title: db.title ?? '',
      company: db.company ?? '',
      accountId: db.accountId ?? '',
      leadId: db.leadId,
      value: Number(db.value ?? 0),
      stage: (db.stage ?? 'qualification') as Deal['stage'],
      probability: Number(db.probability ?? 0),
      closingDate: db.closingDate ? new Date(db.closingDate).toISOString().split('T')[0] : '',
      owner: db.owner ?? db.ownerName ?? '',
      createdAt: db.createdAt ?? new Date().toISOString(),
      description: db.description,
      contactName: db.contactName,
      primaryContactId: db.primaryContactId,
      pipelineStageId: db.pipelineStageId
    };
  }

  private encodeDeal(app: Partial<Deal>): Record<string, unknown> {
    const out: Record<string, unknown> = { ...app };
    if ('owner' in out) {
      (out as { ownerName?: string }).ownerName = String((out as { owner?: unknown }).owner || '');
      delete (out as { owner?: unknown }).owner;
    }
    if ('closingDate' in out && out['closingDate']) {
      out['closingDate'] = new Date(String(out['closingDate'])).toISOString();
    }
    return out;
  }

  private decodeAccount(db: {
    id?: string; _id?: string; name?: string; industry?: string; location?: string; employees?: string;
    annualRevenue?: string; status?: string; owner?: string; ownerName?: string; website?: string;
    phone?: string; address?: string; createdAt?: string; lastContact?: string; description?: string;
  }): Account {
    return {
      _id: db._id ?? db.id,
      name: db.name ?? '',
      industry: db.industry ?? '',
      location: db.location,
      employees: db.employees,
      annualRevenue: db.annualRevenue,
      status: (db.status ?? 'active') as Account['status'],
      owner: db.owner ?? db.ownerName ?? '',
      website: db.website ?? '',
      phone: db.phone,
      address: db.address,
      createdAt: db.createdAt ?? new Date().toISOString(),
      lastContact: db.lastContact,
      description: db.description
    };
  }

  private encodeAccount(app: Partial<Account>): Record<string, unknown> {
    const out: Record<string, unknown> = {};
    if (app.name !== undefined) out.name = String(app.name || '');
    if (app.industry !== undefined) out.industry = String(app.industry || '');
    if (app.website !== undefined) out.website = String(app.website || '');
    if (app.phone !== undefined) out.phone = String(app.phone || '');
    if (app.address !== undefined) out.address = String(app.address || '');
    if (app.location !== undefined) out.location = String(app.location || '');
    if (app.status !== undefined) out.status = String(app.status || '').toLowerCase();
    if (app.employees !== undefined) out.employees = String(app.employees || '');
    if (app.annualRevenue !== undefined) {
      const cleaned = String(app.annualRevenue).trim();
      out.annualRevenue = cleaned;
    }
    if (app.lastContact !== undefined) out.lastContact = new Date(String(app.lastContact)).toISOString();
    if (app.owner !== undefined) {
      (out as { ownerName?: string }).ownerName = String(app.owner || '');
    }
    return out;
  }

  private encodeContact(app: Partial<Contact>): Record<string, unknown> {
    const out: Record<string, unknown> = {};
    if (app.name !== undefined) out.name = String(app.name || '');
    if (app.role !== undefined) out.role = String(app.role || '');
    if (app.company !== undefined) out.company = String(app.company || '');
    if (app.email !== undefined) out.email = String(app.email || '');
    if (app.phone !== undefined) out.phone = String(app.phone || '');
    if (app.location !== undefined) out.location = String(app.location || '');
    if (app.address !== undefined) out.address = String(app.address || '');
    if (app.status !== undefined) out.status = String(app.status || '');
    if (app.avatar !== undefined) out.avatar = String(app.avatar || '');
    if (app.lastContacted) out.lastContacted = new Date(String(app.lastContacted)).toISOString();
    if ((app as { accountId?: string }).accountId) out.accountId = String((app as { accountId?: string }).accountId);
    return out;
  }
  private decodeLead(db: {
    id?: string; _id?: string; name?: string; title?: string; company?: string; email?: string;
    phone?: string; source?: string; status?: string; owner?: string; ownerName?: string; score?: number | string;
    lastContacted?: string; createdAt?: string; address?: string; notes?: string; notesText?: string;
  }): Lead {
    return {
      _id: db._id ?? db.id,
      name: db.name ?? '',
      title: db.title ?? '',
      company: db.company ?? '',
      email: db.email ?? '',
      phone: db.phone ?? '',
      source: db.source ?? '',
      status: (db.status ?? 'new') as Lead['status'],
      owner: db.owner ?? db.ownerName ?? '',
      score: Number(db.score ?? 0),
      lastContacted: db.lastContacted ? new Date(db.lastContacted).toISOString().split('T')[0] : '',
      createdAt: db.createdAt ?? new Date().toISOString(),
      address: db.address,
      notes: db.notes ?? db.notesText
    };
  }

  private encodeLead(app: Partial<Lead>): Record<string, unknown> {
    const out: Record<string, unknown> = { ...app };
    if ('owner' in out) {
      (out as { ownerName?: string }).ownerName = String((out as { owner?: unknown }).owner || '');
      delete (out as { owner?: unknown }).owner;
    }
    if ('notes' in out) {
      (out as { notesText?: string }).notesText = String((out as { notes?: unknown }).notes || '');
      delete (out as { notes?: unknown }).notes;
    }
    return out;
  }

  private decodeContact(db: {
    id?: string; _id?: string; name?: string; role?: string; company?: string; email?: string; phone?: string;
    location?: string; address?: string; lastContacted?: string; status?: string; createdAt?: string; avatar?: string;
  }): Contact {
    return {
      _id: db._id ?? db.id,
      name: db.name ?? '',
      role: db.role ?? '',
      company: db.company ?? '',
      email: db.email ?? '',
      phone: db.phone ?? '',
      location: db.location,
      address: db.address,
      lastContacted: db.lastContacted ? new Date(db.lastContacted).toISOString().split('T')[0] : '',
      status: (db.status ?? 'active') as Contact['status'],
      createdAt: db.createdAt ?? new Date().toISOString(),
      avatar: db.avatar
    };
  }

  private encodeActivity(app: Partial<Activity>): Record<string, unknown> {
    const out: Record<string, unknown> = {};
    if (app.type !== undefined) out.type = String(app.type);
    if (app.title !== undefined) out.title = String(app.title || '');
    if (app.description !== undefined) out.description = String(app.description || '');
    if (app.date) out.date = new Date(String(app.date)).toISOString();
    if (app.time !== undefined) out.time = String(app.time || '');
    if (app.duration !== undefined) out.duration = Number(app.duration || 0);
    if (app.status !== undefined) out.status = String(app.status || '');
    if (app.outcome !== undefined) out.outcome = String(app.outcome || '');
    if (app.relatedTo !== undefined) out.relatedTo = app.relatedTo;
    // Map related foreign keys when present
    const rt = app.relatedTo as { type?: string; id?: string } | undefined;
    if (rt?.type === 'contact' && rt.id) out.contactId = rt.id;
    if (rt?.type === 'account' && rt.id) out.accountId = rt.id;
    if (rt?.type === 'lead' && rt.id) out.leadId = rt.id;
    if (rt?.type === 'deal' && rt.id) out.opportunityId = rt.id;
    // Do NOT include non-schema fields like "priority"
    return out;
  }

  private encodeNote(app: Partial<Note>): Record<string, unknown> {
    const out: Record<string, unknown> = {};
    if (app.title !== undefined) out.title = String(app.title || '');
    if (app.content !== undefined) out.content = String(app.content || '');
    if (app.date) out.date = new Date(String(app.date)).toISOString();
    if (app.time !== undefined) out.time = String(app.time || '');
    // related context mapping is handled by callers via explicit ids (accountId, contactId, leadId, opportunityId)
    return out;
  }

  // Deals
  async getDeals(filters?: { company?: string, contactId?: string, q?: string }): Promise<Deal[]> {
    let url = `${this.API_URL}/deals`;
    const params = new URLSearchParams();
    if (filters?.company) params.append('company', filters.company);
    if (filters?.contactId) params.append('contactId', filters.contactId);
    if (filters?.q) params.append('q', filters.q);
    if (params.toString()) url += `?${params.toString()}`;

    const response = await this.safeFetch(url, { headers: { ...authHeaders() } });
    const data: unknown = await response.json();
    return Array.isArray(data) ? (data as Array<{
      id?: string; _id?: string; title?: string; company?: string; accountId?: string; leadId?: string;
      value?: number | string; stage?: string; probability?: number | string; closingDate?: string;
      owner?: string; ownerName?: string; createdAt?: string; description?: string; contactName?: string;
      primaryContactId?: string; pipelineStageId?: string;
    }>).map(d => this.decodeDeal(d)) : [];
  }

  async getDeal(id: string): Promise<Deal | undefined> {
    const response = await fetch(`${this.API_URL}/deals/${id}`, { headers: { ...authHeaders() } });
    if (!response.ok) throw new Error('Network response was not ok');
    const data: unknown = await response.json();
    return data ? this.decodeDeal(data as {
      id?: string; _id?: string; title?: string; company?: string; accountId?: string; leadId?: string;
      value?: number | string; stage?: string; probability?: number | string; closingDate?: string;
      owner?: string; ownerName?: string; createdAt?: string; description?: string; contactName?: string;
      primaryContactId?: string; pipelineStageId?: string;
    }) : undefined;
  }

  async createDeal(deal: Omit<Deal, '_id' | 'createdAt'>): Promise<Deal> {
    const response = await fetch(`${this.API_URL}/deals`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', ...authHeaders() },
      body: JSON.stringify(this.encodeDeal(deal))
    });
    if (!response.ok) throw new Error('Network response was not ok');
    const data: unknown = await response.json();
    return this.decodeDeal(data as {
      id?: string; _id?: string; title?: string; company?: string; accountId?: string; leadId?: string;
      value?: number | string; stage?: string; probability?: number | string; closingDate?: string;
      owner?: string; ownerName?: string; createdAt?: string; description?: string; contactName?: string;
      primaryContactId?: string; pipelineStageId?: string;
    });
  }

  async updateDeal(id: string, updates: Partial<Deal>): Promise<Deal> {
    const response = await fetch(`${this.API_URL}/deals/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json', ...authHeaders() },
      body: JSON.stringify(this.encodeDeal(updates))
    });
    if (!response.ok) throw new Error('Network response was not ok');
    const data: unknown = await response.json();
    return this.decodeDeal(data as {
      id?: string; _id?: string; title?: string; company?: string; accountId?: string; leadId?: string;
      value?: number | string; stage?: string; probability?: number | string; closingDate?: string;
      owner?: string; ownerName?: string; createdAt?: string; description?: string; contactName?: string;
      primaryContactId?: string; pipelineStageId?: string;
    });
  }

  async deleteDeal(id: string): Promise<void> {
    const response = await fetch(`${this.API_URL}/deals/${id}`, { method: 'DELETE', headers: { ...authHeaders() } });
    if (!response.ok) throw new Error('Network response was not ok');
  }

  async moveOpportunity(id: string, stageId: string): Promise<Deal> {
    const response = await fetch(`${this.API_URL}/opportunities/${id}/move`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', ...authHeaders() },
      body: JSON.stringify({ stageId })
    });
    if (!response.ok) throw new Error('Network response was not ok');
    const data: unknown = await response.json();
    return this.decodeDeal(data as {
      id?: string; _id?: string; title?: string; company?: string; accountId?: string; leadId?: string;
      value?: number | string; stage?: string; probability?: number | string; closingDate?: string;
      owner?: string; ownerName?: string; createdAt?: string; description?: string; contactName?: string;
      primaryContactId?: string; pipelineStageId?: string;
    });
  }

  // Leads
  async getLeads(q?: string): Promise<Lead[]> {
    let url = `${this.API_URL}/leads`;
    if (q && q.trim()) {
      const params = new URLSearchParams({ q });
      url += `?${params.toString()}`;
    }
    const response = await fetch(url, { headers: { ...authHeaders() } });
    if (!response.ok) throw new Error('Network response was not ok');
    const data: unknown = await response.json();
    return Array.isArray(data) ? (data as Array<{
      id?: string; _id?: string; name?: string; title?: string; company?: string; email?: string;
      phone?: string; source?: string; status?: string; owner?: string; ownerName?: string; score?: number | string;
      lastContacted?: string; createdAt?: string; address?: string; notes?: string; notesText?: string;
    }>).map(d => this.decodeLead(d)) : [];
  }

  async getLead(id: string): Promise<Lead | undefined> {
    const response = await fetch(`${this.API_URL}/leads/${id}`, { headers: { ...authHeaders() } });
    if (!response.ok) throw new Error('Network response was not ok');
    const data: unknown = await response.json();
    return data ? this.decodeLead(data as {
      id?: string; _id?: string; name?: string; title?: string; company?: string; email?: string;
      phone?: string; source?: string; status?: string; owner?: string; ownerName?: string; score?: number | string;
      lastContacted?: string; createdAt?: string; address?: string; notes?: string; notesText?: string;
    }) : undefined;
  }

  async createLead(lead: Omit<Lead, '_id' | 'createdAt'>): Promise<Lead> {
    const response = await fetch(`${this.API_URL}/leads`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', ...authHeaders() },
      body: JSON.stringify(this.encodeLead(lead))
    });
    if (!response.ok) throw new Error('Network response was not ok');
    const data: unknown = await response.json();
    return this.decodeLead(data as {
      id?: string; _id?: string; name?: string; title?: string; company?: string; email?: string;
      phone?: string; source?: string; status?: string; owner?: string; ownerName?: string; score?: number | string;
      lastContacted?: string; createdAt?: string; address?: string; notes?: string; notesText?: string;
    });
  }

  async updateLead(id: string, updates: Partial<Lead>): Promise<Lead> {
    const response = await fetch(`${this.API_URL}/leads/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json', ...authHeaders() },
      body: JSON.stringify(this.encodeLead(updates))
    });
    if (!response.ok) throw new Error('Network response was not ok');
    const data: unknown = await response.json();
    return this.decodeLead(data as {
      id?: string; _id?: string; name?: string; title?: string; company?: string; email?: string;
      phone?: string; source?: string; status?: string; owner?: string; ownerName?: string; score?: number | string;
      lastContacted?: string; createdAt?: string; address?: string; notes?: string; notesText?: string;
    });
  }

  async convertLead(
    id: string,
    dealDetails: { dealName: string; dealValue: number }
  ): Promise<{ message: string; account: Account; opportunity: Deal; contact: Contact }> {
    const response = await fetch(`${this.API_URL}/leads/${id}/convert`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', ...authHeaders() },
      body: JSON.stringify(dealDetails)
    });
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Failed to convert lead');
    }
    const data = await response.json();
    return {
      message: data.message,
      account: this.decodeAccount(data.account),
      opportunity: this.decodeDeal(data.opportunity),
      contact: this.decodeContact(data.contact)
    };
  }

  async sendLeadEmail(id: string, payload: { subject: string; message: string; html?: string }): Promise<{ message: string }> {
    const response = await this.safeFetch(`${this.API_URL}/leads/${id}/email`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', ...authHeaders() },
      body: JSON.stringify(payload)
    });
    const data = await response.json();
    return data as { message: string };
  }
  async deleteLead(id: string): Promise<void> {
    const response = await fetch(`${this.API_URL}/leads/${id}`, { method: 'DELETE', headers: { ...authHeaders() } });
    if (!response.ok) throw new Error('Network response was not ok');
  }

  // Contacts
  async getContacts(filters?: { company?: string }): Promise<Contact[]> {
    let url = `${this.API_URL}/contacts`;
    if (filters?.company) {
      url += `?company=${encodeURIComponent(filters.company)}`;
    }
    const response = await this.safeFetch(url, { headers: { ...authHeaders() } });
    const data: unknown = await response.json();
    return Array.isArray(data) ? (data as Array<{
      id?: string; _id?: string; name?: string; role?: string; company?: string; email?: string; phone?: string;
      location?: string; address?: string; lastContacted?: string; status?: string; createdAt?: string; avatar?: string;
    }>).map(d => this.decodeContact(d)) : [];
  }

  async getContact(id: string): Promise<Contact | undefined> {
    const response = await fetch(`${this.API_URL}/contacts/${id}`, { headers: { ...authHeaders() } });
    if (!response.ok) throw new Error('Network response was not ok');
    const c: unknown = await response.json();
    return c ? this.decodeContact(c as {
      id?: string; _id?: string; name?: string; role?: string; company?: string; email?: string; phone?: string;
      location?: string; address?: string; lastContacted?: string; status?: string; createdAt?: string; avatar?: string;
    }) : undefined;
  }

  async createContact(contact: Omit<Contact, '_id' | 'createdAt'>): Promise<Contact> {
    const response = await fetch(`${this.API_URL}/contacts`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', ...authHeaders() },
      body: JSON.stringify(this.encodeContact(contact))
    });
    if (!response.ok) throw new Error('Network response was not ok');
    const c: unknown = await response.json();
    return this.decodeContact(c as {
      id?: string; _id?: string; name?: string; role?: string; company?: string; email?: string; phone?: string;
      location?: string; address?: string; lastContacted?: string; status?: string; createdAt?: string; avatar?: string;
    });
  }

  async updateContact(id: string, updates: Partial<Contact>): Promise<Contact> {
    const response = await fetch(`${this.API_URL}/contacts/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json', ...authHeaders() },
      body: JSON.stringify(this.encodeContact(updates))
    });
    if (!response.ok) throw new Error('Network response was not ok');
    const c: unknown = await response.json();
    return this.decodeContact(c as {
      id?: string; _id?: string; name?: string; role?: string; company?: string; email?: string; phone?: string;
      location?: string; address?: string; lastContacted?: string; status?: string; createdAt?: string; avatar?: string;
    });
  }

  async deleteContact(id: string): Promise<void> {
    const response = await fetch(`${this.API_URL}/contacts/${id}`, { method: 'DELETE', headers: { ...authHeaders() } });
    if (!response.ok) throw new Error('Network response was not ok');
  }
  async sendContactEmail(id: string, payload: { subject: string; message: string; html?: string }): Promise<{ message: string }> {
    const response = await this.safeFetch(`${this.API_URL}/contacts/${id}/email`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', ...authHeaders() },
      body: JSON.stringify(payload)
    });
    const data = await response.json();
    return data as { message: string };
  }

  // Accounts
  async getAccounts(): Promise<Account[]> {
    const response = await this.safeFetch(`${this.API_URL}/accounts`, { headers: { ...authHeaders() } });
    const data = await response.json();
    return Array.isArray(data) ? data.map(this.decodeAccount.bind(this)) : [];
  }

  async getAccount(id: string): Promise<Account | undefined> {
    const response = await fetch(`${this.API_URL}/accounts/${id}`, { headers: { ...authHeaders() } });
    if (!response.ok) throw new Error('Network response was not ok');
    const data = await response.json();
    return data ? this.decodeAccount(data) : undefined;
  }

  async createAccount(account: Omit<Account, '_id' | 'createdAt'>): Promise<Account> {
    const response = await this.safeFetch(`${this.API_URL}/accounts`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', ...authHeaders() },
      body: JSON.stringify(this.encodeAccount(account))
    });
    const data = await response.json();
    return this.decodeAccount(data);
  }

  async updateAccount(id: string, updates: Partial<Account>): Promise<Account> {
    const response = await this.safeFetch(`${this.API_URL}/accounts/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json', ...authHeaders() },
      body: JSON.stringify(this.encodeAccount(updates))
    });
    const data = await response.json();
    return this.decodeAccount(data);
  }

  async deleteAccount(id: string): Promise<void> {
    const response = await fetch(`${this.API_URL}/accounts/${id}`, { method: 'DELETE', headers: { ...authHeaders() } });
    if (!response.ok) throw new Error('Network response was not ok');
  }

  // Activities
  async getActivities(filters?: { relatedTo?: { type: string, id: string } }): Promise<Activity[]> {
    let url = `${this.API_URL}/activities`;
    if (filters?.relatedTo) {
      const params = new URLSearchParams();
      params.append('relatedTo.type', filters.relatedTo.type);
      params.append('relatedTo.id', filters.relatedTo.id);
      url += `?${params.toString()}`;
    }
    const response = await fetch(url, { headers: { ...authHeaders() } });
    if (!response.ok) throw new Error('Network response was not ok');
    const data: unknown = await response.json();
    return Array.isArray(data) ? (data as Activity[]) : [];
  }

  async getActivity(id: string): Promise<Activity | undefined> {
    const response = await fetch(`${this.API_URL}/activities/${id}`, { headers: { ...authHeaders() } });
    if (!response.ok) throw new Error('Network response was not ok');
    const data: unknown = await response.json();
    return (data ?? undefined) as Activity | undefined;
  }

  async createActivity(activity: Omit<Activity, '_id' | 'createdAt'>): Promise<Activity> {
    const response = await this.safeFetch(`${this.API_URL}/activities`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', ...authHeaders() },
      body: JSON.stringify(this.encodeActivity(activity))
    });
    const data: unknown = await response.json();
    return data as Activity;
  }

  async updateActivity(id: string, updates: Partial<Activity>): Promise<Activity> {
    const response = await this.safeFetch(`${this.API_URL}/activities/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json', ...authHeaders() },
      body: JSON.stringify(this.encodeActivity(updates))
    });
    const data: unknown = await response.json();
    return data as Activity;
  }

  async deleteActivity(id: string): Promise<void> {
    const response = await fetch(`${this.API_URL}/activities/${id}`, { method: 'DELETE', headers: { ...authHeaders() } });
    if (!response.ok) throw new Error('Network response was not ok');
  }

  // Notes
  async getNotes(): Promise<Note[]> {
    const response = await fetch(`${this.API_URL}/notes`, { headers: { ...authHeaders() } });
    if (!response.ok) throw new Error('Network response was not ok');
    const data: unknown = await response.json();
    return Array.isArray(data) ? (data as Note[]) : [];
  }

  // Pipeline Stages
  async getStages(): Promise<{ _id: string; name: string; order: number }[]> {
    const response = await this.safeFetch(`${this.API_URL}/stages`, { headers: { ...authHeaders() } });
    const data: unknown = await response.json();
    return Array.isArray(data) ? (data as { _id: string; name: string; order: number }[]) : [];
  }
  async createStage(data: { name: string; order?: number }) {
    const response = await fetch(`${this.API_URL}/stages`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', ...authHeaders() },
      body: JSON.stringify(data)
    });
    if (!response.ok) throw new Error('Network response was not ok');
    const created: unknown = await response.json();
    return created as { _id: string; name: string; order: number };
  }
  async updateStage(id: string, data: { name?: string; order?: number }) {
    const response = await fetch(`${this.API_URL}/stages/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json', ...authHeaders() },
      body: JSON.stringify(data)
    });
    if (!response.ok) throw new Error('Network response was not ok');
    const updated: unknown = await response.json();
    return updated as { _id: string; name: string; order: number };
  }
  async deleteStage(id: string) {
    const response = await fetch(`${this.API_URL}/stages/${id}`, { method: 'DELETE', headers: { ...authHeaders() } });
    if (!response.ok) throw new Error('Network response was not ok');
    const removed: unknown = await response.json();
    return removed as { message: string };
  }

  async getNote(id: string): Promise<Note | undefined> {
    const response = await fetch(`${this.API_URL}/notes/${id}`, { headers: { ...authHeaders() } });
    if (!response.ok) throw new Error('Network response was not ok');
    const data: unknown = await response.json();
    return (data ?? undefined) as Note | undefined;
  }

  async createNote(note: Omit<Note, '_id' | 'createdAt'>): Promise<Note> {
    const response = await this.safeFetch(`${this.API_URL}/notes`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', ...authHeaders() },
      body: JSON.stringify(this.encodeNote(note))
    });
    const created: unknown = await response.json();
    return created as Note;
  }

  async updateNote(id: string, updates: Partial<Note>): Promise<Note> {
    const response = await fetch(`${this.API_URL}/notes/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json', ...authHeaders() },
      body: JSON.stringify(updates)
    });
    if (!response.ok) throw new Error('Network response was not ok');
    const updated: unknown = await response.json();
    return updated as Note;
  }

  async deleteNote(id: string): Promise<void> {
    const response = await fetch(`${this.API_URL}/notes/${id}`, { method: 'DELETE', headers: { ...authHeaders() } });
    if (!response.ok) throw new Error('Network response was not ok');
  }
}

export const crmService = new CRMService();

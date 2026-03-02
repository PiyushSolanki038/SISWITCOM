import { Quote, Contract, Document } from '../types';
import { API_CONFIG } from '@/config/api';

// Extended Interfaces
export interface CustomerQuote {
  id: string;
  title: string;
  date: string;
  amount: string;
  status: 'Sent' | 'Accepted' | 'Rejected' | 'Draft' | 'Expired';
  validUntil: string;
  createdBy: string;
  nextStep: string;
  subtotal: string;
  tax: string;
  total: string;
  items: Array<{ desc: string; qty: number; price: string; total: string }>;
  priceBreakdown?: {
    recurring: string;
    oneTime: string;
    discounts: string;
  };
  legalTerms?: string;
}

export interface CustomerContract {
  id: string;
  name: string;
  type: string;
  status: 'Active' | 'Sent for Signature' | 'Expired' | 'Draft' | 'Signed' | 'Terminated';
  startDate: string;
  endDate: string;
  renewalType: 'Auto-renew' | 'Manual' | 'None';
  value: string;
  parties: string[];
  summary: string;
  lifecycleEvents: Array<{ status: string; date: string; user: string }>;
  signers: Array<{ name: string; email: string; status: 'Signed' | 'Pending'; signedAt?: string }>;
  documents: Array<{ name: string; type: string; url: string }>;
}

export interface CustomerDocument {
  id: string;
  name: string;
  type: string;
  category: 'Contract' | 'Invoice' | 'Guide' | 'Report';
  linkedEntity?: string; // e.g., "MSA-2024" or "Q-101"
  date: string;
  size: string;
  version: string;
}

export interface CustomerSubscription {
  id: string;
  name: string;
  features: string[];
  startDate: string;
  endDate: string;
  status: 'Active' | 'Past_Due' | 'Canceled';
  amount: string;
  billingFreq: 'Monthly' | 'Annual';
  linkedContractId: string;
}

export interface CustomerNotification {
  id: string;
  title: string;
  message: string;
  type: 'info' | 'success' | 'warning' | 'error';
  date: string;
  read: boolean;
  link?: string;
}

export interface CustomerActivity {
  id: string;
  action: string;
  description: string;
  date: string;
  icon: 'quote' | 'contract' | 'document' | 'system';
}

export interface SupportTicket {
  id: string;
  subject: string;
  status: 'Open' | 'In Progress' | 'Resolved' | 'Closed';
  date: string;
  lastUpdate: string;
}

// Initial Mock Data (Kept for non-implemented sections)
const INITIAL_NOTIFICATIONS: CustomerNotification[] = [
  { id: '1', title: 'New Quote Received', message: 'Quote #Q-2024-001 is ready for review.', type: 'info', date: '2024-01-28', read: false, link: '/customer-dashboard/quotes/Q-2024-001' },
  { id: '2', title: 'Contract Action Required', message: 'Please sign MSA-2024-FINAL.', type: 'warning', date: '2024-01-28', read: false, link: '/customer-dashboard/contracts/MSA-2024-FINAL' },
  { id: '3', title: 'Welcome', message: 'Welcome to the new customer portal!', type: 'success', date: '2024-01-27', read: true }
];

const INITIAL_ACTIVITY: CustomerActivity[] = [
  { id: '1', action: 'Quote Sent', description: 'New quote Q-2024-001 received', date: '2024-01-28', icon: 'quote' },
  { id: '2', action: 'Contract Generated', description: 'MSA-2024-FINAL ready for signature', date: '2024-01-28', icon: 'contract' },
  { id: '3', action: 'Document Uploaded', description: 'Onboarding-Guide.pdf added to documents', date: '2023-12-20', icon: 'document' }
];

const INITIAL_TICKETS: SupportTicket[] = [
  { id: 'T-101', subject: 'Login issues for team member', status: 'Resolved', date: '2023-12-10', lastUpdate: '2023-12-11' }
];

const STORAGE_KEYS = {
  QUOTES: 'customer_dashboard_quotes',
  CONTRACTS: 'customer_dashboard_contracts',
  DOCUMENTS: 'customer_dashboard_documents',
  SUBSCRIPTIONS: 'customer_dashboard_subscriptions',
  NOTIFICATIONS: 'customer_dashboard_notifications',
  ACTIVITY: 'customer_dashboard_activity',
  TICKETS: 'customer_dashboard_tickets'
};

class CustomerService {
  private getToken(): string | null {
    return localStorage.getItem('token');
  }

  private getHeaders(): HeadersInit {
    const token = this.getToken();
    return {
      'Content-Type': 'application/json',
      'x-auth-token': token || ''
    };
  }

  private getStorage<T>(key: string, initialData: T): T {
    try {
      const stored = localStorage.getItem(key);
      if (stored) {
        return JSON.parse(stored);
      }
      localStorage.setItem(key, JSON.stringify(initialData));
      return initialData;
    } catch (error) {
      console.error(`Error reading ${key} from localStorage`, error);
      return initialData;
    }
  }

  private setStorage<T>(key: string, data: T): void {
    try {
      localStorage.setItem(key, JSON.stringify(data));
    } catch (error) {
      console.error(`Error writing ${key} to localStorage`, error);
    }
  }

  // Quotes
  async getQuotes(): Promise<CustomerQuote[]> {
    try {
      const response = await fetch(`${API_CONFIG.baseUrl}/cpq/quotes`, {
        headers: this.getHeaders()
      });
      
      if (!response.ok) throw new Error('Failed to fetch quotes');
      
      const data = await response.json();
      
      return data.map((q: any) => ({
        id: q._id,
        title: q.opportunityId?.name || `Quote ${q.quoteNumber}`,
        date: new Date(q.createdAt).toISOString().split('T')[0],
        amount: new Intl.NumberFormat('en-US', { style: 'currency', currency: q.currency || 'USD' }).format(q.grandTotal),
        status: q.status.charAt(0).toUpperCase() + q.status.slice(1),
        validUntil: q.validUntil ? new Date(q.validUntil).toISOString().split('T')[0] : '',
        createdBy: 'Sirius Inc.',
        nextStep: q.status === 'sent' ? 'Review and Accept' : 'N/A',
        subtotal: new Intl.NumberFormat('en-US', { style: 'currency', currency: q.currency || 'USD' }).format(q.subtotal),
        tax: new Intl.NumberFormat('en-US', { style: 'currency', currency: q.currency || 'USD' }).format(q.taxTotal),
        total: new Intl.NumberFormat('en-US', { style: 'currency', currency: q.currency || 'USD' }).format(q.grandTotal),
        items: (q.items || []).map((i: any) => ({
          desc: i.name,
          qty: i.quantity,
          price: new Intl.NumberFormat('en-US', { style: 'currency', currency: q.currency || 'USD' }).format(i.unitPrice),
          total: new Intl.NumberFormat('en-US', { style: 'currency', currency: q.currency || 'USD' }).format(i.total)
        }))
      }));
    } catch (error) {
      console.error('Error fetching quotes:', error);
      return [];
    }
  }

  async getQuoteById(id: string): Promise<CustomerQuote | undefined> {
    try {
      const response = await fetch(`${API_CONFIG.baseUrl}/cpq/quotes/${id}`, {
        headers: this.getHeaders()
      });
      
      if (!response.ok) return undefined;
      
      const q = await response.json();
      
      return {
        id: q._id,
        title: q.opportunityId?.name || `Quote ${q.quoteNumber}`,
        date: new Date(q.createdAt).toISOString().split('T')[0],
        amount: new Intl.NumberFormat('en-US', { style: 'currency', currency: q.currency || 'USD' }).format(q.grandTotal),
        status: q.status.charAt(0).toUpperCase() + q.status.slice(1) as CustomerQuote['status'],
        validUntil: q.validUntil ? new Date(q.validUntil).toISOString().split('T')[0] : '',
        createdBy: 'Sirius Inc.',
        nextStep: q.status === 'sent' ? 'Review and Accept' : 'N/A',
        subtotal: new Intl.NumberFormat('en-US', { style: 'currency', currency: q.currency || 'USD' }).format(q.subtotal),
        tax: new Intl.NumberFormat('en-US', { style: 'currency', currency: q.currency || 'USD' }).format(q.taxTotal),
        total: new Intl.NumberFormat('en-US', { style: 'currency', currency: q.currency || 'USD' }).format(q.grandTotal),
        items: (q.items || []).map((i: any) => ({
          desc: i.name,
          qty: i.quantity,
          price: new Intl.NumberFormat('en-US', { style: 'currency', currency: q.currency || 'USD' }).format(i.unitPrice),
          total: new Intl.NumberFormat('en-US', { style: 'currency', currency: q.currency || 'USD' }).format(i.total)
        }))
      };
    } catch (error) {
      console.error('Error fetching quote:', error);
      return undefined;
    }
  }

  async updateQuoteStatus(id: string, status: CustomerQuote['status']): Promise<CustomerQuote | undefined> {
    try {
        let endpoint = '';
        if (status === 'Accepted') {
            endpoint = `${API_CONFIG.baseUrl}/cpq/quotes/${id}/accept`;
        } else {
            if (status !== 'Accepted') {
                console.warn('Only Accept is currently supported via API');
                return undefined;
            }
        }

        const response = await fetch(endpoint, {
            method: 'POST',
            headers: this.getHeaders()
        });

        if (!response.ok) throw new Error('Failed to update quote status');

        const q = await response.json();
        
        // Also add to activity
        this.addActivity({
            id: Date.now().toString(),
            action: `Quote ${status}`,
            description: `Quote ${id} was ${status}`,
            date: new Date().toISOString().split('T')[0],
            icon: 'quote'
        });

        return {
             id: q._id,
            title: q.opportunityId?.name || `Quote ${q.quoteNumber}`,
            date: new Date(q.createdAt).toISOString().split('T')[0],
            amount: new Intl.NumberFormat('en-US', { style: 'currency', currency: q.currency || 'USD' }).format(q.grandTotal),
            status: q.status.charAt(0).toUpperCase() + q.status.slice(1) as CustomerQuote['status'],
            validUntil: q.validUntil ? new Date(q.validUntil).toISOString().split('T')[0] : '',
            createdBy: 'Sirius Inc.',
            nextStep: q.status === 'sent' ? 'Review and Accept' : 'N/A',
            subtotal: new Intl.NumberFormat('en-US', { style: 'currency', currency: q.currency || 'USD' }).format(q.subtotal),
            tax: new Intl.NumberFormat('en-US', { style: 'currency', currency: q.currency || 'USD' }).format(q.taxTotal),
            total: new Intl.NumberFormat('en-US', { style: 'currency', currency: q.currency || 'USD' }).format(q.grandTotal),
            items: (q.items || []).map((i: any) => ({
                desc: i.name,
                qty: i.quantity,
                price: new Intl.NumberFormat('en-US', { style: 'currency', currency: q.currency || 'USD' }).format(i.unitPrice),
                total: new Intl.NumberFormat('en-US', { style: 'currency', currency: q.currency || 'USD' }).format(i.total)
            }))
        };

    } catch (error) {
        console.error('Error updating quote status:', error);
        return undefined;
    }
  }

  // Contracts
  async getContracts(): Promise<CustomerContract[]> {
    try {
      const response = await fetch(`${API_CONFIG.baseUrl}/clm/contracts`, {
        headers: this.getHeaders()
      });
      
      if (!response.ok) throw new Error('Failed to fetch contracts');
      
      const data = await response.json();
      
      return data.map((c: any) => this.mapContractData(c));
    } catch (error) {
        console.error('Error fetching contracts:', error);
        return [];
    }
  }

  async getContractById(id: string): Promise<CustomerContract | undefined> {
     try {
      const response = await fetch(`${API_CONFIG.baseUrl}/clm/contracts/${id}`, {
        headers: this.getHeaders()
      });
      
      if (!response.ok) return undefined;
      
      const c = await response.json();
      return this.mapContractData(c);
    } catch (error) {
        console.error('Error fetching contract:', error);
        return undefined;
    }
  }

  async updateContractStatus(id: string, status: CustomerContract['status']): Promise<CustomerContract | undefined> {
    try {
      if (status === 'Signed') {
        const response = await fetch(`${API_CONFIG.baseUrl}/clm/contracts/${id}/sign`, {
          method: 'POST',
          headers: this.getHeaders()
        });

        if (!response.ok) throw new Error('Failed to sign contract');

        const c = await response.json();
        
        // Add to activity
        this.addActivity({
          id: Date.now().toString(),
          action: 'Contract Signed',
          description: `Contract ${c.contract_number} was signed`,
          date: new Date().toISOString().split('T')[0],
          icon: 'contract'
        });

        return this.mapContractData(c);
      }
      return undefined;
    } catch (error) {
      console.error('Error updating contract status:', error);
      return undefined;
    }
  }

  private mapContractData(c: any): CustomerContract {
    return {
      id: c._id,
      name: c.name || `Contract ${c.contract_number}`,
      type: c.contract_type || 'MSA',
      status: c.status === 'pending_signature' ? 'Sent for Signature' : 
              c.status.charAt(0).toUpperCase() + c.status.slice(1) as any,
      startDate: c.start_date ? new Date(c.start_date).toISOString().split('T')[0] : '',
      endDate: c.end_date ? new Date(c.end_date).toISOString().split('T')[0] : '',
      renewalType: c.renewal_type === 'auto' ? 'Auto-renew' : 'Manual',
      value: new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(c.contract_value || 0),
      parties: ['Acme Corp (You)', 'Sirius Inc.'],
      summary: 'Standard Agreement',
      lifecycleEvents: c.lifecycleEvents || [],
      signers: (c.signers || []).map((s: any) => ({
          name: s.name,
          email: s.email,
          status: s.status === 'signed' ? 'Signed' : 'Pending',
          signedAt: s.signed_at ? new Date(s.signed_at).toISOString().split('T')[0] : undefined
      })),
      documents: []
    };
  }

  // Documents
  async getDocuments(): Promise<CustomerDocument[]> {
    try {
      const response = await fetch(`${API_CONFIG.baseUrl}/documents`, {
        headers: this.getHeaders()
      });
      
      if (!response.ok) return [];
      
      const data = await response.json();
      return data.map((d: any) => ({
        id: d._id,
        name: d.name,
        type: d.type || 'PDF',
        category: d.category || 'Other',
        linkedEntity: d.linked_entity_id,
        date: new Date(d.created_at).toISOString().split('T')[0],
        size: d.size || 'N/A',
        version: d.version || '1.0'
      }));
    } catch (error) {
      console.error('Error fetching documents:', error);
      return [];
    }
  }

  // Subscriptions
  async getSubscriptions(): Promise<CustomerSubscription[]> {
    try {
      const response = await fetch(`${API_CONFIG.baseUrl}/subscription/my-subscription`, {
        headers: this.getHeaders()
      });
      
      if (!response.ok) return [];
      
      const s = await response.json();
      if (!s) return [];

      return [{
        id: s._id,
        name: s.plan.charAt(0).toUpperCase() + s.plan.slice(1) + ' Plan',
        features: ['Full Platform Access', 'Priority Support', 'Advanced Analytics'], // Mock features for now
        startDate: new Date(s.startDate).toISOString().split('T')[0],
        endDate: s.endDate ? new Date(s.endDate).toISOString().split('T')[0] : '',
        status: s.status === 'active' ? 'Active' : 'Past_Due',
        amount: new Intl.NumberFormat('en-US', { style: 'currency', currency: s.currency || 'USD' }).format(s.amount),
        billingFreq: s.billingCycle === 'monthly' ? 'Monthly' : 'Annual',
        linkedContractId: ''
      }];
    } catch (error) {
      console.error('Error fetching subscriptions:', error);
      return [];
    }
  }

  // Notifications
  async getNotifications(): Promise<CustomerNotification[]> {
    // Mock for now, but async
    return Promise.resolve(this.getStorage(STORAGE_KEYS.NOTIFICATIONS, INITIAL_NOTIFICATIONS));
  }

  async markNotificationRead(id: string): Promise<void> {
    const notifs = this.getStorage<CustomerNotification[]>(STORAGE_KEYS.NOTIFICATIONS, INITIAL_NOTIFICATIONS);
    const index = notifs.findIndex(n => n.id === id);
    if (index !== -1) {
      notifs[index].read = true;
      this.setStorage(STORAGE_KEYS.NOTIFICATIONS, notifs);
    }
    return Promise.resolve();
  }

  // Activity
  async getActivity(): Promise<CustomerActivity[]> {
    return Promise.resolve(this.getStorage(STORAGE_KEYS.ACTIVITY, INITIAL_ACTIVITY));
  }

  async addActivity(activity: CustomerActivity): Promise<void> {
    const activities = this.getStorage<CustomerActivity[]>(STORAGE_KEYS.ACTIVITY, INITIAL_ACTIVITY);
    activities.unshift(activity);
    this.setStorage(STORAGE_KEYS.ACTIVITY, activities);
    return Promise.resolve();
  }

  // Support
  async getTickets(): Promise<SupportTicket[]> {
    return Promise.resolve(this.getStorage(STORAGE_KEYS.TICKETS, INITIAL_TICKETS));
  }
}

export const customerService = new CustomerService();

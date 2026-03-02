export interface Deal {
  _id: string;
  title: string;
  company: string;
  value: number;
  stage: 'qualification' | 'proposal' | 'negotiation' | 'closed';
  probability: number;
  closingDate: string;
  owner: string;
  createdAt: string;
}

export interface Lead {
  _id: string;
  name: string;
  title: string;
  company: string;
  email: string;
  phone: string;
  source: string;
  status: 'new' | 'contacted' | 'qualified' | 'proposal' | 'negotiation' | 'won' | 'lost' | 'hot' | 'warm' | 'cold';
  owner: string;
  score: number;
  lastContacted: string;
}

export interface Activity {
  _id: string;
  type: 'call' | 'email' | 'meeting' | 'note';
  title: string;
  description: string;
  date: string;
  time: string;
  duration?: number; // in minutes
  participants?: string[];
  status: 'upcoming' | 'completed' | 'cancelled';
  relatedTo: {
    type: 'lead' | 'contact' | 'deal' | 'account';
    id: string;
    name: string;
  };
}

export interface Account {
  _id: string;
  name: string;
  industry: string;
  website: string;
  phone: string;
  owner: string;
  status: 'active' | 'inactive' | 'churned';
  annualRevenue?: number;
}

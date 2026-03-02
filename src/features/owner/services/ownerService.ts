import { API_CONFIG } from '@/config/api';

const headers = () => {
  const token = localStorage.getItem('token') || '';
  const h: Record<string, string> = { 'Content-Type': 'application/json' };
  if (token) {
    h['x-auth-token'] = token;
    h['Authorization'] = `Bearer ${token}`;
  }
  return h;
};

export const ownerService = {
  getRevenueTrend: async (range: '6months' | '12months') => {
    if (range === '6months') {
      const r = await fetch(`${API_CONFIG.baseUrl}/erp/revenue/analytics`, { headers: headers() });
      if (!r.ok) throw new Error('Failed to fetch revenue analytics');
      return r.json();
    } else {
      const r = await fetch(`${API_CONFIG.baseUrl}/erp/payments`, { headers: headers() });
      if (!r.ok) throw new Error('Failed to fetch payments');
      const payments: Array<{ amount?: number | string; status?: string; paymentDate?: string }> = await r.json();
      const now = new Date();
      const start = new Date(now.getFullYear(), now.getMonth() - 11, 1);
      const months = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];
      const buckets: Record<string, number> = {};
      for (let i = 0; i < 12; i++) {
        const d = new Date(start.getFullYear(), start.getMonth() + i, 1);
        buckets[`${d.getFullYear()}-${d.getMonth()+1}`] = 0;
      }
      for (const p of payments) {
        if ((p.status || '').toLowerCase() !== 'completed') continue;
        const d = p.paymentDate ? new Date(p.paymentDate) : null;
        if (!d) continue;
        if (d < start || d > now) continue;
        const key = `${d.getFullYear()}-${d.getMonth()+1}`;
        buckets[key] = (buckets[key] || 0) + Number(p.amount || 0);
      }
      return Object.entries(buckets).map(([k, total]) => {
        const [y, m] = k.split('-').map(Number);
        return { name: months[(m - 1) % 12], total };
      });
    }
  },
  getThisMonthRevenue: async (): Promise<number> => {
    const r = await fetch(`${API_CONFIG.baseUrl}/erp/payments`, { headers: headers() });
    if (!r.ok) throw new Error('Failed to fetch payments');
    const payments: Array<{ amount?: number | string; status?: string; paymentDate?: string }> = await r.json();
    const now = new Date();
    const month = now.getMonth();
    const year = now.getFullYear();
    let sum = 0;
    for (const p of payments) {
      if ((p.status || '').toLowerCase() !== 'completed') continue;
      const d = p.paymentDate ? new Date(p.paymentDate) : null;
      if (!d) continue;
      if (d.getMonth() === month && d.getFullYear() === year) {
        sum += Number(p.amount || 0);
      }
    }
    return sum;
  },
  getOpenInvoicesUnpaidTotal: async (): Promise<number> => {
    const r = await fetch(`${API_CONFIG.baseUrl}/erp/invoices`, { headers: headers() });
    if (!r.ok) throw new Error('Failed to fetch invoices');
    const invoices: Array<{ status?: string; balanceDue?: number | string; grandTotal?: number | string }> = await r.json();
    let sum = 0;
    for (const i of invoices) {
      const s = (i.status || '').toLowerCase();
      if (s === 'paid') continue;
      const due = i.balanceDue ?? (Number(i.grandTotal || 0));
      sum += Number(due || 0);
    }
    return sum;
  },
  getActiveContractsCount: async (): Promise<number> => {
    const r = await fetch(`${API_CONFIG.baseUrl}/clm/contracts?status=active`, { headers: headers() });
    if (!r.ok) throw new Error('Failed to fetch contracts');
    const list: unknown[] = await r.json();
    return Array.isArray(list) ? list.length : 0;
  },
  getTopOpportunities: async (limit = 5) => {
    const r = await fetch(`${API_CONFIG.baseUrl}/crm/deals`, { headers: headers() });
    if (!r.ok) throw new Error('Failed to fetch deals');
    const deals: Array<{ title?: string; company?: string; value?: number | string; stage?: string; closingDate?: string }> = await r.json();
    const open = deals.filter(d => !String(d.stage || '').toLowerCase().startsWith('closed'));
    const sorted = open.sort((a, b) => Number(b.value || 0) - Number(a.value || 0)).slice(0, limit);
    return sorted.map(d => ({
      name: d.title || d.company || 'Deal',
      stage: d.stage || '',
      value: Number(d.value || 0),
      closeDate: d.closingDate ? new Date(d.closingDate) : undefined
    }));
  },
  getUpcomingRenewals: async (days = 30) => {
    const r = await fetch(`${API_CONFIG.baseUrl}/clm/contracts`, { headers: headers() });
    if (!r.ok) throw new Error('Failed to fetch contracts');
    const contracts: Array<{ name?: string; customer_name?: string; end_date?: string; status?: string }> = await r.json();
    const now = new Date();
    const cutoff = new Date(now.getTime() + days * 24 * 60 * 60 * 1000);
    const out: Array<{ account: string; endDate: Date; daysLeft: number }> = [];
    for (const c of contracts) {
      const end = c.end_date ? new Date(c.end_date) : null;
      if (!end) continue;
      if (end <= now || end > cutoff) continue;
      out.push({
        account: c.customer_name || c.name || 'Contract',
        endDate: end,
        daysLeft: Math.ceil((end.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))
      });
    }
    out.sort((a, b) => a.daysLeft - b.daysLeft);
    return out.slice(0, 6);
  }
};

import axios from 'axios';
import { API_CONFIG } from '@/config/api';
import { ERPOrder, ERPInvoice, ERPPayment, ERPCreditNote } from './types';

const API_URL = `${API_CONFIG.baseUrl}/erp`;

type WithAccount<T> = T & {
  account?: { id?: string; _id?: string; name: string; email?: string };
};

const getAuthHeader = () => {
    const token = localStorage.getItem('token');
    return token ? { 'x-auth-token': token, 'Authorization': `Bearer ${token}` } : {};
};

export const erpService = {
  // Orders
  getOrders: async (): Promise<ERPOrder[]> => {
    const response = await axios.get(`${API_URL}/orders`, { headers: getAuthHeader() });
    const orders: WithAccount<ERPOrder>[] = (response.data || []) as WithAccount<ERPOrder>[];
    return orders.map((o) => {
      const account = o.account;
      return {
        ...o,
        accountId: account ? { _id: (account._id || account.id) as string, name: account.name, email: account.email || '' } : o.accountId
      } as ERPOrder;
    });
  },
  
  getOrder: async (id: string): Promise<ERPOrder> => {
    const response = await axios.get(`${API_URL}/orders/${id}`, { headers: getAuthHeader() });
    const o = response.data as WithAccount<ERPOrder>;
    const account = o?.account;
    return {
      ...o,
      accountId: account ? { _id: (account._id || account.id) as string, name: account.name, email: account.email || '' } : o.accountId
    } as ERPOrder;
  },
  
  sendOrderEmail: async (id: string, payload?: { email?: string; note?: string }): Promise<{ message: string }> => {
    const response = await axios.post(`${API_URL}/orders/${id}/email`, payload || {}, { headers: getAuthHeader() });
    return response.data;
  },
  
  createOrder: async (data: Partial<ERPOrder>): Promise<ERPOrder> => {
    const response = await axios.post(`${API_URL}/orders`, data, { headers: getAuthHeader() });
    return response.data;
  },
  
  updateOrder: async (id: string, data: Partial<ERPOrder>): Promise<ERPOrder> => {
    const response = await axios.put(`${API_URL}/orders/${id}`, data, { headers: getAuthHeader() });
    return response.data;
  },
  
  confirmOrder: async (id: string): Promise<ERPOrder> => {
    const response = await axios.post(`${API_URL}/orders/${id}/confirm`, {}, { headers: getAuthHeader() });
    return response.data;
  },
  
  startFulfillment: async (orderId: string): Promise<ERPOrder> => {
    const response = await axios.post(`${API_URL}/orders/${orderId}/fulfillment/start`, {}, { headers: getAuthHeader() });
    return response.data;
  },
  
  completeFulfillment: async (orderId: string): Promise<ERPOrder> => {
    const response = await axios.post(`${API_URL}/orders/${orderId}/fulfillment/complete`, {}, { headers: getAuthHeader() });
    return response.data;
  },

  // Invoices
  getInvoices: async (status?: string): Promise<ERPInvoice[]> => {
    const params = status ? { status } : {};
    const response = await axios.get(`${API_URL}/invoices`, { params, headers: getAuthHeader() });
    const invoices: WithAccount<ERPInvoice>[] = (response.data || []) as WithAccount<ERPInvoice>[];
    return invoices.map((i) => {
      const account = i.account;
      return {
        ...i,
        accountId: account ? { _id: (account._id || account.id) as string, name: account.name, email: account.email || '' } : i.accountId
      } as ERPInvoice;
    });
  },

  createInvoice: async (data: Partial<ERPInvoice>): Promise<ERPInvoice> => {
    const response = await axios.post(`${API_URL}/invoices`, data, { headers: getAuthHeader() });
    return response.data;
  },
  
  getInvoice: async (id: string): Promise<ERPInvoice> => {
    const response = await axios.get(`${API_URL}/invoices/${id}`, { headers: getAuthHeader() });
    const i = response.data as WithAccount<ERPInvoice>;
    const account = i?.account;
    return {
      ...i,
      accountId: account ? { _id: (account._id || account.id) as string, name: account.name, email: account.email || '' } : i.accountId
    } as ERPInvoice;
  },
  
  sendInvoice: async (id: string): Promise<ERPInvoice> => {
    const response = await axios.post(`${API_URL}/invoices/${id}/send`, {}, { headers: getAuthHeader() });
    return response.data;
  },
  
  sendInvoiceEmail: async (id: string, payload?: { email?: string; note?: string }): Promise<ERPInvoice> => {
    const response = await axios.post(`${API_URL}/invoices/${id}/email`, payload || {}, { headers: getAuthHeader() });
    return response.data;
  },

  // Payments
  getPayments: async (): Promise<ERPPayment[]> => {
    const response = await axios.get(`${API_URL}/payments`, { headers: getAuthHeader() });
    const payments: WithAccount<ERPPayment>[] = (response.data || []) as WithAccount<ERPPayment>[];
    return payments.map((p) => {
      const account = p.account;
      return {
        ...p,
        method: (p as any).method || (p as any).paymentMethod || 'bank_transfer',
        accountId: account ? { _id: (account._id || account.id) as string, name: account.name, email: account.email || '' } : p.accountId
      } as ERPPayment;
    });
  },

  createPayment: async (data: Partial<ERPPayment> & { invoiceId?: string; paymentMethod?: string }): Promise<any> => {
    if (!data.invoiceId) {
      throw new Error('invoiceId is required to record a payment');
    }
    const payload: any = { paymentMethod: data.paymentMethod || 'bank_transfer' };
    const response = await axios.post(`${API_URL}/invoices/${data.invoiceId}/pay`, payload, { headers: getAuthHeader() });
    return response.data; // returns { message, invoice, payment }
  },
  
  getPayment: async (id: string): Promise<ERPPayment> => {
    const response = await axios.get(`${API_URL}/payments/${id}`, { headers: getAuthHeader() });
    const p = response.data as WithAccount<ERPPayment>;
    const account = p?.account;
    return {
      ...p,
      method: (p as any).method || (p as any).paymentMethod || 'bank_transfer',
      accountId: account ? { _id: (account._id || account.id) as string, name: account.name, email: account.email || '' } : p.accountId
    } as ERPPayment;
  },

  // Credit Notes
  getCreditNotes: async (): Promise<ERPCreditNote[]> => {
    const response = await axios.get(`${API_URL}/credit-notes`, { headers: getAuthHeader() });
    const notes: WithAccount<ERPCreditNote>[] = (response.data || []) as WithAccount<ERPCreditNote>[];
    return notes.map((n) => {
      const account = n.account;
      return {
        ...n,
        accountId: account ? { _id: (account._id || account.id) as string, name: account.name, email: account.email || '' } : n.accountId
      } as ERPCreditNote;
    });
  },
  
  getCreditNote: async (id: string): Promise<ERPCreditNote> => {
    const response = await axios.get(`${API_URL}/credit-notes/${id}`, { headers: getAuthHeader() });
    const n = response.data as WithAccount<ERPCreditNote>;
    const account = n?.account;
    return {
      ...n,
      accountId: account ? { _id: (account._id || account.id) as string, name: account.name, email: account.email || '' } : n.accountId
    } as ERPCreditNote;
  },
  createCreditNote: async (data: { invoiceId?: string; accountId?: string; amount: number; reason?: string }): Promise<ERPCreditNote> => {
    const payload: any = {
      invoiceId: data.invoiceId,
      accountId: data.accountId,
      amount: data.amount,
      reason: data.reason || 'Return/Refund',
      status: 'draft'
    };
    const response = await axios.post(`${API_URL}/credit-notes`, payload, { headers: getAuthHeader() });
    return response.data;
  }
};

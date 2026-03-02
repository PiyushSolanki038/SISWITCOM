import axios from 'axios';
import { ERPOrder, ERPInvoice, ERPPayment } from './types';

const API_URL = '/api/erp';
const SUBSCRIPTION_API_URL = '/api/subscription';

const getAuthHeader = () => {
    const token = localStorage.getItem('token');
    return token ? { 'x-auth-token': token } : {};
};

export const customerErpService = {
  getMyOrders: async (accountId: string): Promise<ERPOrder[]> => {
    const response = await axios.get(`${API_URL}/orders?accountId=${accountId}`, { headers: getAuthHeader() });
    return response.data;
  },

  getMyInvoices: async (accountId: string): Promise<ERPInvoice[]> => {
    const response = await axios.get(`${API_URL}/invoices?accountId=${accountId}`, { headers: getAuthHeader() });
    return response.data;
  },

  getMyPayments: async (accountId: string): Promise<ERPPayment[]> => {
    const response = await axios.get(`${API_URL}/payments?accountId=${accountId}`, { headers: getAuthHeader() });
    return response.data;
  },

  payInvoice: async (invoiceId: string, paymentMethod: string = 'credit_card'): Promise<any> => {
    const response = await axios.post(`${API_URL}/invoices/${invoiceId}/pay`, { paymentMethod }, { headers: getAuthHeader() });
    return response.data;
  },

  getMySubscription: async (userId: string): Promise<any> => {
    try {
      // userId param is no longer needed as we use token, but keeping signature for now
      const response = await axios.get(`${SUBSCRIPTION_API_URL}/my-subscription`, { headers: getAuthHeader() });
      return response.data;
    } catch (error) {
      console.error("Error fetching subscription", error);
      return null;
    }
  }
};

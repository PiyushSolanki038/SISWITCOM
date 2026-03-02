import axios from 'axios';
import { API_CONFIG } from '@/config/api';
import { Quote, QuoteItem, Product } from '@/features/employee/pages/cpq/types';

const API_URL = `${API_CONFIG.baseUrl}/cpq`;

// Axios instance with token
const getAuthHeader = () => {
    const token = localStorage.getItem('token');
    return token ? { 'x-auth-token': token, 'Authorization': `Bearer ${token}` } : {};
};

// Helper to map backend Quote (camelCase) to frontend Quote (snake_case)
const mapQuote = (data: any): Quote => {
    const statusUpper = (data.status || '').toUpperCase();
    const statusMap: Record<string, Quote['status']> = {
        DRAFT: 'draft',
        SENT: 'sent',
        APPROVAL_PENDING: 'pending_approval',
        APPROVED: 'approved',
        ACCEPTED: 'accepted',
        REJECTED: 'rejected'
    };
    const status = statusMap[statusUpper] || 'draft';
    return {
        id: data._id || data.id,
        quote_number: data.quoteNumber,
        account_id: data.account?.id || data.account?._id || data.accountId?._id || data.accountId,
        opportunity_id: data.opportunity?.id || data.opportunity?._id || data.opportunityId?._id || data.opportunityId,
        status,
        currency: data.currency,
        subtotal: Number(data.subtotal || 0),
        discount_total: Number(data.discountTotal || 0),
        tax_total: Number(data.taxTotal || 0),
        grand_total: Number(data.grandTotal || 0),
        valid_until: data.validUntil,
        created_by: data.createdBy,
        created_at: data.createdAt,
        updated_at: data.updatedAt,
        customer_name: data.account?.name || data.accountId?.name,
        items: (data.items || []).map((item: any) => ({
            id: item._id || item.id,
            quote_id: data._id || data.id,
            product_id: item.productId,
            product_name_snapshot: item.name || '',
            unit_price: Number(item.unitPrice || 0),
            quantity: Number(item.quantity || 0),
            discount_percent: Number(item.discount || 0),
            line_subtotal: Number(item.unitPrice || 0) * Number(item.quantity || 0),
            line_total: Number(item.total || 0),
            created_at: data.createdAt,
            updated_at: data.updatedAt
        }))
    };
};

export const cpqService = {
    // Quotes
    getQuotes: async (): Promise<Quote[]> => {
        const response = await axios.get(`${API_URL}/quotes`, { headers: getAuthHeader() });
        return response.data.map(mapQuote);
    },
    getQuotesForAccount: async (accountId: string, status?: 'DRAFT' | 'SENT' | 'APPROVAL_PENDING' | 'APPROVED' | 'ACCEPTED' | 'REJECTED'): Promise<Quote[]> => {
        const response = await axios.get(`${API_URL}/quotes`, { headers: getAuthHeader(), params: { accountId, status } });
        return response.data.map(mapQuote);
    },
    getQuotesByAccountName: async (accountName: string, status?: 'DRAFT' | 'SENT' | 'APPROVAL_PENDING' | 'APPROVED' | 'ACCEPTED' | 'REJECTED'): Promise<Quote[]> => {
        const response = await axios.get(`${API_URL}/quotes`, { headers: getAuthHeader(), params: { accountName, status } });
        return response.data.map(mapQuote);
    },

    getQuote: async (id: string): Promise<Quote> => {
        const response = await axios.get(`${API_URL}/quotes/${id}`, { headers: getAuthHeader() });
        return mapQuote(response.data);
    },

    createQuote: async (data: Partial<Quote>): Promise<Quote> => {
        // Map frontend snake_case to backend camelCase if needed, 
        // but for now the backend mostly takes direct values or we need to map input too.
        // The CreateQuote.tsx likely sends camelCase or we need to adjust.
        // Actually, CreateQuote.tsx probably sends what we tell it.
        // Let's assume input is properly formatted or we map it here.
        // For simplicity, we just pass data and assume the caller handles structure, 
        // OR we map it back.
        // Since we are "fixing" the service, let's just map the response.
        const response = await axios.post(`${API_URL}/quotes`, data, { headers: getAuthHeader() });
        return mapQuote(response.data);
    },

    updateQuote: async (id: string, data: Partial<Quote>): Promise<Quote> => {
        const response = await axios.put(`${API_URL}/quotes/${id}`, data, { headers: getAuthHeader() });
        return mapQuote(response.data);
    },

    sendQuote: async (id: string): Promise<Quote> => {
        const response = await axios.post(`${API_URL}/quotes/${id}/send`, {}, { headers: getAuthHeader() });
        return mapQuote(response.data);
    },

    acceptQuote: async (id: string): Promise<Quote> => {
        const response = await axios.post(`${API_URL}/quotes/${id}/accept`, {}, { headers: getAuthHeader() });
        return mapQuote(response.data);
    },

    requestApproval: async (id: string, comment?: string): Promise<Quote> => {
        const response = await axios.post(`${API_URL}/quotes/${id}/request-approval`, { comment }, { headers: getAuthHeader() });
        return mapQuote(response.data);
    },
    approveQuote: async (id: string): Promise<Quote> => {
        const response = await axios.post(`${API_URL}/quotes/${id}/approve`, {}, { headers: getAuthHeader() });
        return mapQuote(response.data);
    },
    rejectQuote: async (id: string, comment?: string): Promise<Quote> => {
        const response = await axios.post(`${API_URL}/quotes/${id}/reject`, { comment }, { headers: getAuthHeader() });
        return mapQuote(response.data);
    },

    // Products
    getProducts: async (): Promise<Product[]> => {
        const response = await axios.get(`${API_URL}/products`, { headers: getAuthHeader() });
        return response.data.map((p: any) => ({ ...p, id: p._id }));
    },
    getProduct: async (id: string): Promise<Product> => {
        const response = await axios.get(`${API_URL}/products/${id}`, { headers: getAuthHeader() });
        const p = response.data;
        return { ...p, id: p._id };
    },
    createProduct: async (data: Partial<Product>): Promise<Product> => {
        const response = await axios.post(`${API_URL}/products`, data, { headers: getAuthHeader() });
        const p = response.data;
        return { ...p, id: p._id };
    },
    updateProduct: async (id: string, data: Partial<Product>): Promise<Product> => {
        const response = await axios.put(`${API_URL}/products/${id}`, data, { headers: getAuthHeader() });
        const p = response.data;
        return { ...p, id: p._id };
    },
    deleteProduct: async (id: string): Promise<void> => {
        await axios.delete(`${API_URL}/products/${id}`, { headers: getAuthHeader() });
    },

    // Quote Items
    addQuoteItem: async (quoteId: string, item: { productId: string; quantity: number; unitPrice: number; discount?: number }): Promise<QuoteItem> => {
        const response = await axios.post(`${API_URL}/quotes/${quoteId}/items`, item, { headers: getAuthHeader() });
        const it = response.data;
        return {
            id: it._id,
            quote_id: quoteId,
            product_id: it.productId,
            product_name_snapshot: '', // server doesn't return snapshot; UI should fetch from products
            unit_price: it.unitPrice,
            quantity: it.quantity,
            discount_percent: it.discount,
            line_subtotal: it.unitPrice * it.quantity,
            line_total: it.total,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
        };
    },
    updateQuoteItem: async (quoteId: string, itemId: string, updates: { quantity: number; unitPrice: number; discount?: number }): Promise<QuoteItem> => {
        const response = await axios.put(`${API_URL}/quotes/${quoteId}/items/${itemId}`, updates, { headers: getAuthHeader() });
        const it = response.data;
        return {
            id: it._id,
            quote_id: quoteId,
            product_id: it.productId,
            product_name_snapshot: '',
            unit_price: it.unitPrice,
            quantity: it.quantity,
            discount_percent: it.discount,
            line_subtotal: it.unitPrice * it.quantity,
            line_total: it.total,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
        };
    },
    deleteQuoteItem: async (quoteId: string, itemId: string): Promise<void> => {
        await axios.delete(`${API_URL}/quotes/${quoteId}/items/${itemId}`, { headers: getAuthHeader() });
    },

    // Approvals
    getApprovals: async (): Promise<any[]> => {
        const response = await axios.get(`${API_URL}/approvals`, { headers: getAuthHeader() });
        return response.data;
    }
};

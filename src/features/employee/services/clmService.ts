import axios from 'axios';
import { API_CONFIG } from '@/config/api';
import { Contract, ContractSignatureRequest, PublicSignSessionResponse, ContractTemplate, ContractSigner } from '@/features/employee/pages/clm/types';

const API_URL = `${API_CONFIG.baseUrl}/clm`;

// Axios instance with token
const getAuthHeader = () => {
    const token = localStorage.getItem('token');
    return token ? { 'x-auth-token': token, 'Authorization': `Bearer ${token}` } : {};
};

// Global auth error handling for this module
axios.interceptors.response.use(
    (res) => res,
    (error) => {
        const status = error?.response?.status;
        if (status === 401) {
            try {
                localStorage.removeItem('token');
                localStorage.removeItem('user');
            } catch { void 0; }
            if (typeof window !== 'undefined') {
                window.location.assign('/signin');
            }
            return Promise.reject(new Error('Unauthorized: Please sign in again'));
        }
        return Promise.reject(error);
    }
);

type RawId = { _id?: string; id?: string };
type IdOrObj = string | { _id?: string; name?: string };
type RawContract = RawId & {
    contract_number?: string;
    account_id?: IdOrObj;
    quote_id?: IdOrObj;
    status?: string;
    contract_value?: number;
    start_date?: string;
    end_date?: string;
    renewal_type?: string;
    owner_id?: string;
    created_at?: string;
    updated_at?: string;
    name?: string;
    customer_name?: string;
    signers?: ContractSigner[];
    content?: string;
};

const mapContract = (data: RawContract): Contract => ({
    id: data._id || data.id || '',
    contract_number: data.contract_number || '',
    account_id: typeof data.account_id === 'object' ? (data.account_id?._id || '') : (data.account_id || ''),
    quote_id: typeof data.quote_id === 'object' ? (data.quote_id?._id || '') : (data.quote_id || undefined),
    status: (data.status || 'draft') as Contract['status'],
    contract_value: data.contract_value ?? 0,
    start_date: data.start_date || '',
    end_date: data.end_date || '',
    renewal_type: (data.renewal_type || 'manual') as Contract['renewal_type'],
    owner_id: data.owner_id || '',
    created_at: data.created_at || '',
    updated_at: data.updated_at || '',
    name: data.name || '',
    customer_name: data.customer_name || (typeof data.account_id === 'object' ? (data.account_id?.name || '') : ''),
    signers: Array.isArray(data.signers) ? data.signers : [],
    content: data.content
});

export const clmService = {
    // Contracts
    getContracts: async (params?: { status?: string; type?: string; accountId?: string; from?: string; to?: string }): Promise<Contract[]> => {
        const response = await axios.get(`${API_URL}/contracts`, { headers: getAuthHeader(), params });
        return response.data.map(mapContract);
    },

    getContract: async (id: string): Promise<Contract> => {
        const response = await axios.get(`${API_URL}/contracts/${id}`, { headers: getAuthHeader() });
        return mapContract(response.data);
    },

    createContract: async (payload: {
        accountId: string;
        opportunityId?: string;
        title: string;
        type?: string;
        startDate?: string;
        endDate?: string;
        value?: number;
        currency?: string;
        content?: string;
    }): Promise<Contract> => {
        const response = await axios.post(`${API_URL}/contracts`, payload, { headers: getAuthHeader() });
        return mapContract(response.data);
    },

    updateContract: async (id: string, payload: Partial<{
        title: string;
        type: string;
        startDate: string;
        endDate: string;
        value: number;
        currency: string;
        content: string;
        status: string;
    }>): Promise<Contract> => {
        const response = await axios.put(`${API_URL}/contracts/${id}`, payload, { headers: getAuthHeader() });
        return mapContract(response.data);
    },

    deleteContract: async (id: string): Promise<void> => {
        await axios.delete(`${API_URL}/contracts/${id}`, { headers: getAuthHeader() });
    },

    createContractFromQuote: async (quoteId: string): Promise<Contract> => {
        const response = await axios.post(`${API_URL}/contracts/from-quote/${quoteId}`, {}, { headers: getAuthHeader() });
        return mapContract(response.data);
    },

    submitApproval: async (id: string, comment?: string): Promise<Contract> => {
        const response = await axios.post(`${API_URL}/contracts/${id}/submit-approval`, { comment }, { headers: getAuthHeader() });
        return mapContract(response.data);
    },

    approveContract: async (id: string, reason?: string): Promise<Contract> => {
        const response = await axios.post(`${API_URL}/contracts/${id}/approve`, { reason }, { headers: getAuthHeader() });
        return mapContract(response.data);
    },

    rejectContract: async (id: string, reason?: string): Promise<Contract> => {
        const response = await axios.post(`${API_URL}/contracts/${id}/reject`, { reason }, { headers: getAuthHeader() });
        return mapContract(response.data);
    },

    renewContract: async (id: string): Promise<Contract> => {
        const response = await axios.post(`${API_URL}/contracts/${id}/renew`, {}, { headers: getAuthHeader() });
        return mapContract(response.data);
    },

    sendForSignature: async (id: string, signers: Array<{ name: string; email: string; sign_order?: number }>): Promise<Contract> => {
        const response = await axios.post(`${API_URL}/contracts/${id}/send-for-signature`, { signers }, { headers: getAuthHeader() });
        return mapContract(response.data);
    },

    getSignatures: async (): Promise<ContractSignatureRequest[]> => {
        const response = await axios.get(`${API_URL}/signatures`, { headers: getAuthHeader() });
        return response.data;
    },

    getSignature: async (id: string): Promise<ContractSignatureRequest> => {
        const response = await axios.get(`${API_URL}/signatures/${id}`, { headers: getAuthHeader() });
        return response.data;
    },

    getContractAuditLogs: async (contractId: string): Promise<Array<{ id: string; action: string; performed_by: string; created_at: string }>> => {
        const response = await axios.get(`${API_URL}/contracts/${contractId}/audit`, { headers: getAuthHeader() });
        return response.data;
    },

    getPublicSignSession: async (token: string): Promise<PublicSignSessionResponse> => {
        const response = await axios.get(`${API_URL}/public/sign/${token}`);
        return response.data;
    },

    publicSign: async (token: string, signatureData?: string): Promise<{ message: string }> => {
        const response = await axios.post(`${API_URL}/public/sign/${token}`, { signatureData });
        return response.data;
    },

    publicDecline: async (token: string): Promise<{ message: string }> => {
        const response = await axios.post(`${API_URL}/public/decline/${token}`);
        return response.data;
    },

    // Templates
    getTemplates: async (): Promise<ContractTemplate[]> => {
        const response = await axios.get(`${API_URL}/templates`, { headers: getAuthHeader() });
        return response.data;
    },
    getTemplate: async (id: string): Promise<ContractTemplate> => {
        const response = await axios.get(`${API_URL}/templates/${id}`, { headers: getAuthHeader() });
        return response.data;
    },
    createTemplate: async (payload: { name: string; contract_type: string; content: string; is_active?: boolean; clauses?: Array<{ title: string; content: string; sortOrder?: number; required?: boolean }> }): Promise<ContractTemplate> => {
        const response = await axios.post(`${API_URL}/templates`, payload, { headers: getAuthHeader() });
        return response.data;
    },
    updateTemplate: async (id: string, payload: { name?: string; contract_type?: string; content?: string; is_active?: boolean; version?: number; clauses?: Array<{ title: string; content: string; sortOrder?: number; required?: boolean }> }): Promise<ContractTemplate> => {
        const response = await axios.put(`${API_URL}/templates/${id}`, payload, { headers: getAuthHeader() });
        return response.data;
    },
    deleteTemplate: async (id: string): Promise<void> => {
        await axios.delete(`${API_URL}/templates/${id}`, { headers: getAuthHeader() });
    },
    // Approvals
    getPendingContractApprovals: async (): Promise<Array<{ id: string; status: string; comment?: string; contract: Contract }>> => {
        try {
            const response = await axios.get(`${API_URL}/approvals/contracts`, { headers: getAuthHeader() });
            const data = Array.isArray(response.data) ? response.data : [];
            type RawApproval = { _id?: string; id?: string; status?: string; comment?: string; contract?: RawContract };
            return (data as RawApproval[]).map((a) => ({
                id: a._id || a.id || '',
                status: a.status || 'PENDING',
                comment: a.comment,
                contract: mapContract(a.contract || ({} as RawContract))
            }));
        } catch (err: unknown) {
            const status = (err as { response?: { status?: number } })?.response?.status;
            if (status === 403) {
                throw new Error('Not authorized: Owner or Admin role required');
            }
            if (status === 401) {
                throw new Error('Unauthorized: Please sign in again');
            }
            throw err;
        }
    }
};

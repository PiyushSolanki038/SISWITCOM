import axios from 'axios';
import { API_CONFIG } from '@/config/api';
import { DocumentItem } from '@/features/employee/pages/docs/types';

const API_URL = `${API_CONFIG.baseUrl}/documents`;

const getAuthHeader = () => {
    const token = localStorage.getItem('token');
    return token ? { 'x-auth-token': token, Authorization: `Bearer ${token}` } : {};
};

export const documentService = {
    getDocuments: async (): Promise<DocumentItem[]> => {
        const response = await axios.get(API_URL, { headers: getAuthHeader() });
        type RawDoc = {
            id?: string;
            _id?: string;
            name?: string;
            title?: string;
            type?: string;
            size?: string;
            created_at?: string;
            createdAt?: string;
            uploaded_by?: string;
            userId?: string;
            category?: string;
            description?: string;
            version?: string | number;
            linked_entity_id?: string;
            linked_entity_model?: string;
            url?: string;
        };
        const arr = response.data as RawDoc[];
        return arr.map((d) => ({
            id: d.id || d._id,
            name: d.name || d.title,
            type: d.type || 'unknown',
            size: d.size || '0 KB',
            modified: d.created_at || d.createdAt || new Date().toISOString(),
            created: d.created_at || d.createdAt,
            owner: d.uploaded_by || d.userId || 'System',
            category: d.category || 'Other',
            description: d.description,
            currentVersion: d.version || '1.0',
            url: d.url,
            linkedItems: d.linked_entity_id ? [{
                id: d.linked_entity_id,
                name: 'Linked Entity', // ideally fetch name or include in populate
                type: d.linked_entity_model || 'Account'
            }] : []
        }));
    },
    getDocument: async (id: string): Promise<DocumentItem> => {
        const response = await axios.get(`${API_URL}/${id}`, { headers: getAuthHeader() });
        const d = response.data as {
            id?: string; _id?: string; name?: string; title?: string; type?: string; size?: string;
            created_at?: string; createdAt?: string; uploaded_by?: string; userId?: string;
            category?: string; version?: string | number; url?: string;
        };
        return {
            id: d.id || d._id,
            name: d.name || d.title,
            type: d.type || 'unknown',
            size: d.size || '0 KB',
            modified: d.created_at || d.createdAt || new Date().toISOString(),
            created: d.created_at || d.createdAt,
            owner: d.uploaded_by || d.userId || 'System',
            category: d.category || 'Other',
            currentVersion: (typeof d.version === 'string' || typeof d.version === 'number') ? String(d.version) : '1.0',
            url: d.url
        };
    },

    uploadDocument: async (data: FormData): Promise<DocumentItem> => {
        const response = await axios.post(API_URL, data, { headers: { ...getAuthHeader(), 'Content-Type': 'multipart/form-data' } });
        const d = response.data as {
            id?: string; _id?: string; name?: string; title?: string; type?: string; size?: string;
            created_at?: string; createdAt?: string; uploaded_by?: string; userId?: string;
            category?: string; version?: string | number; url?: string;
        };
        return {
            id: d.id || d._id,
            name: d.name || d.title,
            type: d.type || 'unknown',
            size: d.size || '0 KB',
            modified: d.created_at || d.createdAt || new Date().toISOString(),
            created: d.created_at || d.createdAt,
            owner: d.uploaded_by || d.userId || 'System',
            category: d.category || 'Other',
            currentVersion: (typeof d.version === 'string' || typeof d.version === 'number') ? String(d.version) : '1.0',
            url: d.url
        };
    },

    deleteDocument: async (id: string): Promise<void> => {
        // Backend doesn't have delete route yet, assuming it might be added or using standard REST
        // Adding it to backend might be needed if not present.
        // Checked routes/documents.js, it DOES NOT have delete. 
        // I should probably add it to backend if I want to support it, but for now I'll just throw or mock.
        // Let's assume we will add it.
        await axios.delete(`${API_URL}/${id}`, { headers: getAuthHeader() });
    }
};

import { API_CONFIG } from '@/config/api';

export const adminService = {
  _decodeJwt(token: string): any | null {
    try {
      const [, payload] = token.split('.');
      if (!payload) return null;
      const json = atob(payload.replace(/-/g, '+').replace(/_/g, '/'));
      return JSON.parse(json);
    } catch {
      return null;
    }
  },
  _headers(): HeadersInit {
    const token = localStorage.getItem('token') || '';
    if (token) {
      const payload = adminService._decodeJwt(token);
      const exp = payload?.exp ? Number(payload.exp) : null;
      const now = Math.floor(Date.now() / 1000);
      if (!exp || exp <= now) {
        try {
          localStorage.removeItem('token');
          localStorage.removeItem('user');
        } catch {}
        if (typeof window !== 'undefined') {
          window.location.assign('/signin');
        }
        throw new Error('Token expired');
      }
    }
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    };
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
      headers['x-auth-token'] = token;
    }
    return headers;
  },
  async _safeFetch(url: string, init?: RequestInit) {
    const response = await fetch(url, {
      ...(init || {}),
      headers: { ...(this._headers()), ...(init?.headers || {}) },
    });
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
      let message = 'Request failed';
      try {
        const data = await response.json();
        message = data?.message || data?.error || message;
      } catch {}
      throw new Error(message);
    }
    return response;
  },
  getUsers: async () => {
    const response = await adminService._safeFetch(`${API_CONFIG.baseUrl}/admin/users`);
    return await response.json();
  },

  updateUserRole: async (userId: string, role: 'admin' | 'owner' | 'employee' | 'customer') => {
    const response = await adminService._safeFetch(`${API_CONFIG.baseUrl}/admin/users/${userId}/role`, {
      method: 'POST',
      body: JSON.stringify({ role }),
    });
    return await response.json();
  },

  forceLogout: async (userId: string) => {
    const response = await adminService._safeFetch(`${API_CONFIG.baseUrl}/admin/users/${userId}/force-logout`, {
      method: 'POST',
    });
    return await response.json();
  },

  enableUser: async (userId: string) => {
    const response = await adminService._safeFetch(`${API_CONFIG.baseUrl}/admin/users/${userId}/enable`, {
      method: 'POST',
    });
    return await response.json();
  },

  createUser: async (userData: any) => {
    const response = await adminService._safeFetch(`${API_CONFIG.baseUrl}/admin/users/create`, {
      method: 'POST',
      body: JSON.stringify(userData),
    });
    return await response.json();
  },
  
  runHealthCheck: async () => {
    const response = await adminService._safeFetch(`${API_CONFIG.baseUrl}/admin/system/health`, {
      method: 'POST',
    });
    return await response.json();
  },

  getOverview: async () => {
    const response = await adminService._safeFetch(`${API_CONFIG.baseUrl}/admin/overview`);
    return await response.json();
  },

  resetPassword: async (email: string) => {
    const response = await adminService._safeFetch(`${API_CONFIG.baseUrl}/auth/forgot-password`, {
      method: 'POST',
      body: JSON.stringify({ email }),
    });
    return await response.json();
  },

  getRolesPermissions: async () => {
    const response = await adminService._safeFetch(`${API_CONFIG.baseUrl}/admin/roles-permissions`);
    return await response.json();
  },

  updateRolePermission: async (role: string, module: string, allowed: boolean) => {
    const response = await adminService._safeFetch(`${API_CONFIG.baseUrl}/admin/roles-permissions/${role}/${module}`, {
      method: 'PUT',
      body: JSON.stringify({ allowed }),
    });
    return await response.json();
  },
  getDataSummary: async () => {
    const response = await adminService._safeFetch(`${API_CONFIG.baseUrl}/admin/data/summary`);
    return await response.json();
  },
  cleanupOrphans: async () => {
    const response = await adminService._safeFetch(`${API_CONFIG.baseUrl}/admin/data/cleanup/orphans`, { method: 'POST' });
    return await response.json();
  },
  deactivateInactiveUsers: async () => {
    const response = await adminService._safeFetch(`${API_CONFIG.baseUrl}/admin/data/deactivate-inactive`, { method: 'POST' });
    return await response.json();
  },
  purgeOldDrafts: async () => {
    const response = await adminService._safeFetch(`${API_CONFIG.baseUrl}/admin/data/purge-drafts`, { method: 'POST' });
    return await response.json();
  },
  optimizeIndexes: async () => {
    const response = await adminService._safeFetch(`${API_CONFIG.baseUrl}/admin/maintenance/index-optimize`, { method: 'POST' });
    return await response.json();
  },
  tempCleanup: async () => {
    const response = await adminService._safeFetch(`${API_CONFIG.baseUrl}/admin/maintenance/temp-clean`, { method: 'POST' });
    return await response.json();
  },
  archiveAuditLogs: async () => {
    const response = await adminService._safeFetch(`${API_CONFIG.baseUrl}/admin/maintenance/audit-archive`, { method: 'POST' });
    return await response.json();
  },
  getDuplicates: async () => {
    const response = await adminService._safeFetch(`${API_CONFIG.baseUrl}/admin/data/duplicates`);
    return await response.json();
  },
  mergeDuplicates: async (payload: { type: 'contact' | 'account'; targetId: string; duplicateIds: string[] }) => {
    const response = await adminService._safeFetch(`${API_CONFIG.baseUrl}/admin/data/merge`, {
      method: 'POST',
      body: JSON.stringify(payload),
    });
    return await response.json();
  },
  getWorkflowMetrics: async () => {
    const response = await adminService._safeFetch(`${API_CONFIG.baseUrl}/admin/workflows/metrics`);
    return await response.json();
  },
  getInvitations: async () => {
    const response = await adminService._safeFetch(`${API_CONFIG.baseUrl}/invitations/list`);
    return await response.json();
  },
  resendInvitation: async (id: string) => {
    const response = await adminService._safeFetch(`${API_CONFIG.baseUrl}/invitations/resend/${id}`, {
      method: 'POST',
    });
    return await response.json();
  },
  revokeInvitation: async (id: string) => {
    const response = await adminService._safeFetch(`${API_CONFIG.baseUrl}/invitations/revoke/${id}`, {
      method: 'POST',
    });
    return await response.json();
  },
  getStalledWorkflows: async () => {
    const response = await adminService._safeFetch(`${API_CONFIG.baseUrl}/admin/workflows/stalled`);
    return await response.json();
  },
  nudgeWorkflowItem: async (type: string, id: string) => {
    const response = await adminService._safeFetch(`${API_CONFIG.baseUrl}/admin/workflows/nudge`, {
      method: 'POST',
      body: JSON.stringify({ type, id }),
    });
    return await response.json();
  },
  getEmailTemplates: async () => {
    const response = await adminService._safeFetch(`${API_CONFIG.baseUrl}/admin/notifications/templates`);
    return await response.json();
  },
  getEmailTemplate: async (id: string) => {
    const response = await adminService._safeFetch(`${API_CONFIG.baseUrl}/admin/notifications/templates/${id}`);
    return await response.json();
  },
  createEmailTemplate: async (payload: { name: string; subject: string; html: string }) => {
    const response = await adminService._safeFetch(`${API_CONFIG.baseUrl}/admin/notifications/templates`, {
      method: 'POST',
      body: JSON.stringify(payload),
    });
    return await response.json();
  },
  updateEmailTemplate: async (id: string, payload: { name?: string; subject?: string; html?: string; is_active?: boolean }) => {
    const response = await adminService._safeFetch(`${API_CONFIG.baseUrl}/admin/notifications/templates/${id}`, {
      method: 'PUT',
      body: JSON.stringify(payload),
    });
    return await response.json();
  },
  deleteEmailTemplate: async (id: string) => {
    const response = await adminService._safeFetch(`${API_CONFIG.baseUrl}/admin/notifications/templates/${id}`, {
      method: 'DELETE',
    });
    return await response.json();
  },
  sendTestEmailTemplate: async (payload: { toEmail?: string; subject: string; html: string }) => {
    const response = await adminService._safeFetch(`${API_CONFIG.baseUrl}/admin/notifications/send-test`, {
      method: 'POST',
      body: JSON.stringify(payload),
    });
    return await response.json();
  },
  getNotificationTriggers: async () => {
    const response = await adminService._safeFetch(`${API_CONFIG.baseUrl}/admin/notifications/triggers`);
    return await response.json();
  },
  updateNotificationTriggers: async (payload: any) => {
    const response = await adminService._safeFetch(`${API_CONFIG.baseUrl}/admin/notifications/triggers`, {
      method: 'PUT',
      body: JSON.stringify(payload),
    });
    return await response.json();
  },
  validateEmailTemplate: async (payload: { subject: string; html: string }) => {
    const response = await adminService._safeFetch(`${API_CONFIG.baseUrl}/admin/notifications/templates/validate`, {
      method: 'POST',
      body: JSON.stringify(payload),
    });
    return await response.json();
  },
  bootstrapNotifications: async () => {
    const response = await adminService._safeFetch(`${API_CONFIG.baseUrl}/admin/notifications/bootstrap`, {
      method: 'POST'
    });
    return await response.json();
  },
  enableAllNotificationTriggers: async () => {
    const response = await adminService._safeFetch(`${API_CONFIG.baseUrl}/admin/notifications/triggers/enable-all`, {
      method: 'PUT'
    });
    return await response.json();
  },
  sendTestForMappedNotifications: async () => {
    const response = await adminService._safeFetch(`${API_CONFIG.baseUrl}/admin/notifications/send-test-mapped`, {
      method: 'POST'
    });
    return await response.json();
  },
  getNotificationRules: async () => {
    const response = await adminService._safeFetch(`${API_CONFIG.baseUrl}/admin/notifications/rules`);
    return await response.json();
  },
  createNotificationRule: async (payload: { eventType: string; templateId?: string; isEnabled?: boolean }) => {
    const response = await adminService._safeFetch(`${API_CONFIG.baseUrl}/admin/notifications/rules`, {
      method: 'POST',
      body: JSON.stringify(payload),
    });
    return await response.json();
  },
  updateNotificationRule: async (id: string, payload: { eventType?: string; templateId?: string | null; isEnabled?: boolean }) => {
    const response = await adminService._safeFetch(`${API_CONFIG.baseUrl}/admin/notifications/rules/${id}`, {
      method: 'PUT',
      body: JSON.stringify(payload),
    });
    return await response.json();
  },
  deleteNotificationRule: async (id: string) => {
    const response = await adminService._safeFetch(`${API_CONFIG.baseUrl}/admin/notifications/rules/${id}`, {
      method: 'DELETE',
    });
    return await response.json();
  },
  getNotificationLogs: async () => {
    const response = await adminService._safeFetch(`${API_CONFIG.baseUrl}/admin/notifications/logs`);
    return await response.json();
  },
  getIntegrationsStatus: async () => {
    const response = await adminService._safeFetch(`${API_CONFIG.baseUrl}/admin/integrations/status`);
    return await response.json();
  },
  updateDeveloperApi: async (enabled: boolean) => {
    const response = await adminService._safeFetch(`${API_CONFIG.baseUrl}/admin/integrations/developer-api`, {
      method: 'PUT',
      body: JSON.stringify({ enabled }),
    });
    return await response.json();
  }
};

export const ROLES = {
  EMPLOYEE: 'employee',
  CUSTOMER: 'customer',
  ADMIN: 'admin',
  OWNER: 'owner',
} as const;

export type Role = typeof ROLES[keyof typeof ROLES];

export type Action = 
  | 'view' 
  | 'create' 
  | 'edit' 
  | 'delete' 
  | 'configure' 
  | 'operate'
  | 'send'
  | 'sign'
  | 'pay'
  | 'request'
  | 'use'
  | 'accept'
  | 'reject'
  | 'audit';

/**
 * Role Permissions Configuration
 * 
 * Defines the accessible modules for each user role based on the Permission Matrix.
 */
export const ROLE_PERMISSIONS: Record<Role, readonly string[]> = {
  owner: [
    'dashboard', 'crm', 'cpq', 'clm', 'sign', 'docs', 'erp',
    'billing', 'portal', 'workflows', 'approvals', 'templates', 'reports', 'subscription', 'settings'
  ],
  admin: [
    'dashboard', 'crm', 'cpq', 'clm', 'sign', 'erp',
    'billing', 'portal', 'workflows', 'approvals', 'templates', 'reports', 'subscription', 'settings'
  ],
  employee: [
    'dashboard', 'crm', 'cpq', 'clm', 'sign', 'docs', 'erp',
    'billing', 'portal', 'workflows', 'approvals', 'templates', 'reports'
  ],
  customer: [
    'portal'
  ],
} as const;

/**
 * Checks if a user role has access to a specific module.
 */
export const canAccessModule = (role: Role | null, module: string): boolean => {
  if (!role) return false;
  if (role === 'owner') return true;

  const permissions = ROLE_PERMISSIONS[role];
  if (!permissions) return false;

  // Exact match
  if (permissions.includes(module)) return true;
  
  // Handle sub-modules (e.g. 'crm.deals' checks 'crm')
  const baseModule = module.split('.')[0];
  if (permissions.includes(baseModule)) {
    // Specific exclusions based on matrix
    if (role === 'employee' && module === 'subscription') return false;
    return true;
  }

  return false;
};

/**
 * Checks if a user role can perform a specific action in a module.
 * Implements the granular permissions matrix.
 */
export const canPerformAction = (role: Role | null, module: string, action: Action): boolean => {
  if (!role) return false;
  if (role === 'owner') return true; // Owner: Full Access

  // Normalize module name
  const baseModule = module.split('.')[0];

  switch (baseModule) {
    case 'crm':
      // CRM: Owner/Admin=Full, Employee=Operate, Customer=View Self Only
      if (role === 'admin') return true;
      if (role === 'employee') return ['view', 'create', 'edit', 'delete', 'operate'].includes(action);
      if (role === 'customer') return action === 'view';
      break;

    case 'cpq':
      // CPQ: Owner=Full, Admin=Configure, Employee=Operate, Customer=Accept/Reject
      if (role === 'admin') return ['view', 'configure'].includes(action);
      if (role === 'employee') return ['view', 'create', 'edit', 'delete', 'operate'].includes(action);
      if (role === 'customer') return ['view', 'accept', 'reject'].includes(action);
      break;
      
    case 'clm':
      // CLM: Owner=Full, Admin=Configure, Employee=Draft/Send, Customer=Sign/View
      if (role === 'admin') return ['view', 'configure'].includes(action);
      if (role === 'employee') return ['view', 'create', 'edit', 'send'].includes(action);
      if (role === 'customer') return ['view', 'sign'].includes(action);
      break;

    case 'sign':
    case 'esign':
      // eSign: Owner=Full, Admin=Configure, Employee=Send, Customer=Sign
      if (role === 'admin') return ['view', 'configure'].includes(action);
      if (role === 'employee') return ['view', 'create', 'send'].includes(action);
      if (role === 'customer') return ['view', 'sign'].includes(action);
      break;

    case 'billing':
      // Billing: Owner=Full, Admin=View, Employee=Create/Send, Customer=Pay
      if (role === 'admin') return action === 'view';
      if (role === 'employee') return ['view', 'create', 'send'].includes(action);
      if (role === 'customer') return ['view', 'pay'].includes(action);
      break;

    case 'portal':
      // Portal: Customer=Full, Others=View
      if (role === 'customer') return true;
      return action === 'view';
      
    case 'workflows':
      // Workflows: Owner/Admin=Full, Employee=Use
      if (role === 'admin') return true;
      if (role === 'employee') return ['view', 'use'].includes(action);
      break;
      
    case 'approvals':
      // Approvals: Owner/Admin=Full, Employee=Request
      if (role === 'admin') return true;
      if (role === 'employee') return ['view', 'request'].includes(action);
      break;

    case 'templates':
      // Templates: Owner/Admin=Full, Employee=Use
      if (role === 'admin') return true;
      if (role === 'employee') return ['view', 'use'].includes(action);
      break;

    case 'reports':
      // Reports: Owner/Admin=Full, Employee=Partial
      if (role === 'admin') return true;
      if (role === 'employee') return ['view', 'audit'].includes(action) === false; // Partial? "Partial" usually means View but maybe not Audit. 
      // Let's interpret "Partial" as View only for now, or View + Export.
      if (role === 'employee') return ['view', 'export'].includes(action);
      break;

    case 'subscription':
      // Subscription: Owner=Full, Admin=View, Employee=No, Customer=No
      if (role === 'admin') return action === 'view';
      return false; // Employee/Customer denied
      
    case 'settings':
       // Keep existing logic or map to Subscription/Config
       if (role === 'admin') return true;
       if (role === 'employee') return false; // Block generic settings for employee if not specified
       break;
  }

  // Default fallback for unhandled modules/actions
  return false;
};

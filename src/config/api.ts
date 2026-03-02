/**
 * API Configuration
 * 
 * Centralized configuration for API endpoints.
 * Base URL is determined by environment variables or defaults to '/api'.
 */
const envUrl = import.meta.env.VITE_API_URL as string | undefined;
const normalizedBase =
  envUrl && /^https?:\/\//i.test(envUrl)
    ? envUrl
    : (typeof window !== 'undefined' && window.location.host.includes('localhost')
        ? 'http://localhost:5000/api'
        : '/api');

export const API_CONFIG = {
  baseUrl: normalizedBase,
  timeout: 30000,
};

export const ENDPOINTS = {
  // Auth
  LOGIN: '/auth/login',
  SIGNUP: '/auth/signup',
  LOGOUT: '/auth/logout',
  
  // CRM
  ACCOUNTS: '/crm/accounts',
  CONTACTS: '/crm/contacts',
  LEADS: '/crm/leads',
  OPPORTUNITIES: '/crm/opportunities',
  ACTIVITIES: '/crm/activities',
  
  // CPQ
  PRODUCTS: '/cpq/products',
  QUOTES: '/cpq/quotes',
  
  // CLM
  CONTRACTS: '/clm/contracts',
  CONTRACT_FROM_QUOTE: '/clm/contracts/from-quote',
  TEMPLATES: '/clm/templates',
  CLM_DOCUMENTS: '/clm/documents',
  
  // Docs
  DOCUMENTS: '/docs/documents',
  
  // Sign
  SIGNATURES: '/sign/signatures',
  
  // Portal
  CUSTOMER_QUOTES: '/portal/quotes',
  CUSTOMER_DOCS: '/portal/documents',
  CUSTOMER_SIGN: '/portal/signatures',

  // Payments
  PAYMENTS: '/payments',
};

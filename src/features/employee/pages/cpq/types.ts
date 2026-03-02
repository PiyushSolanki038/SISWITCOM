
export interface Product {
  id: string;
  name: string;
  sku: string;
  description: string;
  pricing_type: 'one_time' | 'monthly' | 'yearly';
  base_price: number;
  currency: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export type QuoteStatus = 'draft' | 'pending_approval' | 'approved' | 'sent' | 'accepted' | 'rejected';

export interface Quote {
  id: string;
  quote_number: string;
  account_id: string;
  opportunity_id?: string | null;
  status: QuoteStatus;
  currency: string;
  subtotal: number;
  discount_total: number;
  tax_total: number;
  grand_total: number;
  valid_until: string;
  created_by: string;
  approved_by?: string | null;
  approved_at?: string | null;
  sent_at?: string | null;
  accepted_at?: string | null;
  rejected_at?: string | null;
  created_at: string;
  updated_at: string;
  // Join fields (frontend convenience)
  items?: QuoteItem[];
  customer_name?: string; // Mapped from account_id for display
}

export interface QuoteItem {
  id: string;
  quote_id: string;
  product_id: string;
  product_name_snapshot: string;
  unit_price: number;
  quantity: number;
  discount_percent: number;
  line_subtotal: number;
  line_total: number;
  created_at: string;
  updated_at: string;
}

export type ApprovalStatus = 'pending' | 'approved' | 'rejected';

export interface QuoteApproval {
  id: string;
  quote_id: string;
  requested_by: string;
  approved_by?: string | null;
  status: ApprovalStatus;
  comment?: string | null;
  created_at: string;
  updated_at: string;
  // Join fields
  quote_number?: string;
  customer_name?: string;
  total_amount?: number;
  discount_percent?: number;
}

export interface QuoteAuditLog {
  id: string;
  quote_id: string;
  action: string;
  performed_by: string;
  metadata: Record<string, unknown>;
  created_at: string;
}

export interface QuoteDocument {
  id: string;
  quote_id: string;
  file_url: string;
  file_type: 'pdf';
  created_at: string;
}

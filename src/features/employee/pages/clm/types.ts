export type ContractStatus = 'draft' | 'in_review' | 'sent_for_signature' | 'signed' | 'active' | 'expired' | 'terminated';
export type ContractRenewalType = 'manual' | 'auto';
export type ContractSignerStatus = 'pending' | 'signed' | 'declined';

export interface Contract {
  id: string;
  contract_number: string;
  name: string;
  account_id: string;
  quote_id?: string | null;
  template_id?: string | null;
  status: ContractStatus;
  start_date: string;
  end_date: string;
  renewal_type: ContractRenewalType;
  contract_value: number;
  owner_id: string;
  created_at: string;
  updated_at: string;
  // Join fields for UI
  customer_name?: string;
  owner_name?: string;
  contract_type?: string;
  content?: string;
  signers?: ContractSigner[];
}

export interface ContractDocument {
  id: string;
  contract_id: string;
  file_url: string;
  version: number;
  uploaded_by: string;
  created_at: string;
}

export interface ContractTemplate {
  id: string;
  name: string;
  contract_type: string;
  content: string;
  version: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  clauses?: ContractClause[];
}

export interface ContractAuditLog {
  id: string;
  contract_id: string;
  action: string;
  performed_by: string;
  metadata: Record<string, unknown>;
  created_at: string;
}

export interface ContractClause {
  id: string;
  templateId: string;
  title: string;
  content: string;
  sortOrder: number;
  required: boolean;
  created_at: string;
  updated_at: string;
}

export interface ContractSigner {
  id: string;
  contract_id: string;
  name: string;
  email: string;
  sign_order: number;
  status: ContractSignerStatus;
  signed_at?: string | null;
}

export interface ContractSignatureRequest {
  id: string;
  contractId: string;
  signerEmail: string;
  signerName: string;
  token: string;
  status: 'sent' | 'viewed' | 'signed' | 'declined';
  createdAt: string;
  updatedAt: string;
  expiresAt?: string;
  contract?: Contract;
}

export interface PublicSignSessionResponse {
  session: ContractSignatureRequest;
  contract: Contract;
}

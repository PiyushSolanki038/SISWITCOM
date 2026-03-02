export type ESignStatus = 'draft' | 'pending' | 'sent' | 'viewed' | 'signed' | 'completed' | 'rejected' | 'expired';

export interface ESignDocument {
  id: string;
  name: string;
  pages: number;
}

export interface ESignSigner {
  order: number;
  name: string;
  email: string;
  role: string;
  status: 'pending' | 'viewed' | 'signed' | 'completed' | 'declined';
  completedAt: string | null;
}

export interface ESignAuditLog {
  id: number;
  action: string;
  user: string;
  timestamp: string;
  ip: string;
  location: string;
}

export interface ESignSender {
  name: string;
  email: string;
}

export interface ESignRequest {
  id: string;
  subject: string;
  status: ESignStatus | string;
  message?: string;
  created: string;
  lastUpdate?: string;
  sender: string | ESignSender;
  recipients?: string[];
  documents?: ESignDocument[];
  signers?: ESignSigner[];
  auditTrail?: ESignAuditLog[];
}

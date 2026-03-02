export interface DocumentLink {
  id: string;
  name: string;
  type: 'Account' | 'Contract' | 'Quote' | 'Opportunity' | 'E-Sign';
}

export interface DocumentVersion {
  version: string;
  date: string;
  author: string;
  comment: string;
  file_url?: string;
}

export interface DocumentAuditLog {
  id: string;
  action: 'upload' | 'view' | 'download' | 'delete' | 'share' | 'version_update' | 'link_added' | 'link_removed';
  user: string;
  timestamp: string;
  details?: string;
}

export interface DocumentItem {
  id: string;
  name: string;
  type: string;
  size: string;
  modified: string;
  created?: string;
  owner: string;
  category: string;
  description?: string;
  tags?: string[];
  currentVersion: string;
  versions?: DocumentVersion[];
  linkedItems?: DocumentLink[];
  auditLogs?: DocumentAuditLog[];
  url?: string;
}

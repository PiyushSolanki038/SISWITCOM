-- Reconcile migration history with current DB state (non-destructive)
-- Adds missing columns/indexes using IF NOT EXISTS to avoid conflicts
BEGIN;

-- User
ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "tenantId" uuid;
CREATE INDEX IF NOT EXISTS "user_tenantId_idx" ON "User" ("tenantId");
CREATE INDEX IF NOT EXISTS "user_tenantId_createdAt_idx" ON "User" ("tenantId","createdAt");

-- Account
CREATE INDEX IF NOT EXISTS "account_tenantId_idx" ON "Account" ("tenantId");
CREATE INDEX IF NOT EXISTS "account_tenantId_createdAt_idx" ON "Account" ("tenantId","createdAt");

-- Contact
CREATE INDEX IF NOT EXISTS "contact_tenantId_idx" ON "Contact" ("tenantId");
CREATE INDEX IF NOT EXISTS "contact_tenantId_createdAt_idx" ON "Contact" ("tenantId","createdAt");

-- Lead
CREATE INDEX IF NOT EXISTS "lead_tenantId_idx" ON "Lead" ("tenantId");
CREATE INDEX IF NOT EXISTS "lead_tenantId_createdAt_idx" ON "Lead" ("tenantId","createdAt");

-- Opportunity
CREATE INDEX IF NOT EXISTS "opportunity_tenantId_idx" ON "Opportunity" ("tenantId");
CREATE INDEX IF NOT EXISTS "opportunity_tenantId_createdAt_idx" ON "Opportunity" ("tenantId","createdAt");

-- Activity
CREATE INDEX IF NOT EXISTS "activity_tenantId_idx" ON "Activity" ("tenantId");
CREATE INDEX IF NOT EXISTS "activity_tenantId_createdAt_idx" ON "Activity" ("tenantId","createdAt");

-- Note
CREATE INDEX IF NOT EXISTS "note_tenantId_idx" ON "Note" ("tenantId");
CREATE INDEX IF NOT EXISTS "note_tenantId_createdAt_idx" ON "Note" ("tenantId","createdAt");

-- Quote
CREATE INDEX IF NOT EXISTS "quote_tenantId_idx" ON "Quote" ("tenantId");

-- QuoteItem
CREATE INDEX IF NOT EXISTS "quoteitem_tenantId_idx" ON "QuoteItem" ("tenantId");

-- QuoteApproval
CREATE INDEX IF NOT EXISTS "quoteapproval_tenantId_idx" ON "QuoteApproval" ("tenantId");

-- Contract
CREATE INDEX IF NOT EXISTS "contract_tenantId_idx" ON "Contract" ("tenantId");

-- ContractSigner
CREATE INDEX IF NOT EXISTS "contractsigner_tenantId_idx" ON "ContractSigner" ("tenantId");

-- ContractTemplate
CREATE INDEX IF NOT EXISTS "contracttemplate_tenantId_idx" ON "ContractTemplate" ("tenantId");
CREATE INDEX IF NOT EXISTS "contracttemplate_tenantId_created_idx" ON "ContractTemplate" ("tenantId","created_at");

-- ContractClause
CREATE INDEX IF NOT EXISTS "contractclause_tenantId_idx" ON "ContractClause" ("tenantId");
CREATE INDEX IF NOT EXISTS "contractclause_tenantId_created_idx" ON "ContractClause" ("tenantId","created_at");

-- ContractApproval
CREATE INDEX IF NOT EXISTS "contractapproval_tenantId_idx" ON "ContractApproval" ("tenantId");
CREATE INDEX IF NOT EXISTS "contractapproval_tenantId_created_idx" ON "ContractApproval" ("tenantId","createdAt");

-- ContractSignatureRequest
CREATE INDEX IF NOT EXISTS "contractsigreq_tenantId_idx" ON "ContractSignatureRequest" ("tenantId");
CREATE INDEX IF NOT EXISTS "contractsigreq_tenantId_created_idx" ON "ContractSignatureRequest" ("tenantId","createdAt");

-- ContractAuditLog
CREATE INDEX IF NOT EXISTS "contractaudit_tenantId_idx" ON "ContractAuditLog" ("tenantId");
CREATE INDEX IF NOT EXISTS "contractaudit_tenantId_created_idx" ON "ContractAuditLog" ("tenantId","created_at");

-- ContractVersion
CREATE INDEX IF NOT EXISTS "contractversion_tenantId_idx" ON "ContractVersion" ("tenantId");
CREATE INDEX IF NOT EXISTS "contractversion_tenantId_created_idx" ON "ContractVersion" ("tenantId","createdAt");

-- ERPOrder
ALTER TABLE "ERPOrder" ADD COLUMN IF NOT EXISTS "tenantId" uuid;
CREATE INDEX IF NOT EXISTS "erporder_tenantId_idx" ON "ERPOrder" ("tenantId");
CREATE INDEX IF NOT EXISTS "erporder_tenantId_created_idx" ON "ERPOrder" ("tenantId","createdAt");

-- Invoice
ALTER TABLE "Invoice" ADD COLUMN IF NOT EXISTS "tenantId" uuid;
CREATE INDEX IF NOT EXISTS "invoice_tenantId_idx" ON "Invoice" ("tenantId");
CREATE INDEX IF NOT EXISTS "invoice_tenantId_created_idx" ON "Invoice" ("tenantId","createdAt");

-- Payment
ALTER TABLE "Payment" ADD COLUMN IF NOT EXISTS "tenantId" uuid;
CREATE INDEX IF NOT EXISTS "payment_tenantId_idx" ON "Payment" ("tenantId");
CREATE INDEX IF NOT EXISTS "payment_tenantId_created_idx" ON "Payment" ("tenantId","createdAt");

-- Subscription
CREATE INDEX IF NOT EXISTS "subscription_tenantId_idx" ON "Subscription" ("tenantId");

-- PaymentTransaction
CREATE INDEX IF NOT EXISTS "paymenttxn_tenantId_idx" ON "PaymentTransaction" ("tenantId");

-- Invitation
CREATE INDEX IF NOT EXISTS "invitation_tenantId_idx" ON "Invitation" ("tenantId");
CREATE INDEX IF NOT EXISTS "invitation_tenantId_created_idx" ON "Invitation" ("tenantId","createdAt");

-- EmailLog
CREATE INDEX IF NOT EXISTS "emaillog_tenantId_idx" ON "EmailLog" ("tenantId");

-- Document
ALTER TABLE "Document" ADD COLUMN IF NOT EXISTS "tenantId" uuid;
CREATE INDEX IF NOT EXISTS "document_tenantId_idx" ON "Document" ("tenantId");
CREATE INDEX IF NOT EXISTS "document_tenantId_created_idx" ON "Document" ("tenantId","createdAt");

-- SigningSession
CREATE INDEX IF NOT EXISTS "signingsession_tenantId_created_idx" ON "SigningSession" ("tenantId","createdAt");

-- PipelineStage
CREATE INDEX IF NOT EXISTS "pipelinestage_tenantId_idx" ON "PipelineStage" ("tenantId");
CREATE INDEX IF NOT EXISTS "pipelinestage_tenantId_created_idx" ON "PipelineStage" ("tenantId","createdAt");

COMMIT;

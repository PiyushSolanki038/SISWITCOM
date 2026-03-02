BEGIN;

-- Ensure tenantId columns exist for backfill on shadow DB
ALTER TABLE "User"                ADD COLUMN IF NOT EXISTS "tenantId" UUID;
ALTER TABLE "Account"             ADD COLUMN IF NOT EXISTS "tenantId" UUID;
ALTER TABLE "Contact"             ADD COLUMN IF NOT EXISTS "tenantId" UUID;
ALTER TABLE "Lead"                ADD COLUMN IF NOT EXISTS "tenantId" UUID;
ALTER TABLE "Opportunity"         ADD COLUMN IF NOT EXISTS "tenantId" UUID;
ALTER TABLE "PipelineStage"       ADD COLUMN IF NOT EXISTS "tenantId" UUID;
ALTER TABLE "Activity"            ADD COLUMN IF NOT EXISTS "tenantId" UUID;
ALTER TABLE "Note"                ADD COLUMN IF NOT EXISTS "tenantId" UUID;
ALTER TABLE "QuoteItem"           ADD COLUMN IF NOT EXISTS "tenantId" UUID;
ALTER TABLE "QuoteApproval"       ADD COLUMN IF NOT EXISTS "tenantId" UUID;
ALTER TABLE "Contract"            ADD COLUMN IF NOT EXISTS "tenantId" UUID;
ALTER TABLE "ContractSigner"      ADD COLUMN IF NOT EXISTS "tenantId" UUID;
ALTER TABLE "ContractApproval"    ADD COLUMN IF NOT EXISTS "tenantId" UUID;
ALTER TABLE "ContractSignatureRequest" ADD COLUMN IF NOT EXISTS "tenantId" UUID;
ALTER TABLE "ContractAuditLog"    ADD COLUMN IF NOT EXISTS "tenantId" UUID;
ALTER TABLE "ContractVersion"     ADD COLUMN IF NOT EXISTS "tenantId" UUID;
ALTER TABLE "ERPOrder"            ADD COLUMN IF NOT EXISTS "tenantId" UUID;
ALTER TABLE "Invoice"             ADD COLUMN IF NOT EXISTS "tenantId" UUID;
ALTER TABLE "Payment"             ADD COLUMN IF NOT EXISTS "tenantId" UUID;
ALTER TABLE "Subscription"        ADD COLUMN IF NOT EXISTS "tenantId" UUID;
ALTER TABLE "PaymentTransaction"  ADD COLUMN IF NOT EXISTS "tenantId" UUID;
ALTER TABLE "Document"            ADD COLUMN IF NOT EXISTS "tenantId" UUID;

-- Users: each workspace uses owner's id as tenant root
UPDATE "User" SET "tenantId" = COALESCE("tenantId", "id") WHERE "tenantId" IS NULL;

-- Accounts: derive from creator's tenant
UPDATE "Account" a SET "tenantId" = COALESCE(a."tenantId",
  (SELECT u."tenantId" FROM "User" u WHERE u."id" = a."createdById")
) WHERE a."tenantId" IS NULL;

-- Contacts: prefer account tenant, fallback to creator
UPDATE "Contact" c SET "tenantId" = COALESCE(c."tenantId",
  (SELECT a."tenantId" FROM "Account" a WHERE a."id" = c."accountId"),
  (SELECT u."tenantId" FROM "User" u WHERE u."id" = c."createdById")
) WHERE c."tenantId" IS NULL;

-- Leads: derive from account/contact/owner hierarchy
UPDATE "Lead" l SET "tenantId" = COALESCE(l."tenantId",
  (SELECT a."tenantId" FROM "Account" a WHERE a."id" = l."accountId"),
  (SELECT c."tenantId" FROM "Contact" c WHERE c."id" = l."contactId"),
  (SELECT u."tenantId" FROM "User" u WHERE u."id" = l."ownerId")
) WHERE l."tenantId" IS NULL;

-- Opportunities: derive from account/contact/lead/owner
UPDATE "Opportunity" o SET "tenantId" = COALESCE(o."tenantId",
  (SELECT a."tenantId" FROM "Account" a WHERE a."id" = o."accountId"),
  (SELECT c."tenantId" FROM "Contact" c WHERE c."id" = o."contactId"),
  (SELECT l."tenantId" FROM "Lead" l WHERE l."id" = o."leadId"),
  (SELECT u."tenantId" FROM "User" u WHERE u."id" = o."ownerId")
) WHERE o."tenantId" IS NULL;

-- PipelineStage: infer from any associated opportunity
UPDATE "PipelineStage" ps SET "tenantId" = COALESCE(ps."tenantId",
  (SELECT o."tenantId" FROM "Opportunity" o WHERE o."pipelineStageId" = ps."id" LIMIT 1)
) WHERE ps."tenantId" IS NULL;

-- Activities: derive from linked entities or actor
UPDATE "Activity" a SET "tenantId" = COALESCE(a."tenantId",
  (SELECT ac."tenantId" FROM "Account" ac WHERE ac."id" = a."accountId"),
  (SELECT c."tenantId" FROM "Contact" c WHERE c."id" = a."contactId"),
  (SELECT l."tenantId" FROM "Lead" l WHERE l."id" = a."leadId"),
  (SELECT o."tenantId" FROM "Opportunity" o WHERE o."id" = a."opportunityId"),
  (SELECT u."tenantId" FROM "User" u WHERE u."id" = a."userId")
) WHERE a."tenantId" IS NULL;

-- Notes: derive from linked entities or author
UPDATE "Note" n SET "tenantId" = COALESCE(n."tenantId",
  (SELECT ac."tenantId" FROM "Account" ac WHERE ac."id" = n."accountId"),
  (SELECT c."tenantId" FROM "Contact" c WHERE c."id" = n."contactId"),
  (SELECT l."tenantId" FROM "Lead" l WHERE l."id" = n."leadId"),
  (SELECT o."tenantId" FROM "Opportunity" o WHERE o."id" = n."opportunityId"),
  (SELECT u."tenantId" FROM "User" u WHERE u."id" = n."userId")
) WHERE n."tenantId" IS NULL;

-- QuoteItem: from parent quote
UPDATE "QuoteItem" qi SET "tenantId" = COALESCE(qi."tenantId",
  (SELECT q."tenantId" FROM "Quote" q WHERE q."id" = qi."quoteId")
) WHERE qi."tenantId" IS NULL;

-- QuoteApproval: from parent quote
UPDATE "QuoteApproval" qa SET "tenantId" = COALESCE(qa."tenantId",
  (SELECT q."tenantId" FROM "Quote" q WHERE q."id" = qa."quoteId")
) WHERE qa."tenantId" IS NULL;

-- Contracts: from account/quote/opportunity/creator
UPDATE "Contract" c SET "tenantId" = COALESCE(c."tenantId",
  (SELECT ac."tenantId" FROM "Account" ac WHERE ac."id" = c."account_id"),
  (SELECT q."tenantId" FROM "Quote" q WHERE q."id" = c."quote_id"),
  (SELECT o."tenantId" FROM "Opportunity" o WHERE o."id" = c."opportunityId"),
  (SELECT u."tenantId" FROM "User" u WHERE u."id" = c."createdById")
) WHERE c."tenantId" IS NULL;

-- ContractSigner: from contract
UPDATE "ContractSigner" cs SET "tenantId" = COALESCE(cs."tenantId",
  (SELECT c."tenantId" FROM "Contract" c WHERE c."id" = cs."contractId")
) WHERE cs."tenantId" IS NULL;

-- ContractApproval: from contract
UPDATE "ContractApproval" ca SET "tenantId" = COALESCE(ca."tenantId",
  (SELECT c."tenantId" FROM "Contract" c WHERE c."id" = ca."contractId")
) WHERE ca."tenantId" IS NULL;

-- ContractSignatureRequest: from contract
UPDATE "ContractSignatureRequest" sr SET "tenantId" = COALESCE(sr."tenantId",
  (SELECT c."tenantId" FROM "Contract" c WHERE c."id" = sr."contractId")
) WHERE sr."tenantId" IS NULL;

-- ContractAuditLog: from contract
UPDATE "ContractAuditLog" al SET "tenantId" = COALESCE(al."tenantId",
  (SELECT c."tenantId" FROM "Contract" c WHERE c."id" = al."contractId")
) WHERE al."tenantId" IS NULL;

-- ContractVersion: from contract
UPDATE "ContractVersion" cv SET "tenantId" = COALESCE(cv."tenantId",
  (SELECT c."tenantId" FROM "Contract" c WHERE c."id" = cv."contractId")
) WHERE cv."tenantId" IS NULL;

-- ERPOrder: from account/quote/contract/creator
UPDATE "ERPOrder" o SET "tenantId" = COALESCE(o."tenantId",
  (SELECT ac."tenantId" FROM "Account" ac WHERE ac."id" = o."accountId"),
  (SELECT q."tenantId" FROM "Quote" q WHERE q."id" = o."quoteId"),
  (SELECT c."tenantId" FROM "Contract" c WHERE c."id" = o."contractId"),
  (SELECT u."tenantId" FROM "User" u WHERE u."id" = o."createdById")
) WHERE o."tenantId" IS NULL;

-- Invoice: from order/account
UPDATE "Invoice" i SET "tenantId" = COALESCE(i."tenantId",
  (SELECT o."tenantId" FROM "ERPOrder" o WHERE o."id" = i."orderId"),
  (SELECT ac."tenantId" FROM "Account" ac WHERE ac."id" = i."accountId")
) WHERE i."tenantId" IS NULL;

-- Payment: from invoice or customer
UPDATE "Payment" p SET "tenantId" = COALESCE(p."tenantId",
  (SELECT i."tenantId" FROM "Invoice" i WHERE i."id" = p."invoiceId"),
  (SELECT u."tenantId" FROM "User" u WHERE u."id" = p."customerId")
) WHERE p."tenantId" IS NULL;

-- Subscription: from user
UPDATE "Subscription" s SET "tenantId" = COALESCE(s."tenantId",
  (SELECT u."tenantId" FROM "User" u WHERE u."id" = s."userId")
) WHERE s."tenantId" IS NULL;

-- PaymentTransaction: from subscription or user
UPDATE "PaymentTransaction" pt SET "tenantId" = COALESCE(pt."tenantId",
  (SELECT s."tenantId" FROM "Subscription" s WHERE s."id" = pt."subscriptionId"),
  (SELECT u."tenantId" FROM "User" u WHERE u."id" = pt."userId")
) WHERE pt."tenantId" IS NULL;

-- Document: from linked entities or uploader
UPDATE "Document" d SET "tenantId" = COALESCE(d."tenantId",
  (SELECT ac."tenantId" FROM "Account" ac WHERE ac."id" = d."accountId"),
  (SELECT q."tenantId" FROM "Quote" q WHERE q."id" = d."quoteId"),
  (SELECT c."tenantId" FROM "Contract" c WHERE c."id" = d."contractId"),
  (SELECT i."tenantId" FROM "Invoice" i WHERE i."id" = d."invoiceId"),
  (SELECT o."tenantId" FROM "ERPOrder" o WHERE o."id" = d."orderId"),
  (SELECT u."tenantId" FROM "User" u WHERE u."id" = d."userId")
) WHERE d."tenantId" IS NULL;

COMMIT;

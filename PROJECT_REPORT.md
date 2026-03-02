# Sirius Infra - Employee Dashboard Project Report

## 1. Project Overview
This project is a comprehensive **Employee Dashboard** for Sirius Infra, designed to manage the entire business lifecycle. It integrates five core modules: **CRM** (Customer Relationship Management), **CPQ** (Configure, Price, Quote), **CLM** (Contract Lifecycle Management), **Docs** (Document Management), and **E-Sign** (Electronic Signatures).

The architecture follows a **Feature-Based** structure, where each module is self-contained with its own List and Detail views.

---

## 2. Module Workflows

### 2.1 CRM (Customer Relationship Management)
**Goal:** Manage relationships from initial lead to closed deal.
1.  **Lead Generation:** New potential clients are added as **Leads**.
2.  **Qualification:** Leads are nurtured and converted into **Contacts** (people) and **Accounts** (companies).
3.  **Opportunity Management:** Deals are tracked as **Opportunities** through stages (Discovery -> Proposal -> Negotiation -> Closed).
4.  **Activity Tracking:** Every call, meeting, and email is logged in **Activities** and **Notes** to maintain a history of interactions.

### 2.2 CPQ (Configure, Price, Quote)
**Goal:** Generate accurate sales quotes for products.
1.  **Product Catalog:** **Products** define the items available for sale with standard pricing.
2.  **Quote Creation:** Sales reps create a **Quote** for an Opportunity, adding line items from the Product Catalog.
3.  **Approval:** Quotes go through a status workflow (Draft -> Pending Approval -> Approved).
4.  **Output:** Approved quotes are sent to the customer (often leading to a Contract).

### 2.3 CLM (Contract Lifecycle Management)
**Goal:** Manage legal agreements efficiently.
1.  **Template Creation:** Legal teams create standard **Templates** (e.g., NDA, MSA) with variables.
2.  **Drafting:** A **Contract** is generated from a template or uploaded.
3.  **Negotiation:** The contract moves through stages (Draft -> Internal Review -> Negotiation).
4.  **Finalization:** Once agreed, the contract is marked as ready for signature.

### 2.4 Docs (Document Management)
**Goal:** Centralized repository for all business files.
1.  **Organization:** Files are uploaded and categorized (Reports, Contracts, Marketing).
2.  **Search & Filter:** Users find documents via global search or category filters.
3.  **Versioning:** Important documents track version history (v1.0, v1.1) to preserve audit trails.
4.  **Linking:** Documents can be linked to other records (e.g., a Quote linked to a Contract).

### 2.5 E-Sign (Electronic Signatures)
**Goal:** Securely execute documents digitally.
1.  **Request:** A user creates an **E-Sign Request**, attaching documents and defining **Signers** (and their signing order).
2.  **Notification:** Signers receive a link to the secure signing page.
3.  **Execution (Public):** Signers access the **Public Signer Page**, review terms, and sign (draw or type).
4.  **Completion:** Once all parties sign, the request is "Completed," and an **Audit Trail** logs every action (IP, Time, User).

---

## 3. File Structure & Descriptions

The project is located in `src/features/employee/pages`. Below is the detailed breakdown of every file.

### 3.1 CRM Module (`/crm`)
*   **`Overview.tsx`**
    *   **Purpose:** The landing page for CRM.
    *   **Content:** High-level metrics (Total Revenue, Win Rate), charts, and recent activity summaries.
*   **`Leads.tsx`**
    *   **Purpose:** List view for Leads.
    *   **Content:** Table of potential clients with status filters (New, Contacted, Qualified).
*   **`LeadDetail.tsx`**
    *   **Purpose:** Detailed workspace for a single Lead.
    *   **Content:** Lead info, conversion actions, and timeline of interactions.
*   **`Contacts.tsx`**
    *   **Purpose:** List view for Contacts.
    *   **Content:** Directory of individuals (names, phones, emails) linked to Accounts.
*   **`ContactDetail.tsx`**
    *   **Purpose:** Detailed profile of a person.
    *   **Content:** Personal details, communication history, and related Opportunities.
*   **`Accounts.tsx`**
    *   **Purpose:** List view for Accounts (Companies).
    *   **Content:** Directory of business entities with industry and tier filters.
*   **`AccountDetail.tsx`**
    *   **Purpose:** 360-degree view of a company.
    *   **Content:** Company hierarchy, related contacts, active opportunities, and contract history.
*   **`Opportunities.tsx`**
    *   **Purpose:** Pipeline view of active deals.
    *   **Content:** Kanban board or List view of deals grouped by sales stage.
*   **`OpportunityDetail.tsx`**
    *   **Purpose:** Command center for a specific deal.
    *   **Content:** Deal value, stage progression, quotes, and competitors.
*   **`Activities.tsx`**
    *   **Purpose:** Global calendar/list of tasks.
    *   **Content:** Upcoming meetings, calls, and to-dos across all accounts.
*   **`ActivityDetail.tsx`**
    *   **Purpose:** Specifics of a single task.
    *   **Content:** Meeting notes, attendees, and outcomes.
*   **`Notes.tsx`**
    *   **Purpose:** Repository of internal notes.
    *   **Content:** Searchable list of quick thoughts or meeting minutes.
*   **`NoteDetail.tsx`**
    *   **Purpose:** Editor for a specific note.
    *   **Content:** Rich text content, author info, and related entity links.

### 3.2 CPQ Module (`/cpq`)
*   **`Products.tsx`**
    *   **Purpose:** Product Catalog.
    *   **Content:** List of sellable items with SKUs, prices, and categories.
*   **`Quotes.tsx`**
    *   **Purpose:** List of Sales Quotes.
    *   **Content:** Table of quotes tracking total value and approval status.
*   **`QuoteDetail.tsx`**
    *   **Purpose:** Quote Builder/Viewer.
    *   **Content:** Line items editor, discount calculations, and approval workflow actions.
*   **`CreateQuote.tsx`**
    *   **Purpose:** Quote Creation Wizard.
    *   **Content:** Form to select customer, add products, set quantities/discounts, and submit for approval.
*   **`QuoteApprovals.tsx`**
    *   **Purpose:** Approval Dashboard.
    *   **Content:** Interface for managers to review, approve, or reject quotes with high discounts.

### 3.3 CLM Module (`/clm`)
*   **`Contracts.tsx`**
    *   **Purpose:** Repository of legal agreements.
    *   **Content:** List of contracts with status (Draft, Active, Expiring) and value.
*   **`ContractDetail.tsx`**
    *   **Purpose:** Contract workspace.
    *   **Content:** Metadata, clause viewing, and lifecycle stage management.
*   **`Templates.tsx`**
    *   **Purpose:** Library of legal templates.
    *   **Content:** Standardized document templates (NDA, MSA) used to generate contracts.
*   **`TemplateDetail.tsx`**
    *   **Purpose:** Template Editor.
    *   **Content:** Content editor for template text, variable placeholders, and usage permissions.

### 3.4 Docs Module (`/docs`)
*   **`DocumentList.tsx`**
    *   **Purpose:** Main file explorer.
    *   **Content:** Grid/List view of files, category filters, and search.
*   **`DocumentViewer.tsx`**
    *   **Purpose:** File previewer.
    *   **Content:** Document preview pane, metadata sidebars, version history, and linked item tabs.

### 3.5 E-Sign Module (`/esign`)
*   **`ESignRequests.tsx`**
    *   **Purpose:** Dashboard for signature requests.
    *   **Content:** Tabs for Pending, Completed, Rejected requests with status badges.
*   **`ESignDetail.tsx`**
    *   **Purpose:** Request management hub.
    *   **Content:** Signer status tracking, document list, and comprehensive Audit Trail.
*   **`PublicSigner.tsx`**
    *   **Purpose:** External-facing signing interface.
    *   **Content:** Secure page for customers to review documents and draw/type their signature without logging in.

### 3.6 Core Application Files
*   **`src/routes/AppRoutes.tsx`**
    *   **Purpose:** Central routing configuration.
    *   **Content:** Maps URLs (e.g., `/employee-dashboard/crm/leads`) to the React components listed above.
*   **`src/features/employee/components/Sidebar.tsx`**
    *   **Purpose:** Main navigation menu.
    *   **Content:** Links to all modules, ensuring easy access to every part of the system.
*   **`src/features/employee/layouts/EmployeeLayout.tsx`**
    *   **Purpose:** Main layout wrapper.
    *   **Content:** Contains the Sidebar, Header, and the main content area (`<Outlet />`).

---

## 4. Database Schemas

### 4.1 CPQ Schema (Official)
This minimal, production-ready schema supports the full CPQ workflow: Products → Quotes → Line Items → Approval → Locked Quote.

#### **1. products**
Defines what the company sells.
- **id** (uuid, pk)
- **name** (varchar)
- **sku** (varchar, unique)
- **description** (text)
- **pricing_type** (enum: one_time, monthly, yearly)
- **base_price** (decimal)
- **currency** (varchar)
- **is_active** (boolean)
- **created_at** (timestamp)
- **updated_at** (timestamp)

#### **2. quotes**
Represents one commercial offer to a customer.
- **id** (uuid, pk)
- **quote_number** (varchar, unique)
- **account_id** (uuid)
- **opportunity_id** (uuid, nullable)
- **status** (enum: draft, pending_approval, approved, sent, accepted, rejected)
- **currency** (varchar)
- **subtotal** (decimal)
- **discount_total** (decimal)
- **tax_total** (decimal)
- **grand_total** (decimal)
- **valid_until** (date)
- **created_by** (uuid)
- **approved_by** (uuid, nullable)
- **approved_at** (timestamp, nullable)
- **sent_at** (timestamp, nullable)
- **accepted_at** (timestamp, nullable)
- **rejected_at** (timestamp, nullable)
- **created_at** (timestamp)
- **updated_at** (timestamp)

**Rules:**
- Only `draft` is editable.
- `approved` → price locked.
- `accepted` → permanently locked.

#### **3. quote_items**
Line items inside a quote.
- **id** (uuid, pk)
- **quote_id** (uuid, fk → quotes.id)
- **product_id** (uuid, fk → products.id)
- **product_name_snapshot** (varchar) - *Preserves historical product name*
- **unit_price** (decimal)
- **quantity** (integer)
- **discount_percent** (decimal)
- **line_subtotal** (decimal)
- **line_total** (decimal)
- **created_at** (timestamp)
- **updated_at** (timestamp)

#### **4. quote_approvals**
Tracks approval flow.
- **id** (uuid, pk)
- **quote_id** (uuid, fk → quotes.id)
- **requested_by** (uuid)
- **approved_by** (uuid, nullable)
- **status** (enum: pending, approved, rejected)
- **comment** (text, nullable)
- **created_at** (timestamp)
- **updated_at** (timestamp)

#### **5. quote_audit_logs**
Tracks who did what for compliance.
- **id** (uuid, pk)
- **quote_id** (uuid, fk → quotes.id)
- **action** (varchar: QUOTE_CREATED, ITEM_ADDED, DISCOUNT_CHANGED, SENT_TO_CUSTOMER, APPROVED, ACCEPTED)
- **performed_by** (uuid)
- **metadata** (jsonb)
- **created_at** (timestamp)

#### **6. quote_documents** (Optional)
Generated PDFs / files.
- **id** (uuid, pk)
- **quote_id** (uuid, fk → quotes.id)
- **file_url** (text)
- **file_type** (enum: pdf)
- **created_at** (timestamp)

#### **Relationships**
- products 1 ──── * quote_items
- quotes 1 ──── * quote_items
- quotes 1 ──── 1 quote_approvals
- quotes 1 ──── * quote_audit_logs
- quotes 1 ──── * quote_documents

### 4.2 CLM Schema (Official)
The industry-standard schema for Contract Lifecycle Management.

#### **1. contracts**
Core contract record.
- **id** (uuid, pk)
- **contract_number** (varchar, unique)
- **name** (varchar)
- **account_id** (uuid)
- **quote_id** (uuid, nullable)
- **template_id** (uuid, nullable)
- **status** (enum: draft, in_review, sent_for_signature, signed, active, expired, terminated)
- **start_date** (date)
- **end_date** (date)
- **renewal_type** (enum: manual, auto)
- **contract_value** (decimal)
- **owner_id** (uuid)
- **created_at** (timestamp)
- **updated_at** (timestamp)

#### **2. contract_documents**
Versioning support for contract files.
- **id** (uuid, pk)
- **contract_id** (uuid)
- **file_url** (text)
- **version** (integer)
- **uploaded_by** (uuid)
- **created_at** (timestamp)

#### **3. contract_templates**
Reusable contract templates.
- **id** (uuid, pk)
- **name** (varchar)
- **contract_type** (varchar)
- **content** (text)
- **version** (integer)
- **is_active** (boolean)
- **created_at** (timestamp)
- **updated_at** (timestamp)

#### **4. contract_audit_logs**
Compliance and history tracking.
- **id** (uuid, pk)
- **contract_id** (uuid)
- **action** (varchar: CREATED, REVIEWED, SENT_FOR_SIGNATURE, SIGNED, ACTIVATED, EXPIRED)
- **performed_by** (uuid)
- **metadata** (jsonb)
- **created_at** (timestamp)

#### **5. contract_signers**
Signer tracking for E-Sign integration.
- **id** (uuid, pk)
- **contract_id** (uuid)
- **name** (varchar)
- **email** (varchar)
- **sign_order** (integer)
- **status** (enum: pending, signed, declined)
- **signed_at** (timestamp, nullable)

### 4.3 Docs Schema (Official)
Centralized document management system.

#### **1. documents**
Metadata for all files.
- **id** (uuid, pk)
- **name** (varchar)
- **type** (varchar: pdf, docx, etc.)
- **size** (integer)
- **owner_id** (uuid)
- **category** (varchar)
- **description** (text)
- **created_at** (timestamp)
- **updated_at** (timestamp)

#### **2. document_versions**
Version history for documents.
- **id** (uuid, pk)
- **document_id** (uuid, fk → documents.id)
- **version** (varchar)
- **file_url** (text)
- **uploaded_by** (uuid)
- **comment** (text)
- **created_at** (timestamp)

#### **3. document_links**
Associations between documents and other entities.
- **id** (uuid, pk)
- **document_id** (uuid, fk → documents.id)
- **entity_type** (varchar: Quote, Contract, Opportunity)
- **entity_id** (uuid)
- **created_at** (timestamp)

### 4.4 E-Sign Schema (Official)
Electronic signature request and execution tracking.

#### **1. esign_requests**
The envelope containing documents to be signed.
- **id** (uuid, pk)
- **subject** (varchar)
- **message** (text)
- **status** (enum: pending, completed, rejected, expired)
- **sender_id** (uuid)
- **created_at** (timestamp)
- **updated_at** (timestamp)

#### **2. esign_documents**
Documents included in the request.
- **id** (uuid, pk)
- **request_id** (uuid, fk → esign_requests.id)
- **name** (varchar)
- **file_url** (text)
- **pages** (integer)
- **created_at** (timestamp)

#### **3. esign_signers**
Parties required to sign.
- **id** (uuid, pk)
- **request_id** (uuid, fk → esign_requests.id)
- **name** (varchar)
- **email** (varchar)
- **role** (varchar: Signer, Viewer)
- **sign_order** (integer)
- **status** (enum: pending, viewed, signed, declined)
- **signed_at** (timestamp, nullable)

#### **4. esign_audit_logs**
Legal audit trail of all actions.
- **id** (uuid, pk)
- **request_id** (uuid, fk → esign_requests.id)
- **action** (varchar: CREATED, VIEWED, SIGNED, COMPLETED)
- **performed_by** (varchar)
- **ip_address** (varchar)
- **location** (varchar)
- **timestamp** (timestamp)

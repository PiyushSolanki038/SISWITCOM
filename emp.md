# Employee Module (src/features/employee)

## Overview
- Role-focused workspace for employees: CRM, CPQ, CLM, Documents, E‑Sign, ERP
- Includes layout, sidebar navigation, pages, and service utilities
- Frontend runs on http://localhost:8080 with routes under `/employee-dashboard/*`

## Folder Structure
```
src/features/employee/
├─ layouts/
│  └─ EmployeeLayout.tsx
├─ components/
│  └─ Sidebar.tsx
├─ pages/
│  ├─ Dashboard.tsx
│  ├─ Profile.tsx
│  ├─ Settings.tsx
│  ├─ Attendance.tsx
│  ├─ crm/
│  │  ├─ Overview.tsx
│  │  ├─ Leads.tsx
│  │  ├─ LeadDetail.tsx
│  │  ├─ Contacts.tsx
│  │  ├─ ContactDetail.tsx
│  │  ├─ Accounts.tsx
│  │  ├─ AccountDetail.tsx
│  │  ├─ Opportunities.tsx
│  │  ├─ OpportunityDetail.tsx
│  │  ├─ Activities.tsx
│  │  ├─ ActivityDetail.tsx
│  │  ├─ Notes.tsx
│  │  ├─ NoteDetail.tsx
│  │  └─ types.ts
│  ├─ cpq/
│  │  ├─ Quotes.tsx
│  │  ├─ QuoteDetail.tsx
│  │  ├─ CreateQuote.tsx
│  │  ├─ QuoteApprovals.tsx
│  │  ├─ Products.tsx
│  │  ├─ ProductDetail.tsx
│  │  └─ types.ts
│  ├─ clm/
│  │  ├─ Contracts.tsx
│  │  ├─ ContractDetail.tsx
│  │  ├─ CreateContract.tsx
│  │  ├─ Templates.tsx
│  │  ├─ TemplateDetail.tsx
│  │  ├─ Signatures.tsx
│  │  ├─ Renewals.tsx
│  │  └─ types.ts
│  ├─ docs/
│  │  ├─ DocumentList.tsx
│  │  ├─ DocumentViewer.tsx
│  │  └─ types.ts
│  ├─ esign/
│  │  ├─ ESignRequests.tsx
│  │  ├─ ESignDetail.tsx
│  │  └─ types.ts
│  └─ sign/
│     ├─ Send.tsx
│     ├─ Execute.tsx
│     └─ Complete.tsx
├─ services/
│  ├─ crmService.ts
│  ├─ cpqService.ts
│  ├─ clmService.ts
│  └─ documentService.ts
└─ erp/
   ├─ Orders.tsx
   ├─ Invoices.tsx
   ├─ Payments.tsx
   ├─ CreditNotes.tsx
   ├─ Fulfillment.tsx
   ├─ Inventory.tsx
   ├─ Revenue.tsx
   └─ types.ts
```

## Layout and Navigation
- Layout [EmployeeLayout.tsx](file:///c:/Users/Piyus/OneDrive/Desktop/SISWIT/src/features/employee/layouts/EmployeeLayout.tsx)
  - Fixed desktop sidebar, mobile sheet sidebar toggle
  - Header for large screens
  - Renders child pages via Outlet
- Sidebar [Sidebar.tsx](file:///c:/Users/Piyus/OneDrive/Desktop/SISWIT/src/features/employee/components/Sidebar.tsx)
  - Groups: Work (CRM, CPQ, CLM, Docs, E‑Sign) and Account (Profile, Settings)
  - Collapsible submenus with active highlighting
  - Links to pages under `/employee-dashboard/*`

## Top-Level Pages
- Dashboard [Dashboard.tsx](file:///c:/Users/Piyus/OneDrive/Desktop/SISWIT/src/features/employee/pages/Dashboard.tsx)
  - Buttons: New Quote, New Contract, View All Tasks, View All Documents
  - KPI cards: Total Leads, Active Quotes, Contracts, Recent Docs
  - Pipeline Overview (stage bars); Tabs: Quotes, Contracts, Docs
- Profile [Profile.tsx](file:///c:/Users/Piyus/OneDrive/Desktop/SISWIT/src/features/employee/pages/Profile.tsx)
  - Buttons: Change Photo, Save Changes
  - Editable fields: First/Last name, Email (read-only), Role (read-only), Bio
  - Avatar display with initials fallback
- Settings [Settings.tsx](file:///c:/Users/Piyus/OneDrive/Desktop/SISWIT/src/features/employee/pages/Settings.tsx)
  - Toggles: Email, Push, Marketing notifications; Dark mode
  - Buttons: Enable 2FA, Update Password
- Attendance [Attendance.tsx](file:///c:/Users/Piyus/OneDrive/Desktop/SISWIT/src/features/employee/pages/Attendance.tsx)
  - Button: Mark Attendance
  - List: My Attendance rows with date and check‑in time
  - Calls backend: `POST /api/attendance/check-in`, `GET /api/attendance/my`

## CRM
- Overview, Leads, LeadDetail, Contacts, ContactDetail, Accounts, AccountDetail, Opportunities, OpportunityDetail, Activities, ActivityDetail, Notes, NoteDetail
- Common UI
  - Tables with search and filters
  - Row click navigations to detail pages
  - Badges for status/stage
- Types [crm/types.ts](file:///c:/Users/Piyus/OneDrive/Desktop/SISWIT/src/features/employee/pages/crm/types.ts)

## CPQ
- Quotes [Quotes.tsx](file:///c:/Users/Piyus/OneDrive/Desktop/SISWIT/src/features/employee/pages/cpq/Quotes.tsx)
  - Buttons: Create Quote, Filter
  - Table: Quote Number, Customer, Total, Status, Created By/Date
  - Row menu: View Quote, Duplicate
- QuoteDetail, CreateQuote, QuoteApprovals
  - Forms and approval views with status badges and actions
- Products, ProductDetail
  - Catalog and product detail pages with table and filters
- Types [cpq/types.ts](file:///c:/Users/Piyus/OneDrive/Desktop/SISWIT/src/features/employee/pages/cpq/types.ts)

## CLM
- Contracts, ContractDetail, CreateContract
  - Buttons: Create Contract; detail view shows metadata and actions
- Templates, TemplateDetail
  - Template picker and editor scaffold
- Signatures, Renewals
  - Signature tracking and renewal schedule lists
- Types [clm/types.ts](file:///c:/Users/Piyus/OneDrive/Desktop/SISWIT/src/features/employee/pages/clm/types.ts)

## Documents
- Document List [DocumentList.tsx](file:///c:/Users/Piyus/OneDrive/Desktop/SISWIT/src/features/employee/pages/docs/DocumentList.tsx)
  - Buttons: New Folder, Upload Document
  - Dialog: Upload file with fields Name, Category, Link to Record
  - Controls: Search, Filter menu, Toggle view (list/grid)
  - Table/Grid: Name, Linked To, Category, Version, Modified, Owner
  - Row menu: Download, Share, Delete
- Document Viewer [DocumentViewer.tsx](file:///c:/Users/Piyus/OneDrive/Desktop/SISWIT/src/features/employee/pages/docs/DocumentViewer.tsx)
  - Preview pane with metadata and versioning scaffold
- Types [docs/types.ts](file:///c:/Users/Piyus/OneDrive/Desktop/SISWIT/src/features/employee/pages/docs/types.ts)

## E‑Sign
- Requests [ESignRequests.tsx](file:///c:/Users/Piyus/OneDrive/Desktop/SISWIT/src/features/employee/pages/esign/ESignRequests.tsx)
  - List of signature requests; status badges; quick actions
- Detail [ESignDetail.tsx](file:///c:/Users/Piyus/OneDrive/Desktop/SISWIT/src/features/employee/pages/esign/ESignDetail.tsx)
  - Detailed signing steps and timeline
- Public Signer [PublicSigner.tsx](file:///c:/Users/Piyus/OneDrive/Desktop/SISWIT/src/features/employee/pages/esign/PublicSigner.tsx)
  - Public signing endpoint page for recipients
- Types [esign/types.ts](file:///c:/Users/Piyus/OneDrive/Desktop/SISWIT/src/features/employee/pages/esign/types.ts)

## Sign (Workflow)
- Send [sign/Send.tsx](file:///c:/Users/Piyus/OneDrive/Desktop/SISWIT/src/features/employee/pages/sign/Send.tsx)
  - Compose and send sign requests
- Execute [sign/Execute.tsx](file:///c:/Users/Piyus/OneDrive/Desktop/SISWIT/src/features/employee/pages/sign/Execute.tsx)
  - In‑app signer execution UI
- Complete [sign/Complete.tsx](file:///c:/Users/Piyus/OneDrive/Desktop/SISWIT/src/features/employee/pages/sign/Complete.tsx)
  - Success view with details and next actions

## ERP
- Orders, Invoices, Payments, CreditNotes, Fulfillment, Inventory, Revenue
  - Tables with totals, currency, statuses, and navigation to records
  - Utility types in [erp/types.ts](file:///c:/Users/Piyus/OneDrive/Desktop/SISWIT/src/features/employee/erp/types.ts)

## Services
- CRM [services/crmService.ts](file:///c:/Users/Piyus/OneDrive/Desktop/SISWIT/src/features/employee/services/crmService.ts)
- CPQ [services/cpqService.ts](file:///c:/Users/Piyus/OneDrive/Desktop/SISWIT/src/features/employee/services/cpqService.ts)
- CLM [services/clmService.ts](file:///c:/Users/Piyus/OneDrive/Desktop/SISWIT/src/features/employee/services/clmService.ts)
- Docs [services/documentService.ts](file:///c:/Users/Piyus/OneDrive/Desktop/SISWIT/src/features/employee/services/documentService.ts)
  - Provides mock/data-fetch utilities; errors surface via toast where used

## Routes
- Base: `/employee-dashboard`
- Key entries:
  - `/employee-dashboard` dashboard
  - `/employee-dashboard/profile`, `/employee-dashboard/settings`, `/employee-dashboard/attendance`
  - CRM: `/employee-dashboard/crm/*`
  - CPQ: `/employee-dashboard/cpq/*`
  - CLM: `/employee-dashboard/clm/*`
  - Docs: `/employee-dashboard/docs/*`
  - E‑Sign: `/employee-dashboard/esign/*`

## Notes
- Buttons and interactions primarily use shadcn/ui components
- Data shown in many pages is mock/UI‑scaffold; backend wiring is incremental
- Auth and role guard ensure employees have access to these routes


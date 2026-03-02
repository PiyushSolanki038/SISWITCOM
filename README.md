# SISWIT (Sirius Infra) – Quote‑to‑Cash Platform

Repository: [https://github.com/PiyushSolanki038/SISWITCOM.git](https://github.com/PiyushSolanki038/SISWITCOM.git)

SISWIT is a full‑stack, multi‑tenant Quote‑to‑Cash platform that unifies CRM, CPQ, CLM, ERP, e‑Sign, Documents, and Subscription Management into a single workflow. It is designed for teams to move from lead to revenue with auditable trails, role‑based access, and a clean, modern UI.

## Overview
- CRM: Accounts, Contacts, Leads, Activities, Opportunities with pipeline stages and notes.
- CPQ: Product catalog, quote builder, approvals, and “From Quote” contract creation.
- CLM: Templates, versioning, contract generation, signer flows, and audit logs.
- ERP: Orders, invoices, payments, fulfillment, and revenue tracking.
- Documents: Centralized repository with metadata and file uploads, linked to records.
- Subscriptions: Plans, payment records, and customer portal access control.
- Multi‑Tenancy & RBAC: Tenant isolation enforced at the database layer, with roles for Owner, Admin, Employee, and Customer.

## Architecture
- Frontend: Vite + React + TypeScript, Tailwind UI, React Router.
- Backend: Node.js (Express), Prisma ORM, PostgreSQL.
- Auth: JWT with normalized roles and session blocklist support.
- Storage: Local disk for uploaded documents (per‑tenant folders), easily swappable for cloud storage.
- API Base: http://localhost:5000/api by default (configurable with VITE_API_URL).

## Technology Stack
- React 18, TypeScript, Vite, Tailwind
- Express 5, Prisma 7, PostgreSQL
- JWT auth, RBAC middleware, multi‑tenant guards
- Multer for file uploads (per‑tenant storage under backend/uploads)

## Core Workflows
1. CRM → Deal
   - Create Lead; convert to Account + Contact + Opportunity.
   - Move Opportunity through PipelineStage; track Activities and Notes.
2. CPQ → Quote
   - Build quotes from opportunities with catalog items and totals.
   - Request approvals; send quotes for customer review.
3. CLM → Contract
   - Convert accepted quotes to contracts (“From Quote” flow).
   - Use templates, version documents, and collect e‑signatures.
4. ERP → Cash
   - Generate ERP Orders after signature; issue Invoices.
   - Record Payments; sync to revenue dashboards.
5. Documents
   - Upload or link documents; associate to accounts, quotes, contracts, orders, invoices.
   - Store files under /uploads/<tenantId>/ and serve at /uploads.
6. Subscriptions
   - Manage plans, track subscription records, and payment transactions.

## Multi‑Tenancy & RBAC
- tenantId is present on core entities; all queries are filtered by tenant.
- Roles include Owner, Admin, Employee, Customer; auth middleware normalizes role values.
- Customer routes are scoped to customer’s company records only.

## Getting Started
### Prerequisites
- Node.js 18+
- PostgreSQL 14+ (or compatible)

### Backend Setup
1. Configure environment:
   - Copy backend/.env.example to backend/.env and set:
     - DATABASE_URL (PostgreSQL connection string)
     - JWT_SECRET (secure random value)
2. Install dependencies:
   ```bash
   cd backend
   npm install
   ```
3. Apply Prisma migrations and generate client:
   ```bash
   npx prisma migrate deploy
   npx prisma generate
   ```
4. Seed demo data (optional but recommended):
   ```bash
   node seed_data.js
   ```
5. Start the API:
   ```bash
   npm run dev
   ```
   - API base: http://localhost:5000/api
   - Static uploads: http://localhost:5000/uploads

### Frontend Setup
1. Install dependencies:
   ```bash
   npm install
   ```
2. (Optional) Configure API URL:
   - Create .env at project root with:
     ```
     VITE_API_URL=http://localhost:5000/api
     ```
3. Start the dev server:
   ```bash
   npm run dev
   ```
   - Open the URL that Vite prints (defaults to http://localhost:5173).

## Demo Accounts
Use these for a guided evaluation:
- Owner: owner@sirius.com / password123
- Admin: admin@sirius.com / password123
- Employee: john@sirius.com / password123
- Customer: alice@globaltech.com / password123

## Verification Scripts
Automated end‑to‑end checks from backend/scripts:
- verify_workflow.js: Walks CRM → CPQ → CLM → ERP → Payments.
- verify_multitenancy.js: Confirms tenant filtering and isolation.
Run:
```bash
cd backend
node scripts/verify_workflow.js
```

## Notable Modules
- CRM: /api/crm (accounts, contacts, leads, opportunities, activities, notes)
- CPQ: /api/cpq (products, quotes, approvals)
- CLM: /api/clm (contracts, templates, versions, signers)
- ERP: /api/erp (orders, invoices, payments)
- Documents: /api/documents (list, view, upload, delete)
- Auth: /api/auth (signup, login, logout)

## File Uploads (Documents)
- Uploads use multipart/form‑data with field name file.
- Files are stored under backend/uploads/<tenantId>/ and served at /uploads.
- Metadata (name, type, category, url) is persisted in the Document model.

## Role‑Based Access
- Owner/Admin: Full access within tenant scope.
- Employee: Operational access to CRM/CPQ/CLM/ERP.
- Customer: Customer portal with restricted document/quote/contract views.

## Troubleshooting
- 401 Unauthorized: Clear token and sign in again.
- PostgreSQL connection issues: Verify DATABASE_URL in backend/.env and ensure the DB is running.
- Migrations: Run npx prisma migrate deploy, then npx prisma generate.
- Uploads return 400: Ensure you provide a file or a valid URL and a name.

## License
For evaluation and internal use. Contact the maintainers for licensing terms.

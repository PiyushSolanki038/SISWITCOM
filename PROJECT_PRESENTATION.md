# SISWIT Platform – Detailed Presentation

## Overview
- Unified platform covering CRM, CPQ, CLM, Documents, E‑Sign, and ERP.
- Web app built with React + Vite (TypeScript) and an Express backend.
- PostgreSQL via Prisma with multi‑tenancy and RBAC enforced in middleware.
- End‑to‑end “Lead → Quote → Contract → Order → Invoice → Payment → Revenue”.

## Architecture
- Frontend: Vite React app with role‑based dashboards and protected routes.
  - App routing: [AppRoutes.tsx](file:///c:/Users/Piyus/OneDrive/Desktop/SISWIT/src/routes/AppRoutes.tsx)
  - API config: [api.ts](file:///c:/Users/Piyus/OneDrive/Desktop/SISWIT/src/config/api.ts)
- Backend: Express with modular routes, Prisma client, and auth middleware.
  - Routes directory: backend/routes/*
  - Auth middleware: [auth.js](file:///c:/Users/Piyus/OneDrive/Desktop/SISWIT/backend/middleware/auth.js)
  - ERP routes: [erp.js](file:///c:/Users/Piyus/OneDrive/Desktop/SISWIT/backend/routes/erp.js)
  - Payments: [payments.js](file:///c:/Users/Piyus/OneDrive/Desktop/SISWIT/backend/routes/payments.js)
  - CRM: [crm.js](file:///c:/Users/Piyus/OneDrive/Desktop/SISWIT/backend/routes/crm.js)

## Tech Stack
- Frontend: React, TypeScript, Vite, Tailwind, shadcn/ui, Lucide, Framer Motion.
- Backend: Node.js, Express, Prisma, PostgreSQL, Nodemailer.
- Payments: Razorpay and Paytm integration points; internal ERP payment recording.
- Auth: JWT with role normalization and tenant derivation in middleware.

## Role & Access Model
- Roles: owner, admin, employee, customer.
- Middleware normalizes role values and ensures tenantId on requests: [auth.js](file:///c:/Users/Piyus/OneDrive/Desktop/SISWIT/backend/middleware/auth.js#L1-L44).
- Protected routes on frontend: [ProtectedRoute.tsx](file:///c:/Users/Piyus/OneDrive/Desktop/SISWIT/src/components/layout/ProtectedRoute.tsx).

## Frontend Modules
- Marketing: Public pages (Home, Solutions, Pricing, About, Contact, Blog).
- Auth: SignIn, SignUp, Forgot Password, Plan selection, Accept Invite.
- Owner/Admin Dashboards: Users, roles, notifications, system health, billing.
- Employee Dashboard:
  - CRM: Accounts, Contacts, Leads, Opportunities, Activities, Notes.
  - CPQ: Products, Quotes, discount approvals.
  - CLM: Contracts, Templates, Versions, Approvals.
  - Docs: Document list and viewer.
  - E‑Sign: Requests and execution; public signer at /public/sign/:id.
  - ERP: Orders, Invoices, Payments, Credit Notes, Revenue, Fulfillment, Inventory.
- Customer Dashboard: Quotes, Contracts, Documents, Sign, Subscriptions, ERP views.
- Public Pay Page: /pay/:token shows invoice and processes payment.
  - Implementation: [PayInvoice.tsx](file:///c:/Users/Piyus/OneDrive/Desktop/SISWIT/src/features/public/PayInvoice.tsx).

## Key Workflows
- CRM → CPQ → CLM → ERP:
  - Create lead/contact/account → opportunity → quote → contract → order.
  - Generate invoice from order, send invoice, record payment, track revenue.
- E‑Sign:
  - Employee sends signature request; external signer completes via [PublicSigner](file:///c:/Users/Piyus/OneDrive/Desktop/SISWIT/src/features/employee/pages/esign/PublicSigner.tsx).
- ERP Cash Cycle:
  - Orders and Invoices: [erp.js](file:///c:/Users/Piyus/OneDrive/Desktop/SISWIT/backend/routes/erp.js#L192-L285).
  - Email invoice with Pay Online link and mark as sent: [erp.js](file:///c:/Users/Piyus/OneDrive/Desktop/SISWIT/backend/routes/erp.js#L287-L378).
  - Public payment link generation: [erp.js](file:///c:/Users/Piyus/OneDrive/Desktop/SISWIT/backend/routes/erp.js#L380-L418).
  - Public invoice fetch and pay: [erp.js](file:///c:/Users/Piyus/OneDrive/Desktop/SISWIT/backend/routes/erp.js#L419-L478).
  - Internal pay invoice endpoint (authenticated): [erp.js](file:///c:/Users/Piyus/OneDrive/Desktop/SISWIT/backend/routes/erp.js#L446-L533).
  - Frontend ERP services: [erpService.ts](file:///c:/Users/Piyus/OneDrive/Desktop/SISWIT/src/features/employee/erp/erpService.ts#L94-L174).

## Backend Routes Overview
- Auth: [auth.js](file:///c:/Users/Piyus/OneDrive/Desktop/SISWIT/backend/routes/auth.js)
  - Signup, Login, Forgot Password; JWT issuance and login notification email.
- CRM: [crm.js](file:///c:/Users/Piyus/OneDrive/Desktop/SISWIT/backend/routes/crm.js)
  - Accounts, Contacts, Opportunities; email CTAs and meeting callbacks.
- CPQ: [cpq.js](file:///c:/Users/Piyus/OneDrive/Desktop/SISWIT/backend/routes/cpq.js)
- CLM: [clm.js](file:///c:/Users/Piyus/OneDrive/Desktop/SISWIT/backend/routes/clm.js)
- Docs: [documents.js](file:///c:/Users/Piyus/OneDrive/Desktop/SISWIT/backend/routes/documents.js)
- E‑Sign: [esign.js](file:///c:/Users/Piyus/OneDrive/Desktop/SISWIT/backend/routes/esign.js)
  - Public signer fetch and sign endpoints used by PublicSigner.
- ERP: [erp.js](file:///c:/Users/Piyus/OneDrive/Desktop/SISWIT/backend/routes/erp.js)
  - Orders CRUD and email confirmations.
  - Invoices CRUD, email with payment link, status transitions.
  - Payments: create payment records and update order/invoice states.
  - Credit notes and revenue analytics.
- Payments (Subscriptions): [payments.js](file:///c:/Users/Piyus/OneDrive/Desktop/SISWIT/backend/routes/payments.js)
  - Razorpay create/verify order, Paytm stub, dev bypass, transactions listing.

## Multi‑Tenancy & RBAC
- tenantId applied to core entities; queries scoped by tenant in routes.
- Auth middleware ensures req.user has tenantId and normalized role.
- Customer routes are automatically filtered to the customer’s company records.

## Email & Notifications
- SMTP via Nodemailer for transactional emails: [sendEmail](file:///c:/Users/Piyus/OneDrive/Desktop/SISWIT/backend/utils/sendEmail.js).
- CRM outreach templates and meeting CTA: [crm.js](file:///c:/Users/Piyus/OneDrive/Desktop/SISWIT/backend/routes/crm.js#L67-L80).
- ERP invoice email with embedded Pay Online button.

## Payments
- Two payment models:
  - SaaS subscriptions with Razorpay/Paytm endpoints (admin/owner plans).
  - ERP invoice payments (internal record or public link “Pay Online”).
- Public payment flow does not charge a gateway by default; it marks invoice as paid and creates a Payment record for demos. Gateway integration hooks are present.

## Development & Scripts
- Frontend scripts: dev, build, preview, test, lint in [package.json](file:///c:/Users/Piyus/OneDrive/Desktop/SISWIT/package.json).
- Backend scripts: start, dev in [backend/package.json](file:///c:/Users/Piyus/OneDrive/Desktop/SISWIT/backend/package.json).
- API base URL defaults to http://localhost:5000/api: [api.ts](file:///c:/Users/Piyus/OneDrive/Desktop/SISWIT/src/config/api.ts#L7-L18).

## Demo Script (Live Walkthrough)
1. Sign in as Employee; open ERP → Orders; create order → confirm.
2. Generate invoice from order; go to Invoices → Send Invoice to an email.
3. Open email link → Pay Online → complete payment on public page.
4. Return to ERP → Invoices: status is Paid; Payments list shows new entry; Order updates to paymentStatus=paid and moves to fulfillment.
5. CRM to CLM flow: create opportunity → generate quote → convert to contract → send E‑Sign via public signer.

## Roadmap
- Replace public payment “mark as paid” with real Stripe/Razorpay checkout.
- Enhance partial payments and allocation to invoices.
- Add deeper analytics dashboards and audit logs.
- Harden multi‑tenant boundaries with additional middleware and tests.

## Notes
- PostgreSQL/Prisma is the current data layer across modules.
- Payment keys and email credentials are expected via environment variables in backend/.env.

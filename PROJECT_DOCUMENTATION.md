# SISWIT (Sirius Infra) — Complete Project Documentation

> **Generated:** 2026-03-01 | **Version:** 1.0.0 | **Repository:** [https://github.com/PiyushSolanki038/SISWITCOM.git](https://github.com/PiyushSolanki038/SISWITCOM.git)

---

## Table of Contents

1. [Project Overview](#1-project-overview)
2. [Technology Stack](#2-technology-stack)
3. [System Architecture](#3-system-architecture)
4. [Folder Structure](#4-folder-structure)
5. [Database Schema (Prisma)](#5-database-schema-prisma)
6. [Backend API](#6-backend-api)
7. [Frontend Application](#7-frontend-application)
8. [Authentication & Authorization](#8-authentication--authorization)
9. [Role-Based Access Control (RBAC)](#9-role-based-access-control-rbac)
10. [Feature Modules](#10-feature-modules)
11. [UI Component Library](#11-ui-component-library)
12. [Styling System](#12-styling-system)
13. [Routing Architecture](#13-routing-architecture)
14. [Services Layer](#14-services-layer)
15. [Configuration Files](#15-configuration-files)
16. [Environment Variables](#16-environment-variables)
17. [Payment Integration](#17-payment-integration)
18. [Email & Notifications](#18-email--notifications)
19. [Multi-Tenancy](#19-multi-tenancy)
20. [Testing](#20-testing)
21. [Build & Deployment](#21-build--deployment)
22. [Scripts & Utilities](#22-scripts--utilities)

---

## 1. Project Overview

**SISWIT (Sirius Infra)** is a full-stack, multi-tenant SaaS business management platform. It integrates CRM, CPQ, CLM, ERP, eSign, Document Management, Billing, and Subscription management into a single unified web application. The platform serves four distinct user roles — **Owner**, **Admin**, **Employee**, and **Customer** — each with a dedicated dashboard and granular permissions.

### Key Capabilities

| Module | Description |
|--------|-------------|
| **CRM** | Accounts, Contacts, Leads, Opportunities, Activities, Notes, Pipeline management |
| **CPQ** | Products, Quotes, Quote Approvals, Quote line items with pricing |
| **CLM** | Contracts, Contract Templates, Clauses, Approvals, Versions, Audit Logs, Renewals |
| **ERP** | Orders, Invoices, Payments, Credit Notes, Revenue tracking, Fulfillment, Inventory |
| **eSign** | Digital signature requests, signing sessions, public signing links |
| **Docs** | Document upload, versioning, categorized storage linked to entities |
| **Billing** | Subscription plans, Razorpay payment gateway, payment transactions |
| **Attendance** | Employee check-in tracking with IP, device info, user agent |
| **Notifications** | Templates, rules, delivery logs, email notifications |
| **Team & Invitations** | Role-based invitations with token-based accept flow |

---

## 2. Technology Stack

### Frontend

| Technology | Version | Purpose |
|-----------|---------|---------|
| React | 18.3.1 | UI library |
| TypeScript | 5.8.3 | Type safety |
| Vite | 5.4.19 | Build tool & dev server |
| React Router DOM | 6.30.1 | Client-side routing |
| TailwindCSS | 3.4.17 | Utility-first CSS framework |
| Radix UI | Various | Accessible headless UI primitives (50+ components) |
| TanStack React Query | 5.83.0 | Server state management |
| Framer Motion | 12.27.0 | Animations |
| Recharts | 2.15.4 | Charts & data visualization |
| React Hook Form | 7.61.1 | Form management |
| Zod | 3.25.76 | Schema validation |
| Tiptap | 3.19.0 | Rich text editor |
| Sonner | 1.7.4 | Toast notifications |
| Lucide React | 0.462.0 | Icon library |
| Axios | 1.13.4 | HTTP client |
| date-fns | 3.6.0 | Date utilities |
| html2pdf.js | 0.14.0 | PDF generation |
| qrcode.react | 4.2.0 | QR code generation |
| @hello-pangea/dnd | 18.0.1 | Drag and drop |
| Embla Carousel | 8.6.0 | Carousel component |

### Backend

| Technology | Version | Purpose |
|-----------|---------|---------|
| Node.js | — | Runtime environment |
| Express.js | 5.2.1 | HTTP server framework |
| Prisma ORM | 7.4.0 | Database ORM & migrations |
| PostgreSQL | — | Primary database |
| JSON Web Tokens | 9.0.3 | Authentication tokens |
| bcryptjs | 3.0.3 | Password hashing |
| Nodemailer | 7.0.13 | Email sending |
| Multer | 1.4.5 | File upload handling |
| Razorpay SDK | 2.9.6 | Payment gateway |
| PaytmChecksum | 1.5.1 | Paytm payment verification |
| CORS | 2.8.6 | Cross-origin resource sharing |

### Dev Tools

| Tool | Purpose |
|------|---------|
| Vitest | Unit testing framework |
| Testing Library | React component testing |
| ESLint | Code linting |
| PostCSS + Autoprefixer | CSS processing |
| Nodemon | Backend hot-reload |
| SWC (via @vitejs/plugin-react-swc) | Fast JSX/TSX compilation |

---

## 3. System Architecture

```
┌─────────────────────────────────────────────────────────┐
│                    BROWSER (Client)                      │
│  React 18 + TypeScript + Vite (Port 8080)               │
│  ┌─────────────┐ ┌──────────┐ ┌──────────────────────┐  │
│  │ AuthContext  │ │ React    │ │ TanStack React Query │  │
│  │ (JWT Token) │ │ Router   │ │ (Server State)       │  │
│  └─────────────┘ └──────────┘ └──────────────────────┘  │
└────────────────────────┬────────────────────────────────┘
                         │ HTTP (Vite Proxy /api → :5000)
┌────────────────────────▼────────────────────────────────┐
│                EXPRESS.JS SERVER (Port 5000)              │
│  ┌──────────┐ ┌──────────────┐ ┌──────────────────────┐ │
│  │ CORS     │ │ JWT Auth     │ │ Role & Tenant        │ │
│  │ JSON     │ │ Middleware   │ │ Middleware            │ │
│  └──────────┘ └──────────────┘ └──────────────────────┘ │
│  ┌──────────────────────────────────────────────────┐   │
│  │ 14 Route Modules:                                │   │
│  │ auth, crm, cpq, clm, erp, esign, documents,     │   │
│  │ payments, subscription, admin, invitations,      │   │
│  │ attendance, messages, chat                       │   │
│  └──────────────────────────────────────────────────┘   │
└────────────────────────┬────────────────────────────────┘
                         │ Prisma ORM
┌────────────────────────▼────────────────────────────────┐
│               POSTGRESQL DATABASE                        │
│  30+ Models | Multi-Tenant (tenantId) | UUID PKs         │
│  Indexed on tenantId + createdAt for performance         │
└─────────────────────────────────────────────────────────┘
```

### Data Flow

1. **User** interacts with React UI → triggers API call via `fetch` or `axios`
2. **Vite dev server** proxies `/api/*` requests to Express backend on port 5000
3. **Express middleware** validates JWT token, extracts user role & tenantId
4. **Route handler** processes request using Prisma ORM with tenant scoping
5. **Response** sent back to React, cached by TanStack React Query

---

## 4. Folder Structure

```
SISWIT/
├── backend/                          # Express.js backend
│   ├── middleware/                    # Auth, role, tenant middleware
│   │   ├── auth.js                   # JWT verification + session blocklist
│   │   ├── requireRole.js            # Role-based route protection
│   │   └── requireTenant.js          # Tenant isolation middleware
│   ├── prisma/                       # Database schema & migrations
│   │   └── schema.prisma             # 806 lines, 30+ models
│   ├── routes/                       # 14 API route files
│   │   ├── admin.js                  # (69KB) Admin operations
│   │   ├── auth.js                   # Authentication endpoints
│   │   ├── attendance.js             # Employee attendance
│   │   ├── chat.js                   # Chat messaging
│   │   ├── clm.js                    # Contract lifecycle management
│   │   ├── cpq.js                    # Configure-price-quote
│   │   ├── crm.js                    # Customer relationship management
│   │   ├── documents.js              # Document management
│   │   ├── erp.js                    # Enterprise resource planning
│   │   ├── esign.js                  # Electronic signatures
│   │   ├── invitations.js            # User invitations
│   │   ├── messages.js               # Messaging system
│   │   ├── payments.js               # Payment processing
│   │   └── subscription.js           # Subscription management
│   ├── scripts/                      # Utility scripts
│   │   ├── check_user.js
│   │   ├── test_login.js
│   │   ├── test_overview.js
│   │   ├── verify_multitenancy.js
│   │   └── verify_workflow.js
│   ├── utils/                        # Backend utilities
│   │   ├── emailTemplates.js         # Email HTML templates
│   │   ├── sendEmail.js              # Nodemailer email sender
│   │   └── sessionBlocklist.js       # In-memory session blocklist
│   ├── uploads/                      # File upload directory
│   ├── server.js                     # Express server entry point
│   ├── prismaClient.js              # Prisma client singleton
│   ├── prisma.config.ts             # Prisma configuration
│   ├── seed_data.js                 # Database seed script
│   └── package.json                 # Backend dependencies
│
├── src/                              # React frontend source
│   ├── App.tsx                       # Root component with providers
│   ├── main.tsx                      # Application entry point
│   ├── index.css                     # Global CSS + Tailwind base
│   ├── vite-env.d.ts                # Vite type declarations
│   │
│   ├── config/                       # Application configuration
│   │   ├── api.ts                    # API base URL + endpoints map
│   │   └── roles.ts                  # RBAC roles, permissions, action checks
│   │
│   ├── context/                      # React context providers
│   │   └── AuthContext.tsx           # Auth state, login/signup/logout
│   │
│   ├── routes/                       # Application routing
│   │   └── AppRoutes.tsx             # 383 lines — all routes defined
│   │
│   ├── hooks/                        # Custom React hooks
│   │   ├── use-mobile.tsx            # Mobile viewport detection
│   │   ├── use-toast.ts             # Toast notification hook
│   │   └── useAuth.ts               # Auth hook re-export
│   │
│   ├── services/                     # Shared API services
│   │
│   ├── lib/                          # Utility libraries
│   │
│   ├── utils/                        # Shared utility functions
│   │
│   ├── components/                   # Shared components
│   │   ├── ui/                       # 50 Radix-based UI primitives
│   │   ├── layout/                   # Layout components (7 files)
│   │   ├── common/                   # Common reusable components
│   │   ├── editor/                   # Rich text editor
│   │   ├── subscription/            # Subscription guard
│   │   └── NavLink.tsx              # Navigation link component
│   │
│   ├── features/                     # Feature-based modules
│   │   ├── admin/                    # Admin dashboard (10 pages)
│   │   ├── auth/                     # Auth pages (5 pages)
│   │   ├── customer/                 # Customer dashboard (13 pages + 5 ERP)
│   │   ├── employee/                 # Employee dashboard (52 pages + 15 ERP)
│   │   ├── esign/                    # E-Sign feature
│   │   ├── marketing/               # Marketing/landing pages (8 pages)
│   │   ├── owner/                    # Owner dashboard (6 pages)
│   │   ├── public/                   # Public-facing pages
│   │   └── sign/                     # Signing feature
│   │
│   ├── styles/                       # 20 CSS stylesheets
│   │   ├── header.css, home.css, dashboard.css, marketing.css
│   │   ├── pricing.css, solutions.css, about.css, blog.css
│   │   ├── contact.css, accounts.css, opportunities.css
│   │   ├── document-editor.css, and more...
│   │
│   ├── pages/                        # Top-level pages
│   │   ├── error/                    # NotFound, Unauthorized
│   │   └── marketing/               # Marketing page aliases
│   │
│   └── test/                         # Test files
│
├── public/                           # Static assets
├── dist/                             # Production build output
├── index.html                        # HTML entry (loads Razorpay + React)
├── package.json                      # Frontend dependencies
├── vite.config.ts                    # Vite configuration
├── tailwind.config.ts               # Tailwind CSS configuration
├── tsconfig.json                    # TypeScript configuration
├── eslint.config.js                 # ESLint configuration
├── postcss.config.js                # PostCSS configuration
└── vitest.config.ts                 # Vitest test configuration
```

---

## 5. Database Schema (Prisma)

**File:** `backend/prisma/schema.prisma` (806 lines)
**Database:** PostgreSQL
**ORM:** Prisma Client JS

### 5.1 Enums

| Enum | Values |
|------|--------|
| `Role` | `ADMIN`, `OWNER`, `EMPLOYEE`, `CUSTOMER` |
| `QuoteStatus` | `DRAFT`, `SENT`, `APPROVAL_PENDING`, `APPROVED`, `REJECTED`, `ACCEPTED` |

### 5.2 All Models (30+ Tables)

#### Core / Auth Models

| Model | Key Fields | Purpose |
|-------|-----------|---------|
| `User` | id, tenantId, email, password, firstName, lastName, role, subscriptionStatus, subscriptionPlan, resetPasswordToken, resetPasswordExpire | Central user entity with multi-tenant support |
| `Invitation` | id, tenantId, email, role, tokenHash, expiresAt, status (PENDING/ACCEPTED/REVOKED/EXPIRED) | Token-based user invitation system |
| `RolePermission` | id, role, module, allowed | Module-level role permissions |
| `Attendance` | id, tenantId, userId, date, checkInTime, ip, deviceInfo, userAgent | Employee attendance with unique constraint on [userId, date] |

#### CRM Models

| Model | Key Fields | Purpose |
|-------|-----------|---------|
| `Account` | id, tenantId, name, industry, website, phone, location, status, annualRevenue, employees | Company/organization records |
| `Contact` | id, tenantId, firstName, lastName, email, phone, role, company, accountId | Individual contact records |
| `Lead` | id, tenantId, name, company, source, status, score, ownerId, accountId, contactId | Sales lead tracking |
| `Opportunity` | id, tenantId, title, value (Decimal), stage, probability, closingDate, accountId, contactId, leadId, pipelineStageId, ownerId | Sales opportunity pipeline |
| `Activity` | id, tenantId, type, title, description, date, duration, status, completed, accountId, contactId, leadId, opportunityId, userId | Tasks, calls, meetings, events |
| `Note` | id, tenantId, title, content, accountId, contactId, leadId, opportunityId, userId, activityId | Notes linked to any CRM entity |
| `PipelineStage` | id, tenantId, name, order | Configurable sales pipeline stages |

#### CPQ Models

| Model | Key Fields | Purpose |
|-------|-----------|---------|
| `Product` | id, tenantId, name, sku (unique), pricing_type, base_price, currency, is_active | Product catalog |
| `Quote` | id, tenantId, quoteNumber (unique), status (QuoteStatus enum), subtotal, taxTotal, discountTotal, grandTotal, currency, validUntil, accountId, contactId, opportunityId | Price quotes |
| `QuoteItem` | id, tenantId, quoteId, productId, quantity, unitPrice, discount, total | Quote line items (unique on [quoteId, productId]) |
| `QuoteApproval` | id, tenantId, quoteId, requestedBy, decidedBy, status, comment | Approval workflow for quotes |

#### CLM Models

| Model | Key Fields | Purpose |
|-------|-----------|---------|
| `Contract` | id, tenantId, contract_number, name, account_id, quote_id, contract_type, status, start_date, end_date, renewal_type, contract_value, content, signers (JSON) | Contract management |
| `ContractTemplate` | id, tenantId, name, contract_type, content, version, is_active | Reusable contract templates |
| `ContractClause` | id, tenantId, templateId, title, content, sortOrder, required | Template clause management |
| `ContractApproval` | id, tenantId, contractId, requestedBy, decidedBy, status, reason | Contract approval workflow |
| `ContractSigner` | id, tenantId, contractId, contactId, name, email, role, signedAt | Contract signers |
| `ContractSignatureRequest` | id, tenantId, contractId, signerEmail, signerName, token (unique), status, expiresAt | Signature request tracking |
| `ContractAuditLog` | id, tenantId, contractId, action, performedBy, metadata (JSON) | Contract change audit trail |
| `ContractVersion` | id, tenantId, contractId, version, content, createdById | Contract version history |
| `SigningSession` | id, token (unique), tenantId, contractId, signerEmail, signerName, status, expiresAt, signatureData, ipAddress, userAgent | E-signature session tracking |

#### ERP Models

| Model | Key Fields | Purpose |
|-------|-----------|---------|
| `ERPOrder` | id, tenantId, orderNumber (unique), status, paymentStatus, fulfillmentStatus, subtotal, taxTotal, grandTotal, items (JSON), accountId, quoteId, contractId | Sales orders |
| `Invoice` | id, tenantId, invoiceNumber (unique), orderId, accountId, items (JSON), subtotal, taxTotal, grandTotal, balanceDue, status | Invoicing |
| `Payment` | id, tenantId, paymentNumber (unique), invoiceId, amount, paymentMethod, referenceNumber, status | Payment records |
| `CreditNote` | id, noteNumber (unique), invoiceId, accountId, amount, reason, status | Credit note management |

#### Billing / Subscription Models

| Model | Key Fields | Purpose |
|-------|-----------|---------|
| `Subscription` | id, tenantId, userId, planId, status, billingCycle, amount, razorpaySubscriptionId | User subscriptions |
| `PaymentTransaction` | id, tenantId, userId, subscriptionId, provider, orderId, txnId, amount, status, method | Payment gateway transactions |
| `Plan` | id, name (unique), priceMonthly, priceYearly, currency, limits (JSON), active | Subscription plans |

#### Notification Models

| Model | Key Fields | Purpose |
|-------|-----------|---------|
| `NotificationTemplate` | id, tenantId, name, subject, htmlContent, isActive | Email notification templates |
| `NotificationRule` | id, tenantId, eventType, templateId, isEnabled | Event-based notification rules |
| `NotificationDeliveryLog` | id, tenantId, eventType, recipient, subject, status, error | Notification delivery tracking |
| `EmailLog` | id, tenantId, toEmail, subject, templateName, messageId, status, error | Email sending audit log |

#### Other Models

| Model | Key Fields | Purpose |
|-------|-----------|---------|
| `Document` | id, tenantId, title, url, category, linked_entity_id, linked_entity_model, accountId, quoteId, contractId, invoiceId, orderId | Document storage linked to entities |
| `IntegrationSetting` | id, tenantId, publicApiEnabled | Tenant-scoped integration settings |

### 5.3 Indexing Strategy

- Every model has `@@index([tenantId])` for multi-tenant query performance
- Most models have `@@index([tenantId, createdAt])` for time-ordered queries
- Compound unique constraints like `@@unique([id, tenantId])` ensure tenant isolation
- Business keys (orderNumber, invoiceNumber, quoteNumber, sku) have `@unique` constraints

---

## 6. Backend API

**Entry Point:** `backend/server.js`
**Port:** 5000 (configurable via `PORT` env var)
**Middleware Stack:** `express.json()` → `cors()` → Static file serving for `/uploads`

### 6.1 API Route Map

| Route Prefix | File | Size | Description |
|-------------|------|------|-------------|
| `/api/auth` | `routes/auth.js` | 8KB | Login, signup, forgot password, password reset |
| `/api/crm` | `routes/crm.js` | 27KB | CRUD for Accounts, Contacts, Leads, Opportunities, Activities, Notes |
| `/api/cpq` | `routes/cpq.js` | 26KB | Products, Quotes, Quote Items, Approvals |
| `/api/clm` | `routes/clm.js` | 36KB | Contracts, Templates, Clauses, Approvals, Signatures, Audit Logs, Versions |
| `/api/erp` | `routes/erp.js` | 29KB | Orders, Invoices, Payments, Credit Notes, Fulfillment |
| `/api/admin` | `routes/admin.js` | 69KB | User management, roles/permissions, system settings, health checks, tenant admin |
| `/api/documents` | `routes/documents.js` | 8KB | Document upload (Multer), CRUD operations |
| `/api/esign` | `routes/esign.js` | 7KB | E-signature request creation, signing sessions |
| `/api/payments` | `routes/payments.js` | 13KB | Razorpay integration, payment processing, webhook handling |
| `/api/subscription` | `routes/subscription.js` | 2KB | Subscription plan management |
| `/api/invitations` | `routes/invitations.js` | 13KB | Invite creation, token validation, accept flow |
| `/api/attendance` | `routes/attendance.js` | 3KB | Check-in recording, attendance history |
| `/api/messages` | `routes/messages.js` | 7KB | Messaging system |
| `/api/chat` | `routes/chat.js` | 8KB | Real-time chat |

### 6.2 Middleware Pipeline

1. **`middleware/auth.js`** — JWT token verification
   - Extracts token from `Authorization: Bearer <token>` or `x-auth-token` header
   - Verifies against `JWT_SECRET` env var
   - Checks session blocklist for invalidated sessions
   - Auto-resolves user role and tenantId from database if missing in token

2. **`middleware/requireRole.js`** — Role-based access control
   - Checks if authenticated user has required role (e.g., `admin`, `owner`)

3. **`middleware/requireTenant.js`** — Tenant isolation
   - Ensures `req.user.tenantId` is present for multi-tenant data scoping

### 6.3 Backend Utilities

| File | Purpose |
|------|---------|
| `utils/sendEmail.js` | Nodemailer wrapper for sending emails |
| `utils/emailTemplates.js` | 19KB of HTML email templates for invitations, notifications, password resets |
| `utils/sessionBlocklist.js` | In-memory Set for blocking invalidated JWT sessions |
| `prismaClient.js` | Prisma client singleton with connection management |
| `seed_data.js` | Database seeding script for initial data |

---

## 7. Frontend Application

### 7.1 Entry Point

**`src/main.tsx`** renders `<App />` into `#root` div.

### 7.2 App Component (`src/App.tsx`)

Provider hierarchy (outermost → innermost):
```
QueryClientProvider (TanStack React Query)
  └── TooltipProvider (Radix UI)
       └── AuthProvider (Custom Auth Context)
            ├── Toaster (Radix UI toast)
            ├── Sonner (Sonner toast)
            └── BrowserRouter (React Router)
                 ├── SubscriptionGuard
                 └── AppRoutes
```

### 7.3 Layout Components (`src/components/layout/`)

| Component | File | Purpose |
|-----------|------|---------|
| `MarketingLayout` | MarketingLayout.tsx (3.7KB) | Public page layout with marketing header/footer |
| `DashboardLayout` | DashboardLayout.tsx (942B) | Dashboard wrapper layout |
| `Header` | Header.tsx (15.6KB) | Main navigation header with responsive menu |
| `Sidebar` | Sidebar.tsx (14.5KB) | Dashboard sidebar navigation |
| `ProtectedRoute` | ProtectedRoute.tsx (774B) | Redirects unauthenticated users |
| `RoleGuard` | RoleGuard.tsx (1KB) | Guards routes by role or module access |
| `PageBreadcrumbs` | PageBreadcrumbs.tsx (1.7KB) | Dynamic breadcrumb navigation |

---

## 8. Authentication & Authorization

### 8.1 Auth Flow

1. **Sign Up** (`/signup`): User registers → backend creates User + Tenant → JWT token issued → stored in localStorage
2. **Sign In** (`/signin`): User logs in with email/password/role → JWT verified → token stored
3. **Forgot Password** (`/forgot-password`): Email with reset token sent → user resets password
4. **Accept Invite** (`/accept-invite/:token`): Token validated → user account created under tenant
5. **Select Plan** (`/select-plan`): Post-signup subscription plan selection

### 8.2 AuthContext (`src/context/AuthContext.tsx`)

**State:** `user` (id, email, name, role, avatar, subscriptionPlan, subscriptionStatus), `token`

**Methods:**
- `login(email, password, role)` → `POST /api/auth/login`
- `signup(email, password, name, role)` → `POST /api/auth/signup`
- `logout()` → Clears localStorage + state
- `forgotPassword(email)` → `POST /api/auth/forgot-password`
- `updateSubscription(plan)` → `POST /api/subscription/update`

**Persistence:** User and token stored in `localStorage`, rehydrated on app load.

### 8.3 JWT Security

- Token secret: `process.env.JWT_SECRET` (fallback: `'dev_secret'`)
- Session blocklist: In-memory Set that blocks invalidated user sessions
- Token extraction: `Authorization: Bearer <token>` or `x-auth-token` header

---

## 9. Role-Based Access Control (RBAC)

**Config File:** `src/config/roles.ts` (167 lines)

### 9.1 Roles

| Role | Dashboard Path | Description |
|------|---------------|-------------|
| `owner` | `/app` | Full access to everything. Organization owner. |
| `admin` | `/admin-dashboard` | System administration, user management, configuration. |
| `employee` | `/employee-dashboard` | Operational access to CRM, CPQ, CLM, ERP, Docs, eSign. |
| `customer` | `/customer-dashboard` | Portal access: view quotes, contracts, documents, payments. |

### 9.2 Module Permissions

| Module | Owner | Admin | Employee | Customer |
|--------|-------|-------|----------|----------|
| Dashboard | ✅ | ✅ | ✅ | — |
| CRM | Full | Full | Operate | View Self |
| CPQ | Full | Configure | Operate | Accept/Reject |
| CLM | Full | Configure | Draft/Send | Sign/View |
| eSign | Full | Configure | Send | Sign |
| ERP | Full | Full | Operate | — |
| Billing | Full | View | Create/Send | Pay |
| Docs | ✅ | — | ✅ | — |
| Portal | View | View | View | Full |
| Workflows | Full | Full | Use | — |
| Approvals | Full | Full | Request | — |
| Templates | Full | Full | Use | — |
| Reports | Full | Full | Partial | — |
| Subscription | Full | View | ❌ | ❌ |
| Settings | Full | Full | ❌ | — |

### 9.3 Permission Functions

- `canAccessModule(role, module)` — Checks if role can access a module
- `canPerformAction(role, module, action)` — Granular action-level check (view, create, edit, delete, configure, operate, send, sign, pay, request, use, accept, reject, audit)

---

## 10. Feature Modules

### 10.1 Employee Dashboard (`src/features/employee/`)

**Layout:** `layouts/EmployeeLayout.tsx`
**Services:** `crmService.ts` (31KB), `cpqService.ts` (9KB), `clmService.ts` (10KB), `documentService.ts` (5KB)

#### Pages

| Category | Pages |
|----------|-------|
| **Core** | Dashboard, Profile, Settings, Attendance, Invitations |
| **CRM** (20 files) | Overview, Leads, LeadDetail, Contacts, ContactDetail, Accounts, AccountDetail, Opportunities, OpportunityDetail, Activities, ActivityDetail, Notes, NoteDetail |
| **CPQ** (8 files) | Quotes, QuoteDetail, CreateQuote, SendQuote, QuoteApprovals, Products, ProductDetail |
| **CLM** (9 files) | Contracts, ContractDetail, CreateContract, Templates, TemplateDetail, TemplateCreate, Signatures, Renewals |
| **ERP** (15 files) | Orders, OrderDetail, Invoices, InvoiceDetail, Payments, PaymentDetail, CreditNotes, CreditNoteDetail, Revenue, Fulfillment, FulfillmentDetail, Inventory, InventoryDetail |
| **Docs** (3 files) | DocumentList, DocumentViewer |
| **eSign** (4 files) | ESignRequests, ESignDetail, PublicSigner |
| **Sign** (3 files) | Send, Execute, Complete |

### 10.2 Customer Dashboard (`src/features/customer/`)

**Layout:** `layouts/CustomerLayout.tsx`
**Pages:** Dashboard, Quotes, QuoteHistory, QuoteDetail, Contracts, ContractDetail, Documents, SignDocument, Profile, Support, Subscriptions, Notifications, Activity
**ERP Pages:** Orders, Invoices, Payments

### 10.3 Owner Dashboard (`src/features/owner/`)

**Layout:** `layouts/OwnerLayout.tsx`
**Components:** Sidebar + 5 other components
**Pages:** Dashboard (18KB), Team (9KB), Billing, Attendance, OrgSettings (14KB), ContractApprovals
**Custom Styles:** `styles/owner-dashboard.css`

### 10.4 Admin Dashboard (`src/features/admin/`)

**Layout:** `layouts/AdminLayout.tsx`
**Pages:** Dashboard (13KB), UserManagement (19KB), AdminUsers, RolesPermissions (18KB), NotificationsTemplates (25KB), AuditLogs, SystemSettings, HealthCheck, Attendance, Payments

### 10.5 Marketing Pages (`src/features/marketing/pages/`)

| Page | Size | Description |
|------|------|-------------|
| Home | 26KB | Landing page with hero, features, testimonials |
| Solutions | 24KB | Product solutions showcase |
| Pricing | 13KB | Subscription plans & pricing tiers |
| About | 12KB | Company about page |
| Contact | 12KB | Contact form |
| Blog | 10KB | Blog listing page |
| Article | 10KB | Individual blog article |
| Careers | 7KB | Job listings page |

### 10.6 Auth Pages (`src/features/auth/pages/`)

SignIn, SignUp, ForgotPassword, SelectPlan, AcceptInvite

---

## 11. UI Component Library

**Location:** `src/components/ui/` — **50 components** built on Radix UI primitives

| Component | Component | Component |
|-----------|-----------|-----------|
| Accordion | Alert | Alert Dialog |
| Aspect Ratio | Avatar | Badge |
| Breadcrumb | Button | Calendar |
| Card | Carousel | Chart |
| Checkbox | Collapsible | Command |
| Context Menu | Dialog | Drawer |
| Dropdown Menu | Form | Hover Card |
| Input | Input OTP | Label |
| Menubar | Navigation Menu | Overlay Helpers |
| Pagination | Popover | Progress |
| Radio Group | Resizable | Scroll Area |
| Select | Separator | Sheet |
| Sidebar (23KB) | Skeleton | Slider |
| Sonner | Switch | Table |
| Tabs | Textarea | Toast |
| Toaster | Toggle | Toggle Group |
| Tooltip | use-toast | — |

All components use `class-variance-authority` (CVA) for variant management and `clsx` + `tailwind-merge` for className composition.

---

## 12. Styling System

### 12.1 CSS Architecture

- **TailwindCSS 3.4** with custom configuration
- **CSS Variables** for theme tokens (light/dark mode via `class` strategy)
- **20 module-specific CSS files** in `src/styles/`
- **1 owner-specific CSS** in `src/features/owner/styles/`

### 12.2 Custom Fonts (from `tailwind.config.ts`)

| Family | Fonts |
|--------|-------|
| Sans | Lato, system-ui, Segoe UI, Roboto, Helvetica Neue, Arial |
| Serif | EB Garamond, Georgia, Cambria, Times New Roman |
| Mono | Fira Code, SFMono-Regular, Menlo, Monaco, Consolas |

### 12.3 Custom Animations

- `accordion-down` / `accordion-up` — Radix accordion animations
- `fade-in-up` — Element entrance animation (translate + opacity)
- `fade-in` — Simple opacity fade

### 12.4 Design Tokens

Semantic color system using HSL CSS variables: `--primary`, `--secondary`, `--destructive`, `--muted`, `--accent`, `--popover`, `--card`, `--sidebar-*`, `--background`, `--foreground`, `--border`, `--input`, `--ring`.

---

## 13. Routing Architecture

**File:** `src/routes/AppRoutes.tsx` (383 lines)

### Route Groups

| Group | Path Pattern | Auth Required | Layout |
|-------|-------------|---------------|--------|
| Marketing | `/`, `/solutions`, `/pricing`, `/about`, `/contact`, `/blog`, `/blog/:id`, `/careers` | No | MarketingLayout |
| Public eSign | `/public/sign/:id` | No | None |
| Public Pay | `/pay/:token` | No | None |
| Auth | `/signin`, `/signup`, `/forgot-password`, `/select-plan`, `/accept-invite/:token` | No | None |
| Owner | `/app/dashboard`, `/app/team`, `/app/billing`, `/app/attendance`, `/app/settings`, `/app/approvals/contracts` | Yes (Owner) | OwnerLayout |
| Admin | `/admin-dashboard/*` (10 sub-routes) | Yes (Admin/Owner) | AdminLayout |
| Employee | `/employee-dashboard/*` (70+ sub-routes across CRM/CPQ/CLM/ERP/Docs/eSign/Sign) | Yes (Employee/Admin/Owner) | EmployeeLayout |
| Customer | `/customer-dashboard/*` (15+ sub-routes) | Yes (Customer/Admin/Owner) | CustomerLayout |
| Error | `/unauthorized`, `*` (404) | No | None |

### Route Protection

- **`ProtectedRoute`** — Wraps all authenticated routes, redirects to `/signin`
- **`RoleGuard`** — Nested guards for role-specific (`allowedRoles`) and module-specific (`module`) access
- **Legacy Redirect** — `/owner-dashboard/*` → `/app/*` backward compatibility

---

## 14. Services Layer

### Frontend Services (`src/features/*/services/`)

| Service | Size | Module | Key Functions |
|---------|------|--------|--------------|
| `crmService.ts` | 31KB | CRM | CRUD for accounts, contacts, leads, opportunities, activities, notes, pipeline |
| `cpqService.ts` | 9KB | CPQ | CRUD for products, quotes, quote items, approvals |
| `clmService.ts` | 10KB | CLM | CRUD for contracts, templates, clauses, signatures, renewals |
| `documentService.ts` | 5KB | Docs | Upload, download, list, delete documents |

All services use `fetch` API with JWT token from `localStorage` and are scoped by `tenantId`.

---

## 15. Configuration Files

| File | Purpose |
|------|---------|
| `vite.config.ts` | Vite dev server (port 8080), API proxy to :5000, path alias `@` → `./src` |
| `tailwind.config.ts` | TailwindCSS with custom colors, fonts, animations, shadows |
| `tsconfig.json` | TypeScript base config with references |
| `tsconfig.app.json` | App-specific TS config |
| `tsconfig.node.json` | Node-specific TS config |
| `eslint.config.js` | ESLint with React hooks & refresh plugins |
| `postcss.config.js` | PostCSS with TailwindCSS + Autoprefixer |
| `vitest.config.ts` | Vitest with jsdom environment |
| `components.json` | Shadcn/Radix UI component configuration |
| `backend/prisma.config.ts` | Prisma client generation config |

---

## 16. Environment Variables

### Frontend (`.env`)

| Variable | Description |
|----------|-------------|
| `VITE_API_URL` | Backend API base URL (optional, defaults to `http://localhost:5000/api`) |

### Backend (`backend/.env`)

| Variable | Description |
|----------|-------------|
| `PORT` | Server port (default: 5000) |
| `DATABASE_URL` | PostgreSQL connection string |
| `JWT_SECRET` | JWT signing secret |
| `SMTP_HOST` | Email server host |
| `SMTP_PORT` | Email server port |
| `SMTP_USER` | Email username |
| `SMTP_PASS` | Email password |
| `RAZORPAY_KEY_ID` | Razorpay API key |
| `RAZORPAY_KEY_SECRET` | Razorpay secret key |

---

## 17. Payment Integration

### Razorpay

- **Frontend:** Razorpay Checkout SDK loaded via `<script>` in `index.html`
- **Backend:** `razorpay` npm package (v2.9.6) in `routes/payments.js` (13KB)
- **Models:** `Subscription` has `razorpaySubscriptionId`, `PaymentTransaction` tracks provider/orderId/txnId
- **Features:** Order creation, payment verification, webhook handling, subscription billing

### Paytm (Legacy)

- **Backend:** `paytmchecksum` package for checksum verification
- **Provider field** in `PaymentTransaction` model defaults to `"paytm"`

---

## 18. Email & Notifications

### Email System

- **Transport:** Nodemailer (`utils/sendEmail.js`)
- **Templates:** `utils/emailTemplates.js` (19KB) — HTML templates for invitations, password resets, notifications
- **Logging:** `EmailLog` model tracks all sent emails with messageId, status, errors

### Notification System

- **Templates:** `NotificationTemplate` model — tenant-scoped HTML email templates
- **Rules:** `NotificationRule` model — event-type → template mapping with enable/disable
- **Delivery Logs:** `NotificationDeliveryLog` model — tracks delivery status and errors
- **Admin UI:** `NotificationsTemplates.tsx` (25KB) — Full template CRUD in admin dashboard

---

## 19. Multi-Tenancy

### Architecture

- **Tenant = Organization** — Created when Owner signs up; UUID used as `tenantId`
- **Row-Level Isolation** — Every model includes `tenantId` column
- **Indexing** — `@@index([tenantId])` on all models for query performance
- **Middleware** — `requireTenant.js` ensures tenant context is present
- **Auto-Resolution** — Auth middleware auto-resolves `tenantId` from user record if missing in JWT

### Data Scoping

- All API queries filter by `tenantId` from `req.user.tenantId`
- Compound unique constraints (`@@unique([id, tenantId])`) prevent cross-tenant data access
- Invitations are tenant-scoped — invited users join the inviting tenant

---

## 20. Testing

### Framework

- **Vitest** (v3.2.4) with **jsdom** environment
- **Testing Library** — `@testing-library/react` + `@testing-library/jest-dom`
- **Config:** `vitest.config.ts`

### Scripts

```bash
npm run test         # Run tests once
npm run test:watch   # Watch mode
```

### Backend Test Scripts (`backend/scripts/`)

| Script | Purpose |
|--------|---------|
| `check_user.js` | Verify user exists in DB |
| `test_login.js` | Test login API endpoint |
| `test_overview.js` | Test CRM overview endpoint |
| `verify_multitenancy.js` | Verify multi-tenant data isolation |
| `verify_workflow.js` | End-to-end workflow verification |

---

## 21. Build & Deployment

### Development

```bash
# Frontend (port 8080)
npm run dev

# Backend (port 5000)
cd backend && npm run dev
```

### Production Build

```bash
npm run build          # Production build
npm run build:dev      # Development build
npm run preview        # Preview production build
```

### Database

```bash
cd backend
npx prisma migrate dev    # Run migrations
npx prisma generate       # Generate Prisma client
node seed_data.js          # Seed initial data
```

---

## 22. Scripts & Utilities

### Frontend Scripts (`package.json`)

| Script | Command | Description |
|--------|---------|-------------|
| `dev` | `vite` | Start dev server on port 8080 |
| `build` | `vite build --mode production` | Production build |
| `build:dev` | `vite build --mode development` | Dev build |
| `lint` | `eslint .` | Run ESLint |
| `preview` | `vite preview` | Preview built app |
| `test` | `vitest run` | Run tests |
| `test:watch` | `vitest` | Watch mode tests |

### Backend Scripts (`backend/package.json`)

| Script | Command | Description |
|--------|---------|-------------|
| `start` | `node server.js` | Start production server |
| `dev` | `nodemon server.js` | Start dev server with hot reload |

### Utility Files

| File | Purpose |
|------|---------|
| `generate_tree.js` | Generate project directory tree |
| `generate_tree.py` | Python version of tree generator |
| `setup_marketing.ps1` | PowerShell script for marketing page setup |

---

> **End of Documentation** — This document covers every aspect of the SISWIT (Sirius Infra) project including architecture, database schema, APIs, frontend modules, authentication, RBAC, styling, routing, services, configuration, payments, email, multi-tenancy, testing, and deployment.

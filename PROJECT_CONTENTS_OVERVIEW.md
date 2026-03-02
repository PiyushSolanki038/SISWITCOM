# PROJECT CONTENTS OVERVIEW
**Sirius Integrated SaaS Platform**
**Date:** January 25, 2026

---

## 1. Project Overview
Sirius is a comprehensive "All-in-One" SaaS platform designed to streamline the Revenue Operations lifecycle for SMEs. It integrates CRM, CPQ, CLM, E-Signature, and Document Management into a single monolithic React/Node.js application.

---

## 2. Modules & Features Breakdown

### 📊 CRM (Customer Relationship Management)
*   **Purpose:** Manage customer relationships and sales pipeline.
*   **Pages:**
    *   `Leads`: List and manage potential sales leads (Hot/Warm/Cold status).
    *   `Pipeline`: Kanban board for drag-and-drop Deal management.
    *   `Opportunities`: List view of active Deals.
    *   `Accounts`: Corporate entity management.
    *   `Contacts`: Individual people management.
    *   `Activities`: Log of calls, emails, and meetings.
*   **Key Features:** Lead conversion, visual pipeline, activity logging.

### 💰 CPQ (Configure, Price, Quote)
*   **Purpose:** Generate accurate pricing and proposals.
*   **Pages:**
    *   `Products`: Catalog management (SKU, Price, Stock).
    *   `Quotes`: List of all generated quotes.
    *   `QuoteBuilder`: Dynamic interface to select products, adjust quantities, and calculate totals.
    *   `QuoteDetail`: View and export final quotes.
*   **Key Features:** Real-time calculation, product selection, PDF export.

### 📝 CLM (Contract Lifecycle Management)
*   **Purpose:** Draft, negotiate, and store legal agreements.
*   **Pages:**
    *   `Contracts`: Repository of all legal agreements.
    *   `ContractTemplates`: Manage standard clauses and templates.
    *   `ContractEditor`: Rich-text HTML editor for drafting contracts.
    *   `ContractDetail`: View specific contract metadata and status.
*   **Key Features:** Template injection, HTML editing, status tracking.

### ✍️ E-Signature
*   **Purpose:** Execute documents legally.
*   **Pages:**
    *   `SignSend`: Upload document and select recipients.
    *   `SignExecute`: Interface for users to apply signatures.
    *   `SignComplete`: Success page after signing.
*   **Key Features:** Email notifications, click-to-sign workflow.

### 📂 Document Management (Docs)
*   **Purpose:** Centralized file storage and analysis.
*   **Pages:**
    *   `Documents`: File repository list.
    *   `DocumentCreate`: Upload new files.
    *   `DocumentHistory`: View version history (Audit Log).
    *   `DocumentAnalysis`: Placeholder for AI analysis.
*   **Key Features:** Upload, tagging, metadata storage.

### 🌐 Customer Portal
*   **Purpose:** External view for clients to interact with sales assets.
*   **Pages:**
    *   `CustomerQuotes`: View sent quotes.
    *   `CustomerDocs`: View shared files.
    *   `CustomerSign`: Sign pending requests.

### 📢 Marketing Site (Public)
*   **Pages:** `Home`, `Solutions`, `Pricing`, `About`, `Contact`, `Blog`, `Careers`.

### 🔐 Authentication
*   **Pages:** `SignIn`, `SignUp`, `ForgotPassword`.

---

## 3. Workflow Logic

### The "Lead-to-Cash" Journey
1.  **Lead Generation:** User creates a Lead in `CRM > Leads`.
2.  **Qualification:** Lead is converted to a Deal in `CRM > Pipeline`.
3.  **Proposal:** User creates a Quote linked to the Deal in `CPQ > QuoteBuilder`.
4.  **Contracting:** User generates a Contract from the Quote in `CLM > ContractEditor`.
5.  **Execution:** Contract is sent for signature via `Sign > SignSend`.
6.  **Closing:** Customer signs via `Portal > CustomerSign`. Deal moves to "Closed Won".
7.  **Archival:** Signed PDF is stored in `Docs > Documents`.

---

## 4. Technical Architecture

### Frontend
*   **Framework:** React (Vite) + TypeScript.
*   **UI Library:** Shadcn/UI + Tailwind CSS.
*   **State/Routing:** React Router DOM, React Hooks.
*   **Animation:** Framer Motion.
*   **Utilities:** `html2pdf.js` (PDF Generation), `lucide-react` (Icons).

### Backend
*   **Runtime:** Node.js.
*   **Framework:** Express.js.
*   **Database:** MongoDB (via Mongoose).
*   **Authentication:** Custom JWT-based middleware.
*   **Email:** Nodemailer (SMTP/Ethereal).

### Database Models (Schema)
*   **Users:** `User`, `Employee`, `Customer` (Identity & Role).
*   **CRM:** `Lead`, `Deal`, `Account`, `Contact`, `Activity`.
*   **CPQ:** `Product`, `Quote`.
*   **CLM:** `Contract`, `Template`, `Document`, `SignatureRequest`.
*   **System:** `Message`, `Payment`.

---

## 5. Documentation Files

### Root Directory
*   `PROJECT_STATUS_REPORT.md` (Executive Summary)
*   `PROJECT_DOCUMENTATION.md` (Detailed PRD/SRS)

### /documentation Directory
*   `MASTER_PROJECT_DOC.md` (Comprehensive Academic/Startup Bible)
*   `PROJECT_STATUS_REPORT.md` (Snapshot)
*   `PROJECT_COMPLETION_REPORT.md` (Phase 1 Closure)
*   `INVESTOR_BRIEF.md` (Pitch Deck)

---

## 6. Business Logic & Rules
*   **Role-Based Access:**
    *   `Employee`: Access to Dashboard (CRM, CPQ, CLM).
    *   `Customer`: Access to Portal only.
*   **Pricing Logic:** `Quantity * Unit Price = Total`. (No complex tax/discount logic yet).
*   **Status Transitions:**
    *   Quote: Draft -> Sent -> Accepted/Rejected.
    *   Contract: Draft -> Pending Signature -> Active.

---

## 7. Gaps & Future Roadmap

### Missing / Incomplete
*   **Security:** Auth uses plaintext passwords (CRITICAL FIX NEEDED).
*   **Validation:** Input forms lack strict server-side validation (Zod).
*   **Storage:** Files are not actually uploaded to S3; only metadata is stored.
*   **E-Sign:** No cryptographic signature or audit trail.

### Future Scope
*   **AI:** Contract risk analysis, Lead scoring.
*   **Integrations:** Stripe (Payments), Salesforce (Sync), Gmail (Activities).
*   **Mobile App:** Native React Native application.

---

## 8. Detailed File Structure & Definitions

### 📂 Root Directory
*   `package.json`: Project dependencies and scripts.
*   `tsconfig.json`: TypeScript compiler configuration.
*   `vite.config.ts`: Vite build tool configuration.
*   `tailwind.config.js`: Tailwind CSS styling configuration.
*   `README.md`: Basic project introduction.
*   `components.json`: Shadcn/UI configuration.
*   `eslint.config.js`: Linting rules.
*   `index.html`: Main HTML entry point.
*   `postcss.config.js`: PostCSS configuration.
*   `vitest.config.ts`: Testing configuration.

### 📂 Documentation (`documentation/`)
*   `MASTER_PROJECT_DOC.md`: Comprehensive academic/startup documentation.
*   `PROJECT_STATUS_REPORT.md`: Snapshot of current project status.
*   `PROJECT_COMPLETION_REPORT.md`: Phase 1 MVP closure report.
*   `INVESTOR_BRIEF.md`: Startup pitch deck and pricing strategy.

### 📂 Public Assets (`public/`)
*   `logo.svg`: Application logo.
*   `robots.txt`: Search engine crawling rules.

### 📂 Client Source (`src/`)

#### Components (`src/components/`)
*   **Layouts (`src/components/layout/`)**
    *   `DashboardLayout.tsx`: The main wrapper for the logged-in app; includes Sidebar and Header.
    *   `Header.tsx`: Top navigation bar with user profile and notifications.
    *   `MarketingLayout.tsx`: Wrapper for public-facing marketing pages.
    *   `PageBreadcrumbs.tsx`: Navigation aid showing current path hierarchy.
    *   `ProtectedRoute.tsx`: Higher-Order Component that redirects unauthenticated users.
    *   `RoleGuard.tsx`: Ensures users only access pages permitted for their role (e.g., Customer vs. Employee).
    *   `Sidebar.tsx`: Left-side navigation menu for the Dashboard.
*   **UI (`src/components/ui/`)**: Reusable primitives from Shadcn/UI (Buttons, Inputs, Cards, Dialogs, etc.).

#### Config (`src/config/`)
*   `api.ts`: Central configuration for API base URLs and timeouts.
*   `roles.ts`: Definitions of user roles (Employee, Customer) and their permissions.

#### Context (`src/context/`)
*   `AuthContext.tsx`: React Context provider that manages global user state (login/logout/user data).

#### Hooks (`src/hooks/`)
*   `use-mobile.tsx`: Detects if the current viewport is mobile size.
*   `use-toast.ts`: Hook for displaying toast notifications.
*   `useAuth.ts`: Simplified hook to access AuthContext data.

#### Pages (`src/pages/`)
*   **Auth (`src/pages/auth/`)**
    *   `SignIn.tsx`: Login form.
    *   `SignUp.tsx`: Registration form.
    *   `ForgotPassword.tsx`: Password reset request form.
*   **Dashboard (`src/pages/dashboard/`)**
    *   `Dashboard.tsx`: Main overview page with stats widgets.
    *   **CLM (`src/pages/dashboard/clm/`)**
        *   `Contracts.tsx`: List view of contracts.
        *   `ContractDetail.tsx`: Single contract view.
        *   `ContractEditor.tsx`: WYSIWYG editor for contract content.
        *   `ContractTemplates.tsx`: Management of reusable contract templates.
        *   `Documents.tsx`: General document list view.
    *   **CPQ (`src/pages/dashboard/cpq/`)**
        *   `Products.tsx`: Product catalog grid.
        *   `Quotes.tsx`: List of quotes.
        *   `QuoteBuilder.tsx`: Complex form for creating new quotes with line items.
        *   `QuoteDetail.tsx`: Read-only view of a finalized quote.
    *   **CRM (`src/pages/dashboard/crm/`)**
        *   `Leads.tsx`: Table of sales leads.
        *   `Pipeline.tsx`: Visual Kanban board for Deals.
        *   `Opportunities.tsx`: List view of active deals.
        *   `Accounts.tsx`: Company database.
        *   `Contacts.tsx`: Person database.
        *   `Activities.tsx`: Log of interactions.
    *   **Docs (`src/pages/dashboard/docs/`)**
        *   `DocumentCreate.tsx`: File upload interface.
        *   `DocumentHistory.tsx`: Audit log of file versions.
        *   `DocumentAnalysis.tsx`: Placeholder for AI analysis.
    *   **Sign (`src/pages/dashboard/sign/`)**
        *   `SignSend.tsx`: Workflow to send a doc for signature.
        *   `SignExecute.tsx`: Interface to apply a signature.
        *   `SignComplete.tsx`: Success state page.
    *   **Portal (`src/pages/dashboard/portal/`)**
        *   `CustomerQuotes.tsx`: Client view of sent quotes.
        *   `CustomerDocs.tsx`: Client view of shared documents.
        *   `CustomerSign.tsx`: Client interface for signing documents.
*   **Marketing (`src/pages/marketing/`)**
    *   `Home.tsx`: Landing page.
    *   `Pricing.tsx`, `Solutions.tsx`, `About.tsx`, `Contact.tsx`, `Blog.tsx`, `Careers.tsx`: Static pages.
*   **Error (`src/pages/error/`)**
    *   `NotFound.tsx`: 404 page.
    *   `Unauthorized.tsx`: 403 Access Denied page.

#### Routes (`src/routes/`)
*   `AppRoutes.tsx`: The main router configuration mapping URLs to Page components.

#### Services (`src/services/`)
*   `payment.ts`: Placeholder for payment processing logic.

#### Styles (`src/styles/`)
*   `dashboard.css`: General dashboard layout styles.
*   `marketing.css`: Landing page styles.
*   `document-editor.css`: Contract editor specific styles.
*   (Plus component-specific CSS files: `leads.css`, `pipeline.css`, `quotes.css`, etc.)

#### Test (`src/test/`)
*   `setup.ts`: Test environment configuration.

#### Utils (`src/utils/`)
*   `helpers.ts`: General helper functions (date formatting, currency formatting).

### 📂 Server Source (`server/src/`)

#### Config
*   `index.ts`: Entry point for the Express server.

#### Models (`server/src/models/`)
*   `User.ts`: Schema for system users (Employees/Customers).
*   `Lead.ts`: CRM Lead schema.
*   `Deal.ts`: CRM Deal schema.
*   `Contact.ts`: CRM Contact schema.
*   `Account.ts`: CRM Account schema.
*   `Activity.ts`: CRM Activity log schema.
*   `Product.ts`: CPQ Product schema.
*   `Quote.ts`: CPQ Quote schema.
*   `Contract.ts`: CLM Contract schema.
*   `Template.ts`: CLM Template schema.
*   `Document.ts`: Document metadata schema.
*   `SignatureRequest.ts`: E-Signature workflow schema.
*   `Message.ts`: System message/notification schema.
*   `Payment.ts`: Payment transaction schema.

#### Routes (`server/src/routes/`)
*   `auth.ts`: Authentication endpoints (`/api/auth`).
*   `dashboard.ts`: Dashboard stats aggregation.
*   `leads.ts`, `deals.ts`, `contacts.ts`, `accounts.ts`, `activities.ts`: CRM endpoints.
*   `products.ts`, `quotes.ts`: CPQ endpoints.
*   `contracts.ts`, `templates.ts`: CLM endpoints.
*   `documents.ts`: Document management endpoints.
*   `signatures.ts`: E-Signature workflow endpoints.
*   `users.ts`: User management endpoints.
*   `messages.ts`: Notification endpoints.
*   `payments.ts`: Payment endpoints.

#### Utils (`server/src/utils/`)
*   `email.ts`: Nodemailer configuration for sending emails.
*   `emailTemplates.ts`: HTML templates for system emails.

#### Prisma (`server/prisma/`)
*   `schema.prisma`: Prisma ORM schema (potential alternative to Mongoose).
*   `seed.ts`: Database seeding script.

---

## 9. Summary
Sirius is a robust **Functional MVP** that successfully demonstrates the unification of 5 business tools. While visually polished and functionally complete for a "Happy Path" demo, it requires backend hardening (Security, Storage, Validation) before being production-ready.

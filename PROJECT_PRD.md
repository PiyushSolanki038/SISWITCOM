# Product Requirements Document (PRD) - Sirius Infra

## 1. Project Overview
*   **Project Name:** Sirius Infra
*   **One-Line Goal:** A unified "Quote-to-Cash" business operating system that integrates CRM, CPQ, CLM, E-Sign, and Document Management into a single platform.
*   **Target Users:** B2B SaaS Companies (Employees, Sales Teams, Legal Teams) and their Clients (Customers).

## 2. Tech Stack (Current)
### Frontend
*   **Framework:** React 18 (Vite Build Tool)
*   **Language:** TypeScript
*   **Styling:** Tailwind CSS + shadcn/ui (Radix UI primitives)
*   **Libraries:**
    *   Routing: `react-router-dom`
    *   State Management: React Context + Custom Hooks
    *   Forms: `react-hook-form` + `zod`
    *   Charts: `recharts`
    *   Animations: `framer-motion`
    *   Icons: `lucide-react`
    *   Drag & Drop: `@hello-pangea/dnd`

### Backend
*   **Runtime:** Node.js
*   **Framework:** Express.js
*   **Database:** MongoDB (via Mongoose ODM)
*   **Authentication:** JWT (JSON Web Tokens) + Bcrypt
*   **Payment Gateway:** Razorpay
*   **Email Service:** Nodemailer

## 3. Current Frontend Folder Structure
```text
src/
├── components/         # Reusable UI components (shadcn/ui, layout, etc.)
│   ├── common/
│   ├── layout/         # Layouts for different roles (Admin, Customer, Employee)
│   ├── subscription/
│   └── ui/             # shadcn primitives (button, card, dialog, etc.)
├── config/             # App-wide configuration (api, roles)
├── context/            # React Context (AuthContext)
├── features/           # Feature-based modules
│   ├── admin/          # Admin-specific pages & components
│   ├── auth/           # Login, Signup, Forgot Password
│   ├── customer/       # Customer portal pages
│   ├── employee/       # Main employee dashboard (CRM, CPQ, CLM, etc.)
│   ├── marketing/      # Public landing pages
│   └── owner/          # Super-admin/Owner control panel
├── hooks/              # Custom React hooks
├── lib/                # Utilities (cn, etc.)
├── pages/              # Top-level page wrappers (Error pages, Marketing wrappers)
├── routes/             # Route definitions (AppRoutes.tsx)
├── services/           # API service layers
├── styles/             # Global and module-specific CSS
└── utils/              # Helper functions
```

**Routing Setup:** React Router DOM (`v6`) with nested routes and role-based guards (`RoleGuard`, `ProtectedRoute`).

## 4. Existing Pages (Already Built)
### Public / Marketing
*   Home (`/`)
*   Solutions (`/solutions`)
*   Pricing (`/pricing`)
*   About (`/about`)
*   Contact (`/contact`)
*   Blog (`/blog`)

### Authentication
*   Sign In (`/login`)
*   Sign Up (`/signup`)
*   Forgot Password (`/forgot-password`)

### Employee Dashboard
*   **CRM**: Overview, Leads, Accounts, Contacts, Opportunities, Activities, Notes
*   **CPQ**: Quotes, Create Quote, Products
*   **CLM**: Contracts, Templates, Signatures
*   **E-Sign**: E-Sign Requests, Public Signer
*   **Docs**: Document List, Document Viewer

### Customer Portal
*   Dashboard, Quotes, Contracts, Documents, Profile, Subscriptions

### Admin / Owner
*   Dashboard, User Management, System Settings, Audit Logs, Revenue Reports

## 5. Roles & Access
*   **👑 Owner**: Full system control, revenue visibility, organization settings.
*   **🛡️ Admin**: User management, system configuration, role assignments.
*   **💼 Employee**: Day-to-day operations (CRM, CPQ, CLM access).
*   **🌐 Customer**: Limited portal access to view/sign quotes and contracts.

**Security Features:**
*   Role-Based Access Control (RBAC) implemented via `RoleGuard`.
*   Protected Routes for authenticated users.

## 6. Workflow Requirements
**Flow:** CRM → CPQ → CLM → E-Sign → Docs → ERP

*   **Lead Creation**: Employees (Sales Reps) or Web Intake.
*   **Discount Approval**: Automated rules or Manager/Owner approval.
*   **Contract Signing**: Customers (via E-Sign link).
*   **Invoicing/Payment**: Razorpay integration (Customer pays via portal).

## 7. Sidebar Requirements
Distinct sidebars for each user role to maintain context and security:
*   **Employee Sidebar**: Full operational modules (CRM, CPQ, CLM, Docs).
*   **Customer Sidebar**: Portal view (My Quotes, My Contracts, My Docs).
*   **Admin Sidebar**: Configuration and User Management focus.
*   **Owner Sidebar**: Analytics, Audit, and High-level Controls.

## 8. Pricing + Payment Requirements
*   **Provider**: Razorpay.
*   **Models**:
    *   **Starter ($49/mo)**: 5 users, Basic CRM.
    *   **Professional ($149/mo)**: 25 users, Full Suite (CRM+CPQ).
    *   **Enterprise (Custom)**: Unlimited, Full Suite + Advanced features.
*   **Flow**: User Signup → Plan Selection → Payment (Razorpay) → Dashboard Access.

## 9. Data Models (Key Fields)
*   **Lead**: Name, Company, Email, Phone, Source (Website/Referral), Status (New/Qualified), Score.
*   **Quote**: Quote Number, Opportunity ID, Items (Product, Qty, Price), Discount, Status (Draft/Sent/Accepted), Valid Until.
*   **Contract**: Template ID, Content (HTML/JSON), Signers, Status (Draft/Pending/Signed), Version History.
*   **Activity**: Type (Call/Meeting), Date, Outcome, Related To (Lead/Account).

## 10. UI Requirements
*   **Aesthetics**: Premium Enterprise SaaS (Clean, Minimal, Professional).
*   **Components**: shadcn/ui for consistent design system.
*   **Interactions**: Framer Motion for smooth page transitions and micro-interactions.
*   **Responsive**: Mobile-first design using Tailwind CSS.
*   **Data Display**: Advanced tables with sorting, filtering, and pagination.

## 11. Deployment
*   **Frontend**: Vercel (Recommended for Vite/React).
*   **Backend**: Render or Railway.
*   **Database**: MongoDB Atlas.

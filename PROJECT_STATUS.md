# Project Status & Documentation

## 📌 Project Overview
**Sirius Infra** is a comprehensive business management platform integrating CRM, CPQ, CLM, Document Management, and E-Signature capabilities into a single, modern interface. The project is built for scalability, performance, and a professional user experience.

---

## 🛠️ Installed Technologies & Dependencies

The project utilizes a modern React ecosystem. Below are the key libraries and tools currently installed:

### **Core Framework & Build Tool**
*   **React (v18)**: The library for web and native user interfaces.
*   **TypeScript**: Strongly typed programming language that builds on JavaScript.
*   **Vite**: Next-generation frontend tooling for fast development and building.

### **UI & Styling**
*   **Tailwind CSS**: Utility-first CSS framework for rapid UI development.
*   **shadcn/ui**: Reusable components built using Radix UI and Tailwind CSS.
    *   *Installed Components*: Accordion, Alert, Avatar, Badge, Button, Card, Dialog, Dropdown Menu, Form, Input, Sheet, Sidebar, Tabs, Toast, and more.
*   **Framer Motion**: Production-ready motion library for React (used for smooth transitions and animations).
*   **Lucide React**: Beautiful & consistent icon set.
*   **class-variance-authority (cva)**, **clsx**, **tailwind-merge**: Utilities for constructing and merging class names dynamically.

### **Navigation & Routing**
*   **React Router DOM**: Declarative routing for React web applications.

### **Data Visualization**
*   **Recharts**: Composable charting library built on React components (used in Dashboard analytics).

### **Form Handling & Validation**
*   **React Hook Form**: Performant, flexible, and extensible forms.
*   **Zod**: TypeScript-first schema declaration and validation library.

### **State Management & Data Fetching**
*   **@tanstack/react-query**: Powerful asynchronous state management for server state.
*   **Context API**: Used for global `AuthContext` (User authentication state).

### **Backend & Database (In Progress)**
*   **Database**: **PostgreSQL** (Planned via Supabase/Local).
    *   *Schema*: Defined in `server/prisma/schema.prisma` (Users, Accounts, Deals, Quotes, Contracts).
*   **Backend API**: **Node.js** with **Express**.
    *   *Location*: `server/` directory.
    *   *ORM*: **Prisma** for type-safe database interactions.
    *   *Status*: Scaffolding complete, API endpoints implemented (Auth, CRM, CPQ, CLM, Dashboard). Currently running with mock data in the backend service, ready for DB connection.

---

## ✅ Completed Work & Features

### 1. **Backend Integration (New)**
*   **Architecture**:
    *   Setup a dedicated Node.js/Express server in `server/`.
    *   Configured **Prisma** ORM with a complete schema matching frontend requirements.
    *   Created API endpoints for **Auth** (`/login`, `/signup`), **CRM** (`/accounts`), **CPQ** (`/quotes`), **CLM** (`/contracts`), and **Dashboard** (`/stats`).
*   **Frontend Connection**:
    *   Updated `API_CONFIG` to connect to the local backend (`http://localhost:3000`).
    *   Refactored `AuthContext`, `Dashboard`, `Accounts`, `Quotes`, and `Contracts` pages to fetch real-time data from the backend API instead of using hardcoded frontend arrays.

### 2. **Branding & UI Overhaul**
*   **Color Theme**: Established a professional color palette.
    *   **Primary**: `#1A3C34` (Deep Forest Green) - Used for Sidebar, primary buttons, and headings.
    *   **Accent**: `#EB5E4C` (Terracotta) - Used for highlights and calls to action.
*   **Logo Integration**:
    *   Created a custom SVG logo (Indigo/White).
    *   Updated browser favicon and page title (`Sirius Infra`).
    *   Integrated logo into Sign-In/Sign-Up pages and Sidebar.

### 2. **Navigation System**
*   **Professional Sidebar**:
    *   Redesigned with the new `#1A3C34` brand color.
    *   Implemented collapsible/expandable submenus for modules (CRM, CPQ, etc.).
    *   Added mobile responsiveness (hidden on desktop, drawer on mobile).
*   **Header & Layout**:
    *   Refactored `DashboardLayout` to handle responsive states.
    *   Added **Mobile Sidebar Trigger** for smaller screens.
    *   Implemented **Page Breadcrumbs** for better navigation context.

### 3. **Authentication Module**
*   **Sign In / Sign Up Pages**:
    *   Modern, split-screen design.
    *   **Role Selection**: Toggle between "Employee" and "Customer" roles.
    *   **Navigation**: Added "Back to Home" button for easier navigation from auth pages.
    *   Integrated with `AuthContext` for simulated login flows.

### 4. **Core Modules Implementation**
*   **Dashboard**: High-level analytics view with Recharts integration (Revenue trends, Pipeline stats).
*   **CRM (Customer Relationship Management)**:
    *   **Accounts**: List view with filtering and stats.
    *   **Leads**: Lead tracking with scoring and status.
*   **CPQ (Configure, Price, Quote)**:
    *   **Quotes**: Quote management interface with status tracking.
*   **CLM (Contract Lifecycle Management)**:
    *   **Contracts**: Contract tracking with renewal status.
*   **Document Management**:
    *   **AI Document Analysis**: New feature allowing drag-and-drop file upload for simulated AI insights.

### 5. **Codebase Maintenance**
*   **Documentation**:
    *   Updated `README.md` with accurate project info.
    *   Added JSDoc comments to key source files (`App.tsx`, `main.tsx`, layouts, etc.) for better code maintainability.

---

## 📂 File Structure Overview

```
src/
├── components/
│   ├── layout/             # Layout components (Header, Sidebar, DashboardLayout, MarketingLayout)
│   ├── ui/                 # Reusable UI components (shadcn/ui)
│   ├── NavLink.tsx         # Navigation link component
│   └── RoleGuard.tsx       # Role-based access control wrapper
├── config/
│   ├── api.ts              # API configuration and endpoints
│   └── roles.ts            # Role definitions and permissions
├── context/
│   └── AuthContext.tsx     # Authentication context provider
├── hooks/
│   ├── use-mobile.tsx      # Mobile detection hook
│   ├── use-toast.ts        # Toast notification hook
│   └── useAuth.ts          # Authentication hook
├── lib/
│   └── utils.ts            # Utility functions (cn, class merger)
├── pages/
│   ├── auth/               # Authentication pages (SignIn, SignUp, ForgotPassword)
│   ├── dashboard/
│   │   ├── clm/            # Contract Lifecycle Management (Contracts, Templates)
│   │   ├── cpq/            # Configure Price Quote (Quotes, Products, Builder)
│   │   ├── crm/            # CRM (Accounts, Leads, Contacts, Pipeline)
│   │   ├── docs/           # Document Management (Analysis, History)
│   │   ├── portal/         # Customer Portal pages
│   │   ├── sign/           # E-Signature pages
│   │   └── Dashboard.tsx   # Main dashboard analytics view
│   ├── error/              # Error pages (404, Unauthorized)
│   └── marketing/          # Public website pages (Home, About, Pricing, etc.)
├── routes/
│   └── AppRoutes.tsx       # Main routing configuration
├── styles/                 # Global and module-specific CSS
├── test/                   # Test setup files
├── utils/                  # General helper functions
├── App.tsx                 # Root component
├── main.tsx                # Entry point
└── index.css               # Global styles (Tailwind directives)

Root Configuration:
├── components.json         # shadcn/ui configuration
├── eslint.config.js        # Linting configuration
├── index.html              # HTML entry point
├── package.json            # Project dependencies and scripts
├── postcss.config.js       # PostCSS configuration
├── tailwind.config.ts      # Tailwind CSS configuration
├── tsconfig.json           # TypeScript configuration
└── vite.config.ts          # Vite build configuration
```

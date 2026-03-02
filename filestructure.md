# SISWIT File Structure

This document outlines the project structure, with brief descriptions for each directory and key files. Dependency directories (node_modules) and generated artifacts are summarized but not enumerated individually.

## Top-Level

- c:\Users\Piyus\OneDrive\Desktop\SISWIT\package.json – Frontend package configuration
- c:\Users\Piyus\OneDrive\Desktop\SISWIT\package-lock.json – Frontend dependency lockfile
- c:\Users\Piyus\OneDrive\Desktop\SISWIT\README.md – Project overview
- c:\Users\Piyus\OneDrive\Desktop\SISWIT\index.html – Frontend root HTML
- c:\Users\Piyus\OneDrive\Desktop\SISWIT\eslint.config.js – ESLint configuration
- c:\Users\Piyus\OneDrive\Desktop\SISWIT\postcss.config.js – PostCSS configuration
- c:\Users\Piyus\OneDrive\Desktop\SISWIT\tailwind.config.ts – Tailwind CSS configuration
- c:\Users\Piyus\OneDrive\Desktop\SISWIT\vitest.config.ts – Vitest configuration
- c:\Users\Piyus\OneDrive\Desktop\SISWIT\tsconfig.json – TypeScript config (frontend)
- c:\Users\Piyus\OneDrive\Desktop\SISWIT\tsconfig.node.json – TypeScript config for tooling
- c:\Users\Piyus\OneDrive\Desktop\SISWIT\components.json – UI component registry/config
- c:\Users\Piyus\OneDrive\Desktop\SISWIT\.env – Frontend environment variables
- c:\Users\Piyus\OneDrive\Desktop\SISWIT\.gitignore – Git ignore rules
- c:\Users\Piyus\OneDrive\Desktop\SISWIT\vite.config.ts – Vite build configuration
- c:\Users\Piyus\OneDrive\Desktop\SISWIT\setup_marketing.ps1 – Optional script for marketing setup
- Documentation (reports/specs):
  - PROJECT_PRESENTATION.md
  - PROJECT_WORKFLOW_PRESENTATION.md
  - PROJECT_PRD.md
  - PROJECT_CONTENTS_OVERVIEW.md
  - ROLE_BASED_WORKFLOW_STATUS.md
  - PROJECT_STATUS_REPORT.md
  - PROJECT_STATUS_REPORT_2026_01_26.md
  - PROJECT_STATUS.md
  - CUSTOMER_DASHBOARD_REPORT.md
  - FINAL_QA_REPORT.md
  - current_workflow_report.md

## Backend (Node/Express + Prisma/PostgreSQL)

- c:\Users\Piyus\OneDrive\Desktop\SISWIT\backend\server.js – Express app bootstrap and route mounting
- c:\Users\Piyus\OneDrive\Desktop\SISWIT\backend\package.json – Backend package configuration
- c:\Users\Piyus\OneDrive\Desktop\SISWIT\backend\package-lock.json – Backend dependency lockfile
- c:\Users\Piyus\OneDrive\Desktop\SISWIT\backend\README.md – Backend specific documentation
- c:\Users\Piyus\OneDrive\Desktop\SISWIT\backend\.env – Backend environment variables (PORT, DB, Paytm, etc.)
- c:\Users\Piyus\OneDrive\Desktop\SISWIT\backend\prismaClient.js – Prisma client initialization
- c:\Users\Piyus\OneDrive\Desktop\SISWIT\backend\seed_data.js – Seeder script for initial data
- c:\Users\Piyus\OneDrive\Desktop\SISWIT\backend\prisma.config.ts – Prisma tooling config

### Backend Routes

- backend\routes\auth.js – Sign up/sign in, JWT issuance, role handling
- backend\routes\admin.js – Admin/workspace endpoints (e.g., GET workspace by user)
- backend\routes\payments.js – Payment integrations (Razorpay legacy, Paytm order/callback, dev bypass)
- backend\routes\crm.js – CRM endpoints (accounts, contacts, activities, etc.)
- backend\routes\cpq.js – CPQ endpoints (products, quotes, approvals)
- backend\routes\clm.js – CLM endpoints (contracts, templates, renewals)
- backend\routes\erp.js – ERP endpoints (orders, invoices, payments, inventory, fulfillment)
- backend\routes\documents.js – Document storage/listing/viewing
- backend\routes\esign.js – E‑Sign endpoints (requests, signer flows)
- backend\routes\messages.js – Internal messages/notifications
- backend\routes\subscription.js – Subscription management

### Backend Prisma

- backend\prisma\schema.prisma – Prisma data model (User, Subscription, PaymentTransaction, etc.)
- backend\prisma\migrations\20260214_init\migration.sql – Initial migration SQL
- backend\prisma\prisma.config.ts – Prisma CLI/build config

### Backend Utils and Tests

- backend\utils\emailTemplates.js – Email templates (role‑based, system)
- backend\utils\sendEmail.js – Email sending utility
- backend\scripts\verify_workflow.js – Workflow verification script
- backend\scripts\test_login.js – Login test script
- backend\scripts\check_user.js – Check user script
- backend\test_api.js – API smoke test
- backend\test_email.js – Email sending test
- backend\test_email_template.js – Email template rendering test
- backend\test_role_emails.js – Role email variations test

## Frontend (Vite React + TypeScript)

- src\main.tsx – App entrypoint (React root)
- src\App.tsx – Top‑level app component
- src\index.css – Global styles
- src\vite-env.d.ts – Vite TS env typings
- src\lib\utils.ts – Utility helpers
- src\utils\helpers.ts – Additional helpers
- src\context\AuthContext.tsx – Auth context provider
- src\routes\AppRoutes.tsx – App routes for role‑based navigation

### Frontend Config

- src\config\api.ts – API base config
- src\config\roles.ts – Role constants and helpers

### Frontend Hooks

- src\hooks\useAuth.ts – Auth hook
- src\hooks\use-mobile.tsx – Mobile responsiveness hook
- src\hooks\use-toast.ts – Toast hook

### UI Components (Shadcn/UI)

- src\components\ui\*.tsx – Comprehensive set of primitive UI components (button, input, table, toast, tabs, etc.)
- src\components\ui\use-toast.ts – Toast provider/hook

### Features: Auth

- src\features\auth\pages\SignIn.tsx – Sign in page
- src\features\auth\pages\SignUp.tsx – Sign up flow with workspace setup and plan/payment
- src\features\auth\pages\SelectPlan.tsx – Plan selection component
- src\features\auth\pages\ForgotPassword.tsx – Password reset page

### Features: Owner

- src\features\owner\layouts\OwnerLayout.tsx – Owner dashboard layout
- src\features\owner\components\Sidebar.tsx – Owner sidebar navigation
- src\features\owner\pages\Dashboard.tsx – Owner dashboard (company name banner)
- src\features\owner\pages\Revenue.tsx – Owner revenue overview
- src\features\owner\pages\CRMControl.tsx – Owner control for CRM module
- src\features\owner\pages\CPQControl.tsx – Owner control for CPQ module
- src\features\owner\pages\CLMControl.tsx – Owner control for CLM module
- src\features\owner\pages\ESignControl.tsx – Owner control for E‑Sign module
- src\features\owner\pages\DocumentsControl.tsx – Owner control for Documents
- src\features\owner\pages\Users.tsx – User management
- src\features\owner\pages\OrgSettings.tsx – Org settings
- src\features\owner\pages\Audit.tsx – Audit logs
- src\features\owner\pages\Reports.tsx – Reports
- src\features\owner\pages\SystemSettings.tsx – System settings
- src\features\owner\services\ownerService.ts – Owner API service

### Features: Employee

- src\features\employee\layouts\EmployeeLayout.tsx – Employee dashboard layout
- src\features\employee\components\Sidebar.tsx – Employee sidebar
- src\features\employee\pages\Dashboard.tsx – Employee dashboard
- src\features\employee\pages\Settings.tsx – Settings
- src\features\employee\pages\Profile.tsx – Profile page
- CRM:
  - src\features\employee\pages\crm\Overview.tsx – CRM overview
  - src\features\employee\pages\crm\Leads.tsx – Leads
  - src\features\employee\pages\crm\LeadDetail.tsx – Lead detail
  - src\features\employee\pages\crm\Accounts.tsx – Accounts
  - src\features\employee\pages\crm\AccountDetail.tsx – Account detail
  - src\features\employee\pages\crm\Contacts.tsx – Contacts
  - src\features\employee\pages\crm\ContactDetail.tsx – Contact detail
  - src\features\employee\pages\crm\Activities.tsx – Activities
  - src\features\employee\pages\crm\ActivityDetail.tsx – Activity detail
  - src\features\employee\pages\crm\Opportunities.tsx – Opportunities
  - src\features\employee\pages\crm\OpportunityDetail.tsx – Opportunity detail
  - src\features\employee\pages\crm\Notes.tsx – Notes
  - src\features\employee\pages\crm\NoteDetail.tsx – Note detail
  - src\features\employee\pages\crm\types.ts – CRM types
  - src\features\employee\services\crmService.ts – CRM service
- CPQ:
  - src\features\employee\pages\cpq\Products.tsx – Product catalog
  - src\features\employee\pages\cpq\ProductDetail.tsx – Product detail
  - src\features\employee\pages\cpq\CreateQuote.tsx – Create quote
  - src\features\employee\pages\cpq\QuoteDetail.tsx – Quote detail
  - src\features\employee\pages\cpq\Quotes.tsx – Quotes list
  - src\features\employee\pages\cpq\SendQuote.tsx – Send quote
  - src\features\employee\pages\cpq\QuoteApprovals.tsx – Quote approvals
  - src\features\employee\pages\cpq\types.ts – CPQ types
  - src\features\employee\services\cpqService.ts – CPQ service
- CLM:
  - src\features\employee\pages\clm\Contracts.tsx – Contracts list
  - src\features\employee\pages\clm\ContractDetail.tsx – Contract detail
  - src\features\employee\pages\clm\CreateContract.tsx – Create contract
  - src\features\employee\pages\clm\TemplateDetail.tsx – Template detail
  - src\features\employee\pages\clm\Templates.tsx – Templates
  - src\features\employee\pages\clm\Renewals.tsx – Renewals
  - src\features\employee\pages\clm\Signatures.tsx – Signatures
  - src\features\employee\pages\clm\types.ts – CLM types
  - src\features\employee\services\clmService.ts – CLM service
- E‑Sign:
  - src\features\employee\pages\esign\ESignRequests.tsx – E‑Sign requests
  - src\features\employee\pages\esign\ESignDetail.tsx – E‑Sign details
  - src\features\employee\pages\esign\PublicSigner.tsx – Public signer page
  - src\features\employee\pages\esign\types.ts – E‑Sign types
- Docs:
  - src\features\employee\pages\docs\DocumentList.tsx – Document list
  - src\features\employee\pages\docs\DocumentViewer.tsx – Document viewer
  - src\features\employee\pages\docs\types.ts – Docs types
- ERP:
  - src\features\employee\erp\Orders.tsx – Orders
  - src\features\employee\erp\Invoices.tsx – Invoices
  - src\features\employee\erp\Payments.tsx – Payments
  - src\features\employee\erp\CreditNotes.tsx – Credit notes
  - src\features\employee\erp\Inventory.tsx – Inventory
  - src\features\employee\erp\Fulfillment.tsx – Fulfillment
  - src\features\employee\erp\Revenue.tsx – Revenue
  - src\features\employee\erp\types.ts – ERP types
  - src\features\employee\erp\erpService.ts – ERP service

### Features: Customer

- src\features\customer\layouts\CustomerLayout.tsx – Customer dashboard layout
- src\features\customer\components\Sidebar.tsx – Customer sidebar
- src\features\customer\pages\Dashboard.tsx – Customer dashboard
- src\features\customer\pages\Profile.tsx – Profile
- src\features\customer\pages\Activity.tsx – Activity
- src\features\customer\pages\Support.tsx – Support
- src\features\customer\pages\Documents.tsx – Documents
- src\features\customer\pages\DocumentDetail.tsx – Document detail (if present)
- src\features\customer\pages\Quotes.tsx – Quotes
- src\features\customer\pages\QuoteDetail.tsx – Quote detail
- src\features\customer\pages\QuoteHistory.tsx – Quote history
- src\features\customer\pages\SignDocument.tsx – Sign document flow
- src\features\customer\pages\Subscriptions.tsx – Subscriptions
- src\features\customer\erp\Orders.tsx – Orders
- src\features\customer\erp\Invoices.tsx – Invoices
- src\features\customer\erp\Payments.tsx – Payments
- src\features\customer\erp\types.ts – Types
- src\features\customer\erp\erpService.ts – Customer ERP service
- src\features\customer\services\customerService.ts – Customer API service

### Features: Marketing

- src\features\marketing\pages\Home.tsx – Home
- src\features\marketing\pages\About.tsx – About
- src\features\marketing\pages\Solutions.tsx – Solutions
- src\features\marketing\pages\Careers.tsx – Careers
- src\features\marketing\pages\Contact.tsx – Contact
- src\features\marketing\pages\Blog.tsx – Blog
- src\features\marketing\pages\Article.tsx – Article
- src\pages\marketing\*.tsx – Aliased duplicates of marketing pages (legacy routes)
- src\styles\*.css – Styles per feature/page (marketing, CRM, dashboards, etc.)

### Error Pages

- src\pages\error\NotFound.tsx – 404 page
- src\pages\error\Unauthorized.tsx – 401/403 page

### Services

- src\services\payment.ts – Frontend payment service (Paytm/Razorpay integration helpers)

## Public and Build

- public\logo.svg – Public assets
- public\robots.txt – Robots file
- dist\index.html – Built frontend entry
- dist\assets\*.js, *.css – Built assets
- dist\robots.txt – Built robots file
- dist\logo.svg – Built asset

## Test Setup

- src\test\setup.ts – Vitest setup (globals/mocks)

## Notes

- node_modules directories exist for both frontend and backend; contents are managed by the package managers and not listed here.
- The payment flow uses backend\routes\payments.js and frontend SignUp.tsx/SelectPlan.tsx for order creation, callback handling, and dev bypass.


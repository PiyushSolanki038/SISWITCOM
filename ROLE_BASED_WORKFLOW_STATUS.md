# Role-Based Workflow Status Report

**Date:** 2026-01-26
**Project:** Sirius Infra Platform

## 1. Executive Summary
The platform has successfully implemented a comprehensive **Role-Based Access Control (RBAC)** system. This system differentiates between internal users (Owner, Admin, Employee) and external users (Customer), enforcing strict workflows and data visibility rules as per the Permission Matrix.

**Current Status:**
- ✅ **Frontend:** Fully Enforced (Navigation, Routing, UI Elements).
- ⚠️ **Backend:** Role Models exist; API Endpoint protection is pending (currently relies on frontend guards).

---

## 2. Role Definitions

| Role | Type | Description |
| :--- | :--- | :--- |
| **Owner** | Internal | Full system access, including subscription management and critical settings. |
| **Admin** | Internal | Full operational access; manages configurations, templates, and users. |
| **Employee** | Internal | Standard operational access (Sales/Ops); restricted from system settings and sensitive data. |
| **Customer** | External | Restricted Portal access; can only View Quotes, Sign Contracts, and Pay Invoices. |

---

## 3. Permission Matrix Implementation

The following matrix is strictly enforced in the frontend codebase via `src/config/roles.ts`.

| Module | Owner | Admin | Employee | Customer |
| :--- | :--- | :--- | :--- | :--- |
| **CRM** | Full | Full | Operate (View/Create/Edit) | View Self Only |
| **CPQ** | Full | Configure | Operate (Create Quotes) | Accept/Reject |
| **CLM** | Full | Configure | Draft/Send | Sign/View |
| **eSign** | Full | Configure | Send | Sign |
| **Billing** | Full | View | Create/Send | Pay |
| **Portal** | N/A | View | View | **Full Access** |
| **Workflows** | Full | Full | Use | N/A |
| **Approvals** | Full | Full | Request | N/A |
| **Templates** | Full | Full | Use | N/A |
| **Reports** | Full | Full | Partial (View/Export) | N/A |
| **Subscription**| Full | View | **No Access** | **No Access** |

---

## 4. Module Workflows & Restrictions

### **CRM (Customer Relationship Management)**
- **Workflow:** Employees track Leads, Opportunities, and Accounts.
- **Restriction:** Customers cannot access this module. They are redirected to the Portal if they attempt to navigate here.

### **CPQ (Configure, Price, Quote)**
- **Workflow:** 
    1. **Employee:** Creates a Quote → Sends to Customer.
    2. **Customer:** Receives Email/Link → Logs into Portal → Views Quote → **Accepts/Rejects**.
- **Restriction:** Customers cannot edit quotes or see internal pricing logic.

### **CLM (Contract Lifecycle Management)**
- **Workflow:**
    1. **Employee:** Drafts Contract using Templates → Sends for Signature.
    2. **Customer:** Logs into Portal → Reviews Contract → **E-Signs**.
- **Restriction:** Employees cannot delete signed contracts (Audit trail). Customers can only view contracts assigned to them.

### **Billing & Payments**
- **Workflow:**
    1. **Employee:** Generates Invoice → Sends to Customer.
    2. **Customer:** Views Invoice in Portal → Clicks "Pay Now" → Downloads Receipt.
- **Restriction:** Employees cannot process payments on behalf of customers (must be done via Portal for security).

### **Portal (External Access)**
- **Features:** Dashboard, Quotes, Documents, Signatures, Invoices.
- **Security:** Completely isolated from the main Dashboard layout. Uses a dedicated `RoleGuard` with `module="portal"`.

---

## 5. Technical Implementation

### **Frontend Enforcement**
The security logic is centralized in the React application:

1.  **`src/config/roles.ts`**:
    - Defines the `ROLE_PERMISSIONS` dictionary mapping roles to allowed modules.
    - Exports `canAccessModule(role, module)` and `canPerformAction(role, module, action)` for granular checks.

2.  **`src/components/layout/RoleGuard.tsx`**:
    - Wraps protected routes.
    - Checks user role against the requested module.
    - Redirects unauthorized users to `/unauthorized`.

3.  **`src/components/layout/Sidebar.tsx`**:
    - Dynamically renders navigation items based on the user's role.
    - **Hides** restricted sections (e.g., "Subscription" for Employees, "CRM" for Customers).

4.  **`src/routes/AppRoutes.tsx`**:
    - Implements **Smart Redirects**:
        - `Customer` login → Redirects to `/dashboard/portal/quotes`.
        - `Employee` login → Redirects to `/dashboard`.

### **Backend Status (To Be Verified)**
- **Authentication:** `server/src/routes/auth.ts` handles Login/Signup and distinguishes between `Employee` and `Customer` models.
- **Data Models:** Separate Mongoose models for `Employee` and `Customer` ensure data separation.
- **API Security:** Currently, the API endpoints **do not** have middleware to enforce role permissions. Security relies on the frontend not making unauthorized requests. *Recommendation: Implement backend JWT middleware for strict API security.*

---

## 6. Next Steps
1.  **Backend Middleware:** Implement `authMiddleware` to verify JWT tokens on all `/api/*` routes.
2.  **Role Middleware:** Implement `roleMiddleware` to mirror frontend permissions on the backend (e.g., block Customers from `POST /api/crm/deals`).
3.  **Audit Logs:** Enhance the Reports module to track "Who did what" for compliance.

# Employee Dashboard: Current Workflow & Status Report

## 1. CRM (Customer Relationship Management)
**Status:** Functional (Service Layer with Local Storage/Mock)

The CRM module is the central hub for managing customer interactions and sales pipelines.

### Workflow
1.  **Leads**:
    *   Users create **Leads** via the "Add Lead" dialog.
    *   Leads are tracked through stages: New -> Contacted -> Qualified -> Proposal -> Negotiation -> Won/Lost.
    *   Leads can be converted (conceptually) or managed via the Kanban board or List view.
2.  **Opportunities (Deals)**:
    *   **Opportunities** represent potential sales.
    *   Users track deal value, stage (Qualification to Closed Won/Lost), and probability.
    *   Visualized via a **Pipeline Overview** on the Dashboard and a Kanban board in the Opportunities page.
3.  **Accounts & Contacts**:
    *   **Accounts** store company details (Industry, Revenue, Employees).
    *   **Contacts** store individual people associated with Accounts.
    *   The system supports linking Contacts to Accounts and logging Activities (Calls, Meetings, Emails) against them.

### Key Features
*   **Dashboard**: High-level view of Pipeline Value, Active Deals, and recent Activities.
*   **Activities**: Log and track interactions (Calls, Meetings, Tasks).
*   **Notes**: Rich text notes and timeline view.

---

## 2. CPQ (Configure, Price, Quote)
**Status:** UI Implemented / Mock Data

The CPQ module handles the generation and management of sales quotes.

### Workflow
1.  **Create Quote**:
    *   Accessible via the "New Quote" button on the Dashboard or Sidebar.
    *   Users select an Account and add Line Items (Products).
2.  **Quote Management**:
    *   Quotes track status: **Draft -> Pending Approval -> Approved -> Sent**.
    *   The system calculates Subtotal, Discounts, Tax, and Grand Total.
3.  **Approvals**:
    *   Dedicated section for managing quotes requiring internal approval before sending to clients.

### Observations
*   Currently relies on static mock data in `Quotes.tsx`.
*   Product management exists (`Products.tsx`) but integration with Quote creation is UI-focused.

---

## 3. CLM (Contract Lifecycle Management)
**Status:** UI Implemented / Mock Data

The CLM module manages the lifecycle of legal agreements.

### Workflow
1.  **Create Contract**:
    *   Users initiate a contract, selecting a type (MSA, NDA, Service Agreement).
    *   Contracts are linked to Accounts/Customers.
2.  **Lifecycle Stages**:
    *   **Draft -> In Review -> Pending Signature -> Active -> Expired**.
    *   Includes tracking for **Renewals** (Auto/Manual).
3.  **Templates**:
    *   Support for contract templates to standardize agreement creation.

### Observations
*   Currently relies on static mock data in `Contracts.tsx`.
*   "Signatures" section tracks the signing status of contracts.

---

## 4. Sign Docs (E-Sign)
**Status:** UI Implemented / Mock Data

The E-Sign module handles electronic signature requests independent of full contracts or as part of them.

### Workflow
1.  **New Request**:
    *   Users create a signature request for a document.
2.  **Tracking**:
    *   Requests are filtered by status: **Pending, Completed, Rejected, Expired**.
    *   Search and Filter functionality allows finding specific requests.

### Observations
*   Currently uses an empty mock array (`MOCK_REQUESTS`) in `ESignRequests.tsx`.
*   UI supports searching and tabbed filtering.

---

## 5. Create Project
**Status:** ⚠️ **Not Implemented / Not Found**

### Analysis
*   **Current State**: There is no explicit "Create Project" workflow, page, or button in the current Employee Dashboard codebase.
*   **Gap**: While CRM (Deals) and CLM (Contracts) exist, the transition to "Project Delivery" is not currently built.
*   **Recommendation**:
    *   This feature likely needs to be built.
    *   **Potential Workflow**: Trigger "Create Project" automatically when an Opportunity is "Closed Won" or a Contract is "Signed".
    *   **Location**: Should likely reside under a new "Projects" or "Delivery" module in the Sidebar.

---

## Summary of "Debuy" (Debug/Detail)
*   **CRM**: Most mature module. Uses a shared `crmService` and supports CRUD operations.
*   **CPQ/CLM/E-Sign**: strong UI shells with consistent design patterns (Lucide icons, Shadcn UI components) but currently powered by isolated mock data arrays.
*   **Create Project**: Missing entirely from the navigation and codebase.

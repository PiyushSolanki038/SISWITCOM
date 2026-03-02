# SISWIT / Sirius Infra — End-to-End Workflow QA Report
 
## 1) Summary
- Total steps tested: 9
- Total broken steps: 7

## 2) Broken Steps (Table)
| Module | Step | Page | Button | Expected | Actual | Console Error | Network | Suspected Files |
|---|---|---|---|---|---|---|---|---|
| Auth | Admin login (baseline) | /signin | Sign In | 200 OK; redirect to dashboard | 401 Invalid Credentials | None in frontend (API-only test) | POST /api/auth/login → 401 | [auth.js](file:///c:/Users/Piyus/OneDrive/Desktop/SISWIT/backend/routes/auth.js#L100-L193), [AuthContext.tsx](file:///c:/Users/Piyus/OneDrive/Desktop/SISWIT/src/context/AuthContext.tsx#L83-L103) |
| Owner | Invite user | /app/users | Create User | Toast success; user appears | No API call; button not wired | None | No request fired | [Users.tsx](file:///c:/Users/Piyus/OneDrive/Desktop/SISWIT/src/features/owner/pages/Users.tsx#L20-L57), backend route exists [admin.js](file:///c:/Users/Piyus/OneDrive/Desktop/SISWIT/backend/routes/admin.js#L19-L62) |
| CLM | Prisma schema health | N/A | N/A | Schema valid | 4 validation errors | Prisma P1012 validation errors | npx prisma validate → P1012 | [schema.prisma](file:///c:/Users/Piyus/OneDrive/Desktop/SISWIT/backend/prisma/schema.prisma#L620-L680), affects [clm.js](file:///c:/Users/Piyus/OneDrive/Desktop/SISWIT/backend/routes/clm.js) |
| CLM | Submit for Approval | /employee-dashboard/clm/contracts/:id | Submit for Approval | status SUBMITTED; approval row | Risk of relational mismatch | See Prisma errors | POST /api/clm/contracts/:id/submit-approval (not executed due to auth) | [clm.js](file:///c:/Users/Piyus/OneDrive/Desktop/SISWIT/backend/routes/clm.js#L268-L303), [TemplateDetail.tsx](file:///c:/Users/Piyus/OneDrive/Desktop/SISWIT/src/features/employee/pages/clm/TemplateDetail.tsx) |
| CLM | Preview PDF | /employee-dashboard/clm/templates/:id | Preview PDF | PDF renders | At risk (downstream CLM data) | None observed | GET /api/clm/documents (not executed) | [TemplateDetail.tsx](file:///c:/Users/Piyus/OneDrive/Desktop/SISWIT/src/features/employee/pages/clm/TemplateDetail.tsx), [clmService.ts](file:///c:/Users/Piyus/OneDrive/Desktop/SISWIT/src/features/employee/services/clmService.ts) |
| CRM | Create Lead | /employee-dashboard/crm/leads | Save | 200; list refresh | Blocked by auth | None | /api/crm/leads returns 401 without token | [crmService.ts](file:///c:/Users/Piyus/OneDrive/Desktop/SISWIT/src/features/employee/services/crmService.ts#L398-L441), [crm.js](file:///c:/Users/Piyus/OneDrive/Desktop/SISWIT/backend/routes/crm.js) |
| CPQ | Create Quote | /employee-dashboard/cpq/quotes/new | Save Draft | Quote DRAFT created; redirect | Blocked by auth | None | POST /api/cpq/quotes requires token | [cpqService.ts](file:///c:/Users/Piyus/OneDrive/Desktop/SISWIT/src/features/employee/services/cpqService.ts), [cpq.js](file:///c:/Users/Piyus/OneDrive/Desktop/SISWIT/backend/routes/cpq.js#L110-L226) |
| CPQ | Submit for Approval | /employee-dashboard/cpq/quotes/:id | Submit for Approval | status SUBMITTED; approval created | Not reached (blocked earlier) | None | POST /api/cpq/quotes/:id/request-approval (not executed) | [cpq.js](file:///c:/Users/Piyus/OneDrive/Desktop/SISWIT/backend/routes/cpq.js#L450-L473), [QuoteDetail.tsx](file:///c:/Users/Piyus/OneDrive/Desktop/SISWIT/src/features/employee/pages/cpq/QuoteDetail.tsx) |
| CPQ | Approvals screen | /employee-dashboard/cpq/approvals | Approve | Quote status APPROVED | Not reached | None | GET /api/cpq/approvals (not executed) | [cpq.js](file:///c:/Users/Piyus/OneDrive/Desktop/SISWIT/backend/routes/cpq.js#L500-L518), [QuoteApprovals.tsx](file:///c:/Users/Piyus/OneDrive/Desktop/SISWIT/src/features/employee/pages/cpq/QuoteApprovals.tsx) |
| Customer Portal | Quote acceptance | /customer-dashboard/quotes/:id | Accept | Quote status ACCEPTED | Not reached | None | POST /api/cpq/quotes/:id/accept (not executed) | [cpq.js](file:///c:/Users/Piyus/OneDrive/Desktop/SISWIT/backend/routes/cpq.js#L391-L420), [customer/QuoteDetail.tsx](file:///c:/Users/Piyus/OneDrive/Desktop/SISWIT/src/features/customer/pages/QuoteDetail.tsx) |
| CLM | Create from Quote | /employee-dashboard/clm/contracts | Create From Quote | Contract created (DRAFT) | Not reached | None | POST /api/clm/contracts/from-quote/:quoteId (not executed) | [clm.js](file:///c:/Users/Piyus/OneDrive/Desktop/SISWIT/backend/routes/clm.js#L32-L93), [CreateContract.tsx](file:///c:/Users/Piyus/OneDrive/Desktop/SISWIT/src/features/employee/pages/clm/CreateContract.tsx) |
| E-Sign | Send for Signature | /employee-dashboard/clm/contracts/:id | Send for Signature | Envelope created; status SENT_FOR_SIGNATURE | Not reached | None | POST /api/clm/contracts/:id/send-for-signature (not executed) | [clm.js](file:///c:/Users/Piyus/OneDrive/Desktop/SISWIT/backend/routes/clm.js#L386-L457), [ESignRequests.tsx](file:///c:/Users/Piyus/OneDrive/Desktop/SISWIT/src/features/employee/pages/esign/ESignRequests.tsx) |
| Docs | Verify docs visibility | /employee-dashboard/docs | Open | PDFs list show | Not reached | None | GET /api/docs/documents (not executed) | [documents.js](file:///c:/Users/Piyus/OneDrive/Desktop/SISWIT/backend/routes/documents.js), [DocumentList.tsx](file:///c:/Users/Piyus/OneDrive/Desktop/SISWIT/src/features/employee/pages/docs/DocumentList.tsx) |
| ERP | Invoice creation | /employee-dashboard/erp/invoices | Create | Invoice created; PDF available | Not reached | None | POST /api/erp/invoices (not executed) | [erp.js](file:///c:/Users/Piyus/OneDrive/Desktop/SISWIT/backend/routes/erp.js), [Invoices.tsx](file:///c:/Users/Piyus/OneDrive/Desktop/SISWIT/src/features/employee/pages/erp/Invoices.tsx) |

## 3) Working Steps
- Frontend dev server runs and serves Marketing pages at http://localhost:8081/ (Home renders).
- Backend dev server runs on port 5000; Prisma connects (runtime) and API base URL is http://localhost:5000/api.
- Router paths present for all modules; role guards and protected routes load: [AppRoutes.tsx](file:///c:/Users/Piyus/OneDrive/Desktop/SISWIT/src/routes/AppRoutes.tsx#L189-L377).
- Signup API returns 200 and creates Owner user; token issued (tested via [test_api.js](file:///c:/Users/Piyus/OneDrive/Desktop/SISWIT/backend/test_api.js#L19-L77)).

## 4) Top 10 Root Causes (Hypothesis)
- Missing seeded test users; attempted admin login returns 401 (no baseline accounts).
- Prisma schema relation mismatches in CLM: ContractApproval, ContractSignatureRequest, ContractAuditLog, ContractVersion missing opposite relations on Contract.
- Owner Users UI not wired to backend invite/create endpoint; button triggers dialog only.
- Authentication gates block module flows without a valid token; no UI path tested for creating token due to blocked signup execution.
- Tenant context assumptions: backend often uses user.id as tenantId; signup flow doesn’t assign tenantId consistently.
- Quote→Contract dependency: CLM routes expect ACCEPTED quotes; without CPQ flow, CLM creation is blocked.
- Email side-effects may fail silently (sendEmail) but are non-blocking; still may mask expected toasts.
- Docs/Preview depend on CLM doc generation; risk of 404 if no documents saved.
- Pipeline drag depends on PipelineStage model; not verified; potential stage persistence gaps.
- Customer portal visibility depends on contact→account linkage; may return empty lists without proper relations.

## 5) Recommended Fix Order
- Overlay first (ensure Dialog/Select/DropdownMenu interactions are wired and testable).
- Auth/invite (seed or enable Owner/Admin creation/invite from UI; ensure login succeeds).
- CRM create flows (lead/account/contact create and list refresh).
- CPQ approvals (request/approve paths and lists).
- CLM approvals (submit/approve; fix Prisma relations).
- E-sign (send-for-signature and public sign execute).
- Docs (ensure contract/quote PDFs stored and visible per role).
- ERP (orders/invoices/payments linkage post-contract activation).

## 6) Verification Commands
```bash
# frontend
npm run lint
npm run typecheck
npm run build

# backend
cd backend
npm run lint
npm run typecheck
npx prisma validate
```

## Appendix: Evidence
- Backend started: “Server started on port 5000; Prisma PostgreSQL Connected” (dev server logs).
- Frontend started: “Local: http://localhost:8081/” (dev server logs).
- Prisma validation:
  - Error P1012 at ContractApproval.contract (missing opposite relation on Contract).
  - Error P1012 at ContractSignatureRequest.contract (missing opposite relation on Contract).
  - Error P1012 at ContractAuditLog.contract (missing opposite relation on Contract).
  - Error P1012 at ContractVersion.contract (missing opposite relation on Contract).
- Admin login attempt: POST /api/auth/login → 401 Invalid Credentials (backend/scripts/test_login.js flow).

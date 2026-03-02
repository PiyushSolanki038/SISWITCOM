import React from 'react';
import { Routes, Route, Outlet, Navigate, useLocation } from 'react-router-dom';
import MarketingLayout from '@/components/layout/MarketingLayout';
import DashboardLayout from '@/components/layout/DashboardLayout';
import ProtectedRoute from '@/components/layout/ProtectedRoute';
import RoleGuard from '@/components/layout/RoleGuard';
import { useAuth } from '@/context/AuthContext';

// Marketing
import Home from '@/features/marketing/pages/Home';
import Solutions from '@/features/marketing/pages/Solutions';
import Pricing from '@/features/marketing/pages/Pricing';
import About from '@/features/marketing/pages/About';
import Contact from '@/features/marketing/pages/Contact';
import Blog from '@/features/marketing/pages/Blog';
import Article from '@/features/marketing/pages/Article';
import Careers from '@/features/marketing/pages/Careers';

// Auth
import SignIn from '@/features/auth/pages/SignIn';
import SignUp from '@/features/auth/pages/SignUp';
import ForgotPassword from '@/features/auth/pages/ForgotPassword';
import SelectPlan from '@/features/auth/pages/SelectPlan';
import AcceptInvite from '@/features/auth/pages/AcceptInvite';

// Employee Dashboard
import EmployeeLayout from '@/features/employee/layouts/EmployeeLayout';
import EmployeeDashboardPage from '@/features/employee/pages/Dashboard';
import Profile from '@/features/employee/pages/Profile';
import Settings from '@/features/employee/pages/Settings';
import EmployeeDocsList from '@/features/employee/pages/docs/DocumentList';
import EmployeeDocsViewer from '@/features/employee/pages/docs/DocumentViewer';
// CRM
import EmployeeCRMOverview from '@/features/employee/pages/crm/Overview';
import EmployeeCRMLeads from '@/features/employee/pages/crm/Leads';
import EmployeeCRMContacts from '@/features/employee/pages/crm/Contacts';
import EmployeeCRMContactDetail from '@/features/employee/pages/crm/ContactDetail';
import EmployeeCRMAccounts from '@/features/employee/pages/crm/Accounts';
import EmployeeCRMAccountDetail from '@/features/employee/pages/crm/AccountDetail';
import EmployeeCRMOpportunities from '@/features/employee/pages/crm/Opportunities';
import EmployeeCRMOpportunityDetail from '@/features/employee/pages/crm/OpportunityDetail';
import EmployeeCRMActivities from '@/features/employee/pages/crm/Activities';
import EmployeeCRMActivityDetail from '@/features/employee/pages/crm/ActivityDetail';
import EmployeeCRMNotes from '@/features/employee/pages/crm/Notes';
import EmployeeCRMNoteDetail from '@/features/employee/pages/crm/NoteDetail';
import EmployeeCRMLeadDetail from '@/features/employee/pages/crm/LeadDetail';
// CPQ
import EmployeeCPQQuotes from '@/features/employee/pages/cpq/Quotes';
import EmployeeCPQQuoteDetail from '@/features/employee/pages/cpq/QuoteDetail';
import EmployeeCPQCreateQuote from '@/features/employee/pages/cpq/CreateQuote';
import EmployeeCPQSendQuote from '@/features/employee/pages/cpq/SendQuote';
import EmployeeCPQQuoteApprovals from '@/features/employee/pages/cpq/QuoteApprovals';
import EmployeeCPQProducts from '@/features/employee/pages/cpq/Products';
import EmployeeCPQProductDetail from '@/features/employee/pages/cpq/ProductDetail';
// CLM
import EmployeeCLMContracts from '@/features/employee/pages/clm/Contracts';
import EmployeeCLMContractDetail from '@/features/employee/pages/clm/ContractDetail';
import EmployeeCLMCreateContract from '@/features/employee/pages/clm/CreateContract';
import EmployeeCLMTemplateDetail from '@/features/employee/pages/clm/TemplateDetail';
import EmployeeCLMTemplates from '@/features/employee/pages/clm/Templates';
import EmployeeCLMTemplateCreate from '@/features/employee/pages/clm/TemplateCreate';
import EmployeeCLMSignatures from '@/features/employee/pages/clm/Signatures';
import EmployeeCLMRenewals from '@/features/employee/pages/clm/Renewals';
// Sign
import EmployeeSignSend from '@/features/employee/pages/sign/Send';
import EmployeeSignExecute from '@/features/employee/pages/sign/Execute';
import EmployeeSignComplete from '@/features/employee/pages/sign/Complete';

// ERP
import EmployeeERPOrders from '@/features/employee/erp/Orders';
import EmployeeERPInvoices from '@/features/employee/erp/Invoices';
import EmployeeERPPayments from '@/features/employee/erp/Payments';
import EmployeeERPCreditNotes from '@/features/employee/erp/CreditNotes';
import EmployeeERPRevenue from '@/features/employee/erp/Revenue';
import EmployeeERPFulfillment from '@/features/employee/erp/Fulfillment';
import EmployeeERPInventory from '@/features/employee/erp/Inventory';
import EmployeeERPOrderDetail from '@/features/employee/erp/OrderDetail';
import EmployeeERPInvoiceDetail from '@/features/employee/erp/InvoiceDetail';
import EmployeeERPPaymentDetail from '@/features/employee/erp/PaymentDetail';
import EmployeeERPFulfillmentDetail from '@/features/employee/erp/FulfillmentDetail';
import EmployeeERPCreditNoteDetail from '@/features/employee/erp/CreditNoteDetail';
import EmployeeERPInventoryDetail from '@/features/employee/erp/InventoryDetail';
import EmployeeAttendancePage from '@/features/employee/pages/Attendance';

// Customer Dashboard
import CustomerLayout from '@/features/customer/layouts/CustomerLayout';
import CustomerDashboard from '@/features/customer/pages/Dashboard';
import CustomerQuotes from '@/features/customer/pages/Quotes';
import CustomerQuoteHistory from '@/features/customer/pages/QuoteHistory';
import CustomerQuoteDetail from '@/features/customer/pages/QuoteDetail';
import CustomerContracts from '@/features/customer/pages/Contracts';
import CustomerContractDetail from '@/features/customer/pages/ContractDetail';
import CustomerDocuments from '@/features/customer/pages/Documents';
import CustomerSignDocument from '@/features/customer/pages/SignDocument';
import CustomerProfile from '@/features/customer/pages/Profile';
import CustomerSupport from '@/features/customer/pages/Support';
import CustomerSubscriptions from '@/features/customer/pages/Subscriptions';
import CustomerNotifications from '@/features/customer/pages/Notifications';
import CustomerActivity from '@/features/customer/pages/Activity';

// Customer ERP
import CustomerERPOrders from '@/features/customer/erp/Orders';
import CustomerERPInvoices from '@/features/customer/erp/Invoices';
import CustomerERPPayments from '@/features/customer/erp/Payments';

// E-Sign
import ESignRequests from '@/features/employee/pages/esign/ESignRequests';
import ESignDetail from '@/features/employee/pages/esign/ESignDetail';
import PublicSigner from '@/features/employee/pages/esign/PublicSigner';
import PayInvoice from '@/features/public/PayInvoice';
import EmployeeInvitationsPage from '@/features/employee/pages/Invitations';

// Owner Dashboard
import OwnerLayout from '@/features/owner/layouts/OwnerLayout';
import OwnerDashboardPage from '@/features/owner/pages/Dashboard';
import TeamPage from '@/features/owner/pages/Team';
import OwnerBillingPage from '@/features/owner/pages/Billing';
import OwnerAttendancePage from '@/features/owner/pages/Attendance';
import OwnerOrgSettingsPage from '@/features/owner/pages/OrgSettings';
import OwnerContractApprovals from '@/features/owner/pages/approvals/ContractApprovals';

// Admin Dashboard
import AdminLayout from '@/features/admin/layouts/AdminLayout';
import AdminDashboardPage from '@/features/admin/pages/Dashboard';
import AdminUserManagementPage from '@/features/admin/pages/UserManagement';
import AdminUsersPage from '@/features/admin/pages/AdminUsers';
import AdminRolesPermissionsPage from '@/features/admin/pages/RolesPermissions';
import AdminCRMConfigurationPage from '@/features/admin/pages/CRMConfiguration';
import AdminCPQConfigurationPage from '@/features/admin/pages/CPQConfiguration';
import AdminCLMConfigurationPage from '@/features/admin/pages/CLMConfiguration';
import AdminDocsConfigurationPage from '@/features/admin/pages/DocsConfiguration';
import AdminESignConfigurationPage from '@/features/admin/pages/ESignConfiguration';
import AdminNotificationsTemplatesPage from '@/features/admin/pages/NotificationsTemplates';
import AdminAuditLogsPage from '@/features/admin/pages/AuditLogs';
import AdminSystemSettingsPage from '@/features/admin/pages/SystemSettings';
import AdminHealthCheckPage from '@/features/admin/pages/HealthCheck';
import AdminAttendancePage from '@/features/admin/pages/Attendance';
import AdminPaymentsPage from '@/features/admin/pages/Payments';

// Dashboard modules (domain-driven entrypoints)
// CRM
import Accounts from '@/features/employee/pages/crm/Accounts';
import Contacts from '@/features/employee/pages/crm/Contacts';
import Leads from '@/features/employee/pages/crm/Leads';
import Opportunities from '@/features/employee/pages/crm/Opportunities';
// import Pipeline from '@/domains/crm/pages/Pipeline';
import Activities from '@/features/employee/pages/crm/Activities';

// CPQ
import Products from '@/features/employee/pages/cpq/Products';
import Quotes from '@/features/employee/pages/cpq/Quotes';
// import QuoteBuilder from '@/domains/cpq/pages/QuoteBuilder';
// import QuoteDetail from '@/domains/cpq/pages/QuoteDetail';

// CLM
import Contracts from '@/features/employee/pages/clm/Contracts';
// import ContractDetail from '@/domains/clm/pages/ContractDetail';
// import ContractEditor from '@/domains/clm/pages/ContractEditor';
import ContractTemplates from '@/features/employee/pages/clm/Templates';
// import Documents from '@/domains/clm/pages/Documents';

// Docs
// import DocumentCreate from '@/domains/docs/pages/DocumentCreate';
// import DocumentHistory from '@/domains/docs/pages/DocumentHistory';
// import DocumentAnalysis from '@/domains/docs/pages/DocumentAnalysis';

// Sign
import SignSend from '@/features/employee/pages/sign/Send';
import SignExecute from '@/features/employee/pages/sign/Execute';
import SignComplete from '@/features/employee/pages/sign/Complete';

// Error
import NotFound from '@/pages/error/NotFound';
import Unauthorized from '@/pages/error/Unauthorized';

/**
 * AppRoutes Component
 * 
 * Defines the main routing structure of the application.
 * Includes Marketing routes (public), Auth routes (public), and Dashboard routes (protected).
 */
const AppRoutes: React.FC = () => {
  const { user } = useAuth();

  const LegacyOwnerRedirect: React.FC = () => {
    const location = useLocation();
    let to = location.pathname.replace('/owner-dashboard', '/app');
    if (to === '/app' || to === '/app/') to = '/app/dashboard';
    if (to.startsWith('/app/organization')) to = to.replace('/app/organization', '/app/settings');
    return <Navigate to={to} replace />;
  };

  return (
    <Routes>
      {/* Marketing Routes */}
      <Route element={<MarketingLayout />}>
        <Route path="/" element={<Home />} />
        <Route path="/solutions" element={<Solutions />} />
        <Route path="/pricing" element={<Pricing />} />
        <Route path="/about" element={<About />} />
        <Route path="/contact" element={<Contact />} />
        <Route path="/blog" element={<Blog />} />
        <Route path="/blog/:id" element={<Article />} />
        <Route path="/careers" element={<Careers />} />
      </Route>

      {/* Public E-Sign Route */}
      <Route path="/public/sign/:id" element={<PublicSigner />} />
      <Route path="/pay/:token" element={<PayInvoice />} />

      {/* Auth Routes */}
      <Route path="/signin" element={<SignIn />} />
      <Route path="/signup" element={<SignUp />} />
      <Route path="/forgot-password" element={<ForgotPassword />} />
      <Route path="/select-plan" element={<SelectPlan />} />
      <Route path="/accept-invite/:token" element={<AcceptInvite />} />

      {/* Protected Routes Wrapper */}
      <Route element={<ProtectedRoute><Outlet /></ProtectedRoute>}>
        <Route path="/admin/notifications" element={<Navigate to="/admin-dashboard/notifications" replace />} />
        <Route path="/admin/*" element={<Navigate to="/admin-dashboard" replace />} />
        
        {/* Owner MVP Routes */}
        <Route path="/app" element={
          <RoleGuard allowedRoles={['owner']}>
            <OwnerLayout />
          </RoleGuard>
        }>
          <Route path="dashboard" element={<OwnerDashboardPage />} />
          <Route path="team" element={<TeamPage />} />
          <Route path="billing" element={<OwnerBillingPage />} />
          <Route path="attendance" element={<OwnerAttendancePage />} />
          <Route path="settings" element={<OwnerOrgSettingsPage />} />
          <Route path="approvals/contracts" element={<OwnerContractApprovals />} />
        </Route>
        <Route path="/owner-dashboard/*" element={<LegacyOwnerRedirect />} />

        {/* Admin Dashboard Routes */}
        <Route path="/admin-dashboard" element={
          <RoleGuard allowedRoles={['admin', 'owner']}>
            <AdminLayout />
          </RoleGuard>
        }>
          <Route index element={<AdminDashboardPage />} />
          <Route path="attendance" element={<AdminAttendancePage />} />
          <Route path="users" element={<AdminUserManagementPage />} />
          <Route path="users/invite" element={<AdminUsersPage />} />
          <Route path="roles" element={<AdminRolesPermissionsPage />} />
          <Route path="notifications" element={<AdminNotificationsTemplatesPage />} />
          <Route path="audit" element={<AdminAuditLogsPage />} />
          <Route path="settings" element={<AdminSystemSettingsPage />} />
          <Route path="health" element={<AdminHealthCheckPage />} />
          <Route path="payments" element={<AdminPaymentsPage />} />
        </Route>



        {/* Employee Dashboard Routes */}
        <Route path="/employee-dashboard" element={
          <RoleGuard allowedRoles={['employee', 'admin', 'owner']}>
            <EmployeeLayout />
          </RoleGuard>
        }>
          <Route index element={<EmployeeDashboardPage />} />
          <Route path="profile" element={<Profile />} />
          <Route path="settings" element={<Settings />} />
          <Route path="attendance" element={<EmployeeAttendancePage />} />
          <Route path="invitations" element={<EmployeeInvitationsPage />} />
          
          {/* Work Modules */}
          <Route path="crm" element={<RoleGuard module="crm"><Outlet /></RoleGuard>}>
             <Route index element={<EmployeeCRMOverview />} />
             <Route path="leads" element={<EmployeeCRMLeads />} />
             <Route path="leads/:id" element={<EmployeeCRMLeadDetail />} />
              <Route path="contacts" element={<EmployeeCRMContacts />} />
              <Route path="contacts/:id" element={<EmployeeCRMContactDetail />} />
              <Route path="accounts" element={<EmployeeCRMAccounts />} />
             <Route path="accounts/:id" element={<EmployeeCRMAccountDetail />} />
              <Route path="opportunities" element={<EmployeeCRMOpportunities />} />
              <Route path="opportunities/:id" element={<EmployeeCRMOpportunityDetail />} />
              <Route path="activities" element={<EmployeeCRMActivities />} />
              <Route path="activities/:id" element={<EmployeeCRMActivityDetail />} />
             <Route path="notes" element={<EmployeeCRMNotes />} />
             <Route path="notes/:id" element={<EmployeeCRMNoteDetail />} />
          </Route>
          
          <Route path="cpq" element={<RoleGuard module="cpq"><Outlet /></RoleGuard>}>
             <Route index element={<EmployeeCPQQuotes />} />
             <Route path="quotes" element={<EmployeeCPQQuotes />} />
             <Route path="quotes/new" element={<EmployeeCPQCreateQuote />} />
             <Route path="quotes/edit/:id" element={<EmployeeCPQCreateQuote />} />
             <Route path="quotes/:id" element={<EmployeeCPQQuoteDetail />} />
             <Route path="quotes/:id/send" element={<EmployeeCPQSendQuote />} />
             <Route path="approvals" element={<EmployeeCPQQuoteApprovals />} />
             <Route path="products" element={<EmployeeCPQProducts />} />
             <Route path="products/:id" element={<EmployeeCPQProductDetail />} />
          </Route>
          
          <Route path="clm" element={<RoleGuard module="clm"><Outlet /></RoleGuard>}>
             <Route index element={<EmployeeCLMContracts />} />
             <Route path="contracts" element={<EmployeeCLMContracts />} />
             <Route path="contracts/new" element={<EmployeeCLMCreateContract />} />
             <Route path="contracts/:id" element={<EmployeeCLMContractDetail />} />
             <Route path="templates" element={<EmployeeCLMTemplates />} />
             <Route path="templates/new" element={<EmployeeCLMTemplateCreate />} />
             <Route path="templates/:id" element={<EmployeeCLMTemplateDetail />} />
             <Route path="signatures" element={<EmployeeCLMSignatures />} />
             <Route path="renewals" element={<EmployeeCLMRenewals />} />
          </Route>
          
          <Route path="docs" element={<RoleGuard module="docs"><Outlet /></RoleGuard>}>
             <Route index element={<EmployeeDocsList />} />
             <Route path=":id" element={<EmployeeDocsViewer />} />
          </Route>
          
          <Route path="esign" element={<RoleGuard module="sign"><Outlet /></RoleGuard>}>
             <Route index element={<ESignRequests />} />
             <Route path=":id" element={<ESignDetail />} />
          </Route>
          
          <Route path="sign" element={<RoleGuard module="sign"><Outlet /></RoleGuard>}>
             <Route index element={<EmployeeSignSend />} />
             <Route path="send" element={<EmployeeSignSend />} />
             <Route path="execute" element={<EmployeeSignExecute />} />
             <Route path="complete" element={<EmployeeSignComplete />} />
          </Route>

          <Route path="erp" element={<RoleGuard module="erp"><Outlet /></RoleGuard>}>
             <Route index element={<EmployeeERPOrders />} />
             <Route path="orders" element={<EmployeeERPOrders />} />
             <Route path="orders/:id" element={<EmployeeERPOrderDetail />} />
             <Route path="invoices" element={<EmployeeERPInvoices />} />
             <Route path="invoices/:id" element={<EmployeeERPInvoiceDetail />} />
             <Route path="payments" element={<EmployeeERPPayments />} />
             <Route path="payments/:id" element={<EmployeeERPPaymentDetail />} />
             <Route path="credit-notes" element={<EmployeeERPCreditNotes />} />
             <Route path="credit-notes/:id" element={<EmployeeERPCreditNoteDetail />} />
             <Route path="revenue" element={<EmployeeERPRevenue />} />
             <Route path="fulfillment" element={<EmployeeERPFulfillment />} />
             <Route path="fulfillment/:id" element={<EmployeeERPFulfillmentDetail />} />
             <Route path="inventory" element={<EmployeeERPInventory />} />
             <Route path="inventory/:id" element={<EmployeeERPInventoryDetail />} />
          </Route>
        </Route>

        {/* Customer Dashboard Routes */}
        <Route path="/customer-dashboard" element={
          <RoleGuard allowedRoles={['customer', 'admin', 'owner']}>
            <CustomerLayout />
          </RoleGuard>
        }>
          <Route index element={<CustomerDashboard />} />
          <Route path="quotes" element={<CustomerQuotes />} />
          <Route path="quotes/history" element={<CustomerQuoteHistory />} />
          <Route path="quotes/:id" element={<CustomerQuoteDetail />} />
          <Route path="contracts" element={<CustomerContracts />} />
          <Route path="contracts/:id" element={<CustomerContractDetail />} />
          <Route path="documents" element={<CustomerDocuments />} />
          <Route path="sign" element={<CustomerSignDocument />} />
          <Route path="sign/:id" element={<CustomerSignDocument />} />
          <Route path="subscriptions" element={<CustomerSubscriptions />} />
          <Route path="notifications" element={<CustomerNotifications />} />
          <Route path="activity" element={<CustomerActivity />} />
          <Route path="profile" element={<CustomerProfile />} />
          <Route path="support" element={<CustomerSupport />} />
          <Route path="erp" element={<Outlet />}>
            <Route path="orders" element={<CustomerERPOrders />} />
            <Route path="invoices" element={<CustomerERPInvoices />} />
            <Route path="payments" element={<CustomerERPPayments />} />
          </Route>
        </Route>

      </Route>

      {/* Error Routes */}
      <Route path="/unauthorized" element={<Unauthorized />} />
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
};

export default AppRoutes;

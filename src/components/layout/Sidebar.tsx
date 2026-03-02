import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import {
  LayoutDashboard,
  Users,
  ShoppingCart,
  FileCheck,
  FolderOpen,
  PenTool,
  ChevronDown,
  ChevronRight,
  LogOut,
  HelpCircle,
  Bell,
  CreditCard,
  BarChart3,
  Package,
  FileText,
  DollarSign,
  Truck,
  Layers,
  Archive,
  AlertCircle
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';

interface NavItem {
  label: string;
  href: string;
  icon: React.ReactNode;
  module: string;
  children?: { label: string; href: string }[];
}

interface NavGroup {
  title?: string;
  items: NavItem[];
}

export const SidebarContent: React.FC<{ onClose?: () => void }> = ({ onClose }) => {
  const { user, logout } = useAuth();
  const location = useLocation();
  const [expandedItems, setExpandedItems] = React.useState<string[]>(['crm', 'cpq', 'clm', 'docs', 'sign', 'erp']);

  const dashboardPath = 
    (user?.role === 'customer' || user?.role === 'Customer') ? '/customer-dashboard' : 
    (user?.role === 'owner' || user?.role === 'Owner') ? '/owner-dashboard' :
    (user?.role === 'admin' || user?.role === 'Admin') ? '/admin-dashboard' :
    '/employee-dashboard';

  const toggleExpand = (module: string) => {
    setExpandedItems(prev => 
      prev.includes(module) ? prev.filter(item => item !== module) : [...prev, module]
    );
  };

  const isActive = (href: string) => location.pathname === href || location.pathname.startsWith(href);

  // --- EMPLOYEE SIDEBAR STRUCTURE ---
  const employeeNavGroups: NavGroup[] = [
    {
      items: [
        {
          label: 'Dashboard',
          href: dashboardPath,
          icon: <LayoutDashboard size={18} />,
          module: 'dashboard',
        }
      ]
    },
    {
      title: 'CRM (Sales)',
      items: [
        {
          label: 'CRM Overview',
          href: '/employee/crm',
          icon: <Users size={18} />,
          module: 'crm',
          children: [
            { label: 'Leads', href: '/employee/crm/leads' },
            { label: 'Accounts', href: '/employee/crm/accounts' },
            { label: 'Contacts', href: '/employee/crm/contacts' },
            { label: 'Opportunities', href: '/employee/crm/opportunities' },
            { label: 'Activities', href: '/employee/crm/activities' },
            { label: 'Pipeline/Forecast', href: '/employee/crm/opportunities' }, // Reusing Opps for now
            { label: 'Reports', href: '/employee/crm/overview' },
          ]
        }
      ]
    },
    {
      title: 'CPQ (Quotes)',
      items: [
        {
          label: 'CPQ Manager',
          href: '/employee/cpq',
          icon: <ShoppingCart size={18} />,
          module: 'cpq',
          children: [
            { label: 'Quotes', href: '/employee/cpq/quotes' },
            { label: 'Quote Approvals', href: '/employee/cpq/approvals' },
            { label: 'Product Catalog', href: '/employee/cpq/products' },
            { label: 'Bundles', href: '/employee/cpq/products' },
            { label: 'Price Books', href: '/employee/cpq/products' },
            { label: 'Pricing Rules', href: '/employee/cpq/products' },
            { label: 'Promotions', href: '/employee/cpq/products' },
            { label: 'Taxes', href: '/employee/cpq/products' },
            { label: 'Renewals', href: '/employee/cpq/quotes' },
          ]
        }
      ]
    },
    {
      title: 'CLM (Contracts)',
      items: [
        {
          label: 'CLM Manager',
          href: '/employee/clm',
          icon: <FileCheck size={18} />,
          module: 'clm',
          children: [
            { label: 'Contracts', href: '/employee/clm/contracts' },
            { label: 'Contract Requests', href: '/employee/clm/contracts' },
            { label: 'Clause Library', href: '/employee/clm/templates' },
            { label: 'Templates', href: '/employee/clm/templates' },
            { label: 'Negotiation', href: '/employee/clm/contracts' },
            { label: 'Legal Approvals', href: '/employee/clm/contracts' },
            { label: 'Obligations', href: '/employee/clm/contracts' },
            { label: 'Risk/Compliance', href: '/employee/clm/contracts' },
          ]
        }
      ]
    },
    {
      title: 'Docs',
      items: [
        {
          label: 'Document Manager',
          href: '/employee/docs',
          icon: <FolderOpen size={18} />,
          module: 'docs',
          children: [
            { label: 'All Documents', href: '/employee/docs' },
            { label: 'Generated PDFs', href: '/employee/docs' },
            { label: 'Proposal Builder', href: '/employee/docs' },
            { label: 'Templates', href: '/employee/clm/templates' },
            { label: 'Content Library', href: '/employee/docs' },
            { label: 'Version History', href: '/employee/docs' },
          ]
        }
      ]
    },
    {
      title: 'eSign',
      items: [
        {
          label: 'eSignature',
          href: '/employee/esign',
          icon: <PenTool size={18} />,
          module: 'sign',
          children: [
            { label: 'Envelopes', href: '/employee/esign/requests' },
            { label: 'Signature Requests', href: '/employee/esign/requests' },
            { label: 'Signer Management', href: '/employee/esign/requests' },
            { label: 'Signed Docs', href: '/employee/docs' },
            { label: 'Audit Trail', href: '/employee/esign/requests' },
          ]
        }
      ]
    },
    {
      title: 'ERP (Finance)',
      items: [
        {
          label: 'ERP Manager',
          href: '/employee/erp',
          icon: <DollarSign size={18} />,
          module: 'erp',
          children: [
            { label: 'Sales Orders', href: '/employee/erp/orders' },
            { label: 'Invoices', href: '/employee/erp/invoices' },
            { label: 'Payments', href: '/employee/erp/payments' },
            { label: 'Credit Notes', href: '/employee/erp/credit-notes' },
            { label: 'Collections/Overdue', href: '/employee/erp/invoices?status=overdue' },
            { label: 'Revenue Rec.', href: '/employee/erp/revenue' },
            { label: 'Fulfillment', href: '/employee/erp/fulfillment' },
            { label: 'Inventory', href: '/employee/erp/inventory' },
          ]
        }
      ]
    }
  ];

  // --- CUSTOMER SIDEBAR STRUCTURE ---
  const customerNavGroups: NavGroup[] = [
    {
      items: [
        { label: 'Dashboard', href: '/customer-dashboard', icon: <LayoutDashboard size={18} />, module: 'dashboard' },
        { label: 'My Quotes', href: '/customer/quotes', icon: <ShoppingCart size={18} />, module: 'cpq' },
        { label: 'My Contracts', href: '/customer/contracts', icon: <FileCheck size={18} />, module: 'clm' },
        { label: 'My Documents', href: '/customer/documents', icon: <FolderOpen size={18} />, module: 'docs' },
        { label: 'eSign Requests', href: '/customer/sign', icon: <PenTool size={18} />, module: 'sign' },
        { label: 'My Orders', href: '/customer/orders', icon: <Package size={18} />, module: 'erp' },
        { label: 'Invoices', href: '/customer/invoices', icon: <FileText size={18} />, module: 'erp' },
        { label: 'Payments', href: '/customer/payments', icon: <CreditCard size={18} />, module: 'erp' },
        { label: 'Subscriptions', href: '/customer/subscriptions', icon: <Layers size={18} />, module: 'erp' },
        { label: 'My Profile', href: '/customer/profile', icon: <Users size={18} />, module: 'settings' },
      ]
    }
  ];

  // --- ADMIN/OWNER SIDEBAR STRUCTURE ---
  const adminNavGroups: NavGroup[] = [
    {
        items: [
            { label: 'Dashboard', href: '/admin-dashboard', icon: <LayoutDashboard size={18} />, module: 'dashboard' },
            { label: 'User Management', href: '/admin-dashboard/users', icon: <Users size={18} />, module: 'admin' },
            { label: 'System Settings', href: '/admin-dashboard/settings', icon: <Archive size={18} />, module: 'admin' },
            { label: 'Audit Logs', href: '/admin-dashboard/audit', icon: <AlertCircle size={18} />, module: 'admin' },
        ]
    }
  ];

    const ownerNavGroups: NavGroup[] = [
    {
        items: [
            { label: 'Dashboard', href: '/owner-dashboard', icon: <LayoutDashboard size={18} />, module: 'dashboard' },
            { label: 'Revenue Reports', href: '/owner/revenue', icon: <BarChart3 size={18} />, module: 'owner' },
            { label: 'Organization', href: '/owner/org', icon: <Archive size={18} />, module: 'owner' },
            { label: 'Users', href: '/owner/users', icon: <Users size={18} />, module: 'owner' },
            { label: 'Audit', href: '/owner/audit', icon: <AlertCircle size={18} />, module: 'owner' },
        ]
    }
  ];


  // Select the correct nav groups based on role
  const getNavGroups = () => {
    if (user?.role === 'customer' || user?.role === 'Customer') return customerNavGroups;
    if (user?.role === 'admin' || user?.role === 'Admin') return adminNavGroups;
    if (user?.role === 'owner' || user?.role === 'Owner') return ownerNavGroups;
    return employeeNavGroups; // Default to employee
  };

  const currentNavGroups = getNavGroups();

  return (
    <div className="flex flex-col h-full bg-slate-900 text-slate-300">
      {/* Sidebar Header */}
      <div className="p-6 flex items-center gap-3 border-b border-slate-800">
        <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center text-white font-bold">
          S
        </div>
        <div>
          <h2 className="font-bold text-white tracking-tight">Sirius Infra</h2>
          <p className="text-xs text-slate-400">Unified OS</p>
        </div>
      </div>

      {/* Navigation */}
      <div className="flex-1 overflow-y-auto py-6 px-3 space-y-6">
        {currentNavGroups.map((group, groupIndex) => (
          <div key={groupIndex}>
            {group.title && (
              <h3 className="px-3 mb-2 text-xs font-semibold uppercase tracking-wider text-slate-500">
                {group.title}
              </h3>
            )}
            <div className="space-y-1">
              {group.items.map((item) => (
                <div key={item.href}>
                  {item.children ? (
                    <div className="space-y-1">
                      <button
                        onClick={() => toggleExpand(item.module)}
                        className={cn(
                          "w-full flex items-center justify-between px-3 py-2 text-sm font-medium rounded-md transition-colors",
                          "hover:bg-slate-800 hover:text-white",
                          isActive(item.href) ? "bg-slate-800 text-white" : "text-slate-400"
                        )}
                      >
                        <div className="flex items-center gap-3">
                          {item.icon}
                          <span>{item.label}</span>
                        </div>
                        {expandedItems.includes(item.module) ? (
                          <ChevronDown size={14} />
                        ) : (
                          <ChevronRight size={14} />
                        )}
                      </button>

                      <AnimatePresence>
                        {expandedItems.includes(item.module) && (
                          <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: 'auto', opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            className="overflow-hidden pl-9 space-y-1"
                          >
                            {item.children.map((child) => (
                              <Link
                                key={child.href}
                                to={child.href}
                                onClick={onClose}
                                className={cn(
                                  "block px-3 py-2 text-sm rounded-md transition-colors",
                                  "hover:text-white",
                                  location.pathname === child.href ? "text-blue-400 font-medium" : "text-slate-500"
                                )}
                              >
                                {child.label}
                              </Link>
                            ))}
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  ) : (
                    <Link
                      to={item.href}
                      onClick={onClose}
                      className={cn(
                        "flex items-center gap-3 px-3 py-2 text-sm font-medium rounded-md transition-colors",
                        "hover:bg-slate-800 hover:text-white",
                        isActive(item.href) ? "bg-slate-800 text-white" : "text-slate-400"
                      )}
                    >
                      {item.icon}
                      <span>{item.label}</span>
                    </Link>
                  )}
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* User Profile Footer */}
      <div className="p-4 border-t border-slate-800 bg-slate-900/50">
        <div className="flex items-center gap-3 mb-4">
          <Avatar className="h-9 w-9 border border-slate-700">
            <AvatarImage src={user?.avatar} />
            <AvatarFallback className="bg-slate-800 text-slate-300">
              {user?.name?.charAt(0) || 'U'}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-white truncate">{user?.name}</p>
            <p className="text-xs text-slate-500 truncate capitalize">{user?.role}</p>
          </div>
        </div>
        <Button 
          variant="outline" 
          className="w-full justify-start text-slate-400 border-slate-700 hover:bg-slate-800 hover:text-white"
          onClick={logout}
        >
          <LogOut size={16} className="mr-2" />
          Log out
        </Button>
      </div>
    </div>
  );
};

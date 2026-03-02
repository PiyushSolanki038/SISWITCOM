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
  Mail,
  MessageCircle,
  ChevronDown,
  ChevronRight,
  Command,
  User,
  Settings,
  ArrowRight,
  Building,
  Activity
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { motion, AnimatePresence } from 'framer-motion';

interface NavItem {
  label: string;
  href: string;
  icon: React.ReactNode;
  children?: { label: string; href: string }[];
}

interface NavGroup {
  title?: string;
  items: NavItem[];
}

export const EmployeeSidebarContent: React.FC<{ onClose?: () => void }> = ({ onClose }) => {
  const { user } = useAuth();
  const location = useLocation();
  const [expandedItems, setExpandedItems] = React.useState<string[]>(['crm', 'cpq', 'clm', 'docs', 'sign', 'erp']);

  const navGroups: NavGroup[] = [
    {
      items: [
        {
          label: 'Dashboard',
          href: '/employee-dashboard',
          icon: <LayoutDashboard size={18} />,
        }
      ]
    },
    {
      title: 'Work',
      items: [
        {
          label: 'Customer Invite',
          href: '/employee-dashboard/invitations',
          icon: <Mail size={18} />,
        },
        {
          label: 'CRM',
          href: '/employee-dashboard/crm',
          icon: <Users size={18} />,
          children: [
            { label: 'Overview', href: '/employee-dashboard/crm' },
            { label: 'Leads', href: '/employee-dashboard/crm/leads' },
            { label: 'Contacts', href: '/employee-dashboard/crm/contacts' },
            { label: 'Accounts', href: '/employee-dashboard/crm/accounts' },
            { label: 'Opportunities', href: '/employee-dashboard/crm/opportunities' },
            { label: 'Activities', href: '/employee-dashboard/crm/activities' },
            { label: 'Notes + Timeline', href: '/employee-dashboard/crm/notes' },
          ],
        },
        {
          label: 'CPQ',
          href: '/employee-dashboard/cpq',
          icon: <ShoppingCart size={18} />,
          children: [
             { label: 'Quotes', href: '/employee-dashboard/cpq/quotes' },
             { label: 'Approvals', href: '/employee-dashboard/cpq/approvals' },
             { label: 'Products', href: '/employee-dashboard/cpq/products' },
          ]
        },
        {
          label: 'CLM',
          href: '/employee-dashboard/clm',
          icon: <FileCheck size={18} />,
          children: [
            { label: 'Contracts', href: '/employee-dashboard/clm/contracts' },
            { label: 'Templates', href: '/employee-dashboard/clm/templates' },
            { label: 'Signatures', href: '/employee-dashboard/clm/signatures' },
            { label: 'Renewals', href: '/employee-dashboard/clm/renewals' },
          ]
        },
        {
          label: 'Docs',
          href: '/employee-dashboard/docs',
          icon: <FolderOpen size={18} />,
        },
        {
          label: 'E-Sign',
          href: '/employee-dashboard/esign',
          icon: <PenTool size={18} />,
        },
        {
          label: 'ERP',
          href: '/employee-dashboard/erp',
          icon: <Building size={18} />,
          children: [
            { label: 'Orders', href: '/employee-dashboard/erp/orders' },
            { label: 'Invoices', href: '/employee-dashboard/erp/invoices' },
            { label: 'Payments', href: '/employee-dashboard/erp/payments' },
            { label: 'Fulfillment', href: '/employee-dashboard/erp/fulfillment' },
            { label: 'Inventory', href: '/employee-dashboard/erp/inventory' },
            { label: 'Revenue', href: '/employee-dashboard/erp/revenue' },
          ],
        },
        {
          label: 'Attendance',
          href: '/employee-dashboard/attendance',
          icon: <Activity size={18} />,
        },
      ]
    },
    {
      title: 'Account',
      items: [
        {
          label: 'Profile',
          href: '/employee-dashboard/profile',
          icon: <User size={18} />,
        },
        {
          label: 'Settings',
          href: '/employee-dashboard/settings',
          icon: <Settings size={18} />,
        }
      ]
    }
  ];

  const toggleExpand = (label: string) => {
    setExpandedItems((prev) =>
      prev.includes(label) ? prev.filter((item) => item !== label) : [...prev, label]
    );
  };

  const isActive = (path: string) => location.pathname === path;
  const isParentActive = (item: NavItem) =>
    item.children?.some((child) => location.pathname.startsWith(child.href)) ||
    location.pathname === item.href;

  return (
    <div className="flex flex-col h-full bg-white text-slate-900 border-r border-slate-200">
      <div className="p-6 pb-2">
        <Link 
          to="/employee-dashboard"
          onClick={onClose}
          className="flex items-center gap-3 mb-6 hover:opacity-80 transition-opacity"
        >
          <div className="h-8 w-8 rounded-lg bg-[#1A3C34] flex items-center justify-center shadow-lg shadow-[#1A3C34]/20">
            <Command className="h-4 w-4 text-white" />
          </div>
          <div>
            <h1 className="font-semibold text-lg tracking-tight text-slate-900 leading-none">Employee Portal</h1>
          </div>
        </Link>
      </div>

      <div className="flex-1 overflow-y-auto px-4 pb-4">
        <div className="mb-4 px-3 py-3 rounded-md border border-slate-200 bg-slate-50">
          <div className="text-xs font-semibold text-slate-600 mb-1">Invite Customers</div>
          <p className="text-xs text-slate-500 mb-2">Invite customers via Email or WhatsApp.</p>
          <div className="flex gap-2">
            <button
              onClick={() => {
                const base = typeof window !== 'undefined' ? window.location.origin : 'http://localhost:5173';
                const link = `${base}/signin`;
                const subject = encodeURIComponent('Invitation to SISWIT Customer Portal');
                const body = encodeURIComponent(
                  `Hello,\n\nYou are invited to access the SISWIT Customer Portal.\n\nSign in here: ${link}\n\nIf you do not have credentials yet, please reply to this email.`
                );
                window.open(`mailto:?subject=${subject}&body=${body}`, '_blank');
              }}
              className="flex items-center gap-1 px-2 py-1.5 rounded border border-slate-300 bg-white hover:bg-slate-100 text-xs"
              title="Invite via Email"
            >
              <Mail className="w-3.5 h-3.5" /> Email
            </button>
            <button
              onClick={() => {
                const base = typeof window !== 'undefined' ? window.location.origin : 'http://localhost:5173';
                const link = `${base}/signin`;
                const text = encodeURIComponent(
                  `You are invited to SISWIT Customer Portal.\nSign in: ${link}\nIf you need credentials, reply to this message.`
                );
                window.open(`https://wa.me/?text=${text}`, '_blank');
              }}
              className="flex items-center gap-1 px-2 py-1.5 rounded border border-slate-300 bg-white hover:bg-slate-100 text-xs"
              title="Invite via WhatsApp"
            >
              <MessageCircle className="w-3.5 h-3.5" /> WhatsApp
            </button>
          </div>
        </div>
        <nav className="space-y-6">
          {navGroups.map((group, groupIndex) => (
            <div key={groupIndex} className="space-y-0.5">
              {group.title && (
                <h3 className="px-3 mb-2 text-xs font-semibold text-slate-400 uppercase tracking-wider">
                  {group.title}
                </h3>
              )}
              
              {group.items.map((item) => (
                <div key={item.label} className="mb-1">
                  {item.children ? (
                    <>
                      <button
                        onClick={() => toggleExpand(item.label.toLowerCase())}
                        className={cn(
                          "flex w-full items-center justify-between rounded-md px-3 py-2 text-sm transition-all duration-200 group",
                          isParentActive(item) 
                            ? "text-slate-900 font-medium" 
                            : "text-slate-500 hover:text-slate-900 hover:bg-slate-100"
                        )}
                      >
                        <div className="flex items-center gap-3">
                          <div className={cn(
                            "transition-colors",
                            isParentActive(item) ? "text-[#1A3C34]" : "text-slate-500 group-hover:text-slate-700"
                          )}>
                            {item.icon}
                          </div>
                          <span>{item.label}</span>
                        </div>
                        {expandedItems.includes(item.label.toLowerCase()) ? (
                          <ChevronDown size={14} className="text-slate-500" />
                        ) : (
                          <ChevronRight size={14} className="text-slate-600" />
                        )}
                      </button>
                      <AnimatePresence>
                        {expandedItems.includes(item.label.toLowerCase()) && (
                          <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: 'auto', opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            transition={{ duration: 0.2 }}
                            className="overflow-hidden"
                          >
                            <div className="mt-0.5 space-y-0.5 ml-9 border-l border-slate-200 pl-2">
                              {item.children.map((child) => (
                                <Link
                                  key={child.href}
                                  to={child.href}
                                  onClick={onClose}
                                  className={cn(
                                    "flex items-center rounded-md px-3 py-2 text-[13px] transition-all duration-200",
                                    isActive(child.href)
                                      ? "bg-slate-100 text-slate-900 font-medium"
                                      : "text-slate-500 hover:bg-slate-50 hover:text-slate-900"
                                  )}
                                >
                                  {child.label}
                                </Link>
                              ))}
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </>
                  ) : (
                    <Link
                      to={item.href}
                      onClick={onClose}
                      className={cn(
                        "flex items-center gap-3 rounded-md px-3 py-2 text-sm transition-all duration-200 group",
                        isActive(item.href)
                          ? "bg-[#1A3C34]/10 text-[#1A3C34] font-medium"
                          : "text-slate-500 hover:text-slate-900 hover:bg-slate-100"
                      )}
                    >
                      <div className={cn(
                        "transition-colors",
                        isActive(item.href) ? "text-[#1A3C34]" : "text-slate-500 group-hover:text-slate-700"
                      )}>
                        {item.icon}
                      </div>
                      <span>{item.label}</span>
                    </Link>
                  )}
                </div>
              ))}
            </div>
          ))}
        </nav>
      </div>

      <div className="p-4 border-t border-slate-200">
        <Link 
          to="/"
          className="flex items-center gap-3 px-3 py-2 text-slate-500 hover:text-slate-900 hover:bg-slate-100 rounded-md transition-all duration-200"
        >
          <ArrowRight className="h-4 w-4" />
          <span className="text-sm font-medium">Back to Home</span>
        </Link>
      </div>
    </div>
  );
};

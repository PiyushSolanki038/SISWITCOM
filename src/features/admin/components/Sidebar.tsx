import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import {
  LayoutDashboard,
  Users,
  ShieldCheck,
  Settings,
  Database,
  Activity,
  FileText,
  Link as LinkIcon,
  Home,
  Briefcase,
  ShoppingCart,
  FileCheck,
  FolderOpen,
  PenTool,
  ChevronDown,
  ChevronRight,
  Command
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';

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

export const AdminSidebarContent: React.FC<{ onClose?: () => void }> = ({ onClose }) => {
  const { user } = useAuth();
  const location = useLocation();
  const [expandedItems, setExpandedItems] = React.useState<string[]>(['configuration']);

  const navGroups: NavGroup[] = [
    {
      items: [
        {
          label: 'Overview',
          href: '/admin-dashboard',
          icon: <LayoutDashboard size={18} />,
        },
        // removed Demo Guide
      ]
    },
    {
      title: 'User & Access',
      items: [
        {
          label: 'User Management',
          href: '/admin-dashboard/users',
          icon: <Users size={18} />,
        },
        {
          label: 'Roles & Permissions',
          href: '/admin-dashboard/roles',
          icon: <ShieldCheck size={18} />,
        }
      ]
    },
    {
      title: 'Operations',
      items: [
        // removed Data Management
        // removed Workflow Monitoring
        {
          label: 'Audit Logs',
          href: '/admin-dashboard/audit',
          icon: <FileText size={18} />,
        },
        // removed Integrations
        {
          label: 'System Settings',
          href: '/admin-dashboard/settings',
          icon: <Settings size={18} />,
        },
        {
          label: 'Health Check',
          href: '/admin-dashboard/health',
          icon: <Activity size={18} />,
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
    <div className="flex flex-col h-full bg-[#0F172A] text-slate-300 border-r border-slate-800">
      <div className="p-6 pb-2">
        <Link 
          to="/admin-dashboard"
          onClick={onClose}
          className="flex items-center gap-3 mb-6 hover:opacity-80 transition-opacity"
        >
          <div className="h-8 w-8 rounded-lg bg-emerald-600 flex items-center justify-center shadow-lg shadow-emerald-600/20">
            <Command className="h-4 w-4 text-white" />
          </div>
          <div>
            <h1 className="font-bold text-lg tracking-tight text-white leading-none">Admin Portal</h1>
            <p className="text-[10px] uppercase tracking-wider text-slate-500 font-semibold mt-1">System Operator</p>
          </div>
        </Link>
      </div>

      <div className="px-4 mb-4">
        <Link to="/">
          <Button variant="outline" className="w-full justify-start border-slate-700 bg-slate-900/50 text-slate-300 hover:bg-slate-800 hover:text-white">
            <Home className="mr-2 h-4 w-4" />
            Back to Home
          </Button>
        </Link>
      </div>

      <div className="flex-1 overflow-y-auto px-4 pb-4">
        <nav className="space-y-6">
          {navGroups.map((group, groupIndex) => (
            <div key={groupIndex} className="space-y-0.5">
              {group.title && (
                <h3 className="px-3 mb-2 text-xs font-bold text-slate-500 uppercase tracking-wider">
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
                            ? "text-white bg-slate-800/50 font-medium" 
                            : "text-slate-400 hover:text-white hover:bg-slate-800/30"
                        )}
                      >
                        <div className="flex items-center gap-3">
                          <div className={cn(
                            "transition-colors",
                            isParentActive(item) ? "text-emerald-400" : "text-slate-400 group-hover:text-slate-300"
                          )}>
                            {item.icon}
                          </div>
                          <span>{item.label}</span>
                        </div>
                        {expandedItems.includes(item.label.toLowerCase()) ? (
                          <ChevronDown size={14} className="text-slate-400" />
                        ) : (
                          <ChevronRight size={14} className="text-slate-500" />
                        )}
                      </button>
                      <AnimatePresence>
                        {expandedItems.includes(item.label.toLowerCase()) && (
                          <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: 'auto', opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            className="overflow-hidden"
                          >
                            <div className="pl-9 pr-2 py-1 space-y-1">
                              {item.children.map((child) => (
                                <Link
                                  key={child.href}
                                  to={child.href}
                                  onClick={onClose}
                                  className={cn(
                                    "block rounded-md px-3 py-2 text-sm transition-colors",
                                    isActive(child.href)
                                      ? "text-emerald-400 bg-emerald-500/10 font-medium"
                                      : "text-slate-400 hover:text-slate-300 hover:bg-slate-800/30"
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
                          ? "text-white bg-emerald-600 shadow-md shadow-emerald-900/20 font-medium"
                          : "text-slate-400 hover:text-white hover:bg-slate-800/30"
                      )}
                    >
                      <div className={cn(
                        "transition-colors",
                        isActive(item.href) ? "text-white" : "text-slate-400 group-hover:text-slate-300"
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

      <div className="p-4 border-t border-slate-800">
        <div className="flex items-center gap-3 px-2">
          <div className="h-8 w-8 rounded-full bg-emerald-900/50 flex items-center justify-center border border-emerald-700/30 text-emerald-400 font-medium text-xs">
            {user?.name?.substring(0, 2).toUpperCase() || 'AD'}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-slate-200 truncate">{user?.name || 'Admin User'}</p>
            <p className="text-xs text-slate-500 truncate">{user?.email || 'admin@company.com'}</p>
          </div>
        </div>
      </div>
    </div>
  );
};

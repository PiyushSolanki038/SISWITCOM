import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import {
  LayoutDashboard,
  FileText,
  FileCheck,
  FolderOpen,
  PenTool,
  User,
  HelpCircle,
  Command,
  LogOut,
  Home,
  CheckCircle2,
  Clock,
  Bell,
  Building2
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

interface NavItem {
  label: string;
  href: string;
  icon: React.ReactNode;
}

interface NavGroup {
  title?: string;
  items: NavItem[];
}

export const CustomerSidebarContent: React.FC<{ onClose?: () => void }> = ({ onClose }) => {
  const { user, logout } = useAuth();
  const location = useLocation();

  const navGroups: NavGroup[] = [
    {
      items: [
        {
          label: 'Dashboard',
          href: '/customer-dashboard',
          icon: <LayoutDashboard size={20} />,
        }
      ]
    },
    {
      title: 'Business',
      items: [
        {
          label: 'Quotes',
          href: '/customer-dashboard/quotes',
          icon: <FileText size={20} />,
        },
        {
          label: 'Contracts',
          href: '/customer-dashboard/contracts',
          icon: <FileCheck size={20} />,
        },
        {
          label: 'Documents',
          href: '/customer-dashboard/documents',
          icon: <FolderOpen size={20} />,
        },
        {
          label: 'Subscriptions',
          href: '/customer-dashboard/subscriptions',
          icon: <Clock size={20} />,
        },
      ]
    },
    {
      title: 'Actions',
      items: [
        {
          label: 'Sign Document',
          href: '/customer-dashboard/sign',
          icon: <PenTool size={20} />,
        },
      ]
    },
    {
      title: 'Account',
      items: [
        {
          label: 'Activity',
          href: '/customer-dashboard/activity',
          icon: <CheckCircle2 size={20} />,
        },
        {
          label: 'Notifications',
          href: '/customer-dashboard/notifications',
          icon: <Bell size={20} />,
        },
        {
          label: 'My Account',
          href: '/customer-dashboard/profile',
          icon: <User size={20} />,
        },
        {
          label: 'Support',
          href: '/customer-dashboard/support',
          icon: <HelpCircle size={20} />,
        },
      ]
    }
  ];

  return (
    <div className="flex flex-col h-full bg-slate-900 text-slate-300 border-r border-slate-800">
      {/* Brand Header */}
      <div className="p-6 flex items-center gap-3 border-b border-slate-800">
        <div className="h-8 w-8 rounded-lg bg-emerald-500 flex items-center justify-center">
          <Building2 className="h-5 w-5 text-white" />
        </div>
        <div>
          <h1 className="font-bold text-white text-lg tracking-tight">Customer Portal</h1>
          <p className="text-xs text-slate-500">Self-Service Suite</p>
        </div>
      </div>

      {/* Navigation */}
      <div className="flex-1 overflow-y-auto py-6 px-4 space-y-8">
        {navGroups.map((group, groupIndex) => (
          <div key={groupIndex}>
            {group.title && (
              <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-3 px-3">
                {group.title}
              </h3>
            )}
            <div className="space-y-1">
              {group.items.map((item) => {
                // Exact match for dashboard, partial for others
                const isActive = item.href === '/customer-dashboard' 
                  ? location.pathname === item.href 
                  : location.pathname.startsWith(item.href);

                return (
                  <Link
                    key={item.href}
                    to={item.href}
                    onClick={onClose}
                    className={cn(
                      "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200",
                      isActive 
                        ? "bg-emerald-500/10 text-emerald-400" 
                        : "hover:bg-slate-800 hover:text-white"
                    )}
                  >
                    <span className={cn(isActive ? "text-emerald-400" : "text-slate-400 group-hover:text-white")}>
                      {item.icon}
                    </span>
                    {item.label}
                    {isActive && (
                      <div className="ml-auto w-1.5 h-1.5 rounded-full bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.5)]" />
                    )}
                  </Link>
                );
              })}
            </div>
          </div>
        ))}
      </div>

      {/* Footer / User Profile */}
      <div className="p-4 border-t border-slate-800 bg-slate-900/50">
        <Link 
          to="/"
          className="flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium text-slate-400 hover:bg-slate-800 hover:text-white transition-colors mb-4"
        >
          <Home size={18} />
          Back to Home
        </Link>
        
        <div className="flex items-center gap-3 p-3 rounded-xl bg-slate-800/50 border border-slate-700/50">
          <Avatar className="h-9 w-9 border border-slate-600">
            <AvatarImage src={`https://ui-avatars.com/api/?name=${user?.name || 'Customer'}&background=10b981&color=fff`} />
            <AvatarFallback className="bg-emerald-600 text-white">
              {(user?.name || 'C').charAt(0)}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-white truncate">
              {user?.name || 'Valued Customer'}
            </p>
            <p className="text-xs text-slate-500 truncate">
              {user?.email || 'customer@example.com'}
            </p>
          </div>
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={() => logout()}
            className="h-8 w-8 text-slate-400 hover:text-white hover:bg-slate-700"
          >
            <LogOut size={16} />
          </Button>
        </div>
      </div>
    </div>
  );
};

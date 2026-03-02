import React from 'react';
import { Outlet, Link } from 'react-router-dom';
import Sidebar from './Sidebar';
import Header from './Header';
import { PageBreadcrumbs } from './PageBreadcrumbs';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import { motion } from 'framer-motion';

/**
 * DashboardLayout Component
 * 
 * Main layout for the authenticated dashboard area.
 * Includes the Sidebar, Header, Breadcrumbs, and the main content area (Outlet).
 */
const DashboardLayout: React.FC = () => {
  return (
    <div className="flex min-h-screen bg-slate-50/50 font-sans antialiased relative">
      <Sidebar />
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <Header variant="app" />
        <main className="flex-1 overflow-y-auto">
          <PageBreadcrumbs />
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default DashboardLayout;

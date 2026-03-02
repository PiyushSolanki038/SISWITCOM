import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import { OwnerSidebarContent } from '../components/Sidebar';
import { Sheet, SheetContent } from '@/components/ui/sheet';
import '../styles/owner-dashboard.css';
import NotificationBell from '@/components/common/NotificationBell';

const OwnerLayout: React.FC = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="od-root">
      <div className="od-grid-bg" />

      {/* Desktop sidebar */}
      <div className="od-desktop-sidebar">
        <OwnerSidebarContent />
      </div>

      {/* Mobile sidebar sheet */}
      <Sheet open={sidebarOpen} onOpenChange={setSidebarOpen}>
        <SheetContent side="left" className="p-0 w-[200px] border-none bg-transparent">
          <OwnerSidebarContent onClose={() => setSidebarOpen(false)} />
        </SheetContent>
      </Sheet>

      {/* Main area */}
      <main className="od-main">
        {/* Mobile header */}
        <div className="od-mobile-header">
          <button onClick={() => setSidebarOpen(true)}>
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M3 12h18M3 6h18M3 18h18" /></svg>
          </button>
          <span>SISWIT</span>
          <div>
            <NotificationBell />
          </div>
        </div>

        <Outlet />
      </main>
    </div>
  );
};

export default OwnerLayout;

import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import { AdminSidebarContent } from '../components/Sidebar';
import { Sheet, SheetContent } from '@/components/ui/sheet';
import { Menu } from 'lucide-react';
import { Button } from '@/components/ui/button';
import NotificationBell from '@/components/common/NotificationBell';
import ChatWidget from '@/components/common/ChatWidget';

const AdminLayout: React.FC = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="flex min-h-screen bg-slate-50 font-sans antialiased relative">
      {/* Desktop Sidebar */}
      <div className="hidden lg:block w-64 h-screen sticky top-0 z-30">
        <AdminSidebarContent />
      </div>

      {/* Mobile Sidebar */}
      <Sheet open={sidebarOpen} onOpenChange={setSidebarOpen}>
        <SheetContent side="left" className="p-0 w-64 border-r-slate-800 bg-[#0F172A]">
           <AdminSidebarContent onClose={() => setSidebarOpen(false)} />
        </SheetContent>
      </Sheet>

      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Mobile Header Toggle */}
        <div className="lg:hidden p-4 bg-white border-b flex items-center justify-between">
           <Button variant="ghost" size="icon" onClick={() => setSidebarOpen(true)}>
             <Menu className="h-6 w-6" />
           </Button>
           <span className="font-bold text-lg text-[#0F172A]">Admin Portal</span>
           <div className="w-6" /> {/* Spacer */}
        </div>
        {/* Desktop Topbar */}
        <div className="hidden lg:flex items-center justify-end gap-2 px-6 py-3 bg-white border-b">
          <NotificationBell />
          <ChatWidget />
        </div>

        <main className="flex-1 overflow-y-auto p-4 md:p-6 lg:p-8 bg-slate-50">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;

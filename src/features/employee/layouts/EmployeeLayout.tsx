import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import { EmployeeSidebarContent } from '../components/Sidebar';
import Header from '@/components/layout/Header';
import { Sheet, SheetContent } from '@/components/ui/sheet';
import { Menu } from 'lucide-react';
import { Button } from '@/components/ui/button';

const EmployeeLayout: React.FC = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="flex min-h-screen bg-slate-50/50 font-sans antialiased relative">
      {/* Desktop Sidebar */}
      <div className="hidden lg:block w-64 h-screen sticky top-0 z-30">
        <EmployeeSidebarContent />
      </div>

      {/* Mobile Sidebar */}
      <Sheet open={sidebarOpen} onOpenChange={setSidebarOpen}>
        <SheetContent side="left" className="p-0 w-64">
           <EmployeeSidebarContent onClose={() => setSidebarOpen(false)} />
        </SheetContent>
      </Sheet>

      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Mobile Header Toggle */}
        <div className="lg:hidden p-4 bg-white border-b flex items-center justify-between">
           <Button variant="ghost" size="icon" onClick={() => setSidebarOpen(true)}>
             <Menu className="h-6 w-6" />
           </Button>
           <span className="font-bold text-lg">Employee Portal</span>
           <div className="w-6" /> {/* Spacer */}
        </div>

        <div className="hidden lg:block">
           <Header variant="app" />
        </div>
        
        <main className="flex-1 overflow-y-auto p-4 md:p-6 lg:p-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default EmployeeLayout;

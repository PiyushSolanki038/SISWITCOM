import React from 'react';
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbPage, BreadcrumbSeparator } from '@/components/ui/breadcrumb';
import { Input } from '@/components/ui/input';
import { Search } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

type PageHeaderProps = {
  title: string;
  subtitle?: string;
  rightActions?: React.ReactNode;
};

const PageHeader: React.FC<PageHeaderProps> = ({ title, subtitle, rightActions }) => {
  return (
    <div className="sticky top-0 z-10 bg-white border-b border-black/10">
      <div className="px-6 py-3 flex items-center gap-4">
        <div className="flex items-center gap-4">
          <Breadcrumb>
            <BreadcrumbList>
              <BreadcrumbItem>
                <BreadcrumbLink className="text-[#64748B] hover:text-[#0F172A]" href="#">Workspace</BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator />
              <BreadcrumbItem>
                <BreadcrumbPage className="text-[#0F172A]">Owner Portal</BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>
        </div>
        <div className="flex-1 max-w-xl">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[#64748B]" />
            <Input className="pl-9 h-9 bg-white border-black/10 text-[#0F172A] placeholder:text-[#64748B] focus-visible:ring-1 focus-visible:ring-[#3B82F6]" placeholder="Search • Cmd + K" />
          </div>
        </div>
        <div className="flex items-center gap-3">
          {rightActions}
          <Button variant="ghost" size="icon" className="text-[#64748B] hover:bg-[#F1F5F9] hover:text-[#0F172A]">
            {/* Notification bell reserved slot; icon could be injected via rightActions */}
            <span className="sr-only">Actions</span>
          </Button>
          <Avatar>
            <AvatarImage src="" />
            <AvatarFallback>OP</AvatarFallback>
          </Avatar>
        </div>
      </div>
      <div className="px-6 py-4">
        <h1 className="text-xl font-semibold text-[#0F172A]">{title}</h1>
        {subtitle && <p className="text-sm text-[#64748B] mt-1">{subtitle}</p>}
      </div>
    </div>
  );
};

export default PageHeader;

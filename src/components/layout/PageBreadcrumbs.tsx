import React from 'react';
import { useLocation, Link } from 'react-router-dom';
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from '@/components/ui/breadcrumb';

export const PageBreadcrumbs: React.FC = () => {
  const location = useLocation();

  const getBreadcrumbs = () => {
    const paths = location.pathname.split('/').filter(Boolean);
    return paths.map((path, index) => {
      const href = `/${paths.slice(0, index + 1).join('/')}`;
      const label = path.charAt(0).toUpperCase() + path.slice(1);
      return { href, label };
    });
  };

  const breadcrumbs = getBreadcrumbs();

  if (breadcrumbs.length === 0) return null;

  return (
    <div className="hidden md:flex px-6 py-4 border-b border-slate-100 bg-white/50 backdrop-blur-sm sticky top-0 z-30">
      <Breadcrumb>
        <BreadcrumbList>
          {breadcrumbs.map((item, index) => (
            <React.Fragment key={item.href}>
              <BreadcrumbItem>
                {index === breadcrumbs.length - 1 ? (
                  <BreadcrumbPage className="font-medium text-slate-900">{item.label}</BreadcrumbPage>
                ) : (
                  <BreadcrumbLink asChild>
                    <Link to={item.href} className="text-slate-500 hover:text-slate-900 transition-colors">
                      {item.label}
                    </Link>
                  </BreadcrumbLink>
                )}
              </BreadcrumbItem>
              {index < breadcrumbs.length - 1 && <BreadcrumbSeparator className="text-slate-300" />}
            </React.Fragment>
          ))}
        </BreadcrumbList>
      </Breadcrumb>
    </div>
  );
};

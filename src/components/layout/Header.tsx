import React, { useState, useEffect } from 'react';
import { Link, useLocation, useSearchParams } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { Button } from '@/components/ui/button';
import { Menu, X, Bell, Search, Building2, ChevronRight, LayoutDashboard, ArrowRight } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from '@/components/ui/breadcrumb';
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { SidebarContent } from "./Sidebar";
import NotificationBell from "@/components/common/NotificationBell";
import ChatWidget from "@/components/common/ChatWidget";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

interface HeaderProps {
  variant?: 'marketing' | 'app';
}

/**
 * Header Component
 * 
 * Renders the top navigation header.
 * Supports 'marketing' variant (public site) and 'app' variant (dashboard).
 * 'app' variant includes mobile sidebar trigger and breadcrumbs (mobile).
 */
const Header: React.FC<HeaderProps> = ({ variant = 'marketing' }) => {
  const { user, isAuthenticated, logout } = useAuth();
  const location = useLocation();
  const [searchParams] = useSearchParams();
  const [mobileMenuOpen, setMobileMenuOpen] = React.useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [showDashboardPopup, setShowDashboardPopup] = useState(false);

  const dashboardPath = 
    (user?.role === 'customer' || user?.role === 'Customer') ? '/customer-dashboard' : 
    (user?.role === 'owner' || user?.role === 'Owner') ? '/owner-dashboard' :
    (user?.role === 'admin' || user?.role === 'Admin') ? '/admin-dashboard' :
    '/employee-dashboard';

  // Handle scroll effect
  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Check for login success to show popup
  useEffect(() => {
    if (isAuthenticated && variant === 'marketing') {
      const loginSuccess = searchParams.get('loginSuccess');
      if (loginSuccess === 'true') {
        setShowDashboardPopup(true);
        // Optional: Remove query param after showing
        // const newUrl = window.location.pathname;
        // window.history.replaceState({}, '', newUrl);
      }
    }
  }, [isAuthenticated, variant, searchParams]);

  const marketingLinks = [
    { href: '/', label: 'Home' },
    { href: '/solutions', label: 'Solutions' },
    { href: '/pricing', label: 'Pricing' },
    { href: '/about', label: 'About' },
    { href: '/blog', label: 'Blog' },
    { href: '/contact', label: 'Contact' },
  ];

  const isActive = (path: string) => location.pathname === path;

  // Simple breadcrumb logic
  const getBreadcrumbs = () => {
    const paths = location.pathname.split('/').filter(Boolean);
    return paths.map((path, index) => {
      const href = `/${paths.slice(0, index + 1).join('/')}`;
      const label = path.charAt(0).toUpperCase() + path.slice(1);
      return { href, label };
    });
  };

  if (variant === 'app') {
    const breadcrumbs = getBreadcrumbs();

    return (
      <header className="sticky top-0 z-40 flex h-16 items-center border-b border-slate-200/60 bg-white/80 backdrop-blur-md px-4 md:px-6 shadow-sm">
        <div className="flex flex-1 items-center justify-between">
          <div className="flex items-center gap-4">
            {/* Mobile Menu Trigger */}
            <Sheet>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon" className="md:hidden -ml-2 text-slate-500 hover:text-slate-900">
                  <Menu className="h-6 w-6" />
                </Button>
              </SheetTrigger>
              <SheetContent side="left" className="p-0 w-[260px] border-r-0 bg-white text-slate-900">
                <SidebarContent />
              </SheetContent>
            </Sheet>

            <Breadcrumb className="hidden md:flex">
              <BreadcrumbList>
                {breadcrumbs.map((item, index) => (
                  <React.Fragment key={item.href}>
                    <BreadcrumbItem>
                      {index === breadcrumbs.length - 1 ? (
                        <BreadcrumbPage className="font-semibold text-[#1A3C34]">{item.label}</BreadcrumbPage>
                      ) : (
                        <BreadcrumbLink asChild>
                           <Link to={item.href} className="text-slate-500 hover:text-[#1A3C34] transition-colors">{item.label}</Link>
                        </BreadcrumbLink>
                      )}
                    </BreadcrumbItem>
                    {index < breadcrumbs.length - 1 && <BreadcrumbSeparator className="text-slate-300" />}
                  </React.Fragment>
                ))}
              </BreadcrumbList>
            </Breadcrumb>
          </div>

          <div className="flex items-center gap-2 md:gap-4">
            <div className="relative hidden md:block w-64 lg:w-72">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
              <Input
                type="search"
                placeholder="Search..."
                className="pl-9 h-9 bg-slate-50 border-slate-200 focus:bg-white focus:border-[#1A3C34] focus:ring-1 focus:ring-[#1A3C34] transition-all rounded-full"
              />
            </div>
            
            <NotificationBell />
            <ChatWidget />
            
            <div className="h-8 w-8 rounded-full bg-gradient-to-br from-[#1A3C34] to-[#2C5F52] text-white flex items-center justify-center font-bold text-sm shadow-md shadow-[#1A3C34]/20 ring-2 ring-white">
               {user?.name?.[0] || 'U'}
            </div>
          </div>
        </div>
      </header>
    );
  }

  return (
    <>
      <motion.header 
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
          scrolled ? 'bg-white/80 backdrop-blur-md shadow-sm border-b border-slate-100 py-2' : 'bg-transparent py-4'
        }`}
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="container px-4 md:px-6 mx-auto">
          <div className="flex items-center justify-between h-14">
            {/* Logo */}
            <Link to="/" className="flex items-center gap-2 group">
              <div className="relative flex items-center justify-center w-8 h-8 rounded-lg bg-[#1A3C34] text-white overflow-hidden transition-transform group-hover:scale-105 duration-300 shadow-lg shadow-[#1A3C34]/20">
                 <Building2 className="h-5 w-5 relative z-10" />
                 <div className="absolute inset-0 bg-gradient-to-tr from-transparent to-white/10 opacity-0 group-hover:opacity-100 transition-opacity"></div>
              </div>
              <span className={`text-xl font-bold tracking-tight transition-colors duration-300 ${scrolled ? 'text-[#1A3C34]' : 'text-[#1A3C34]'}`}>
                Sirius<span className="text-[#EB5E4C]">Infra</span>
              </span>
            </Link>

            {/* Desktop Navigation */}
            <nav className="hidden md:flex items-center gap-1">
              <div className="bg-white/50 backdrop-blur-sm px-2 py-1.5 rounded-full border border-slate-200/50 shadow-sm flex items-center gap-1">
                {marketingLinks.map((link) => (
                  <Link
                    key={link.href}
                    to={link.href}
                    className={`relative px-4 py-1.5 text-sm font-medium rounded-full transition-all duration-300 ${
                      isActive(link.href) 
                        ? 'text-[#1A3C34] bg-slate-100' 
                        : 'text-slate-600 hover:text-[#1A3C34] hover:bg-slate-50'
                    }`}
                  >
                    {link.label}
                  </Link>
                ))}
              </div>
            </nav>

            {/* Actions */}
            <div className="hidden md:flex items-center gap-3">
              {isAuthenticated ? (
                <>
                  <Link to={dashboardPath}>
                    <Button variant="ghost" className="text-slate-600 hover:text-[#1A3C34] hover:bg-slate-50">
                      Dashboard
                    </Button>
                  </Link>
                  <Button variant="outline" onClick={logout} className="border-slate-200 text-slate-600 hover:text-[#1A3C34] hover:bg-slate-50">
                    Logout
                  </Button>
                </>
              ) : (
                <>
                  <Link to="/signin">
                    <Button variant="ghost" className="text-slate-600 hover:text-[#1A3C34] hover:bg-slate-50 font-medium">Sign In</Button>
                  </Link>
                  <Link to="/signup">
                    <Button className="bg-[#1A3C34] hover:bg-[#122a25] text-white rounded-full px-6 shadow-lg shadow-[#1A3C34]/20 transition-all duration-300 hover:-translate-y-0.5">
                      Get Started
                    </Button>
                  </Link>
                </>
              )}
            </div>

            {/* Mobile Menu Button */}
            <button
              className="md:hidden p-2 text-slate-600 hover:bg-slate-100 rounded-full transition-colors"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>

        {/* Mobile Navigation Overlay */}
        <AnimatePresence>
          {mobileMenuOpen && (
            <motion.div 
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.3 }}
              className="md:hidden bg-white border-t border-slate-100 shadow-xl overflow-hidden"
            >
              <div className="container px-4 py-6 space-y-4">
                <nav className="flex flex-col gap-2">
                  {marketingLinks.map((link) => (
                    <Link
                      key={link.href}
                      to={link.href}
                      className={`flex items-center justify-between p-3 rounded-xl transition-colors ${
                        isActive(link.href) 
                          ? 'bg-[#1A3C34]/5 text-[#1A3C34] font-semibold' 
                          : 'text-slate-600 hover:bg-slate-50'
                      }`}
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      {link.label}
                      {isActive(link.href) && <div className="w-1.5 h-1.5 rounded-full bg-[#1A3C34]" />}
                    </Link>
                  ))}
                </nav>
                
                <div className="pt-4 border-t border-slate-100 grid grid-cols-1 gap-3">
                   {isAuthenticated ? (
                    <>
                      <Link to={dashboardPath} onClick={() => setMobileMenuOpen(false)}>
                        <Button variant="ghost" className="w-full justify-start h-12 text-base">
                          <LayoutDashboard className="mr-2 h-4 w-4" /> Dashboard
                        </Button>
                      </Link>
                      <Button variant="outline" className="w-full justify-start h-12 text-base" onClick={() => { logout(); setMobileMenuOpen(false); }}>
                        Logout
                      </Button>
                    </>
                  ) : (
                    <>
                      <Link to="/signin" onClick={() => setMobileMenuOpen(false)}>
                        <Button variant="ghost" className="w-full h-12 text-base font-medium text-slate-600 hover:text-[#1A3C34] hover:bg-slate-50">Sign In</Button>
                      </Link>
                      <Link to="/signup" onClick={() => setMobileMenuOpen(false)}>
                        <Button className="w-full h-12 text-base bg-[#1A3C34] hover:bg-[#122a25] text-white shadow-lg shadow-[#1A3C34]/20">
                          Get Started Free
                          <ChevronRight className="ml-2 h-4 w-4" />
                        </Button>
                      </Link>
                    </>
                  )}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.header>

      {/* Persistent Dashboard Popup for Authenticated Users */}
      <AnimatePresence>
        {isAuthenticated && variant === 'marketing' && (
            <motion.div
                initial={{ opacity: 0, y: 50, scale: 0.9 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 50, scale: 0.9 }}
                className="fixed bottom-6 right-6 z-50"
            >
                <Popover open={showDashboardPopup} onOpenChange={setShowDashboardPopup}>
                    <PopoverTrigger asChild>
                         <Button 
                            className="h-14 px-6 rounded-full bg-[#1A3C34] hover:bg-[#122a25] text-white shadow-2xl shadow-[#1A3C34]/30 flex items-center gap-3 transition-transform hover:scale-105"
                            onClick={() => setShowDashboardPopup(!showDashboardPopup)}
                        >
                            <LayoutDashboard className="w-5 h-5" />
                            <span className="font-semibold text-base">Go to Dashboard</span>
                        </Button>
                    </PopoverTrigger>
                    <PopoverContent side="top" align="end" className="w-80 p-0 overflow-hidden border-0 shadow-2xl rounded-2xl mb-2">
                        <div className="bg-[#1A3C34] p-4 text-white">
                            <div className="flex items-center gap-2 mb-1">
                                <div className="p-1.5 bg-white/10 rounded-lg">
                                    <Building2 className="w-4 h-4" />
                                </div>
                                <span className="font-bold">Welcome back!</span>
                            </div>
                            <p className="text-white/80 text-sm">
                                You are currently logged in as <span className="font-semibold text-white">{user?.name}</span>.
                            </p>
                        </div>
                        <div className="p-4 bg-white">
                            <p className="text-slate-600 text-sm mb-4">
                                Ready to manage your business? Access your dashboard to view analytics, contracts, and more.
                            </p>
                            <Link to={dashboardPath} onClick={() => setShowDashboardPopup(false)}>
                                <Button className="w-full bg-[#1A3C34] hover:bg-[#122a25] text-white">
                                    Launch Dashboard <ArrowRight className="w-4 h-4 ml-2" />
                                </Button>
                            </Link>
                        </div>
                    </PopoverContent>
                </Popover>
            </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default Header;

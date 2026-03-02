import React from 'react';
import { Outlet, Link } from 'react-router-dom';
import Header from './Header';
import { Globe } from 'lucide-react';

/**
 * MarketingLayout Component
 * 
 * Layout for public-facing marketing pages (Home, Solutions, Pricing, etc.).
 * Includes the marketing Header (top nav) and a comprehensive Footer.
 * Renders page content via Outlet.
 */
const MarketingLayout: React.FC = () => {
  return (
    <div className="flex flex-col min-h-screen bg-background font-sans antialiased">
      <Header variant="marketing" />
      <main className="flex-1">
        <Outlet />
      </main>
      <footer className="bg-background border-t py-12">
        <div className="container px-4 mx-auto">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-12">
            <div className="col-span-2 md:col-span-1 space-y-4">
              <div className="flex items-center gap-2">
                <span className="text-xl font-bold tracking-tight">Sirius Infra</span>
              </div>
              <p className="text-sm text-muted-foreground">
                The modern operating system for B2B sales teams. Unified CRM, CPQ, CLM, and E-Sign.
              </p>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Product</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><Link to="/solutions" className="hover:text-foreground transition-colors">Solutions</Link></li>
                <li><Link to="/pricing" className="hover:text-foreground transition-colors">Pricing</Link></li>
                <li><Link to="#" className="hover:text-foreground transition-colors">Integrations</Link></li>
                <li><Link to="#" className="hover:text-foreground transition-colors">API Docs</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Company</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><Link to="/about" className="hover:text-foreground transition-colors">About</Link></li>
                <li><Link to="/blog" className="hover:text-foreground transition-colors">Blog</Link></li>
                <li><Link to="/careers" className="hover:text-foreground transition-colors">Careers</Link></li>
                <li><Link to="/contact" className="hover:text-foreground transition-colors">Contact</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Legal</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><Link to="#" className="hover:text-foreground transition-colors">Privacy Policy</Link></li>
                <li><Link to="#" className="hover:text-foreground transition-colors">Terms of Service</Link></li>
                <li><Link to="#" className="hover:text-foreground transition-colors">Security</Link></li>
                <li><Link to="#" className="hover:text-foreground transition-colors">Status</Link></li>
              </ul>
            </div>
          </div>
          <div className="border-t pt-8 flex flex-col md:flex-row justify-between items-center gap-4 text-sm text-muted-foreground">
            <p>© {new Date().getFullYear()} Sirius Infra. All rights reserved.</p>
            <div className="flex gap-4 items-center">
              <div className="flex items-center gap-2 hover:text-foreground cursor-pointer transition-colors">
                <Globe size={16} />
                <span>English (US)</span>
              </div>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default MarketingLayout;

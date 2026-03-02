import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter } from "react-router-dom";
import { AuthProvider } from "@/context/AuthContext";
import AppRoutes from "@/routes/AppRoutes";
import SubscriptionGuard from "@/components/subscription/SubscriptionGuard";
import "@/styles/header.css";
import "@/styles/marketing.css";

/**
 * App Component
 * 
 * The root component of the application.
 * It sets up the global providers (QueryClient, Tooltip, Auth, Toaster)
 * and initializes the router.
 */

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <AuthProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <SubscriptionGuard />
          <AppRoutes />
        </BrowserRouter>
      </AuthProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;

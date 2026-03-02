import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { canAccessModule } from '@/config/roles';

interface RoleGuardProps {
  module?: string;
  allowedRoles?: string[];
  children: React.ReactNode;
}

const RoleGuard: React.FC<RoleGuardProps> = ({ module, allowedRoles, children }) => {
  const { user } = useAuth();

  if (allowedRoles) {
    if (!user?.role || !allowedRoles.includes(user.role)) {
      return <Navigate to="/unauthorized" replace />;
    }
  }

  // Block dashboard access for customers without active subscription
  // RELAXED: Allow access to dashboard so they can pay invoices/sign contracts to ACTIVATE subscription.
  // if (user?.role === 'customer' && user.subscriptionStatus !== 'active') {
  //   return <Navigate to="/" replace />;
  // }

  if (module) {
    if (!canAccessModule(user?.role || null, module)) {
      return <Navigate to="/unauthorized" replace />;
    }
  }

  return <>{children}</>;
};

export default RoleGuard;

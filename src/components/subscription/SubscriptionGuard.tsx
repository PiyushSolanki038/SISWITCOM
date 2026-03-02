import React from 'react';
import { useAuth } from '@/context/AuthContext';
import { useLocation } from 'react-router-dom';
import PricingModal from './PricingModal';

const SubscriptionGuard: React.FC = () => {
  const { user } = useAuth();
  const location = useLocation();
  const [isDismissed, setIsDismissed] = React.useState(false);

  // Don't show popup on pricing page
  if (location.pathname === '/pricing') {
    return null;
  }

  // Only render PricingModal if user is customer and inactive
  // The logic is inside PricingModal too, but good to have a dedicated guard/wrapper
  if (user && user.role === 'customer' && user.subscriptionStatus !== 'active' && !isDismissed) {
    return <PricingModal onIgnore={() => setIsDismissed(true)} />;
  }

  return null;
};

export default SubscriptionGuard;

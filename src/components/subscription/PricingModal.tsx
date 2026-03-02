import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Check, Shield, Zap, Star } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { useToast } from '@/hooks/use-toast';

interface PricingModalProps {
  onIgnore?: () => void;
}

const PricingModal: React.FC<PricingModalProps> = ({ onIgnore }) => {
  const { user, updateSubscription } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleBypass = async () => {
    try {
      await updateSubscription('professional');
      toast({
        title: "Dev Bypass Activated",
        description: "You have been granted access to the dashboard.",
      });
      navigate('/customer-dashboard');
    } catch (error) {
      toast({
        title: "Bypass Failed",
        description: "Could not activate subscription.",
        variant: "destructive",
      });
    }
  };

  // Only show if user is customer and subscription is inactive
  if (!user || user.role !== 'customer' || user.subscriptionStatus === 'active') {
    return null;
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
      <div className="bg-white rounded-2xl w-full max-w-md overflow-hidden shadow-2xl p-8 text-center">
        <div className="mb-6">
          <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Shield className="w-8 h-8 text-blue-600" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Subscription Required</h2>
          <p className="text-gray-600">
            To access the customer dashboard and manage your account, please select a subscription plan.
          </p>
        </div>

        <Button 
          className="w-full py-6 text-base font-bold bg-[#1A3C34] hover:bg-[#152e28] text-white rounded-xl mb-4"
          onClick={() => navigate('/pricing')}
        >
          View Subscription Plans
        </Button>

        {onIgnore && (
          <div className="flex flex-col gap-2">
            <Button 
              variant="ghost" 
              onClick={onIgnore} 
              className="text-gray-400 hover:text-gray-600"
            >
              Ignore for now
            </Button>
            
            <Button 
              variant="ghost" 
              onClick={handleBypass} 
              className="text-amber-600 hover:text-amber-700 hover:bg-amber-50 text-xs"
            >
              ⚡ Bypass Payment (Dev Mode)
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};

export default PricingModal;

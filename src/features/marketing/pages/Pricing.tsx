import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth, SubscriptionPlan } from '@/context/AuthContext';
import { Button } from '@/components/ui/button';
import { Check, CheckCircle2, Globe, Zap, Users, TrendingUp, Database, Shield, LayoutDashboard } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { motion } from 'framer-motion';

import { createRazorpayOrder, verifyRazorpayPayment } from '@/services/payment';
import { useToast } from '@/components/ui/use-toast';

interface Plan {
  name: string;
  id: string;
  description: string;
  price: number;
  featured?: boolean;
  features: string[];
  notIncluded?: string[];
}

const Pricing: React.FC = () => {
  const { isAuthenticated, user, updateSubscription } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [isProcessing, setIsProcessing] = useState(false);

  const plans = [
    {
      name: 'Starter',
      id: 'starter',
      description: 'Perfect for small teams getting started with automation.',
      price: 49,
      features: [
        'Up to 5 users',
        'Basic CRM pipeline',
        'Standard reporting',
        'Email support',
        '1GB document storage',
      ],
      notIncluded: [
        'Advanced workflows',
        'CPQ & E-Sign',
        'API Access'
      ]
    },
    {
      name: 'Professional',
      id: 'professional',
      description: 'For growing businesses with advanced revenue needs.',
      price: 149,
      featured: true,
      features: [
        'Up to 25 users',
        'Full CRM & CPQ modules',
        'Advanced analytics & forecasting',
        'Priority email & chat support',
        '10GB document storage',
        'API access',
        'Custom quoting templates'
      ],
    },
    {
      name: 'Enterprise',
      id: 'enterprise',
      description: 'Full platform power for large organizations at scale.',
      price: 399,
      features: [
        'Unlimited users',
        'All modules (CRM, CPQ, CLM, E-Sign)',
        'Custom integrations & webhooks',
        '24/7 dedicated success manager',
        'Unlimited storage',
        'SSO & advanced security',
        'Audit logs & compliance'
      ],
    },
  ];

  const handleSelectPlan = async (plan: Plan) => {
    if (!isAuthenticated) {
      navigate('/signup');
      return;
    }

    if (!user) {
        toast({
            title: "Error",
            description: "User information not found. Please log in again.",
            variant: "destructive",
        });
        return;
    }

    setIsProcessing(true);
    try {
      // 1. Create Order
      const order = await createRazorpayOrder(plan.price);

      // 2. Initialize Razorpay
      const options = {
        key: import.meta.env.VITE_RAZORPAY_KEY_ID || "rzp_test_YOUR_KEY_ID", // Should use env variable
        amount: order.amount,
        currency: order.currency,
        name: "Sirius Infra",
        description: `Subscription for ${plan.name} Plan`,
        order_id: order.id,
        handler: async (response: any) => {
           try {
             // 3. Verify Payment
             await verifyRazorpayPayment({
               ...response,
               userId: user.id,
               planId: plan.id
             });
             
             // 4. Update Local State
             await updateSubscription(plan.id as SubscriptionPlan);
             
             toast({
               title: "Payment Successful",
               description: `Welcome to the ${plan.name} plan!`,
             });
             
             // 5. Redirect to Dashboard
             navigate('/customer-dashboard');
           } catch (err) {
             console.error(err);
             toast({ 
               title: "Verification Failed", 
               description: "Payment verification failed. Please contact support.",
               variant: "destructive" 
             });
           }
        },
        prefill: {
          name: user.name,
          email: user.email,
        },
        theme: {
          color: "#1A3C34",
        },
      };

      const rzp = new (window as any).Razorpay(options);
      rzp.open();
    } catch (error) {
      console.error('Payment initialization failed:', error);
      toast({
        title: "Payment Error",
        description: "Could not initiate payment. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-background overflow-hidden">
      {/* Hero Section */}
      <section className="relative pt-32 pb-20 overflow-hidden bg-[#F3F0EB]">
        {/* Abstract Background Elements */}
        <div className="absolute top-0 left-0 w-full h-full overflow-hidden z-0 pointer-events-none">
          <div className="absolute top-[-10%] right-[-5%] w-[600px] h-[600px] rounded-full bg-[#1A3C34]/5 blur-3xl"></div>
          <div className="absolute bottom-[-10%] left-[-10%] w-[500px] h-[500px] rounded-full bg-[#EB5E4C]/10 blur-3xl"></div>
        </div>

        <div className="container px-4 md:px-6 mx-auto relative z-10">
          <div className="text-center max-w-3xl mx-auto space-y-6">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              <Badge variant="outline" className="px-4 py-1.5 text-sm border-[#1A3C34]/20 bg-white text-[#1A3C34] rounded-full mb-6 shadow-sm">
                Simple Pricing
              </Badge>
              <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight text-[#1A3C34] mb-6 leading-tight">
                Transparent Plans for <br/><span className="text-[#EB5E4C]">Every Stage</span>
              </h1>
              <p className="text-xl text-slate-600 leading-relaxed max-w-2xl mx-auto">
                Choose the plan that fits your business stage. Scale as you grow. No hidden fees, ever.
              </p>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Social Proof */}
      <section className="py-10 border-b bg-white overflow-hidden">
        <div className="container px-4 mx-auto text-center">
          <p className="text-sm font-semibold text-slate-500 uppercase tracking-widest mb-8">
            Trusted by fast-growing teams
          </p>
          
          <div className="relative flex overflow-hidden mask-gradient">
            <style>{`
              .mask-gradient {
                mask-image: linear-gradient(to right, transparent, black 10%, black 90%, transparent);
                -webkit-mask-image: linear-gradient(to right, transparent, black 10%, black 90%, transparent);
              }
            `}</style>
            
            <motion.div 
              className="flex gap-20 items-center flex-nowrap whitespace-nowrap"
              animate={{ x: ["0%", "-50%"] }}
              transition={{ 
                duration: 40, 
                ease: "linear", 
                repeat: Infinity 
              }}
            >
              {[...Array(2)].map((_, i) => (
                <div key={i} className="flex gap-20 items-center opacity-60 grayscale hover:grayscale-0 transition-all duration-500">
                  {[
                    { name: 'Acme Corp', font: 'font-serif', icon: Globe },
                    { name: 'Global Tech', font: 'font-mono', icon: Zap },
                    { name: 'Nebula Inc', font: 'font-sans tracking-widest', icon: Users },
                    { name: 'FastScale', font: 'italic font-bold', icon: TrendingUp },
                    { name: 'Trio Systems', font: 'font-serif font-light', icon: Database },
                    { name: 'Vortex AI', font: 'font-mono tracking-tighter', icon: Shield },
                    { name: 'BrightPath', font: 'font-sans font-black', icon: CheckCircle2 },
                    { name: 'Quantum', font: 'font-serif italic', icon: LayoutDashboard }
                  ].map((company, index) => (
                    <div 
                      key={`${i}-${index}`} 
                      className="flex items-center gap-2 group cursor-pointer"
                    >
                      <company.icon className="h-5 w-5 text-[#1A3C34]" />
                      <span className={`text-xl font-bold text-slate-700 ${company.font}`}>
                        {company.name}
                      </span>
                    </div>
                  ))}
                </div>
              ))}
            </motion.div>
          </div>
        </div>
      </section>

      {/* Pricing Cards */}
      <div className="relative z-10 py-20 bg-white">
        <div className="container px-4 mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 lg:gap-12 max-w-7xl mx-auto items-start">
            {plans.map((plan, index) => (
              <motion.div
                key={plan.name}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1, duration: 0.5 }}
                className="h-full"
              >
                <div className={`h-full flex flex-col relative rounded-[2rem] transition-all duration-300 ${
                  plan.featured 
                    ? 'bg-[#1A3C34] text-white shadow-2xl shadow-[#1A3C34]/20 scale-105 z-10' 
                    : 'bg-white text-slate-900 border border-slate-200 hover:shadow-xl hover:border-[#1A3C34]/20'
                }`}>
                  {plan.featured && (
                    <div className="absolute -top-5 left-0 right-0 flex justify-center">
                      <Badge className="px-4 py-1.5 bg-[#EB5E4C] text-white text-sm font-semibold hover:bg-[#d94a38] border-none shadow-lg rounded-full">
                        Most Popular
                      </Badge>
                    </div>
                  )}
                  
                  <div className="p-8 border-b border-slate-100/10">
                    <h3 className={`text-2xl font-bold mb-2 ${plan.featured ? 'text-white' : 'text-[#1A3C34]'}`}>{plan.name}</h3>
                    <p className={`text-sm min-h-[40px] leading-relaxed ${plan.featured ? 'text-slate-300' : 'text-slate-500'}`}>
                      {plan.description}
                    </p>
                    <div className="flex items-baseline mt-6">
                      <span className="text-5xl font-extrabold tracking-tight">${plan.price}</span>
                      <span className={`ml-2 text-lg ${plan.featured ? 'text-slate-300' : 'text-slate-500'}`}>/month</span>
                    </div>
                  </div>

                  <div className="p-8 flex-grow">
                    <ul className="space-y-4">
                      {plan.features.map((feature, i) => (
                        <li key={i} className="flex items-start">
                          <div className={`mt-1 mr-3 rounded-full p-0.5 ${
                            plan.featured ? 'bg-[#EB5E4C] text-white' : 'bg-[#1A3C34]/10 text-[#1A3C34]'
                          }`}>
                            <Check className="w-3 h-3 stroke-[3]" />
                          </div>
                          <span className={`text-sm leading-tight ${plan.featured ? 'text-slate-200' : 'text-slate-600'}`}>
                            {feature}
                          </span>
                        </li>
                      ))}
                      {plan.notIncluded?.map((feature, i) => (
                        <li key={i} className="flex items-start opacity-50">
                          <div className="mt-1 mr-3 rounded-full p-0.5 bg-slate-100 text-slate-400">
                             <div className="w-3 h-3" />
                          </div>
                          <span className={`text-sm leading-tight line-through ${plan.featured ? 'text-slate-500' : 'text-slate-400'}`}>
                            {feature}
                          </span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div className="p-8 pt-0 mt-auto">
                    <Button 
                      className={`w-full py-6 text-base font-bold rounded-xl shadow-lg transition-all duration-300 ${
                        plan.featured 
                          ? 'bg-[#EB5E4C] hover:bg-[#d94a38] text-white hover:shadow-[#EB5E4C]/30' 
                          : 'bg-[#1A3C34] hover:bg-[#122a25] text-white hover:shadow-[#1A3C34]/20'
                      }`}
                      onClick={() => handleSelectPlan(plan)}
                      disabled={isProcessing}
                    >
                      {isProcessing ? 'Processing...' : 'Choose Plan'}
                    </Button>
                    <p className={`text-center text-xs mt-4 ${plan.featured ? 'text-slate-400' : 'text-slate-400'}`}>
                      No credit card required for trial
                    </p>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Pricing;
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Check, Shield, Zap, CreditCard, Star, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/context/AuthContext';
import { loadStripe } from '@stripe/stripe-js'; // Placeholder for Razorpay script

// Razorpay type definition
declare global {
  interface Window {
    Razorpay: any;
  }
}

const SelectPlan: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [loading, setLoading] = useState<string | null>(null);

  const plans = [
    {
      id: 'starter',
      name: 'Starter',
      price: 49,
      period: '/mo',
      description: 'Perfect for small teams getting started.',
      features: [
        '5 Users',
        'Basic CRM',
        'Email Support',
        '1GB Storage',
        'Basic Reports'
      ],
      popular: false
    },
    {
      id: 'professional',
      name: 'Professional',
      price: 149,
      period: '/mo',
      description: 'For growing businesses needing full power.',
      features: [
        '25 Users',
        'CRM + CPQ',
        'Priority Support',
        '10GB Storage',
        'Advanced Analytics',
        'Custom Workflows'
      ],
      popular: true
    },
    {
      id: 'enterprise',
      name: 'Enterprise',
      price: 'Custom',
      period: '',
      description: 'Unlimited scale for large organizations.',
      features: [
        'Unlimited Users',
        'Full Suite (All Modules)',
        '24/7 Dedicated Support',
        'Unlimited Storage',
        'Custom Integrations',
        'SLA Guarantee'
      ],
      popular: false
    }
  ];

  const handleSubscribe = async (planId: string) => {
    setLoading(planId);
    
    // Select price based on plan
    const selectedPlan = plans.find(p => p.id === planId);
    if (!selectedPlan) return;
    
    const priceAmount = typeof selectedPlan.price === 'number' ? selectedPlan.price : 0;

    if (planId === 'enterprise') {
        window.location.href = '/contact'; // Redirect to contact for enterprise
        return;
    }

    try {
      // 1. Create Order on Backend
      const orderResponse = await fetch('/api/payments/create-order', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
              amount: priceAmount,
              currency: "USD"
          })
      });
      
      const orderData = await orderResponse.json();
      
      if (!orderData.id) {
          throw new Error('Failed to create order');
      }

      const options = {
        key: "rzp_test_YOUR_KEY_ID", // Replace with env variable in real app
        amount: orderData.amount,
        currency: orderData.currency,
        name: "Sirius Infra",
        description: `${selectedPlan.name} Subscription`,
        order_id: orderData.id,
        handler: async function (response: any) {
          console.log("Payment Successful", response);
          
          try {
            // 2. Verify Payment on Backend
            const verifyResponse = await fetch('/api/payments/verify', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json'
              },
              body: JSON.stringify({
                razorpay_order_id: response.razorpay_order_id,
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_signature: response.razorpay_signature,
                userId: user?.id,
                planId: planId,
                amount: priceAmount
              })
            });
            
            const verifyData = await verifyResponse.json();

            if (verifyData.success) {
              navigate('/customer-dashboard');
            } else {
              alert('Payment verification failed. Please contact support.');
            }
          } catch (err) {
            console.error('Error verifying subscription:', err);
            alert('Error verifying subscription');
          }
        },
        prefill: {
          name: user?.name || "",
          email: user?.email || "",
          contact: ""
        },
        theme: {
          color: "#1A3C34"
        }
      };

      const rzp1 = new window.Razorpay(options);
      rzp1.on('payment.failed', function (response: any){
        alert(response.error.description);
      });
      rzp1.open();

    } catch (error) {
      console.error("Payment initiation failed", error);
      alert("Failed to initiate payment. Please try again.");
    } finally {
       setLoading(null);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-16">
          <h1 className="text-4xl font-extrabold text-[#1A3C34] sm:text-5xl sm:tracking-tight lg:text-6xl">
            Choose Your Plan
          </h1>
          <p className="mt-5 max-w-xl mx-auto text-xl text-slate-500">
            Start with a 14-day free trial. No credit card required for trial.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
          {plans.map((plan) => (
            <Card 
              key={plan.id} 
              className={`relative flex flex-col ${plan.popular ? 'border-[#1A3C34] shadow-xl scale-105 z-10' : 'border-slate-200 shadow-sm'}`}
            >
              {plan.popular && (
                <div className="absolute top-0 right-0 -mt-3 -mr-3">
                  <Badge className="bg-[#1A3C34] text-white px-3 py-1 text-xs uppercase tracking-wider">
                    Most Popular
                  </Badge>
                </div>
              )}
              <CardHeader>
                <CardTitle className="text-2xl font-bold text-[#1A3C34]">{plan.name}</CardTitle>
                <CardDescription className="mt-2 text-sm text-slate-500">{plan.description}</CardDescription>
              </CardHeader>
              <CardContent className="flex-1">
                <div className="mb-6">
                  <span className="text-4xl font-extrabold text-[#1A3C34]">
                    {typeof plan.price === 'number' ? `$${plan.price}` : plan.price}
                  </span>
                  {plan.period && <span className="text-base font-medium text-slate-500">{plan.period}</span>}
                </div>
                <ul className="space-y-4">
                  {plan.features.map((feature, index) => (
                    <li key={index} className="flex items-start">
                      <div className="flex-shrink-0">
                        <Check className="h-5 w-5 text-emerald-500" />
                      </div>
                      <p className="ml-3 text-sm text-slate-700">{feature}</p>
                    </li>
                  ))}
                </ul>
              </CardContent>
              <CardFooter>
                <Button 
                  className={`w-full ${plan.popular ? 'bg-[#1A3C34] hover:bg-[#122a25]' : 'bg-white text-[#1A3C34] border-2 border-[#1A3C34] hover:bg-slate-50'}`}
                  onClick={() => handleSubscribe(plan.id)}
                  disabled={loading !== null}
                >
                  {loading === plan.id ? 'Processing...' : (plan.id === 'enterprise' ? 'Contact Sales' : 'Get Started')}
                  {plan.id !== 'enterprise' && loading !== plan.id && <ArrowRight className="ml-2 h-4 w-4" />}
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>
        
        <div className="mt-12 text-center">
          <p className="text-slate-500 text-sm">
            All plans include 24/7 support and a 30-day money-back guarantee.
            <br />
            Need a custom solution? <a href="#" className="text-[#1A3C34] font-semibold underline">Contact us</a>
          </p>
        </div>
      </div>
    </div>
  );
};

export default SelectPlan;
